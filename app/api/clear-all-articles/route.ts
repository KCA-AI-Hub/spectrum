import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Clearing all articles ===');

    // Delete all articles
    const result = await prisma.article.deleteMany({});

    console.log(`Deleted ${result.count} articles`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} articles`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Clear articles error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
