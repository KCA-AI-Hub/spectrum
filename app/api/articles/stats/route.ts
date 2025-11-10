import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const [total, processed, raw, failed] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PROCESSED' } }),
      prisma.article.count({ where: { status: 'RAW' } }),
      prisma.article.count({ where: { status: 'FAILED' } })
    ]);

    return NextResponse.json({
      total,
      processed,
      raw,
      failed
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
