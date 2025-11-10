import { unifiedAI } from "./unified-ai-service"
import { codeQualityAnalyzer } from "./code-quality-analyzer"

// ==================== 代码重构优化器 ====================

export interface RefactoringRequest {
  code: string
  language: string
  goals: {
    improveReadability: boolean
    optimizePerformance: boolean
    improveArchitecture: boolean
    reduceDuplication: boolean
  }
  principles: string[] // 如 "SOLID", "DRY", "KISS"
  preserveFunctionality: boolean
}

export interface RefactoringResult {
  refactoredCode: string
  improvements: Improvement[]
  beforeMetrics: QualityMetrics
  afterMetrics: QualityMetrics
  changeLog: string
  testSuggestions: string[]
}

export interface Improvement {
  type: "readability" | "performance" | "architecture" | "duplication"
  description: string
  impact: "high" | "medium" | "low"
  linesAffected: number[]
}

interface QualityMetrics {
  complexity: number
  maintainability: number
  testability: number
  duplication: number
}

export class CodeRefactoring {
  async refactor(request: RefactoringRequest): Promise<RefactoringResult> {
    // 第一步：分析原始代码质量
    const beforeMetrics = await this.analyzeCodeMetrics(request.code)

    // 第二步：识别重构机会
    const opportunities = await this.identifyRefactoringOpportunities(request)

    // 第三步：执行重构
    const refactoredCode = await this.performRefactoring(request, opportunities)

    // 第四步：分析重构后代码质量
    const afterMetrics = await this.analyzeCodeMetrics(refactoredCode)

    // 第五步：记录改进
    const improvements = this.documentImprovements(beforeMetrics, afterMetrics, opportunities)

    // 第六步：生成变更日志
    const changeLog = this.generateChangeLog(improvements)

    // 第七步：生成测试建议
    const testSuggestions = this.generateTestSuggestions(request.code, refactoredCode)

    return {
      refactoredCode,
      improvements,
      beforeMetrics,
      afterMetrics,
      changeLog,
      testSuggestions,
    }
  }

  private async analyzeCodeMetrics(code: string): Promise<QualityMetrics> {
    const quality = codeQualityAnalyzer.analyze(code, "typescript")

    return {
      complexity: this.calculateComplexity(code),
      maintainability: quality.scores.maintainability,
      testability: quality.scores.testability,
      duplication: this.calculateDuplication(code),
    }
  }

  private async identifyRefactoringOpportunities(request: RefactoringRequest): Promise<RefactoringOpportunity[]> {
    const opportunities: RefactoringOpportunity[] = []

    if (request.goals.improveReadability) {
      opportunities.push(...this.findReadabilityIssues(request.code))
    }

    if (request.goals.optimizePerformance) {
      opportunities.push(...this.findPerformanceIssues(request.code))
    }

    if (request.goals.improveArchitecture) {
      opportunities.push(...this.findArchitectureIssues(request.code))
    }

    if (request.goals.reduceDuplication) {
      opportunities.push(...this.findDuplicationIssues(request.code))
    }

    return opportunities
  }

  private async performRefactoring(
    request: RefactoringRequest,
    opportunities: RefactoringOpportunity[],
  ): Promise<string> {
    let refactoredCode = request.code

    // 按优先级排序重构机会
    const sortedOpportunities = opportunities.sort((a, b) => b.priority - a.priority)

    for (const opportunity of sortedOpportunities) {
      refactoredCode = await this.applyRefactoring(refactoredCode, opportunity, request)
    }

    // 应用格式化和美化
    refactoredCode = this.formatCode(refactoredCode, request.language)

    return refactoredCode
  }

  private async applyRefactoring(
    code: string,
    opportunity: RefactoringOpportunity,
    request: RefactoringRequest,
  ): Promise<string> {
    const prompt = `对以下代码进行${opportunity.type}重构:

原始代码:
${code}

重构类型: ${opportunity.type}
重构描述: ${opportunity.description}
目标: ${opportunity.goal}

重构原则: ${request.principles.join(", ")}

要求:
1. ${request.preserveFunctionality ? "保持功能完全不变" : "可以调整功能实现"}
2. 应用最佳实践
3. 提高代码质量
4. 添加必要的注释说明变更

请生成重构后的代码。`

    return await unifiedAI.complete(prompt)
  }

  private findReadabilityIssues(code: string): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = []

    // 长函数
    const longFunctions = this.findLongFunctions(code)
    if (longFunctions.length > 0) {
      opportunities.push({
        type: "Extract Method",
        description: `发现${longFunctions.length}个过长函数,建议拆分`,
        goal: "将大函数拆分为多个小函数,每个函数职责单一",
        impact: "high",
        priority: 8,
        lines: longFunctions,
      })
    }

    // 不清晰的变量名
    const badNames = code.match(/\b(a|b|c|x|y|temp|tmp)\b/g)
    if (badNames && badNames.length > 3) {
      opportunities.push({
        type: "Rename Variable",
        description: "发现多个不清晰的变量名",
        goal: "使用描述性的变量名",
        impact: "medium",
        priority: 6,
        lines: [],
      })
    }

    // 嵌套过深
    const maxNesting = this.calculateMaxNesting(code)
    if (maxNesting > 4) {
      opportunities.push({
        type: "Reduce Nesting",
        description: `嵌套层级达到${maxNesting}层`,
        goal: "通过早返回、提取方法等方式减少嵌套",
        impact: "high",
        priority: 7,
        lines: [],
      })
    }

    return opportunities
  }

  private findPerformanceIssues(code: string): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = []

    // 循环中的不变量
    if (code.match(/for.*{[\s\S]*?const\s+\w+\s*=\s*[^;]+;/)) {
      opportunities.push({
        type: "Move Invariant",
        description: "循环中存在不变量计算",
        goal: "将不变量移出循环",
        impact: "medium",
        priority: 6,
        lines: [],
      })
    }

    // 多次数组遍历
    const arrayOps = (code.match(/\.(map|filter|reduce|forEach)/g) || []).length
    if (arrayOps > 3) {
      opportunities.push({
        type: "Combine Operations",
        description: "存在多次数组遍历操作",
        goal: "合并多个数组操作为单次遍历",
        impact: "high",
        priority: 7,
        lines: [],
      })
    }

    return opportunities
  }

  private findArchitectureIssues(code: string): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = []

    // 上帝类 (过多方法)
    const methods = (code.match(/\w+\s*$$[^)]*$$\s*{/g) || []).length
    if (methods > 10) {
      opportunities.push({
        type: "Split Class",
        description: "类包含过多方法,违反单一职责原则",
        goal: "将类拆分为多个职责单一的类",
        impact: "high",
        priority: 9,
        lines: [],
      })
    }

    // 紧耦合
    if (code.includes("new ") && (code.match(/new /g) || []).length > 5) {
      opportunities.push({
        type: "Dependency Injection",
        description: "存在大量直接实例化,耦合度高",
        goal: "引入依赖注入,降低耦合",
        impact: "high",
        priority: 8,
        lines: [],
      })
    }

    return opportunities
  }

  private findDuplicationIssues(code: string): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = []

    const duplicates = this.findDuplicateBlocks(code)
    if (duplicates.length > 0) {
      opportunities.push({
        type: "Extract Function",
        description: `发现${duplicates.length}处重复代码块`,
        goal: "将重复代码提取为可复用函数",
        impact: "high",
        priority: 8,
        lines: duplicates,
      })
    }

    return opportunities
  }

  private documentImprovements(
    before: QualityMetrics,
    after: QualityMetrics,
    opportunities: RefactoringOpportunity[],
  ): Improvement[] {
    const improvements: Improvement[] = []

    // 复杂度改进
    if (after.complexity < before.complexity) {
      improvements.push({
        type: "architecture",
        description: `代码复杂度从${before.complexity}降低到${after.complexity}`,
        impact: "high",
        linesAffected: [],
      })
    }

    // 可维护性改进
    if (after.maintainability > before.maintainability) {
      improvements.push({
        type: "readability",
        description: `可维护性评分从${before.maintainability}提升到${after.maintainability}`,
        impact: "high",
        linesAffected: [],
      })
    }

    // 重复代码减少
    if (after.duplication < before.duplication) {
      improvements.push({
        type: "duplication",
        description: `代码重复率从${before.duplication}%降低到${after.duplication}%`,
        impact: "medium",
        linesAffected: [],
      })
    }

    return improvements
  }

  private generateChangeLog(improvements: Improvement[]): string {
    let changeLog = `# 代码重构变更日志\n\n## 重构概述\n\n`

    changeLog += `本次重构共完成${improvements.length}项改进:\n\n`

    improvements.forEach((imp, index) => {
      changeLog += `### ${index + 1}. ${imp.type.toUpperCase()} - ${imp.impact.toUpperCase()} IMPACT\n`
      changeLog += `${imp.description}\n\n`
    })

    changeLog += `## 验证步骤\n\n`
    changeLog += `1. 运行所有单元测试确保功能未变\n`
    changeLog += `2. 执行代码审查检查重构质量\n`
    changeLog += `3. 进行性能测试验证优化效果\n\n`

    return changeLog
  }

  private generateTestSuggestions(originalCode: string, refactoredCode: string): string[] {
    const suggestions: string[] = []

    suggestions.push("运行完整的单元测试套件,确保所有测试通过")
    suggestions.push("添加针对重构部分的额外测试用例")
    suggestions.push("进行回归测试,验证功能完全一致")

    if (this.hasPerformanceChanges(originalCode, refactoredCode)) {
      suggestions.push("执行性能基准测试,对比重构前后的性能指标")
    }

    if (this.hasArchitectureChanges(originalCode, refactoredCode)) {
      suggestions.push("进行集成测试,验证模块间协作正常")
    }

    return suggestions
  }

  // 辅助方法
  private calculateComplexity(code: string): number {
    // McCabe圈复杂度简化计算
    const decisions = (code.match(/if|for|while|case|&&|\|\|/g) || []).length
    return decisions + 1
  }

  private calculateDuplication(code: string): number {
    const lines = code.split("\n").filter((line) => line.trim())
    const uniqueLines = new Set(lines)
    return Math.round(((lines.length - uniqueLines.size) / lines.length) * 100)
  }

  private findLongFunctions(code: string): number[] {
    const lines: number[] = []
    const functionRegex = /function[^{]+{([^}]+)}/g
    let match
    let lineNumber = 0

    while ((match = functionRegex.exec(code)) !== null) {
      const funcBody = match[1]
      const funcLines = funcBody.split("\n").length
      if (funcLines > 30) {
        lines.push(lineNumber)
      }
      lineNumber += funcLines
    }

    return lines
  }

  private calculateMaxNesting(code: string): number {
    let maxNesting = 0
    let currentNesting = 0

    for (const char of code) {
      if (char === "{") {
        currentNesting++
        maxNesting = Math.max(maxNesting, currentNesting)
      } else if (char === "}") {
        currentNesting--
      }
    }

    return maxNesting
  }

  private findDuplicateBlocks(code: string): number[] {
    // 简化实现:查找重复的代码行
    const lines = code.split("\n")
    const seen = new Map<string, number[]>()
    const duplicates: number[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("//")) {
        if (seen.has(trimmed)) {
          seen.get(trimmed)!.push(index)
        } else {
          seen.set(trimmed, [index])
        }
      }
    })

    seen.forEach((indices) => {
      if (indices.length > 1) {
        duplicates.push(...indices)
      }
    })

    return duplicates
  }

  private formatCode(code: string, language: string): string {
    // 简单的格式化处理
    let formatted = code
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")

    // 移除多余空行
    formatted = formatted.replace(/\n{3,}/g, "\n\n")

    return formatted
  }

  private hasPerformanceChanges(original: string, refactored: string): boolean {
    const originalLoops = (original.match(/for|while/g) || []).length
    const refactoredLoops = (refactored.match(/for|while/g) || []).length
    return originalLoops !== refactoredLoops
  }

  private hasArchitectureChanges(original: string, refactored: string): boolean {
    const originalClasses = (original.match(/class\s+\w+/g) || []).length
    const refactoredClasses = (refactored.match(/class\s+\w+/g) || []).length
    return Math.abs(originalClasses - refactoredClasses) > 1
  }
}

interface RefactoringOpportunity {
  type: string
  description: string
  goal: string
  impact: "high" | "medium" | "low"
  priority: number
  lines: number[]
}

export const codeRefactoring = new CodeRefactoring()
