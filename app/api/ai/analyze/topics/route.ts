import { NextRequest, NextResponse } from 'next/server';
import { classifyTopic } from '@/lib/api/openai';
import { cleanHtmlText } from '@/lib/utils/content-processing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, categories, model } = body;

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

    const result = await classifyTopic(cleanedContent, {
      categories: categories || undefined,
      model: model || 'gpt-4'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to classify topic' },
        { status: 500 }
      );
    }

    let parsedClassification = null;
    try {
      if (result.classification) {
        const jsonMatch = result.classification.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedClassification = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (parseError) {
      console.error('Failed to parse classification JSON:', parseError);
    }

    return NextResponse.json({
      success: true,
      classification: parsedClassification,
      rawClassification: result.classification,
      usage: result.usage
    });

  } catch (error) {
    console.error('Topic classification API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to classify topic' },
      { status: 500 }
    );
  }
}
