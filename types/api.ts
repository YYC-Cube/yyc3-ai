// API相关类型定义
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: number
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface APIError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface ChatRequest {
  messages: Array<{
    role: string
    content: string
  }>
  model: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatResponse {
  id: string
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  available: boolean
  contextWindow: number
}

export interface ProjectCreateRequest {
  name: string
  description: string
  type: string
  framework: string
  template?: string
}

export interface LearningCourseRequest {
  level: "beginner" | "intermediate" | "advanced"
  topics: string[]
  duration?: number
}
