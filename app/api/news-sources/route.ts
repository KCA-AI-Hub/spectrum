import { NextRequest, NextResponse } from 'next/server';
import type { NewsSource, NewsSourceListResponse } from '@/lib/types/news-source';
import { prisma } from '@/lib/prisma';

// GET: List all news sources with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Build where clause
    const where: any = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { url: { contains: search } },
        { category: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.crawlTarget.count({ where });

    // Get paginated results
    const targets = await prisma.crawlTarget.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
    });

    // Transform to NewsSource format
    const sources: NewsSource[] = targets.map((target) => {
      const status = !target.isActive
        ? 'inactive'
        : target.lastCrawl
          ? 'active'
          : 'pending';

      return {
        id: target.id,
        name: target.name,
        url: target.url,
        type: target.type,
        category: target.category,
        description: target.description || undefined,
        headers: target.headers ? JSON.parse(target.headers) : undefined,
        enabled: target.isActive,
        status,
        lastCrawl: target.lastCrawl?.toISOString() || null,
        itemsCollected: target.itemsCollected,
        successRate: target.successRate,
        createdAt: target.createdAt.toISOString(),
        updatedAt: target.updatedAt.toISOString(),
      };
    });

    const response: NewsSourceListResponse = {
      sources,
      total,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching news sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news sources' },
      { status: 500 }
    );
  }
}

// POST: Create a new news source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, type, category, description, headers, enabled } = body;

    // Validation
    if (!name || !url || !type) {
      return NextResponse.json(
        { error: 'Name, URL, and type are required' },
        { status: 400 }
      );
    }

    // Check if URL already exists
    const existingSource = await prisma.crawlTarget.findUnique({
      where: { url },
    });

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this URL already exists' },
        { status: 409 }
      );
    }

    // Create new source
    const target = await prisma.crawlTarget.create({
      data: {
        name,
        url,
        type,
        category: category || '미분류',
        description,
        headers: headers ? JSON.stringify(headers) : null,
        isActive: enabled !== undefined ? enabled : true,
      },
    });

    const newSource: NewsSource = {
      id: target.id,
      name: target.name,
      url: target.url,
      type: target.type,
      category: target.category,
      description: target.description || undefined,
      headers: target.headers ? JSON.parse(target.headers) : undefined,
      enabled: target.isActive,
      status: target.isActive ? 'pending' : 'inactive',
      lastCrawl: null,
      itemsCollected: 0,
      successRate: 0,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    };

    return NextResponse.json(newSource, { status: 201 });
  } catch (error) {
    console.error('Error creating news source:', error);
    return NextResponse.json(
      { error: 'Failed to create news source' },
      { status: 500 }
    );
  }
}
