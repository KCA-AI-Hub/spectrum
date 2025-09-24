import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// 키워드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const onlyFavorites = searchParams.get('favorites') === 'true'

    const where: any = {}

    if (search) {
      where.keyword = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (onlyFavorites) {
      where.isFavorite = true
    }

    const [keywords, total] = await Promise.all([
      prisma.keyword.findMany({
        where,
        include: {
          searchHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          _count: {
            select: { searchHistory: true }
          }
        },
        orderBy: [
          { isFavorite: 'desc' },
          { useCount: 'desc' },
          { updatedAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.keyword.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        keywords: keywords.map(k => ({
          id: k.id,
          keyword: k.keyword,
          description: k.description,
          category: k.category,
          isFavorite: k.isFavorite,
          useCount: k.useCount,
          tags: k.tags ? k.tags.split(',') : [],
          searchCount: k._count.searchHistory,
          recentSearches: k.searchHistory,
          createdAt: k.createdAt,
          updatedAt: k.updatedAt
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
    console.error('Keywords fetch error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 키워드 생성/업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, description, category, isFavorite = false, tags = [] } = body

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      )
    }

    const keywordRecord = await prisma.keyword.upsert({
      where: { keyword },
      update: {
        description,
        category,
        isFavorite,
        tags: tags.join(','),
        updatedAt: new Date()
      },
      create: {
        keyword,
        description,
        category,
        isFavorite,
        tags: tags.join(',')
      },
      include: {
        _count: {
          select: { searchHistory: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: keywordRecord.id,
        keyword: keywordRecord.keyword,
        description: keywordRecord.description,
        category: keywordRecord.category,
        isFavorite: keywordRecord.isFavorite,
        useCount: keywordRecord.useCount,
        tags: keywordRecord.tags ? keywordRecord.tags.split(',') : [],
        searchCount: keywordRecord._count.searchHistory,
        createdAt: keywordRecord.createdAt,
        updatedAt: keywordRecord.updatedAt
      }
    })
  } catch (error) {
    console.error('Keyword create/update error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 키워드 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keywordId = searchParams.get('id')

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Keyword ID is required' },
        { status: 400 }
      )
    }

    await prisma.keyword.delete({
      where: { id: keywordId }
    })

    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully'
    })
  } catch (error) {
    console.error('Delete keyword error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}