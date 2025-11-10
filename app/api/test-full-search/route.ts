import { NextRequest, NextResponse } from 'next/server';
import { ScrapingOrchestratorService } from '@/lib/services/scraping-orchestrator';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Full Search Test Started ===');

    // Step 0: Clean up old test data
    console.log('Cleaning up old test data...');
    await prisma.article.deleteMany({
      where: {
        crawlJob: {
          target: {
            url: 'test-search'
          }
        }
      }
    });
    await prisma.crawlJob.deleteMany({
      where: {
        target: {
          url: 'test-search'
        }
      }
    });
    console.log('Old test data cleaned up');

    // Step 1: Create a test crawl target and job
    console.log('Creating test crawl target and job...');

    const target = await prisma.crawlTarget.upsert({
      where: { url: 'test-search' },
      update: {},
      create: {
        name: 'Test Search',
        url: 'test-search',
        type: 'news',
        category: 'Test',
        description: 'Test search target',
        isActive: true
      }
    });

    const job = await prisma.crawlJob.create({
      data: {
        targetId: target.id,
        status: 'PENDING'
      }
    });

    console.log('Created crawl job:', job.id);

    // Step 2: Execute scraping
    console.log('Starting scraping with orchestrator...');
    const orchestrator = new ScrapingOrchestratorService(prisma);

    const result = await orchestrator.executeScrapingJob({
      crawlJobId: job.id,
      keywords: ['AI'],
      options: {
        maxArticles: 5,
        relevanceThreshold: 0, // Set to 0 to accept all articles for testing
        enableAutoBackup: false,
        batchSize: 5
      }
    });

    console.log('Scraping result:', {
      status: result.status,
      stats: result.statistics
    });

    // Step 3: Query saved articles
    console.log('Querying saved articles...');
    const articles = await prisma.article.findMany({
      where: { crawlJobId: job.id },
      select: {
        id: true,
        title: true,
        url: true,
        relevanceScore: true,
        status: true,
        keywordTags: true
      }
    });

    console.log(`Found ${articles.length} articles in database`);

    return NextResponse.json({
      success: true,
      message: 'Full search test completed',
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
          keywords: a.keywordTags
        }))
      }
    });

  } catch (error) {
    console.error('Full search test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
