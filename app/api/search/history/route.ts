import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const where = status ? { status: status as any } : {}

    const [history, total] = await Promise.all([
      prisma.searchHistory.findMany({
        where,
        include: {
          keyword: true,
          searchResults: {
            include: {
              article: {
                select: {
                  id: true,
                  title: true,
                  url: true,
                  publishedAt: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.searchHistory.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        history: history.map(h => ({
          id: h.id,
          searchQuery: h.searchQuery,
          keyword: h.keyword,
          resultCount: h.resultCount,
          searchTime: h.searchTime,
          status: h.status,
          errorMessage: h.errorMessage,
          filters: h.filters ? JSON.parse(h.filters) : null,
          createdAt: h.createdAt,
          articles: h.searchResults.map(sr => sr.article)
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    })
  } catch (error) {
    console.error('Search history error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const historyId = searchParams.get('id')

    if (!historyId) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      )
    }

    // 관련 검색 결과도 함께 삭제 (cascade)
    await prisma.searchHistory.delete({
      where: { id: historyId }
    })

    return NextResponse.json({
      success: true,
      message: 'Search history deleted successfully'
    })
  } catch (error) {
    console.error('Delete search history error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}