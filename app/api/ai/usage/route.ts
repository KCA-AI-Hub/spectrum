import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/ai/usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;
    const operation = searchParams.get('operation') || undefined;
    const model = searchParams.get('model') || undefined;

    const stats = await usageTracker.getUsageStats({
      startDate,
      endDate,
      operation,
      model
    });

    const byModel = await usageTracker.getUsageByModel();

    return NextResponse.json({
      success: true,
      stats,
      byModel
    });

  } catch (error) {
    console.error('Usage stats API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch usage stats' },
      { status: 500 }
    );
  } finally {
    await usageTracker.disconnect();
  }
}
