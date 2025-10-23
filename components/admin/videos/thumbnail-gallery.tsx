'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Thumbnail {
  id: string
  url: string
  timestamp: string
  selected?: boolean
}

interface ThumbnailGalleryProps {
  videoId: string
  thumbnails: Thumbnail[]
  currentThumbnail?: string
  onSelect?: (thumbnail: Thumbnail) => void
}

export function ThumbnailGallery({
  videoId,
  thumbnails,
  currentThumbnail,
  onSelect
}: ThumbnailGalleryProps) {
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | undefined>(currentThumbnail)
  const [generating, setGenerating] = useState(false)

  const handleSelect = (thumbnail: Thumbnail) => {
    setSelectedThumbnail(thumbnail.url)
    onSelect?.(thumbnail)
    toast.success('썸네일이 선택되었습니다')
  }

  const handleGenerateThumbnails = async () => {
    try {
      setGenerating(true)

      const response = await fetch(`/api/videos/${videoId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'thumbnail',
          options: {
            count: 5,
            size: '640x?'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate thumbnails')
      }

      const data = await response.json()
      toast.success('썸네일이 생성되었습니다')

      // Reload page or update thumbnails
      window.location.reload()
    } catch (error) {
      console.error('Error generating thumbnails:', error)
      toast.error('썸네일 생성에 실패했습니다')
    } finally {
      setGenerating(false)
    }
  }

  if (thumbnails.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground mb-4">사용 가능한 썸네일이 없습니다</p>
          <Button
            onClick={handleGenerateThumbnails}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              '썸네일 생성'
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">썸네일 갤러리</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateThumbnails}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              생성 중...
            </>
          ) : (
            '더 생성'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {thumbnails.map((thumbnail) => (
          <div
            key={thumbnail.id}
            className={`relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              selectedThumbnail === thumbnail.url
                ? 'border-primary ring-2 ring-primary'
                : 'border-transparent hover:border-primary/50'
            }`}
            onClick={() => handleSelect(thumbnail)}
          >
            <img
              src={thumbnail.url}
              alt={`Thumbnail ${thumbnail.id}`}
              className="w-full h-full object-cover"
            />
            {selectedThumbnail === thumbnail.url && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="bg-primary text-primary-foreground rounded-full p-2">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-white text-xs">{thumbnail.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedThumbnail && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              미리보기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>썸네일 미리보기</DialogTitle>
              <DialogDescription>
                선택한 썸네일의 미리보기입니다
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={selectedThumbnail}
                alt="Selected thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
