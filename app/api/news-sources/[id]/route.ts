import { NextRequest, NextResponse } from 'next/server';
import type { NewsSource } from '@/lib/types/news-source';
import { prisma } from '@/lib/db/prisma';


// GET: Get a single news source by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const target = await prisma.newsSource.findUnique({
      where: { id },
    });

    if (!target) {
      return NextResponse.json(
        { error: 'News source not found' },
        { status: 404 }
      );
    }

    const status = !target.enabled
      ? 'inactive'
      : target.lastCrawl
        ? 'active'
        : 'pending';

    const source: NewsSource = {
      id: target.id,
      name: target.name,
      url: target.url,
      type: target.type,
      category: target.category,
      description: target.description || undefined,
      headers: target.headers ? JSON.parse(target.headers) : undefined,
      enabled: target.enabled,
      status,
      lastCrawl: target.lastCrawl?.toISOString() || null,
      itemsCollected: target.itemsCollected,
      successRate: target.successRate,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    };

    return NextResponse.json(source);
  } catch (error) {
    console.error('Error fetching news source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news source' },
      { status: 500 }
    );
  }
}

// PATCH: Update a news source
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, type, category, description, headers, enabled } = body;

    // Check if source exists
    const existing = await prisma.newsSource.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'News source not found' },
        { status: 404 }
      );
    }

    // If URL is being changed, check for duplicates
    if (url && url !== existing.url) {
      const duplicate = await prisma.newsSource.findUnique({
        where: { url },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A source with this URL already exists' },
          { status: 409 }
        );
      }
    }

    // Update source
    const target = await prisma.newsSource.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        url: url !== undefined ? url : existing.url,
        type: type !== undefined ? type : existing.type,
        category: category !== undefined ? category : existing.category,
        description: description !== undefined ? description : existing.description,
        headers: headers !== undefined ? JSON.stringify(headers) : existing.headers,
        enabled: enabled !== undefined ? enabled : existing.enabled,
      },
    });

    const status = !target.enabled
      ? 'inactive'
      : target.lastCrawl
        ? 'active'
        : 'pending';

    const updatedSource: NewsSource = {
      id: target.id,
      name: target.name,
      url: target.url,
      type: target.type,
      category: target.category,
      description: target.description || undefined,
      headers: target.headers ? JSON.parse(target.headers) : undefined,
      enabled: target.enabled,
      status,
      lastCrawl: target.lastCrawl?.toISOString() || null,
      itemsCollected: target.itemsCollected,
      successRate: target.successRate,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    };

    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error updating news source:', error);
    return NextResponse.json(
      { error: 'Failed to update news source' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a news source
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if source exists
    const existing = await prisma.newsSource.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'News source not found' },
        { status: 404 }
      );
    }

    // Delete source (cascade will handle related jobs)
    await prisma.newsSource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news source:', error);
    return NextResponse.json(
      { error: 'Failed to delete news source' },
      { status: 500 }
    );
  }
}
