import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const skip = (page - 1) * pageSize;

    const [history, total] = await Promise.all([
      prisma.searchHistory.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          keyword: true,
          searchResults: {
            take: 5,
            include: {
              article: true
            }
          }
        }
      }),
      prisma.searchHistory.count()
    ]);

    return NextResponse.json({
      history,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize
    });

  } catch (error) {
    console.error('Search history API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { searchQuery, keywords, resultCount, searchTime, filters } = data;

    // Create or get keyword
    let keywordId: string | undefined;
    if (keywords && keywords.length > 0) {
      const keyword = await prisma.keyword.upsert({
        where: { keyword: keywords[0] },
        update: {
          useCount: { increment: 1 }
        },
        create: {
          keyword: keywords[0],
          useCount: 1
        }
      });
      keywordId = keyword.id;
    }

    const history = await prisma.searchHistory.create({
      data: {
        searchQuery,
        keywordId,
        resultCount: resultCount || 0,
        searchTime: searchTime || 0,
        filters: filters ? JSON.stringify(filters) : null,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({ success: true, history });

  } catch (error) {
    console.error('Create search history error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create search history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',').filter(Boolean);

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'History IDs are required' },
        { status: 400 }
      );
    }

    await prisma.searchHistory.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      deleted: ids.length
    });

  } catch (error) {
    console.error('Delete search history error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete search history' },
      { status: 500 }
    );
  }
}
