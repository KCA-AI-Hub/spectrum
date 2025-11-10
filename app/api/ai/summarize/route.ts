import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/api/openai';
import { cleanHtmlText } from '@/lib/utils/content-processing';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, type, articleId, model, maxTokens } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanedContent = cleanHtmlText(content);

    if (cleanedContent.length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty after cleaning' },
        { status: 400 }
      );
    }

    if (cleanedContent.length > 100000) {
      return NextResponse.json(
        { error: 'Content is too long. Maximum 100,000 characters allowed' },
        { status: 400 }
      );
    }

    const result = await generateSummary(cleanedContent, {
      type: type || 'medium',
      model: model || 'gpt-4',
      maxTokens: maxTokens
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate summary' },
        { status: 500 }
      );
    }

    let savedSummary = null;
    if (articleId) {
      const summaryTypeMap: Record<string, 'SHORT' | 'MEDIUM' | 'LONG' | 'BULLET_POINTS' | 'KEYWORDS_ONLY'> = {
        'short': 'SHORT',
        'medium': 'MEDIUM',
        'long': 'LONG',
        'bullet_points': 'BULLET_POINTS',
        'keywords_only': 'KEYWORDS_ONLY'
      };

      savedSummary = await prisma.summary.create({
        data: {
          articleId,
          type: summaryTypeMap[type || 'medium'],
          content: result.summary || '',
          quality: 0.85,
          version: 1
        }
      });
    }

    return NextResponse.json({
      success: true,
      summary: result.summary,
      savedSummary,
      usage: result.usage
    });

  } catch (error) {
    console.error('Summary generation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
