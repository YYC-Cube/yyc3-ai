// AI驱动代码审查系统
export interface CodeReviewResult {
  score: number // 0-100
  issues: CodeIssue[]
  suggestions: ReviewSuggestion[]
  metrics: CodeMetrics
  summary: string
  autoFixAvailable: boolean
  fixableIssuesCount: number
}

export interface CodeIssue {
  id: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  category: "security" | "performance" | "maintainability" | "style" | "best-practice"
  title: string
  description: string
  line: number
  column?: number
  code: string
  fix?: string
  autoFix?: (code: string) => string
  resources: string[]
}

export interface ReviewSuggestion {
  id: string
  type: "refactor" | "optimize" | "simplify" | "modernize"
  title: string
  description: string
  before: string
  after: string
  impact: "high" | "medium" | "low"
  effort: "high" | "medium" | "low"
}

export interface CodeMetrics {
  linesOfCode: number
  complexity: number
  maintainability: number
  testCoverage: number
  duplicateCode: number
  technicalDebt: number
}

class CodeReviewAI {
  // 执行完整代码审查
  private reviewHistory: ReviewHistory[] = []
  private maxHistorySize = 50

  async reviewCode(code: string, language: string, context?: string): Promise<CodeReviewResult> {
    const issues = await this.detectIssues(code, language)
    const suggestions = await this.generateSuggestions(code, language)
    const metrics = this.calculateMetrics(code, language)
    const score = this.calculateScore(issues, metrics)
    const summary = this.generateSummary(score, issues, suggestions, metrics)

    const fixableIssuesCount = issues.filter((issue) => issue.autoFix).length

    const result: CodeReviewResult = {
      score,
      issues,
      suggestions,
      metrics,
      summary,
      autoFixAvailable: fixableIssuesCount > 0,
      fixableIssuesCount,
    }

    this.saveReviewHistory({
      id: `review-${Date.now()}`,
      timestamp: Date.now(),
      fileName: context || "unknown",
      language,
      result,
      appliedFixes: [],
    })

    return result
  }

  async autoFixAll(code: string, issues: CodeIssue[]): Promise<{ fixedCode: string; appliedFixes: string[] }> {
    let fixedCode = code
    const appliedFixes: string[] = []

    // 按行号倒序排序,从后往前修复,避免位置偏移
    const sortedIssues = [...issues].filter((issue) => issue.autoFix).sort((a, b) => b.line - a.line)

    for (const issue of sortedIssues) {
      if (issue.autoFix) {
        try {
          fixedCode = issue.autoFix(fixedCode)
          appliedFixes.push(issue.id)
        } catch (error) {
          console.error(`[v0] Failed to apply fix for issue ${issue.id}:`, error)
        }
      }
    }

    return { fixedCode, appliedFixes }
  }

  async applySingleFix(code: string, issue: CodeIssue): Promise<string> {
    if (!issue.autoFix) {
      throw new Error("This issue does not have an auto-fix available")
    }

    try {
      return issue.autoFix(code)
    } catch (error) {
      console.error(`[v0] Failed to apply fix for issue ${issue.id}:`, error)
      throw error
    }
  }

  getReviewHistory(limit?: number): ReviewHistory[] {
    const history = [...this.reviewHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  private saveReviewHistory(history: ReviewHistory) {
    this.reviewHistory.push(history)
    if (this.reviewHistory.length > this.maxHistorySize) {
      this.reviewHistory.shift()
    }
  }

  async learnFromHistory(): Promise<{ patternsLearned: number; accuracy: number }> {
    const patterns = new Map<string, number>()

    // 分析历史记录中的常见问题模式
    for (const history of this.reviewHistory) {
      for (const issue of history.result.issues) {
        const key = `${issue.category}:${issue.title}`
        patterns.set(key, (patterns.get(key) || 0) + 1)
      }
    }

    // 计算准确性(基于应用的修复数量)
    const totalReviews = this.reviewHistory.length
    const reviewsWithFixes = this.reviewHistory.filter((h) => h.appliedFixes.length > 0).length
    const accuracy = totalReviews > 0 ? (reviewsWithFixes / totalReviews) * 100 : 0

    return {
      patternsLearned: patterns.size,
      accuracy: Math.round(accuracy),
    }
  }

  // 检测代码问题
  private async detectIssues(code: string, language: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = []

    if (language === "javascript" || language === "typescript") {
      // 安全问题检测
      if (code.includes("eval(")) {
        const line = code.split("\n").findIndex((l) => l.includes("eval(")) + 1
        issues.push({
          id: `issue-${Date.now()}-1`,
          severity: "critical",
          category: "security",
          title: "使用 eval() 存在安全风险",
          description: "eval() 可以执行任意代码,容易受到代码注入攻击",
          line,
          code: code.split("\n").find((l) => l.includes("eval(")) || "",
          fix: "使用 JSON.parse() 或其他安全的替代方案",
          autoFix: (code: string) => {
            return code.replace(/eval\s*\(/g, "JSON.parse(")
          },
          resources: ["OWASP: Code Injection", "MDN: eval()"],
        })
      }

      if (code.includes("innerHTML") && !code.includes("sanitize")) {
        issues.push({
          id: `issue-${Date.now()}-2`,
          severity: "high",
          category: "security",
          title: "未经清理的 innerHTML 可能导致 XSS",
          description: "直接设置 innerHTML 可能导致跨站脚本攻击",
          line: code.split("\n").findIndex((l) => l.includes("innerHTML")) + 1,
          code: code.split("\n").find((l) => l.includes("innerHTML")) || "",
          fix: "使用 textContent 或清理输入数据",
          resources: ["OWASP: XSS Prevention", "DOMPurify"],
        })
      }

      // 性能问题检测
      if (code.match(/for\s*$$[^)]*$$\s*{[^}]*document\.querySelector/)) {
        issues.push({
          id: `issue-${Date.now()}-3`,
          severity: "medium",
          category: "performance",
          title: "循环中的 DOM 查询",
          description: "在循环中重复查询 DOM 会严重影响性能",
          line: code.split("\n").findIndex((l) => l.includes("querySelector")) + 1,
          code: code.split("\n").find((l) => l.includes("querySelector")) || "",
          fix: "将 DOM 查询移到循环外部",
          resources: ["Web Performance: DOM Access"],
        })
      }

      // 可维护性问题
      const functionLines = code.split("\n").filter((l) => l.includes("function") || l.includes("=>"))
      for (const line of functionLines) {
        const functionBody = this.extractFunctionBody(code, line)
        if (functionBody.split("\n").length > 50) {
          issues.push({
            id: `issue-${Date.now()}-4`,
            severity: "medium",
            category: "maintainability",
            title: "函数过长",
            description: "函数超过 50 行,建议拆分为更小的函数",
            line: code.split("\n").indexOf(line) + 1,
            code: line,
            fix: "将函数拆分为多个职责单一的小函数",
            resources: ["Clean Code: Functions"],
          })
        }
      }

      // 代码风格问题
      if (code.includes("var ")) {
        const line = code.split("\n").findIndex((l) => l.includes("var ")) + 1
        issues.push({
          id: `issue-${Date.now()}-5`,
          severity: "low",
          category: "style",
          title: "使用过时的 var 声明",
          description: "var 有函数作用域问题,建议使用 let 或 const",
          line,
          code: code.split("\n").find((l) => l.includes("var ")) || "",
          fix: "使用 let 或 const 代替 var",
          autoFix: (code: string) => {
            return code.replace(/\bvar\b/g, "let")
          },
          resources: ["ES6: let and const"],
        })
      }

      if (code.match(/function\s*$$[^)]*$$\s*{[\s\S]*?}\s*$/m)) {
        const match = code.match(/function\s*$$[^)]*$$\s*{/)
        if (match) {
          const line = code.substring(0, code.indexOf(match[0])).split("\n").length
          issues.push({
            id: `issue-${Date.now()}-8`,
            severity: "info",
            category: "style",
            title: "可以使用箭头函数",
            description: "箭头函数语法更简洁",
            line,
            code: match[0],
            fix: "转换为箭头函数",
            autoFix: (code: string) => {
              return code.replace(/function\s*$$([^)]*)$$\s*{/g, "($1) => {")
            },
            resources: ["ES6: Arrow Functions"],
          })
        }
      }

      // 最佳实践检测
      if (code.includes("console.log") && !code.includes("// DEBUG")) {
        issues.push({
          id: `issue-${Date.now()}-6`,
          severity: "info",
          category: "best-practice",
          title: "生产代码中的 console.log",
          description: "生产环境应移除调试日志",
          line: code.split("\n").findIndex((l) => l.includes("console.log")) + 1,
          code: code.split("\n").find((l) => l.includes("console.log")) || "",
          fix: "使用日志库或在生产环境中移除",
          resources: ["Logging Best Practices"],
        })
      }

      if (code.includes("==") && !code.includes("===")) {
        const line = code.split("\n").findIndex((l) => l.includes("==") && !l.includes("===")) + 1
        issues.push({
          id: `issue-${Date.now()}-7`,
          severity: "medium",
          category: "best-practice",
          title: "使用宽松相等运算符",
          description: "== 会进行类型转换,可能导致意外结果,建议使用 ===",
          line,
          code: code.split("\n").find((l) => l.includes("==") && !l.includes("===")) || "",
          fix: "使用 === 代替 ==",
          autoFix: (code: string) => {
            return code.replace(/([^=!])={2}([^=])/g, "$1===$2").replace(/([^=!])!={1}([^=])/g, "$1!==$2")
          },
          resources: ["JavaScript: Equality Comparisons"],
        })
      }
    }

    return issues
  }

  // 生成改进建议
  private async generateSuggestions(code: string, language: string): Promise<ReviewSuggestion[]> {
    const suggestions: ReviewSuggestion[] = []

    if (language === "javascript" || language === "typescript") {
      // 现代化建议
      if (code.includes("function") && !code.includes("=>")) {
        const functionMatch = code.match(/function\s+(\w+)\s*$$[^)]*$$\s*{/)
        if (functionMatch) {
          suggestions.push({
            id: `suggestion-${Date.now()}-1`,
            type: "modernize",
            title: "使用箭头函数",
            description: "箭头函数语法更简洁,且不绑定 this",
            before: functionMatch[0],
            after: `const ${functionMatch[1]} = () => {`,
            impact: "low",
            effort: "low",
          })
        }
      }

      // 简化建议
      if (code.includes("if") && code.includes("return true") && code.includes("return false")) {
        suggestions.push({
          id: `suggestion-${Date.now()}-2`,
          type: "simplify",
          title: "简化条件返回",
          description: "可以直接返回条件表达式的结果",
          before: "if (condition) {\n  return true\n} else {\n  return false\n}",
          after: "return condition",
          impact: "low",
          effort: "low",
        })
      }

      // 重构建议
      const duplicateCode = this.findDuplicateCode(code)
      if (duplicateCode.length > 0) {
        suggestions.push({
          id: `suggestion-${Date.now()}-3`,
          type: "refactor",
          title: "提取重复代码",
          description: "发现重复代码,建议提取为函数",
          before: duplicateCode[0],
          after: "// 提取为独立函数\nfunction extractedFunction() {\n  // 重复的代码\n}",
          impact: "medium",
          effort: "medium",
        })
      }

      // 优化建议
      if (code.includes(".map(") && code.includes(".filter(")) {
        suggestions.push({
          id: `suggestion-${Date.now()}-4`,
          type: "optimize",
          title: "合并数组操作",
          description: "多次数组遍历可以合并为一次,提升性能",
          before: "array.filter(x => x > 0).map(x => x * 2)",
          after: "array.reduce((acc, x) => x > 0 ? [...acc, x * 2] : acc, [])",
          impact: "medium",
          effort: "low",
        })
      }
    }

    return suggestions
  }

  // 计算代码指标
  private calculateMetrics(code: string, language: string): CodeMetrics {
    const lines = code.split("\n")
    const linesOfCode = lines.filter((l) => l.trim() && !l.trim().startsWith("//")).length

    // 圈复杂度
    const complexity = this.calculateComplexity(code)

    // 可维护性指数 (0-100)
    const maintainability = Math.max(0, 100 - complexity * 2 - linesOfCode / 10)

    // 模拟测试覆盖率
    const testCoverage = code.includes("test(") || code.includes("it(") ? 75 : 0

    // 重复代码百分比
    const duplicateCode = this.findDuplicateCode(code).length > 0 ? 15 : 0

    // 技术债务 (小时)
    const technicalDebt = Math.round((complexity * 0.5 + duplicateCode * 0.3) * 10) / 10

    return {
      linesOfCode,
      complexity,
      maintainability,
      testCoverage,
      duplicateCode,
      technicalDebt,
    }
  }

  // 计算圈复杂度
  private calculateComplexity(code: string): number {
    let complexity = 1
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ]

    for (const pattern of patterns) {
      const matches = code.match(pattern)
      if (matches) complexity += matches.length
    }

    return complexity
  }

  // 查找重复代码
  private findDuplicateCode(code: string): string[] {
    const lines = code.split("\n").filter((l) => l.trim())
    const duplicates: string[] = []
    const seen = new Map<string, number>()

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 20) {
        const count = seen.get(trimmed) || 0
        seen.set(trimmed, count + 1)
        if (count === 1) {
          duplicates.push(trimmed)
        }
      }
    }

    return duplicates
  }

  // 提取函数体
  private extractFunctionBody(code: string, functionLine: string): string {
    const startIndex = code.indexOf(functionLine)
    if (startIndex === -1) return ""

    let braceCount = 0
    let inFunction = false
    let body = ""

    for (let i = startIndex; i < code.length; i++) {
      const char = code[i]
      if (char === "{") {
        braceCount++
        inFunction = true
      }
      if (inFunction) body += char
      if (char === "}") {
        braceCount--
        if (braceCount === 0) break
      }
    }

    return body
  }

  // 计算总分
  private calculateScore(issues: CodeIssue[], metrics: CodeMetrics): number {
    let score = 100

    // 根据问题严重程度扣分
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          score -= 20
          break
        case "high":
          score -= 10
          break
        case "medium":
          score -= 5
          break
        case "low":
          score -= 2
          break
        case "info":
          score -= 1
          break
      }
    }

    // 根据指标调整分数
    score -= (metrics.complexity - 10) * 2
    score -= metrics.duplicateCode
    score += metrics.testCoverage * 0.2

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // 生成总结
  private generateSummary(
    score: number,
    issues: CodeIssue[],
    suggestions: ReviewSuggestion[],
    metrics: CodeMetrics,
  ): string {
    const grade = score >= 90 ? "优秀" : score >= 75 ? "良好" : score >= 60 ? "及格" : "需要改进"
    const criticalCount = issues.filter((i) => i.severity === "critical").length
    const highCount = issues.filter((i) => i.severity === "high").length

    let summary = `代码质量评分: ${score}/100 (${grade})\n\n`

    if (criticalCount > 0) {
      summary += `⚠️ 发现 ${criticalCount} 个严重问题,需要立即修复\n`
    }
    if (highCount > 0) {
      summary += `⚠️ 发现 ${highCount} 个高优先级问题\n`
    }

    summary += `\n代码指标:\n`
    summary += `- 代码行数: ${metrics.linesOfCode}\n`
    summary += `- 圈复杂度: ${metrics.complexity}\n`
    summary += `- 可维护性: ${Math.round(metrics.maintainability)}/100\n`
    summary += `- 测试覆盖率: ${metrics.testCoverage}%\n`

    if (suggestions.length > 0) {
      summary += `\n💡 提供了 ${suggestions.length} 条改进建议`
    }

    return summary
  }
}

export interface ReviewHistory {
  id: string
  timestamp: number
  fileName: string
  language: string
  result: CodeReviewResult
  appliedFixes: string[]
}

export const codeReviewAI = new CodeReviewAI()
export default codeReviewAI
