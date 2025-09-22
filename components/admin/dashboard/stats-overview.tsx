"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Globe,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"

const stats = [
  {
    title: "크롤링 상태",
    value: "156/160",
    subtitle: "활성 소스",
    icon: Globe,
    trend: "up",
    trendValue: "+2.5%",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "동영상 생성",
    value: "23",
    subtitle: "오늘 생성됨",
    icon: FileText,
    trend: "up",
    trendValue: "+15%",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "활성 사용자",
    value: "89",
    subtitle: "현재 접속중",
    icon: Users,
    trend: "down",
    trendValue: "-5%",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "시스템 상태",
    value: "99.8%",
    subtitle: "가동률",
    icon: Activity,
    trend: "stable",
    trendValue: "0%",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
]

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {stat.subtitle}
              </p>
              <Badge
                variant={stat.trend === "up" ? "default" : stat.trend === "down" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                {stat.trend === "stable" && <Minus className="h-3 w-3 mr-1" />}
                {stat.trendValue}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}