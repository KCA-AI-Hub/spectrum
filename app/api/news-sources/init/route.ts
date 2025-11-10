import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST() {
  try {
    const existingCount = await prisma.newsSource.count();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Sources already initialized',
        count: existingCount
      });
    }

    const defaultSources = [
      {
        name: '네이버 뉴스',
        url: 'https://news.naver.com',
        type: 'news',
        category: '한국',
        description: '네이버 뉴스 포털',
        enabled: true
      },
      {
        name: '다음 뉴스',
        url: 'https://news.daum.net',
        type: 'news',
        category: '한국',
        description: '다음 뉴스 포털',
        enabled: true
      },
      {
        name: '조선일보',
        url: 'https://www.chosun.com',
        type: 'news',
        category: '한국',
        description: '조선일보',
        enabled: true
      },
      {
        name: 'Google News',
        url: 'https://news.google.com',
        type: 'news',
        category: 'Global',
        description: 'Google News',
        enabled: true
      },
      {
        name: 'BBC News',
        url: 'https://www.bbc.com/news',
        type: 'news',
        category: 'Global',
        description: 'BBC News',
        enabled: true
      },
      {
        name: 'CNN',
        url: 'https://edition.cnn.com',
        type: 'news',
        category: 'Global',
        description: 'CNN News',
        enabled: true
      }
    ];

    const created = await prisma.newsSource.createMany({
      data: defaultSources
    });

    return NextResponse.json({ 
      success: true,
      created: created.count
    });
  } catch (error) {
    console.error('Init sources error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize sources' },
      { status: 500 }
    );
  }
}
