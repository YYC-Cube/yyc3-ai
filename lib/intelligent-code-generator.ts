// 智能代码生成系统 - 基于上下文的代码补全和生成
import { unifiedAI } from "./unified-ai-service"
import { deepCodeUnderstanding } from "./deep-code-understanding"
import { codeQualityAnalyzer } from "./code-quality-analyzer"

export interface CodeGenerationContext {
  currentFile: string
  language: string
  cursorPosition: { line: number; column: number }
  surroundingCode: string
  projectContext?: ProjectContext
  userIntent?: string
}

export interface ProjectContext {
  files: Array<{ path: string; content: string }>
  dependencies: Record<string, string>
  framework?: string
  style?: string
}

export interface CodeCompletion {
  suggestions: CompletionSuggestion[]
  explanations: string[]
  confidence: number
}

export interface CompletionSuggestion {
  code: string
  description: string
  priority: number
  category: "snippet" | "function" | "class" | "import"
}

export interface GeneratedCode {
  code: string
  explanation: string
  tests?: string
  documentation?: string
  refactoringsSuggestions?: string[]
  qualityScore: number
}

export class IntelligentCodeGenerator {
  // 智能代码补全
  async complete(context: CodeGenerationContext): Promise<CodeCompletion> {
    // 分析当前代码上下文
    const understanding = await deepCodeUnderstanding.analyze(context.surroundingCode, context.language)

    // 构建AI提示
    const prompt = this.buildCompletionPrompt(context, understanding)

    // 调用AI获取补全建议
    const response = await unifiedAI.complete(prompt)

    // 解析和排序建议
    const suggestions = this.parseCompletionResponse(response)

    return {
      suggestions,
      explanations: [
        `基于${understanding.patterns.length}个代码模式`,
        `复杂度: ${understanding.complexity.cyclomatic}`,
      ],
      confidence: this.calculateConfidence(understanding),
    }
  }

  // 从需求生成完整代码
  async generateFromRequirement(requirement: string, context: ProjectContext): Promise<GeneratedCode> {
    // 第一步：生成主代码
    const codePrompt = this.buildCodeGenerationPrompt(requirement, context)
    const code = await unifiedAI.complete(codePrompt)

    // 第二步：生成测试
    const testPrompt = this.buildTestGenerationPrompt(code, context.language || "javascript")
    const tests = await unifiedAI.complete(testPrompt)

    // 第三步：生成文档
    const docPrompt = this.buildDocumentationPrompt(code, requirement)
    const documentation = await unifiedAI.complete(docPrompt)

    // 第四步：质量分析
    const quality = codeQualityAnalyzer.analyze(code, context.language || "javascript")

    // 第五步：重构建议
    const refactorings = this.generateRefactoringSuggestions(code, quality)

    return {
      code,
      explanation: `根据需求"${requirement}"生成的代码`,
      tests,
      documentation,
      refactoringsSuggestions: refactorings,
      qualityScore: quality.overallScore,
    }
  }

  // 代码重构建议
  async suggestRefactoring(code: string, language: string): Promise<GeneratedCode> {
    // 分析现有代码
    const understanding = await deepCodeUnderstanding.analyze(code, language)
    const quality = codeQualityAnalyzer.analyze(code, language)

    // 识别重构机会
    const opportunities = this.identifyRefactoringOpportunities(understanding, quality)

    // 为每个机会生成重构代码
    const refactoringPrompt = this.buildRefactoringPrompt(code, opportunities)
    const refactoredCode = await unifiedAI.complete(refactoringPrompt)

    // 生成重构说明
    const explanation = this.explainRefactoring(code, refactoredCode, opportunities)

    return {
      code: refactoredCode,
      explanation,
      qualityScore: quality.overallScore,
    }
  }

  // 代码优化
  async optimize(
    code: string,
    language: string,
    optimizationGoal: "performance" | "readability" | "maintainability",
  ): Promise<GeneratedCode> {
    const understanding = await deepCodeUnderstanding.analyze(code, language)

    const prompt = `请优化以下${language}代码,目标是提升${this.translateGoal(optimizationGoal)}:

\`\`\`${language}
${code}
\`\`\`

当前代码分析:
- 圈复杂度: ${understanding.complexity.cyclomatic}
- 认知复杂度: ${understanding.complexity.cognitive}
- 函数数量: ${understanding.structure.functions.length}
- 类数量: ${understanding.structure.classes.length}

请提供优化后的代码,并说明优化理由。代码必须保持功能完全相同。`

    const optimizedCode = await unifiedAI.complete(prompt)

    // 验证优化效果
    const newUnderstanding = await deepCodeUnderstanding.analyze(optimizedCode, language)
    const improvement = this.calculateImprovement(understanding, newUnderstanding, optimizationGoal)

    return {
      code: optimizedCode,
      explanation: `优化提升: ${improvement}%`,
      qualityScore: codeQualityAnalyzer.analyze(optimizedCode, language).overallScore,
    }
  }

  // 代码解释
  async explain(code: string, language: string, detailLevel: "brief" | "detailed" | "expert"): Promise<string> {
    const understanding = await deepCodeUnderstanding.analyze(code, language)

    const prompt = `请以${this.translateDetailLevel(detailLevel)}的方式解释以下${language}代码:

\`\`\`${language}
${code}
\`\`\`

代码结构分析:
- 函数: ${understanding.structure.functions.map((f) => f.name).join(", ")}
- 类: ${understanding.structure.classes.map((c) => c.name).join(", ")}
- 导入: ${understanding.structure.imports.map((i) => i.source).join(", ")}
- 复杂度: ${understanding.complexity.cyclomatic}
- 检测到的模式: ${understanding.patterns.map((p) => p.name).join(", ")}

请提供清晰的解释,包括代码的目的、工作原理和关键技术点。`

    return await unifiedAI.complete(prompt)
  }

  // 辅助方法
  private buildCompletionPrompt(context: CodeGenerationContext, understanding: any): string {
    return `作为智能代码补全助手,请根据以下上下文提供代码补全建议:

文件: ${context.currentFile}
语言: ${context.language}
光标位置: 第${context.cursorPosition.line}行,第${context.cursorPosition.column}列

周围代码:
\`\`\`${context.language}
${context.surroundingCode}
\`\`\`

代码分析:
- 检测到的模式: ${understanding.patterns.map((p: any) => p.name).join(", ")}
- 复杂度: ${understanding.complexity.cyclomatic}
- 当前作用域的变量: ${understanding.structure.variables.map((v: any) => v.name).join(", ")}

请提供3-5个最相关的代码补全建议,每个建议包含:
1. 代码片段
2. 简短描述
3. 使用场景

格式:
### 建议1: [描述]
\`\`\`${context.language}
[代码]
\`\`\`

### 建议2: [描述]
...`
  }

  private buildCodeGenerationPrompt(requirement: string, context: ProjectContext): string {
    return `请根据以下需求生成${context.language || "JavaScript"}代码:

需求描述:
${requirement}

项目上下文:
- 框架: ${context.framework || "无"}
- 代码风格: ${context.style || "标准"}
- 依赖: ${Object.keys(context.dependencies || {}).join(", ")}

代码要求:
1. 遵循最佳实践和设计模式
2. 包含完整的错误处理
3. 添加必要的注释
4. 确保代码可测试
5. 性能优化

请生成完整、可运行的代码,不使用占位符。`
  }

  private buildTestGenerationPrompt(code: string, language: string): string {
    return `请为以下${language}代码生成完整的单元测试:

\`\`\`${language}
${code}
\`\`\`

测试要求:
1. 使用${language === "javascript" ? "Jest" : "合适的测试框架"}
2. 覆盖所有主要功能
3. 包含边界情况测试
4. 包含错误处理测试
5. 测试代码清晰易懂

请生成完整的测试代码。`
  }

  private buildDocumentationPrompt(code: string, requirement: string): string {
    return `请为以下代码生成详细的API文档:

需求: ${requirement}

代码:
\`\`\`
${code}
\`\`\`

文档要求:
1. 使用JSDoc或类似格式
2. 说明每个函数的用途、参数、返回值
3. 提供使用示例
4. 说明可能的异常情况
5. 包含类型定义

请生成完整的文档。`
  }

  private buildRefactoringPrompt(code: string, opportunities: string[]): string {
    return `请重构以下代码,重点改进:
${opportunities.map((o, i) => `${i + 1}. ${o}`).join("\n")}

原代码:
\`\`\`
${code}
\`\`\`

重构要求:
1. 保持功能完全相同
2. 提升代码质量
3. 改善可读性和可维护性
4. 减少复杂度
5. 遵循SOLID原则

请提供重构后的代码和改进说明。`
  }

  private parseCompletionResponse(response: string): CompletionSuggestion[] {
    const suggestions: CompletionSuggestion[] = []
    const sections = response.split("###").filter((s) => s.trim())

    sections.forEach((section, index) => {
      const lines = section.trim().split("\n")
      const description = lines[0].replace(/建议\d+:\s*/, "").trim()
      const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/)
      const code = codeMatch?.[1]?.trim() || ""

      if (code) {
        suggestions.push({
          code,
          description,
          priority: 5 - index,
          category: this.categorizeCompletion(code),
        })
      }
    })

    return suggestions
  }

  private categorizeCompletion(code: string): "snippet" | "function" | "class" | "import" {
    if (code.includes("import") || code.includes("require")) return "import"
    if (code.includes("class ")) return "class"
    if (code.includes("function") || code.includes("=>")) return "function"
    return "snippet"
  }

  private calculateConfidence(understanding: any): number {
    let confidence = 0.7

    // 基于代码质量提升置信度
    if (understanding.complexity.cyclomatic < 10) confidence += 0.1
    if (understanding.patterns.length > 0) confidence += 0.1
    if (understanding.bestPractices.filter((bp: any) => bp.passed).length > 5) confidence += 0.1

    return Math.min(1, confidence)
  }

  private generateRefactoringSuggestions(code: string, quality: any): string[] {
    const suggestions: string[] = []

    quality.issues.forEach((issue: any) => {
      if (issue.autoFixable) {
        suggestions.push(`修复: ${issue.message}`)
      }
    })

    quality.suggestions.forEach((suggestion: any) => {
      suggestions.push(suggestion.description)
    })

    return suggestions
  }

  private identifyRefactoringOpportunities(understanding: any, quality: any): string[] {
    const opportunities: string[] = []

    // 基于复杂度
    if (understanding.complexity.cyclomatic > 15) {
      opportunities.push("降低圈复杂度")
    }

    // 基于函数长度
    understanding.structure.functions.forEach((func: any) => {
      if (func.loc.end - func.loc.start > 50) {
        opportunities.push(`拆分长函数: ${func.name}`)
      }
    })

    // 基于质量问题
    quality.issues.forEach((issue: any) => {
      if (issue.severity === "error" || issue.severity === "warning") {
        opportunities.push(issue.message)
      }
    })

    return opportunities
  }

  private explainRefactoring(original: string, refactored: string, opportunities: string[]): string {
    return `代码重构完成，主要改进:\n${opportunities.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n原代码行数: ${original.split("\n").length}\n重构后行数: ${refactored.split("\n").length}`
  }

  private translateGoal(goal: string): string {
    const map: Record<string, string> = {
      performance: "性能",
      readability: "可读性",
      maintainability: "可维护性",
    }
    return map[goal] || goal
  }

  private translateDetailLevel(level: string): string {
    const map: Record<string, string> = {
      brief: "简洁",
      detailed: "详细",
      expert: "专家级",
    }
    return map[level] || level
  }

  private calculateImprovement(old: any, new_: any, goal: string): number {
    if (goal === "performance") {
      const oldComplexity = old.complexity.cyclomatic
      const newComplexity = new_.complexity.cyclomatic
      return Math.round(((oldComplexity - newComplexity) / oldComplexity) * 100)
    }

    if (goal === "readability") {
      const oldMI = old.complexity.maintainabilityIndex
      const newMI = new_.complexity.maintainabilityIndex
      return Math.round(((newMI - oldMI) / oldMI) * 100)
    }

    return 0
  }
}

export const intelligentCodeGenerator = new IntelligentCodeGenerator()
