// AI相关类型定义
export type AIProvider = "openai" | "anthropic" | "google" | "deepseek" | "grok" | "claude" | "local"

export type AIModel = {
  id: string
  name: string
  provider: AIProvider
  contextWindow: number
  maxTokens: number
  costPer1kTokens: {
    input: number
    output: number
  }
  capabilities: string[]
  region: "domestic" | "international"
}

export interface AIMessage {
  id: string
  role: "system" | "user" | "assistant"
  content: string
  timestamp: number
  tokens?: number
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  model: string
  provider: AIProvider
  createdAt: number
  updatedAt: number
  totalTokens: number
  totalCost: number
  tags: string[]
  starred: boolean
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
  cost: number
}

export interface StreamChunk {
  content: string
  isComplete: boolean
}

export interface AIServiceConfig {
  provider: AIProvider
  apiKey?: string
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  baseURL?: string
}

export interface AICodeCompletion {
  code: string
  language: string
  description: string
  confidence: number
}

export interface AICodeReview {
  issues: Array<{
    line: number
    severity: "error" | "warning" | "info"
    message: string
    suggestion: string
  }>
  score: number
  summary: string
}
