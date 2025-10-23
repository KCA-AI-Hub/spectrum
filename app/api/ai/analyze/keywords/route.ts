import { NextRequest, NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/api/openai';
import { cleanHtmlText } from '@/lib/utils/content-processing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, count, model } = body;

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

    if (cleanedContent.length > 50000) {
      return NextResponse.json(
        { error: 'Content is too long. Maximum 50,000 characters allowed' },
        { status: 400 }
      );
    }

    const result = await extractKeywords(cleanedContent, {
      count: count || 5,
      model: model || 'gpt-4'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to extract keywords' },
        { status: 500 }
      );
    }

    let keywordsList: string[] = [];
    if (result.keywords) {
      keywordsList = result.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    return NextResponse.json({
      success: true,
      keywords: keywordsList,
      rawKeywords: result.keywords,
      usage: result.usage
    });

  } catch (error) {
    console.error('Keyword extraction API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract keywords' },
      { status: 500 }
    );
  }
}
