export interface UserProfile {
  id: string
  preferences: UserPreferences
  codingStyle: CodingStyle
  skillLevel: SkillLevel
  learningGoals: LearningGoal[]
  history: InteractionHistory
}

export interface UserPreferences {
  language: string[]
  frameworks: string[]
  codeStyle: "functional" | "oop" | "mixed"
  commentStyle: "verbose" | "minimal" | "standard"
  indentation: "spaces" | "tabs"
  spacesCount?: number
}

export interface CodingStyle {
  namingConvention: "camelCase" | "snake_case" | "PascalCase"
  functionLength: "short" | "medium" | "long"
  useTypeScript: boolean
  useAsync: boolean
  errorHandling: "try-catch" | "promises" | "mixed"
  patterns: string[]
}

export interface SkillLevel {
  overall: "beginner" | "intermediate" | "advanced" | "expert"
  languages: Record<string, number> // 0-100
  frameworks: Record<string, number>
  concepts: Record<string, number>
}

export interface LearningGoal {
  id: string
  title: string
  description: string
  targetDate?: Date
  progress: number
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export interface InteractionHistory {
  totalSessions: number
  totalCodeGenerated: number
  totalRefactorings: number
  totalErrors: number
  successRate: number
  commonPatterns: string[]
  recentActivity: Activity[]
}

export interface Activity {
  type: "generate" | "refactor" | "complete" | "explain" | "debug"
  timestamp: Date
  success: boolean
  context: string
}

export interface PersonalizedRecommendation {
  type: "feature" | "tutorial" | "practice" | "optimization"
  title: string
  description: string
  priority: number
  reason: string
}

export class AdaptiveLearningSystem {
  private userProfile: UserProfile | null = null

  constructor() {
    this.loadUserProfile()
  }

  // 初始化用户档案
  initializeProfile(userId: string): UserProfile {
    this.userProfile = {
      id: userId,
      preferences: this.detectInitialPreferences(),
      codingStyle: this.detectInitialStyle(),
      skillLevel: this.assessInitialSkillLevel(),
      learningGoals: [],
      history: {
        totalSessions: 0,
        totalCodeGenerated: 0,
        totalRefactorings: 0,
        totalErrors: 0,
        successRate: 0,
        commonPatterns: [],
        recentActivity: [],
      },
    }

    this.saveUserProfile()
    return this.userProfile
  }

  // 学习用户习惯
  async learnFromInteraction(interaction: {
    type: Activity["type"]
    code: string
    success: boolean
    context: string
  }): Promise<void> {
    if (!this.userProfile) return

    // 记录活动
    this.userProfile.history.recentActivity.unshift({
      type: interaction.type,
      timestamp: new Date(),
      success: interaction.success,
      context: interaction.context,
    })

    // 限制历史记录数量
    if (this.userProfile.history.recentActivity.length > 100) {
      this.userProfile.history.recentActivity.pop()
    }

    // 更新统计
    this.userProfile.history.totalSessions++
    if (interaction.type === "generate") this.userProfile.history.totalCodeGenerated++
    if (interaction.type === "refactor") this.userProfile.history.totalRefactorings++
    if (!interaction.success) this.userProfile.history.totalErrors++

    const successfulActivities = this.userProfile.history.recentActivity.filter((a) => a.success).length
    this.userProfile.history.successRate = successfulActivities / this.userProfile.history.recentActivity.length

    // 学习编码风格
    await this.updateCodingStyle(interaction.code)

    // 更新技能水平
    await this.updateSkillLevel(interaction)

    // 检测常用模式
    await this.detectCommonPatterns()

    this.saveUserProfile()
  }

  // 生成个性化推荐
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendation[]> {
    if (!this.userProfile) return []

    const recommendations: PersonalizedRecommendation[] = []

    // 基于技能水平推荐
    if (this.userProfile.skillLevel.overall === "beginner") {
      recommendations.push({
        type: "tutorial",
        title: "JavaScript基础教程",
        description: "从零开始学习JavaScript编程",
        priority: 10,
        reason: "检测到您是JavaScript初学者",
      })
    }

    // 基于错误率推荐
    if (this.userProfile.history.successRate < 0.7) {
      recommendations.push({
        type: "practice",
        title: "代码调试实战",
        description: "提升代码调试能力的练习项目",
        priority: 9,
        reason: "检测到代码成功率较低,建议加强调试练习",
      })
    }

    // 基于使用模式推荐
    if (this.userProfile.history.totalCodeGenerated > 100 && this.userProfile.history.totalRefactorings < 10) {
      recommendations.push({
        type: "optimization",
        title: "代码重构技巧",
        description: "学习如何优化和重构现有代码",
        priority: 8,
        reason: "您生成了大量代码,但重构次数较少",
      })
    }

    // 基于学习目标推荐
    this.userProfile.learningGoals.forEach((goal) => {
      if (goal.progress < 50) {
        recommendations.push({
          type: "practice",
          title: `${goal.title} - 练习项目`,
          description: goal.description,
          priority: 7,
          reason: `学习目标"${goal.title}"进度${goal.progress}%`,
        })
      }
    })

    // 基于技能缺口推荐
    const skillGaps = this.identifySkillGaps()
    skillGaps.forEach((gap, index) => {
      recommendations.push({
        type: "tutorial",
        title: `提升${gap}技能`,
        description: `${gap}相关的进阶教程`,
        priority: 6 - index,
        reason: `检测到${gap}技能水平较低`,
      })
    })

    // 按优先级排序
    return recommendations.sort((a, b) => b.priority - a.priority)
  }

  // 预测用户需求
  async predictUserIntent(context: { code: string; cursorPosition: any; recentActions: string[] }): Promise<string> {
    if (!this.userProfile) return "unknown"

    // 基于最近活动预测
    const recentTypes = this.userProfile.history.recentActivity.slice(0, 5).map((a) => a.type)

    if (recentTypes.filter((t) => t === "debug").length >= 3) {
      return "debugging"
    }

    if (recentTypes.filter((t) => t === "refactor").length >= 2) {
      return "optimization"
    }

    if (recentTypes.filter((t) => t === "generate").length >= 3) {
      return "rapid-development"
    }

    // 基于代码内容预测
    if (context.code.includes("TODO") || context.code.includes("FIXME")) {
      return "completion"
    }

    if (context.code.includes("test") || context.code.includes("spec")) {
      return "testing"
    }

    return "general-coding"
  }

  // 自适应调整建议
  async adaptSuggestions(baseSuggestions: any[], context: any): Promise<any[]> {
    if (!this.userProfile) return baseSuggestions

    // 根据用户编码风格调整
    const adaptedSuggestions = baseSuggestions.map((suggestion) => {
      let code = suggestion.code

      // 调整命名风格
      if (this.userProfile!.codingStyle.namingConvention === "snake_case") {
        code = this.convertToSnakeCase(code)
      }

      // 调整缩进
      if (this.userProfile!.preferences.indentation === "tabs") {
        code = code.replace(/ {2}/g, "\t")
      }

      // 调整TypeScript使用
      if (this.userProfile!.codingStyle.useTypeScript) {
        code = this.addTypeAnnotations(code)
      }

      return {
        ...suggestion,
        code,
      }
    })

    // 根据用户偏好排序
    return this.sortByUserPreference(adaptedSuggestions)
  }

  // 获取学习进度
  getLearningProgress(): {
    overallProgress: number
    goals: LearningGoal[]
    recentAchievements: string[]
    nextSteps: string[]
  } {
    if (!this.userProfile) {
      return {
        overallProgress: 0,
        goals: [],
        recentAchievements: [],
        nextSteps: [],
      }
    }

    const overallProgress = this.calculateOverallProgress()
    const recentAchievements = this.getRecentAchievements()
    const nextSteps = this.suggestNextSteps()

    return {
      overallProgress,
      goals: this.userProfile.learningGoals,
      recentAchievements,
      nextSteps,
    }
  }

  // 添加学习目标
  addLearningGoal(goal: Omit<LearningGoal, "id" | "progress">): void {
    if (!this.userProfile) return

    const newGoal: LearningGoal = {
      ...goal,
      id: Math.random().toString(36).slice(2),
      progress: 0,
    }

    this.userProfile.learningGoals.push(newGoal)
    this.saveUserProfile()
  }

  // 更新目标进度
  updateGoalProgress(goalId: string, progress: number): void {
    if (!this.userProfile) return

    const goal = this.userProfile.learningGoals.find((g) => g.id === goalId)
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress))
      this.saveUserProfile()
    }
  }

  // 辅助方法
  private detectInitialPreferences(): UserPreferences {
    return {
      language: ["javascript"],
      frameworks: [],
      codeStyle: "mixed",
      commentStyle: "standard",
      indentation: "spaces",
      spacesCount: 2,
    }
  }

  private detectInitialStyle(): CodingStyle {
    return {
      namingConvention: "camelCase",
      functionLength: "medium",
      useTypeScript: false,
      useAsync: true,
      errorHandling: "try-catch",
      patterns: [],
    }
  }

  private assessInitialSkillLevel(): SkillLevel {
    return {
      overall: "beginner",
      languages: { javascript: 40 },
      frameworks: {},
      concepts: {},
    }
  }

  private async updateCodingStyle(code: string): Promise<void> {
    if (!this.userProfile) return

    // 检测命名风格
    if (code.match(/[a-z]+_[a-z]+/)) {
      this.userProfile.codingStyle.namingConvention = "snake_case"
    } else if (code.match(/[A-Z][a-z]+[A-Z]/)) {
      this.userProfile.codingStyle.namingConvention = "PascalCase"
    }

    // 检测异步使用
    if (code.includes("async") || code.includes("await")) {
      this.userProfile.codingStyle.useAsync = true
    }

    // 检测TypeScript
    if (code.includes(": string") || code.includes(": number")) {
      this.userProfile.codingStyle.useTypeScript = true
    }

    // 检测错误处理
    if (code.includes("try") && code.includes("catch")) {
      this.userProfile.codingStyle.errorHandling = "try-catch"
    } else if (code.includes(".catch(")) {
      this.userProfile.codingStyle.errorHandling = "promises"
    }
  }

  private async updateSkillLevel(interaction: any): Promise<void> {
    if (!this.userProfile) return

    // 根据成功率调整技能水平
    if (interaction.success) {
      // 提升相关技能
      const relatedSkills = this.extractSkillsFromContext(interaction.context)
      relatedSkills.forEach((skill) => {
        const current = this.userProfile!.skillLevel.concepts[skill] || 0
        this.userProfile!.skillLevel.concepts[skill] = Math.min(100, current + 2)
      })
    }

    // 更新总体技能水平
    const avgSkill =
      Object.values(this.userProfile.skillLevel.concepts).reduce((a, b) => a + b, 0) /
        Object.keys(this.userProfile.skillLevel.concepts).length || 0

    if (avgSkill < 40) {
      this.userProfile.skillLevel.overall = "beginner"
    } else if (avgSkill < 70) {
      this.userProfile.skillLevel.overall = "intermediate"
    } else if (avgSkill < 90) {
      this.userProfile.skillLevel.overall = "advanced"
    } else {
      this.userProfile.skillLevel.overall = "expert"
    }
  }

  private async detectCommonPatterns(): Promise<void> {
    if (!this.userProfile) return

    const patterns: Record<string, number> = {}

    this.userProfile.history.recentActivity.forEach((activity) => {
      // 提取模式关键词
      const keywords = activity.context.match(/\b[a-z]{4,}\b/gi) || []
      keywords.forEach((keyword) => {
        patterns[keyword] = (patterns[keyword] || 0) + 1
      })
    })

    // 取频率最高的前10个
    this.userProfile.history.commonPatterns = Object.entries(patterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([pattern]) => pattern)
  }

  private identifySkillGaps(): string[] {
    if (!this.userProfile) return []

    const gaps: string[] = []
    const concepts = this.userProfile.skillLevel.concepts

    Object.entries(concepts).forEach(([concept, level]) => {
      if (level < 50) {
        gaps.push(concept)
      }
    })

    return gaps.slice(0, 5)
  }

  private extractSkillsFromContext(context: string): string[] {
    const skills: string[] = []

    if (context.includes("async") || context.includes("await")) skills.push("异步编程")
    if (context.includes("class")) skills.push("面向对象")
    if (context.includes("=>")) skills.push("函数式编程")
    if (context.includes("React")) skills.push("React")
    if (context.includes("useState")) skills.push("React Hooks")

    return skills
  }

  private convertToSnakeCase(code: string): string {
    return code.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase()
  }

  private addTypeAnnotations(code: string): string {
    // 简化实现：为函数参数添加any类型
    return code.replace(/function\s+(\w+)\s*$$([^)]*)$$/g, (match, name, params) => {
      const typedParams = params
        .split(",")
        .map((p: string) => {
          const trimmed = p.trim()
          return trimmed.includes(":") ? trimmed : `${trimmed}: any`
        })
        .join(", ")
      return `function ${name}(${typedParams})`
    })
  }

  private sortByUserPreference(suggestions: any[]): any[] {
    if (!this.userProfile) return suggestions

    return suggestions.sort((a, b) => {
      let scoreA = a.priority || 0
      let scoreB = b.priority || 0

      // 基于用户常用模式加分
      this.userProfile!.history.commonPatterns.forEach((pattern) => {
        if (a.code.includes(pattern)) scoreA += 1
        if (b.code.includes(pattern)) scoreB += 1
      })

      return scoreB - scoreA
    })
  }

  private calculateOverallProgress(): number {
    if (!this.userProfile || this.userProfile.learningGoals.length === 0) return 0

    const totalProgress = this.userProfile.learningGoals.reduce((sum, goal) => sum + goal.progress, 0)
    return Math.round(totalProgress / this.userProfile.learningGoals.length)
  }

  private getRecentAchievements(): string[] {
    if (!this.userProfile) return []

    const achievements: string[] = []

    // 检查完成的里程碑
    this.userProfile.learningGoals.forEach((goal) => {
      const recentCompleted = goal.milestones.filter(
        (m) => m.completed && m.completedAt && Date.now() - m.completedAt.getTime() < 7 * 24 * 60 * 60 * 1000,
      )

      recentCompleted.forEach((m) => {
        achievements.push(`完成: ${m.title}`)
      })
    })

    return achievements.slice(0, 5)
  }

  private suggestNextSteps(): string[] {
    if (!this.userProfile) return []

    const nextSteps: string[] = []

    // 基于当前进度建议
    const inProgressGoals = this.userProfile.learningGoals.filter((g) => g.progress > 0 && g.progress < 100)

    inProgressGoals.forEach((goal) => {
      const nextMilestone = goal.milestones.find((m) => !m.completed)
      if (nextMilestone) {
        nextSteps.push(`继续: ${nextMilestone.title}`)
      }
    })

    // 基于技能缺口建议
    const gaps = this.identifySkillGaps()
    gaps.forEach((gap) => {
      nextSteps.push(`学习: ${gap}`)
    })

    return nextSteps.slice(0, 5)
  }

  private saveUserProfile(): void {
    if (!this.userProfile) return
    try {
      localStorage.setItem("user-profile", JSON.stringify(this.userProfile))
    } catch (error) {
      console.error("[v0] Failed to save user profile:", error)
    }
  }

  private loadUserProfile(): void {
    try {
      const data = localStorage.getItem("user-profile")
      if (data) {
        this.userProfile = JSON.parse(data)
      }
    } catch (error) {
      console.error("[v0] Failed to load user profile:", error)
    }
  }
}

export const adaptiveLearningSystem = new AdaptiveLearningSystem()
