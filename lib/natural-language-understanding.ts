// 自然语言理解系统 - 多轮对话、意图识别、实体提取
export interface NLUResult {
  intent: Intent
  entities: Entity[]
  sentiment: Sentiment
  confidence: number
  suggestedActions: Action[]
}

export interface Intent {
  name: string
  category: "query" | "command" | "explanation" | "generation" | "debugging"
  confidence: number
  parameters: Record<string, any>
}

export interface Entity {
  type: string
  value: string
  startIndex: number
  endIndex: number
  confidence: number
}

export interface Sentiment {
  polarity: "positive" | "neutral" | "negative"
  score: number
  emotions: string[]
}

export interface Action {
  type: string
  description: string
  handler: () => void
  priority: number
}

export interface ConversationContext {
  history: Message[]
  currentTopic?: string
  userProfile?: any
  sessionState: Record<string, any>
}

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

class NaturalLanguageUnderstanding {
  private conversationContext: ConversationContext = {
    history: [],
    sessionState: {},
  }

  // 意图识别词典
  private intentPatterns: Record<string, { patterns: RegExp[]; category: Intent["category"] }> = {
    generate_code: {
      patterns: [/生成.*代码/i, /写一个.*函数/i, /创建.*组件/i, /实现.*功能/i, /帮我写/i, /build.*code/i],
      category: "generation",
    },
    explain_code: {
      patterns: [/解释.*代码/i, /这段代码.*作用/i, /什么意思/i, /explain/i, /what.*do/i],
      category: "explanation",
    },
    debug_code: {
      patterns: [/调试/i, /错误/i, /bug/i, /不工作/i, /修复/i, /debug/i, /fix/i],
      category: "debugging",
    },
    optimize_code: {
      patterns: [/优化/i, /提升性能/i, /改进/i, /重构/i, /optimize/i, /refactor/i],
      category: "command",
    },
    query_knowledge: {
      patterns: [/什么是/i, /如何/i, /怎么/i, /解释一下/i, /what is/i, /how to/i],
      category: "query",
    },
  }

  // 实体类型模式
  private entityPatterns: Record<string, RegExp> = {
    language: /\b(JavaScript|TypeScript|Python|Java|C\+\+|Go|Rust|PHP)\b/gi,
    framework: /\b(React|Vue|Angular|Next\.js|Express|Django|Flask)\b/gi,
    file_type: /\.(js|ts|jsx|tsx|py|java|cpp|go|rs|php)\b/gi,
    variable_name: /\b[a-z][a-zA-Z0-9]*\b/g,
    function_name: /\b[a-z][a-zA-Z0-9]*$$[^)]*$$/g,
    number: /\b\d+\b/g,
    url: /https?:\/\/[^\s]+/g,
  }

  // 情感关键词
  private sentimentKeywords = {
    positive: ["好", "棒", "优秀", "完美", "谢谢", "感谢", "great", "excellent", "perfect", "thanks"],
    negative: ["不好", "错", "问题", "失败", "困难", "bad", "wrong", "problem", "fail", "difficult"],
  }

  // 理解用户输入
  async understand(userInput: string, context?: Partial<ConversationContext>): Promise<NLUResult> {
    // 更新上下文
    if (context) {
      this.conversationContext = { ...this.conversationContext, ...context }
    }

    // 添加到历史
    this.conversationContext.history.push({
      role: "user",
      content: userInput,
      timestamp: new Date(),
    })

    // 保持历史在合理范围
    if (this.conversationContext.history.length > 20) {
      this.conversationContext.history = this.conversationContext.history.slice(-20)
    }

    // 1. 意图识别
    const intent = this.recognizeIntent(userInput)

    // 2. 实体提取
    const entities = this.extractEntities(userInput)

    // 3. 情感分析
    const sentiment = this.analyzeSentiment(userInput)

    // 4. 上下文理解
    this.updateContextState(intent, entities)

    // 5. 生成建议动作
    const suggestedActions = this.generateActions(intent, entities)

    // 6. 计算整体置信度
    const confidence = this.calculateConfidence(intent, entities, sentiment)

    return {
      intent,
      entities,
      sentiment,
      confidence,
      suggestedActions,
    }
  }

  // 意图识别
  private recognizeIntent(text: string): Intent {
    let bestMatch: Intent = {
      name: "unknown",
      category: "query",
      confidence: 0,
      parameters: {},
    }

    // 遍历所有意图模式
    for (const [intentName, { patterns, category }] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          const confidence = this.calculateIntentConfidence(text, pattern)
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              name: intentName,
              category,
              confidence,
              parameters: this.extractIntentParameters(text, intentName),
            }
          }
        }
      }
    }

    // 如果没有匹配，使用上下文推断
    if (bestMatch.confidence < 0.5) {
      bestMatch = this.inferFromContext(text)
    }

    return bestMatch
  }

  // 实体提取
  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = []

    for (const [type, pattern] of Object.entries(this.entityPatterns)) {
      const matches = text.matchAll(pattern)

      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            type,
            value: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            confidence: 0.9,
          })
        }
      }
    }

    return entities
  }

  // 情感分析
  private analyzeSentiment(text: string): Sentiment {
    let positiveCount = 0
    let negativeCount = 0
    const emotions: string[] = []

    // 统计正负面关键词
    this.sentimentKeywords.positive.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        positiveCount++
        emotions.push("愉悦")
      }
    })

    this.sentimentKeywords.negative.forEach((keyword) => {
      if (text.toLowerCase().includes(keyword)) {
        negativeCount++
        emotions.push("沮丧")
      }
    })

    // 检测困惑
    if (text.includes("?") || text.includes("？") || text.includes("不明白") || text.includes("confused")) {
      emotions.push("困惑")
    }

    // 计算极性
    let polarity: Sentiment["polarity"] = "neutral"
    let score = 0

    if (positiveCount > negativeCount) {
      polarity = "positive"
      score = positiveCount / (positiveCount + negativeCount + 1)
    } else if (negativeCount > positiveCount) {
      polarity = "negative"
      score = negativeCount / (positiveCount + negativeCount + 1)
    } else {
      score = 0.5
    }

    return {
      polarity,
      score,
      emotions: [...new Set(emotions)],
    }
  }

  // 更新上下文状态
  private updateContextState(intent: Intent, entities: Entity[]): void {
    // 更新当前话题
    if (intent.category === "generation" || intent.category === "explanation") {
      const languageEntity = entities.find((e) => e.type === "language")
      if (languageEntity) {
        this.conversationContext.currentTopic = languageEntity.value
      }
    }

    // 保存实体到会话状态
    entities.forEach((entity) => {
      this.conversationContext.sessionState[entity.type] = entity.value
    })

    // 保存意图参数
    Object.entries(intent.parameters).forEach(([key, value]) => {
      this.conversationContext.sessionState[key] = value
    })
  }

  // 生成建议动作
  private generateActions(intent: Intent, entities: Entity[]): Action[] {
    const actions: Action[] = []

    switch (intent.name) {
      case "generate_code":
        actions.push({
          type: "generate",
          description: "生成代码",
          handler: () => console.log("[v0] 生成代码..."),
          priority: 10,
        })
        actions.push({
          type: "suggest_template",
          description: "推荐代码模板",
          handler: () => console.log("[v0] 推荐模板..."),
          priority: 8,
        })
        break

      case "explain_code":
        actions.push({
          type: "explain",
          description: "解释代码",
          handler: () => console.log("[v0] 解释代码..."),
          priority: 10,
        })
        actions.push({
          type: "show_example",
          description: "显示示例",
          handler: () => console.log("[v0] 显示示例..."),
          priority: 7,
        })
        break

      case "debug_code":
        actions.push({
          type: "debug",
          description: "调试代码",
          handler: () => console.log("[v0] 调试代码..."),
          priority: 10,
        })
        actions.push({
          type: "suggest_fix",
          description: "建议修复方案",
          handler: () => console.log("[v0] 建议修复..."),
          priority: 9,
        })
        break

      case "optimize_code":
        actions.push({
          type: "optimize",
          description: "优化代码",
          handler: () => console.log("[v0] 优化代码..."),
          priority: 10,
        })
        actions.push({
          type: "analyze_performance",
          description: "分析性能",
          handler: () => console.log("[v0] 分析性能..."),
          priority: 8,
        })
        break

      case "query_knowledge":
        actions.push({
          type: "search_docs",
          description: "搜索文档",
          handler: () => console.log("[v0] 搜索文档..."),
          priority: 10,
        })
        actions.push({
          type: "show_tutorial",
          description: "显示教程",
          handler: () => console.log("[v0] 显示教程..."),
          priority: 8,
        })
        break
    }

    return actions.sort((a, b) => b.priority - a.priority)
  }

  // 计算置信度
  private calculateConfidence(intent: Intent, entities: Entity[], sentiment: Sentiment): number {
    let confidence = intent.confidence

    // 实体提取提升置信度
    if (entities.length > 0) {
      confidence += 0.1
    }

    // 上下文连贯性提升置信度
    if (this.conversationContext.history.length > 1) {
      const isCoherent = this.checkContextCoherence(intent)
      if (isCoherent) {
        confidence += 0.1
      }
    }

    // 情感明确性提升置信度
    if (sentiment.score > 0.7) {
      confidence += 0.05
    }

    return Math.min(1, confidence)
  }

  // 辅助方法
  private calculateIntentConfidence(text: string, pattern: RegExp): number {
    const match = text.match(pattern)
    if (!match) return 0

    // 基础置信度
    let confidence = 0.7

    // 匹配长度越长，置信度越高
    const matchLength = match[0].length
    const textLength = text.length
    confidence += (matchLength / textLength) * 0.2

    return Math.min(1, confidence)
  }

  private extractIntentParameters(text: string, intentName: string): Record<string, any> {
    const parameters: Record<string, any> = {}

    // 根据不同意图提取参数
    switch (intentName) {
      case "generate_code":
        const languageMatch = text.match(/用?(JavaScript|TypeScript|Python|Java)/i)
        if (languageMatch) {
          parameters.language = languageMatch[1]
        }

        const componentMatch = text.match(/([一个组件|函数|类|接口])/i)
        if (componentMatch) {
          parameters.codeType = componentMatch[1]
        }
        break

      case "optimize_code":
        if (text.includes("性能")) parameters.goal = "performance"
        if (text.includes("可读性")) parameters.goal = "readability"
        if (text.includes("可维护性")) parameters.goal = "maintainability"
        break
    }

    return parameters
  }

  private inferFromContext(text: string): Intent {
    // 如果有历史对话，尝试从上下文推断
    if (this.conversationContext.history.length > 1) {
      const lastAssistantMessage = this.conversationContext.history
        .slice()
        .reverse()
        .find((m) => m.role === "assistant")

      if (lastAssistantMessage) {
        // 如果上次是代码生成，这次可能是请求解释
        if (lastAssistantMessage.content.includes("```")) {
          return {
            name: "explain_code",
            category: "explanation",
            confidence: 0.6,
            parameters: {},
          }
        }
      }
    }

    return {
      name: "unknown",
      category: "query",
      confidence: 0.3,
      parameters: {},
    }
  }

  private checkContextCoherence(currentIntent: Intent): boolean {
    if (this.conversationContext.history.length < 2) return false

    // 检查话题是否连贯
    const currentTopic = this.conversationContext.currentTopic
    if (!currentTopic) return false

    const recentMessages = this.conversationContext.history.slice(-3)
    const topicMentioned = recentMessages.some((m) => m.content.includes(currentTopic))

    return topicMentioned
  }

  // 获取对话上下文
  getContext(): ConversationContext {
    return this.conversationContext
  }

  // 重置上下文
  resetContext(): void {
    this.conversationContext = {
      history: [],
      sessionState: {},
    }
  }

  // 添加助手回复到历史
  addAssistantMessage(content: string): void {
    this.conversationContext.history.push({
      role: "assistant",
      content,
      timestamp: new Date(),
    })
  }
}

export const nlu = new NaturalLanguageUnderstanding()
