'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileArchive,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface Video {
  id: string
  title: string
  fileSize?: number
  status: string
}

interface BatchDownloadDialogProps {
  videos: Video[]
  children?: React.ReactNode
}

export function BatchDownloadDialog({
  videos,
  children
}: BatchDownloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Filter only completed videos
  const completedVideos = videos.filter(v => v.status === 'COMPLETED')

  const toggleVideo = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const toggleAll = () => {
    if (selectedVideos.length === completedVideos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(completedVideos.map(v => v.id))
    }
  }

  const handleBatchDownload = async () => {
    if (selectedVideos.length === 0) {
      toast.error('다운로드할 동영상을 선택해주세요')
      return
    }

    try {
      setLoading(true)
      setProgress(10)

      const response = await fetch('/api/videos/batch/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoIds: selectedVideos,
          format: 'zip',
          includeMetadata: true
        })
      })

      setProgress(50)

      if (!response.ok) {
        throw new Error('Failed to create batch download')
      }

      const data = await response.json()

      if (data.success) {
        setJobId(data.data.id)
        setDownloadUrl(data.data.downloadUrl)
        setProgress(100)

        toast.success('일괄 다운로드 준비가 완료되었습니다')

        // Auto-download after a short delay
        setTimeout(() => {
          if (data.data.downloadUrl) {
            const link = document.createElement('a')
            link.href = data.data.downloadUrl
            link.download = `videos-${data.data.id}.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
        }, 1000)
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error('Error creating batch download:', error)
      toast.error('일괄 다운로드에 실패했습니다')
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getTotalSize = (): number => {
    return selectedVideos.reduce((total, videoId) => {
      const video = completedVideos.find(v => v.id === videoId)
      return total + (video?.fileSize || 0)
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <FileArchive className="w-4 h-4 mr-2" />
            일괄 다운로드
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            일괄 다운로드
          </DialogTitle>
          <DialogDescription>
            여러 동영상을 ZIP 파일로 다운로드합니다
          </DialogDescription>
        </DialogHeader>

        {completedVideos.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">
                다운로드 가능한 동영상이 없습니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Selection Header */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedVideos.length === completedVideos.length}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  전체 선택 ({selectedVideos.length}/{completedVideos.length})
                </span>
              </div>
              {selectedVideos.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideos([])}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  선택 해제
                </Button>
              )}
            </div>

            {/* Video List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {completedVideos.map((video) => (
                  <Card
                    key={video.id}
                    className={`cursor-pointer transition-all ${
                      selectedVideos.includes(video.id)
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleVideo(video.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedVideos.includes(video.id)}
                          onCheckedChange={() => toggleVideo(video.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{video.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {formatFileSize(video.fileSize)}
                            </Badge>
                          </div>
                        </div>
                        {selectedVideos.includes(video.id) && (
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Summary */}
            {selectedVideos.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">선택된 동영상:</span>
                      <span className="font-medium">{selectedVideos.length}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">총 용량:</span>
                      <span className="font-medium">{formatFileSize(getTotalSize())}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">압축 포맷:</span>
                      <Badge variant="outline">ZIP</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            {loading && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">다운로드 준비 중...</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </CardContent>
              </Card>
            )}

            {/* Success Message */}
            {downloadUrl && !loading && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">다운로드 준비 완료</p>
                      <p className="text-sm text-green-700">
                        다운로드가 자동으로 시작됩니다
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            onClick={handleBatchDownload}
            disabled={loading || selectedVideos.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                다운로드 ({selectedVideos.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
