// 智能上下文分析引擎 - 分析对话上下文并提供智能建议

import { learningTracker } from "./learning-tracker"

export interface ContextAnalysis {
  currentTopic: string | null
  difficulty: "beginner" | "intermediate" | "advanced"
  userIntent: "learning" | "debugging" | "exploring" | "practicing"
  emotionalState: "confused" | "frustrated" | "confident" | "curious" | "neutral"
  needsHelp: boolean
  suggestedResponse: string
  keywords: string[]
}

export interface ConversationContext {
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>
  currentSession: {
    startTime: number
    topic: string | null
    interactions: number
  }
}

class ContextAnalyzer {
  private context: ConversationContext = {
    messages: [],
    currentSession: {
      startTime: Date.now(),
      topic: null,
      interactions: 0,
    },
  }

  // 添加消息到上下文
  addMessage(role: "user" | "assistant", content: string): void {
    this.context.messages.push({
      role,
      content,
      timestamp: Date.now(),
    })

    if (role === "user") {
      this.context.currentSession.interactions++
    }

    // 保持最近50条消息
    if (this.context.messages.length > 50) {
      this.context.messages = this.context.messages.slice(-50)
    }
  }

  // 分析当前上下文
  analyzeContext(): ContextAnalysis {
    const recentMessages = this.context.messages.slice(-5)
    const userMessages = recentMessages.filter((m) => m.role === "user")

    if (userMessages.length === 0) {
      return this.getDefaultAnalysis()
    }

    const lastUserMessage = userMessages[userMessages.length - 1].content

    return {
      currentTopic: this.detectTopic(lastUserMessage),
      difficulty: this.detectDifficulty(lastUserMessage),
      userIntent: this.detectIntent(lastUserMessage),
      emotionalState: this.detectEmotionalState(recentMessages),
      needsHelp: this.detectNeedsHelp(recentMessages),
      suggestedResponse: this.generateSuggestedResponse(lastUserMessage, recentMessages),
      keywords: this.extractKeywords(lastUserMessage),
    }
  }

  // 检测是否需要主动引导
  shouldProactivelyGuide(): boolean {
    const timeSinceLastInteraction =
      Date.now() - (this.context.messages[this.context.messages.length - 1]?.timestamp || Date.now())

    // 超过3分钟无互动
    if (timeSinceLastInteraction > 3 * 60 * 1000) {
      return true
    }

    // 连续提问相同主题超过3次
    const recentTopics = this.context.messages
      .slice(-6)
      .filter((m) => m.role === "user")
      .map((m) => this.detectTopic(m.content))

    const uniqueTopics = new Set(recentTopics)
    if (uniqueTopics.size === 1 && recentTopics.length >= 3) {
      return true
    }

    return false
  }

  // 生成主动引导消息
  generateProactiveGuidance(): string {
    const analysis = this.analyzeContext()
    const stats = learningTracker.getStatistics()

    if (analysis.emotionalState === "frustrated") {
      return "我注意到你可能遇到了一些困难。要不要换个角度,我用更简单的方式重新解释一下?或者我们可以先看个实际例子 💡"
    }

    if (analysis.emotionalState === "confused") {
      return "这个概念确实有点绕。让我们把它拆解成几个小步骤,一步步来理解,会更清晰 📊"
    }

    if (this.shouldProactivelyGuide() && analysis.currentTopic) {
      return `看起来你在研究 "${analysis.currentTopic}",这是个很重要的知识点!需要我提供一些实战案例或者常见陷阱提示吗? 🎯`
    }

    // 基于学习进度的建议
    if (stats.weaknesses.length > 0) {
      return `【大数据提示】我注意到 "${stats.weaknesses[0]}" 可能还需要加强。要不要我们一起复习一下这部分内容? 📈`
    }

    return ""
  }

  // 获取学习进度摘要
  getProgressSummary(): string {
    const stats = learningTracker.getStatistics()
    const progress = learningTracker.getProgress()

    let summary = `**📊 当前学习进度**\n\n`
    summary += `- 等级: ${this.getLevelText(stats.currentLevel)}\n`
    summary += `- 已学习主题: ${stats.totalTopics} 个\n`
    summary += `- 平均掌握度: ${stats.averageMastery}%\n`

    if (stats.strengths.length > 0) {
      summary += `- ✅ 擅长领域: ${stats.strengths.slice(0, 3).join(", ")}\n`
    }

    if (stats.weaknesses.length > 0) {
      summary += `- ⚠️ 需要加强: ${stats.weaknesses.slice(0, 3).join(", ")}\n`
    }

    if (progress.nextRecommendations.length > 0) {
      summary += `\n**🎯 下一步建议:**\n`
      progress.nextRecommendations.forEach((rec) => {
        summary += `- ${rec}\n`
      })
    }

    return summary
  }

  // 重置会话
  resetSession(): void {
    this.context.currentSession = {
      startTime: Date.now(),
      topic: null,
      interactions: 0,
    }
  }

  // 私有方法
  private detectTopic(message: string): string | null {
    const topics = [
      "变量",
      "函数",
      "循环",
      "条件语句",
      "列表",
      "字典",
      "类",
      "对象",
      "异常",
      "文件",
      "模块",
      "装饰器",
      "生成器",
      "API",
      "数据库",
      "React",
      "Vue",
      "JavaScript",
      "TypeScript",
      "CSS",
      "HTML",
    ]

    const lowerMessage = message.toLowerCase()
    for (const topic of topics) {
      if (lowerMessage.includes(topic.toLowerCase())) {
        return topic
      }
    }

    return null
  }

  private detectDifficulty(message: string): "beginner" | "intermediate" | "advanced" {
    const beginnerKeywords = ["什么是", "如何", "怎么", "基础", "入门", "简单"]
    const advancedKeywords = ["优化", "性能", "架构", "设计模式", "最佳实践", "源码"]

    const lowerMessage = message.toLowerCase()

    if (advancedKeywords.some((kw) => lowerMessage.includes(kw))) {
      return "advanced"
    }

    if (beginnerKeywords.some((kw) => lowerMessage.includes(kw))) {
      return "beginner"
    }

    return "intermediate"
  }

  private detectIntent(message: string): "learning" | "debugging" | "exploring" | "practicing" {
    const debugKeywords = ["错误", "报错", "bug", "不工作", "失败", "问题"]
    const learningKeywords = ["学习", "理解", "解释", "什么是", "为什么"]
    const practicingKeywords = ["练习", "实现", "写", "做", "创建", "构建"]

    const lowerMessage = message.toLowerCase()

    if (debugKeywords.some((kw) => lowerMessage.includes(kw))) return "debugging"
    if (learningKeywords.some((kw) => lowerMessage.includes(kw))) return "learning"
    if (practicingKeywords.some((kw) => lowerMessage.includes(kw))) return "practicing"

    return "exploring"
  }

  private detectEmotionalState(
    messages: Array<{ role: string; content: string }>,
  ): "confused" | "frustrated" | "confident" | "curious" | "neutral" {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 0) return "neutral"

    const recentContent = userMessages.map((m) => m.content.toLowerCase()).join(" ")

    const confusedKeywords = ["不懂", "不明白", "看不懂", "糊涂", "迷惑"]
    const frustratedKeywords = ["还是不行", "又错了", "为什么总是", "怎么还", "烦"]
    const confidentKeywords = ["明白了", "懂了", "理解了", "会了", "成功"]
    const curiousKeywords = ["有趣", "想知道", "好奇", "能不能", "可以吗"]

    if (frustratedKeywords.some((kw) => recentContent.includes(kw))) return "frustrated"
    if (confusedKeywords.some((kw) => recentContent.includes(kw))) return "confused"
    if (confidentKeywords.some((kw) => recentContent.includes(kw))) return "confident"
    if (curiousKeywords.some((kw) => recentContent.includes(kw))) return "curious"

    return "neutral"
  }

  private detectNeedsHelp(messages: Array<{ role: string; content: string }>): boolean {
    const userMessages = messages.filter((m) => m.role === "user")

    // 短时间内多次提问同一主题
    if (userMessages.length >= 3) {
      const topics = userMessages.map((m) => this.detectTopic(m.content))
      const uniqueTopics = new Set(topics.filter((t) => t !== null))
      if (uniqueTopics.size === 1) return true
    }

    // 包含求助关键词
    const helpKeywords = ["帮我", "不会", "不懂", "怎么办", "求助"]
    const lastMessage = userMessages[userMessages.length - 1]?.content.toLowerCase() || ""

    return helpKeywords.some((kw) => lastMessage.includes(kw))
  }

  private generateSuggestedResponse(
    userMessage: string,
    recentMessages: Array<{ role: string; content: string }>,
  ): string {
    const intent = this.detectIntent(userMessage)
    const topic = this.detectTopic(userMessage)
    const emotionalState = this.detectEmotionalState(recentMessages)

    let response = ""

    // 根据情绪状态调整回复风格
    if (emotionalState === "frustrated") {
      response = "我理解你的感受,让我们换个更简单的方式来理解这个问题。"
    } else if (emotionalState === "confused") {
      response = "没关系,这个概念确实需要时间消化。让我用一个生活化的例子来解释:"
    } else if (emotionalState === "confident") {
      response = "很好!看来你已经掌握了基础。我们可以尝试一些更有挑战性的内容。"
    }

    // 根据意图添加具体建议
    if (intent === "debugging") {
      response += " 让我们一起分析这个错误,通常这类问题是因为..."
    } else if (intent === "learning" && topic) {
      response += ` 关于 "${topic}",我们从最基础的概念开始...`
    } else if (intent === "practicing") {
      response += " 实践是最好的学习方式!让我们先规划一下实现步骤..."
    }

    return response
  }

  private extractKeywords(message: string): string[] {
    const words = message.split(/\s+/)
    const stopWords = ["的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都", "一", "个"]

    return words.filter((w) => w.length > 1 && !stopWords.includes(w)).slice(0, 5)
  }

  private getLevelText(level: string): string {
    const levelMap: Record<string, string> = {
      beginner: "初学者 🌱",
      intermediate: "进阶学习者 🌿",
      advanced: "高级开发者 🌳",
    }
    return levelMap[level] || level
  }

  private getDefaultAnalysis(): ContextAnalysis {
    return {
      currentTopic: null,
      difficulty: "beginner",
      userIntent: "exploring",
      emotionalState: "neutral",
      needsHelp: false,
      suggestedResponse: "你好!我是你的AI编程学习助手。有什么我可以帮助你的吗?",
      keywords: [],
    }
  }
}

export const contextAnalyzer = new ContextAnalyzer()
