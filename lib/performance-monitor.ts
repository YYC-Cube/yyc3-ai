interface PerformanceMetric {
  name: string
  value: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: number
}

interface PerformanceReport {
  id: string
  url: string
  timestamp: number
  metrics: {
    FCP?: PerformanceMetric
    LCP?: PerformanceMetric
    FID?: PerformanceMetric
    CLS?: PerformanceMetric
    TTFB?: PerformanceMetric
    INP?: PerformanceMetric
  }
  resources: PerformanceResourceTiming[]
  navigation: PerformanceNavigationTiming | null
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private reports: PerformanceReport[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    this.initializeObserver()
    this.monitorWebVitals()
  }

  // 初始化性能观察器
  private initializeObserver(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return

    try {
      // 观察 LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number }
        const value = lastEntry.renderTime || lastEntry.loadTime || 0

        this.recordMetric({
          name: "LCP",
          value,
          rating: this.getLCPRating(value),
          timestamp: Date.now(),
        })
      })
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })

      // 观察 FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming
          this.recordMetric({
            name: "FID",
            value: fidEntry.processingStart - fidEntry.startTime,
            rating: this.getFIDRating(fidEntry.processingStart - fidEntry.startTime),
            timestamp: Date.now(),
          })
        })
      })
      fidObserver.observe({ type: "first-input", buffered: true })

      // 观察 CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as LayoutShift[]
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric({
              name: "CLS",
              value: clsValue,
              rating: this.getCLSRating(clsValue),
              timestamp: Date.now(),
            })
          }
        })
      })
      clsObserver.observe({ type: "layout-shift", buffered: true })
    } catch (error) {
      console.error("[v0] 性能观察器初始化失败:", error)
    }
  }

  // 监控 Web Vitals
  private monitorWebVitals(): void {
    if (typeof window === "undefined") return

    // FCP - First Contentful Paint
    const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0]
    if (fcpEntry) {
      this.recordMetric({
        name: "FCP",
        value: fcpEntry.startTime,
        rating: this.getFCPRating(fcpEntry.startTime),
        timestamp: Date.now(),
      })
    }

    // TTFB - Time to First Byte
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
      this.recordMetric({
        name: "TTFB",
        value: ttfb,
        rating: this.getTTFBRating(ttfb),
        timestamp: Date.now(),
      })
    }
  }

  // 记录性能指标
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.set(metric.name, metric)
    console.log(`[v0] Performance Metric - ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
  }

  // 生成性能报告
  generateReport(): PerformanceReport {
    if (typeof window === "undefined") {
      return {
        id: this.generateId(),
        url: "",
        timestamp: Date.now(),
        metrics: {},
        resources: [],
        navigation: null,
      }
    }

    const report: PerformanceReport = {
      id: this.generateId(),
      url: window.location.href,
      timestamp: Date.now(),
      metrics: {
        FCP: this.metrics.get("FCP"),
        LCP: this.metrics.get("LCP"),
        FID: this.metrics.get("FID"),
        CLS: this.metrics.get("CLS"),
        TTFB: this.metrics.get("TTFB"),
        INP: this.metrics.get("INP"),
      },
      resources: performance.getEntriesByType("resource") as PerformanceResourceTiming[],
      navigation: performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming,
    }

    // 获取内存信息(仅Chrome)
    const memory = (performance as any).memory
    if (memory) {
      report.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      }
    }

    this.reports.push(report)
    return report
  }

  // 获取当前指标
  getMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics)
  }

  // 获取性能评分
  getPerformanceScore(): number {
    const metrics = Array.from(this.metrics.values())
    if (metrics.length === 0) return 0

    const scores = metrics.map((m) => {
      switch (m.rating) {
        case "good":
          return 100
        case "needs-improvement":
          return 50
        case "poor":
          return 0
        default:
          return 50
      }
    })

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  // 获取优化建议
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const metrics = this.metrics

    const lcp = metrics.get("LCP")
    if (lcp && lcp.rating !== "good") {
      suggestions.push("LCP较慢,建议: 优化服务器响应时间、使用CDN加速资源加载、优化关键渲染路径")
    }

    const fid = metrics.get("FID")
    if (fid && fid.rating !== "good") {
      suggestions.push("FID较差,建议: 减少主线程工作、拆分长任务、使用Web Worker处理计算密集型任务")
    }

    const cls = metrics.get("CLS")
    if (cls && cls.rating !== "good") {
      suggestions.push("CLS不稳定,建议: 为图片和视频设置尺寸属性、避免在现有内容上方插入内容、使用transform动画")
    }

    const fcp = metrics.get("FCP")
    if (fcp && fcp.rating !== "good") {
      suggestions.push("FCP较慢,建议: 减少阻塞渲染的资源、内联关键CSS、延迟加载非关键资源")
    }

    if (suggestions.length === 0) {
      suggestions.push("性能表现良好,继续保持!")
    }

    return suggestions
  }

  // FCP评级
  private getFCPRating(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 1800) return "good"
    if (value <= 3000) return "needs-improvement"
    return "poor"
  }

  // LCP评级
  private getLCPRating(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 2500) return "good"
    if (value <= 4000) return "needs-improvement"
    return "poor"
  }

  // FID评级
  private getFIDRating(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 100) return "good"
    if (value <= 300) return "needs-improvement"
    return "poor"
  }

  // CLS评级
  private getCLSRating(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 0.1) return "good"
    if (value <= 0.25) return "needs-improvement"
    return "poor"
  }

  // TTFB评级
  private getTTFBRating(value: number): "good" | "needs-improvement" | "poor" {
    if (value <= 800) return "good"
    if (value <= 1800) return "needs-improvement"
    return "poor"
  }

  // 生成ID
  private generateId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 清理旧报告
  clearOldReports(daysToKeep = 7): void {
    const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000
    this.reports = this.reports.filter((r) => r.timestamp > cutoff)
  }

  // 导出报告
  exportReports(): string {
    return JSON.stringify(this.reports, null, 2)
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Layout Shift Entry 类型定义
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}
