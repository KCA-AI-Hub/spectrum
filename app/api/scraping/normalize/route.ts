/**
 * API endpoint for data normalization - Phase 4B.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataProcessingService } from '@/lib/services/data-processing';
import { prisma } from '@/lib/db/prisma';

const dataProcessingService = new DataProcessingService(prisma);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const batchSize = data.batchSize || 100;

    console.log(`Starting data normalization with batch size: ${batchSize}`);

    const result = await dataProcessingService.normalizeExistingData(batchSize);

    return NextResponse.json({
      success: true,
      message: `Normalization completed. Processed: ${result.processed}, Updated: ${result.updated}, Errors: ${result.errors}`,
      result
    });

  } catch (error) {
    console.error('Normalization API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Normalization failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get count of articles that need normalization
    const [
      rawArticles,
      nullRelevanceScore,
      nullKeywordTags
    ] = await Promise.all([
      prisma.article.count({
        where: { status: 'RAW' }
      }),
      prisma.article.count({
        where: { relevanceScore: null }
      }),
      prisma.article.count({
        where: { keywordTags: null }
      })
    ]);

    const totalNeedingNormalization = rawArticles + nullRelevanceScore + nullKeywordTags;

    return NextResponse.json({
      success: true,
      data: {
        rawArticles,
        nullRelevanceScore,
        nullKeywordTags,
        totalNeedingNormalization
      }
    });

  } catch (error) {
    console.error('Normalization status API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get normalization status' },
      { status: 500 }
    );
  }
}