import { NextRequest, NextResponse } from 'next/server';
import { ScrapingOrchestratorService } from '@/lib/services/scraping-orchestrator';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Korean Search Test Started ===');

    // Clean up old test data
    await prisma.article.deleteMany({
      where: {
        crawlJob: {
          target: {
            url: 'test-korean-search'
          }
        }
      }
    });
    await prisma.crawlJob.deleteMany({
      where: {
        target: {
          url: 'test-korean-search'
        }
      }
    });

    // Create target and job
    const target = await prisma.crawlTarget.upsert({
      where: { url: 'test-korean-search' },
      update: {},
      create: {
        name: 'Korean Search Test',
        url: 'test-korean-search',
        type: 'news',
        category: 'Test',
        isActive: true
      }
    });

    const job = await prisma.crawlJob.create({
      data: {
        targetId: target.id,
        status: 'PENDING'
      }
    });

    console.log('Created job:', job.id);

    // Execute scraping with Korean keywords
    const orchestrator = new ScrapingOrchestratorService(prisma);

    const result = await orchestrator.executeScrapingJob({
      crawlJobId: job.id,
      keywords: ['인공지능', 'AI'],  // Korean keywords
      options: {
        maxArticles: 10,
        relevanceThreshold: 0,
        enableAutoBackup: false,
        batchSize: 10
      }
    });

    console.log('Scraping result:', {
      status: result.status,
      stats: result.statistics
    });

    // Query saved articles
    const articles = await prisma.article.findMany({
      where: { crawlJobId: job.id },
      select: {
        id: true,
        title: true,
        url: true,
        relevanceScore: true,
        status: true,
        keywordTags: true,
        content: true
      }
    });

    console.log(`Found ${articles.length} Korean articles in database`);

    return NextResponse.json({
      success: true,
      message: 'Korean search test completed',
      jobId: job.id,
      scrapingResult: {
        status: result.status,
        statistics: result.statistics,
        errors: result.errors,
        warnings: result.warnings
      },
      savedArticles: {
        count: articles.length,
        samples: articles.slice(0, 3).map(a => ({
          id: a.id,
          title: a.title,
          url: a.url,
          relevanceScore: a.relevanceScore,
          status: a.status,
          keywords: a.keywordTags,
          contentPreview: a.content?.substring(0, 100) + '...'
        }))
      }
    });

  } catch (error) {
    console.error('Korean search test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
