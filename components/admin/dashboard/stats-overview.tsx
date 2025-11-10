"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Globe, FileText, Video, Users, RefreshCw } from "lucide-react"
import { useRealTime } from "@/components/providers/real-time-provider"

export function StatsOverview() {
  const { data, isLoading, refreshData } = useRealTime()

  const stats = [
    {
      title: "총 크롤링 사이트",
      value: data.stats.totalSites.toString(),
      change: "+2",
      changeType: "increase" as const,
      icon: Globe,
    },
    {
      title: "수집된 기사",
      value: data.stats.totalArticles.toLocaleString(),
      change: "+18%",
      changeType: "increase" as const,
      icon: FileText,
    },
    {
      title: "생성된 동영상",
      value: data.stats.totalVideos.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: Video,
    },
    {
      title: "활성 사용자",
      value: data.stats.activeUsers.toString(),
      change: "-2%",
      changeType: "decrease" as const,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">시스템 현황</h2>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            마지막 업데이트: {data.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === "increase" ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-chart-2" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span
                  className={
                    stat.changeType === "increase"
                      ? "text-chart-2"
                      : "text-destructive"
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1">지난 주 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}