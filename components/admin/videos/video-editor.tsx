'use client'

import { useRef, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Volume2,
  VolumeX
} from 'lucide-react'

interface VideoEditorProps {
  videoId: string
  src: string
  duration: number
  editState: any
  onEditStateChange: (updates: any) => void
}

export function VideoEditor({
  videoId,
  src,
  duration,
  editState,
  onEditStateChange
}: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      renderPreview()
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [editState])

  const renderPreview = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Apply filters
    if (editState.filters && editState.filters.length > 0) {
      editState.filters.forEach((filter: any) => {
        applyFilter(ctx, canvas, filter)
      })
    }

    // Apply text overlay
    if (editState.textOverlay && editState.textOverlay.enabled) {
      applyTextOverlay(ctx, canvas, editState.textOverlay)
    }
  }

  const applyFilter = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, filter: any) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filter.type) {
      case 'brightness':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * filter.value)
          data[i + 1] = Math.min(255, data[i + 1] * filter.value)
          data[i + 2] = Math.min(255, data[i + 2] * filter.value)
        }
        break
      case 'contrast':
        const factor = (259 * (filter.value + 255)) / (255 * (259 - filter.value))
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128
          data[i + 1] = factor * (data[i + 1] - 128) + 128
          data[i + 2] = factor * (data[i + 2] - 128) + 128
        }
        break
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        break
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b)
          data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b)
          data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
        }
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyTextOverlay = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, overlay: any) => {
    if (!overlay.text) return

    ctx.font = `${overlay.size || 32}px ${overlay.font || 'Arial'}`
    ctx.fillStyle = overlay.color || '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Add text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // Position text
    let x = canvas.width / 2
    let y = canvas.height / 2

    if (overlay.position === 'top') {
      y = canvas.height * 0.1
    } else if (overlay.position === 'bottom') {
      y = canvas.height * 0.9
    }

    ctx.fillText(overlay.text, x, y)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Video Preview with Canvas Overlay */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full"
            style={{ display: 'none' }}
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
          />
          {selectedRange && (
            <div className="text-xs text-muted-foreground">
              선택 구간: {formatTime(selectedRange[0])} - {formatTime(selectedRange[1])}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(-5)}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => skip(5)}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
