'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Loader2
} from 'lucide-react'
import { getOptimalVideoSettings } from '@/lib/video/cdn'

interface MobileVideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  title?: string
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function MobileVideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className = '',
  onPlay,
  onPause,
  onEnded
}: MobileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Apply optimal settings for mobile
  useEffect(() => {
    if (!videoRef.current || !isMobile) return

    const settings = getOptimalVideoSettings()
    videoRef.current.preload = settings.preload

    if (settings.autoplay) {
      videoRef.current.play().catch(() => {})
    }
  }, [isMobile])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('volumechange', handleVolumeChange)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('volumechange', handleVolumeChange)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [onPlay, onPause, onEnded])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setShowControls(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !videoRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    // Vertical swipe on left half - adjust brightness
    if (Math.abs(deltaY) > Math.abs(deltaX) && touch.clientX < window.innerWidth / 2) {
      e.preventDefault()
      const newBrightness = Math.max(50, Math.min(150, brightness - deltaY / 2))
      setBrightness(newBrightness)
      setIsDragging(true)
    }

    // Vertical swipe on right half - adjust volume
    if (Math.abs(deltaY) > Math.abs(deltaX) && touch.clientX > window.innerWidth / 2) {
      e.preventDefault()
      const newVolume = Math.max(0, Math.min(1, volume - deltaY / 200))
      setVolume(newVolume)
      videoRef.current.volume = newVolume
      setIsDragging(true)
    }

    // Horizontal swipe - seek
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      const seekAmount = (deltaX / window.innerWidth) * duration
      const newTime = Math.max(0, Math.min(duration, currentTime + seekAmount))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setIsDragging(true)
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
    setIsDragging(false)
  }

  // Double tap to toggle fullscreen
  const handleDoubleTap = () => {
    toggleFullscreen()
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const time = value[0]
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0]
      videoRef.current.volume = vol
      setVolume(vol)
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
      style={{ filter: `brightness(${brightness}%)` }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        poster={posterUrl}
        playsInline
        webkit-playsinline="true"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      )}

      {/* Center play/pause button */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="rounded-full w-20 h-20 bg-white/90 hover:bg-white"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10 text-black" />
          </Button>
        </div>
      )}

      {/* Drag indicators */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-black/70 text-white px-6 py-3 rounded-lg">
            {touchStart && touchStart.x < window.innerWidth / 2 ? (
              <div>Brightness: {brightness}%</div>
            ) : touchStart && touchStart.x > window.innerWidth / 2 ? (
              <div>Volume: {Math.round(volume * 100)}%</div>
            ) : (
              <div>{formatTime(currentTime)}</div>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold truncate">{title}</h3>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>

              {isMobile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(-10)}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skip(10)}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </>
              )}

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                {showVolumeSlider && !isMobile && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 p-3 rounded-lg">
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.1}
                      orientation="vertical"
                      className="h-24"
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tap to show controls */}
      {!showControls && (
        <div
          className="absolute inset-0"
          onClick={() => setShowControls(true)}
        />
      )}
    </div>
  )
}
