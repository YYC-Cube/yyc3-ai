"use client"

import { useState, useEffect } from "react"
import { Heart, TrendingUp, Sparkles, Award } from "lucide-react"
import { emotionalIntelligence, type EmotionalState, type ProgressComparison } from "@/lib/emotional-intelligence"

interface EmotionalFeedbackProps {
  messages: string[]
  recentErrors: number
  sessionDuration: number
}

export default function EmotionalFeedback({ messages, recentErrors, sessionDuration }: EmotionalFeedbackProps) {
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null)
  const [progressComparisons, setProgressComparisons] = useState<ProgressComparison[]>([])
  const [showEncouragement, setShowEncouragement] = useState(false)

  useEffect(() => {
    analyzeEmotion()
  }, [messages, recentErrors])

  const analyzeEmotion = () => {
    const state = emotionalIntelligence.detectEmotion(messages, recentErrors, sessionDuration)
    setEmotionalState(state)

    // 生成数据化鼓励
    const comparisons = emotionalIntelligence.generateDataDrivenEncouragement()
    setProgressComparisons(comparisons)
  }

  if (!emotionalState) return null

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "frustrated":
        return "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
      case "confused":
        return "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/20"
      case "confident":
        return "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20"
      case "curious":
        return "border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20"
      case "excited":
        return "border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/20"
      case "tired":
        return "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
      default:
        return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    }
  }

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case "frustrated":
        return "😤"
      case "confused":
        return "🤔"
      case "confident":
        return "😊"
      case "curious":
        return "🧐"
      case "excited":
        return "🎉"
      case "tired":
        return "😴"
      default:
        return "😐"
    }
  }

  const getEmotionText = (emotion: string) => {
    switch (emotion) {
      case "frustrated":
        return "遇到困难"
      case "confused":
        return "有点困惑"
      case "confident":
        return "信心满满"
      case "curious":
        return "充满好奇"
      case "excited":
        return "兴奋激动"
      case "tired":
        return "需要休息"
      default:
        return "状态正常"
    }
  }

  // 只在非中性情绪时显示
  if (emotionalState.emotion === "neutral" && progressComparisons.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* 情绪状态卡片 */}
      {emotionalState.emotion !== "neutral" && (
        <div className={`rounded-xl border p-4 ${getEmotionColor(emotionalState.emotion)}`}>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-2xl">{getEmotionEmoji(emotionalState.emotion)}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{getEmotionText(emotionalState.emotion)}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/50 dark:bg-zinc-900/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{ width: `${emotionalState.intensity}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-2 text-sm text-zinc-700 dark:text-zinc-300">{emotionalState.suggestedResponse}</div>

          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Heart className="h-3.5 w-3.5" />
            {emotionalState.encouragement}
          </div>
        </div>
      )}

      {/* 数据化鼓励 */}
      {progressComparisons.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-green-600" />
              你的进步数据
            </h4>
            <button
              onClick={() => setShowEncouragement(!showEncouragement)}
              className="text-xs text-purple-600 hover:underline dark:text-purple-400"
            >
              {showEncouragement ? "收起" : "查看详情"}
            </button>
          </div>

          <div className="space-y-2">
            {progressComparisons.slice(0, showEncouragement ? undefined : 2).map((comparison, index) => (
              <div
                key={index}
                className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-3 dark:from-green-950/20 dark:to-blue-950/20"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{comparison.metric}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                    <Award className="h-3 w-3" />+{comparison.improvement}
                    {comparison.metric.includes("率") || comparison.metric.includes("度") ? "%" : ""}
                  </span>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300">{comparison.message}</div>
              </div>
            ))}
          </div>

          {progressComparisons.length > 2 && !showEncouragement && (
            <div className="mt-2 text-center text-xs text-zinc-500">
              还有 {progressComparisons.length - 2} 项进步数据
            </div>
          )}
        </div>
      )}

      {/* 特殊鼓励消息 */}
      {emotionalState.emotion === "confident" && (
        <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-900/30 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-900 dark:text-purple-100">
              你的学习能力很强!准备好挑战更高级的内容了吗?
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
