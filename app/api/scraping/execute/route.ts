/**
 * Main scraping execution API - Phase 4B.4 Orchestrator Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScrapingOrchestratorService, type ScrapingJobConfig } from '@/lib/services/scraping-orchestrator';
import { prisma } from '@/lib/db/prisma';

const orchestrator = new ScrapingOrchestratorService(prisma);

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

    // Create crawl job if not provided
    let crawlJobId = data.crawlJobId;
    if (!crawlJobId) {
      // Get or create a default crawl target for Firecrawl search
      const target = await prisma.crawlTarget.upsert({
        where: { url: 'firecrawl-search' },
        update: {},
        create: {
          name: 'Firecrawl Search',
          url: 'firecrawl-search',
          type: 'news',
          category: 'API Search',
          description: 'Firecrawl API-based news search',
          isActive: true
        }
      });

      // Create crawl job
      const job = await prisma.crawlJob.create({
        data: {
          targetId: target.id,
          status: 'PENDING'
        }
      });

      crawlJobId = job.id;
    }

    const config: ScrapingJobConfig = {
      crawlJobId,
      keywords: data.keywords,
      sources: data.sources,
      options: {
        maxArticles: data.maxArticles || 50,
        relevanceThreshold: data.relevanceThreshold || 10,
        enableAutoBackup: data.enableAutoBackup || false,
        batchSize: data.batchSize || 10
      }
    };

    // Execute the scraping job
    const startTime = Date.now();
    const result = await orchestrator.executeScrapingJob(config);
    const endTime = Date.now();
    const searchTime = (endTime - startTime) / 1000;

    // Save to search history
    try {
      const searchQuery = data.keywords.join(', ');
      const filters = {
        maxArticles: config.options.maxArticles,
        relevanceThreshold: config.options.relevanceThreshold,
        sources: config.sources,
      };

      // Create or get keyword
      let keywordId: string | undefined;
      if (data.keywords && data.keywords.length > 0) {
        const keyword = await prisma.keyword.upsert({
          where: { keyword: data.keywords[0] },
          update: {
            useCount: { increment: 1 }
          },
          create: {
            keyword: data.keywords[0],
            useCount: 1
          }
        });
        keywordId = keyword.id;
      }

      await prisma.searchHistory.create({
        data: {
          searchQuery,
          keywordId,
          resultCount: result.processedArticles || 0,
          searchTime,
          filters: JSON.stringify(filters),
          status: result.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED'
        }
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
      // Don't fail the whole request if history save fails
    }

    return NextResponse.json({
      success: true,
      result
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
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action');

    if (action === 'metrics') {
      // Get system metrics
      const metrics = await orchestrator.getSystemMetrics();
      return NextResponse.json({
        success: true,
        metrics
      });
    }

    if (jobId) {
      // Get specific job status
      const status = await orchestrator.getJobStatus(jobId);
      return NextResponse.json({
        success: true,
        status
      });
    }

    return NextResponse.json(
      { error: 'Either jobId or action=metrics parameter is required' },
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

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, jobId } = data;

    if (action === 'reprocess' && jobId) {
      // Reprocess failed articles for a specific job
      const result = await orchestrator.reprocessFailedArticles(jobId);
      return NextResponse.json({
        success: true,
        result
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing jobId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Scraping reprocess API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Reprocessing failed' },
      { status: 500 }
    );
  }
}