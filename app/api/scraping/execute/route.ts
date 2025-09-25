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
    if (!data.crawlJobId || !data.keywords || !Array.isArray(data.keywords)) {
      return NextResponse.json(
        { error: 'crawlJobId and keywords array are required' },
        { status: 400 }
      );
    }

    const config: ScrapingJobConfig = {
      crawlJobId: data.crawlJobId,
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
    const result = await orchestrator.executeScrapingJob(config);

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