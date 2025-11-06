// 统一AI服务接口 - 封装多个AI模型提供商
import { getOpenAIConfig } from "./openai-config"

export type AIProvider = "openai" | "anthropic" | "google" | "local"

export interface AIServiceConfig {
  provider: AIProvider
  apiKey?: string
  model: string
  temperature: number
  maxTokens: number
  baseURL?: string
}

export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: string
}

export interface StreamChunk {
  content: string
  isComplete: boolean
}

// AI服务提供商接口
interface AIServiceProvider {
  chat(messages: AIMessage[], config: AIServiceConfig): Promise<AIResponse>
  stream(messages: AIMessage[], config: AIServiceConfig): AsyncGenerator<StreamChunk>
}

// OpenAI 提供商
class OpenAIProvider implements AIServiceProvider {
  async chat(messages: AIMessage[], config: AIServiceConfig): Promise<AIResponse> {
    const response = await fetch(config.baseURL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.choices[0]?.message?.content || "",
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      finishReason: data.choices[0]?.finish_reason || "stop",
    }
  }

  async *stream(messages: AIMessage[], config: AIServiceConfig): AsyncGenerator<StreamChunk> {
    const response = await fetch(config.baseURL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response body")

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            yield { content: "", isComplete: true }
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content || ""
            if (content) {
              yield { content, isComplete: false }
            }
          } catch (error) {
            console.error("[v0] Failed to parse stream chunk:", error)
          }
        }
      }
    }
  }
}

// Anthropic 提供商
class AnthropicProvider implements AIServiceProvider {
  async chat(messages: AIMessage[], config: AIServiceConfig): Promise<AIResponse> {
    // 转换消息格式
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }))

    const systemMessage = messages.find((m) => m.role === "system")?.content

    const response = await fetch(config.baseURL || "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        messages: anthropicMessages,
        system: systemMessage,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.content[0]?.text || "",
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
      finishReason: data.stop_reason || "stop",
    }
  }

  async *stream(messages: AIMessage[], config: AIServiceConfig): AsyncGenerator<StreamChunk> {
    // Anthropic streaming implementation
    yield { content: "Anthropic streaming not implemented", isComplete: true }
  }
}

// Google AI 提供商
class GoogleProvider implements AIServiceProvider {
  async chat(messages: AIMessage[], config: AIServiceConfig): Promise<AIResponse> {
    // Google AI implementation
    throw new Error("Google AI provider not implemented")
  }

  async *stream(messages: AIMessage[], config: AIServiceConfig): AsyncGenerator<StreamChunk> {
    yield { content: "Google AI streaming not implemented", isComplete: true }
  }
}

// 本地模型提供商
class LocalProvider implements AIServiceProvider {
  async chat(messages: AIMessage[], config: AIServiceConfig): Promise<AIResponse> {
    // Local model implementation (e.g., Ollama)
    throw new Error("Local provider not implemented")
  }

  async *stream(messages: AIMessage[], config: AIServiceConfig): AsyncGenerator<StreamChunk> {
    yield { content: "Local streaming not implemented", isComplete: true }
  }
}

// 统一AI服务
class UnifiedAIService {
  private providers: Map<AIProvider, AIServiceProvider> = new Map()
  private defaultConfig: AIServiceConfig

  constructor() {
    // 注册提供商
    this.providers.set("openai", new OpenAIProvider())
    this.providers.set("anthropic", new AnthropicProvider())
    this.providers.set("google", new GoogleProvider())
    this.providers.set("local", new LocalProvider())

    // 从 OpenAI 配置加载默认配置
    const openaiConfig = getOpenAIConfig()
    this.defaultConfig = {
      provider: "openai",
      apiKey: openaiConfig?.apiKey,
      model: openaiConfig?.model || "gpt-4",
      temperature: openaiConfig?.temperature || 0.7,
      maxTokens: openaiConfig?.maxTokens || 2000,
    }
  }

  // 设置默认配置
  setDefaultConfig(config: Partial<AIServiceConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  // 获取默认配置
  getDefaultConfig(): AIServiceConfig {
    return { ...this.defaultConfig }
  }

  // 聊天完成
  async chat(messages: AIMessage[], config?: Partial<AIServiceConfig>): Promise<AIResponse> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const provider = this.providers.get(finalConfig.provider)

    if (!provider) {
      throw new Error(`Provider ${finalConfig.provider} not found`)
    }

    if (!finalConfig.apiKey) {
      throw new Error(`API key not configured for provider ${finalConfig.provider}`)
    }

    try {
      return await provider.chat(messages, finalConfig)
    } catch (error) {
      console.error(`[v0] AI service error (${finalConfig.provider}):`, error)
      throw error
    }
  }

  // 流式聊天
  async *stream(messages: AIMessage[], config?: Partial<AIServiceConfig>): AsyncGenerator<StreamChunk> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const provider = this.providers.get(finalConfig.provider)

    if (!provider) {
      throw new Error(`Provider ${finalConfig.provider} not found`)
    }

    if (!finalConfig.apiKey) {
      throw new Error(`API key not configured for provider ${finalConfig.provider}`)
    }

    try {
      yield* provider.stream(messages, finalConfig)
    } catch (error) {
      console.error(`[v0] AI service stream error (${finalConfig.provider}):`, error)
      throw error
    }
  }

  // 简单文本完成
  async complete(prompt: string, config?: Partial<AIServiceConfig>): Promise<string> {
    const messages: AIMessage[] = [{ role: "user", content: prompt }]
    const response = await this.chat(messages, config)
    return response.content
  }

  // 带系统提示的完成
  async completeWithSystem(
    systemPrompt: string,
    userPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): Promise<string> {
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]
    const response = await this.chat(messages, config)
    return response.content
  }

  // 多轮对话
  async conversation(history: AIMessage[], newMessage: string, config?: Partial<AIServiceConfig>): Promise<AIResponse> {
    const messages = [...history, { role: "user" as const, content: newMessage }]
    return await this.chat(messages, config)
  }

  // 获取可用提供商
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys())
  }

  // 检查提供商是否可用
  isProviderAvailable(provider: AIProvider): boolean {
    return this.providers.has(provider)
  }

  // 测试连接
  async testConnection(provider?: AIProvider): Promise<boolean> {
    const testConfig = provider ? { ...this.defaultConfig, provider } : this.defaultConfig

    try {
      const response = await this.chat([{ role: "user", content: "Hello" }], testConfig)
      return response.content.length > 0
    } catch (error) {
      console.error(`[v0] Connection test failed for ${testConfig.provider}:`, error)
      return false
    }
  }

  // 获取模型列表
  getModelsForProvider(provider: AIProvider): string[] {
    const models: Record<AIProvider, string[]> = {
      openai: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4o", "gpt-4o-mini"],
      anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-2.1"],
      google: ["gemini-pro", "gemini-pro-vision"],
      local: ["llama2", "mistral", "codellama"],
    }

    return models[provider] || []
  }

  // 估算令牌数
  estimateTokens(text: string): number {
    // 简单估算: 1 token ≈ 4 字符
    return Math.ceil(text.length / 4)
  }

  // 计算成本
  calculateCost(usage: AIResponse["usage"], provider: AIProvider, model: string): number {
    // 价格表 (美元/1000 tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
      "claude-3-opus": { input: 0.015, output: 0.075 },
      "claude-3-sonnet": { input: 0.003, output: 0.015 },
    }

    const price = pricing[model] || { input: 0, output: 0 }
    const inputCost = (usage.promptTokens / 1000) * price.input
    const outputCost = (usage.completionTokens / 1000) * price.output

    return inputCost + outputCost
  }
}

// 全局实例
export const unifiedAI = new UnifiedAIService()
export default unifiedAI
