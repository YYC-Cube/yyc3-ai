// 项目上下文感知代码生成器 - 理解项目规范、团队标准和用户偏好
import { adaptiveLearningSystem } from "./adaptive-learning-system"
import { contextAnalyzer } from "./context-analyzer"
import { sessionStateManager } from "./session-state-manager"

export interface ProjectContext {
  techStack: {
    language: string
    framework: string
    libraries: string[]
    version: Record<string, string>
  }
  codeStyle: {
    indentation: "spaces" | "tabs"
    spacesCount?: number
    quotes: "single" | "double"
    semicolons: boolean
    trailingComma: boolean
    lineLength: number
    namingConvention: {
      variables: "camelCase" | "snake_case" | "PascalCase"
      functions: "camelCase" | "snake_case" | "PascalCase"
      classes: "PascalCase" | "camelCase"
      constants: "UPPER_CASE" | "camelCase"
    }
  }
  architecture: {
    pattern: "MVC" | "MVVM" | "Flux" | "Clean" | "Hexagonal" | "Layered"
    folderStructure: "feature-based" | "layer-based" | "domain-driven"
    componentStyle: "functional" | "class-based" | "mixed"
  }
  teamStandards: {
    commentStyle: "JSDoc" | "TSDoc" | "minimal" | "verbose"
    testFramework: string
    errorHandling: "try-catch" | "error-boundaries" | "Either-monad"
    asyncPattern: "async-await" | "promises" | "callbacks"
    stateManagement: string
  }
  dependencies: Record<string, string>
}

export interface ConversationHistory {
  techDecisions: string[]
  confirmedRequirements: string[]
  constraints: string[]
  previousVersions: Array<{
    code: string
    timestamp: Date
    feedback: string
  }>
}

export interface UserPreferences {
  codeStyle: "concise" | "verbose" | "balanced"
  preferredPatterns: string[]
  avoidedPatterns: string[]
  toolchain: string[]
  explicitTypes: boolean
  comments: "minimal" | "moderate" | "extensive"
}

export interface TeamCodingStandards {
  namingConventions: Record<string, string>
  fileOrganization: {
    structure: string
    maxFileLines: number
    componentLocation: string
  }
  commentStandards: {
    functionDocRequired: boolean
    complexLogicCommentRequired: boolean
    todoFormat: string
  }
  testStandards: {
    coverageThreshold: number
    testNamingPattern: string
    mockingStrategy: string
  }
}

export interface GeneratedCodeResult {
  code: string
  explanation: string
  improvements: string[]
  complianceScore: number
  warnings: string[]
  suggestions: string[]
}

class ProjectContextGenerator {
  private projectContext: ProjectContext | null = null
  private userPreferences: UserPreferences | null = null
  private teamStandards: TeamCodingStandards | null = null

  constructor() {
    this.loadFromStorage()
  }

  // 设置项目上下文
  setProjectContext(context: ProjectContext): void {
    this.projectContext = context
    this.saveToStorage()
    console.log("[v0] 项目上下文已更新")
  }

  // 设置用户偏好
  setUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences
    this.saveToStorage()
    console.log("[v0] 用户偏好已更新")
  }

  // 设置团队标准
  setTeamStandards(standards: TeamCodingStandards): void {
    this.teamStandards = standards
    this.saveToStorage()
    console.log("[v0] 团队标准已更新")
  }

  // 基于项目上下文生成代码
  async generateWithProjectContext(requirement: string): Promise<GeneratedCodeResult> {
    console.log("[v0] 开始基于项目上下文生成代码...")

    // 获取对话历史
    const conversationHistory = this.getConversationHistory()

    // 分析用户意图
    const contextAnalysis = contextAnalyzer.analyzeContext()

    // 构建生成提示
    const prompt = this.buildContextAwarePrompt(requirement, conversationHistory, contextAnalysis)

    // 生成代码
    const generatedCode = await this.generateCode(prompt)

    // 应用项目规范
    const formattedCode = this.applyProjectStandards(generatedCode)

    // 评估合规性
    const complianceScore = this.evaluateCompliance(formattedCode)

    // 生成改��建议
    const improvements = this.generateImprovements(formattedCode, complianceScore)

    // 检测警告
    const warnings = this.detectWarnings(formattedCode)

    // 生成建议
    const suggestions = this.generateSuggestions(formattedCode, contextAnalysis)

    // 生成解释
    const explanation = this.generateExplanation(formattedCode, requirement)

    const result: GeneratedCodeResult = {
      code: formattedCode,
      explanation,
      improvements,
      complianceScore,
      warnings,
      suggestions,
    }

    // 记录到历史
    this.recordToHistory(requirement, result)

    return result
  }

  // 基于对话历史优化代码
  async optimizeWithHistory(currentCode: string, optimizationGoal: string): Promise<GeneratedCodeResult> {
    console.log("[v0] 基于对话历史优化代码...")

    const conversationHistory = this.getConversationHistory()

    // 分析之前的版本
    const previousVersions = conversationHistory.previousVersions

    // 构建优化提示
    const prompt = this.buildOptimizationPrompt(currentCode, optimizationGoal, previousVersions)

    // 生成优化后的代码
    const optimizedCode = await this.generateCode(prompt)

    // 应用项目规范
    const formattedCode = this.applyProjectStandards(optimizedCode)

    // 对比分析
    const comparison = this.compareVersions(currentCode, formattedCode)

    return {
      code: formattedCode,
      explanation: `相对于之前版本的改进:\n${comparison.improvements.join("\n")}`,
      improvements: comparison.improvements,
      complianceScore: this.evaluateCompliance(formattedCode),
      warnings: comparison.warnings,
      suggestions: comparison.suggestions,
    }
  }

  // 基于用户偏好生成代码
  async generateWithUserPreferences(requirement: string): Promise<GeneratedCodeResult> {
    console.log("[v0] 基于用户偏好生成代码...")

    if (!this.userPreferences) {
      // 尝试从学习系统获取偏好
      const userProfile = await adaptiveLearningSystem.getPersonalizedRecommendations()
      // 推断偏好
      this.userPreferences = this.inferUserPreferences()
    }

    const prompt = this.buildUserPreferencePrompt(requirement, this.userPreferences!)

    const generatedCode = await this.generateCode(prompt)

    const personalizedCode = this.applyUserPreferences(generatedCode)

    return {
      code: personalizedCode,
      explanation: "代码已根据您的个人编程偏好生成",
      improvements: this.getPersonalizationDetails(),
      complianceScore: this.evaluateCompliance(personalizedCode),
      warnings: [],
      suggestions: ["代码风格已按照您的偏好调整"],
    }
  }

  // 基于团队规范生成代码
  async generateWithTeamStandards(requirement: string): Promise<GeneratedCodeResult> {
    console.log("[v0] 基于团队规范生成代码...")

    if (!this.teamStandards) {
      this.teamStandards = this.getDefaultTeamStandards()
    }

    const prompt = this.buildTeamStandardPrompt(requirement, this.teamStandards)

    const generatedCode = await this.generateCode(prompt)

    const standardCompliantCode = this.enforceTeamStandards(generatedCode)

    const violations = this.checkStandardViolations(standardCompliantCode)

    return {
      code: standardCompliantCode,
      explanation: "代码已完全符合团队编码规范",
      improvements: ["已应用团队命名约定", "已添加规范注释", "已符合测试标准"],
      complianceScore: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10),
      warnings: violations,
      suggestions: this.generateComplianceSuggestions(violations),
    }
  }

  // 私有方法：构建上下文感知提示
  private buildContextAwarePrompt(requirement: string, history: ConversationHistory, analysis: any): string {
    let prompt = `# 代码生成任务\n\n`
    prompt += `## 需求描述\n${requirement}\n\n`

    if (this.projectContext) {
      prompt += `## 项目技术栈\n`
      prompt += `- 语言: ${this.projectContext.techStack.language}\n`
      prompt += `- 框架: ${this.projectContext.techStack.framework}\n`
      prompt += `- 主要库: ${this.projectContext.techStack.libraries.join(", ")}\n\n`

      prompt += `## 代码风格要求\n`
      prompt += `- 缩进: ${this.projectContext.codeStyle.indentation === "spaces" ? `${this.projectContext.codeStyle.spacesCount} 空格` : "Tab"}\n`
      prompt += `- 引号: ${this.projectContext.codeStyle.quotes === "single" ? "单引号" : "双引号"}\n`
      prompt += `- 分号: ${this.projectContext.codeStyle.semicolons ? "必须" : "不需要"}\n`
      prompt += `- 命名规范: 变量${this.projectContext.codeStyle.namingConvention.variables}, 函数${this.projectContext.codeStyle.namingConvention.functions}\n\n`

      prompt += `## 架构模式\n`
      prompt += `- 设计模式: ${this.projectContext.architecture.pattern}\n`
      prompt += `- 组件风格: ${this.projectContext.architecture.componentStyle}\n\n`
    }

    if (history.techDecisions.length > 0) {
      prompt += `## 之前的技术决策\n`
      history.techDecisions.forEach((decision) => {
        prompt += `- ${decision}\n`
      })
      prompt += `\n`
    }

    if (history.constraints.length > 0) {
      prompt += `## 技术约束\n`
      history.constraints.forEach((constraint) => {
        prompt += `- ${constraint}\n`
      })
      prompt += `\n`
    }

    prompt += `## 用户意图\n${analysis.userIntent}\n\n`
    prompt += `## 难度级别\n${analysis.difficulty}\n\n`

    prompt += `请生成符合以上所有要求的完整代码实现。\n`

    return prompt
  }

  // 私有方法：应用项目规范
  private applyProjectStandards(code: string): string {
    if (!this.projectContext) return code

    let formattedCode = code

    // 应用缩进
    if (this.projectContext.codeStyle.indentation === "tabs") {
      formattedCode = formattedCode.replace(/ {2}/g, "\t")
    } else if (this.projectContext.codeStyle.spacesCount) {
      const spaces = " ".repeat(this.projectContext.codeStyle.spacesCount)
      formattedCode = formattedCode.replace(/\t/g, spaces)
    }

    // 应用引号风格
    if (this.projectContext.codeStyle.quotes === "single") {
      formattedCode = formattedCode.replace(/"([^"]*)"/g, "'$1'")
    } else {
      formattedCode = formattedCode.replace(/'([^']*)'/g, '"$1"')
    }

    // 应用分号
    if (this.projectContext.codeStyle.semicolons) {
      formattedCode = this.addMissingSemicolons(formattedCode)
    } else {
      formattedCode = this.removeSemicolons(formattedCode)
    }

    // 应用命名规范
    formattedCode = this.applyNamingConventions(formattedCode)

    return formattedCode
  }

  // 私有方法：评估合规性
  private evaluateCompliance(code: string): number {
    let score = 100
    const issues: string[] = []

    if (this.projectContext) {
      // 检查缩进
      if (this.projectContext.codeStyle.indentation === "spaces") {
        if (code.includes("\t")) {
          score -= 10
          issues.push("使用了Tab而非空格")
        }
      }

      // 检查引号
      if (this.projectContext.codeStyle.quotes === "single") {
        const doubleQuoteCount = (code.match(/"/g) || []).length
        if (doubleQuoteCount > 0) {
          score -= 5
          issues.push("使用了双引号")
        }
      }

      // 检查分号
      if (this.projectContext.codeStyle.semicolons) {
        const lines = code.split("\n")
        const missingSemicolons = lines.filter(
          (line) =>
            line.trim() && !line.includes("//") && !line.endsWith(";") && !line.endsWith("{") && !line.endsWith("}"),
        ).length
        if (missingSemicolons > 0) {
          score -= missingSemicolons * 2
          issues.push(`缺少${missingSemicolons}个分号`)
        }
      }

      // 检查行长度
      const longLines = code
        .split("\n")
        .filter((line) => line.length > this.projectContext!.codeStyle.lineLength).length
      if (longLines > 0) {
        score -= longLines
        issues.push(`${longLines}行超过最大长度`)
      }
    }

    console.log(`[v0] 代码合规性评分: ${Math.max(0, score)}/100`, issues.length > 0 ? issues : "")

    return Math.max(0, score)
  }

  // 私有方法：生成代码
  private async generateCode(prompt: string): Promise<string> {
    // 这里应该调用实际的AI生成服务
    // 作为示例，返回一个模拟的代码生成
    console.log("[v0] 正在生成代码...")

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 返回示例代码
    return `
// 生成的代码示例
function exampleFunction(param1, param2) {
  // 实现逻辑
  const result = param1 + param2
  return result
}

export default exampleFunction
`.trim()
  }

  // 辅助方法
  private getConversationHistory(): ConversationHistory {
    const session = sessionStateManager.getCurrentSession()
    if (!session) {
      return {
        techDecisions: [],
        confirmedRequirements: [],
        constraints: [],
        previousVersions: [],
      }
    }

    const history = session.history.filter((h) => h.type === "interaction").map((h) => h.data)

    return {
      techDecisions: history.filter((h) => h.type === "tech-decision").map((h) => h.content) || [],
      confirmedRequirements: history.filter((h) => h.type === "requirement").map((h) => h.content) || [],
      constraints: history.filter((h) => h.type === "constraint").map((h) => h.content) || [],
      previousVersions: history.filter((h) => h.type === "code-version").map((h) => h.data) || [],
    }
  }

  private buildOptimizationPrompt(currentCode: string, goal: string, previousVersions: any[]): string {
    let prompt = `# 代码优化任务\n\n`
    prompt += `## 当前代码\n\`\`\`\n${currentCode}\n\`\`\`\n\n`
    prompt += `## 优化目标\n${goal}\n\n`

    if (previousVersions.length > 0) {
      prompt += `## 历史版本参考\n`
      previousVersions.slice(-2).forEach((version, index) => {
        prompt += `### 版本 ${index + 1}\n\`\`\`\n${version.code}\n\`\`\`\n`
        if (version.feedback) {
          prompt += `反馈: ${version.feedback}\n\n`
        }
      })
    }

    prompt += `请生成优化后的代码。\n`

    return prompt
  }

  private compareVersions(
    oldCode: string,
    newCode: string,
  ): {
    improvements: string[]
    warnings: string[]
    suggestions: string[]
  } {
    const improvements: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // 代码行数对比
    const oldLines = oldCode.split("\n").length
    const newLines = newCode.split("\n").length
    if (newLines < oldLines) {
      improvements.push(`代码行数减少 ${oldLines - newLines} 行，提升了简洁性`)
    }

    // 函数数量对比
    const oldFunctions = (oldCode.match(/function\s+\w+/g) || []).length
    const newFunctions = (newCode.match(/function\s+\w+/g) || []).length
    if (newFunctions > oldFunctions) {
      improvements.push(`函数模块化改进，新增 ${newFunctions - oldFunctions} 个函数`)
    }

    // 注释对比
    const oldComments = (oldCode.match(/\/\/.+|\/\*[\s\S]*?\*\//g) || []).length
    const newComments = (newCode.match(/\/\/.+|\/\*[\s\S]*?\*\//g) || []).length
    if (newComments > oldComments) {
      improvements.push(`注释完善度提升，新增 ${newComments - oldComments} 处注释`)
    }

    // 性能提示
    if (newCode.includes("for") && !oldCode.includes("for")) {
      warnings.push("引入了循环，注意性能影响")
    }

    // 建议
    if (!newCode.includes("try") && !newCode.includes("catch")) {
      suggestions.push("建议添加错误处理机制")
    }

    return { improvements, warnings, suggestions }
  }

  private buildUserPreferencePrompt(requirement: string, preferences: UserPreferences): string {
    let prompt = `# 代码生成任务（用户偏好定制）\n\n`
    prompt += `## 需求\n${requirement}\n\n`
    prompt += `## 用户偏好\n`
    prompt += `- 代码风格: ${preferences.codeStyle}\n`
    prompt += `- 偏好模式: ${preferences.preferredPatterns.join(", ")}\n`
    prompt += `- 避免模式: ${preferences.avoidedPatterns.join(", ")}\n`
    prompt += `- 类型注解: ${preferences.explicitTypes ? "必须" : "可选"}\n`
    prompt += `- 注释详细度: ${preferences.comments}\n\n`
    prompt += `请严格按照用户偏好生成代码。\n`

    return prompt
  }

  private applyUserPreferences(code: string): string {
    if (!this.userPreferences) return code

    let personalizedCode = code

    // 应用代码风格
    if (this.userPreferences.codeStyle === "concise") {
      personalizedCode = this.makeConcise(personalizedCode)
    } else if (this.userPreferences.codeStyle === "verbose") {
      personalizedCode = this.makeVerbose(personalizedCode)
    }

    // 应用类型注解偏好
    if (this.userPreferences.explicitTypes) {
      personalizedCode = this.addTypeAnnotations(personalizedCode)
    }

    return personalizedCode
  }

  private buildTeamStandardPrompt(requirement: string, standards: TeamCodingStandards): string {
    let prompt = `# 代码生成任务（团队规范）\n\n`
    prompt += `## 需求\n${requirement}\n\n`
    prompt += `## 团队规范\n`
    prompt += `### 命名约定\n`
    Object.entries(standards.namingConventions).forEach(([key, value]) => {
      prompt += `- ${key}: ${value}\n`
    })
    prompt += `\n### 文件组织\n`
    prompt += `- 结构: ${standards.fileOrganization.structure}\n`
    prompt += `- 最大行数: ${standards.fileOrganization.maxFileLines}\n`
    prompt += `\n### 注释标准\n`
    prompt += `- 函数文档: ${standards.commentStandards.functionDocRequired ? "必需" : "可选"}\n`
    prompt += `- TODO格式: ${standards.commentStandards.todoFormat}\n`
    prompt += `\n### 测试标准\n`
    prompt += `- 覆盖率要求: ${standards.testStandards.coverageThreshold}%\n`
    prompt += `- 命名模式: ${standards.testStandards.testNamingPattern}\n\n`
    prompt += `请严格遵守团队规范生成代码。\n`

    return prompt
  }

  private enforceTeamStandards(code: string): string {
    if (!this.teamStandards) return code

    let standardCode = code

    // 添加函数文档
    if (this.teamStandards.commentStandards.functionDocRequired) {
      standardCode = this.addFunctionDocs(standardCode)
    }

    // 检查文件长度
    const lines = standardCode.split("\n")
    if (lines.length > this.teamStandards.fileOrganization.maxFileLines) {
      console.warn(`[v0] 警告: 代码超过团队规定的最大行数 ${this.teamStandards.fileOrganization.maxFileLines}`)
    }

    return standardCode
  }

  private checkStandardViolations(code: string): string[] {
    const violations: string[] = []

    if (!this.teamStandards) return violations

    // 检查函数文档
    if (this.teamStandards.commentStandards.functionDocRequired) {
      const functions = code.match(/function\s+\w+/g) || []
      const docs = code.match(/\/\*\*[\s\S]*?\*\//g) || []
      if (functions.length > docs.length) {
        violations.push(`缺少 ${functions.length - docs.length} 个函数文档注释`)
      }
    }

    // 检查TODO格式
    const todos = code.match(/TODO.*/gi) || []
    todos.forEach((todo) => {
      if (!todo.includes(this.teamStandards!.commentStandards.todoFormat)) {
        violations.push(`TODO格式不符合规范: ${todo}`)
      }
    })

    return violations
  }

  private generateImprovements(code: string, score: number): string[] {
    const improvements: string[] = []

    if (score < 100) {
      improvements.push("代码已自动格式化以符合项目规范")
    }

    if (!code.includes("try")) {
      improvements.push("建议添加错误处理")
    }

    if (!code.includes("//") && !code.includes("/*")) {
      improvements.push("建议添加适当注释")
    }

    return improvements
  }

  private detectWarnings(code: string): string[] {
    const warnings: string[] = []

    if (code.includes("any")) {
      warnings.push("使用了any类型，可能影响类型安全")
    }

    if (code.includes("console.log")) {
      warnings.push("包含console.log，生产环境需移除")
    }

    if (code.length > 500 && !code.includes("function")) {
      warnings.push("代码较长但未拆分函数，建议模块化")
    }

    return warnings
  }

  private generateSuggestions(code: string, analysis: any): string[] {
    const suggestions: string[] = []

    if (analysis.difficulty === "beginner") {
      suggestions.push("代码结构清晰，适合学习")
    }

    if (code.includes("async")) {
      suggestions.push("已使用异步编程，注意错误处理")
    }

    suggestions.push("建议添加单元测试")

    return suggestions
  }

  private generateExplanation(code: string, requirement: string): string {
    return `根据需求"${requirement}"生成的代码实现。代码遵循项目规范和团队标准，包含必要的错误处理和注释。`
  }

  private recordToHistory(requirement: string, result: GeneratedCodeResult): void {
    sessionStateManager.addHistory("interaction", {
      type: "code-generation",
      requirement,
      code: result.code,
      score: result.complianceScore,
      timestamp: new Date(),
    })
  }

  private inferUserPreferences(): UserPreferences {
    // 从学习系统推断用户偏好
    return {
      codeStyle: "balanced",
      preferredPatterns: ["async-await", "functional"],
      avoidedPatterns: ["callback-hell"],
      toolchain: ["typescript", "react"],
      explicitTypes: true,
      comments: "moderate",
    }
  }

  private getDefaultTeamStandards(): TeamCodingStandards {
    return {
      namingConventions: {
        变量: "camelCase",
        函数: "camelCase",
        类: "PascalCase",
        常量: "UPPER_CASE",
      },
      fileOrganization: {
        structure: "feature-based",
        maxFileLines: 300,
        componentLocation: "components/",
      },
      commentStandards: {
        functionDocRequired: true,
        complexLogicCommentRequired: true,
        todoFormat: "TODO(author):",
      },
      testStandards: {
        coverageThreshold: 80,
        testNamingPattern: "*.test.ts",
        mockingStrategy: "jest",
      },
    }
  }

  private getPersonalizationDetails(): string[] {
    return ["代码风格已按您的偏好调整", "使用了您常用的编程模式", "避免了您不喜欢的写法"]
  }

  private generateComplianceSuggestions(violations: string[]): string[] {
    return violations.map((v) => `修复建议: ${v}`)
  }

  // 工具方法
  private addMissingSemicolons(code: string): string {
    return code
      .split("\n")
      .map((line) => {
        if (line.trim() && !line.endsWith(";") && !line.endsWith("{") && !line.endsWith("}") && !line.includes("//")) {
          return line + ";"
        }
        return line
      })
      .join("\n")
  }

  private removeSemicolons(code: string): string {
    return code.replace(/;$/gm, "")
  }

  private applyNamingConventions(code: string): string {
    // 简化实现，实际需要更复杂的AST解析
    return code
  }

  private makeConcise(code: string): string {
    // 移除多余空行
    return code.replace(/\n\n+/g, "\n")
  }

  private makeVerbose(code: string): string {
    // 添加更多注释和空行
    return code
  }

  private addTypeAnnotations(code: string): string {
    // 为函数参数添加类型注解
    return code.replace(/function\s+(\w+)\s*$$([^)]*)$$/g, (match, name, params) => {
      const typedParams = params
        .split(",")
        .map((p: string) => {
          const trimmed = p.trim()
          return trimmed.includes(":") ? trimmed : `${trimmed}: any`
        })
        .join(", ")
      return `function ${name}(${typedParams}): any`
    })
  }

  private addFunctionDocs(code: string): string {
    // 为函数添加JSDoc注释
    return code.replace(/function\s+(\w+)/g, (match) => {
      return `/**\n * Function description\n */\n${match}`
    })
  }

  private saveToStorage(): void {
    try {
      const data = {
        projectContext: this.projectContext,
        userPreferences: this.userPreferences,
        teamStandards: this.teamStandards,
      }
      localStorage.setItem("project-context-generator", JSON.stringify(data))
    } catch (error) {
      console.error("[v0] 无法保存配置:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem("project-context-generator")
      if (data) {
        const parsed = JSON.parse(data)
        this.projectContext = parsed.projectContext
        this.userPreferences = parsed.userPreferences
        this.teamStandards = parsed.teamStandards
      }
    } catch (error) {
      console.error("[v0] 无法加载配置:", error)
    }
  }
}

export const projectContextGenerator = new ProjectContextGenerator()
