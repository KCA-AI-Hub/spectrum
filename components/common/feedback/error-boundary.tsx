"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertTriangle, RefreshCw, ChevronDown, Copy, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  className?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

export interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  resetError: () => void
  eventId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      eventId: Math.random().toString(36).substring(2, 15)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }

    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || []
      const hasResetKeyChanged = resetKeys.some((key, index) => key !== prevResetKeys[index])

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      })
    }, 0)
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }
  }

  render() {
    const { hasError, error, errorInfo, eventId } = this.state
    const { children, fallback: Fallback, className } = this.props

    if (hasError) {
      if (Fallback) {
        return (
          <div className={className}>
            <Fallback
              error={error}
              errorInfo={errorInfo}
              resetError={this.resetErrorBoundary}
              eventId={eventId}
            />
          </div>
        )
      }

      return (
        <div className={className}>
          <DefaultErrorFallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetErrorBoundary}
            eventId={eventId}
          />
        </div>
      )
    }

    return children
  }
}

// Default error fallback component
export function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  eventId
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  const copyErrorToClipboard = () => {
    const errorDetails = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace available'}
Component Stack: ${errorInfo?.componentStack || 'No component stack available'}
Event ID: ${eventId || 'N/A'}
Timestamp: ${new Date().toISOString()}
`.trim()

    navigator.clipboard.writeText(errorDetails).then(() => {
      // Could show a toast notification here
    })
  }

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {error?.message || 'Unknown error occurred'}
                </p>
                {eventId && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Error ID:</span>
                    <Badge variant="outline" className="font-mono">
                      {eventId}
                    </Badge>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={reloadPage} variant="outline" className="flex-1">
              Reload Page
            </Button>
            <Button onClick={copyErrorToClipboard} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Error
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">Stack Trace:</h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                    {error?.stack || 'No stack trace available'}
                  </pre>
                </div>
                {errorInfo?.componentStack && (
                  <div className="text-sm">
                    <h4 className="font-semibold mb-2">Component Stack:</h4>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Minimal error fallback for smaller components
export function MinimalErrorFallback({
  error,
  resetError,
  className
}: {
  error: Error | null
  resetError: () => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 space-y-2", className)}>
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-center text-muted-foreground">
        {error?.message || 'Something went wrong'}
      </p>
      <Button onClick={resetError} size="sm" variant="outline">
        <RefreshCw className="mr-1 h-3 w-3" />
        Retry
      </Button>
    </div>
  )
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}