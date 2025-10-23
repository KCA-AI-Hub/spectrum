import { NextRequest, NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/api/openai';
import { cleanHtmlText } from '@/lib/utils/content-processing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, model } = body;

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

    const result = await analyzeSentiment(cleanedContent, {
      model: model || 'gpt-4'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to analyze sentiment' },
        { status: 500 }
      );
    }

    let parsedSentiment: {
      sentiment: string;
      confidence: number;
    } | null = null;

    if (result.sentiment) {
      const sentimentMatch = result.sentiment.match(/감정:\s*\[?([^\],]+)\]?/i);
      const confidenceMatch = result.sentiment.match(/신뢰도:\s*\[?([0-9.]+)\]?/i);

      if (sentimentMatch && confidenceMatch) {
        parsedSentiment = {
          sentiment: sentimentMatch[1].trim(),
          confidence: parseFloat(confidenceMatch[1])
        };
      }
    }

    return NextResponse.json({
      success: true,
      sentiment: parsedSentiment,
      rawSentiment: result.sentiment,
      usage: result.usage
    });

  } catch (error) {
    console.error('Sentiment analysis API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}
