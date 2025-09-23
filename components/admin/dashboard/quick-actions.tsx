"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Plus, Play, FileText, Video, Users } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    title: "새 크롤링 시작",
    description: "새로운 웹사이트 크롤링 작업을 시작합니다",
    icon: Plus,
    href: "/admin/crawling",
    variant: "default" as const,
  },
  {
    title: "콘텐츠 분석 실행",
    description: "수집된 데이터의 AI 분석을 시작합니다",
    icon: Play,
    href: "/admin/content",
    variant: "outline" as const,
  },
  {
    title: "동영상 생성",
    description: "분석된 콘텐츠로 숏폼 동영상을 생성합니다",
    icon: Video,
    href: "/admin/content",
    variant: "outline" as const,
  },
  {
    title: "사용자 관리",
    description: "시스템 사용자를 관리합니다",
    icon: Users,
    href: "/admin/users",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>빠른 작업</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TooltipProvider>
            {quickActions.map((action) => (
              <Tooltip key={action.title}>
                <TooltipTrigger asChild>
                  <Link href={action.href}>
                    <Button
                      variant={action.variant}
                      className="h-auto w-full p-3 text-left justify-start"
                      size="sm"
                    >
                      <div className="flex items-center space-x-2 w-full min-w-0">
                        <action.icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-medium text-sm truncate">{action.title}</div>
                          <div className="text-xs text-muted-foreground truncate leading-tight">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}