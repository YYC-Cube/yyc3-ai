"use client"

// AI 代码生成器 - 与 OpenAI 集成生成代码
import { type OpenAIConfig, getOpenAIConfig } from "./openai-config"

export interface CodeGenerationRequest {
  prompt: string
  language: string
  framework?: string
  style?: string
  context?: string
}

export interface CodeGenerationResult {
  code: string
  explanation: string
  suggestions: string[]
  language: string
}

export class AICodeGenerator {
  private config: OpenAIConfig | null = null

  constructor() {
    this.config = getOpenAIConfig()
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    if (!this.config?.apiKey) {
      throw new Error("请先配置 OpenAI API 密钥")
    }

    const systemPrompt = this.buildSystemPrompt(request)
    const userPrompt = this.buildUserPrompt(request)

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""

      return this.parseCodeResponse(content, request.language)
    } catch (error) {
      console.error("[v0] AI code generation error:", error)
      throw error
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    return `你是一个专业的代码生成助手。请根据用户需求生成高质量的 ${request.language} 代码。

要求:
1. 代码必须完整可运行,不使用占位符
2. 遵循最佳实践和编码规范
3. 添加必要的注释说明
4. 确保代码安全性和性能
5. 使用现代语法和特性

${request.framework ? `使用框架: ${request.framework}` : ""}
${request.style ? `代码风格: ${request.style}` : ""}

请按以下格式返回:

\`\`\`${request.language}
[生成的代码]
\`\`\`

**说明:**
[代码功能说明]

**建议:**
- [优化建议1]
- [优化建议2]`
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = request.prompt

    if (request.context) {
      prompt = `上下文:\n${request.context}\n\n需求:\n${prompt}`
    }

    return prompt
  }

  private parseCodeResponse(content: string, language: string): CodeGenerationResult {
    // 提取代码块
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g
    const codeMatches = [...content.matchAll(codeBlockRegex)]
    const code = codeMatches[0]?.[1]?.trim() || content

    // 提取说明
    const explanationMatch = content.match(/\*\*说明:\*\*\s*([\s\S]*?)(?=\*\*建议:|$)/)
    const explanation = explanationMatch?.[1]?.trim() || "代码已生成"

    // 提取建议
    const suggestionsMatch = content.match(/\*\*建议:\*\*\s*([\s\S]*?)$/)
    const suggestionsText = suggestionsMatch?.[1]?.trim() || ""
    const suggestions = suggestionsText
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean)

    return {
      code,
      explanation,
      suggestions,
      language,
    }
  }

  async improveCode(code: string, language: string, instruction: string): Promise<CodeGenerationResult> {
    return this.generateCode({
      prompt: `请改进以下代码:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n改进要求: ${instruction}`,
      language,
    })
  }

  async explainCode(code: string, language: string): Promise<string> {
    if (!this.config?.apiKey) {
      throw new Error("请先配置 OpenAI API 密钥")
    }

    try {
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
              content: "你是一个代码解释专家。请用简洁清晰的中文解释代码的功能、逻辑和关键点。",
            },
            {
              role: "user",
              content: `请解释以下 ${language} 代码:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      const data = await response.json()
      return data.choices[0]?.message?.content || "无法生成解释"
    } catch (error) {
      console.error("[v0] Code explanation error:", error)
      throw error
    }
  }

  async fixCode(code: string, language: string, error: string): Promise<CodeGenerationResult> {
    return this.generateCode({
      prompt: `以下代码出现错误:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n错误信息: ${error}\n\n请修复这个错误并返回正确的代码。`,
      language,
    })
  }
}

// 代码模板生成器
export const codeTemplates = {
  react: {
    component: `function Component() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}`,
    stateComponent: `function Component() {
  const [state, setState] = React.useState(0)
  
  return (
    <div>
      <p>Count: {state}</p>
      <button onClick={() => setState(state + 1)}>
        Increment
      </button>
    </div>
  )
}`,
    form: `function Form() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  )
}`,
  },
  javascript: {
    function: `function example() {
  // Your code here
  return 'Hello World'
}`,
    async: `async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}`,
    class: `class Example {
  constructor() {
    this.value = 0
  }
  
  increment() {
    this.value++
  }
  
  getValue() {
    return this.value
  }
}`,
  },
}
