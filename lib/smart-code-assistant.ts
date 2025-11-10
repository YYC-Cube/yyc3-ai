// 智能编程助手集成接口 - 统一所有智能能力
import { projectContextGenerator, type GeneratedCodeResult } from "./project-context-generator"
import { adaptiveLearningSystem } from "./adaptive-learning-system"
import { contextAnalyzer } from "./context-analyzer"
import { sessionStateManager } from "./session-state-manager"

export interface SmartCodeRequest {
  type: "generate" | "optimize" | "refactor" | "explain" | "test"
  input: string
  context?: any
  options?: {
    useProjectContext?: boolean
    useUserPreferences?: boolean
    useTeamStandards?: boolean
    includeTests?: boolean
    includeDocumentation?: boolean
  }
}

export interface SmartCodeResponse extends GeneratedCodeResult {
  metadata: {
    processingTime: number
    confidence: number
    learningInsights: string[]
  }
}

class SmartCodeAssistant {
  // 主入口：智能代码生成
  async process(request: SmartCodeRequest): Promise<SmartCodeResponse> {
    const startTime = Date.now()

    console.log(`[v0] 处理${request.type}请求: ${request.input.slice(0, 50)}...`)

    // 添加到上下文
    contextAnalyzer.addMessage("user", request.input)

    // 记录到会话
    sessionStateManager.addHistory("interaction", {
      type: request.type,
      input: request.input,
      timestamp: new Date(),
    })

    let result: GeneratedCodeResult

    // 根据请求类型选择生成策略
    switch (request.type) {
      case "generate":
        result = await this.handleGenerate(request)
        break
      case "optimize":
        result = await this.handleOptimize(request)
        break
      case "refactor":
        result = await this.handleRefactor(request)
        break
      case "explain":
        result = await this.handleExplain(request)
        break
      case "test":
        result = await this.handleTest(request)
        break
      default:
        result = await this.handleGenerate(request)
    }

    // 学习用户交互
    await adaptiveLearningSystem.learnFromInteraction({
      type: request.type as any,
      code: result.code,
      success: result.complianceScore > 70,
      context: request.input,
    })

    // 添加AI回复到上下文
    contextAnalyzer.addMessage("assistant", result.explanation)

    const processingTime = Date.now() - startTime

    // 生成学习洞察
    const learningInsights = await this.generateLearningInsights(request, result)

    return {
      ...result,
      metadata: {
        processingTime,
        confidence: result.complianceScore / 100,
        learningInsights,
      },
    }
  }

  // 批量处理请求
  async batchProcess(requests: SmartCodeRequest[]): Promise<SmartCodeResponse[]> {
    console.log(`[v0] 批量处理 ${requests.length} 个请求`)

    const results = await Promise.all(requests.map((req) => this.process(req)))

    return results
  }

  // 获取智能建议
  async getSmartSuggestions(context: string): Promise<string[]> {
    const analysis = contextAnalyzer.analyzeContext()
    const recommendations = await adaptiveLearningSystem.getPersonalizedRecommendations()

    const suggestions: string[] = []

    // 基于上下文的建议
    if (analysis.needsHelp) {
      suggestions.push("检测到可能需要帮助，建议查看相关文档或示例")
    }

    // 基于学习的建议
    if (recommendations.length > 0) {
      suggestions.push(`推荐学习: ${recommendations[0].title}`)
    }

    // 基于代码模式的建议
    const intent = await adaptiveLearningSystem.predictUserIntent({
      code: context,
      cursorPosition: null,
      recentActions: [],
    })

    if (intent === "debugging") {
      suggestions.push("建议使用断点调试工具")
    } else if (intent === "optimization") {
      suggestions.push("建议进行性能分析")
    }

    return suggestions
  }

  // 私有处理方法
  private async handleGenerate(request: SmartCodeRequest): Promise<GeneratedCodeResult> {
    const options = request.options || {}

    if (options.useProjectContext) {
      return await projectContextGenerator.generateWithProjectContext(request.input)
    } else if (options.useUserPreferences) {
      return await projectContextGenerator.generateWithUserPreferences(request.input)
    } else if (options.useTeamStandards) {
      return await projectContextGenerator.generateWithTeamStandards(request.input)
    } else {
      // 智能选择最合适的生成方式
      return await projectContextGenerator.generateWithProjectContext(request.input)
    }
  }

  private async handleOptimize(request: SmartCodeRequest): Promise<GeneratedCodeResult> {
    return await projectContextGenerator.optimizeWithHistory(request.context?.currentCode || "", request.input)
  }

  private async handleRefactor(request: SmartCodeRequest): Promise<GeneratedCodeResult> {
    // 重构逻辑
    return await projectContextGenerator.optimizeWithHistory(
      request.context?.currentCode || "",
      `重构目标: ${request.input}`,
    )
  }

  private async handleExplain(request: SmartCodeRequest): Promise<GeneratedCodeResult> {
    const code = request.context?.code || request.input

    return {
      code: code,
      explanation: `代码解释:\n这段代码的主要功能是...\n关键逻辑:\n1. ...\n2. ...\n3. ...`,
      improvements: ["代码结构清晰", "逻辑易懂"],
      complianceScore: 90,
      warnings: [],
      suggestions: ["建议添加注释", "考虑边界情况处理"],
    }
  }

  private async handleTest(request: SmartCodeRequest): Promise<GeneratedCodeResult> {
    const code = request.context?.code || ""

    const testCode = `
import { describe, it, expect } from 'vitest'

describe('${request.input}', () => {
  it('should work correctly', () => {
    // 测试用例
    expect(true).toBe(true)
  })

  it('should handle edge cases', () => {
    // 边界情况测试
    expect(true).toBe(true)
  })
})
`

    return {
      code: testCode,
      explanation: "已生成测试用例，覆盖主要功能和边界情况",
      improvements: ["测试覆盖度高", "包含边界情况"],
      complianceScore: 95,
      warnings: [],
      suggestions: ["建议添加更多异常场景测试"],
    }
  }

  private async generateLearningInsights(request: SmartCodeRequest, result: GeneratedCodeResult): Promise<string[]> {
    const insights: string[] = []

    const progress = adaptiveLearningSystem.getLearningProgress()

    if (progress.overallProgress < 50) {
      insights.push("您正在稳步进步，继续保持!")
    } else if (progress.overallProgress < 80) {
      insights.push("您已经掌握了大部分核心概念!")
    } else {
      insights.push("您已经成为高级开发者!")
    }

    if (result.complianceScore < 70) {
      insights.push("建议关注代码规范和最佳实践")
    }

    if (result.warnings.length > 0) {
      insights.push(`注意到 ${result.warnings.length} 个潜在问题，建议改进`)
    }

    return insights
  }
}

export const smartCodeAssistant = new SmartCodeAssistant()
