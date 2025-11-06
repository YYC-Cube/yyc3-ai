"use client"

// AI集成桥接系统 - 连接代码预览与学习系统
import { learningTracker } from "./learning-tracker"
import { contextAnalyzer } from "./context-analyzer"
import { codeExecutor } from "./code-executor"
import { previewManager } from "./preview-manager"

export interface AICodeSuggestion {
  id: string
  type: "fix" | "improve" | "explain" | "refactor" | "optimize"
  title: string
  description: string
  code: string
  language: string
  confidence: number
  learningTopic?: string
}

export interface CodeAnalysisResult {
  errors: CodeError[]
  warnings: CodeWarning[]
  suggestions: AICodeSuggestion[]
  complexity: number
  performance: PerformanceMetrics
  learningOpportunities: LearningOpportunity[]
}

export interface CodeError {
  line: number
  column: number
  message: string
  severity: "error" | "warning"
  fix?: string
}

export interface CodeWarning {
  line: number
  message: string
  suggestion: string
}

export interface PerformanceMetrics {
  executionTime: number
  memoryUsage: number
  renderTime?: number
  score: number
}

export interface LearningOpportunity {
  topic: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  resources: string[]
}

class AIIntegrationBridge {
  // 分析代码并生成学习建议
  async analyzeCodeForLearning(code: string, language: string): Promise<CodeAnalysisResult> {
    const errors: CodeError[] = []
    const warnings: CodeWarning[] = []
    const suggestions: AICodeSuggestion[] = []
    const learningOpportunities: LearningOpportunity[] = []

    // 基础语法检查
    if (language === "javascript" || language === "typescript") {
      // 检查常见错误模式
      if (code.includes("var ")) {
        warnings.push({
          line: code.split("\n").findIndex((l) => l.includes("var ")) + 1,
          message: "使用 var 声明变量",
          suggestion: "建议使用 let 或 const 代替 var",
        })
        learningOpportunities.push({
          topic: "ES6 变量声明",
          description: "学习 let 和 const 的区别及最佳实践",
          difficulty: "beginner",
          resources: ["MDN: let", "MDN: const"],
        })
      }

      if (code.includes("==") && !code.includes("===")) {
        warnings.push({
          line: code.split("\n").findIndex((l) => l.includes("==")) + 1,
          message: "使用宽松相等比较",
          suggestion: "建议使用严格相等 === 代替 ==",
        })
      }

      // 检查异步处理
      if (code.includes("async") && !code.includes("try")) {
        suggestions.push({
          id: `suggestion-${Date.now()}`,
          type: "improve",
          title: "添加错误处理",
          description: "异步函数应该包含 try-catch 错误处理",
          code: `try {\n  // 你的异步代码\n} catch (error) {\n  console.error('错误:', error)\n}`,
          language: "javascript",
          confidence: 0.85,
          learningTopic: "异步编程与错误处理",
        })
        learningOpportunities.push({
          topic: "异步编程最佳实践",
          description: "学习如何正确处理 Promise 和 async/await 中的错误",
          difficulty: "intermediate",
          resources: ["JavaScript.info: Error handling", "MDN: try...catch"],
        })
      }

      // 检查 React 特定模式
      if (code.includes("useState") || code.includes("useEffect")) {
        if (code.includes("useEffect") && !code.includes("return")) {
          suggestions.push({
            id: `suggestion-${Date.now()}-1`,
            type: "improve",
            title: "添加清理函数",
            description: "useEffect 应该返回清理函数以避免内存泄漏",
            code: `useEffect(() => {\n  // 副作用代码\n  return () => {\n    // 清理代码\n  }\n}, [dependencies])`,
            language: "javascript",
            confidence: 0.75,
            learningTopic: "React Hooks 生命周期",
          })
        }
      }
    }

    // 计算代码复杂度
    const complexity = this.calculateComplexity(code)

    // 性能指标
    const performance: PerformanceMetrics = {
      executionTime: 0,
      memoryUsage: 0,
      score: 100 - errors.length * 20 - warnings.length * 5,
    }

    return {
      errors,
      warnings,
      suggestions,
      complexity,
      performance,
      learningOpportunities,
    }
  }

  // 执行代码并记录学习进度
  async executeAndLearn(
    code: string,
    language: string,
  ): Promise<{
    result: any
    analysis: CodeAnalysisResult
    learningProgress: any
  }> {
    // 分析代码
    const analysis = await this.analyzeCodeForLearning(code, language)

    // 执行代码
    let result
    try {
      result = await codeExecutor.execute(code, language)

      // 记录成功执行
      learningTracker.recordNode({
        topic: `${language} 编程`,
        subtopic: "代码执行",
        mastery: 0.8,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      // 记录错误
      learningTracker.recordError({
        topic: `${language} 编程`,
        error: error.message,
        context: code.slice(0, 100),
        timestamp: new Date().toISOString(),
      })
      result = { error: error.message }
    }

    // 记录学习机会
    for (const opportunity of analysis.learningOpportunities) {
      learningTracker.recordNode({
        topic: opportunity.topic,
        subtopic: opportunity.description,
        mastery: 0.3,
        timestamp: new Date().toISOString(),
      })
    }

    // 获取学习进度
    const learningProgress = learningTracker.getProgress()

    return {
      result,
      analysis,
      learningProgress,
    }
  }

  // 生成AI驱动的代码改进建议
  async generateImprovements(code: string, language: string, context: string): Promise<AICodeSuggestion[]> {
    const suggestions: AICodeSuggestion[] = []

    // 分析用户意图
    const intent = contextAnalyzer.analyzeContext([
      { role: "user", content: context, timestamp: new Date().toISOString() },
    ])

    // 基于意图生成建议
    if (intent.intent === "learning") {
      suggestions.push({
        id: `suggestion-learn-${Date.now()}`,
        type: "explain",
        title: "代码解释",
        description: "让我解释这段代码的工作原理",
        code: code,
        language: language,
        confidence: 0.9,
        learningTopic: "代码理解",
      })
    }

    if (intent.intent === "debugging") {
      suggestions.push({
        id: `suggestion-debug-${Date.now()}`,
        type: "fix",
        title: "调试建议",
        description: "添加调试语句帮助定位问题",
        code: this.addDebugStatements(code, language),
        language: language,
        confidence: 0.85,
        learningTopic: "调试技巧",
      })
    }

    // 性能优化建议
    if (code.length > 500) {
      suggestions.push({
        id: `suggestion-optimize-${Date.now()}`,
        type: "optimize",
        title: "性能优化",
        description: "代码较长,考虑拆分为更小的函数",
        code: "// 建议将代码拆分为多个小函数\n// 每个函数只做一件事",
        language: language,
        confidence: 0.7,
        learningTopic: "代码组织与重构",
      })
    }

    return suggestions
  }

  // 同步预览与学习状态
  async syncPreviewWithLearning(code: string, language: string): Promise<void> {
    // 更新预览
    await previewManager.updatePreview(code, language)

    // 分析并记录学习
    const analysis = await this.analyzeCodeForLearning(code, language)

    // 如果有学习机会,记录到学习追踪器
    for (const opportunity of analysis.learningOpportunities) {
      learningTracker.recordQuestion({
        topic: opportunity.topic,
        question: opportunity.description,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // 计算代码复杂度
  private calculateComplexity(code: string): number {
    let complexity = 1

    // 计算循环
    const loops = (code.match(/for|while|forEach|map|filter|reduce/g) || []).length
    complexity += loops * 2

    // 计算条件语句
    const conditions = (code.match(/if|else|switch|case|\?/g) || []).length
    complexity += conditions

    // 计算函数定义
    const functions = (code.match(/function|=>|async/g) || []).length
    complexity += functions

    return complexity
  }

  // 添加调试语句
  private addDebugStatements(code: string, language: string): string {
    if (language === "javascript" || language === "typescript") {
      const lines = code.split("\n")
      const debuggedLines = lines.map((line, index) => {
        if (line.includes("function") || line.includes("=>")) {
          return `${line}\n  console.log('[v0 Debug] 函数执行 - 行 ${index + 1}')`
        }
        if (line.includes("return")) {
          return `  console.log('[v0 Debug] 返回值:', ${line.match(/return\s+(.+)/)?.[1] || "undefined"})\n${line}`
        }
        return line
      })
      return debuggedLines.join("\n")
    }
    return code
  }
}

export const aiIntegrationBridge = new AIIntegrationBridge()
export default aiIntegrationBridge
