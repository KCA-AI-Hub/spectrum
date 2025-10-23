'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoProgressMonitorProps {
  videoId: string
  onComplete?: () => void
  onError?: (error: string) => void
}

interface ProcessingLog {
  id: string
  stage: string
  status: string
  message?: string
  duration?: number
  createdAt: string
}

interface VideoData {
  id: string
  title: string
  status: string
  errorMessage?: string
  processingLogs: ProcessingLog[]
  createdAt: string
  updatedAt: string
}

export function VideoProgressMonitor({ videoId, onComplete, onError }: VideoProgressMonitorProps) {
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchVideoStatus()

    // Poll every 2 seconds for updates
    const interval = setInterval(fetchVideoStatus, 2000)

    return () => clearInterval(interval)
  }, [videoId])

  useEffect(() => {
    if (videoData) {
      calculateProgress()
      if (videoData.status === 'COMPLETED' && onComplete) {
        onComplete()
      }
      if (videoData.status === 'FAILED' && onError && videoData.errorMessage) {
        onError(videoData.errorMessage)
      }
    }
  }, [videoData])

  const fetchVideoStatus = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video status')
      }

      const data = await response.json()
      setVideoData(data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching video status:', error)
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (!videoData) return

    const stages = [
      'initialization',
      'api_call',
      'file_download',
      'validation',
      'optimization',
      'thumbnail_generation',
      'completion'
    ]

    const completedStages = videoData.processingLogs.filter(
      log => log.status === 'completed'
    ).length

    const progressValue = (completedStages / stages.length) * 100
    setProgress(progressValue)

    // Estimate remaining time based on average stage duration
    if (videoData.status === 'GENERATING') {
      const avgDuration = videoData.processingLogs
        .filter(log => log.duration)
        .reduce((sum, log) => sum + (log.duration || 0), 0) / completedStages || 5000

      const remainingStages = stages.length - completedStages
      setEstimatedTime(Math.ceil((remainingStages * avgDuration) / 1000))
    }
  }

  const handleAction = async (action: 'cancel' | 'retry') => {
    try {
      setActionLoading(true)

      const response = await fetch(`/api/videos/${videoId}/manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} video`)
      }

      const data = await response.json()
      toast.success(data.message)
      fetchVideoStatus()
    } catch (error) {
      console.error(`Error ${action}ing video:`, error)
      toast.error(`동영상 ${action === 'cancel' ? '취소' : '재시작'}에 실패했습니다`)
    } finally {
      setActionLoading(false)
    }
  }

  const getStageLabel = (stage: string): string => {
    const labels: Record<string, string> = {
      initialization: '초기화',
      api_call: 'AI API 호출',
      file_download: '파일 다운로드',
      validation: '품질 검증',
      optimization: '최적화',
      thumbnail_generation: '썸네일 생성',
      thumbnail_download: '썸네일 다운로드',
      completion: '완료'
    }
    return labels[stage] || stage
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'started':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!videoData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">동영상 정보를 불러올 수 없습니다</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{videoData.title}</CardTitle>
            <CardDescription>
              동영상 생성 진행 상태
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {videoData.status === 'GENERATING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('cancel')}
                disabled={actionLoading}
              >
                <Pause className="w-4 h-4 mr-2" />
                중단
              </Button>
            )}
            {videoData.status === 'FAILED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('retry')}
                disabled={actionLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재시작
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">상태:</span>
            {videoData.status === 'PENDING' && (
              <Badge variant="secondary">
                <Loader2 className="w-3 h-3 mr-1" />
                대기 중
              </Badge>
            )}
            {videoData.status === 'GENERATING' && (
              <Badge variant="default">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                생성 중
              </Badge>
            )}
            {videoData.status === 'COMPLETED' && (
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                완료
              </Badge>
            )}
            {videoData.status === 'FAILED' && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                실패
              </Badge>
            )}
          </div>
          {estimatedTime && videoData.status === 'GENERATING' && (
            <span className="text-sm text-muted-foreground">
              예상 완료: 약 {estimatedTime}초
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {videoData.status === 'GENERATING' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">진행률</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error Message */}
        {videoData.status === 'FAILED' && videoData.errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">오류 발생</p>
                <p className="text-sm text-destructive/80 mt-1">{videoData.errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Logs */}
        <div>
          <h4 className="font-medium mb-3">처리 로그</h4>
          <ScrollArea className="h-[300px] rounded-lg border">
            <div className="p-4 space-y-3">
              {videoData.processingLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  아직 처리 로그가 없습니다
                </p>
              ) : (
                videoData.processingLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getStageLabel(log.stage)}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.status}
                        </Badge>
                      </div>
                      {log.message && (
                        <p className="text-muted-foreground mt-1">{log.message}</p>
                      )}
                      {log.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          소요 시간: {(log.duration / 1000).toFixed(2)}초
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString('ko-KR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
