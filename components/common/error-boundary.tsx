"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>오류가 발생했습니다</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorMessage({
  message,
  onRetry
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex h-32 items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  )
}