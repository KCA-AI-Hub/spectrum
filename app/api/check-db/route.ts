import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Database Check Started ===');

    // Count all records
    const [articleCount, jobCount, targetCount, historyCount] = await Promise.all([
      prisma.article.count(),
      prisma.crawlJob.count(),
      prisma.crawlTarget.count(),
      prisma.searchHistory.count()
    ]);

    // Get some sample articles
    const sampleArticles = await prisma.article.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        title: true,
        createdAt: true,
        crawlJob: {
          select: {
            id: true,
            target: {
              select: {
                url: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Get unique URLs
    const allArticles = await prisma.article.findMany({
      select: { url: true }
    });
    const uniqueUrls = new Set(allArticles.map(a => a.url));
    const duplicateUrls = allArticles.length - uniqueUrls.size;

    return NextResponse.json({
      success: true,
      counts: {
        articles: articleCount,
        jobs: jobCount,
        targets: targetCount,
        history: historyCount,
        uniqueUrls: uniqueUrls.size,
        duplicateUrls: duplicateUrls
      },
      sampleArticles: sampleArticles.map(a => ({
        id: a.id,
        url: a.url,
        title: a.title?.substring(0, 50) || 'No title',
        createdAt: a.createdAt,
        targetUrl: a.crawlJob.target.url,
        targetName: a.crawlJob.target.name
      }))
    });

  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
