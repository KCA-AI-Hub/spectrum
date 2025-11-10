import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { searchNews } from '@/lib/api/firecrawl';
import { processContentForStorage, calculateRelevanceScore } from '@/lib/utils/content-processing';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Test without duplicate check ===');

    // Step 1: Create target and job
    const target = await prisma.crawlTarget.upsert({
      where: { url: 'test-no-dup-check' },
      update: {},
      create: {
        name: 'Test No Duplicate Check',
        url: 'test-no-dup-check',
        type: 'news',
        category: 'Test',
        isActive: true
      }
    });

    const job = await prisma.crawlJob.create({
      data: {
        targetId: target.id,
        status: 'RUNNING'
      }
    });

    console.log('Created job:', job.id);

    // Step 2: Search with Firecrawl
    console.log('Searching with Firecrawl...');
    const searchResult = await searchNews(['technology'], {
      limit: 5,
      scrapeContent: true
    });

    if (!searchResult.success) {
      throw new Error(`Search failed: ${searchResult.error}`);
    }

    console.log(`Found ${searchResult.data?.length || 0} articles`);

    // Step 3: Save directly without duplicate check
    const savedArticles = [];
    for (const item of searchResult.data || []) {
      try {
        if (!item.url || !item.content) continue;

        const processed = processContentForStorage(item.content);
        const relevanceScore = calculateRelevanceScore(
          processed.cleanText,
          processed.title,
          ['technology'],
          item.url
        );

        // Save directly - NO DUPLICATE CHECK
        const article = await prisma.article.create({
          data: {
            crawlJobId: job.id,
            title: processed.title,
            content: processed.cleanText,
            url: item.url + `?test=${Date.now()}`, // Make URL unique for testing
            author: item.metadata?.author,
            publishedAt: item.metadata?.publishedAt ? new Date(item.metadata.publishedAt) : null,
            imageUrl: item.metadata?.imageUrl,
            relevanceScore,
            keywordTags: JSON.stringify(processed.keywords),
            status: 'PROCESSED'
          }
        });

        savedArticles.push({
          id: article.id,
          title: article.title,
          url: article.url,
          relevanceScore: article.relevanceScore
        });

        console.log(`Saved article: ${article.title}`);
      } catch (error) {
        console.error('Error saving article:', error);
      }
    }

    // Update job status
    await prisma.crawlJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        processedItems: savedArticles.length
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test completed (no duplicate check)',
      jobId: job.id,
      articlesFound: searchResult.data?.length || 0,
      articlesSaved: savedArticles.length,
      savedArticles
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
