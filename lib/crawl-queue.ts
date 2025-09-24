import { PrismaClient } from '@/lib/generated/prisma'
import Firecrawl from '@mendable/firecrawl-js'
import { searchNews, batchScrapeUrls } from '@/lib/api/firecrawl'
import {
  processContentForStorage,
  calculateContentSimilarity,
  calculateRelevanceScore,
  cleanHtmlText
} from '@/lib/utils/content-processing'

const prisma = new PrismaClient()

export interface CrawlTaskOptions {
  keywords: string[]
  dateRange?: { from: Date; to: Date }
  sources?: string[]
  category?: string
  limit?: number
  retryCount?: number
  priority?: 'low' | 'medium' | 'high'
}

export interface CrawlTask {
  id: string
  searchHistoryId: string
  options: CrawlTaskOptions
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  retryCount: number
  maxRetries: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
}

class CrawlQueue {
  private static instance: CrawlQueue
  private queue: CrawlTask[] = []
  private processing = false
  private firecrawl: Firecrawl

  private constructor() {
    this.firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY!
    })
  }

  static getInstance(): CrawlQueue {
    if (!CrawlQueue.instance) {
      CrawlQueue.instance = new CrawlQueue()
    }
    return CrawlQueue.instance
  }

  // 크롤링 작업 추가
  async addTask(searchHistoryId: string, options: CrawlTaskOptions): Promise<string> {
    const task: CrawlTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      searchHistoryId,
      options,
      status: 'PENDING',
      retryCount: 0,
      maxRetries: options.retryCount || 3,
      createdAt: new Date()
    }

    this.queue.push(task)
    this.sortQueue()

    // 처리 시작 (이미 처리 중이 아닌 경우)
    if (!this.processing) {
      this.processQueue()
    }

    return task.id
  }

  // 우선순위에 따른 큐 정렬
  private sortQueue() {
    const priorityOrder = { high: 3, medium: 2, low: 1 }

    this.queue.sort((a, b) => {
      const aPriority = priorityOrder[a.options.priority || 'medium']
      const bPriority = priorityOrder[b.options.priority || 'medium']

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // 같은 우선순위면 생성 시간순
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }

  // 큐 처리
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      await this.processTask(task)
    }

    this.processing = false
  }

  // 개별 작업 처리
  private async processTask(task: CrawlTask) {
    try {
      task.status = 'PROCESSING'
      task.startedAt = new Date()

      // 검색 기록 상태 업데이트
      await prisma.searchHistory.update({
        where: { id: task.searchHistoryId },
        data: { status: 'IN_PROGRESS' }
      })

      console.log(`Processing crawl task ${task.id} for keywords: ${task.options.keywords.join(', ')}`)

      const searchResults: any[] = []
      const { keywords, limit = 50 } = task.options

      // 각 키워드에 대해 크롤링 수행
      for (const keyword of keywords) {
        try {
          await this.crawlKeyword(keyword, task, searchResults)
        } catch (keywordError) {
          console.error(`Error crawling keyword ${keyword}:`, keywordError)
          // 키워드별 오류는 전체 작업 실패로 이어지지 않음
        }
      }

      // 작업 완료 처리
      task.status = 'COMPLETED'
      task.completedAt = new Date()

      await prisma.searchHistory.update({
        where: { id: task.searchHistoryId },
        data: {
          status: 'COMPLETED',
          resultCount: searchResults.length,
          searchTime: (task.completedAt.getTime() - task.startedAt!.getTime()) / 1000
        }
      })

      console.log(`Crawl task ${task.id} completed successfully. Found ${searchResults.length} results.`)

    } catch (error) {
      await this.handleTaskError(task, error)
    }
  }

  // 키워드별 크롤링 (Phase 4.3 enhanced)
  private async crawlKeyword(keyword: string, task: CrawlTask, searchResults: any[]) {
    console.log(`Starting enhanced crawl for keyword: ${keyword}`);

    // Use Firecrawl search API instead of crawling Naver directly
    const searchResult = await searchNews([keyword], {
      limit: Math.ceil((task.options.limit || 50) / task.options.keywords.length),
      scrapeContent: true
    });

    if (!searchResult.success || !searchResult.data) {
      console.error(`Search failed for keyword ${keyword}:`, searchResult.error);
      return;
    }

    const searchData = Array.isArray(searchResult.data) ? searchResult.data : [searchResult.data];
    console.log(`Found ${searchData.length} search results for keyword: ${keyword}`);

    // Process search results
    for (const item of searchData) {
      if (!item.url) continue;

      try {
        // Check for duplicates before processing
        const isDuplicate = await this.checkForDuplicates(item, searchResults);
        if (isDuplicate) {
          console.log(`Skipping duplicate article: ${item.url}`);
          continue;
        }

        const article = await this.saveEnhancedArticle(item, keyword, task);
        if (article) {
          // Create search result connection
          await prisma.searchResult.create({
            data: {
              searchHistoryId: task.searchHistoryId,
              articleId: article.id,
              relevanceScore: article.relevanceScore || 0,
              searchRank: searchResults.length + 1
            }
          });

          searchResults.push(article);
          console.log(`Successfully saved article: ${article.title}`);
        }
      } catch (articleError) {
        console.error(`Error processing article ${item.url}:`, articleError);
      }
    }
  }

  // Enhanced article saving with Phase 4.3 features
  private async saveEnhancedArticle(item: any, keyword: string, task: CrawlTask) {
    // Check if article already exists
    const existingArticle = await prisma.article.findUnique({
      where: { url: item.url }
    });

    if (existingArticle) {
      // Update existing article with new keywords and recalculated relevance
      const updatedKeywordTags = this.updateKeywordTags(
        existingArticle.keywordTags,
        task.options.keywords
      );

      const enhancedRelevanceScore = calculateRelevanceScore(
        existingArticle.content,
        existingArticle.title,
        task.options.keywords,
        existingArticle.url
      );

      return await prisma.article.update({
        where: { id: existingArticle.id },
        data: {
          keywordTags: updatedKeywordTags,
          relevanceScore: enhancedRelevanceScore
        }
      });
    }

    // Process content with Phase 4.3 enhancements
    const rawContent = item.markdown || item.content || '';
    const processedContent = processContentForStorage(rawContent, item.metadata, task.options.keywords);

    // Create crawl job record
    const crawlJob = await prisma.crawlJob.create({
      data: {
        target: {
          connectOrCreate: {
            where: { url: 'firecrawl-search' },
            create: {
              name: 'Firecrawl Search API',
              url: 'firecrawl-search',
              isActive: true
            }
          }
        },
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        totalItems: 1,
        processedItems: 1
      }
    });

    // Calculate enhanced relevance score
    const relevanceScore = calculateRelevanceScore(
      processedContent.cleanText,
      processedContent.title,
      task.options.keywords,
      item.url
    );

    // Extract metadata with fallbacks
    const title = processedContent.title || item.metadata?.title || item.title || 'Untitled';
    const publishedAt = this.parsePublishDate(item.metadata?.publishDate || item.publishedAt);
    const imageUrl = item.metadata?.image || item.metadata?.ogImage || item.imageUrl;
    const author = item.metadata?.author || item.author;

    // Create new article with enhanced data
    return await prisma.article.create({
      data: {
        crawlJobId: crawlJob.id,
        title: title,
        content: processedContent.cleanText,
        url: item.url,
        author: author,
        publishedAt: publishedAt,
        imageUrl: imageUrl,
        keywordTags: [...new Set([...task.options.keywords, ...processedContent.keywords])].join(','),
        relevanceScore: relevanceScore,
        searchRank: 1
      }
    });
  }

  // Check for duplicate content (Phase 4.3)
  private async checkForDuplicates(newItem: any, existingResults: any[]): Promise<boolean> {
    const newContent = newItem.markdown || newItem.content || '';
    const newTitle = newItem.metadata?.title || newItem.title || '';

    // Check against existing results in current batch
    for (const existing of existingResults) {
      const similarity = calculateContentSimilarity(newContent, existing.content);
      if (similarity.isSimilar) {
        console.log(`Duplicate detected: ${similarity.reason} (score: ${similarity.score})`);
        return true;
      }
    }

    // Check against database (recent articles with similar titles)
    if (newTitle) {
      const recentArticles = await prisma.article.findMany({
        where: {
          title: {
            contains: newTitle.substring(0, 50) // Check first 50 characters
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Within last 7 days
          }
        },
        take: 10
      });

      for (const article of recentArticles) {
        const similarity = calculateContentSimilarity(newContent, article.content);
        if (similarity.isSimilar) {
          console.log(`Database duplicate found: ${article.title} (${similarity.reason})`);
          return true;
        }
      }
    }

    return false;
  }

  // Parse publish date with multiple format support (Phase 4.3)
  private parsePublishDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
      // Try ISO format first
      const isoDate = new Date(dateString);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }

      // Try common date formats
      const formats = [
        /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
        /^(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
        /^(\d{2})-(\d{2})-(\d{4})/, // MM-DD-YYYY
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          const parsedDate = new Date(dateString);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to parse date: ${dateString}`, error);
    }

    return null;
  }

  // 작업 오류 처리
  private async handleTaskError(task: CrawlTask, error: any) {
    task.retryCount++
    task.errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (task.retryCount <= task.maxRetries) {
      // 재시도
      console.log(`Retrying crawl task ${task.id} (attempt ${task.retryCount}/${task.maxRetries})`)
      task.status = 'PENDING'

      // 지수 백오프로 지연
      const delay = Math.min(1000 * Math.pow(2, task.retryCount - 1), 30000)
      setTimeout(() => {
        this.queue.unshift(task) // 우선순위로 큐 앞에 추가
        this.sortQueue()
      }, delay)
    } else {
      // 최대 재시도 횟수 초과
      task.status = 'FAILED'
      task.completedAt = new Date()

      await prisma.searchHistory.update({
        where: { id: task.searchHistoryId },
        data: {
          status: 'FAILED',
          errorMessage: task.errorMessage
        }
      })

      console.error(`Crawl task ${task.id} failed permanently:`, task.errorMessage)
    }
  }

  // 작업 상태 조회
  getTaskStatus(taskId: string): CrawlTask | undefined {
    return this.queue.find(task => task.id === taskId)
  }

  // 큐 상태 조회
  getQueueStatus() {
    return {
      pending: this.queue.filter(t => t.status === 'PENDING').length,
      processing: this.queue.filter(t => t.status === 'PROCESSING').length,
      completed: this.queue.filter(t => t.status === 'COMPLETED').length,
      failed: this.queue.filter(t => t.status === 'FAILED').length,
      isProcessing: this.processing
    }
  }

  // Enhanced utility functions (Phase 4.3)
  private extractTitleFromMarkdown(markdown: string): string {
    return processContentForStorage(markdown).title;
  }

  private updateKeywordTags(existingTags: string | null, newKeywords: string[]): string {
    const existing = existingTags ? existingTags.split(',').map(t => t.trim()).filter(t => t) : [];
    const combined = [...new Set([...existing, ...newKeywords])];
    return combined.join(',');
  }

  // Enhanced queue statistics (Phase 4.3)
  async getDetailedQueueStatus() {
    const queueStatus = this.getQueueStatus();

    // Get recent crawling statistics from database
    const recentStats = await prisma.searchHistory.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: {
        id: true
      }
    });

    const avgSearchTime = await prisma.searchHistory.aggregate({
      where: {
        status: 'COMPLETED',
        searchTime: {
          not: null
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _avg: {
        searchTime: true
      }
    });

    return {
      ...queueStatus,
      recentStats: recentStats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      averageSearchTime: avgSearchTime._avg.searchTime || 0,
      timestamp: new Date().toISOString()
    };
  }

  // Clean up old completed tasks (Phase 4.3)
  cleanupCompletedTasks(maxAge: number = 24 * 60 * 60 * 1000) {
    const cutoff = new Date(Date.now() - maxAge);
    this.queue = this.queue.filter(task =>
      task.status !== 'COMPLETED' ||
      !task.completedAt ||
      task.completedAt > cutoff
    );
  }

  // Get task performance metrics (Phase 4.3)
  getTaskMetrics() {
    const completedTasks = this.queue.filter(t => t.status === 'COMPLETED' && t.startedAt && t.completedAt);

    if (completedTasks.length === 0) {
      return {
        totalCompleted: 0,
        averageDuration: 0,
        successRate: 0,
        totalProcessed: 0
      };
    }

    const totalTasks = this.queue.length;
    const durations = completedTasks.map(t =>
      t.completedAt!.getTime() - t.startedAt!.getTime()
    );
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const successRate = completedTasks.length / totalTasks;

    return {
      totalCompleted: completedTasks.length,
      averageDuration: Math.round(averageDuration / 1000), // in seconds
      successRate: Math.round(successRate * 100), // as percentage
      totalProcessed: totalTasks
    };
  }
}

export default CrawlQueue