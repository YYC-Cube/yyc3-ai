"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Zap, AlertTriangle, Play, Pause } from "lucide-react"
import { performanceMonitor, type PerformanceMetrics, type OptimizationSuggestion } from "@/lib/performance-monitor"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PerformanceMonitorPanel() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([])
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    if (isMonitoring) {
      performanceMonitor.startMonitoring(1000)
      const interval = setInterval(() => {
        const latest = performanceMonitor.getLatestMetrics()
        const historical = performanceMonitor.getHistoricalMetrics(20)
        setMetrics(latest)
        setHistoricalData(historical)
        setReport(performanceMonitor.generateReport())
      }, 1000)
      return () => clearInterval(interval)
    } else {
      performanceMonitor.stopMonitoring()
    }
  }, [isMonitoring])

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 75) return "text-blue-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getPriorityColor = (priority: OptimizationSuggestion["priority"]) => {
    const colors = {
      high: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
      medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      low: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    }
    return colors[priority]
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">性能监控</h3>
          {isMonitoring && (
            <Badge variant="default" className="animate-pulse">
              监控中
            </Badge>
          )}
        </div>
        <Button size="sm" variant={isMonitoring ? "destructive" : "default"} onClick={toggleMonitoring}>
          {isMonitoring ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              停止监控
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              开始监控
            </>
          )}
        </Button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {!metrics ? (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="mb-2">性能监控未启动</p>
              <p className="text-sm">点击"开始监控"按钮开始收集性能数据</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 性能评分 */}
            {report && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-500 mb-1">性能评分</h4>
                    <div className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
                      {report.score}
                      <span className="text-lg text-zinc-400">/100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={report.score >= 75 ? "default" : "destructive"} className="text-2xl px-4 py-2">
                      {report.grade}
                    </Badge>
                  </div>
                </div>
                <Progress value={report.score} className="h-2" />
              </Card>
            )}

            {/* 实时指标 */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="text-xs text-zinc-500 mb-1">FPS</div>
                <div className="text-2xl font-bold">{metrics.fps}</div>
                <Progress value={(metrics.fps / 60) * 100} className="h-1 mt-2" />
              </Card>
              <Card className="p-3">
                <div className="text-xs text-zinc-500 mb-1">内存使用</div>
                <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
                <Progress value={metrics.memory.percentage} className="h-1 mt-2" />
              </Card>
              <Card className="p-3">
                <div className="text-xs text-zinc-500 mb-1">网络请求</div>
                <div className="text-2xl font-bold">{metrics.network.requests}</div>
                <div className="text-xs text-zinc-500 mt-1">{metrics.network.slowRequests} 个慢请求</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-zinc-500 mb-1">DOM 节点</div>
                <div className="text-2xl font-bold">{metrics.rendering.domNodes}</div>
                <div className="text-xs text-zinc-500 mt-1">渲染时间: {metrics.rendering.paintTime}ms</div>
              </Card>
            </div>

            {/* 标签页 */}
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="charts" className="flex-1">
                  图表
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">
                  优化建议 {report && `(${report.suggestions.length})`}
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  详细信息
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-4 mt-4">
                {historicalData.length > 0 && (
                  <>
                    <Card className="p-4">
                      <h4 className="text-sm font-semibold mb-3">FPS 趋势</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis domain={[0, 60]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="fps" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-4">
                      <h4 className="text-sm font-semibold mb-3">内存使用趋势</h4>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="memory.percentage" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-2 mt-4">
                {report && report.suggestions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <Zap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>性能良好,暂无优化建议</p>
                  </div>
                ) : (
                  report?.suggestions.map((suggestion: OptimizationSuggestion) => (
                    <Card key={suggestion.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded ${getPriorityColor(suggestion.priority)}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="font-medium text-sm">{suggestion.title}</h5>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{suggestion.description}</p>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium text-red-600 dark:text-red-400">影响: </span>
                              <span className="text-zinc-600 dark:text-zinc-400">{suggestion.impact}</span>
                            </div>
                            <div>
                              <span className="font-medium text-green-600 dark:text-green-400">解决方案: </span>
                              <span className="text-zinc-600 dark:text-zinc-400">{suggestion.solution}</span>
                            </div>
                          </div>
                          {suggestion.code && (
                            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded mt-2 overflow-x-auto">
                              <code>{suggestion.code}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-3 mt-4">
                <Card className="p-3">
                  <h4 className="text-sm font-semibold mb-2">内存详情</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">已使用:</span>
                      <span className="font-medium">{metrics.memory.used} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">总计:</span>
                      <span className="font-medium">{metrics.memory.total} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">限制:</span>
                      <span className="font-medium">{metrics.memory.limit} MB</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <h4 className="text-sm font-semibold mb-2">网络详情</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">请求数:</span>
                      <span className="font-medium">{metrics.network.requests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">总大小:</span>
                      <span className="font-medium">{metrics.network.totalSize} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">平均时间:</span>
                      <span className="font-medium">{metrics.network.averageTime} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">慢请求:</span>
                      <span className="font-medium">{metrics.network.slowRequests}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <h4 className="text-sm font-semibold mb-2">JavaScript 详情</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">执行时间:</span>
                      <span className="font-medium">{metrics.javascript.executionTime} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">长任务:</span>
                      <span className="font-medium">{metrics.javascript.longTasks}</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
