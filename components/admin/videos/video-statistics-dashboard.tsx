'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Tag,
  Film
} from 'lucide-react'

interface StatisticsData {
  overview: {
    totalVideos: number
    totalViews: number
    totalDownloads: number
    totalShares: number
    successRate: string
    failureRate: string
    avgProcessingTime: string
  }
  statusDistribution: Array<{ status: string; count: number; percentage: string }>
  formatDistribution: Array<{ format: string; count: number; views: number; downloads: number; shares: number }>
  styleDistribution: Array<{ style: string; count: number; views: number; downloads: number; shares: number }>
  popularTemplates: Array<{ id: string; name: string; style: string; usageCount: number }>
  topPerformingVideos: Array<{ id: string; title: string; views: number; downloads: number; shares: number; format: string; style: string }>
  aiUsage: {
    totalRequests: number
    totalTokens: number
    totalCost: number
  }
  tagStats: Array<{ id: string; name: string; color?: string; usageCount: number }>
}

export function VideoStatisticsDashboard() {
  const [stats, setStats] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchStatistics()
  }, [period])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/videos/statistics?period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch statistics')

      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">통계를 불러올 수 없습니다</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'text-green-600',
      FAILED: 'text-red-600',
      GENERATING: 'text-blue-600',
      PENDING: 'text-yellow-600',
      CANCELLED: 'text-gray-600'
    }
    return colors[status] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">동영상 분석 대시보드</h2>
          <p className="text-muted-foreground mt-1">
            동영상 생성 및 성능 통계
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="90">최근 90일</SelectItem>
            <SelectItem value="365">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 동영상</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalVideos.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {stats.overview.successRate}%
              </Badge>
              <Badge variant="outline" className="text-red-600">
                <XCircle className="w-3 h-3 mr-1" />
                {stats.overview.failureRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              평균 {stats.overview.totalVideos > 0 ? Math.round(stats.overview.totalViews / stats.overview.totalVideos).toLocaleString() : 0} 조회/영상
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 다운로드</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              총 공유 {stats.overview.totalShares.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 처리 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgProcessingTime}초</div>
            <p className="text-xs text-muted-foreground mt-2">
              완료된 동영상 기준
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>상태별 분포</CardTitle>
            <CardDescription>동영상 생성 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'COMPLETED' ? 'bg-green-500' :
                      item.status === 'FAILED' ? 'bg-red-500' :
                      item.status === 'GENERATING' ? 'bg-blue-500' :
                      item.status === 'PENDING' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Format Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>포맷별 통계</CardTitle>
            <CardDescription>포맷별 생성 및 성능</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.formatDistribution.map((item) => (
                <div key={item.format} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.format}</span>
                    <Badge variant="outline">{item.count}개</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {item.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {item.shares}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Style Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>스타일별 인기도</CardTitle>
            <CardDescription>스타일별 사용 빈도</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.styleDistribution.slice(0, 5).map((item, index) => (
                <div key={item.style} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm font-medium">{item.style}</span>
                    </div>
                    <Badge>{item.count}개</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{item.views.toLocaleString()} 조회</span>
                    <span>{item.downloads} 다운로드</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Usage & Cost */}
        <Card>
          <CardHeader>
            <CardTitle>AI 사용량 및 비용</CardTitle>
            <CardDescription>최근 {period}일</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">총 요청</span>
                  <span className="text-2xl font-bold">{stats.aiUsage.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">총 토큰</span>
                  <span className="text-lg font-semibold">{stats.aiUsage.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    총 비용
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    ${stats.aiUsage.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Templates */}
      <Card>
        <CardHeader>
          <CardTitle>인기 템플릿</CardTitle>
          <CardDescription>가장 많이 사용된 템플릿</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {stats.popularTemplates.slice(0, 5).map((template, index) => (
              <Card key={template.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm truncate">{template.name}</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{template.style}</Badge>
                      <span className="text-sm font-medium">{template.usageCount}회</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Videos */}
      <Card>
        <CardHeader>
          <CardTitle>최고 성과 동영상</CardTitle>
          <CardDescription>조회수 기준 상위 동영상</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topPerformingVideos.slice(0, 5).map((video, index) => (
              <div key={video.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.title}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {video.downloads}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {video.shares}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{video.format}</Badge>
                  <Badge variant="secondary">{video.style}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Statistics */}
      {stats.tagStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>인기 태그</CardTitle>
            <CardDescription>가장 많이 사용된 태그</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.tagStats.slice(0, 20).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="px-3 py-1"
                  style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                  <span className="ml-2 text-xs opacity-70">({tag.usageCount})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
