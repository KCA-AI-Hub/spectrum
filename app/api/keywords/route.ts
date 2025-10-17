import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'popular') {
      // Get popular keywords
      const keywords = await prisma.keyword.findMany({
        take: 10,
        orderBy: { useCount: 'desc' }
      });
      return NextResponse.json({ keywords });
    }

    if (action === 'favorites') {
      // Get favorite keywords
      const keywords = await prisma.keyword.findMany({
        where: { isFavorite: true },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ keywords });
    }

    // Get all keywords
    const keywords = await prisma.keyword.findMany({
      orderBy: { useCount: 'desc' }
    });

    return NextResponse.json({ keywords });

  } catch (error) {
    console.error('Keywords API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { keyword, description, category, isFavorite } = data;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const newKeyword = await prisma.keyword.create({
      data: {
        keyword,
        description,
        category,
        isFavorite: isFavorite || false,
        useCount: 0
      }
    });

    return NextResponse.json({ success: true, keyword: newKeyword });

  } catch (error) {
    console.error('Create keyword error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create keyword' },
      { status: 500 }
    );
  }
}
