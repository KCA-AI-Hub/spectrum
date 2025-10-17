import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        crawlJob: {
          include: {
            target: true
          }
        },
        summaries: true
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const formattedArticle = {
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
      status: article.status.toLowerCase(),
      summaries: article.summaries
    };

    return NextResponse.json({ article: formattedArticle });

  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.article.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete article' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const article = await prisma.article.update({
      where: { id },
      data: {
        status: data.status ? data.status.toUpperCase() : undefined,
        tags: data.tags ? data.tags.join(',') : undefined,
        relevanceScore: data.relevanceScore
      },
      include: {
        crawlJob: {
          include: {
            target: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        status: article.status.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update article' },
      { status: 500 }
    );
  }
}
