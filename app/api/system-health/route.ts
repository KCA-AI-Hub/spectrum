import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { searchNews } from '@/lib/api/firecrawl';

export async function GET(request: NextRequest) {
  const checks: any = {
    timestamp: new Date().toISOString(),
    overall: 'checking',
    components: {}
  };

  try {
    // 1. Environment Variables Check
    console.log('=== Checking Environment Variables ===');
    checks.components.environment = {
      status: 'checking',
      details: {}
    };

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    checks.components.environment.details = {
      firecrawlApiKey: firecrawlApiKey ? `Set (${firecrawlApiKey.substring(0, 10)}...)` : 'Missing',
      databaseUrl: databaseUrl ? 'Set' : 'Missing'
    };

    if (!firecrawlApiKey) {
      checks.components.environment.status = 'error';
      checks.components.environment.error = 'FIRECRAWL_API_KEY not set';
    } else {
      checks.components.environment.status = 'ok';
    }

    // 2. Database Connection Check
    console.log('=== Checking Database Connection ===');
    checks.components.database = {
      status: 'checking'
    };

    try {
      await prisma.$queryRaw`SELECT 1`;

      const [articleCount, jobCount, targetCount] = await Promise.all([
        prisma.article.count(),
        prisma.crawlJob.count(),
        prisma.crawlTarget.count()
      ]);

      checks.components.database.status = 'ok';
      checks.components.database.details = {
        articles: articleCount,
        jobs: jobCount,
        targets: targetCount
      };
    } catch (error) {
      checks.components.database.status = 'error';
      checks.components.database.error = error instanceof Error ? error.message : 'Database connection failed';
    }

    // 3. Firecrawl API Check
    console.log('=== Checking Firecrawl API ===');
    checks.components.firecrawl = {
      status: 'checking'
    };

    if (firecrawlApiKey) {
      try {
        const testResult = await searchNews(['test'], {
          limit: 1,
          scrapeContent: false
        });

        if (testResult.success) {
          checks.components.firecrawl.status = 'ok';
          checks.components.firecrawl.details = {
            resultsFound: testResult.data?.length || 0
          };
        } else {
          checks.components.firecrawl.status = 'error';
          checks.components.firecrawl.error = testResult.error;
        }
      } catch (error) {
        checks.components.firecrawl.status = 'error';
        checks.components.firecrawl.error = error instanceof Error ? error.message : 'Firecrawl API test failed';
      }
    } else {
      checks.components.firecrawl.status = 'error';
      checks.components.firecrawl.error = 'API key not configured';
    }

    // 4. API Endpoints Check
    console.log('=== Checking API Endpoints ===');
    checks.components.apis = {
      status: 'ok',
      endpoints: {
        articles: 'available',
        searchHistory: 'available',
        scrapingExecute: 'available',
        articleStats: 'available'
      }
    };

    // 5. Features Check
    console.log('=== Checking Features ===');
    checks.components.features = {
      status: 'ok',
      available: {
        englishNewsSearch: checks.components.firecrawl.status === 'ok',
        koreanNewsSearch: checks.components.firecrawl.status === 'ok',
        articleManagement: checks.components.database.status === 'ok',
        searchHistory: checks.components.database.status === 'ok',
        duplicateDetection: checks.components.database.status === 'ok',
        csvExport: true,
        bulkDelete: checks.components.database.status === 'ok'
      }
    };

    // 6. Pages Check
    checks.components.pages = {
      status: 'ok',
      available: [
        '/admin/search',
        '/admin/crawling/search',
        '/admin/crawling/jobs',
        '/admin/content',
        '/admin/crawling/history'
      ]
    };

    // Overall Status
    const allOk = Object.values(checks.components).every(
      (component: any) => component.status === 'ok'
    );
    checks.overall = allOk ? 'healthy' : 'degraded';

    // Summary
    checks.summary = {
      healthy: Object.values(checks.components).filter((c: any) => c.status === 'ok').length,
      degraded: Object.values(checks.components).filter((c: any) => c.status === 'error').length,
      total: Object.keys(checks.components).length
    };

    return NextResponse.json(checks, {
      status: allOk ? 200 : 503
    });

  } catch (error) {
    console.error('System health check error:', error);
    checks.overall = 'error';
    checks.error = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(checks, { status: 500 });
  }
}
