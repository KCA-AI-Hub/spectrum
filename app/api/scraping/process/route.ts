/**
 * API endpoints for processing scraped content - Phase 4B.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataProcessingService } from '@/lib/services/data-processing';
import { prisma } from '@/lib/db/prisma';

const dataProcessingService = new DataProcessingService(prisma);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Single content processing
    if (data.url && data.content) {
      const result = await dataProcessingService.processScrapedContent({
        url: data.url,
        title: data.title,
        content: data.content,
        metadata: data.metadata,
        crawlJobId: data.crawlJobId,
        searchKeywords: data.searchKeywords,
        author: data.author,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        imageUrl: data.imageUrl
      });

      return NextResponse.json(result);
    }

    // Batch processing
    if (data.contentList && Array.isArray(data.contentList)) {
      const stats = await dataProcessingService.batchProcessScrapedContent(
        data.contentList.map((item: {
          url: string;
          title?: string;
          content: string;
          metadata?: Record<string, unknown>;
          crawlJobId: string;
          searchKeywords?: string[];
          author?: string;
          publishedAt?: string;
          imageUrl?: string;
        }) => ({
          url: item.url,
          title: item.title,
          content: item.content,
          metadata: item.metadata,
          crawlJobId: item.crawlJobId,
          searchKeywords: item.searchKeywords,
          author: item.author,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
          imageUrl: item.imageUrl
        }))
      );

      return NextResponse.json({
        success: true,
        stats
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format. Expected url+content or contentList.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Processing API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crawlJobId = searchParams.get('crawlJobId');

    if (!crawlJobId) {
      return NextResponse.json(
        { error: 'crawlJobId parameter is required' },
        { status: 400 }
      );
    }

    const stats = await dataProcessingService.getProcessingStats(crawlJobId);

    if (!stats) {
      return NextResponse.json(
        { error: 'Statistics not found for the specified crawl job' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
}