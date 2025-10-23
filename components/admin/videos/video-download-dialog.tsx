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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Loader2, CheckCircle2, FileVideo } from 'lucide-react'
import { toast } from 'sonner'

interface VideoDownloadDialogProps {
  videoId: string
  videoTitle: string
  videoSize?: number
  children?: React.ReactNode
}

export function VideoDownloadDialog({
  videoId,
  videoTitle,
  videoSize,
  children
}: VideoDownloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('original')
  const [resolution, setResolution] = useState<string | undefined>(undefined)

  const formats = [
    { value: 'mp4', label: 'MP4', description: '가장 호환성이 좋은 포맷' },
    { value: 'webm', label: 'WebM', description: '웹 최적화 포맷' },
    { value: 'mov', label: 'MOV', description: '고품질 Apple 포맷' },
    { value: 'avi', label: 'AVI', description: '범용 포맷' }
  ]

  const qualities = [
    { value: 'original', label: '원본', description: '변환 없이 원본 파일' },
    { value: 'high', label: '고화질', description: '높은 품질, 큰 파일' },
    { value: 'medium', label: '중화질', description: '균형잡힌 품질' },
    { value: 'low', label: '저화질', description: '빠른 다운로드' }
  ]

  const resolutions = [
    { value: '1920x1080', label: '1080p (Full HD)' },
    { value: '1280x720', label: '720p (HD)' },
    { value: '854x480', label: '480p (SD)' },
    { value: '640x360', label: '360p' }
  ]

  const handleDownload = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        format,
        quality,
        ...(resolution && { resolution })
      })

      const response = await fetch(`/api/videos/${videoId}/download?${params}`)

      if (!response.ok) {
        throw new Error('Failed to prepare download')
      }

      const data = await response.json()

      if (data.success && data.data.url) {
        // Trigger download
        const link = document.createElement('a')
        link.href = data.data.url
        link.download = data.data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('다운로드가 시작되었습니다')
        setOpen(false)
      } else {
        throw new Error('Invalid download response')
      }
    } catch (error) {
      console.error('Error downloading video:', error)
      toast.error('다운로드에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            동영상 다운로드
          </DialogTitle>
          <DialogDescription>
            다운로드 옵션을 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Video Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">파일명:</span>
                  <span className="text-sm text-muted-foreground">{videoTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">파일 크기:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(videoSize)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>파일 포맷</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="grid grid-cols-2 gap-3">
                {formats.map((fmt) => (
                  <Card
                    key={fmt.value}
                    className={`cursor-pointer transition-all ${
                      format === fmt.value
                        ? 'border-primary ring-2 ring-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormat(fmt.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={fmt.value} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fmt.label}</span>
                            {format === fmt.value && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {fmt.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Quality Selection */}
          <div className="space-y-3">
            <Label>화질</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualities.map((qual) => (
                  <SelectItem key={qual.value} value={qual.value}>
                    <div className="flex items-center gap-2">
                      <span>{qual.label}</span>
                      <span className="text-xs text-muted-foreground">
                        - {qual.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution Selection */}
          {quality !== 'original' && (
            <div className="space-y-3">
              <Label>해상도 (선택사항)</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue placeholder="자동" />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map((res) => (
                    <SelectItem key={res.value} value={res.value}>
                      {res.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">포맷:</span>
                  <Badge variant="outline">{format.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">화질:</span>
                  <Badge variant="outline">
                    {qualities.find(q => q.value === quality)?.label}
                  </Badge>
                </div>
                {resolution && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">해상도:</span>
                    <Badge variant="outline">{resolution}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                준비 중...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
