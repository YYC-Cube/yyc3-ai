// OpenAI 配置管理
export interface OpenAIConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  baseURL?: string
}

export const defaultOpenAIConfig: OpenAIConfig = {
  apiKey: "",
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 2000,
  baseURL: "https://api.openai.com/v1",
}

export const availableModels = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
]

// 保存配置到 localStorage
export function saveOpenAIConfig(config: OpenAIConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem("openai-config", JSON.stringify(config))
  }
}

// 从 localStorage 加载配置
export function loadOpenAIConfig(): OpenAIConfig {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("openai-config")
    if (saved) {
      try {
        return { ...defaultOpenAIConfig, ...JSON.parse(saved) }
      } catch {
        return defaultOpenAIConfig
      }
    }
  }
  return defaultOpenAIConfig
}

export function getOpenAIConfig(): OpenAIConfig {
  return loadOpenAIConfig()
}

// 测试 API 连接
export async function testOpenAIConnection(config: OpenAIConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.baseURL}/models`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}
