import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Calculate dynamic status based on source data
function calculateStatus(source: any): string {
  if (!source.enabled) {
    return 'inactive';
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Check if recently crawled (within last hour)
  if (source.lastCrawl && new Date(source.lastCrawl) > oneHourAgo) {
    return 'active';
  }

  // Check success rate for errors
  if (source.itemsCollected > 0 && source.successRate < 50) {
    return 'error';
  }

  // If never crawled or not recently crawled
  if (!source.lastCrawl) {
    return 'pending';
  }

  return 'inactive';
}

export async function GET() {
  try {
    const sources = await prisma.newsSource.findMany({
      orderBy: [
        { enabled: 'desc' },
        { name: 'asc' }
      ]
    });

    // Calculate dynamic status for each source
    const sourcesWithStatus = sources.map(source => ({
      ...source,
      status: calculateStatus(source)
    }));

    return NextResponse.json({ sources: sourcesWithStatus });
  } catch (error) {
    console.error('News sources GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const source = await prisma.newsSource.create({
      data: {
        name: data.name,
        url: data.url,
        type: data.type || 'news',
        category: data.category || '일반',
        description: data.description,
        headers: data.headers ? JSON.stringify(data.headers) : null,
        enabled: data.enabled ?? true
      }
    });

    return NextResponse.json({ source });
  } catch (error) {
    console.error('News sources POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create source' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    const source = await prisma.newsSource.update({
      where: { id },
      data: {
        ...updateData,
        headers: updateData.headers ? JSON.stringify(updateData.headers) : undefined
      }
    });

    return NextResponse.json({ source });
  } catch (error) {
    console.error('News sources PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update source' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    await prisma.newsSource.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('News sources DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete source' },
      { status: 500 }
    );
  }
}
