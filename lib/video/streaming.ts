/**
 * Video Streaming and Lazy Loading Utilities
 * Handles efficient video delivery with chunked loading and adaptive bitrate
 */

interface StreamingOptions {
  chunkSize?: number
  bufferSize?: number
  preloadAmount?: number
}

interface VideoQuality {
  label: string
  width: number
  height: number
  bitrate: number
  url: string
}

/**
 * Adaptive bitrate streaming manager
 */
export class VideoStreamingManager {
  private video: HTMLVideoElement
  private qualities: VideoQuality[]
  private currentQualityIndex: number = 0
  private bandwidth: number = 0
  private lastDownloadTime: number = 0

  constructor(video: HTMLVideoElement, qualities: VideoQuality[]) {
    this.video = video
    this.qualities = qualities.sort((a, b) => b.bitrate - a.bitrate)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.video.addEventListener('progress', this.handleProgress.bind(this))
    this.video.addEventListener('waiting', this.handleWaiting.bind(this))
    this.video.addEventListener('canplay', this.handleCanPlay.bind(this))
  }

  private handleProgress() {
    const currentTime = Date.now()
    if (this.lastDownloadTime > 0) {
      const timeDiff = (currentTime - this.lastDownloadTime) / 1000
      if (timeDiff > 0) {
        const bytesLoaded = this.getBytesLoaded()
        this.bandwidth = bytesLoaded / timeDiff
        this.adjustQuality()
      }
    }
    this.lastDownloadTime = currentTime
  }

  private handleWaiting() {
    // Buffer underrun, switch to lower quality
    if (this.currentQualityIndex < this.qualities.length - 1) {
      this.currentQualityIndex++
      this.switchQuality()
    }
  }

  private handleCanPlay() {
    // Buffer recovered, consider higher quality
    if (this.bandwidth > this.qualities[this.currentQualityIndex].bitrate * 1.5) {
      if (this.currentQualityIndex > 0) {
        this.currentQualityIndex--
        this.switchQuality()
      }
    }
  }

  private getBytesLoaded(): number {
    const buffered = this.video.buffered
    if (buffered.length > 0) {
      return buffered.end(buffered.length - 1) * this.qualities[this.currentQualityIndex].bitrate / 8
    }
    return 0
  }

  private adjustQuality() {
    const currentQuality = this.qualities[this.currentQualityIndex]

    // If bandwidth is much higher, upgrade quality
    if (this.bandwidth > currentQuality.bitrate * 2 && this.currentQualityIndex > 0) {
      this.currentQualityIndex--
      this.switchQuality()
    }
    // If bandwidth is lower, downgrade quality
    else if (this.bandwidth < currentQuality.bitrate && this.currentQualityIndex < this.qualities.length - 1) {
      this.currentQualityIndex++
      this.switchQuality()
    }
  }

  private switchQuality() {
    const currentTime = this.video.currentTime
    const wasPlaying = !this.video.paused

    this.video.src = this.qualities[this.currentQualityIndex].url
    this.video.currentTime = currentTime

    if (wasPlaying) {
      this.video.play().catch(() => {})
    }
  }

  getCurrentQuality(): VideoQuality {
    return this.qualities[this.currentQualityIndex]
  }

  setQuality(index: number) {
    if (index >= 0 && index < this.qualities.length) {
      this.currentQualityIndex = index
      this.switchQuality()
    }
  }

  destroy() {
    this.video.removeEventListener('progress', this.handleProgress)
    this.video.removeEventListener('waiting', this.handleWaiting)
    this.video.removeEventListener('canplay', this.handleCanPlay)
  }
}

/**
 * Preload video metadata and first frame without downloading entire video
 */
export async function preloadVideoMetadata(url: string): Promise<{
  duration: number
  width: number
  height: number
  thumbnail: string
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.crossOrigin = 'anonymous'

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      video.currentTime = 0.1
      video.onseeked = () => {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7)

          resolve({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            thumbnail
          })
        } else {
          reject(new Error('Failed to get canvas context'))
        }
        video.remove()
      }
    }

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
      video.remove()
    }

    video.src = url
  })
}

/**
 * Lazy load video with intersection observer
 */
export function createVideoLazyLoader(
  options: StreamingOptions = {}
): IntersectionObserver {
  const {
    chunkSize = 1024 * 1024, // 1MB
    bufferSize = 5 * 1024 * 1024, // 5MB
    preloadAmount = 0.2 // 20% threshold
  } = options

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement

        if (entry.isIntersecting) {
          // Video is visible, start loading
          if (video.dataset.src && !video.src) {
            video.src = video.dataset.src
            video.preload = 'auto'
          }

          // If video is near bottom of viewport, preload more
          if (entry.intersectionRatio > preloadAmount) {
            video.load()
          }
        } else {
          // Video is not visible, stop loading if not playing
          if (video.paused && video.preload !== 'none') {
            video.preload = 'metadata'
          }
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: [0, preloadAmount, 0.5, 1]
    }
  )
}

/**
 * Range request for chunked video loading
 */
export async function fetchVideoChunk(
  url: string,
  start: number,
  end: number
): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    headers: {
      Range: `bytes=${start}-${end}`
    }
  })

  if (!response.ok && response.status !== 206) {
    throw new Error(`Failed to fetch video chunk: ${response.statusText}`)
  }

  return response.arrayBuffer()
}

/**
 * Estimate optimal quality based on connection
 */
export async function estimateOptimalQuality(
  qualities: VideoQuality[]
): Promise<number> {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType

    switch (effectiveType) {
      case '4g':
        return 0 // Highest quality
      case '3g':
        return Math.min(1, qualities.length - 1)
      case '2g':
        return Math.min(2, qualities.length - 1)
      default:
        return qualities.length - 1 // Lowest quality
    }
  }

  // Fallback: test download speed
  const testUrl = qualities[0].url
  const startTime = Date.now()

  try {
    const response = await fetch(testUrl, {
      method: 'HEAD'
    })

    const endTime = Date.now()
    const latency = endTime - startTime

    if (latency < 100) return 0
    if (latency < 300) return Math.min(1, qualities.length - 1)
    if (latency < 600) return Math.min(2, qualities.length - 1)
    return qualities.length - 1
  } catch {
    return qualities.length - 1
  }
}

/**
 * Cache video in browser storage
 */
export async function cacheVideo(url: string, cacheKey: string): Promise<void> {
  if ('caches' in window) {
    try {
      const cache = await caches.open('video-cache-v1')
      await cache.add(url)
      console.log(`Video cached: ${cacheKey}`)
    } catch (error) {
      console.error('Failed to cache video:', error)
    }
  }
}

/**
 * Get cached video
 */
export async function getCachedVideo(url: string): Promise<Response | undefined> {
  if ('caches' in window) {
    try {
      const cache = await caches.open('video-cache-v1')
      return await cache.match(url)
    } catch (error) {
      console.error('Failed to get cached video:', error)
    }
  }
  return undefined
}

/**
 * Clear video cache
 */
export async function clearVideoCache(): Promise<void> {
  if ('caches' in window) {
    try {
      await caches.delete('video-cache-v1')
      console.log('Video cache cleared')
    } catch (error) {
      console.error('Failed to clear video cache:', error)
    }
  }
}
