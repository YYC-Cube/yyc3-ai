import { unifiedAI } from "./unified-ai-service"

// ==================== 代码语言转换器 ====================

export interface CodeTranslationRequest {
  sourceCode: string
  sourceLanguage: string
  targetLanguage: string
  preserveAPI: boolean
  includeComments: boolean
}

export interface CodeTranslationResult {
  translatedCode: string
  migrationGuide: string
  technicalDifferences: TechnicalDifference[]
  warnings: string[]
  qualityScore: number
}

export interface TechnicalDifference {
  aspect: string
  sourceApproach: string
  targetApproach: string
  notes: string
}

export class CodeTranslator {
  async translate(request: CodeTranslationRequest): Promise<CodeTranslationResult> {
    const { sourceCode, sourceLanguage, targetLanguage } = request

    // 第一步：分析源代码结构
    const structure = await this.analyzeCodeStructure(sourceCode, sourceLanguage)

    // 第二步：执行语言转换
    const translatedCode = await this.performTranslation(request, structure)

    // 第三步：生成迁移指南
    const migrationGuide = await this.generateMigrationGuide(request, structure)

    // 第四步：识别技术差异
    const technicalDifferences = this.identifyTechnicalDifferences(sourceLanguage, targetLanguage, structure)

    // 第五步：生成警告
    const warnings = this.generateWarnings(request, structure)

    // 第六步：质量评估
    const qualityScore = await this.assessTranslationQuality(sourceCode, translatedCode)

    return {
      translatedCode,
      migrationGuide,
      technicalDifferences,
      warnings,
      qualityScore,
    }
  }

  private async analyzeCodeStructure(code: string, language: string): Promise<CodeStructure> {
    return {
      functions: this.extractFunctions(code),
      classes: this.extractClasses(code),
      imports: this.extractImports(code),
      exports: this.extractExports(code),
      asyncOperations: code.includes("async"),
      errorHandling: code.includes("try") || code.includes("catch"),
      language,
    }
  }

  private async performTranslation(request: CodeTranslationRequest, structure: CodeStructure): Promise<string> {
    const { sourceCode, sourceLanguage, targetLanguage, preserveAPI, includeComments } = request

    const prompt = `将以下${sourceLanguage}代码转换为${targetLanguage}:

源代码:
${sourceCode}

转换要求:
1. ${preserveAPI ? "保持相同的API接口和函数签名" : "可以调整API以符合目标语言习惯"}
2. ${includeComments ? "保留所有注释并翻译" : "可以省略注释"}
3. 遵循${targetLanguage}的最佳实践和编码规范
4. 处理语言特定差异 (类型系统、内存管理、并发模型等)
5. 确保功能完全一致
6. 使用${targetLanguage}的标准库和惯用法

代码结构信息:
- 包含函数: ${structure.functions.length}个
- 包含类: ${structure.classes.length}个
- 异步操作: ${structure.asyncOperations ? "是" : "否"}
- 错误处理: ${structure.errorHandling ? "是" : "否"}

请生成高质量的${targetLanguage}代码。`

    return await unifiedAI.complete(prompt)
  }

  private async generateMigrationGuide(request: CodeTranslationRequest, structure: CodeStructure): Promise<string> {
    return `# 代码迁移指南: ${request.sourceLanguage} → ${request.targetLanguage}

## 迁移概述
本指南帮助您将${request.sourceLanguage}代码迁移到${request.targetLanguage}。

## 主要变更

### 1. 类型系统
${this.getTypeSystemDifference(request.sourceLanguage, request.targetLanguage)}

### 2. 内存管理
${this.getMemoryManagementDifference(request.sourceLanguage, request.targetLanguage)}

### 3. 并发模型
${this.getConcurrencyDifference(request.sourceLanguage, request.targetLanguage)}

### 4. 错误处理
${this.getErrorHandlingDifference(request.sourceLanguage, request.targetLanguage)}

## 迁移步骤

### 步骤 1: 环境准备
- 安装${request.targetLanguage}运行时和开发工具
- 配置项目依赖管理
- 设置构建工具

### 步骤 2: 代码转换
- 使用转换后的代码替换原代码
- 调整导入和导出语句
- 更新类型声明

### 步骤 3: 测试验证
- 运行单元测试确保功能一致
- 进行集成测试
- 性能基准测试

### 步骤 4: 优化调整
- 应用${request.targetLanguage}特有的优化
- 改进代码风格和结构
- 更新文档

## 注意事项
${structure.asyncOperations ? `- 注意异步操作的语法差异\n` : ""}${structure.errorHandling ? `- 检查错误处理机制的兼容性\n` : ""}${request.preserveAPI ? `- 确保API接口保持一致\n` : ""}

## 常见问题

### Q: 如何处理不兼容的库？
A: 寻找${request.targetLanguage}的等效库,或实现适配器模式。

### Q: 性能会有差异吗？
A: 可能会有差异,建议进行性能测试和优化。

### Q: 如何确保功能一致性？
A: 编写完整的测试套件,覆盖所有功能点。
`
  }

  private identifyTechnicalDifferences(
    sourceLanguage: string,
    targetLanguage: string,
    structure: CodeStructure,
  ): TechnicalDifference[] {
    const differences: TechnicalDifference[] = []

    // 类型系统差异
    if (this.hasTypeDifference(sourceLanguage, targetLanguage)) {
      differences.push({
        aspect: "类型系统",
        sourceApproach: this.getTypeSystemFeature(sourceLanguage),
        targetApproach: this.getTypeSystemFeature(targetLanguage),
        notes: "需要调整类型声明和类型检查逻辑",
      })
    }

    // 异步模型差异
    if (structure.asyncOperations) {
      differences.push({
        aspect: "异步编程",
        sourceApproach: this.getAsyncFeature(sourceLanguage),
        targetApproach: this.getAsyncFeature(targetLanguage),
        notes: "异步操作的语法和执行模型可能不同",
      })
    }

    // 错误处理差异
    if (structure.errorHandling) {
      differences.push({
        aspect: "错误处理",
        sourceApproach: this.getErrorHandlingFeature(sourceLanguage),
        targetApproach: this.getErrorHandlingFeature(targetLanguage),
        notes: "错误处理机制和最佳实践有所不同",
      })
    }

    return differences
  }

  private generateWarnings(request: CodeTranslationRequest, structure: CodeStructure): string[] {
    const warnings: string[] = []

    if (structure.asyncOperations) {
      warnings.push(`异步操作在${request.targetLanguage}中的实现方式可能不同,请仔细测试`)
    }

    if (!request.preserveAPI) {
      warnings.push("API接口可能发生变化,需要更新调用方代码")
    }

    if (structure.classes.length > 5) {
      warnings.push("大量类定义可能需要手动调整以符合目标语言的惯用法")
    }

    return warnings
  }

  private async assessTranslationQuality(sourceCode: string, translatedCode: string): Promise<number> {
    // 简化的质量评估
    let score = 100

    // 代码长度相似度
    const lengthRatio = translatedCode.length / sourceCode.length
    if (lengthRatio < 0.5 || lengthRatio > 2) {
      score -= 10 // 长度差异过大
    }

    // 结构相似度 (函数数量)
    const sourceFunctions = (sourceCode.match(/function/g) || []).length
    const translatedFunctions = (translatedCode.match(/function|func|def/g) || []).length
    if (Math.abs(sourceFunctions - translatedFunctions) > 2) {
      score -= 15
    }

    return Math.max(0, score)
  }

  // 辅助方法
  private extractFunctions(code: string): string[] {
    const matches = code.match(/(?:function|func|def)\s+\w+/g) || []
    return matches
  }

  private extractClasses(code: string): string[] {
    const matches = code.match(/class\s+\w+/g) || []
    return matches
  }

  private extractImports(code: string): string[] {
    const matches = code.match(/import\s+.+/g) || []
    return matches
  }

  private extractExports(code: string): string[] {
    const matches = code.match(/export\s+.+/g) || []
    return matches
  }

  private hasTypeDifference(lang1: string, lang2: string): boolean {
    const staticTypes = ["typescript", "java", "csharp", "go", "rust"]
    const dynamicTypes = ["javascript", "python", "ruby"]

    return (
      (staticTypes.includes(lang1.toLowerCase()) && dynamicTypes.includes(lang2.toLowerCase())) ||
      (dynamicTypes.includes(lang1.toLowerCase()) && staticTypes.includes(lang2.toLowerCase()))
    )
  }

  private getTypeSystemFeature(language: string): string {
    const features: Record<string, string> = {
      typescript: "静态类型系统,支持类型推断",
      javascript: "动态类型系统",
      python: "动态类型,支持类型提示",
      java: "强静态类型系统",
      go: "静态类型,接口类型系统",
      rust: "强静态类型,所有权系统",
    }
    return features[language.toLowerCase()] || "未知类型系统"
  }

  private getAsyncFeature(language: string): string {
    const features: Record<string, string> = {
      typescript: "async/await, Promise",
      javascript: "async/await, Promise",
      python: "async/await, asyncio",
      java: "CompletableFuture, Thread",
      go: "goroutines, channels",
      rust: "async/await, Tokio",
    }
    return features[language.toLowerCase()] || "未知异步模型"
  }

  private getErrorHandlingFeature(language: string): string {
    const features: Record<string, string> = {
      typescript: "try/catch, Error对象",
      javascript: "try/catch, Error对象",
      python: "try/except, Exception类",
      java: "try/catch, checked exceptions",
      go: "error返回值, panic/recover",
      rust: "Result<T, E>, panic",
    }
    return features[language.toLowerCase()] || "未知错误处理"
  }

  private getTypeSystemDifference(lang1: string, lang2: string): string {
    return `${lang1}: ${this.getTypeSystemFeature(lang1)}\n${lang2}: ${this.getTypeSystemFeature(lang2)}`
  }

  private getMemoryManagementDifference(lang1: string, lang2: string): string {
    const memory: Record<string, string> = {
      typescript: "垃圾回收 (JavaScript引擎)",
      javascript: "垃圾回收",
      python: "垃圾回收,引用计数",
      java: "垃圾回收 (JVM)",
      go: "垃圾回收",
      rust: "所有权系统,无GC",
      c: "手动管理",
      cpp: "手动管理/RAII",
    }
    return `${lang1}: ${memory[lang1.toLowerCase()] || "标准内存管理"}\n${lang2}: ${memory[lang2.toLowerCase()] || "标准内存管理"}`
  }

  private getConcurrencyDifference(lang1: string, lang2: string): string {
    const concurrency: Record<string, string> = {
      typescript: "事件循环,Worker threads",
      javascript: "事件循环,Web Workers",
      python: "GIL,多线程/多进程",
      java: "多线程,Executor框架",
      go: "轻量级协程(goroutines)",
      rust: "async/await,无数据竞争保证",
    }
    return `${lang1}: ${concurrency[lang1.toLowerCase()] || "标准并发模型"}\n${lang2}: ${concurrency[lang2.toLowerCase()] || "标准并发模型"}`
  }

  private getErrorHandlingDifference(lang1: string, lang2: string): string {
    return `${lang1}: ${this.getErrorHandlingFeature(lang1)}\n${lang2}: ${this.getErrorHandlingFeature(lang2)}`
  }
}

interface CodeStructure {
  functions: string[]
  classes: string[]
  imports: string[]
  exports: string[]
  asyncOperations: boolean
  errorHandling: boolean
  language: string
}

export const codeTranslator = new CodeTranslator()
