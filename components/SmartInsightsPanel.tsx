"use client"

import { useState, useEffect } from "react"
import { Lightbulb, TrendingUp, AlertTriangle, Zap, ChevronRight } from "lucide-react"
import { bigDataInsights, type DataDrivenInsight } from "@/lib/big-data-insights"
import { learningTracker } from "@/lib/learning-tracker"

export default function SmartInsightsPanel({ currentTopic }: { currentTopic?: string }) {
  const [insights, setInsights] = useState<DataDrivenInsight[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [topTrends, setTopTrends] = useState<any[]>([])

  useEffect(() => {
    loadInsights()
  }, [currentTopic])

  const loadInsights = () => {
    const progress = learningTracker.getProgress()
    const topic = currentTopic || "编程"

    // 生成洞察
    const generatedInsights = bigDataInsights.generateInsights(topic, progress.currentLevel)
    setInsights(generatedInsights)

    // 生成个性化建议
    const completedTopics = [...new Set(progress.nodes.map((n) => n.topic))]
    const personalizedRecs = bigDataInsights.generatePersonalizedRecommendations(
      completedTopics,
      progress.weaknesses,
      progress.currentLevel,
    )
    setRecommendations(personalizedRecs)

    // 获取热门趋势
    const trends = bigDataInsights.getTopTrends(3)
    setTopTrends(trends)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pitfall":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "pattern":
        return <TrendingUp className="h-5 w-5 text-blue-500" />
      case "trend":
        return <Zap className="h-5 w-5 text-purple-500" />
      case "optimization":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
      case "medium":
        return "border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20"
      case "low":
        return "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
      default:
        return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    }
  }

  return (
    <div className="space-y-4">
      {/* 智能洞察卡片 */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4" />
            智能洞察
          </h3>
          {insights.map((insight, index) => (
            <div key={index} className={`rounded-xl border p-4 ${getPriorityColor(insight.priority)}`}>
              <div className="mb-2 flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="mb-1 font-medium text-sm">{insight.title}</div>
                  <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{insight.description}</div>
                  <div className="mb-2 rounded-lg bg-white/60 px-3 py-2 text-xs dark:bg-zinc-900/60">
                    <span className="font-medium">数据支撑:</span> {insight.data}
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-green-700 dark:text-green-400">{insight.actionable}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 个性化建议 */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4" />
            个性化学习建议
          </h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50">
                <span className="flex-shrink-0 font-bold text-purple-600 dark:text-purple-400">{index + 1}.</span>
                <span className="text-zinc-700 dark:text-zinc-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 技术趋势 */}
      {topTrends.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4 dark:border-zinc-800 dark:from-purple-950/20 dark:to-blue-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4" />
            热门技术趋势
          </h3>
          <div className="space-y-3">
            {topTrends.map((trend, index) => (
              <div key={index} className="rounded-lg bg-white/80 p-3 dark:bg-zinc-900/80">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-sm">{trend.technology}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{trend.category}</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      +{trend.growthRate}%
                    </span>
                  </div>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${trend.popularity}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {trend.useCases.slice(0, 3).map((useCase: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
