"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  X,
  Info,
  AlertTriangle
} from "lucide-react"

interface ErrorInfo {
  id: string
  type: "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  retryable: boolean
  context?: string
}

interface ErrorHandlerProps {
  errors: ErrorInfo[]
  onRetry?: (errorId: string) => void
  onDismiss?: (errorId: string) => void
  onClearAll?: () => void
}

export function ErrorHandler({ 
  errors, 
  onRetry, 
  onDismiss, 
  onClearAll 
}: ErrorHandlerProps) {
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set())

  const handleDismiss = (errorId: string) => {
    setDismissedErrors(prev => new Set([...prev, errorId]))
    onDismiss?.(errorId)
  }

  const handleRetry = (errorId: string) => {
    onRetry?.(errorId)
  }

  const getErrorIcon = (type: ErrorInfo["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getErrorColor = (type: ErrorInfo["type"]) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const activeErrors = errors.filter(error => !dismissedErrors.has(error.id))

  if (activeErrors.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">시스템 알림</h3>
        {activeErrors.length > 1 && (
          <Button variant="outline" size="sm" onClick={onClearAll}>
            모두 지우기
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {activeErrors.map((error) => (
          <Alert key={error.id} className={getErrorColor(error.type)}>
            <div className="flex items-start gap-3">
              {getErrorIcon(error.type)}
              <div className="flex-1">
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{error.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {error.timestamp.toLocaleTimeString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(error.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{error.message}</p>
                    {error.context && (
                      <p className="text-xs text-muted-foreground">
                        컨텍스트: {error.context}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </div>
              {error.retryable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(error.id)}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  재시도
                </Button>
              )}
            </div>
          </Alert>
        ))}
      </div>
    </div>
  )
}

// 진행 상태 표시 컴포넌트
interface ProgressStatusProps {
  status: "idle" | "processing" | "completed" | "error"
  progress?: number
  message?: string
  estimatedTime?: number
}

export function ProgressStatus({ 
  status, 
  progress = 0, 
  message, 
  estimatedTime 
}: ProgressStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "border-blue-200 bg-blue-50"
      case "completed":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <Card className={getStatusColor()}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {status === "processing" && "분석 진행 중"}
                {status === "completed" && "분석 완료"}
                {status === "error" && "분석 오류"}
                {status === "idle" && "대기 중"}
              </span>
              {status === "processing" && estimatedTime && (
                <Badge variant="outline">
                  약 {estimatedTime}분 남음
                </Badge>
              )}
            </div>
            
            {message && (
              <p className="text-sm text-muted-foreground mb-2">{message}</p>
            )}
            
            {status === "processing" && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress}% 완료</span>
                  <span>{estimatedTime ? `약 ${estimatedTime}분 남음` : "처리 중..."}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 시스템 상태 표시 컴포넌트
interface SystemStatusProps {
  aiServiceStatus: "online" | "offline" | "degraded"
  apiKeyStatus: "valid" | "invalid" | "expired"
  lastCheck: Date
}

export function SystemStatus({ 
  aiServiceStatus, 
  apiKeyStatus, 
  lastCheck 
}: SystemStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "valid":
        return "text-green-600"
      case "offline":
      case "invalid":
      case "expired":
        return "text-red-600"
      case "degraded":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
      case "invalid":
      case "expired":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">시스템 상태</CardTitle>
        <CardDescription>
          AI 서비스 연결 상태 및 API 상태
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(aiServiceStatus)}
            <span className="font-medium">AI 서비스</span>
          </div>
          <Badge 
            variant="outline" 
            className={getStatusColor(aiServiceStatus)}
          >
            {aiServiceStatus === "online" && "정상"}
            {aiServiceStatus === "offline" && "오프라인"}
            {aiServiceStatus === "degraded" && "성능 저하"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(apiKeyStatus)}
            <span className="font-medium">API 키</span>
          </div>
          <Badge 
            variant="outline" 
            className={getStatusColor(apiKeyStatus)}
          >
            {apiKeyStatus === "valid" && "유효"}
            {apiKeyStatus === "invalid" && "무효"}
            {apiKeyStatus === "expired" && "만료"}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          마지막 확인: {lastCheck.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
