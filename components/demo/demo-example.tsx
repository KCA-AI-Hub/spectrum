"use client"

import React from 'react'
import { MainDashboard } from './pages/main-dashboard'
import { NotificationProvider } from '@/components/common/utility/notification-center'
import { Toaster } from '@/components/ui/sonner'

/**
 * Spectrum 관리자 대시보드 데모 페이지
 *
 * 이 컴포넌트는 admin-ui-plan.md를 기반으로 구현된 데모 페이지입니다.
 *
 * 포함된 기능:
 * - 관리자 레이아웃 (사이드바, 헤더, 브레드크럼)
 * - 실시간 시스템 모니터링
 * - 크롤링 상태 및 성과 지표
 * - 동영상 생성 현황
 * - 사용자 활동 통계
 * - 차트 및 그래프 시각화
 * - 알림 센터
 * - 빠른 액션 버튼들
 *
 * 사용법:
 * ```tsx
 * import { AdminDashboardDemo } from '@/components/demo'
 *
 * export default function AdminPage() {
 *   return <AdminDashboardDemo />
 * }
 * ```
 */
export function AdminDashboardDemo() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <MainDashboard />
        <Toaster />
      </div>
    </NotificationProvider>
  )
}

// 개별 컴포넌트 데모
export function LayoutDemo() {
  const { AdminLayout, Sidebar, Header } = require('./layout')

  return (
    <div className="min-h-screen bg-background">
      <p className="p-8 text-center text-muted-foreground">
        레이아웃 컴포넌트 데모 - AdminLayout, Sidebar, Header 개별 테스트용
      </p>
    </div>
  )
}

export function WidgetsDemo() {
  const {
    CrawlingStatusCard,
    VideoGenerationCard,
    ActiveUsersCard,
    SystemResourceCard,
    CrawlingSuccessChart,
    ContentGenerationChart,
    CategoryDistributionChart,
    UserActivityChart,
    SystemMonitor
  } = require('./widgets')

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">위젯 데모</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CrawlingStatusCard />
        <VideoGenerationCard />
        <ActiveUsersCard />
        <SystemResourceCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrawlingSuccessChart />
        <ContentGenerationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart />
        <UserActivityChart />
      </div>

      <SystemMonitor />
    </div>
  )
}

export default AdminDashboardDemo