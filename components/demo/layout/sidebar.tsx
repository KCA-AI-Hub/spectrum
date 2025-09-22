"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  BarChart3,
  Globe,
  FileText,
  Users,
  Settings,
  Wrench,
  Home,
  ChevronDown,
  ChevronRight,
  Monitor,
  Calendar,
  Activity,
  Database,
  Video,
  BookOpen,
  UserCheck,
  Shield,
  TrendingUp,
  Bell,
  FileBarChart,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string | number
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: Home,
    href: '/admin',
  },
  {
    id: 'crawling',
    label: '크롤링 관리',
    icon: Globe,
    children: [
      { id: 'sources', label: '소스 관리', icon: Database, href: '/admin/crawling/sources' },
      { id: 'schedule', label: '스케줄 관리', icon: Calendar, href: '/admin/crawling/schedule' },
      { id: 'monitoring', label: '모니터링', icon: Monitor, href: '/admin/crawling/monitoring' },
      { id: 'quality', label: '데이터 품질', icon: Activity, href: '/admin/crawling/quality', badge: '3' },
    ],
  },
  {
    id: 'content',
    label: '콘텐츠 관리',
    icon: FileText,
    children: [
      { id: 'summary', label: '요약 관리', icon: BookOpen, href: '/admin/content/summary' },
      { id: 'video', label: '동영상 관리', icon: Video, href: '/admin/content/video' },
      { id: 'quiz', label: '퀴즈 관리', icon: FileBarChart, href: '/admin/content/quiz' },
      { id: 'review', label: '품질 검토', icon: UserCheck, href: '/admin/content/review', badge: 'New' },
    ],
  },
  {
    id: 'users',
    label: '사용자 관리',
    icon: Users,
    children: [
      { id: 'accounts', label: '계정 관리', icon: Users, href: '/admin/users/accounts' },
      { id: 'permissions', label: '권한 관리', icon: Shield, href: '/admin/users/permissions' },
      { id: 'analytics', label: '활동 분석', icon: TrendingUp, href: '/admin/users/analytics' },
      { id: 'stats', label: '통계', icon: BarChart3, href: '/admin/users/stats' },
    ],
  },
  {
    id: 'system',
    label: '시스템 관리',
    icon: Settings,
    children: [
      { id: 'performance', label: '성능 모니터링', icon: Activity, href: '/admin/system/performance' },
      { id: 'alerts', label: '알림 설정', icon: Bell, href: '/admin/system/alerts' },
      { id: 'logs', label: '로그 관리', icon: FileText, href: '/admin/system/logs' },
      { id: 'config', label: '설정', icon: Settings, href: '/admin/system/config' },
    ],
  },
  {
    id: 'api',
    label: 'API 관리',
    icon: Wrench,
    children: [
      { id: 'openai', label: 'OpenAI 설정', icon: Zap, href: '/admin/api/openai' },
      { id: 'fal', label: 'fal.ai 설정', icon: Video, href: '/admin/api/fal' },
      { id: 'external', label: '외부 API 연동', icon: Wrench, href: '/admin/api/external' },
      { id: 'usage', label: 'API 사용량', icon: BarChart3, href: '/admin/api/usage' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  className?: string
}

export function Sidebar({ collapsed, onCollapsedChange, className }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard'])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={!collapsed && isExpanded}
          onOpenChange={() => !collapsed && toggleExpanded(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-2 px-3",
                level > 0 && "pl-8",
                collapsed && "px-2 justify-center"
              )}
              onClick={() => collapsed && onCollapsedChange(false)}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!collapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      )
    }

    return (
      <Button
        key={item.id}
        variant="ghost"
        className={cn(
          "w-full justify-start h-auto py-2 px-3",
          level > 0 && "pl-8",
          collapsed && "px-2 justify-center"
        )}
        asChild
      >
        <a href={item.href}>
          <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </a>
      </Button>
    )
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 z-50 h-full bg-background border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo */}
      <div className="p-4 border-b">
        {collapsed ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">Spectrum</h2>
              <p className="text-xs text-muted-foreground">관리자 대시보드</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn("w-full", collapsed && "px-2")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2 rotate-180" />
              <span>접기</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}