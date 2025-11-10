// 智能推荐引擎 - 基于用户行为和上下文的个性化推荐系统

import { contextAnalyzer } from "./context-analyzer"
import { learningTracker } from "./learning-tracker"

export interface Recommendation {
  id: string
  type: "template" | "snippet" | "tutorial" | "tool" | "feature"
  title: string
  description: string
  relevanceScore: number
  reason: string
  action: () => void
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export interface UserProfile {
  preferences: {
    frameworks: string[]
    languages: string[]
    preferredStyle: "concise" | "detailed" | "visual"
  }
  behavior: {
    mostUsedFeatures: Map<string, number>
    lastActivity: Map<string, number>
    sessionDuration: number
  }
  learning: {
    strengths: string[]
    weaknesses: string[]
    completedTopics: string[]
  }
}

class SmartRecommendationEngine {
  private userProfile: UserProfile = {
    preferences: {
      frameworks: [],
      languages: [],
      preferredStyle: "detailed",
    },
    behavior: {
      mostUsedFeatures: new Map(),
      lastActivity: new Map(),
      sessionDuration: 0,
    },
    learning: {
      strengths: [],
      weaknesses: [],
      completedTopics: [],
    },
  }

  // 更新用户配置文件
  updateProfile(updates: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...updates }
  }

  // 记录功能使用
  trackFeatureUsage(featureName: string): void {
    const current = this.userProfile.behavior.mostUsedFeatures.get(featureName) || 0
    this.userProfile.behavior.mostUsedFeatures.set(featureName, current + 1)
    this.userProfile.behavior.lastActivity.set(featureName, Date.now())
  }

  // 生成个性化推荐
  generateRecommendations(context?: {
    currentCode?: string
    currentLanguage?: string
    userInput?: string
  }): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 1. 基于上下文的推荐
    if (context) {
      recommendations.push(...this.getContextBasedRecommendations(context))
    }

    // 2. 基于学习进度的推荐
    recommendations.push(...this.getLearningBasedRecommendations())

    // 3. 基于行为的推荐
    recommendations.push(...this.getBehaviorBasedRecommendations())

    // 4. 协同过滤推荐 (相似用户)
    recommendations.push(...this.getCollaborativeRecommendations())

    // 计算最终相关性得分并排序
    return this.rankRecommendations(recommendations).slice(0, 10)
  }

  // 基于上下文的推荐
  private getContextBasedRecommendations(context: {
    currentCode?: string
    currentLanguage?: string
    userInput?: string
  }): Recommendation[] {
    const recommendations: Recommendation[] = []
    const analysis = contextAnalyzer.analyzeContext()

    // 根据意图推荐
    if (analysis.userIntent === "debugging") {
      recommendations.push({
        id: "debug-tool",
        type: "tool",
        title: "代码调试助手",
        description: "使用AI自动检测并修复代码错误",
        relevanceScore: 0.9,
        reason: "检测到你正在调试代码",
        action: () => console.log("Open debug tool"),
        tags: ["调试", "错误修复"],
        difficulty: "beginner",
      })
    }

    if (analysis.userIntent === "learning" && analysis.currentTopic) {
      recommendations.push({
        id: `learn-${analysis.currentTopic}`,
        type: "tutorial",
        title: `${analysis.currentTopic} 深度教程`,
        description: `系统学习 ${analysis.currentTopic} 的核心概念和实践`,
        relevanceScore: 0.85,
        reason: `你正在学习 ${analysis.currentTopic}`,
        action: () => console.log("Open tutorial"),
        tags: [analysis.currentTopic, "教程"],
        difficulty: analysis.difficulty,
      })
    }

    // 根据情绪状态推荐
    if (analysis.emotionalState === "frustrated") {
      recommendations.push({
        id: "simpler-approach",
        type: "tutorial",
        title: "换个更简单的方法",
        description: "从基础开始,循序渐进理解核心概念",
        relevanceScore: 0.88,
        reason: "为你提供更易理解的学习路径",
        action: () => console.log("Show simpler tutorial"),
        tags: ["基础", "入门"],
        difficulty: "beginner",
      })
    }

    return recommendations
  }

  // 基于学习进度的推荐
  private getLearningBasedRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = []
    const stats = learningTracker.getStatistics()

    // 推荐复习薄弱环节
    if (stats.weaknesses.length > 0) {
      stats.weaknesses.slice(0, 2).forEach((weakness) => {
        recommendations.push({
          id: `review-${weakness}`,
          type: "tutorial",
          title: `复习: ${weakness}`,
          description: `加强对 ${weakness} 的理解和掌握`,
          relevanceScore: 0.8,
          reason: "识别到你在这个领域需要加强",
          action: () => console.log(`Review ${weakness}`),
          tags: [weakness, "复习"],
          difficulty: "intermediate",
        })
      })
    }

    // 推荐下一步学习内容
    const progress = learningTracker.getProgress()
    if (progress.nextRecommendations.length > 0) {
      recommendations.push({
        id: "next-topic",
        type: "tutorial",
        title: "推荐下一步学习",
        description: progress.nextRecommendations[0],
        relevanceScore: 0.75,
        reason: "基于你的学习进度推荐",
        action: () => console.log("Start next topic"),
        tags: ["进阶", "学习路径"],
        difficulty: "intermediate",
      })
    }

    return recommendations
  }

  // 基于行为的推荐
  private getBehaviorBasedRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = []

    // 找出最常用的3个功能
    const sortedFeatures = Array.from(this.userProfile.behavior.mostUsedFeatures.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    sortedFeatures.forEach(([feature, count]) => {
      if (count > 5) {
        // 推荐相关的高级功能
        recommendations.push({
          id: `advanced-${feature}`,
          type: "feature",
          title: `${feature} 高级技巧`,
          description: `发现更多 ${feature} 的强大功能`,
          relevanceScore: 0.7,
          reason: `你经常使用 ${feature}`,
          action: () => console.log(`Show advanced ${feature}`),
          tags: [feature, "高级"],
          difficulty: "advanced",
        })
      }
    })

    // 推荐未使用的功能
    const allFeatures = ["代码生成", "代码审查", "智能补全", "错误修复", "性能优化", "测试生成"]
    const unusedFeatures = allFeatures.filter((f) => !this.userProfile.behavior.mostUsedFeatures.has(f))

    if (unusedFeatures.length > 0) {
      recommendations.push({
        id: "discover-feature",
        type: "feature",
        title: `发现新功能: ${unusedFeatures[0]}`,
        description: `尝试使用${unusedFeatures[0]}提升开发效率`,
        relevanceScore: 0.6,
        reason: "探索更多强大功能",
        action: () => console.log(`Discover ${unusedFeatures[0]}`),
        tags: [unusedFeatures[0], "新功能"],
        difficulty: "beginner",
      })
    }

    return recommendations
  }

  // 协同过滤推荐
  private getCollaborativeRecommendations(): Recommendation[] {
    // 模拟协同过滤 - 实际应用中需要后端支持
    const recommendations: Recommendation[] = []

    // 基于"相似用户"的推荐
    recommendations.push({
      id: "popular-template",
      type: "template",
      title: "热门代码模板",
      description: "其他开发者最常使用的代码模板",
      relevanceScore: 0.65,
      reason: "其他用户也喜欢",
      action: () => console.log("Show popular templates"),
      tags: ["热门", "模板"],
      difficulty: "intermediate",
    })

    return recommendations
  }

  // 排序推荐
  private rankRecommendations(recommendations: Recommendation[]): Recommendation[] {
    return recommendations.sort((a, b) => {
      // 主要按相关性得分排序
      let scoreA = a.relevanceScore
      let scoreB = b.relevanceScore

      // 调整因子: 难度匹配
      const userLevel = this.getUserLevel()
      if (a.difficulty === userLevel) scoreA += 0.1
      if (b.difficulty === userLevel) scoreB += 0.1

      // 调整因子: 最近活动
      const recentActivityBonus = 0.05
      if (this.isRecentlyActive(a.tags)) scoreA += recentActivityBonus
      if (this.isRecentlyActive(b.tags)) scoreB += recentActivityBonus

      return scoreB - scoreA
    })
  }

  // 获取用户等级
  private getUserLevel(): "beginner" | "intermediate" | "advanced" {
    const stats = learningTracker.getStatistics()
    if (stats.currentLevel === "advanced") return "advanced"
    if (stats.currentLevel === "intermediate") return "intermediate"
    return "beginner"
  }

  // 检查是否最近活跃
  private isRecentlyActive(tags: string[]): boolean {
    const recentWindow = 10 * 60 * 1000 // 10分钟
    const now = Date.now()

    for (const tag of tags) {
      const lastActivity = this.userProfile.behavior.lastActivity.get(tag)
      if (lastActivity && now - lastActivity < recentWindow) {
        return true
      }
    }
    return false
  }

  // 获取用户画像摘要
  getProfileSummary(): string {
    const stats = learningTracker.getStatistics()
    const topFeatures = Array.from(this.userProfile.behavior.mostUsedFeatures.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([feature]) => feature)

    return `
**用户画像**
- 等级: ${stats.currentLevel}
- 常用功能: ${topFeatures.join(", ") || "暂无"}
- 擅长领域: ${stats.strengths.slice(0, 3).join(", ") || "暂无"}
- 学习偏好: ${this.userProfile.preferences.preferredStyle}
    `.trim()
  }
}

export const smartRecommendationEngine = new SmartRecommendationEngine()
