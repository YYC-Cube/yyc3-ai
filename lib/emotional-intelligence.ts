// 情感化交互增强系统 - 检测用户情绪并提供适当的情感支持

import { learningTracker } from "./learning-tracker"

export interface EmotionalState {
  emotion: "frustrated" | "confused" | "confident" | "curious" | "tired" | "excited" | "neutral"
  intensity: number // 0-100
  triggers: string[]
  suggestedResponse: string
  encouragement: string
}

export interface ProgressComparison {
  metric: string
  previous: number
  current: number
  improvement: number
  message: string
}

class EmotionalIntelligence {
  // 检测情绪状态
  detectEmotion(messages: string[], recentErrors: number, sessionDuration: number): EmotionalState {
    const recentText = messages.slice(-3).join(" ").toLowerCase()

    // 挫折感检测
    if (this.detectFrustration(recentText, recentErrors)) {
      return {
        emotion: "frustrated",
        intensity: 75,
        triggers: ["多次错误", "重复问题"],
        suggestedResponse: "我理解你现在可能有点沮丧。让我们换个角度,用更简单的方式重新理解这个问题",
        encouragement: "遇到困难是学习过程的一部分,你已经在进步的路上了",
      }
    }

    // 困惑检测
    if (this.detectConfusion(recentText)) {
      return {
        emotion: "confused",
        intensity: 60,
        triggers: ["不理解", "看不懂"],
        suggestedResponse: "这个概念确实有点复杂。让我们把它拆解成几个小步骤,一步步来理解",
        encouragement: "提出问题说明你在认真思考,这很棒",
      }
    }

    // 疲劳检测
    if (this.detectTiredness(sessionDuration, messages.length)) {
      return {
        emotion: "tired",
        intensity: 50,
        triggers: ["长时间学习", "注意力下降"],
        suggestedResponse: "你已经学习了很长时间了。要不要休息一下,稍后再继续?",
        encouragement: "持续学习的毅力值得赞赏,但适当休息也很重要",
      }
    }

    // 自信检测
    if (this.detectConfidence(recentText)) {
      return {
        emotion: "confident",
        intensity: 80,
        triggers: ["理解了", "明白了"],
        suggestedResponse: "太好了!看来你已经掌握了这个概念。准备好挑战更高级的内容了吗?",
        encouragement: "你的学习能力很强,继续保持这个势头",
      }
    }

    // 好奇检测
    if (this.detectCuriosity(recentText)) {
      return {
        emotion: "curious",
        intensity: 70,
        triggers: ["想知道", "为什么"],
        suggestedResponse: "很好的问题!这种探索精神会帮助你学得更深入",
        encouragement: "保持好奇心,这是成为优秀开发者的关键品质",
      }
    }

    // 兴奋检测
    if (this.detectExcitement(recentText)) {
      return {
        emotion: "excited",
        intensity: 85,
        triggers: ["成功了", "太棒了"],
        suggestedResponse: "恭喜你!这个突破很重要。让我们趁热打铁,继续深入学习",
        encouragement: "你的进步速度令人印象深刻",
      }
    }

    return {
      emotion: "neutral",
      intensity: 50,
      triggers: [],
      suggestedResponse: "有什么我可以帮助你的吗?",
      encouragement: "继续保持学习的节奏",
    }
  }

  // 生成数据化鼓励
  generateDataDrivenEncouragement(): ProgressComparison[] {
    const progress = learningTracker.getProgress()
    const comparisons: ProgressComparison[] = []

    // 获取最近的学习节点
    const recentNodes = progress.nodes.slice(-10)
    const olderNodes = progress.nodes.slice(-20, -10)

    if (recentNodes.length === 0) {
      return []
    }

    // 1. 错误率对比
    const recentErrors = recentNodes.reduce((sum, n) => sum + n.errors.length, 0)
    const olderErrors = olderNodes.reduce((sum, n) => sum + n.errors.length, 0)

    if (olderNodes.length > 0) {
      const recentErrorRate = recentErrors / recentNodes.length
      const olderErrorRate = olderErrors / olderNodes.length
      const improvement = ((olderErrorRate - recentErrorRate) / olderErrorRate) * 100

      if (improvement > 0) {
        comparisons.push({
          metric: "错误率",
          previous: olderErrorRate,
          current: recentErrorRate,
          improvement: Math.round(improvement),
          message: `对比上次学习,你的错误率下降了 ${Math.round(improvement)}%,说明理解更扎实了`,
        })
      }
    }

    // 2. 掌握度对比
    const recentMastery = recentNodes.reduce((sum, n) => sum + n.mastery, 0) / recentNodes.length
    const olderMastery =
      olderNodes.length > 0 ? olderNodes.reduce((sum, n) => sum + n.mastery, 0) / olderNodes.length : 0

    if (olderMastery > 0) {
      const improvement = recentMastery - olderMastery

      if (improvement > 5) {
        comparisons.push({
          metric: "平均掌握度",
          previous: Math.round(olderMastery),
          current: Math.round(recentMastery),
          improvement: Math.round(improvement),
          message: `你的平均掌握度提升了 ${Math.round(improvement)} 个百分点,进步明显`,
        })
      }
    }

    // 3. 学习效率对比
    const recentAvgDuration = recentNodes.reduce((sum, n) => sum + n.duration, 0) / recentNodes.length
    const olderAvgDuration =
      olderNodes.length > 0 ? olderNodes.reduce((sum, n) => sum + n.duration, 0) / olderNodes.length : 0

    if (olderAvgDuration > 0 && recentAvgDuration < olderAvgDuration) {
      const improvement = ((olderAvgDuration - recentAvgDuration) / olderAvgDuration) * 100

      comparisons.push({
        metric: "学习效率",
        previous: Math.round(olderAvgDuration / 60),
        current: Math.round(recentAvgDuration / 60),
        improvement: Math.round(improvement),
        message: `你现在学习同样内容的时间减少了 ${Math.round(improvement)}%,效率大幅提升`,
      })
    }

    // 4. 主题广度对比
    const recentTopics = new Set(recentNodes.map((n) => n.topic)).size
    const olderTopics = new Set(olderNodes.map((n) => n.topic)).size

    if (recentTopics > olderTopics) {
      comparisons.push({
        metric: "学习广度",
        previous: olderTopics,
        current: recentTopics,
        improvement: recentTopics - olderTopics,
        message: `最近你探索了 ${recentTopics} 个新主题,学习范围在不断扩大`,
      })
    }

    return comparisons
  }

  // 生成情感化回复
  generateEmotionalResponse(userMessage: string, emotionalState: EmotionalState, context: string): string {
    let response = ""

    // 根据情绪添加前缀
    switch (emotionalState.emotion) {
      case "frustrated":
        response = "我注意到你可能遇到了一些困难。"
        break
      case "confused":
        response = "我理解这个概念可能有点难以理解。"
        break
      case "confident":
        response = "很高兴看到你掌握得这么好!"
        break
      case "curious":
        response = "这是个很好的问题!"
        break
      case "excited":
        response = "太棒了!你的进步真的很快!"
        break
      case "tired":
        response = "你已经很努力了。"
        break
      default:
        response = ""
    }

    // 添加建议回复
    if (emotionalState.suggestedResponse) {
      response += " " + emotionalState.suggestedResponse
    }

    // 添加上下文相关内容
    if (context) {
      response += "\n\n" + context
    }

    // 添加鼓励
    if (emotionalState.encouragement) {
      response += "\n\n" + emotionalState.encouragement
    }

    return response
  }

  // 生成主动关怀消息
  generateProactiveCare(timeSinceLastInteraction: number, recentActivity: any[]): string | null {
    // 超过5分钟无互动
    if (timeSinceLastInteraction > 5 * 60 * 1000) {
      return "是不是在代码调试中遇到难题了?可以把遇到的问题发给我,咱们一起解决"
    }

    // 连续多次错误
    if (recentActivity.length >= 3) {
      const errors = recentActivity.filter((a) => a.type === "error")
      if (errors.length >= 2) {
        return "我注意到你遇到了一些错误。要不要我帮你分析一下可能的原因?"
      }
    }

    return null
  }

  // 私有方法
  private detectFrustration(text: string, errorCount: number): boolean {
    const keywords = ["还是不行", "又错了", "为什么总是", "怎么还", "烦", "不对", "失败"]
    return keywords.some((kw) => text.includes(kw)) || errorCount >= 3
  }

  private detectConfusion(text: string): boolean {
    const keywords = ["不懂", "不明白", "看不懂", "糊涂", "迷惑", "什么意思", "不理解"]
    return keywords.some((kw) => text.includes(kw))
  }

  private detectTiredness(duration: number, messageCount: number): boolean {
    // 学习超过2小时或消息超过50条
    return duration > 2 * 60 * 60 * 1000 || messageCount > 50
  }

  private detectConfidence(text: string): boolean {
    const keywords = ["明白了", "懂了", "理解了", "会了", "成功", "搞定", "原来如此"]
    return keywords.some((kw) => text.includes(kw))
  }

  private detectCuriosity(text: string): boolean {
    const keywords = ["想知道", "好奇", "为什么", "怎么实现", "原理", "能不能", "可以吗"]
    return keywords.some((kw) => text.includes(kw))
  }

  private detectExcitement(text: string): boolean {
    const keywords = ["太棒了", "成功了", "终于", "厉害", "完美", "太好了", "牛"]
    return keywords.some((kw) => text.includes(kw))
  }
}

export const emotionalIntelligence = new EmotionalIntelligence()
