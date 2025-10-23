'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoPlayer } from '@/components/admin/videos/video-player'
import { VideoProgressMonitor } from '@/components/admin/videos/video-progress-monitor'
import { VideoDownloadDialog } from '@/components/admin/videos/video-download-dialog'
import { VideoShareDialog } from '@/components/admin/videos/video-share-dialog'
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  Clock,
  Calendar,
  Film,
  Palette,
  Monitor,
  FileText,
  Music,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoData {
  id: string
  title: string
  description?: string
  status: string
  format: string
  style: string
  resolution: string
  duration?: number
  filePath?: string
  thumbnailPath?: string
  fileSize?: number
  views: number
  downloads: number
  shares: number
  colorPalette?: string
  textOverlay?: any
  backgroundMusic?: any
  prompt: string
  createdAt: string
  updatedAt: string
  summary?: {
    id: string
    content: string
    type: string
  }
  article?: {
    id: string
    title: string
    url: string
  }
  processingLogs: any[]
}

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchVideo()
  }, [params.id])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video')
      }

      const data = await response.json()
      setVideo(data.data)
    } catch (error) {
      console.error('Error fetching video:', error)
      toast.error('동영상 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 동영상을 삭제하시겠습니까?')) {
      return
    }

    try {
      setDeleting(true)

      const response = await fetch(`/api/videos/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete video')
      }

      toast.success('동영상이 삭제되었습니다')
      router.push('/admin/videos')
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('동영상 삭제에 실패했습니다')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: '대기 중', variant: 'secondary' },
      GENERATING: { label: '생성 중', variant: 'default' },
      COMPLETED: { label: '완료', variant: 'success' },
      FAILED: { label: '실패', variant: 'destructive' },
      CANCELLED: { label: '취소됨', variant: 'outline' }
    }

    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      VERTICAL: '세로형 (9:16)',
      HORIZONTAL: '가로형 (16:9)',
      SQUARE: '정사각형 (1:1)'
    }
    return formats[format] || format
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">동영상을 찾을 수 없습니다</p>
        <Link href="/admin/videos">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/videos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{video.title}</h1>
            <p className="text-muted-foreground mt-1">
              {new Date(video.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {video.status === 'COMPLETED' && (
            <>
              <VideoDownloadDialog
                videoId={video.id}
                videoTitle={video.title}
                videoSize={video.fileSize}
              >
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </VideoDownloadDialog>
              <VideoShareDialog
                videoId={video.id}
                videoTitle={video.title}
              >
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유
                </Button>
              </VideoShareDialog>
              <Link href={`/admin/videos/${video.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Video Player */}
        <div className="lg:col-span-2 space-y-6">
          {video.status === 'COMPLETED' && video.filePath ? (
            <VideoPlayer
              src={video.filePath}
              poster={video.thumbnailPath || undefined}
              title={video.title}
              className="aspect-video"
            />
          ) : video.status === 'GENERATING' || video.status === 'PENDING' ? (
            <VideoProgressMonitor
              videoId={video.id}
              onComplete={fetchVideo}
            />
          ) : video.status === 'FAILED' ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-destructive mb-4">
                  <Film className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">동영상 생성 실패</h3>
                <p className="text-muted-foreground mb-4">
                  동영상 생성 중 오류가 발생했습니다
                </p>
                <Button variant="outline" onClick={fetchVideo}>
                  재시도
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">동영상 미리보기 없음</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              <TabsTrigger value="prompt">프롬프트</TabsTrigger>
              <TabsTrigger value="source">원본 콘텐츠</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>동영상 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {video.description && (
                    <div>
                      <h4 className="font-medium mb-2">설명</h4>
                      <p className="text-muted-foreground">{video.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        포맷
                      </h4>
                      <p className="text-muted-foreground">{getFormatLabel(video.format)}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        스타일
                      </h4>
                      <p className="text-muted-foreground">{video.style}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        길이
                      </h4>
                      <p className="text-muted-foreground">{video.duration}초</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">해상도</h4>
                      <p className="text-muted-foreground">{video.resolution}</p>
                    </div>
                  </div>

                  {video.textOverlay && (
                    <div>
                      <h4 className="font-medium mb-2">텍스트 오버레이</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>폰트: {video.textOverlay.font}</p>
                        <p>크기: {video.textOverlay.size}px</p>
                        <p>위치: {video.textOverlay.position}</p>
                        <p>애니메이션: {video.textOverlay.animation}</p>
                      </div>
                    </div>
                  )}

                  {video.backgroundMusic && video.backgroundMusic.enabled && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        배경음악
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>트랙: {video.backgroundMusic.track}</p>
                        <p>음량: {video.backgroundMusic.volume}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prompt">
              <Card>
                <CardHeader>
                  <CardTitle>생성 프롬프트</CardTitle>
                  <CardDescription>
                    AI가 동영상을 생성하는데 사용한 프롬프트입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {video.prompt}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="source">
              <Card>
                <CardHeader>
                  <CardTitle>원본 콘텐츠</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {video.article && (
                    <div>
                      <h4 className="font-medium mb-2">기사</h4>
                      <p className="text-muted-foreground mb-2">{video.article.title}</p>
                      <a
                        href={video.article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        원문 보기 →
                      </a>
                    </div>
                  )}

                  {video.summary && (
                    <div>
                      <h4 className="font-medium mb-2">요약</h4>
                      <Badge variant="outline" className="mb-2">
                        {video.summary.type}
                      </Badge>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {video.summary.content}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>상태</CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(video.status)}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  조회수
                </span>
                <span className="font-semibold">{video.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  다운로드
                </span>
                <span className="font-semibold">{video.downloads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  공유
                </span>
                <span className="font-semibold">{video.shares}</span>
              </div>
            </CardContent>
          </Card>

          {/* File Info */}
          {video.status === 'COMPLETED' && (
            <Card>
              <CardHeader>
                <CardTitle>파일 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">파일 크기</p>
                  <p className="font-medium">
                    {video.fileSize
                      ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">생성일</p>
                  <p className="font-medium">
                    {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">최종 수정</p>
                  <p className="font-medium">
                    {new Date(video.updatedAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
