/**
 * Performance Optimization Utilities
 * Utilities for improving user interaction responsiveness
 */

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Debounce function - delays execution until after specified time has elapsed
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function - ensures function is called at most once per specified time
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastResult: ReturnType<T>

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
    return lastResult
  }
}

/**
 * React hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * React hook for throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Request Animation Frame throttle for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) {
      return
    }

    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = null
    })
  }
}

/**
 * Optimistic update manager for UI responsiveness
 */
export class OptimisticUpdateManager<T> {
  private pendingUpdates: Map<string, T> = new Map()
  private rollbackData: Map<string, T> = new Map()

  /**
   * Apply optimistic update
   */
  apply(id: string, newData: T, currentData: T): T {
    this.rollbackData.set(id, currentData)
    this.pendingUpdates.set(id, newData)
    return newData
  }

  /**
   * Commit successful update
   */
  commit(id: string): void {
    this.pendingUpdates.delete(id)
    this.rollbackData.delete(id)
  }

  /**
   * Rollback failed update
   */
  rollback(id: string): T | undefined {
    this.pendingUpdates.delete(id)
    const rollbackData = this.rollbackData.get(id)
    this.rollbackData.delete(id)
    return rollbackData
  }

  /**
   * Check if update is pending
   */
  isPending(id: string): boolean {
    return this.pendingUpdates.has(id)
  }

  /**
   * Get pending update
   */
  getPending(id: string): T | undefined {
    return this.pendingUpdates.get(id)
  }

  /**
   * Clear all pending updates
   */
  clear(): void {
    this.pendingUpdates.clear()
    this.rollbackData.clear()
  }
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map()

  /**
   * Start measuring performance
   */
  start(label: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime

      if (!this.measurements.has(label)) {
        this.measurements.set(label, [])
      }

      this.measurements.get(label)!.push(duration)
    }
  }

  /**
   * Get statistics for a measurement
   */
  getStats(label: string): {
    count: number
    average: number
    min: number
    max: number
    total: number
  } | null {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const total = measurements.reduce((sum, val) => sum + val, 0)
    const average = total / measurements.length
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)

    return {
      count: measurements.length,
      average,
      min,
      max,
      total
    }
  }

  /**
   * Clear measurements
   */
  clear(label?: string): void {
    if (label) {
      this.measurements.delete(label)
    } else {
      this.measurements.clear()
    }
  }

  /**
   * Log statistics
   */
  logStats(label: string): void {
    const stats = this.getStats(label)
    if (stats) {
      console.log(`Performance stats for "${label}":`, {
        count: stats.count,
        average: `${stats.average.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`,
        total: `${stats.total.toFixed(2)}ms`
      })
    }
  }
}

/**
 * Batch updates to reduce re-renders
 */
export class BatchUpdateManager {
  private updates: Array<() => void> = []
  private timeoutId: NodeJS.Timeout | null = null
  private rafId: number | null = null

  /**
   * Add update to batch
   */
  add(update: () => void): void {
    this.updates.push(update)
    this.scheduleFlush()
  }

  /**
   * Schedule flush
   */
  private scheduleFlush(): void {
    if (this.rafId !== null) return

    this.rafId = requestAnimationFrame(() => {
      this.flush()
    })
  }

  /**
   * Flush all pending updates
   */
  flush(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    const updates = this.updates.slice()
    this.updates = []

    updates.forEach(update => update())
  }

  /**
   * Clear pending updates
   */
  clear(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.updates = []
  }
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, type: 'script' | 'style' | 'image' | 'fetch' = 'fetch'): void {
  if (type === 'fetch') {
    fetch(url, { method: 'GET', priority: 'low' } as any).catch(() => {})
    return
  }

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = type === 'script' ? 'script' : type === 'style' ? 'style' : 'image'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Idle callback wrapper
 */
export function runWhenIdle(callback: () => void, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, timeout)
  }
}

/**
 * Chunk array processing to avoid blocking UI
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R,
  chunkSize: number = 100
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)

    // Process chunk
    const chunkResults = chunk.map(processor)
    results.push(...chunkResults)

    // Yield to browser
    if (i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return results
}

/**
 * React hook for responsive font size based on container
 */
export function useResponsiveFontSize(
  containerRef: React.RefObject<HTMLElement>,
  baseFontSize: number = 16
): number {
  const [fontSize, setFontSize] = useState(baseFontSize)

  useEffect(() => {
    const updateFontSize = () => {
      if (!containerRef.current) return

      const width = containerRef.current.offsetWidth
      const scaleFactor = Math.min(Math.max(width / 1000, 0.8), 1.5)
      setFontSize(baseFontSize * scaleFactor)
    }

    updateFontSize()

    const throttledUpdate = throttle(updateFontSize, 200)
    window.addEventListener('resize', throttledUpdate)

    return () => {
      window.removeEventListener('resize', throttledUpdate)
    }
  }, [containerRef, baseFontSize])

  return fontSize
}
