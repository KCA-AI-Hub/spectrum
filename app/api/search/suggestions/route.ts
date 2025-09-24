import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// 검색어 자동완성 및 제안
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          popularKeywords: await getPopularKeywords(limit)
        }
      })
    }

    // 키워드 테이블에서 검색
    const keywordSuggestions = await prisma.keyword.findMany({
      where: {
        keyword: {
          contains: query
        }
      },
      orderBy: [
        { isFavorite: 'desc' },
        { useCount: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        keyword: true,
        useCount: true,
        isFavorite: true,
        category: true
      }
    })

    // 검색 기록에서 유사한 검색어 찾기
    const historySearches = await prisma.searchHistory.findMany({
      where: {
        searchQuery: {
          contains: query
        },
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      distinct: ['searchQuery'],
      select: {
        searchQuery: true,
        resultCount: true,
        createdAt: true
      }
    })

    // 기사 제목에서 키워드 추출 (간단한 매칭)
    const articleSuggestions = await prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query
            }
          },
          {
            keywordTags: {
              contains: query
            }
          }
        ]
      },
      take: limit,
      select: {
        keywordTags: true,
        title: true
      }
    })

    // 결과 통합 및 정렬
    const suggestions = [
      ...keywordSuggestions.map(k => ({
        text: k.keyword,
        type: 'keyword' as const,
        useCount: k.useCount,
        isFavorite: k.isFavorite,
        category: k.category,
        source: 'keywords'
      })),
      ...historySearches.map(h => ({
        text: h.searchQuery,
        type: 'history' as const,
        resultCount: h.resultCount,
        lastUsed: h.createdAt,
        source: 'history'
      })),
      ...extractKeywordsFromArticles(articleSuggestions, query).map(keyword => ({
        text: keyword,
        type: 'trending' as const,
        source: 'articles'
      }))
    ]

    // 중복 제거 및 정렬
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text.toLowerCase(), s])).values()
    )
      .sort((a, b) => {
        // 정확한 매치 우선
        const aExact = a.text.toLowerCase() === query.toLowerCase()
        const bExact = b.text.toLowerCase() === query.toLowerCase()
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1

        // 즐겨찾기 우선
        if (a.type === 'keyword' && b.type === 'keyword') {
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1
        }

        // 사용 빈도 우선
        if (a.type === 'keyword' && b.type === 'keyword') {
          return (b.useCount || 0) - (a.useCount || 0)
        }

        return 0
      })
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        query,
        suggestions: uniqueSuggestions,
        popularKeywords: await getPopularKeywords(5)
      }
    })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function getPopularKeywords(limit: number) {
  const popularKeywords = await prisma.keyword.findMany({
    orderBy: { useCount: 'desc' },
    take: limit,
    select: {
      keyword: true,
      useCount: true,
      isFavorite: true,
      category: true
    }
  })

  return popularKeywords
}

function extractKeywordsFromArticles(
  articles: { keywordTags: string | null; title: string }[],
  query: string
): string[] {
  const keywords = new Set<string>()

  articles.forEach(article => {
    // 키워드 태그에서 추출
    if (article.keywordTags) {
      article.keywordTags
        .split(',')
        .forEach(tag => {
          const trimmed = tag.trim()
          if (trimmed.toLowerCase().includes(query.toLowerCase())) {
            keywords.add(trimmed)
          }
        })
    }

    // 제목에서 간단한 키워드 추출
    const titleWords = article.title.split(/\s+/)
    titleWords.forEach(word => {
      if (word.length > 2 && word.toLowerCase().includes(query.toLowerCase())) {
        keywords.add(word)
      }
    })
  })

  return Array.from(keywords).slice(0, 5)
}