import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 쿼리 파라미터
    const status = searchParams.get('status')
    const format = searchParams.get('format')
    const style = searchParams.get('style')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')
    const favorite = searchParams.get('favorite') === 'true'
    const collection = searchParams.get('collection')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minViews = searchParams.get('minViews')
    const maxViews = searchParams.get('maxViews')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 필터 조건 구성
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (format) {
      where.format = format
    }

    if (style) {
      where.style = style
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { prompt: { contains: search } }
      ]
    }

    if (tag) {
      // Filter by tag (would need to join with VideoTagRelation)
      const taggedVideoIds = await prisma.videoTagRelation.findMany({
        where: {
          tag: {
            name: tag
          }
        },
        select: { videoId: true }
      })
      where.id = { in: taggedVideoIds.map(v => v.videoId) }
    }

    if (category) {
      // For now, we'll use metadata field to store category
      // In production, you might want to add a categoryId field to Video model
      where.metadata = { contains: category }
    }

    if (favorite) {
      const favoriteVideoIds = await prisma.videoFavorite.findMany({
        select: { videoId: true }
      })
      where.id = { in: favoriteVideoIds.map(f => f.videoId) }
    }

    if (collection) {
      const collectionVideoIds = await prisma.videoCollectionItem.findMany({
        where: { collectionId: collection },
        select: { videoId: true }
      })
      where.id = { in: collectionVideoIds.map(i => i.videoId) }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    if (minViews || maxViews) {
      where.views = {}
      if (minViews) {
        where.views.gte = parseInt(minViews)
      }
      if (maxViews) {
        where.views.lte = parseInt(maxViews)
      }
    }

    // 정렬 조건
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // 페이지네이션
    const skip = (page - 1) * limit

    // 데이터 조회
    const [videos, totalCount] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          summary: {
            select: {
              id: true,
              type: true,
              content: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              url: true
            }
          },
          _count: {
            select: {
              processingLogs: true
            }
          }
        }
      }),
      prisma.video.count({ where })
    ])

    // 통계 정보
    const stats = await prisma.video.groupBy({
      by: ['status'],
      _count: true
    })

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: videos,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        total: totalCount,
        byStatus: statusCounts
      }
    })

  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
