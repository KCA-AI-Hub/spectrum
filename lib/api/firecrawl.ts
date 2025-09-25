import Firecrawl from '@mendable/firecrawl-js';

// Firecrawl 클라이언트 인스턴스
let firecrawlClient: Firecrawl | null = null;

export function getFirecrawlClient(): Firecrawl {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not configured in environment variables');
    }

    firecrawlClient = new Firecrawl({ apiKey });
  }

  return firecrawlClient;
}

// 웹사이트 스크래핑
export async function scrapeUrl(url: string, options?: {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  waitFor?: number;
  timeout?: number;
}) {
  try {
    const client = getFirecrawlClient();

    const response = await client.scrape(url, {
      formats: options?.formats || ['markdown', 'html'],
      waitFor: options?.waitFor,
      timeout: options?.timeout || 30000,
    });

    return {
      success: true,
      data: response,
      error: null,
    };
  } catch (error) {
    console.error('Firecrawl scraping error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 웹사이트 크롤링 (다수 페이지)
export async function crawlWebsite(url: string, options?: {
  limit?: number;
  excludePaths?: string[];
  includePaths?: string[];
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
}) {
  try {
    const client = getFirecrawlClient();

    const response = await client.crawl(url, {
      limit: options?.limit || 10,
      excludePaths: options?.excludePaths,
      includePaths: options?.includePaths,
      scrapeOptions: {
        formats: options?.formats || ['markdown', 'html'],
      },
    });

    return {
      success: true,
      data: (response as any).data || response,
      jobId: (response as any).id || null,
      error: null,
    };
  } catch (error) {
    console.error('Firecrawl crawling error:', error);
    return {
      success: false,
      data: null,
      jobId: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 크롤링 작업 상태 확인
export async function getCrawlStatus(jobId: string) {
  try {
    const client = getFirecrawlClient();
    const response = await client.getCrawlStatus(jobId);

    return {
      success: true,
      status: (response as any).status,
      data: (response as any).data || response,
      error: null,
    };
  } catch (error) {
    console.error('Firecrawl status check error:', error);
    return {
      success: false,
      status: null,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 키워드 기반 뉴스 검색 (Phase 4.3) - Using map with search filter
export async function searchNews(keywords: string[], options?: {
  limit?: number;
  scrapeContent?: boolean;
  language?: string;
  region?: string;
}) {
  try {
    const client = getFirecrawlClient();
    const searchQuery = keywords.join(' ');

    console.log(`Searching for news with query: "${searchQuery}"`);

    // Use map method to find relevant news sites and then scrape them
    const newsUrls = [
      'https://news.google.com',
      'https://www.bbc.com/news',
      'https://edition.cnn.com',
      'https://www.reuters.com',
      'https://www.nytimes.com'
    ];

    const results = [];

    for (const baseUrl of newsUrls.slice(0, 2)) { // Limit to 2 sources for testing
      try {
        console.log(`Mapping URLs from: ${baseUrl}`);

        // Use map to find relevant URLs
        const mapResult = await client.map(baseUrl, {
          search: searchQuery,
          limit: Math.ceil((options?.limit || 10) / 2)
        });

        if (mapResult && (mapResult as any).links) {
          const links = (mapResult as any).links.slice(0, 3); // Limit links per source

          for (const link of links) {
            try {
              if (options?.scrapeContent) {
                console.log(`Scraping content from: ${link}`);
                const scrapeResult = await client.scrape(link, {
                  formats: ['markdown', 'html'],
                  onlyMainContent: true
                });

                if (scrapeResult) {
                  results.push({
                    url: link,
                    title: (scrapeResult as any).metadata?.title || 'Untitled',
                    content: (scrapeResult as any).markdown || (scrapeResult as any).html || '',
                    metadata: (scrapeResult as any).metadata || {},
                    source: baseUrl
                  });
                }
              } else {
                results.push({
                  url: link,
                  title: 'Link found',
                  content: '',
                  metadata: {},
                  source: baseUrl
                });
              }
            } catch (scrapeError) {
              console.error(`Error scraping ${link}:`, scrapeError);
            }
          }
        }
      } catch (mapError) {
        console.error(`Error mapping ${baseUrl}:`, mapError);
      }
    }

    return {
      success: true,
      data: results,
      searchQuery,
      error: null,
    };
  } catch (error) {
    console.error('Firecrawl search error:', error);
    return {
      success: false,
      data: null,
      searchQuery: keywords.join(' '),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 구조화된 데이터 추출 (Phase 4.3)
export async function extractStructuredData(url: string, schema: any) {
  try {
    const client = getFirecrawlClient();

    const response = await client.scrape(url, {
      formats: [
        {
          type: 'json',
          schema: schema,
        },
      ],
    });

    return {
      success: true,
      data: response,
      error: null,
    };
  } catch (error) {
    console.error('Firecrawl extraction error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 배치 스크래핑 (Phase 4.3)
export async function batchScrapeUrls(urls: string[], options?: {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links')[];
  onlyMainContent?: boolean;
  timeout?: number;
}) {
  try {
    const client = getFirecrawlClient();

    const scrapePromises = urls.map(async (url) => {
      try {
        const response = await client.scrape(url, {
          formats: options?.formats || ['markdown'],
          onlyMainContent: options?.onlyMainContent ?? true,
          timeout: options?.timeout || 30000,
        });

        return {
          url,
          success: true,
          data: response,
          error: null,
        };
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return {
          url,
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(scrapePromises);

    return {
      success: true,
      results: results.map((result) =>
        result.status === 'fulfilled' ? result.value : result.reason
      ),
      error: null,
    };
  } catch (error) {
    console.error('Batch scraping error:', error);
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}