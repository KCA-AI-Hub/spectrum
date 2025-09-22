"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Play,
  Bell,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Settings
} from "lucide-react"

const quickActions = [
  {
    title: "긴급 크롤링 실행",
    description: "우선순위 사이트 크롤링 시작",
    icon: Play,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    action: "crawl"
  },
  {
    title: "시스템 알림 발송",
    description: "전체 사용자에게 공지사항 발송",
    icon: Bell,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    action: "notify"
  },
  {
    title: "사용자 권한 관리",
    description: "사용자 권한 및 역할 설정",
    icon: UserPlus,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    action: "user-manage"
  },
  {
    title: "시스템 재시작",
    description: "서비스 재시작 및 캐시 초기화",
    icon: RefreshCw,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    action: "restart"
  },
  {
    title: "오류 로그 확인",
    description: "최근 시스템 오류 및 경고 확인",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700 hover:bg-red-200",
    action: "logs"
  },
  {
    title: "시스템 설정",
    description: "전역 설정 및 환경 변수 관리",
    icon: Settings,
    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    action: "settings"
  }
]

export function QuickActions() {
  const handleAction = (action: string) => {
    switch (action) {
      case "crawl":
        console.log("Starting emergency crawling...")
        break
      case "notify":
        console.log("Sending system notification...")
        break
      case "user-manage":
        console.log("Opening user management...")
        break
      case "restart":
        console.log("Restarting system...")
        break
      case "logs":
        console.log("Opening error logs...")
        break
      case "settings":
        console.log("Opening system settings...")
        break
      default:
        console.log("Unknown action:", action)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>빠른 액션</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className={`w-full justify-start h-auto p-4 ${action.color}`}
              onClick={() => handleAction(action.action)}
            >
              <div className="flex items-start gap-3">
                <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <div className="font-medium">주의사항</div>
              <div className="text-xs mt-1">
                시스템 재시작 및 긴급 작업은 신중하게 실행하세요.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}