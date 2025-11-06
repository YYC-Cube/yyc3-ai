"use client"

import { useState, useEffect } from "react"
import { Target, CheckCircle2, Circle, Clock, TrendingUp, BookOpen, Play, Sparkles, BarChart3 } from "lucide-react"
import { learningPathPlanner, type LearningGoal, type LearningPath } from "@/lib/learning-path-planner"
import { learningTracker } from "@/lib/learning-tracker"
import AICodeAssistant from "./AICodeAssistant"
import LearningProgressPanel from "./LearningProgressPanel"
import SmartInsightsPanel from "./SmartInsightsPanel"

export default function LearningPathPlanner() {
  const [view, setView] = useState<"goals" | "active" | "assistant" | "progress">("active")
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [activePaths, setActivePaths] = useState<LearningPath[]>([])
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null)
  const [currentCode, setCurrentCode] = useState("")
  const [currentTopic, setCurrentTopic] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const progress = learningTracker.getProgress()
    const recommendedGoals = learningPathPlanner.recommendGoals(progress.currentLevel, [])
    setGoals(recommendedGoals)

    const paths = learningPathPlanner.getActivePaths()
    setActivePaths(paths)
  }

  const startLearningPath = (goalId: string) => {
    const path = learningPathPlanner.createLearningPath(goalId)
    if (path) {
      loadData()
      setView("active")
    }
  }

  const completeMilestone = (goalId: string, milestoneId: string) => {
    learningPathPlanner.completeMilestone(goalId, milestoneId)
    loadData()
  }

  const handleCodeGenerated = (code: string) => {
    setCurrentCode(code)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold mb-1">学习中心</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">个性化学习路径、AI代码助手和智能学习分析</p>
        </div>
        <div className="flex gap-2 px-6 pb-2">
          <button
            onClick={() => setView("active")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "active"
                ? "bg-purple-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="inline-block h-4 w-4 mr-2" />
            学习路径 ({activePaths.length})
          </button>
          <button
            onClick={() => setView("goals")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "goals"
                ? "bg-purple-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Target className="inline-block h-4 w-4 mr-2" />
            探索目标 ({goals.length})
          </button>
          <button
            onClick={() => setView("assistant")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "assistant"
                ? "bg-purple-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="inline-block h-4 w-4 mr-2" />
            AI 代码助手
          </button>
          <button
            onClick={() => setView("progress")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              view === "progress"
                ? "bg-purple-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <BarChart3 className="inline-block h-4 w-4 mr-2" />
            学习进度
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* AI 代码助手视图 */}
        {view === "assistant" && (
          <div className="h-full">
            <AICodeAssistant
              currentCode={currentCode}
              currentLanguage="javascript"
              onCodeGenerated={handleCodeGenerated}
            />
          </div>
        )}

        {/* 学习进度视图 */}
        {view === "progress" && (
          <div className="space-y-6">
            <LearningProgressPanel />
            <SmartInsightsPanel currentTopic={currentTopic} />
          </div>
        )}

        {/* 活跃路径视图 */}
        {view === "active" && (
          <div className="space-y-4">
            {activePaths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
                <Target className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
                <div className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">还没有开始学习路径</div>
                <div className="mb-4 text-sm text-zinc-500">选择一个学习目标,开始你的学习之旅</div>
                <button
                  onClick={() => setView("goals")}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                >
                  <Play className="h-4 w-4" />
                  探索学习目标
                </button>
              </div>
            ) : (
              activePaths.map((path) => (
                <div
                  key={path.goalId}
                  className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* 路径头部 */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold">{path.goalTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {path.currentMilestone}/{path.totalMilestones} 里程碑
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          预计完成: {formatDate(path.estimatedCompletion)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">{path.progress}%</div>
                      <div className="text-xs text-zinc-500">完成度</div>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>

                  {/* 下一步建议 */}
                  {path.nextSteps.length > 0 && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                        <TrendingUp className="h-4 w-4" />
                        下一步行动
                      </div>
                      <ul className="space-y-1">
                        {path.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 里程碑列表 */}
                  <div className="space-y-2">
                    {path.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`rounded-lg border p-3 transition-colors ${
                          milestone.completed
                            ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20"
                            : index === path.currentMilestone
                              ? "border-purple-200 bg-purple-50 dark:border-purple-900/30 dark:bg-purple-950/20"
                              : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {milestone.completed ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                          ) : (
                            <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-400" />
                          )}
                          <div className="flex-1">
                            <div className="mb-1 font-medium text-sm">{milestone.title}</div>
                            <div className="mb-2 text-xs text-zinc-600 dark:text-zinc-400">{milestone.description}</div>
                            <div className="flex flex-wrap gap-1">
                              {milestone.topics.slice(0, 3).map((topic, i) => (
                                <span
                                  key={i}
                                  className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                          {!milestone.completed && index === path.currentMilestone && (
                            <button
                              onClick={() => completeMilestone(path.goalId, milestone.id)}
                              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700"
                            >
                              完成
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 目标浏览视图 */}
        {view === "goals" && (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* 目标头部 */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">{goal.title}</h3>
                    <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{goal.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {goal.targetLevel === "beginner" && "初学者"}
                        {goal.targetLevel === "intermediate" && "进阶"}
                        {goal.targetLevel === "advanced" && "高级"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />约 {goal.estimatedTime} 小时
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {goal.milestones.length} 个里程碑
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startLearningPath(goal.id)}
                    className="ml-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4" />
                    开始学习
                  </button>
                </div>

                {/* 里程碑预览 */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-500">学习路线:</div>
                  <div className="flex flex-wrap gap-2">
                    {goal.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 text-xs dark:bg-zinc-800/50"
                      >
                        <span className="font-medium text-purple-600">{index + 1}</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{milestone.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
