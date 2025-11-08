"use client"

import React from "react"

// 性能优化工具 - 虚拟滚动、懒加载、缓存等
import { useState, useEffect, useRef, useCallback } from "react"

export interface VirtualListConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export interface VirtualListResult {
  visibleItems: Array<{ index: number; offset: number }>
  totalHeight: number
  onScroll: (event: React.UIEvent<HTMLElement>) => void
}

// 虚拟滚动Hook
export function useVirtualScroll<T>(items: T[], config: VirtualListConfig): VirtualListResult {
  const { itemHeight, containerHeight, overscan = 3 } = config
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      offset: i * itemHeight,
    })
  }

  const onScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    onScroll,
  }
}

// 懒加载Hook
export function useLazyLoad<T>(
  loadMore: () => Promise<T[]>,
  threshold = 200,
): {
  items: T[]
  isLoading: boolean
  hasMore: boolean
  observerRef: (node: HTMLElement | null) => void
} {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)

  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMoreItems()
          }
        },
        { rootMargin: `${threshold}px` },
      )

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore, threshold],
  )

  const loadMoreItems = async () => {
    setIsLoading(true)
    try {
      const newItems = await loadMore()
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => [...prev, ...newItems])
      }
    } catch (error) {
      console.error("[v0] Failed to load more items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return { items, isLoading, hasMore, observerRef }
}

// 缓存管理
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    if (age > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const cacheManager = new CacheManager()

// 防抖Hook
export function useDebounce<T>(value: T, delay = 500): T {
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

// 节流Hook
export function useThrottle<T>(value: T, delay = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRun.current >= delay) {
          setThrottledValue(value)
          lastRun.current = Date.now()
        }
      },
      delay - (Date.now() - lastRun.current),
    )

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return throttledValue
}

// 图片懒加载Hook
export function useImageLazyLoad(src: string): { imageSrc: string; isLoaded: boolean } {
  const [imageSrc, setImageSrc] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
  }, [src])

  return { imageSrc, isLoaded }
}

// 代码分割工具
export function lazyLoadComponent(importFunc: () => Promise<any>) {
  return React.lazy(importFunc)
}

// 性能监控
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  startMeasure(label: string): () => void {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(label, duration)
      console.log(`[v0 Performance] ${label}: ${duration.toFixed(2)}ms`)
    }
  }

  private recordMetric(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label)
    if (!values || values.length === 0) return null

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  }

  getAllMetrics(): Map<string, ReturnType<PerformanceMonitor["getMetrics"]>> {
    const result = new Map()
    for (const label of this.metrics.keys()) {
      result.set(label, this.getMetrics(label))
    }
    return result
  }

  clear(): void {
    this.metrics.clear()
  }
}

export const performanceMonitor = new PerformanceMonitor()
