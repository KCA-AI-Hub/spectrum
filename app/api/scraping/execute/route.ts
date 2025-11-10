/**
 * Main scraping execution API - Simplified version
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { searchNews } from '@/lib/api/firecrawl';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.keywords || !Array.isArray(data.keywords)) {
      return NextResponse.json(
        { error: 'keywords array is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const keywords = data.keywords;
    const searchQuery = keywords.join(', ');
    const maxArticles = data.maxArticles || 30;

    // Create or update keyword
    let keywordId: string | undefined;
    if (keywords && keywords.length > 0) {
      try {
        const keyword = await prisma.keyword.upsert({
          where: { keyword: keywords[0] },
          update: {
            useCount: { increment: 1 }
          },
          create: {
            keyword: keywords[0],
            useCount: 1
          }
        });
        keywordId = keyword.id;
      } catch (error) {
        console.error('Failed to create/update keyword:', error);
      }
    }

    // Search for articles using Firecrawl
    const searchResponse = await searchNews(keywords, {
      limit: maxArticles,
      scrapeContent: true
    });

    if (!searchResponse.success || !searchResponse.data) {
      throw new Error(searchResponse.error || 'Failed to search for articles');
    }

    let processedCount = 0;
    const articles = [];

    // Process and save articles
    for (const result of searchResponse.data) {
      try {
        // Check if article already exists
        const existing = await prisma.article.findUnique({
          where: { url: result.url }
        });

        if (!existing) {
          const article = await prisma.article.create({
            data: {
              title: result.title || 'Untitled',
              content: result.content || '',
              url: result.url,
              author: result.metadata?.author || null,
              publishedAt: result.metadata?.publishedTime ? new Date(result.metadata.publishedTime) : null,
              imageUrl: result.metadata?.ogImage || null,
              sourceName: result.source || new URL(result.url).hostname,
              sourceUrl: result.source || result.url,
              relevanceScore: result.metadata?.score ? result.metadata.score * 100 : null,
              keywordMatches: JSON.stringify(keywords),
              status: 'RAW'
            }
          });
          articles.push(article);
          processedCount++;
        }
      } catch (error) {
        console.error(`Failed to save article ${result.url}:`, error);
      }
    }

    const endTime = Date.now();
    const searchTime = (endTime - startTime) / 1000;

    // Save to search history
    try {
      await prisma.searchHistory.create({
        data: {
          searchQuery,
          keywordId,
          resultCount: processedCount,
          searchTime,
          filters: JSON.stringify({ maxArticles }),
          status: 'COMPLETED'
        }
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }

    return NextResponse.json({
      success: true,
      result: {
        processedArticles: processedCount,
        totalResults: searchResponse.data.length,
        searchTime,
        articles
      }
    });

  } catch (error) {
    console.error('Scraping execution API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scraping execution failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      // Get basic system metrics
      const totalArticles = await prisma.article.count();
      const totalKeywords = await prisma.keyword.count();
      const totalSearches = await prisma.searchHistory.count();

      return NextResponse.json({
        success: true,
        metrics: {
          totalArticles,
          totalKeywords,
          totalSearches
        }
      });
    }

    return NextResponse.json(
      { error: 'action=metrics parameter is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Scraping status API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get status' },
      { status: 500 }
    );
  }
}