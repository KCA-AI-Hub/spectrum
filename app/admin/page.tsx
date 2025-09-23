"use client"

import { StatsOverview } from "@/components/admin/dashboard/stats-overview"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { DashboardSettings } from "@/components/admin/dashboard/dashboard-settings"
import { useDashboardSettings } from "@/components/providers/dashboard-settings-provider"

function DashboardContent() {
  const { settings } = useDashboardSettings()

  const renderWidget = (widgetType: string) => {
    type WidgetType = 'stats' | 'quick-actions' | 'recent-activity'
    if (settings.hiddenWidgets.includes(widgetType as WidgetType)) {
      return null
    }

    switch (widgetType) {
      case 'stats':
        return <StatsOverview key="stats" />
      case 'quick-actions':
        return (
          <div key="quick-actions" className="lg:col-span-1">
            <QuickActions />
          </div>
        )
      case 'recent-activity':
        return (
          <div key="recent-activity" className="lg:col-span-1">
            <RecentActivity />
          </div>
        )
      default:
        return null
    }
  }

  const visibleWidgets = settings.widgetOrder.filter(
    widget => !settings.hiddenWidgets.includes(widget)
  )

  const statsWidget = visibleWidgets.includes('stats') ? renderWidget('stats') : null
  const otherWidgets = visibleWidgets.filter(w => w !== 'stats').map(renderWidget).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            시스템 현황과 주요 지표를 실시간으로 확인하세요
          </p>
        </div>
        <DashboardSettings />
      </div>

      {/* Stats Widget (always full width) */}
      {statsWidget}

      {/* Other Widgets in Grid */}
      {otherWidgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {otherWidgets}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  return <DashboardContent />
}