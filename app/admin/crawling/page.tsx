"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Globe,
  Play,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useScrapingMetrics } from "@/lib/hooks/use-scraping"
import type { NewsSource } from "@/lib/types/news-source"

export default function CrawlingManagement() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const { metrics, loading: metricsLoading } = useScrapingMetrics()

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      setSourcesLoading(true)
      const response = await fetch('/api/news-sources')
      if (!response.ok) throw new Error('Failed to fetch sources')

      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setSourcesLoading(false)
    }
  }

  const activeSources = sources.filter(s => s.enabled).length
  const totalSources = sources.length
  const activeRate = totalSources > 0 ? (activeSources / totalSources) * 100 : 0

  const crawlingStats = [
    {
      label: "활성 소스",
      value: `${activeSources}/${totalSources}`,
      progress: activeRate,
      status: activeRate > 90 ? "good" : activeRate > 70 ? "normal" : "warning"
    },
    {
      label: "총 수집 기사",
      value: (metrics?.totalArticles ?? 0).toLocaleString(),
      progress: 78,
      status: "good"
    },
    {
      label: "성공률",
      value: `${(metrics?.successRate ?? 0).toFixed(1)}%`,
      progress: metrics?.successRate || 0,
      status: (metrics?.successRate || 0) > 90 ? "good" : "warning"
    },
    {
      label: "시간당 기사",
      value: (metrics?.articlesPerHour ?? 0).toFixed(0),
      progress: 65,
      status: "normal"
    }
  ]

  const recentSources = sources
    .sort((a, b) => {
      const aTime = a.lastCrawl ? new Date(a.lastCrawl).getTime() : 0
      const bTime = b.lastCrawl ? new Date(b.lastCrawl).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 4)

  const formatLastCrawl = (lastCrawl: Date | string | null | undefined): string => {
    if (!lastCrawl) return "없음"

    const date = typeof lastCrawl === 'string' ? new Date(lastCrawl) : lastCrawl
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}시간 전`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}일 전`
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">크롤링 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            웹 크롤링 소스와 작업을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/crawling/search">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              키워드 검색
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsLoading || sourcesLoading ? (
          <div className="col-span-4 flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          crawlingStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Badge variant={stat.status === "good" ? "default" : stat.status === "warning" ? "secondary" : "outline"}>
                    {stat.status === "good" ? "양호" : stat.status === "warning" ? "주의" : "정상"}
                  </Badge>
                </div>
                <div className="text-xl font-bold mb-2">{stat.value}</div>
                <Progress value={stat.progress} className="h-2" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/crawling/jobs">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Play className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-medium mb-2">스크래핑 작업</h3>
              <p className="text-sm text-muted-foreground">뉴스 스크래핑 실행</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/sources">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 mx-auto mb-3 text-chart-1" />
              <h3 className="font-medium mb-2">소스 관리</h3>
              <p className="text-sm text-muted-foreground">크롤링 대상 사이트 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/search">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto mb-3 text-chart-2" />
              <h3 className="font-medium mb-2">키워드 검색</h3>
              <p className="text-sm text-muted-foreground">키워드로 뉴스 검색</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/history">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-chart-3" />
              <h3 className="font-medium mb-2">검색 기록</h3>
              <p className="text-sm text-muted-foreground">스크래핑 기록 조회</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Crawling Activity */}
      <Card>
        <CardHeader>
          <CardTitle>최근 크롤링 활동</CardTitle>
        </CardHeader>
        <CardContent>
          {sourcesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              최근 크롤링 활동이 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              {recentSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {source.status === "active" && <CheckCircle className="h-5 w-5 text-chart-2" />}
                      {source.status === "inactive" && <XCircle className="h-5 w-5 text-muted-foreground" />}
                      {source.status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                      <span className="font-medium">{source.name}</span>
                    </div>
                    <Badge variant={
                      source.status === "active" ? "default" :
                      source.status === "inactive" ? "secondary" :
                      "destructive"
                    }>
                      {source.status === "active" ? "활성" :
                       source.status === "inactive" ? "비활성" :
                       "오류"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>수집: {source.itemsCollected.toLocaleString()}</span>
                    <span>성공률: {source.successRate}%</span>
                    <span>마지막: {formatLastCrawl(source.lastCrawl)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}