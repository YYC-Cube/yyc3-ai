"use client"

// AI 智能代码补全引擎 - 支持多行补全、函数级补全、上下文感知
import { type OpenAIConfig, getOpenAIConfig } from "./openai-config"

export interface CompletionRequest {
  code: string
  cursorPosition: number
  language: string
  context?: {
    fileName?: string
    imports?: string[]
    recentEdits?: string[]
    projectType?: string
  }
}

export interface CompletionResult {
  completions: Completion[]
  confidence: number
}

export interface Completion {
  text: string
  type: "line" | "multiline" | "function" | "snippet"
  description: string
  priority: number
  insertText: string
  cursorOffset?: number
}

export interface CodeStyle {
  indentation: "spaces" | "tabs"
  indentSize: number
  quotes: "single" | "double"
  semicolons: boolean
  trailingComma: boolean
  bracketSpacing: boolean
}

class AICodeCompletion {
  private config: OpenAIConfig | null = null
  private completionCache = new Map<string, CompletionResult>()
  private stylePreferences: CodeStyle = {
    indentation: "spaces",
    indentSize: 2,
    quotes: "double",
    semicolons: true,
    trailingComma: true,
    bracketSpacing: true,
  }

  constructor() {
    this.config = getOpenAIConfig()
  }

  // 设置代码风格偏好
  setStylePreferences(style: Partial<CodeStyle>) {
    this.stylePreferences = { ...this.stylePreferences, ...style }
  }

  // 获取智能补全建议
  async getCompletions(request: CompletionRequest): Promise<CompletionResult> {
    const cacheKey = this.getCacheKey(request)

    // 检查缓存
    if (this.completionCache.has(cacheKey)) {
      return this.completionCache.get(cacheKey)!
    }

    const completions: Completion[] = []

    // 1. 基于模式的快速补全
    const patternCompletions = this.getPatternBasedCompletions(request)
    completions.push(...patternCompletions)

    // 2. AI 驱动的智能补全
    if (this.config?.apiKey) {
      const aiCompletions = await this.getAICompletions(request)
      completions.push(...aiCompletions)
    }

    // 3. 代码片段补全
    const snippetCompletions = this.getSnippetCompletions(request)
    completions.push(...snippetCompletions)

    // 按优先级排序
    completions.sort((a, b) => b.priority - a.priority)

    const result: CompletionResult = {
      completions: completions.slice(0, 10), // 最多返回10个建议
      confidence: this.calculateConfidence(completions),
    }

    // 缓存结果
    this.completionCache.set(cacheKey, result)

    return result
  }

  // 基于模式的快速补全
  private getPatternBasedCompletions(request: CompletionRequest): Completion[] {
    const { code, cursorPosition, language } = request
    const beforeCursor = code.substring(0, cursorPosition)
    const currentLine = beforeCursor.split("\n").pop() || ""
    const completions: Completion[] = []

    if (language === "javascript" || language === "typescript") {
      // 检测函数声明模式
      if (currentLine.match(/^\s*function\s+\w+\s*\(/)) {
        completions.push({
          text: "完整函数定义",
          type: "function",
          description: "生成完整的函数定义",
          priority: 90,
          insertText: ") {\n  // 函数实现\n  return \n}",
          cursorOffset: -3,
        })
      }

      // 检测箭头函数模式
      if (currentLine.match(/^\s*const\s+\w+\s*=\s*\(/)) {
        completions.push({
          text: "箭头函数",
          type: "function",
          description: "完成箭头函数定义",
          priority: 85,
          insertText: ") => {\n  \n}",
          cursorOffset: -2,
        })
      }

      // 检测 if 语句
      if (currentLine.match(/^\s*if\s*\(/)) {
        completions.push({
          text: "if 语句块",
          type: "multiline",
          description: "完成 if 语句",
          priority: 80,
          insertText: ") {\n  \n}",
          cursorOffset: -2,
        })
      }

      // 检测 for 循环
      if (currentLine.match(/^\s*for\s*\(/)) {
        completions.push({
          text: "for 循环",
          type: "multiline",
          description: "完成 for 循环",
          priority: 80,
          insertText: "let i = 0; i < length; i++) {\n  \n}",
          cursorOffset: -2,
        })
      }

      // 检测 try-catch
      if (currentLine.match(/^\s*try\s*{/)) {
        completions.push({
          text: "try-catch 块",
          type: "multiline",
          description: "添加 catch 块",
          priority: 85,
          insertText: "\n} catch (error) {\n  console.error('Error:', error)\n}",
        })
      }

      // 检测 console.
      if (currentLine.endsWith("console.")) {
        completions.push(
          {
            text: "console.log()",
            type: "line",
            description: "输出日志",
            priority: 95,
            insertText: "log()",
            cursorOffset: -1,
          },
          {
            text: "console.error()",
            type: "line",
            description: "输出错误",
            priority: 90,
            insertText: "error()",
            cursorOffset: -1,
          },
          {
            text: "console.warn()",
            type: "line",
            description: "输出警告",
            priority: 85,
            insertText: "warn()",
            cursorOffset: -1,
          },
        )
      }

      // 检测 import
      if (currentLine.match(/^\s*import\s+/)) {
        completions.push({
          text: "import 语句",
          type: "line",
          description: "完成 import 语句",
          priority: 90,
          insertText: "{ } from ''",
          cursorOffset: -8,
        })
      }
    }

    return completions
  }

  // AI 驱动的智能补全
  private async getAICompletions(request: CompletionRequest): Promise<Completion[]> {
    if (!this.config?.apiKey) return []

    const { code, cursorPosition, language, context } = request
    const beforeCursor = code.substring(0, cursorPosition)
    const afterCursor = code.substring(cursorPosition)

    try {
      const prompt = this.buildCompletionPrompt(beforeCursor, afterCursor, language, context)

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt(language),
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
          n: 3, // 生成3个候选
        }),
      })

      if (!response.ok) {
        console.error("[v0] AI completion request failed:", response.statusText)
        return []
      }

      const data = await response.json()
      const completions: Completion[] = []

      for (let i = 0; i < data.choices.length; i++) {
        const content = data.choices[i]?.message?.content?.trim()
        if (content) {
          completions.push({
            text: content,
            type: this.detectCompletionType(content),
            description: `AI 建议 ${i + 1}`,
            priority: 95 - i * 5,
            insertText: this.formatCompletion(content),
          })
        }
      }

      return completions
    } catch (error) {
      console.error("[v0] AI completion error:", error)
      return []
    }
  }

  // 代码片段补全
  private getSnippetCompletions(request: CompletionRequest): Completion[] {
    const { language } = request
    const completions: Completion[] = []

    if (language === "javascript" || language === "typescript") {
      completions.push(
        {
          text: "React 组件",
          type: "snippet",
          description: "创建 React 函数组件",
          priority: 70,
          insertText: `function Component() {\n  return (\n    <div>\n      \n    </div>\n  )\n}`,
        },
        {
          text: "useState Hook",
          type: "snippet",
          description: "添加 useState Hook",
          priority: 75,
          insertText: `const [state, setState] = useState()`,
          cursorOffset: -1,
        },
        {
          text: "useEffect Hook",
          type: "snippet",
          description: "添加 useEffect Hook",
          priority: 75,
          insertText: `useEffect(() => {\n  \n}, [])`,
          cursorOffset: -5,
        },
        {
          text: "async/await 函数",
          type: "snippet",
          description: "创建异步函数",
          priority: 70,
          insertText: `async function fetchData() {\n  try {\n    const response = await fetch('')\n    const data = await response.json()\n    return data\n  } catch (error) {\n    console.error('Error:', error)\n  }\n}`,
        },
      )
    }

    return completions
  }

  // 构建补全提示词
  private buildCompletionPrompt(
    beforeCursor: string,
    afterCursor: string,
    language: string,
    context?: CompletionRequest["context"],
  ): string {
    let prompt = `请为以下 ${language} 代码提供智能补全建议。\n\n`

    if (context?.fileName) {
      prompt += `文件名: ${context.fileName}\n`
    }

    if (context?.imports && context.imports.length > 0) {
      prompt += `已导入: ${context.imports.join(", ")}\n`
    }

    prompt += `\n光标前的代码:\n\`\`\`${language}\n${beforeCursor.split("\n").slice(-10).join("\n")}\n\`\`\`\n`

    if (afterCursor.trim()) {
      prompt += `\n光标后的代码:\n\`\`\`${language}\n${afterCursor.split("\n").slice(0, 5).join("\n")}\n\`\`\`\n`
    }

    prompt += `\n请提供最合适的代码补全,只返回要插入的代码,不要包含解释。`

    return prompt
  }

  // 获取系统提示词
  private getSystemPrompt(language: string): string {
    return `你是一个专业的 ${language} 代码补全助手。
    
要求:
1. 只返回要插入的代码,不要包含任何解释
2. 代码必须符合最佳实践和编码规范
3. 使用${this.stylePreferences.indentation === "spaces" ? `${this.stylePreferences.indentSize}个空格` : "制表符"}缩进
4. 使用${this.stylePreferences.quotes === "single" ? "单引号" : "双引号"}
5. ${this.stylePreferences.semicolons ? "添加" : "不添加"}分号
6. 代码要简洁、高效、易读
7. 考虑上下文和代码意图`
  }

  // 检测补全类型
  private detectCompletionType(content: string): Completion["type"] {
    const lines = content.split("\n").length
    if (lines === 1) return "line"
    if (content.includes("function") || content.includes("=>")) return "function"
    if (lines > 3) return "multiline"
    return "snippet"
  }

  // 格式化补全内容
  private formatCompletion(content: string): string {
    let formatted = content

    // 应用代码风格
    if (this.stylePreferences.indentation === "spaces") {
      formatted = formatted.replace(/\t/g, " ".repeat(this.stylePreferences.indentSize))
    }

    if (this.stylePreferences.quotes === "single") {
      formatted = formatted.replace(/"/g, "'")
    } else {
      formatted = formatted.replace(/'/g, '"')
    }

    if (!this.stylePreferences.semicolons) {
      formatted = formatted.replace(/;$/gm, "")
    }

    return formatted
  }

  // 计算置信度
  private calculateConfidence(completions: Completion[]): number {
    if (completions.length === 0) return 0
    const avgPriority = completions.reduce((sum, c) => sum + c.priority, 0) / completions.length
    return Math.min(100, avgPriority)
  }

  // 生成缓存键
  private getCacheKey(request: CompletionRequest): string {
    const { code, cursorPosition, language } = request
    const context = code.substring(Math.max(0, cursorPosition - 100), cursorPosition)
    return `${language}:${context}`
  }

  // 清除缓存
  clearCache() {
    this.completionCache.clear()
  }
}

export const aiCodeCompletion = new AICodeCompletion()
export default aiCodeCompletion
