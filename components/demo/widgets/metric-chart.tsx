"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { MoreHorizontal, TrendingUp, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

// 샘플 데이터
const crawlingData = [
  { time: '00:00', success: 45, failed: 5, total: 50 },
  { time: '04:00', success: 52, failed: 3, total: 55 },
  { time: '08:00', success: 78, failed: 7, total: 85 },
  { time: '12:00', success: 89, failed: 4, total: 93 },
  { time: '16:00', success: 95, failed: 2, total: 97 },
  { time: '20:00', success: 67, failed: 6, total: 73 },
]

const videoGenerationData = [
  { date: '1월', videos: 120, summaries: 450 },
  { date: '2월', videos: 145, summaries: 523 },
  { date: '3월', videos: 167, summaries: 578 },
  { date: '4월', videos: 189, summaries: 634 },
  { date: '5월', videos: 203, summaries: 689 },
  { date: '6월', videos: 234, summaries: 756 },
]

const categoryData = [
  { name: '뉴스', value: 35, color: '#3b82f6' },
  { name: '기술', value: 25, color: '#10b981' },
  { name: '경제', value: 20, color: '#f59e0b' },
  { name: '스포츠', value: 12, color: '#ef4444' },
  { name: '기타', value: 8, color: '#8b5cf6' },
]

const userActivityData = [
  { time: '09:00', users: 12 },
  { time: '10:00', users: 25 },
  { time: '11:00', users: 43 },
  { time: '12:00', users: 67 },
  { time: '13:00', users: 89 },
  { time: '14:00', users: 95 },
  { time: '15:00', users: 87 },
  { time: '16:00', users: 76 },
  { time: '17:00', users: 65 },
  { time: '18:00', users: 45 },
]

interface MetricChartProps {
  title: string
  description?: string
  type: 'line' | 'area' | 'bar' | 'pie'
  data: any[]
  className?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
}

export function MetricChart({
  title,
  description,
  type,
  data,
  className,
  height = 300,
  showLegend = true,
  showGrid = true
}: MetricChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="success"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444' }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey="videos" fill="#3b82f6" />
            <Bar dataKey="summaries" fill="#10b981" />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              내보내기
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              상세 분석
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// 미리 정의된 차트 컴포넌트들
export function CrawlingSuccessChart() {
  return (
    <MetricChart
      title="크롤링 성공률"
      description="24시간 크롤링 성공/실패 현황"
      type="line"
      data={crawlingData}
      className="col-span-2"
    />
  )
}

export function ContentGenerationChart() {
  return (
    <MetricChart
      title="콘텐츠 생성 통계"
      description="월별 동영상 및 요약 생성 현황"
      type="bar"
      data={videoGenerationData}
      className="col-span-2"
    />
  )
}

export function CategoryDistributionChart() {
  return (
    <MetricChart
      title="카테고리 분포"
      description="수집된 콘텐츠 카테고리별 분포"
      type="pie"
      data={categoryData}
      height={250}
    />
  )
}

export function UserActivityChart() {
  return (
    <MetricChart
      title="사용자 활동"
      description="실시간 사용자 활동 현황"
      type="area"
      data={userActivityData}
      height={200}
    />
  )
}