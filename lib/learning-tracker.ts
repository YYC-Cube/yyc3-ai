// 学习进度追踪系统 - 记录和分析用户学习数据

export interface LearningNode {
  id: string
  topic: string // 学习主题,如 "Python 函数"
  category: string // 分类,如 "基础语法"
  timestamp: number
  duration: number // 学习时长(秒)
  difficulty: "beginner" | "intermediate" | "advanced"
  mastery: number // 掌握度 0-100
  interactions: number // 交互次数
  errors: string[] // 遇到的错误
  questions: string[] // 提出的问题
}

export interface LearningProgress {
  userId: string
  totalTime: number // 总学习时长
  nodes: LearningNode[]
  currentLevel: "beginner" | "intermediate" | "advanced"
  strengths: string[] // 擅长领域
  weaknesses: string[] // 薄弱环节
  nextRecommendations: string[] // 下一步建议
}

export interface ProgressSnapshot {
  timestamp: number
  category: string
  mastery: number
  topics: string[]
  remainingTopics: string[]
}

class LearningTracker {
  private storageKey = "learning_progress"

  // 获取学习进度
  getProgress(): LearningProgress {
    if (typeof window === "undefined") {
      return this.getDefaultProgress()
    }

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) {
      return this.getDefaultProgress()
    }

    try {
      return JSON.parse(stored)
    } catch {
      return this.getDefaultProgress()
    }
  }

  // 保存学习进度
  saveProgress(progress: LearningProgress): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.storageKey, JSON.stringify(progress))
  }

  // 记录学习节点
  recordLearningNode(node: Omit<LearningNode, "id" | "timestamp">): void {
    const progress = this.getProgress()
    const newNode: LearningNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    progress.nodes.push(newNode)
    progress.totalTime += node.duration

    // 更新当前等级
    progress.currentLevel = this.calculateLevel(progress)

    // 分析优势和劣势
    progress.strengths = this.analyzeStrengths(progress.nodes)
    progress.weaknesses = this.analyzeWeaknesses(progress.nodes)

    // 生成下一步建议
    progress.nextRecommendations = this.generateRecommendations(progress)

    this.saveProgress(progress)
  }

  // 更新主题掌握度
  updateMastery(topic: string, mastery: number): void {
    const progress = this.getProgress()
    const recentNodes = progress.nodes.filter((n) => n.topic === topic)

    if (recentNodes.length > 0) {
      recentNodes[recentNodes.length - 1].mastery = mastery
      this.saveProgress(progress)
    }
  }

  // 记录错误
  recordError(topic: string, error: string): void {
    const progress = this.getProgress()
    const recentNode = progress.nodes.filter((n) => n.topic === topic).pop()

    if (recentNode) {
      recentNode.errors.push(error)
      this.saveProgress(progress)
    }
  }

  // 记录问题
  recordQuestion(topic: string, question: string): void {
    const progress = this.getProgress()
    const recentNode = progress.nodes.filter((n) => n.topic === topic).pop()

    if (recentNode) {
      recentNode.questions.push(question)
      this.saveProgress(progress)
    }
  }

  // 获取进度快照
  getProgressSnapshot(category: string): ProgressSnapshot {
    const progress = this.getProgress()
    const categoryNodes = progress.nodes.filter((n) => n.category === category)

    const topics = [...new Set(categoryNodes.map((n) => n.topic))]
    const avgMastery =
      categoryNodes.length > 0 ? categoryNodes.reduce((sum, n) => sum + n.mastery, 0) / categoryNodes.length : 0

    const allTopics = this.getAllTopicsForCategory(category)
    const remainingTopics = allTopics.filter((t) => !topics.includes(t))

    return {
      timestamp: Date.now(),
      category,
      mastery: Math.round(avgMastery),
      topics,
      remainingTopics,
    }
  }

  // 获取学习统计
  getStatistics() {
    const progress = this.getProgress()
    const last7Days = progress.nodes.filter((n) => Date.now() - n.timestamp < 7 * 24 * 60 * 60 * 1000)

    return {
      totalTopics: new Set(progress.nodes.map((n) => n.topic)).size,
      totalTime: progress.totalTime,
      last7DaysTime: last7Days.reduce((sum, n) => sum + n.duration, 0),
      averageMastery:
        progress.nodes.length > 0
          ? Math.round(progress.nodes.reduce((sum, n) => sum + n.mastery, 0) / progress.nodes.length)
          : 0,
      totalErrors: progress.nodes.reduce((sum, n) => sum + n.errors.length, 0),
      totalQuestions: progress.nodes.reduce((sum, n) => sum + n.questions.length, 0),
      currentLevel: progress.currentLevel,
      strengths: progress.strengths,
      weaknesses: progress.weaknesses,
    }
  }

  // 私有方法
  private getDefaultProgress(): LearningProgress {
    return {
      userId: "default",
      totalTime: 0,
      nodes: [],
      currentLevel: "beginner",
      strengths: [],
      weaknesses: [],
      nextRecommendations: [],
    }
  }

  private calculateLevel(progress: LearningProgress): "beginner" | "intermediate" | "advanced" {
    const avgMastery =
      progress.nodes.length > 0 ? progress.nodes.reduce((sum, n) => sum + n.mastery, 0) / progress.nodes.length : 0

    const totalTopics = new Set(progress.nodes.map((n) => n.topic)).size

    if (avgMastery >= 70 && totalTopics >= 20) return "advanced"
    if (avgMastery >= 50 && totalTopics >= 10) return "intermediate"
    return "beginner"
  }

  private analyzeStrengths(nodes: LearningNode[]): string[] {
    const topicMastery = new Map<string, number[]>()

    nodes.forEach((node) => {
      if (!topicMastery.has(node.topic)) {
        topicMastery.set(node.topic, [])
      }
      topicMastery.get(node.topic)!.push(node.mastery)
    })

    const strengths: string[] = []
    topicMastery.forEach((masteries, topic) => {
      const avg = masteries.reduce((a, b) => a + b, 0) / masteries.length
      if (avg >= 75) {
        strengths.push(topic)
      }
    })

    return strengths.slice(0, 5)
  }

  private analyzeWeaknesses(nodes: LearningNode[]): string[] {
    const topicMastery = new Map<string, number[]>()

    nodes.forEach((node) => {
      if (!topicMastery.has(node.topic)) {
        topicMastery.set(node.topic, [])
      }
      topicMastery.get(node.topic)!.push(node.mastery)
    })

    const weaknesses: string[] = []
    topicMastery.forEach((masteries, topic) => {
      const avg = masteries.reduce((a, b) => a + b, 0) / masteries.length
      if (avg < 50) {
        weaknesses.push(topic)
      }
    })

    return weaknesses.slice(0, 5)
  }

  private generateRecommendations(progress: LearningProgress): string[] {
    const recommendations: string[] = []

    // 基于薄弱环节推荐
    if (progress.weaknesses.length > 0) {
      recommendations.push(`重点复习: ${progress.weaknesses[0]}`)
    }

    // 基于学习路径推荐
    const completedTopics = new Set(progress.nodes.map((n) => n.topic))
    const nextTopics = this.getNextTopics(completedTopics, progress.currentLevel)

    if (nextTopics.length > 0) {
      recommendations.push(`下一步学习: ${nextTopics[0]}`)
    }

    // 基于时间推荐
    const recentActivity = progress.nodes.filter((n) => Date.now() - n.timestamp < 24 * 60 * 60 * 1000)

    if (recentActivity.length === 0) {
      recommendations.push("建议今天开始新的学习主题")
    }

    return recommendations
  }

  private getAllTopicsForCategory(category: string): string[] {
    const topicMap: Record<string, string[]> = {
      基础语法: ["变量与数据类型", "运算符", "条件语句", "循环", "函数", "列表", "字典", "字符串操作"],
      进阶概念: ["面向对象", "异常处理", "文件操作", "模块与包", "装饰器", "生成器"],
      实战项目: ["待办清单", "数据分析", "Web爬虫", "API开发", "数据可视化"],
    }

    return topicMap[category] || []
  }

  private getNextTopics(completed: Set<string>, level: string): string[] {
    const learningPath: Record<string, string[]> = {
      beginner: ["变量与数据类型", "运算符", "条件语句", "循环", "函数"],
      intermediate: ["列表", "字典", "面向对象", "异常处理", "文件操作"],
      advanced: ["装饰器", "生成器", "Web爬虫", "API开发", "数据可视化"],
    }

    const path = learningPath[level] || learningPath.beginner
    return path.filter((topic) => !completed.has(topic))
  }
}

export const learningTracker = new LearningTracker()
