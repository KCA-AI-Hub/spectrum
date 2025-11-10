import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Database Reset Started ===');

    // Delete all articles
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`Deleted ${deletedArticles.count} articles`);

    // Delete all crawl jobs
    const deletedJobs = await prisma.crawlJob.deleteMany({});
    console.log(`Deleted ${deletedJobs.count} crawl jobs`);

    // Delete test crawl targets
    const deletedTargets = await prisma.crawlTarget.deleteMany({
      where: {
        OR: [
          { url: 'test-search' },
          { url: 'firecrawl-search' }
        ]
      }
    });
    console.log(`Deleted ${deletedTargets.count} test targets`);

    // Delete search history
    const deletedHistory = await prisma.searchHistory.deleteMany({});
    console.log(`Deleted ${deletedHistory.count} search history records`);

    // Delete system configs (stats)
    const deletedConfigs = await prisma.systemConfig.deleteMany({
      where: {
        key: {
          startsWith: 'crawl_stats_'
        }
      }
    });
    console.log(`Deleted ${deletedConfigs.count} system config records`);

    return NextResponse.json({
      success: true,
      message: 'Database reset completed',
      deleted: {
        articles: deletedArticles.count,
        jobs: deletedJobs.count,
        targets: deletedTargets.count,
        history: deletedHistory.count,
        configs: deletedConfigs.count
      }
    });

  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
