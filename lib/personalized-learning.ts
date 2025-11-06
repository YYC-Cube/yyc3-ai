// 个性化学习系统 - 整合学习追踪、大数据洞察和情感智能
import { learningTracker, type LearningProgress } from "./learning-tracker"
import { bigDataInsights } from "./big-data-insights"
import { emotionalIntelligence } from "./emotional-intelligence"
import { type OpenAIConfig, getOpenAIConfig } from "./openai-config"

export interface PersonalizedRecommendation {
  id: string
  type: "topic" | "resource" | "practice" | "review"
  title: string
  description: string
  reason: string
  priority: "high" | "medium" | "low"
  estimatedTime: number // 分钟
  difficulty: "beginner" | "intermediate" | "advanced"
  resources: LearningResource[]
}

export interface LearningResource {
  type: "article" | "video" | "tutorial" | "exercise" | "project"
  title: string
  url: string
  duration: number
  rating: number
}

export interface LearningGoal {
  id: string
  title: string
  description: string
  targetDate: Date
  progress: number
  milestones: Milestone[]
  isCompleted: boolean
}

export interface Milestone {
  id: string
  title: string
  isCompleted: boolean
  completedAt?: Date
}

export interface StudySession {
  id: string
  topic: string
  startTime: Date
  endTime?: Date
  focusScore: number // 0-100
  productivity: number // 0-100
  breaks: number
  notes: string[]
}

class PersonalizedLearningSystem {
  private config: OpenAIConfig | null = null
  private goals: Map<string, LearningGoal> = new Map()
  private sessions: StudySession[] = []
  private currentSession: StudySession | null = null

  constructor() {
    this.config = getOpenAIConfig()
    this.loadGoals()
    this.loadSessions()
  }

  // 获取个性化推荐
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendation[]> {
    const progress = learningTracker.getProgress()
    const stats = learningTracker.getStatistics()
    const emotionalState = emotionalIntelligence.detectEmotion("")
    const insights = bigDataInsights.generateInsights(progress.currentLevel, "")

    const recommendations: PersonalizedRecommendation[] = []

    // 基于薄弱环节推荐
    for (const weakness of stats.weaknesses.slice(0, 2)) {
      recommendations.push({
        id: `rec-weakness-${Date.now()}`,
        type: "review",
        title: `复习 ${weakness}`,
        description: `您在 ${weakness} 方面还需要加强`,
        reason: "基于学习数据分析,这是您的薄弱环节",
        priority: "high",
        estimatedTime: 30,
        difficulty: progress.currentLevel,
        resources: this.getResourcesForTopic(weakness),
      })
    }

    // 基于学习路径推荐
    const nextTopics = this.getNextTopicsInPath(progress)
    if (nextTopics.length > 0) {
      recommendations.push({
        id: `rec-next-${Date.now()}`,
        type: "topic",
        title: `学习 ${nextTopics[0]}`,
        description: `根据您的学习进度,建议学习这个新主题`,
        reason: "符合您当前的学习路径",
        priority: "medium",
        estimatedTime: 45,
        difficulty: progress.currentLevel,
        resources: this.getResourcesForTopic(nextTopics[0]),
      })
    }

    // 基于情绪状态推荐
    if (emotionalState.emotion === "frustrated") {
      recommendations.push({
        id: `rec-emotion-${Date.now()}`,
        type: "practice",
        title: "轻松练习",
        description: "做一些简单的练习题,重建信心",
        reason: "检测到您可能感到挫折,建议从简单的开始",
        priority: "high",
        estimatedTime: 20,
        difficulty: "beginner",
        resources: [],
      })
    }

    // 基于大数据洞察推荐
    if (insights.commonPitfalls.length > 0) {
      const pitfall = insights.commonPitfalls[0]
      recommendations.push({
        id: `rec-pitfall-${Date.now()}`,
        type: "resource",
        title: `避免常见错误: ${pitfall.title}`,
        description: pitfall.description,
        reason: `${pitfall.affectedPercentage}% 的学习者在这里遇到问题`,
        priority: "medium",
        estimatedTime: 15,
        difficulty: progress.currentLevel,
        resources: [],
      })
    }

    // 基于学习时间推荐
    const recentActivity = progress.nodes.filter((n) => Date.now() - n.timestamp < 24 * 60 * 60 * 1000)
    if (recentActivity.length === 0) {
      recommendations.push({
        id: `rec-time-${Date.now()}`,
        type: "topic",
        title: "开始今天的学习",
        description: "您今天还没有学习,建议开始一个新主题",
        reason: "保持学习习惯很重要",
        priority: "high",
        estimatedTime: 30,
        difficulty: progress.currentLevel,
        resources: [],
      })
    }

    // 按优先级排序
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return recommendations.slice(0, 5)
  }

  // 创建学习目标
  createGoal(title: string, description: string, targetDate: Date, milestones: string[]): LearningGoal {
    const goal: LearningGoal = {
      id: `goal-${Date.now()}`,
      title,
      description,
      targetDate,
      progress: 0,
      milestones: milestones.map((m, i) => ({
        id: `milestone-${i}`,
        title: m,
        isCompleted: false,
      })),
      isCompleted: false,
    }

    this.goals.set(goal.id, goal)
    this.saveGoals()

    return goal
  }

  // 更新目标进度
  updateGoalProgress(goalId: string, milestoneId: string, completed: boolean): void {
    const goal = this.goals.get(goalId)
    if (!goal) return

    const milestone = goal.milestones.find((m) => m.id === milestoneId)
    if (milestone) {
      milestone.isCompleted = completed
      if (completed) {
        milestone.completedAt = new Date()
      }
    }

    // 计算总进度
    const completedCount = goal.milestones.filter((m) => m.isCompleted).length
    goal.progress = Math.round((completedCount / goal.milestones.length) * 100)

    // 检查是否完成
    if (goal.progress === 100) {
      goal.isCompleted = true
    }

    this.saveGoals()
  }

  // 获取所有目标
  getAllGoals(): LearningGoal[] {
    return Array.from(this.goals.values())
  }

  // 开始学习会话
  startStudySession(topic: string): StudySession {
    this.currentSession = {
      id: `session-${Date.now()}`,
      topic,
      startTime: new Date(),
      focusScore: 100,
      productivity: 100,
      breaks: 0,
      notes: [],
    }

    return this.currentSession
  }

  // 结束学习会话
  endStudySession(): StudySession | null {
    if (!this.currentSession) return null

    this.currentSession.endTime = new Date()
    this.sessions.push(this.currentSession)
    this.saveSessions()

    // 记录到学习追踪器
    const duration = Math.floor(
      (this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000,
    )

    learningTracker.recordLearningNode({
      topic: this.currentSession.topic,
      category: "学习会话",
      duration,
      difficulty: "intermediate",
      mastery: this.currentSession.productivity,
      interactions: this.currentSession.notes.length,
      errors: [],
      questions: this.currentSession.notes,
    })

    const session = this.currentSession
    this.currentSession = null

    return session
  }

  // 添加会话笔记
  addSessionNote(note: string): void {
    if (this.currentSession) {
      this.currentSession.notes.push(note)
    }
  }

  // 记录休息
  recordBreak(): void {
    if (this.currentSession) {
      this.currentSession.breaks++
    }
  }

  // 更新专注度
  updateFocusScore(score: number): void {
    if (this.currentSession) {
      this.currentSession.focusScore = Math.max(0, Math.min(100, score))
    }
  }

  // 获取学习会话历史
  getSessionHistory(limit?: number): StudySession[] {
    const sorted = [...this.sessions].sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  // 获取学习统计
  getStudyStatistics() {
    const totalSessions = this.sessions.length
    const totalTime = this.sessions.reduce((sum, s) => {
      if (s.endTime) {
        return sum + (s.endTime.getTime() - s.startTime.getTime()) / 1000 / 60
      }
      return sum
    }, 0)

    const avgFocus = totalSessions > 0 ? this.sessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions : 0

    const avgProductivity =
      totalSessions > 0 ? this.sessions.reduce((sum, s) => sum + s.productivity, 0) / totalSessions : 0

    const last7Days = this.sessions.filter((s) => Date.now() - s.startTime.getTime() < 7 * 24 * 60 * 60 * 1000)

    return {
      totalSessions,
      totalTime: Math.round(totalTime),
      averageFocus: Math.round(avgFocus),
      averageProductivity: Math.round(avgProductivity),
      last7DaysSessions: last7Days.length,
      totalBreaks: this.sessions.reduce((sum, s) => sum + s.breaks, 0),
      totalNotes: this.sessions.reduce((sum, s) => sum + s.notes.length, 0),
    }
  }

  // 生成学习报告
  async generateLearningReport(): Promise<string> {
    const progress = learningTracker.getProgress()
    const stats = learningTracker.getStatistics()
    const studyStats = this.getStudyStatistics()
    const goals = this.getAllGoals()

    let report = `# 学习报告\n\n`
    report += `生成时间: ${new Date().toLocaleString("zh-CN")}\n\n`

    report += `## 总体进度\n`
    report += `- 当前等级: ${this.getLevelLabel(progress.currentLevel)}\n`
    report += `- 已学习主题: ${stats.totalTopics} 个\n`
    report += `- 总学习时长: ${Math.round(stats.totalTime / 60)} 分钟\n`
    report += `- 平均掌握度: ${stats.averageMastery}%\n\n`

    report += `## 学习会话统计\n`
    report += `- 总会话数: ${studyStats.totalSessions}\n`
    report += `- 总学习时间: ${studyStats.totalTime} 分钟\n`
    report += `- 平均专注度: ${studyStats.averageFocus}%\n`
    report += `- 平均生产力: ${studyStats.averageProductivity}%\n\n`

    report += `## 优势领域\n`
    if (stats.strengths.length > 0) {
      stats.strengths.forEach((s) => {
        report += `- ${s}\n`
      })
    } else {
      report += `暂无\n`
    }
    report += `\n`

    report += `## 需要加强\n`
    if (stats.weaknesses.length > 0) {
      stats.weaknesses.forEach((w) => {
        report += `- ${w}\n`
      })
    } else {
      report += `暂无\n`
    }
    report += `\n`

    report += `## 学习目标\n`
    if (goals.length > 0) {
      goals.forEach((g) => {
        report += `- ${g.title}: ${g.progress}% 完成\n`
      })
    } else {
      report += `暂无设定目标\n`
    }

    return report
  }

  // 私有方法
  private getNextTopicsInPath(progress: LearningProgress): string[] {
    const completed = new Set(progress.nodes.map((n) => n.topic))
    const paths: Record<string, string[]> = {
      beginner: ["变量与数据类型", "运算符", "条件语句", "循环", "函数"],
      intermediate: ["列表", "字典", "面向对象", "异常处理", "文件操作"],
      advanced: ["装饰器", "生成器", "Web爬虫", "API开发", "数据可视化"],
    }

    const path = paths[progress.currentLevel] || paths.beginner
    return path.filter((t) => !completed.has(t))
  }

  private getResourcesForTopic(topic: string): LearningResource[] {
    // 模拟资源数据
    return [
      {
        type: "tutorial",
        title: `${topic} 教程`,
        url: "#",
        duration: 30,
        rating: 4.5,
      },
      {
        type: "exercise",
        title: `${topic} 练习题`,
        url: "#",
        duration: 20,
        rating: 4.0,
      },
    ]
  }

  private getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      beginner: "初学者",
      intermediate: "中级",
      advanced: "高级",
    }
    return labels[level] || level
  }

  private saveGoals(): void {
    try {
      const data = Array.from(this.goals.values())
      localStorage.setItem("learning-goals", JSON.stringify(data))
    } catch (error) {
      console.error("[v0] Failed to save goals:", error)
    }
  }

  private loadGoals(): void {
    try {
      const data = localStorage.getItem("learning-goals")
      if (data) {
        const goals: LearningGoal[] = JSON.parse(data)
        goals.forEach((g) => {
          this.goals.set(g.id, {
            ...g,
            targetDate: new Date(g.targetDate),
          })
        })
      }
    } catch (error) {
      console.error("[v0] Failed to load goals:", error)
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem("study-sessions", JSON.stringify(this.sessions))
    } catch (error) {
      console.error("[v0] Failed to save sessions:", error)
    }
  }

  private loadSessions(): void {
    try {
      const data = localStorage.getItem("study-sessions")
      if (data) {
        this.sessions = JSON.parse(data).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        }))
      }
    } catch (error) {
      console.error("[v0] Failed to load sessions:", error)
    }
  }
}

export const personalizedLearning = new PersonalizedLearningSystem()
export default personalizedLearning
