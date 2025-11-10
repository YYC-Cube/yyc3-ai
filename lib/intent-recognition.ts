export interface IntentResult {
  intent: string
  confidence: number
  context: Record<string, any>
  suggestions: string[]
}

export class IntentRecognizer {
  private static keywords = {
    code_help: ["代码", "编程", "bug", "错误", "调试", "运行", "函数", "变量"],
    learning: ["学习", "教程", "如何", "怎么", "为什么", "原理", "概念"],
    review: ["审查", "优化", "改进", "重构", "性能", "最佳实践"],
    question: ["什么", "为什么", "如何", "怎么样", "?", "?"],
    creation: ["创建", "生成", "新建", "制作", "设计", "构建"],
  }

  static analyze(userInput: string, context?: any): IntentResult {
    const normalizedInput = userInput.toLowerCase()
    const intents: { intent: string; score: number }[] = []

    // 关键词匹配分析
    for (const [intent, keywords] of Object.entries(this.keywords)) {
      const matchCount = keywords.filter((keyword) => normalizedInput.includes(keyword.toLowerCase())).length

      if (matchCount > 0) {
        intents.push({
          intent,
          score: matchCount / keywords.length,
        })
      }
    }

    // 排序并选择最高置信度的意图
    intents.sort((a, b) => b.score - a.score)

    const primaryIntent = intents[0] || { intent: "general", score: 0.5 }

    return {
      intent: primaryIntent.intent,
      confidence: primaryIntent.score,
      context: context || {},
      suggestions: this.generateSuggestions(primaryIntent.intent),
    }
  }

  private static generateSuggestions(intent: string): string[] {
    const suggestionMap: Record<string, string[]> = {
      code_help: ["查看相关代码示例", "运行代码并查看结果", "使用AI代码助手分析"],
      learning: ["查看学习路径推荐", "浏览相关教程", "尝试实践项目"],
      review: ["启动代码审查", "查看性能分析", "获取优化建议"],
      question: ["搜索相关文档", "查看类似问题", "与AI深入讨论"],
      creation: ["使用模板快速开始", "查看示例项目", "获取AI生成建议"],
    }

    return suggestionMap[intent] || ["继续对话", "查看更多选项"]
  }
}
