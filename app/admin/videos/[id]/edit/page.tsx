'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoEditor } from '@/components/admin/videos/video-editor'
import { TextOverlayEditor } from '@/components/admin/videos/text-overlay-editor'
import { AudioMixerEditor } from '@/components/admin/videos/audio-mixer-editor'
import { VideoFilterEditor } from '@/components/admin/videos/video-filter-editor'
import { EditHistory } from '@/components/admin/videos/edit-history'
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoData {
  id: string
  title: string
  filePath?: string
  thumbnailPath?: string
  duration?: number
  textOverlay?: any
  backgroundMusic?: any
  status: string
}

interface EditState {
  textOverlay?: any
  backgroundMusic?: any
  filters?: any[]
  effects?: any[]
}

export default function VideoEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editState, setEditState] = useState<EditState>({})
  const [history, setHistory] = useState<EditState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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

      // Initialize edit state
      const initialState: EditState = {
        textOverlay: data.data.textOverlay || {},
        backgroundMusic: data.data.backgroundMusic || {},
        filters: [],
        effects: []
      }
      setEditState(initialState)
      setHistory([initialState])
      setHistoryIndex(0)
    } catch (error) {
      console.error('Error fetching video:', error)
      toast.error('동영상 정보를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const updateEditState = (updates: Partial<EditState>) => {
    const newState = { ...editState, ...updates }
    setEditState(newState)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setEditState(history[historyIndex - 1])
      toast.success('실행 취소되었습니다')
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setEditState(history[historyIndex + 1])
      toast.success('다시 실행되었습니다')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch(`/api/videos/${params.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'edit',
          options: editState
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save edits')
      }

      toast.success('변경 사항이 저장되었습니다')
      router.push(`/admin/videos/${params.id}`)
    } catch (error) {
      console.error('Error saving edits:', error)
      toast.error('변경 사항 저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!video || video.status !== 'COMPLETED' || !video.filePath) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          완료된 동영상만 편집할 수 있습니다
        </p>
        <Link href={`/admin/videos/${params.id}`}>
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
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
          <Link href={`/admin/videos/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">동영상 편집</h1>
            <p className="text-muted-foreground mt-1">{video.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            실행 취소
          </Button>
          <Button
            variant="outline"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4 mr-2" />
            다시 실행
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Video Preview */}
        <div className="lg:col-span-2 space-y-6">
          <VideoEditor
            videoId={video.id}
            src={video.filePath}
            duration={video.duration || 0}
            editState={editState}
            onEditStateChange={updateEditState}
          />

          <EditHistory
            history={history}
            currentIndex={historyIndex}
            onRestore={(index) => {
              setHistoryIndex(index)
              setEditState(history[index])
            }}
          />
        </div>

        {/* Right Column - Editing Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>편집 도구</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">텍스트</TabsTrigger>
                  <TabsTrigger value="audio">오디오</TabsTrigger>
                  <TabsTrigger value="effects">효과</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <TextOverlayEditor
                    value={editState.textOverlay}
                    onChange={(textOverlay) =>
                      updateEditState({ textOverlay })
                    }
                  />
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <AudioMixerEditor
                    value={editState.backgroundMusic}
                    onChange={(backgroundMusic) =>
                      updateEditState({ backgroundMusic })
                    }
                  />
                </TabsContent>

                <TabsContent value="effects" className="space-y-4">
                  <VideoFilterEditor
                    filters={editState.filters || []}
                    effects={editState.effects || []}
                    onChange={(filters, effects) =>
                      updateEditState({ filters, effects })
                    }
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
