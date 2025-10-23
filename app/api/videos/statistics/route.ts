import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // 전체 통계
    const totalVideos = await prisma.video.count()
    const totalViews = await prisma.video.aggregate({
      _sum: { views: true }
    })
    const totalDownloads = await prisma.video.aggregate({
      _sum: { downloads: true }
    })
    const totalShares = await prisma.video.aggregate({
      _sum: { shares: true }
    })

    // 상태별 통계
    const statusStats = await prisma.video.groupBy({
      by: ['status'],
      _count: true,
      orderBy: { _count: { status: 'desc' } }
    })

    // 성공률/실패율 계산
    const completed = statusStats.find(s => s.status === 'COMPLETED')?._count || 0
    const failed = statusStats.find(s => s.status === 'FAILED')?._count || 0
    const successRate = totalVideos > 0 ? (completed / totalVideos) * 100 : 0
    const failureRate = totalVideos > 0 ? (failed / totalVideos) * 100 : 0

    // 포맷별 통계
    const formatStats = await prisma.video.groupBy({
      by: ['format'],
      _count: true,
      _sum: { views: true, downloads: true, shares: true },
      orderBy: { _count: { format: 'desc' } }
    })

    // 스타일별 통계
    const styleStats = await prisma.video.groupBy({
      by: ['style'],
      _count: true,
      _sum: { views: true, downloads: true, shares: true },
      orderBy: { _count: { style: 'desc' } }
    })

    // 기간별 생성 추이 (최근 N일)
    const dailyStats = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
      FROM Video
      WHERE createdAt >= ${startDate.toISOString()}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT ${periodDays}
    `

    // 인기 템플릿 (사용 횟수 기준)
    const popularTemplates = await prisma.videoTemplate.findMany({
      where: { isActive: true },
      orderBy: { usageCount: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        style: true,
        usageCount: true
      }
    })

    // 최근 성능이 좋은 동영상 (조회수 + 다운로드 + 공유 기준)
    const topPerformingVideos = await prisma.video.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      orderBy: [
        { views: 'desc' }
      ],
      take: 10,
      select: {
        id: true,
        title: true,
        views: true,
        downloads: true,
        shares: true,
        format: true,
        style: true,
        createdAt: true
      }
    })

    // 평균 처리 시간 (완료된 동영상만)
    const completedVideos = await prisma.video.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })

    const avgProcessingTime = completedVideos.length > 0
      ? completedVideos.reduce((sum, v) => {
          const diff = new Date(v.updatedAt).getTime() - new Date(v.createdAt).getTime()
          return sum + diff
        }, 0) / completedVideos.length / 1000 // seconds
      : 0

    // AI 사용량 통계 (최근 기간)
    const aiUsage = await prisma.aIUsageLog.aggregate({
      where: {
        createdAt: { gte: startDate }
      },
      _sum: {
        totalTokens: true,
        promptTokens: true,
        completionTokens: true
      },
      _count: true
    })

    const totalCost = await prisma.aIUsageLog.aggregate({
      where: {
        createdAt: { gte: startDate }
      },
      _sum: { cost: true }
    })

    // 일별 비용 추이
    const dailyCosts = await prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        SUM(cost) as cost,
        SUM(totalTokens) as tokens
      FROM AIUsageLog
      WHERE createdAt >= ${startDate.toISOString()}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT ${periodDays}
    `

    // 태그 사용 통계
    const tagStats = await prisma.videoTag.findMany({
      where: { usageCount: { gt: 0 } },
      orderBy: { usageCount: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        color: true,
        usageCount: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVideos,
          totalViews: totalViews._sum.views || 0,
          totalDownloads: totalDownloads._sum.downloads || 0,
          totalShares: totalShares._sum.shares || 0,
          successRate: successRate.toFixed(2),
          failureRate: failureRate.toFixed(2),
          avgProcessingTime: avgProcessingTime.toFixed(2)
        },
        statusDistribution: statusStats.map(s => ({
          status: s.status,
          count: s._count,
          percentage: totalVideos > 0 ? ((s._count / totalVideos) * 100).toFixed(2) : 0
        })),
        formatDistribution: formatStats.map(f => ({
          format: f.format,
          count: f._count,
          views: f._sum.views || 0,
          downloads: f._sum.downloads || 0,
          shares: f._sum.shares || 0
        })),
        styleDistribution: styleStats.map(s => ({
          style: s.style,
          count: s._count,
          views: s._sum.views || 0,
          downloads: s._sum.downloads || 0,
          shares: s._sum.shares || 0
        })),
        dailyTrends: dailyStats,
        popularTemplates,
        topPerformingVideos,
        aiUsage: {
          totalRequests: aiUsage._count,
          totalTokens: aiUsage._sum.totalTokens || 0,
          promptTokens: aiUsage._sum.promptTokens || 0,
          completionTokens: aiUsage._sum.completionTokens || 0,
          totalCost: totalCost._sum.cost || 0
        },
        dailyCosts,
        tagStats,
        period: {
          days: periodDays,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Error fetching video statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video statistics' },
      { status: 500 }
    )
  }
}
