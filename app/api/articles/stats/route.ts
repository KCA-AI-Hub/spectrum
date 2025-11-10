import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
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
      {
        total: 0,
        processed: 0,
        raw: 0,
        failed: 0
      },
      { status: 200 }
    );
  }
}
