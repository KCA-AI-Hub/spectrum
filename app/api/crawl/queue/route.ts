import { NextRequest, NextResponse } from 'next/server'
import CrawlQueue from '@/lib/crawl-queue'

const crawlQueue = CrawlQueue.getInstance()

// 크롤링 큐 상태 조회
export async function GET(request: NextRequest) {
  try {
    const queueStatus = crawlQueue.getQueueStatus()

    return NextResponse.json({
      success: true,
      data: {
        queue: queueStatus,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Queue status error:', error)
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