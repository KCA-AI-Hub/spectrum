"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Globe,
  FileText,
  Users,
  Settings,
  Wrench,
  Home,
  Database,
  Activity,
  Shield,
  Bell,
  FileSearch,
  Video,
  Brain,
  Clock,
  TrendingUp
} from "lucide-react"

const navigation = [
  {
    name: "대시보드",
    href: "/admin",
    icon: Home,
    children: []
  },
  {
    name: "크롤링 관리",
    href: "/admin/crawling",
    icon: Globe,
    children: [
      { name: "소스 관리", href: "/admin/crawling/sources" },
      { name: "스케줄 관리", href: "/admin/crawling/schedules" },
      { name: "모니터링", href: "/admin/crawling/monitoring" },
      { name: "데이터 품질", href: "/admin/crawling/quality" }
    ]
  },
  {
    name: "콘텐츠 관리",
    href: "/admin/content",
    icon: FileText,
    children: [
      { name: "요약 관리", href: "/admin/content/summaries" },
      { name: "동영상 관리", href: "/admin/content/videos" },
      { name: "퀴즈 관리", href: "/admin/content/quizzes" },
      { name: "품질 검토", href: "/admin/content/quality" }
    ]
  },
  {
    name: "사용자 관리",
    href: "/admin/users",
    icon: Users,
    children: [
      { name: "계정 관리", href: "/admin/users/accounts" },
      { name: "권한 관리", href: "/admin/users/permissions" },
      { name: "활동 분석", href: "/admin/users/analytics" },
      { name: "통계", href: "/admin/users/statistics" }
    ]
  },
  {
    name: "시스템 관리",
    href: "/admin/system",
    icon: Settings,
    children: [
      { name: "성능 모니터링", href: "/admin/system/performance" },
      { name: "알림 설정", href: "/admin/system/notifications" },
      { name: "로그 관리", href: "/admin/system/logs" },
      { name: "설정", href: "/admin/system/settings" }
    ]
  },
  {
    name: "API 관리",
    href: "/admin/api",
    icon: Wrench,
    children: [
      { name: "OpenAI 설정", href: "/admin/api/openai" },
      { name: "fal.ai 설정", href: "/admin/api/falai" },
      { name: "외부 API 연동", href: "/admin/api/external" },
      { name: "API 사용량", href: "/admin/api/usage" }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Spectrum Admin</h1>
      </div>

      <nav className="mt-6 px-3">
        {navigation.map((item) => (
          <div key={item.name} className="mb-2">
            <Link
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>

            {item.children.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "block px-3 py-1 text-sm rounded-md transition-colors",
                      pathname === child.href
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}