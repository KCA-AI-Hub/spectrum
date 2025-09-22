"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NotificationProvider } from '@/components/common/utility/notification-center'
import { Toaster } from '@/components/ui/sonner'
import {
  CrawlingStatusCard,
  VideoGenerationCard,
  ActiveUsersCard,
  SystemResourceCard,
  CrawlingSuccessChart,
  ContentGenerationChart,
  CategoryDistributionChart,
  UserActivityChart,
  SystemMonitor
} from '@/components/demo/widgets'
import {
  DynamicForm,
  DataTable,
  SearchFilter,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  HelpTooltip
} from '@/components/common'
import { Home, ArrowLeft, Code, Palette, Database, Layout } from 'lucide-react'
import Link from 'next/link'

export default function ComponentsShowcasePage() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/demo">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    데모 홈으로
                  </Button>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="text-2xl font-bold">컴포넌트 쇼케이스</h1>
                  <p className="text-sm text-muted-foreground">
                    Spectrum에서 사용된 모든 UI 컴포넌트들의 데모
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Code className="h-3 w-3 mr-1" />
                  Demo
                </Badge>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    홈으로
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="widgets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="widgets" className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>위젯</span>
              </TabsTrigger>
              <TabsTrigger value="forms" className="flex items-center space-x-2">
                <Layout className="h-4 w-4" />
                <span>폼</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>데이터</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>피드백</span>
              </TabsTrigger>
            </TabsList>

            {/* 위젯 탭 */}
            <TabsContent value="widgets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>통계 카드 위젯</CardTitle>
                  <CardDescription>
                    시스템 현황을 표시하는 다양한 통계 카드들
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CrawlingStatusCard />
                    <VideoGenerationCard />
                    <ActiveUsersCard />
                    <SystemResourceCard />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>차트 위젯</CardTitle>
                  <CardDescription>
                    Recharts를 활용한 다양한 형태의 데이터 시각화
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CrawlingSuccessChart />
                    <ContentGenerationChart />
                    <CategoryDistributionChart />
                    <UserActivityChart />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>시스템 모니터</CardTitle>
                  <CardDescription>
                    실시간 시스템 리소스 및 서비스 상태 모니터링
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SystemMonitor />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 폼 탭 */}
            <TabsContent value="forms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>동적 폼 생성기</CardTitle>
                  <CardDescription>
                    React Hook Form + Zod를 활용한 유연한 폼 생성
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DynamicForm
                    sections={[
                      {
                        title: "기본 정보",
                        description: "사용자의 기본 정보를 입력해주세요",
                        fields: [
                          {
                            name: "name",
                            label: "이름",
                            type: "text",
                            placeholder: "홍길동",
                            required: true
                          },
                          {
                            name: "email",
                            label: "이메일",
                            type: "email",
                            placeholder: "hong@example.com",
                            required: true
                          },
                          {
                            name: "department",
                            label: "부서",
                            type: "select",
                            options: [
                              { label: "개발팀", value: "dev" },
                              { label: "기획팀", value: "planning" },
                              { label: "디자인팀", value: "design" }
                            ],
                            required: true
                          }
                        ]
                      }
                    ]}
                    onSubmit={(data) => {
                      console.log("폼 데이터:", data)
                      alert("폼이 제출되었습니다!")
                    }}
                    submitLabel="저장"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 데이터 탭 */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>고급 데이터 테이블</CardTitle>
                  <CardDescription>
                    정렬, 필터링, 페이징이 지원되는 데이터 테이블
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={[
                      {
                        id: "name",
                        header: "이름",
                        cell: ({ row }) => row.original.name
                      },
                      {
                        id: "email",
                        header: "이메일",
                        cell: ({ row }) => row.original.email
                      },
                      {
                        id: "status",
                        header: "상태",
                        cell: ({ row }) => (
                          <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
                            {row.original.status === 'active' ? '활성' : '비활성'}
                          </Badge>
                        )
                      }
                    ]}
                    data={[
                      { name: "홍길동", email: "hong@example.com", status: "active" },
                      { name: "김철수", email: "kim@example.com", status: "inactive" },
                      { name: "이영희", email: "lee@example.com", status: "active" }
                    ]}
                    searchKey="name"
                    searchPlaceholder="이름으로 검색..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>검색 및 필터</CardTitle>
                  <CardDescription>
                    고급 검색 옵션과 다중 필터 지원
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SearchFilter
                    searchPlaceholder="검색어를 입력하세요..."
                    filterOptions={[
                      {
                        key: "category",
                        label: "카테고리",
                        type: "select",
                        options: [
                          { label: "뉴스", value: "news" },
                          { label: "기술", value: "tech" },
                          { label: "경제", value: "economy" }
                        ]
                      },
                      {
                        key: "status",
                        label: "상태",
                        type: "multiselect",
                        options: [
                          { label: "활성", value: "active" },
                          { label: "비활성", value: "inactive" },
                          { label: "대기", value: "pending" }
                        ]
                      }
                    ]}
                    onSearch={(query) => console.log("검색:", query)}
                    onFiltersChange={(filters) => console.log("필터:", filters)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 피드백 탭 */}
            <TabsContent value="feedback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>로딩 상태</CardTitle>
                  <CardDescription>
                    다양한 로딩 상태 표시 컴포넌트들
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                  <Separator />
                  <div className="text-center">
                    <EmptyState
                      title="데이터가 없습니다"
                      description="표시할 항목이 없습니다. 새로운 항목을 추가해보세요."
                      action={{
                        label: "항목 추가",
                        onClick: () => alert("항목 추가 버튼 클릭!")
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>도움말 및 확인 다이얼로그</CardTitle>
                  <CardDescription>
                    사용자 친화적인 도움말과 확인 요청 컴포넌트들
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span>도움말이 필요한 기능</span>
                    <HelpTooltip content="이 기능은 사용자의 데이터를 안전하게 처리합니다." />
                  </div>

                  <ConfirmDialog
                    title="삭제 확인"
                    description="정말로 이 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                    onConfirm={() => alert("삭제되었습니다!")}
                    variant="destructive"
                  >
                    <Button variant="destructive">삭제하기</Button>
                  </ConfirmDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Toaster />
      </div>
    </NotificationProvider>
  )
}