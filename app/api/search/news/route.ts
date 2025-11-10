import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import CrawlQueue from '@/lib/crawl-queue'

const prisma = new PrismaClient()
const crawlQueue = CrawlQueue.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      keywords,
      dateRange,
      sources = [],
      category,
      sortBy = 'relevance',
      limit = 50,
      async: asyncMode = false // 비동기 모드 옵션
    } = body

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // 키워드를 데이터베이스에 저장 또는 업데이트
    const keywordRecords = await Promise.all(
      keywords.map(async (keyword: string) => {
        return await prisma.keyword.upsert({
          where: { keyword },
          update: {
            useCount: { increment: 1 },
            updatedAt: new Date()
          },
          create: {
            keyword,
            useCount: 1
          }
        })
      })
    )

    // 검색 기록 생성
    const searchHistory = await prisma.searchHistory.create({
      data: {
        searchQuery: keywords.join(', '),
        keywordId: keywordRecords[0]?.id,
        filters: JSON.stringify({
          dateRange,
          sources,
          category,
          sortBy,
          limit
        }),
        status: asyncMode ? 'PENDING' : 'IN_PROGRESS'
      }
    })

    if (asyncMode) {
      // 비동기 모드: 크롤링 작업을 큐에 추가하고 즉시 응답
      const taskId = await crawlQueue.addTask(searchHistory.id, {
        keywords,
        dateRange,
        sources,
        category,
        limit,
        retryCount: 3,
        priority: 'medium'
      })

      return NextResponse.json({
        success: true,
        mode: 'async',
        data: {
          searchId: searchHistory.id,
          taskId,
          status: 'PENDING',
          message: 'Crawling task has been queued. Use the status endpoint to check progress.'
        }
      })
    }

    // 동기 모드: 기존 로직 (즉시 크롤링 수행)
    try {
      const taskId = await crawlQueue.addTask(searchHistory.id, {
        keywords,
        dateRange,
        sources,
        category,
        limit,
        retryCount: 1, // 동기 모드에서는 재시도 최소화
        priority: 'high'
      })

      // 작업 완료 대기 (최대 30초)
      const maxWaitTime = 30000
      const pollInterval = 1000
      let waitedTime = 0

      while (waitedTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, pollInterval))
        waitedTime += pollInterval

        const updatedHistory = await prisma.searchHistory.findUnique({
          where: { id: searchHistory.id }
        })

        if (updatedHistory?.status === 'COMPLETED' || updatedHistory?.status === 'FAILED') {
          break
        }
      }

      // 결과 조회
      const completedHistory = await prisma.searchHistory.findUnique({
        where: { id: searchHistory.id },
        include: {
          searchResults: {
            include: {
              article: true
            },
            orderBy: { searchRank: 'asc' }
          }
        }
      })

      if (!completedHistory) {
        throw new Error('Search history not found')
      }

      if (completedHistory.status === 'FAILED') {
        return NextResponse.json({
          success: false,
          error: 'Crawling failed',
          details: completedHistory.errorMessage
        }, { status: 500 })
      }

      const searchResults = completedHistory.searchResults.map(sr => ({
        id: sr.article.id,
        title: sr.article.title,
        content: sr.article.content.substring(0, 500) + '...',
        url: sr.article.url,
        author: sr.article.author,
        publishedAt: sr.article.publishedAt,
        imageUrl: sr.article.imageUrl,
        relevanceScore: sr.relevanceScore,
        searchRank: sr.searchRank,
        keywordTags: sr.article.keywordTags?.split(',') || []
      }))

      // 정렬 적용
      searchResults.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
          case 'relevance':
          default:
            return b.relevanceScore - a.relevanceScore
        }
      })

      return NextResponse.json({
        success: true,
        mode: 'sync',
        data: {
          searchId: searchHistory.id,
          results: searchResults.slice(0, limit),
          totalResults: completedHistory.resultCount,
          searchTime: completedHistory.searchTime,
          keywords,
          filters: {
            dateRange,
            sources,
            category,
            sortBy
          }
        }
      })

    } catch (crawlError) {
      // 검색 실패 시 기록 업데이트
      await prisma.searchHistory.update({
        where: { id: searchHistory.id },
        data: {
          status: 'FAILED',
          errorMessage: crawlError instanceof Error ? crawlError.message : 'Unknown error'
        }
      })

      throw crawlError
    }

  } catch (error) {
    console.error('News search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 검색 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchId = searchParams.get('searchId')
    const taskId = searchParams.get('taskId')

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      )
    }

    const searchHistory = await prisma.searchHistory.findUnique({
      where: { id: searchId },
      include: {
        searchResults: {
          include: {
            article: {
              select: {
                id: true,
                title: true,
                url: true,
                author: true,
                publishedAt: true,
                imageUrl: true,
                relevanceScore: true,
                keywordTags: true
              }
            }
          },
          orderBy: { searchRank: 'asc' }
        }
      }
    })

    if (!searchHistory) {
      return NextResponse.json(
        { error: 'Search history not found' },
        { status: 404 }
      )
    }

    let taskStatus = null
    if (taskId) {
      taskStatus = crawlQueue.getTaskStatus(taskId)
    }

    return NextResponse.json({
      success: true,
      data: {
        searchId: searchHistory.id,
        status: searchHistory.status,
        resultCount: searchHistory.resultCount,
        searchTime: searchHistory.searchTime,
        errorMessage: searchHistory.errorMessage,
        createdAt: searchHistory.createdAt,
        filters: searchHistory.filters ? JSON.parse(searchHistory.filters) : null,
        task: taskStatus ? {
          id: taskStatus.id,
          status: taskStatus.status,
          retryCount: taskStatus.retryCount,
          startedAt: taskStatus.startedAt,
          completedAt: taskStatus.completedAt
        } : null,
        results: searchHistory.searchResults.map(sr => ({
          id: sr.article.id,
          title: sr.article.title,
          url: sr.article.url,
          author: sr.article.author,
          publishedAt: sr.article.publishedAt,
          imageUrl: sr.article.imageUrl,
          relevanceScore: sr.relevanceScore,
          searchRank: sr.searchRank,
          keywordTags: sr.article.keywordTags?.split(',') || []
        }))
      }
    })
  } catch (error) {
    console.error('Search status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}