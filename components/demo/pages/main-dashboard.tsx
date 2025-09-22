"use client"

import React from 'react'
import { AdminLayout } from '../layout/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CrawlingStatusCard,
  VideoGenerationCard,
  ActiveUsersCard,
  SystemResourceCard
} from '../widgets/stat-card'
import {
  CrawlingSuccessChart,
  ContentGenerationChart,
  CategoryDistributionChart,
  UserActivityChart
} from '../widgets/metric-chart'
import { SystemMonitor } from '../widgets/system-monitor'
import {
  Zap,
  AlertTriangle,
  Users,
  FileText,
  Video,
  Bell,
  Calendar,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 최근 활동 데이터
const recentActivities = [
  {
    id: '1',
    type: 'crawling',
    title: '뉴스 소스 크롤링 완료',
    description: '조선일보에서 125개 기사 수집',
    time: '2분 전',
    status: 'success'
  },
  {
    id: '2',
    type: 'video',
    title: '동영상 생성 완료',
    description: '경제 뉴스 요약 영상 3개 생성',
    time: '5분 전',
    status: 'success'
  },
  {
    id: '3',
    type: 'error',
    title: '크롤링 오류 발생',
    description: 'CNN 소스에서 접근 제한 오류',
    time: '8분 전',
    status: 'error'
  },
  {
    id: '4',
    type: 'user',
    title: '신규 사용자 등록',
    description: '홍길동(emp001) 계정 생성',
    time: '12분 전',
    status: 'info'
  },
  {
    id: '5',
    type: 'system',
    title: '시스템 백업 완료',
    description: '일일 자동 백업 성공적으로 완료',
    time: '1시간 전',
    status: 'success'
  }
]

// 빠른 액션 버튼들
const quickActions = [
  {
    id: 'emergency-crawl',
    title: '긴급 크롤링',
    description: '중요 소스 즉시 크롤링',
    icon: Zap,
    color: 'bg-red-100 text-red-600 hover:bg-red-200'
  },
  {
    id: 'send-notification',
    title: '시스템 알림',
    description: '전체 사용자에게 알림 발송',
    icon: Bell,
    color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
  },
  {
    id: 'user-management',
    title: '사용자 관리',
    description: '권한 및 계정 관리',
    icon: Users,
    color: 'bg-green-100 text-green-600 hover:bg-green-200'
  },
  {
    id: 'schedule-task',
    title: '작업 스케줄',
    description: '크롤링 일정 관리',
    icon: Calendar,
    color: 'bg-purple-100 text-purple-600 hover:bg-purple-200'
  }
]

function getActivityIcon(type: string) {
  switch (type) {
    case 'crawling':
      return <Activity className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    case 'user':
      return <Users className="h-4 w-4" />
    case 'error':
      return <AlertTriangle className="h-4 w-4" />
    case 'system':
      return <FileText className="h-4 w-4" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function getActivityColor(status: string) {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-100'
    case 'error':
      return 'text-red-600 bg-red-100'
    case 'warning':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-blue-600 bg-blue-100'
  }
}

export function MainDashboard() {
  return (
    <AdminLayout
      title="관리자 대시보드"
      breadcrumbs={[{ label: '대시보드' }]}
    >
      <div className="space-y-6">
        {/* 시스템 현황 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CrawlingStatusCard />
          <VideoGenerationCard />
          <ActiveUsersCard />
          <SystemResourceCard />
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>빠른 액션</span>
            </CardTitle>
            <CardDescription>
              자주 사용하는 관리 작업을 빠르게 실행할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2"
                  >
                    <div className={cn("p-2 rounded-md", action.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CrawlingSuccessChart />
            <ContentGenerationChart />
          </div>
          <div className="space-y-6">
            <CategoryDistributionChart />
            <UserActivityChart />
          </div>
        </div>

        {/* 최근 활동과 시스템 모니터링 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 최근 활동 */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>최근 활동</span>
              </CardTitle>
              <Button variant="ghost" size="sm">
                <span className="text-sm">전체 보기</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-1 rounded-full",
                      getActivityColor(activity.status)
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                  {index < recentActivities.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 시스템 모니터링 */}
          <div className="lg:col-span-2">
            <SystemMonitor />
          </div>
        </div>

        {/* 알림 및 이슈 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>주의사항 및 알림</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">
                      메모리 사용률 증가
                    </div>
                    <div className="text-sm text-yellow-600">
                      메모리 사용률이 78%에 도달했습니다. 모니터링이 필요합니다.
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  경고
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">
                      정기 백업 예정
                    </div>
                    <div className="text-sm text-blue-600">
                      오늘 자정에 시스템 정기 백업이 예정되어 있습니다.
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  정보
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}