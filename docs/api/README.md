# AI 对话接口文档

本文档详细说明了 YYC³ Modern AI Chatbot 的所有 API 接口。

## 目录

- [基础配置](#基础配置)
- [认证方式](#认证方式)
- [核心接口](#核心接口)
- [扩展接口](#扩展接口)
- [错误处理](#错误处理)
- [使用示例](#使用示例)

---

## 基础配置

### Base URL

\`\`\`
生产环境: https://api.yyc-ai.com/v1
开发环境: http://localhost:3000/api
\`\`\`

### 请求头

所有请求必须包含以下请求头：

\`\`\`http
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
X-Request-ID: unique-request-id
\`\`\`

---

## 认证方式

### API Key 认证

\`\`\`typescript
// 获取 API Key
const apiKey = process.env.YYC_API_KEY

// 在请求头中使用
headers: {
  'Authorization': `Bearer ${apiKey}`
}
\`\`\`

---

## 核心接口

### 1. 智能对话

#### POST /api/chat

发送消息并获取 AI 响应。

**请求参数:**

\`\`\`typescript
interface ChatRequest {
  message: string              // 用户消息
  conversationId?: string      // 会话 ID（可选）
  context?: {
    projectInfo?: ProjectInfo  // 项目上下文
    userPreference?: UserPreference // 用户偏好
    historyMessages?: Message[] // 历史消息
  }
  options?: {
    model?: string             // AI 模型选择
    temperature?: number       // 温度参数 (0-1)
    maxTokens?: number        // 最大 token 数
    stream?: boolean          // 是否流式响应
  }
}
\`\`\`

**响应示例:**

\`\`\`json
{
  "success": true,
  "data": {
    "messageId": "msg_123456",
    "content": "这是 AI 的回复内容",
    "conversationId": "conv_789",
    "usage": {
      "promptTokens": 100,
      "completionTokens": 50,
      "totalTokens": 150
    },
    "metadata": {
      "model": "gpt-4",
      "finishReason": "stop",
      "processingTime": 1.2
    }
  }
}
\`\`\`

**TypeScript 示例:**

\`\`\`typescript
import { ChatRequest, ChatResponse } from '@/types/api'

async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.YYC_API_KEY}`
    },
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }
  
  return response.json()
}

// 使用示例
const result = await sendMessage({
  message: '帮我生成一个 React 登录组件',
  context: {
    projectInfo: {
      techStack: ['react', 'typescript', 'tailwind'],
      framework: 'next.js'
    }
  },
  options: {
    model: 'gpt-4',
    temperature: 0.7
  }
})

console.log(result.data.content)
\`\`\`

---

### 2. 代码生成

#### POST /api/generate-code

根据需求描述生成代码。

**请求参数:**

\`\`\`typescript
interface CodeGenerationRequest {
  requirement: {
    description: string        // 功能描述
    type: 'function' | 'class' | 'component' | 'api' // 代码类型
    language: string          // 编程语言
    framework?: string        // 框架（可选）
  }
  context?: {
    projectContext?: string   // 项目上下文
    existingCode?: string     // 现有代码
    dependencies?: string[]   // 依赖库
  }
  options?: {
    includeTests?: boolean    // 是否生成测试
    includeDocs?: boolean     // 是否生成文档
    includeComments?: boolean // 是否包含注释
    codeStyle?: CodeStyle     // 代码风格
  }
}
\`\`\`

**响应示例:**

\`\`\`json
{
  "success": true,
  "data": {
    "code": "// 生成的代码\nfunction example() { ... }",
    "tests": "// 测试代码\ntest('example', () => { ... })",
    "documentation": "# API 文档\n...",
    "metadata": {
      "language": "typescript",
      "framework": "react",
      "linesOfCode": 45,
      "complexity": "low",
      "estimatedTime": "2 hours"
    },
    "suggestions": [
      {
        "type": "optimization",
        "description": "建议使用 useMemo 优化性能"
      }
    ]
  }
}
\`\`\`

**使用示例:**

\`\`\`typescript
const result = await fetch('/api/generate-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requirement: {
      description: '创建一个用户登录表单，包含邮箱和密码验证',
      type: 'component',
      language: 'typescript',
      framework: 'react'
    },
    options: {
      includeTests: true,
      includeDocs: true,
      codeStyle: {
        naming: 'camelCase',
        indentation: 2,
        quotes: 'single'
      }
    }
  })
}).then(res => res.json())

console.log(result.data.code)
\`\`\`

---

### 3. 代码分析

#### POST /api/analyze-code

分析代码质量并提供改进建议。

**请求参数:**

\`\`\`typescript
interface CodeAnalysisRequest {
  code: string
  language: string
  options?: {
    checkSecurity?: boolean   // 安全检查
    checkPerformance?: boolean // 性能分析
    checkComplexity?: boolean // 复杂度分析
    checkStyle?: boolean      // 代码风格检查
  }
}
\`\`\`

**响应示例:**

\`\`\`json
{
  "success": true,
  "data": {
    "overallScore": 9.2,
    "scores": {
      "readability": 9.5,
      "maintainability": 9.0,
      "security": 8.8,
      "performance": 9.3,
      "testability": 9.1
    },
    "issues": [
      {
        "severity": "warning",
        "type": "security",
        "line": 15,
        "message": "避免在客户端存储敏感信息",
        "suggestion": "使用环境变量或服务端存储"
      }
    ],
    "suggestions": [
      {
        "type": "refactoring",
        "priority": "medium",
        "description": "建议提取重复代码为单独函数",
        "locations": [10, 25, 40]
      }
    ],
    "metrics": {
      "linesOfCode": 120,
      "cyclomaticComplexity": 8,
      "maintainabilityIndex": 85
    }
  }
}
\`\`\`

---

### 4. 代码重构

#### POST /api/refactor-code

对代码进行重构优化。

**请求参数:**

\`\`\`typescript
interface RefactorRequest {
  code: string
  language: string
  refactorType: 'extract-method' | 'rename' | 'simplify' | 'optimize-performance' | 'improve-readability'
  options?: {
    preserveFunctionality?: boolean // 保持功能不变
    generateTests?: boolean         // 生成测试
  }
}
\`\`\`

**响应示例:**

\`\`\`json
{
  "success": true,
  "data": {
    "refactoredCode": "// 重构后的代码",
    "changes": [
      {
        "type": "extract-method",
        "before": "行 10-20",
        "after": "提取为 calculateTotal() 方法",
        "impact": "提高可读性和可测试性"
      }
    ],
    "improvements": {
      "readability": "+15%",
      "performance": "+8%",
      "maintainability": "+20%"
    },
    "tests": "// 新增的测试代码"
  }
}
\`\`\`

---

### 5. 测试生成

#### POST /api/generate-tests

为代码生成测试用例。

**请求参数:**

\`\`\`typescript
interface TestGenerationRequest {
  code: string
  language: string
  testFramework: 'jest' | 'mocha' | 'vitest' | 'pytest'
  options?: {
    coveragTarget?: number    // 目标覆盖率
    includeMocks?: boolean    // 包含 Mock
    includeEdgeCases?: boolean // 包含边界情况
  }
}
\`\`\`

**响应示例:**

\`\`\`json
{
  "success": true,
  "data": {
    "testCode": "// 生成的测试代码",
    "coverage": {
      "statements": 95,
      "branches": 90,
      "functions": 100,
      "lines": 95
    },
    "testCases": [
      {
        "name": "should handle valid input",
        "type": "unit",
        "priority": "high"
      },
      {
        "name": "should throw error on null input",
        "type": "edge-case",
        "priority": "high"
      }
    ]
  }
}
\`\`\`

---

## 扩展接口

### 6. 代码转换

#### POST /api/translate-code

将代码从一种语言转换为另一种语言。

**请求参数:**

\`\`\`typescript
interface CodeTranslationRequest {
  code: string
  sourceLanguage: string
  targetLanguage: string
  options?: {
    preserveComments?: boolean
    updateDependencies?: boolean
  }
}
\`\`\`

---

### 7. 智能补全

#### POST /api/code-completion

提供代码补全建议。

**请求参数:**

\`\`\`typescript
interface CompletionRequest {
  code: string
  cursorPosition: {
    line: number
    column: number
  }
  context: {
    language: string
    framework?: string
  }
}
\`\`\`

---

### 8. 性能分析

#### POST /api/analyze-performance

分析代码性能并提供优化建议。

**请求参数:**

\`\`\`typescript
interface PerformanceAnalysisRequest {
  code: string
  language: string
  options?: {
    analyzeMemory?: boolean
    analyzeSpeed?: boolean
    suggestOptimizations?: boolean
  }
}
\`\`\`

---

## 错误处理

所有 API 在发生错误时返回统一格式：

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      "field": "具体字段",
      "reason": "错误原因"
    }
  }
}
\`\`\`

### 常见错误码

| 错误码 | HTTP状态 | 描述 |
|--------|---------|------|
| `INVALID_REQUEST` | 400 | 请求参数无效 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `MODEL_UNAVAILABLE` | 503 | AI 模型不可用 |

---

## 使用示例

### 完整的 React Hook 示例

\`\`\`typescript
import { useState } from 'react'

interface UseChatOptions {
  apiKey: string
  baseUrl?: string
}

export function useChat({ apiKey, baseUrl = '/api' }: UseChatOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const sendMessage = async (message: string, context?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ message, context })
      })
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }
      
      const result = await response.json()
      return result.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  return { sendMessage, loading, error }
}

// 组件中使用
function ChatComponent() {
  const { sendMessage, loading } = useChat({
    apiKey: process.env.NEXT_PUBLIC_API_KEY!
  })
  
  const handleSubmit = async (message: string) => {
    const response = await sendMessage(message, {
      projectInfo: { framework: 'react' }
    })
    console.log(response.content)
  }
  
  return (
    <div>
      {/* UI 组件 */}
    </div>
  )
}
\`\`\`

---

## 速率限制

| 计划 | 请求频率 | 并发数 |
|------|---------|--------|
| 免费版 | 60次/分钟 | 5 |
| 专业版 | 600次/分钟 | 20 |
| 企业版 | 不限 | 不限 |

---

## 更多资源

- [快速开始指南](../USER_GUIDE.md)
- [架构文档](../ARCHITECTURE.md)
- [SDK 文档](./sdk.md)
- [示例代码](../../examples/)

---

<div align="center">

**需要帮助？** 联系我们: support@yyc-ai.com

</div>
