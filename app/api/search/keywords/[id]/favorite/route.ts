import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{ id: string }>
}

// 키워드 즐겨찾기 토글
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isFavorite } = body

    if (typeof isFavorite !== 'boolean') {
      return NextResponse.json(
        { error: 'isFavorite must be a boolean' },
        { status: 400 }
      )
    }

    const keyword = await prisma.keyword.update({
      where: { id },
      data: { isFavorite },
      include: {
        _count: {
          select: { searchHistory: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: keyword.id,
        keyword: keyword.keyword,
        description: keyword.description,
        category: keyword.category,
        isFavorite: keyword.isFavorite,
        useCount: keyword.useCount,
        tags: keyword.tags ? keyword.tags.split(',') : [],
        searchCount: keyword._count.searchHistory,
        createdAt: keyword.createdAt,
        updatedAt: keyword.updatedAt
      }
    })
  } catch (error) {
    console.error('Toggle keyword favorite error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}