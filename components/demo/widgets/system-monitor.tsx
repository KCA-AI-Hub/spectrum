"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SystemMetric {
  id: string
  name: string
  value: number
  max: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  icon: React.ComponentType<{ className?: string }>
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'warning'
  uptime: string
  lastCheck: string
  responseTime?: number
}

const systemMetrics: SystemMetric[] = [
  {
    id: 'cpu',
    name: 'CPU 사용률',
    value: 45,
    max: 100,
    unit: '%',
    status: 'normal',
    icon: Cpu
  },
  {
    id: 'memory',
    name: '메모리 사용률',
    value: 78,
    max: 100,
    unit: '%',
    status: 'warning',
    icon: MemoryStick
  },
  {
    id: 'disk',
    name: '디스크 사용량',
    value: 234,
    max: 500,
    unit: 'GB',
    status: 'normal',
    icon: HardDrive
  },
  {
    id: 'network',
    name: '네트워크 사용률',
    value: 12,
    max: 100,
    unit: 'Mbps',
    status: 'normal',
    icon: Wifi
  }
]

const services: ServiceStatus[] = [
  {
    id: 'api',
    name: 'API 서버',
    status: 'online',
    uptime: '99.9%',
    lastCheck: '방금 전',
    responseTime: 85
  },
  {
    id: 'database',
    name: '데이터베이스',
    status: 'online',
    uptime: '99.8%',
    lastCheck: '1분 전',
    responseTime: 120
  },
  {
    id: 'crawler',
    name: '크롤러 서비스',
    status: 'warning',
    uptime: '98.2%',
    lastCheck: '2분 전',
    responseTime: 2300
  },
  {
    id: 'ai',
    name: 'AI 처리 서비스',
    status: 'online',
    uptime: '99.5%',
    lastCheck: '30초 전',
    responseTime: 450
  }
]

export function SystemMonitor() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const refreshData = async () => {
    setIsRefreshing(true)
    // 실제 구현에서는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdate(new Date())
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      online: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      offline: 'bg-red-100 text-red-800 border-red-200'
    }

    const labels = {
      online: '정상',
      warning: '경고',
      offline: '오프라인'
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getMetricColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'normal':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
    }
  }

  const getProgressColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'critical':
        return 'bg-red-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* System Resources */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>시스템 리소스</span>
            </CardTitle>
            <CardDescription>
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            새로고침
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemMetrics.map((metric) => {
              const Icon = metric.icon
              const percentage = (metric.value / metric.max) * 100

              return (
                <div key={metric.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <div className={cn("font-mono text-sm", getMetricColor(metric.status))}>
                      {metric.value}{metric.unit}
                      {metric.unit === '%' ? '' : ` / ${metric.max}${metric.unit}`}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>서비스 상태</span>
          </CardTitle>
          <CardDescription>
            전체 서비스의 상태 및 성능 모니터링
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={service.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.lastCheck} • 가동률 {service.uptime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {service.responseTime && (
                      <div className="text-sm text-muted-foreground">
                        {service.responseTime}ms
                      </div>
                    )}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                {index < services.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
          <CardDescription>
            시스템 관리를 위한 주요 작업들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              DB 백업
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              캐시 정리
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              로그 정리
            </Button>
            <Button variant="outline" size="sm">
              <Server className="h-4 w-4 mr-2" />
              서비스 재시작
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}