import { NextRequest, NextResponse } from 'next/server';
import type { NewsSourceValidationResult } from '@/lib/types/news-source';

// POST: Validate a news source by making a test request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    await params;

    const body = await request.json();
    const { url, headers } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required for validation' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers || {},
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      const result: NewsSourceValidationResult = {
        valid: response.ok,
        statusCode: response.status,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };

      return NextResponse.json(result);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const result: NewsSourceValidationResult = {
        valid: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error validating news source:', error);
    return NextResponse.json(
      { error: 'Failed to validate news source' },
      { status: 500 }
    );
  }
}
