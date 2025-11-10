"use client"

/**
 * AI 对话接口使用示例集合
 * 包含各种场景的完整代码示例
 */

// ============ 基础对话示例 ============

export async function basicChatExample() {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_API_KEY",
    },
    body: JSON.stringify({
      message: "你好，请帮我解释一下React Hooks",
      options: {
        model: "gpt-4",
        temperature: 0.7,
      },
    }),
  })

  const result = await response.json()
  console.log(result.data.content)
}

// ============ 流式响应示例 ============

export async function streamingChatExample() {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "请详细解释JavaScript闭包",
      options: {
        stream: true,
      },
    }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader!.read()
    if (done) break

    const chunk = decoder.decode(value)
    console.log("收到内容:", chunk)
  }
}

// ============ 代码生成示例 ============

export async function generateReactComponent() {
  const response = await fetch("/api/generate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requirement: {
        description: "创建一个用户注册表单，包含用户名、邮箱、密码字段，支持表单验证",
        type: "component",
        language: "typescript",
        framework: "react",
      },
      options: {
        includeTests: true,
        includeDocs: true,
        includeComments: true,
        codeStyle: {
          naming: "camelCase",
          indentation: 2,
          quotes: "single",
        },
      },
    }),
  })

  const result = await response.json()
  return {
    component: result.data.code,
    tests: result.data.tests,
    docs: result.data.documentation,
  }
}

// ============ 数据库代码生成示例 ============

export async function generateDatabaseCode() {
  const response = await fetch("/api/generate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requirement: {
        description: "创建用户管理的数据访问层，包含CRUD操作和事务支持",
        type: "api",
        language: "typescript",
        framework: "prisma",
      },
      context: {
        dependencies: ["@prisma/client", "zod"],
        projectContext: `
          已有 User 模型定义:
          model User {
            id String @id @default(uuid())
            email String @unique
            name String
            createdAt DateTime @default(now())
          }
        `,
      },
      options: {
        includeTests: true,
        includeDocs: true,
      },
    }),
  })

  return response.json()
}

// ============ 代码分析示例 ============

export async function analyzeCodeQuality() {
  const codeToAnalyze = `
    function calculateTotal(items) {
      let total = 0;
      for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
      }
      return total;
    }
  `

  const response = await fetch("/api/analyze-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: codeToAnalyze,
      language: "javascript",
      options: {
        checkSecurity: true,
        checkPerformance: true,
        checkComplexity: true,
        checkStyle: true,
      },
    }),
  })

  const result = await response.json()
  console.log("代码评分:", result.data.overallScore)
  console.log("问题列表:", result.data.issues)
  console.log("优化建议:", result.data.suggestions)

  return result.data
}

// ============ 代码重构示例 ============

export async function refactorCode() {
  const codeToRefactor = `
    function processUserData(user) {
      if (user.age > 18) {
        if (user.verified) {
          if (user.premium) {
            return { status: 'premium', discount: 0.2 };
          } else {
            return { status: 'verified', discount: 0.1 };
          }
        } else {
          return { status: 'adult', discount: 0 };
        }
      } else {
        return { status: 'minor', discount: 0 };
      }
    }
  `

  const response = await fetch("/api/refactor-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: codeToRefactor,
      language: "javascript",
      refactorType: "simplify",
      options: {
        preserveFunctionality: true,
        generateTests: true,
      },
    }),
  })

  const result = await response.json()
  console.log("重构后代码:", result.data.refactoredCode)
  console.log("改进点:", result.data.improvements)

  return result.data
}

// ============ 测试生成示例 ============

export async function generateTests() {
  const codeToTest = `
    export function validateEmail(email: string): boolean {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    export function calculateDiscount(price: number, discountRate: number): number {
      if (price < 0 || discountRate < 0 || discountRate > 1) {
        throw new Error('Invalid input');
      }
      return price * (1 - discountRate);
    }
  `

  const response = await fetch("/api/generate-tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: codeToTest,
      language: "typescript",
      testFramework: "jest",
      options: {
        coverageTarget: 95,
        includeMocks: true,
        includeEdgeCases: true,
      },
    }),
  })

  const result = await response.json()
  console.log("生成的测试:", result.data.testCode)
  console.log("覆盖率:", result.data.coverage)

  return result.data
}

// ============ 代码转换示例 ============

export async function translateCode() {
  const pythonCode = `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n-1)
  `

  const response = await fetch("/api/translate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: pythonCode,
      sourceLanguage: "python",
      targetLanguage: "typescript",
      options: {
        preserveComments: true,
        updateDependencies: true,
      },
    }),
  })

  const result = await response.json()
  console.log("转换后的TypeScript代码:", result.data.translatedCode)
  console.log("差异说明:", result.data.differences)

  return result.data
}

// ============ 智能补全示例 ============

export async function getCodeCompletion() {
  const incompleteCode = `
import React, { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 这里需要补全登录逻辑
  `

  const response = await fetch("/api/code-completion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: incompleteCode,
      cursorPosition: {
        line: 10,
        column: 0,
      },
      context: {
        language: "typescript",
        framework: "react",
      },
    }),
  })

  const result = await response.json()
  console.log("补全建议:", result.data.completions)

  return result.data
}

// ============ 性能分析示例 ============

export async function analyzePerformance() {
  const codeToAnalyze = `
function findDuplicates(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}
  `

  const response = await fetch("/api/analyze-performance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: codeToAnalyze,
      language: "javascript",
      options: {
        analyzeMemory: true,
        analyzeSpeed: true,
        suggestOptimizations: true,
      },
    }),
  })

  const result = await response.json()
  console.log("时间复杂度:", result.data.timeComplexity)
  console.log("空间复杂度:", result.data.spaceComplexity)
  console.log("优化建议:", result.data.optimizations)

  return result.data
}

// ============ 批量处理示例 ============

export async function batchProcessing() {
  const files = [
    { path: "src/utils/helper.ts", code: "..." },
    { path: "src/components/Button.tsx", code: "..." },
    { path: "src/api/users.ts", code: "..." },
  ]

  const analysisPromises = files.map((file) =>
    fetch("/api/analyze-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: file.code,
        language: file.path.endsWith(".ts") ? "typescript" : "javascript",
      }),
    }).then((res) => res.json()),
  )

  const results = await Promise.all(analysisPromises)
  console.log("批量分析结果:", results)

  return results
}

// ============ 错误处理示例 ============

export async function robustApiCall() {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "测试消息",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API错误: ${error.error.code} - ${error.error.message}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("网络错误:", error)
    } else if (error.message.includes("RATE_LIMIT")) {
      console.error("请求频率超限，请稍后重试")
    } else {
      console.error("未知错误:", error)
    }
    throw error
  }
}
