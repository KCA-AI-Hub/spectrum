"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Globe,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react"

const recentActivities = [
  {
    id: 1,
    type: "crawling",
    title: "뉴스 사이트 크롤링 완료",
    description: "연합뉴스, 조선일보 등 5개 사이트에서 123개 기사 수집",
    timestamp: "2분 전",
    status: "success",
    icon: Globe
  },
  {
    id: 2,
    type: "video",
    title: "동영상 생성 완료",
    description: "AI 기술 트렌드 요약 영상 3개 생성 완료",
    timestamp: "15분 전",
    status: "success",
    icon: FileText
  },
  {
    id: 3,
    type: "user",
    title: "새 사용자 등록",
    description: "김철수 (사번: EMP001234) 계정 생성",
    timestamp: "23분 전",
    status: "info",
    icon: Users
  },
  {
    id: 4,
    type: "crawling",
    title: "크롤링 작업 실패",
    description: "소셜 미디어 API 호출 한도 초과로 인한 실패",
    timestamp: "35분 전",
    status: "error",
    icon: Globe
  },
  {
    id: 5,
    type: "video",
    title: "동영상 품질 검토 완료",
    description: "오늘 생성된 23개 영상 중 22개 품질 검증 통과",
    timestamp: "1시간 전",
    status: "success",
    icon: FileText
  },
  {
    id: 6,
    type: "user",
    title: "사용자 권한 변경",
    description: "이영희 사용자를 관리자 권한으로 승격",
    timestamp: "2시간 전",
    status: "info",
    icon: Users
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    default:
      return <Clock className="h-4 w-4 text-blue-600" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "success":
      return <Badge className="bg-green-100 text-green-800">완료</Badge>
    case "error":
      return <Badge variant="destructive">실패</Badge>
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-800">경고</Badge>
    default:
      return <Badge variant="secondary">진행중</Badge>
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            최근 활동
          </CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            전체 로그 보기
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-100">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {getStatusIcon(activity.status)}
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-sm">
            더 많은 활동 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}