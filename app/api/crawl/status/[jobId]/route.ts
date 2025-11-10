import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: Promise<{ jobId: string }>
}

// 크롤링 작업 상태 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { jobId } = await params

    const crawlJob = await prisma.crawlJob.findUnique({
      where: { id: jobId },
      include: {
        target: true,
        articles: {
          select: {
            id: true,
            title: true,
            url: true,
            extractedAt: true,
            relevanceScore: true
          },
          orderBy: { extractedAt: 'desc' },
          take: 10
        },
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!crawlJob) {
      return NextResponse.json(
        { error: 'Crawl job not found' },
        { status: 404 }
      )
    }

    const progress = crawlJob.totalItems > 0
      ? (crawlJob.processedItems / crawlJob.totalItems) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        id: crawlJob.id,
        status: crawlJob.status,
        target: {
          id: crawlJob.target.id,
          name: crawlJob.target.name,
          url: crawlJob.target.url
        },
        progress: {
          total: crawlJob.totalItems,
          processed: crawlJob.processedItems,
          percentage: Math.round(progress)
        },
        timing: {
          startedAt: crawlJob.startedAt,
          completedAt: crawlJob.completedAt,
          duration: crawlJob.startedAt && crawlJob.completedAt
            ? new Date(crawlJob.completedAt).getTime() - new Date(crawlJob.startedAt).getTime()
            : null
        },
        errorMessage: crawlJob.errorMessage,
        articlesCount: crawlJob._count.articles,
        recentArticles: crawlJob.articles,
        createdAt: crawlJob.createdAt,
        updatedAt: crawlJob.updatedAt
      }
    })
  } catch (error) {
    console.error('Crawl status error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 크롤링 작업 취소
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { jobId } = await params

    const crawlJob = await prisma.crawlJob.findUnique({
      where: { id: jobId }
    })

    if (!crawlJob) {
      return NextResponse.json(
        { error: 'Crawl job not found' },
        { status: 404 }
      )
    }

    if (crawlJob.status === 'COMPLETED' || crawlJob.status === 'FAILED') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or failed job' },
        { status: 400 }
      )
    }

    await prisma.crawlJob.update({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        errorMessage: 'Cancelled by user'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Crawl job cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel crawl job error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}