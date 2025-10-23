/**
 * CDN Optimization Utilities
 * Handles CDN URL generation, cache control, and content optimization
 */

export interface CDNConfig {
  baseUrl: string
  regions?: string[]
  defaultRegion?: string
  cacheControl?: {
    maxAge: number
    sMaxAge: number
    staleWhileRevalidate: number
  }
}

export interface VideoTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'mp4' | 'webm' | 'hls'
  fps?: number
  bitrate?: number
}

/**
 * CDN Manager for video delivery optimization
 */
export class CDNManager {
  private config: CDNConfig

  constructor(config: CDNConfig) {
    this.config = {
      ...config,
      cacheControl: {
        maxAge: 86400, // 24 hours
        sMaxAge: 604800, // 7 days
        staleWhileRevalidate: 86400, // 24 hours
        ...config.cacheControl
      }
    }
  }

  /**
   * Generate CDN URL for video
   */
  generateVideoUrl(
    videoPath: string,
    transforms?: VideoTransformOptions
  ): string {
    const region = this.selectOptimalRegion()
    const baseUrl = `${this.config.baseUrl}/${region}`

    if (!transforms) {
      return `${baseUrl}/${videoPath}`
    }

    const params = new URLSearchParams()

    if (transforms.width) params.set('w', transforms.width.toString())
    if (transforms.height) params.set('h', transforms.height.toString())
    if (transforms.quality) params.set('q', transforms.quality.toString())
    if (transforms.format) params.set('f', transforms.format)
    if (transforms.fps) params.set('fps', transforms.fps.toString())
    if (transforms.bitrate) params.set('br', transforms.bitrate.toString())

    return `${baseUrl}/${videoPath}?${params.toString()}`
  }

  /**
   * Generate multiple quality variants
   */
  generateQualityVariants(videoPath: string): Array<{
    quality: string
    url: string
    width: number
    height: number
    bitrate: number
  }> {
    return [
      {
        quality: '1080p',
        url: this.generateVideoUrl(videoPath, {
          width: 1920,
          height: 1080,
          bitrate: 5000000,
          quality: 85
        }),
        width: 1920,
        height: 1080,
        bitrate: 5000000
      },
      {
        quality: '720p',
        url: this.generateVideoUrl(videoPath, {
          width: 1280,
          height: 720,
          bitrate: 2500000,
          quality: 80
        }),
        width: 1280,
        height: 720,
        bitrate: 2500000
      },
      {
        quality: '480p',
        url: this.generateVideoUrl(videoPath, {
          width: 854,
          height: 480,
          bitrate: 1000000,
          quality: 75
        }),
        width: 854,
        height: 480,
        bitrate: 1000000
      },
      {
        quality: '360p',
        url: this.generateVideoUrl(videoPath, {
          width: 640,
          height: 360,
          bitrate: 500000,
          quality: 70
        }),
        width: 640,
        height: 360,
        bitrate: 500000
      }
    ]
  }

  /**
   * Select optimal CDN region based on user location
   */
  private selectOptimalRegion(): string {
    if (!this.config.regions || this.config.regions.length === 0) {
      return this.config.defaultRegion || 'global'
    }

    // Try to detect user's region
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Simple region mapping based on timezone
    if (timeZone.includes('Asia')) {
      return this.config.regions.find(r => r.includes('asia')) || this.config.regions[0]
    }
    if (timeZone.includes('Europe')) {
      return this.config.regions.find(r => r.includes('europe')) || this.config.regions[0]
    }
    if (timeZone.includes('America')) {
      return this.config.regions.find(r => r.includes('america')) || this.config.regions[0]
    }

    return this.config.defaultRegion || this.config.regions[0]
  }

  /**
   * Generate cache control headers
   */
  getCacheHeaders(): Record<string, string> {
    const { maxAge, sMaxAge, staleWhileRevalidate } = this.config.cacheControl!

    return {
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      'CDN-Cache-Control': `max-age=${sMaxAge}`,
      'Vary': 'Accept-Encoding, User-Agent'
    }
  }

  /**
   * Purge CDN cache for specific video
   */
  async purgeCache(videoPath: string): Promise<void> {
    // Implementation depends on CDN provider (Cloudflare, AWS CloudFront, etc.)
    console.log(`Purging cache for: ${videoPath}`)
    // Example for Cloudflare:
    // await fetch(`https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${API_TOKEN}` },
    //   body: JSON.stringify({ files: [this.generateVideoUrl(videoPath)] })
    // })
  }
}

/**
 * Preconnect to CDN domains for faster loading
 */
export function preconnectCDN(domains: string[]): void {
  domains.forEach(domain => {
    // DNS prefetch
    const prefetch = document.createElement('link')
    prefetch.rel = 'dns-prefetch'
    prefetch.href = domain
    document.head.appendChild(prefetch)

    // Preconnect
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = domain
    preconnect.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect)
  })
}

/**
 * Smart cache strategy based on content type and usage patterns
 */
export class SmartCacheStrategy {
  private cachePrefix = 'video-smart-cache-v1'
  private maxCacheSize = 500 * 1024 * 1024 // 500MB
  private accessLog = new Map<string, { count: number; lastAccess: number }>()

  /**
   * Cache video with smart strategy
   */
  async cacheVideo(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open(this.cachePrefix)

      // Check if we need to make space
      await this.ensureCacheSpace()

      // Cache the video
      await cache.add(url)

      // Update access log
      this.accessLog.set(url, {
        count: 1,
        lastAccess: Date.now()
      })

      console.log(`Video cached with ${priority} priority: ${url}`)
    } catch (error) {
      console.error('Failed to cache video:', error)
    }
  }

  /**
   * Get cached video if available
   */
  async getCachedVideo(url: string): Promise<Response | null> {
    if (!('caches' in window)) return null

    try {
      const cache = await caches.open(this.cachePrefix)
      const response = await cache.match(url)

      if (response) {
        // Update access log
        const log = this.accessLog.get(url)
        if (log) {
          log.count++
          log.lastAccess = Date.now()
        }
      }

      return response || null
    } catch (error) {
      console.error('Failed to get cached video:', error)
      return null
    }
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private async ensureCacheSpace(): Promise<void> {
    if (!('caches' in window) || !('storage' in navigator)) return

    try {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0

      if (usage > this.maxCacheSize) {
        // Remove least recently used items
        await this.evictLRU()
      }
    } catch (error) {
      console.error('Failed to check cache space:', error)
    }
  }

  /**
   * Evict least recently used items
   */
  private async evictLRU(): Promise<void> {
    const cache = await caches.open(this.cachePrefix)
    const requests = await cache.keys()

    // Sort by access pattern (least accessed and oldest first)
    const sortedUrls = Array.from(this.accessLog.entries())
      .sort((a, b) => {
        const scoreA = a[1].count * (Date.now() - a[1].lastAccess)
        const scoreB = b[1].count * (Date.now() - b[1].lastAccess)
        return scoreA - scoreB
      })
      .map(([url]) => url)

    // Remove bottom 20% of cached items
    const removeCount = Math.floor(requests.length * 0.2)
    for (let i = 0; i < removeCount && i < sortedUrls.length; i++) {
      await cache.delete(sortedUrls[i])
      this.accessLog.delete(sortedUrls[i])
      console.log(`Evicted from cache: ${sortedUrls[i]}`)
    }
  }

  /**
   * Prefetch videos based on predicted usage
   */
  async prefetchVideos(urls: string[], priority: 'high' | 'medium' | 'low' = 'low'): Promise<void> {
    // Use requestIdleCallback for low priority prefetching
    if (priority === 'low' && 'requestIdleCallback' in window) {
      urls.forEach(url => {
        (window as any).requestIdleCallback(() => {
          this.cacheVideo(url, priority)
        })
      })
    } else {
      // Prefetch immediately for high/medium priority
      await Promise.all(urls.map(url => this.cacheVideo(url, priority)))
    }
  }

  /**
   * Clear all cached videos
   */
  async clearCache(): Promise<void> {
    if (!('caches' in window)) return

    try {
      await caches.delete(this.cachePrefix)
      this.accessLog.clear()
      console.log('Video cache cleared')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalSize: number
    itemCount: number
    hitRate: number
  }> {
    if (!('caches' in window) || !('storage' in navigator)) {
      return { totalSize: 0, itemCount: 0, hitRate: 0 }
    }

    const estimate = await navigator.storage.estimate()
    const cache = await caches.open(this.cachePrefix)
    const requests = await cache.keys()

    const totalAccesses = Array.from(this.accessLog.values())
      .reduce((sum, log) => sum + log.count, 0)

    const cacheHits = Array.from(this.accessLog.values())
      .filter(log => log.count > 1)
      .reduce((sum, log) => sum + log.count - 1, 0)

    return {
      totalSize: estimate.usage || 0,
      itemCount: requests.length,
      hitRate: totalAccesses > 0 ? cacheHits / totalAccesses : 0
    }
  }
}

/**
 * Optimize video loading based on network conditions
 */
export function getOptimalVideoSettings(): {
  quality: 'high' | 'medium' | 'low'
  preload: 'auto' | 'metadata' | 'none'
  autoplay: boolean
} {
  // Check network connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection.effectiveType
    const saveData = connection.saveData

    if (saveData) {
      return { quality: 'low', preload: 'none', autoplay: false }
    }

    switch (effectiveType) {
      case '4g':
        return { quality: 'high', preload: 'auto', autoplay: true }
      case '3g':
        return { quality: 'medium', preload: 'metadata', autoplay: false }
      case '2g':
      case 'slow-2g':
        return { quality: 'low', preload: 'none', autoplay: false }
    }
  }

  // Default settings
  return { quality: 'medium', preload: 'metadata', autoplay: false }
}

/**
 * Generate responsive video sources
 */
export function generateResponsiveSources(
  cdnManager: CDNManager,
  videoPath: string
): string {
  const variants = cdnManager.generateQualityVariants(videoPath)

  return variants
    .map(variant => {
      return `<source src="${variant.url}" type="video/mp4" media="(min-width: ${variant.width}px)">`
    })
    .join('\n')
}
