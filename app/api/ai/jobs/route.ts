import { NextRequest, NextResponse } from 'next/server';
import { jobManager } from '@/lib/ai/job-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;
    const articleId = searchParams.get('articleId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const jobs = await jobManager.listJobs({
      type,
      status,
      articleId,
      limit,
      offset
    });

    const stats = await jobManager.getJobStats();

    return NextResponse.json({
      success: true,
      jobs,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total
      }
    });

  } catch (error) {
    console.error('Jobs list API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch jobs' },
      { status: 500 }
    );
  } finally {
    await jobManager.disconnect();
  }
}
