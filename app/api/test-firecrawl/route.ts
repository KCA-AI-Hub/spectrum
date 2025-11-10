import { NextRequest, NextResponse } from 'next/server';
import { searchNews } from '@/lib/api/firecrawl';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Firecrawl Test API Started ===');

    // Check if API key is loaded
    const apiKey = process.env.FIRECRAWL_API_KEY;
    console.log('API Key loaded:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'FIRECRAWL_API_KEY not found in environment variables',
        envCheck: {
          apiKey: 'missing'
        }
      }, { status: 500 });
    }

    // Test simple search
    console.log('Starting test search with keyword: "AI"');
    const result = await searchNews(['AI'], {
      limit: 5,
      scrapeContent: true
    });

    console.log('Search result:', {
      success: result.success,
      dataLength: result.data?.length || 0,
      error: result.error
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        details: 'Firecrawl search failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Firecrawl is working!',
      results: {
        articlesFound: result.data?.length || 0,
        sampleArticles: result.data?.slice(0, 2).map(item => ({
          title: item.title,
          url: item.url,
          hasContent: !!item.content
        }))
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
