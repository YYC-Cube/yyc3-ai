// 代码质量分析器 - 自动检测代码质量并提供改进建议

export interface QualityMetrics {
  overallScore: number
  scores: {
    readability: number
    maintainability: number
    performance: number
    security: number
    testability: number
  }
  issues: QualityIssue[]
  suggestions: QualitySuggestion[]
}

export interface QualityIssue {
  type: "error" | "warning" | "info"
  category: "readability" | "maintainability" | "performance" | "security" | "testability"
  message: string
  line?: number
  severity: number // 1-10
  autoFixable: boolean
}

export interface QualitySuggestion {
  category: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  impact: string
}

class CodeQualityAnalyzer {
  // 分析代码质量
  analyze(code: string, language: string): QualityMetrics {
    const issues: QualityIssue[] = []
    const suggestions: QualitySuggestion[] = []

    // 1. 可读性分析
    issues.push(...this.analyzeReadability(code, language))

    // 2. 可维护性分析
    issues.push(...this.analyzeMaintainability(code, language))

    // 3. 性能分析
    issues.push(...this.analyzePerformance(code, language))

    // 4. 安全性分析
    issues.push(...this.analyzeSecurity(code, language))

    // 5. 可测试性分析
    issues.push(...this.analyzeTestability(code, language))

    // 生成建议
    suggestions.push(...this.generateSuggestions(issues))

    // 计算评分
    const scores = this.calculateScores(issues)
    const overallScore = this.calculateOverallScore(scores)

    return {
      overallScore,
      scores,
      issues,
      suggestions,
    }
  }

  // 可读性分析
  private analyzeReadability(code: string, language: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const lines = code.split("\n")

    // 检查过长的行
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          type: "warning",
          category: "readability",
          message: "代码行过长,建议不超过120字符",
          line: index + 1,
          severity: 3,
          autoFixable: false,
        })
      }
    })

    // 检查命名规范
    const badVariableNames = code.match(/\b(a|b|c|x|y|z|tmp|temp)\b/g)
    if (badVariableNames && badVariableNames.length > 3) {
      issues.push({
        type: "warning",
        category: "readability",
        message: "发现多个无意义的变量名,建议使用描述性命名",
        severity: 4,
        autoFixable: false,
      })
    }

    // 检查注释
    const commentLines = lines.filter((line) => line.trim().startsWith("//") || line.trim().startsWith("/*"))
    const codeLines = lines.filter((line) => line.trim() && !line.trim().startsWith("//"))
    const commentRatio = commentLines.length / (codeLines.length || 1)

    if (commentRatio < 0.05 && codeLines.length > 50) {
      issues.push({
        type: "info",
        category: "readability",
        message: "代码缺少注释,建议添加必要的说明",
        severity: 3,
        autoFixable: false,
      })
    }

    return issues
  }

  // 可维护性分析
  private analyzeMaintainability(code: string, language: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 检查函数长度
    const functionMatches = code.match(/function\s+\w+\s*$$[^)]*$$\s*{[^}]*}/g) || []
    functionMatches.forEach((func) => {
      const lines = func.split("\n").length
      if (lines > 50) {
        issues.push({
          type: "warning",
          category: "maintainability",
          message: "函数过长,建议拆分为多个小函数",
          severity: 6,
          autoFixable: false,
        })
      }
    })

    // 检查嵌套层级
    const maxNesting = this.calculateMaxNesting(code)
    if (maxNesting > 4) {
      issues.push({
        type: "warning",
        category: "maintainability",
        message: `嵌套层级过深(${maxNesting}层),建议简化逻辑`,
        severity: 7,
        autoFixable: false,
      })
    }

    // 检查重复代码
    const duplicates = this.findDuplicateCode(code)
    if (duplicates > 0) {
      issues.push({
        type: "warning",
        category: "maintainability",
        message: `发现${duplicates}处重复代码,建议提取为复用函数`,
        severity: 5,
        autoFixable: false,
      })
    }

    return issues
  }

  // 性能分析
  private analyzePerformance(code: string, language: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 检查循环中的DOM操作
    if (code.match(/for.*{[\s\S]*?document\.(querySelector|getElementById)/)) {
      issues.push({
        type: "warning",
        category: "performance",
        message: "循环中存在DOM查询,建议缓存DOM引用",
        severity: 7,
        autoFixable: false,
      })
    }

    // 检查不必要的数组遍历
    const arrayMethods = code.match(/\.(map|filter|reduce|forEach)/g) || []
    if (arrayMethods.length > 3) {
      issues.push({
        type: "info",
        category: "performance",
        message: "多次数组遍历,考虑合并操作以提升性能",
        severity: 4,
        autoFixable: false,
      })
    }

    return issues
  }

  // 安全性分析
  private analyzeSecurity(code: string, language: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 检查eval使用
    if (code.includes("eval(")) {
      issues.push({
        type: "error",
        category: "security",
        message: "使用eval()存在安全风险,建议使用JSON.parse()",
        severity: 10,
        autoFixable: true,
      })
    }

    // 检查innerHTML
    if (code.match(/innerHTML\s*=/)) {
      issues.push({
        type: "warning",
        category: "security",
        message: "直接设置innerHTML可能导致XSS攻击",
        severity: 8,
        autoFixable: false,
      })
    }

    // 检查硬编码密钥
    if (code.match(/(password|secret|apikey|token)\s*=\s*['"][^'"]+['"]/i)) {
      issues.push({
        type: "error",
        category: "security",
        message: "发现硬编码的敏感信息,建议使用环境变量",
        severity: 9,
        autoFixable: false,
      })
    }

    return issues
  }

  // 可测试性分析
  private analyzeTestability(code: string, language: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 检查副作用
    if (code.match(/console\.(log|warn|error)/g)) {
      issues.push({
        type: "info",
        category: "testability",
        message: "代码中包含console输出,生产环境建议移除",
        severity: 2,
        autoFixable: true,
      })
    }

    // 检查全局状态
    if (code.match(/window\.\w+\s*=/)) {
      issues.push({
        type: "warning",
        category: "testability",
        message: "修改全局状态会降低可测试性",
        severity: 6,
        autoFixable: false,
      })
    }

    return issues
  }

  // 生成改进建议
  private generateSuggestions(issues: QualityIssue[]): QualitySuggestion[] {
    const suggestions: QualitySuggestion[] = []

    const securityIssues = issues.filter((i) => i.category === "security")
    if (securityIssues.length > 0) {
      suggestions.push({
        category: "security",
        title: "加强代码安全性",
        description: "修复发现的安全漏洞,使用安全的API替代危险函数",
        priority: "high",
        impact: "防止潜在的安全攻击",
      })
    }

    const performanceIssues = issues.filter((i) => i.category === "performance")
    if (performanceIssues.length > 2) {
      suggestions.push({
        category: "performance",
        title: "优化代码性能",
        description: "减少不必要的计算和DOM操作,使用缓存策略",
        priority: "high",
        impact: "提升应用响应速度",
      })
    }

    const maintainabilityIssues = issues.filter((i) => i.category === "maintainability")
    if (maintainabilityIssues.length > 3) {
      suggestions.push({
        category: "maintainability",
        title: "改善代码结构",
        description: "拆分大函数,减少嵌套,提取重复代码",
        priority: "medium",
        impact: "提高代码可维护性",
      })
    }

    return suggestions
  }

  // 计算各维度评分
  private calculateScores(issues: QualityIssue[]): QualityMetrics["scores"] {
    const categories = ["readability", "maintainability", "performance", "security", "testability"] as const

    const scores = {} as QualityMetrics["scores"]

    categories.forEach((category) => {
      const categoryIssues = issues.filter((i) => i.category === category)
      const totalSeverity = categoryIssues.reduce((sum, issue) => sum + issue.severity, 0)
      // 基础分100,每个严重度点扣2分
      const score = Math.max(0, 100 - totalSeverity * 2)
      scores[category] = score
    })

    return scores
  }

  // 计算总评分
  private calculateOverallScore(scores: QualityMetrics["scores"]): number {
    // 加权平均
    const weights = {
      readability: 0.2,
      maintainability: 0.25,
      performance: 0.2,
      security: 0.25,
      testability: 0.1,
    }

    return Math.round(
      scores.readability * weights.readability +
        scores.maintainability * weights.maintainability +
        scores.performance * weights.performance +
        scores.security * weights.security +
        scores.testability * weights.testability,
    )
  }

  // 计算最大嵌套层级
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

  // 查找重复代码
  private findDuplicateCode(code: string): number {
    // 简化实现:查找重复的代码块 (实际应用需要更复杂的算法)
    const lines = code.split("\n").filter((line) => line.trim() && !line.trim().startsWith("//"))
    const uniqueLines = new Set(lines)
    return lines.length - uniqueLines.size
  }
}

export const codeQualityAnalyzer = new CodeQualityAnalyzer()
