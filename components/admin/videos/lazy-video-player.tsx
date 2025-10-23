'use client'

import { useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2 } from 'lucide-react'
import {
  VideoStreamingManager,
  preloadVideoMetadata,
  createVideoLazyLoader,
  estimateOptimalQuality,
  getCachedVideo,
  cacheVideo
} from '@/lib/video/streaming'

interface VideoQuality {
  label: string
  width: number
  height: number
  bitrate: number
  url: string
}

interface LazyVideoPlayerProps {
  videoId: string
  videoUrl: string
  posterUrl?: string
  qualities?: VideoQuality[]
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function LazyVideoPlayer({
  videoId,
  videoUrl,
  posterUrl,
  qualities = [],
  autoplay = false,
  muted = false,
  loop = false,
  className = '',
  onPlay,
  onPause,
  onEnded
}: LazyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<VideoQuality | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [streamingManager, setStreamingManager] = useState<VideoStreamingManager | null>(null)
  const [metadata, setMetadata] = useState<any>(null)

  // Initialize lazy loading and streaming
  useEffect(() => {
    if (!videoRef.current || !containerRef.current) return

    const video = videoRef.current
    const observer = createVideoLazyLoader()

    // Set data-src for lazy loading
    video.dataset.src = videoUrl

    // Observe video element
    observer.observe(video)

    // Preload metadata
    preloadVideoMetadata(videoUrl)
      .then(meta => {
        setMetadata(meta)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })

    // Check cache
    getCachedVideo(videoUrl).then(cached => {
      if (!cached) {
        // Not cached, cache it after loading
        video.addEventListener('loadeddata', () => {
          cacheVideo(videoUrl, videoId)
        }, { once: true })
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [videoUrl, videoId])

  // Initialize streaming manager with qualities
  useEffect(() => {
    if (!videoRef.current || qualities.length === 0) return

    const initStreaming = async () => {
      const optimalQualityIndex = await estimateOptimalQuality(qualities)
      const manager = new VideoStreamingManager(videoRef.current!, qualities)
      manager.setQuality(optimalQualityIndex)
      setStreamingManager(manager)
      setCurrentQuality(qualities[optimalQualityIndex])
    }

    initStreaming()

    return () => {
      streamingManager?.destroy()
    }
  }, [qualities])

  // Update current quality from streaming manager
  useEffect(() => {
    if (!streamingManager) return

    const interval = setInterval(() => {
      const quality = streamingManager.getCurrentQuality()
      setCurrentQuality(quality)
    }, 2000)

    return () => clearInterval(interval)
  }, [streamingManager])

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

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('volumechange', handleVolumeChange)
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value)
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const vol = parseFloat(e.target.value)
      videoRef.current.volume = vol
      setVolume(vol)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleQualityChange = (qualityIndex: string) => {
    streamingManager?.setQuality(parseInt(qualityIndex))
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
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading video...</p>
          </div>
        </div>
      )}

      {metadata && !videoRef.current?.src && (
        <div className="absolute inset-0">
          <img
            src={metadata.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button size="lg" onClick={togglePlay}>
              <Play className="w-6 h-6 mr-2" />
              Play Video
            </Button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        poster={posterUrl || metadata?.thumbnail}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        playsInline
      />

      {/* Quality indicator */}
      {currentQuality && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">
            {currentQuality.label}
          </Badge>
        </div>
      )}

      {/* Video controls */}
      {showControls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%)`
              }}
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
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              {qualities.length > 0 && (
                <Select
                  value={qualities.findIndex(q => q.label === currentQuality?.label).toString()}
                  onValueChange={handleQualityChange}
                >
                  <SelectTrigger className="w-24 h-8 text-white border-white/30 bg-black/50">
                    <Settings className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualities.map((quality, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {quality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
