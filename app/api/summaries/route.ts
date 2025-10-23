import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const where: any = {}

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { content: { contains: search } }
      ]
    }

    const skip = (page - 1) * limit

    const [summaries, totalCount] = await Promise.all([
      prisma.summary.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          article: {
            select: {
              id: true,
              title: true,
              url: true
            }
          }
        }
      }),
      prisma.summary.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: summaries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching summaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    )
  }
}
