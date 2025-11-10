"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  FileText,
  Globe,
  Home,
  Search,
  Brain,
  Video,
  Settings,
} from "lucide-react"

const navigation = [
  {
    name: "대시보드",
    href: "/admin",
    icon: Home,
  },
  {
    name: "소스 관리",
    href: "/admin/sources",
    icon: Settings,
  },
  {
    name: "크롤링 관리",
    href: "/admin/search",
    icon: Search,
  },
  {
    name: "AI 요약 관리",
    href: "/admin/summaries",
    icon: Brain,
  },
  {
    name: "동영상 관리",
    href: "/admin/videos",
    icon: Video,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-sidebar-foreground">Spectrum</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-muted"></div>
          <div className="text-sm text-sidebar-foreground">
            <div className="font-medium">관리자</div>
            <div className="text-xs text-muted-foreground">admin@spectrum.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}