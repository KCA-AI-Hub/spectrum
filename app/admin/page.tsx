import { StatsOverview } from "@/components/admin/dashboard/stats-overview"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          시스템 현황과 주요 지표를 실시간으로 확인하세요
        </p>
      </div>

      {/* System Overview Stats */}
      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity Summary */}
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Spectrum 관리자 대시보드',
  description: 'Spectrum 플랫폼 관리자 대시보드 - 크롤링, 콘텐츠, 사용자 관리',
}