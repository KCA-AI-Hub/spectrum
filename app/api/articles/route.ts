import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const keywords = searchParams.get('keywords')?.split(',').filter(Boolean);
    const sources = searchParams.get('sources')?.split(',').filter(Boolean);
    const minRelevance = searchParams.get('minRelevance')
      ? parseFloat(searchParams.get('minRelevance')!)
      : undefined;
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (keywords && keywords.length > 0) {
      where.OR = keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
          { keywordTags: { contains: keyword } }
        ]
      }));
    }

    if (sources && sources.length > 0) {
      where.crawlJob = {
        target: {
          id: { in: sources }
        }
      };
    }

    if (minRelevance !== undefined) {
      where.relevanceScore = { gte: minRelevance };
    }

    if (status) {
      where.status = status;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: sortBy === 'date' ? { publishedAt: sortOrder as 'asc' | 'desc' }
          : sortBy === 'publishedAt' ? { publishedAt: sortOrder as 'asc' | 'desc' }
          : sortBy === 'extractedAt' ? { extractedAt: sortOrder as 'asc' | 'desc' }
          : sortBy === 'relevance' || sortBy === 'relevanceScore' ? { relevanceScore: sortOrder as 'asc' | 'desc' }
          : { title: sortOrder as 'asc' | 'desc' },
        include: {
          crawlJob: {
            include: {
              target: true
            }
          }
        }
      }),
      prisma.article.count({ where })
    ]);

    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      url: article.url,
      author: article.author,
      publishedAt: article.publishedAt,
      extractedAt: article.extractedAt,
      imageUrl: article.imageUrl,
      sourceName: article.crawlJob.target.name,
      sourceUrl: article.crawlJob.target.url,
      relevanceScore: article.relevanceScore,
      keywordMatches: article.keywordTags ? article.keywordTags.split(',') : [],
      tags: article.tags ? article.tags.split(',') : [],
      status: article.status.toLowerCase()
    }));

    return NextResponse.json({
      articles: formattedArticles,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize
    });

  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch articles' },
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
        { error: 'Article IDs are required' },
        { status: 400 }
      );
    }

    await prisma.article.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({
      success: true,
      deleted: ids.length
    });

  } catch (error) {
    console.error('Articles delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete articles' },
      { status: 500 }
    );
  }
}
