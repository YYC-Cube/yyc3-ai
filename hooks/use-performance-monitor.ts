"use client"

// 性能监控自定义Hook
import { useState, useEffect, useCallback } from "react"
import type { PerformanceMetrics } from "@/types/components"

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // 收集性能指标
  const collectMetrics = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType("paint")

      const fcp = paint.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0

      // 使用Performance Observer收集LCP和FID
      let lcp = 0
      let fid = 0
      let cls = 0

      if ("PerformanceObserver" in window) {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          lcp = lastEntry.renderTime || lastEntry.loadTime
        })
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            fid = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ["first-input"] })

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              cls += entry.value
            }
          })
        })
        clsObserver.observe({ entryTypes: ["layout-shift"] })
      }

      const ttfb = navigation?.responseStart - navigation?.requestStart || 0

      // 计算性能分数 (0-100)
      const score = calculatePerformanceScore({ fcp, lcp, fid, cls, ttfb })

      setMetrics({
        fcp,
        lcp,
        fid,
        cls,
        ttfb,
        score,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("[v0] Error collecting performance metrics:", error)
    }
  }, [])

  // 计算性能分数
  const calculatePerformanceScore = (metrics: Omit<PerformanceMetrics, "score" | "timestamp">): number => {
    const fcpScore = metrics.fcp < 1800 ? 100 : metrics.fcp < 3000 ? 50 : 0
    const lcpScore = metrics.lcp < 2500 ? 100 : metrics.lcp < 4000 ? 50 : 0
    const fidScore = metrics.fid < 100 ? 100 : metrics.fid < 300 ? 50 : 0
    const clsScore = metrics.cls < 0.1 ? 100 : metrics.cls < 0.25 ? 50 : 0
    const ttfbScore = metrics.ttfb < 800 ? 100 : metrics.ttfb < 1800 ? 50 : 0

    return Math.round((fcpScore + lcpScore + fidScore + clsScore + ttfbScore) / 5)
  }

  // 开始监控
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    collectMetrics()

    const interval = setInterval(collectMetrics, 30000) // 每30秒收集一次
    return () => clearInterval(interval)
  }, [collectMetrics])

  // 停止监控
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [isMonitoring, startMonitoring])

  return {
    metrics,
    isMonitoring,
    startMonitoring: () => setIsMonitoring(true),
    stopMonitoring,
    collectMetrics,
  }
}
