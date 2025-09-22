"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  progress?: {
    value: number
    max?: number
    label?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  progress,
  variant = 'default',
  className
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          iconBg: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
          changeColor: 'text-green-600 dark:text-green-400'
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
          changeColor: 'text-yellow-600 dark:text-yellow-400'
        }
      case 'error':
        return {
          iconBg: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
          changeColor: 'text-red-600 dark:text-red-400'
        }
      default:
        return {
          iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
          changeColor: 'text-blue-600 dark:text-blue-400'
        }
    }
  }

  const getChangeIcon = () => {
    if (!change) return null

    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeText = () => {
    if (!change) return null

    const sign = change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''
    const absValue = Math.abs(change.value)

    return `${sign}${absValue}%${change.period ? ` ${change.period}` : ''}`
  }

  const styles = getVariantStyles()

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("p-2 rounded-md", styles.iconBg)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className={cn(
                "flex items-center space-x-1 text-xs",
                change.type === 'increase' ? 'text-green-600' :
                change.type === 'decrease' ? 'text-red-600' : 'text-gray-600'
              )}>
                {getChangeIcon()}
                <span>{getChangeText()}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {/* Progress */}
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {progress.label || '진행률'}
                </span>
                <span className="font-medium">
                  {progress.value}/{progress.max || 100}
                </span>
              </div>
              <Progress
                value={(progress.value / (progress.max || 100)) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 미리 정의된 스탯 카드들
export function CrawlingStatusCard() {
  return (
    <StatCard
      title="크롤링 상태"
      value="24/26"
      icon={({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )}
      change={{ value: 8.2, type: 'increase', period: '지난 시간' }}
      description="활성 크롤링 소스"
      progress={{ value: 24, max: 26, label: '정상 동작' }}
      variant="success"
    />
  )
}

export function VideoGenerationCard() {
  return (
    <StatCard
      title="동영상 생성"
      value="156"
      icon={({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
      change={{ value: 12.5, type: 'increase', period: '오늘' }}
      description="생성된 동영상 수"
      variant="default"
    />
  )
}

export function ActiveUsersCard() {
  return (
    <StatCard
      title="활성 사용자"
      value="89"
      icon={({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v7h9zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm1.5 16h6v-6l-3-4c-.45-.63-1.2-1-2-1H5.5c-.8 0-1.54.37-2 1L1 19.5H3.5v2.5z"/>
        </svg>
      )}
      change={{ value: 2.1, type: 'decrease', period: '어제 대비' }}
      description="현재 접속 중"
      variant="warning"
    />
  )
}

export function SystemResourceCard() {
  return (
    <StatCard
      title="시스템 리소스"
      value="87%"
      icon={({ className }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
      )}
      description="CPU 사용률"
      progress={{ value: 87, max: 100, label: 'CPU 사용률' }}
      variant="warning"
    />
  )
}