// 性能监控与智能优化系统
export interface PerformanceMetrics {
  fps: number
  memory: MemoryMetrics
  network: NetworkMetrics
  rendering: RenderingMetrics
  javascript: JavaScriptMetrics
  timestamp: string
}

export interface MemoryMetrics {
  used: number
  total: number
  limit: number
  percentage: number
}

export interface NetworkMetrics {
  requests: number
  totalSize: number
  averageTime: number
  slowRequests: number
}

export interface RenderingMetrics {
  paintTime: number
  layoutTime: number
  domNodes: number
  reflows: number
}

export interface JavaScriptMetrics {
  executionTime: number
  longTasks: number
  eventListeners: number
}

export interface OptimizationSuggestion {
  id: string
  category: "memory" | "network" | "rendering" | "javascript"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  impact: string
  solution: string
  code?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private isMonitoring = false
  private monitoringInterval: any = null

  // 开始监控
  startMonitoring(interval = 1000): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
    }, interval)
  }

  // 停止监控
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    this.isMonitoring = false
  }

  // 收集性能指标
  private collectMetrics(): void {
    const metrics: PerformanceMetrics = {
      fps: this.measureFPS(),
      memory: this.measureMemory(),
      network: this.measureNetwork(),
      rendering: this.measureRendering(),
      javascript: this.measureJavaScript(),
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metrics)

    // 只保留最近100条记录
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  // 测量 FPS
  private measureFPS(): number {
    // 简化的 FPS 测量
    if (typeof window !== "undefined" && "performance" in window) {
      const entries = performance.getEntriesByType("frame")
      if (entries.length > 0) {
        return Math.round(1000 / (entries[entries.length - 1] as any).duration)
      }
    }
    return 60 // 默认值
  }

  // 测量内存使用
  private measureMemory(): MemoryMetrics {
    if (typeof window !== "undefined" && "performance" in window && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
      }
    }
    return { used: 0, total: 0, limit: 0, percentage: 0 }
  }

  // 测量网络性能
  private measureNetwork(): NetworkMetrics {
    if (typeof window !== "undefined" && "performance" in window) {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      const requests = resources.length
      const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0)
      const averageTime =
        resources.length > 0 ? resources.reduce((sum, r) => sum + r.duration, 0) / resources.length : 0
      const slowRequests = resources.filter((r) => r.duration > 1000).length

      return {
        requests,
        totalSize: Math.round(totalSize / 1024),
        averageTime: Math.round(averageTime),
        slowRequests,
      }
    }
    return { requests: 0, totalSize: 0, averageTime: 0, slowRequests: 0 }
  }

  // 测量渲染性能
  private measureRendering(): RenderingMetrics {
    if (typeof window !== "undefined" && "performance" in window) {
      const paintEntries = performance.getEntriesByType("paint")
      const paintTime = paintEntries.length > 0 ? Math.round(paintEntries[paintEntries.length - 1].startTime) : 0

      const domNodes = document.querySelectorAll("*").length

      return {
        paintTime,
        layoutTime: 0,
        domNodes,
        reflows: 0,
      }
    }
    return { paintTime: 0, layoutTime: 0, domNodes: 0, reflows: 0 }
  }

  // 测量 JavaScript 性能
  private measureJavaScript(): JavaScriptMetrics {
    if (typeof window !== "undefined" && "performance" in window) {
      const measures = performance.getEntriesByType("measure")
      const executionTime = measures.reduce((sum, m) => sum + m.duration, 0)
      const longTasks = measures.filter((m) => m.duration > 50).length

      return {
        executionTime: Math.round(executionTime),
        longTasks,
        eventListeners: 0,
      }
    }
    return { executionTime: 0, longTasks: 0, eventListeners: 0 }
  }

  // 获取最新指标
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  // 获取历史指标
  getHistoricalMetrics(count = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count)
  }

  // 分析性能并生成优化建议
  analyzePerformance(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const latest = this.getLatestMetrics()

    if (!latest) return suggestions

    // 内存优化建议
    if (latest.memory.percentage > 80) {
      suggestions.push({
        id: "memory-high",
        category: "memory",
        priority: "high",
        title: "内存使用过高",
        description: `当前内存使用率 ${latest.memory.percentage}%,接近限制`,
        impact: "可能导致页面卡顿或崩溃",
        solution: "检查是否存在内存泄漏,移除未使用的变量和事件监听器",
        code: `// 清理事件监听器\ncomponent.removeEventListener('click', handler)\n\n// 清理定时器\nclearInterval(intervalId)\n\n// 清理大对象\nlargeObject = null`,
      })
    }

    // FPS 优化建议
    if (latest.fps < 30) {
      suggestions.push({
        id: "fps-low",
        category: "rendering",
        priority: "high",
        title: "帧率过低",
        description: `当前 FPS 为 ${latest.fps},低于流畅标准`,
        impact: "用户体验不佳,页面卡顿",
        solution: "优化动画,减少重绘和回流,使用 CSS transform 代替 position",
        code: `// 使用 transform 代替 left/top\n.element {\n  transform: translateX(100px);\n  will-change: transform;\n}`,
      })
    }

    // 网络优化建议
    if (latest.network.slowRequests > 3) {
      suggestions.push({
        id: "network-slow",
        category: "network",
        priority: "medium",
        title: "存在慢速网络请求",
        description: `发现 ${latest.network.slowRequests} 个超过 1 秒的请求`,
        impact: "页面加载缓慢,用户等待时间长",
        solution: "使用缓存,压缩资源,实现懒加载",
        code: `// 使用缓存\nfetch(url, { cache: 'force-cache' })\n\n// 懒加载图片\n<img loading="lazy" src="image.jpg" />`,
      })
    }

    // DOM 节点优化建议
    if (latest.rendering.domNodes > 1500) {
      suggestions.push({
        id: "dom-large",
        category: "rendering",
        priority: "medium",
        title: "DOM 节点过多",
        description: `当前页面有 ${latest.rendering.domNodes} 个 DOM 节点`,
        impact: "渲染性能下降,内存占用增加",
        solution: "使用虚拟滚动,延迟渲染,减少不必要的 DOM 元素",
        code: `// 使用虚拟滚动\nimport { VirtualScroller } from 'virtual-scroller'\n\n<VirtualScroller items={items} />`,
      })
    }

    // JavaScript 执行优化
    if (latest.javascript.longTasks > 5) {
      suggestions.push({
        id: "js-long-tasks",
        category: "javascript",
        priority: "high",
        title: "JavaScript 长任务过多",
        description: `发现 ${latest.javascript.longTasks} 个超过 50ms 的长任务`,
        impact: "阻塞主线程,导致页面无响应",
        solution: "拆分长任务,使用 Web Workers,实现代码分割",
        code: `// 使用 Web Worker\nconst worker = new Worker('worker.js')\nworker.postMessage(data)\n\n// 代码分割\nconst module = await import('./heavy-module.js')`,
      })
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  // 生成性能报告
  generateReport(): {
    score: number
    grade: string
    summary: string
    metrics: PerformanceMetrics | null
    suggestions: OptimizationSuggestion[]
  } {
    const latest = this.getLatestMetrics()
    const suggestions = this.analyzePerformance()

    let score = 100

    if (latest) {
      // 根据各项指标计算分数
      if (latest.fps < 60) score -= (60 - latest.fps) * 0.5
      if (latest.memory.percentage > 50) score -= (latest.memory.percentage - 50) * 0.3
      if (latest.network.slowRequests > 0) score -= latest.network.slowRequests * 5
      if (latest.rendering.domNodes > 1000) score -= (latest.rendering.domNodes - 1000) * 0.01
      if (latest.javascript.longTasks > 0) score -= latest.javascript.longTasks * 3
    }

    score = Math.max(0, Math.min(100, Math.round(score)))

    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F"

    const summary =
      `性能评分: ${score}/100 (${grade})\n` +
      `发现 ${suggestions.length} 个优化建议\n` +
      `${suggestions.filter((s) => s.priority === "high").length} 个高优先级问题需要立即处理`

    return {
      score,
      grade,
      summary,
      metrics: latest,
      suggestions,
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()
export default performanceMonitor
