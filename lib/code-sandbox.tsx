// 代码执行沙箱 - 安全执行用户代码
export interface SandboxResult {
  output: string
  error: string | null
  executionTime: number
  memoryUsage: number
}

export interface SandboxConfig {
  timeout: number
  maxMemory: number
  allowedAPIs: string[]
}

class CodeSandbox {
  private readonly DEFAULT_TIMEOUT = 5000 // 5 seconds
  private readonly DEFAULT_MAX_MEMORY = 50 * 1024 * 1024 // 50MB

  // 执行JavaScript/TypeScript代码
  async executeJS(code: string, config?: Partial<SandboxConfig>): Promise<SandboxResult> {
    const startTime = performance.now()
    const output: string[] = []
    let error: string | null = null

    try {
      // 创建安全的执行环境
      const sandbox = this.createSandbox(output)

      // 包装代码以捕获输出
      const wrappedCode = `
        (function() {
          ${code}
        })()
      `

      // 使用Function构造器执行代码（更安全）
      const fn = new Function(
        ...Object.keys(sandbox),
        `
        'use strict';
        ${wrappedCode}
      `,
      )

      // 设置超时
      const timeout = config?.timeout || this.DEFAULT_TIMEOUT
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("执行超时")), timeout)
      })

      // 执行代码
      await Promise.race([Promise.resolve(fn(...Object.values(sandbox))), timeoutPromise])
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }

    const executionTime = performance.now() - startTime

    return {
      output: output.join("\n"),
      error,
      executionTime,
      memoryUsage: this.estimateMemoryUsage(output.join("\n")),
    }
  }

  // 执行Python代码（通过Web Worker或API）
  async executePython(code: string, config?: Partial<SandboxConfig>): Promise<SandboxResult> {
    const startTime = performance.now()

    try {
      // 调用Python执行API
      const response = await fetch("/api/sandbox/python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, config }),
      })

      if (!response.ok) {
        throw new Error("Python执行失败")
      }

      const result = await response.json()
      const executionTime = performance.now() - startTime

      return {
        ...result,
        executionTime,
      }
    } catch (err) {
      return {
        output: "",
        error: err instanceof Error ? err.message : String(err),
        executionTime: performance.now() - startTime,
        memoryUsage: 0,
      }
    }
  }

  // 执行HTML/CSS/JS组合
  async executeWeb(html: string, css: string, js: string): Promise<string> {
    const template = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>
    `

    return template
  }

  // 创建沙箱环境
  private createSandbox(output: string[]): Record<string, any> {
    return {
      console: {
        log: (...args: any[]) => {
          output.push(
            args
              .map((arg) => {
                if (typeof arg === "object") {
                  try {
                    return JSON.stringify(arg, null, 2)
                  } catch {
                    return String(arg)
                  }
                }
                return String(arg)
              })
              .join(" "),
          )
        },
        error: (...args: any[]) => {
          output.push("ERROR: " + args.join(" "))
        },
        warn: (...args: any[]) => {
          output.push("WARN: " + args.join(" "))
        },
      },
      // 允许的全局对象
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      // 禁止危险操作
      eval: undefined,
      Function: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined,
      WebSocket: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      document: undefined,
      window: undefined,
    }
  }

  // 估算内存使用
  private estimateMemoryUsage(output: string): number {
    // 简单估算：字符串长度 * 2（UTF-16编码）
    return output.length * 2
  }

  // 验证代码安全性
  validateCode(code: string): { safe: boolean; issues: string[] } {
    const issues: string[] = []
    const dangerousPatterns = [
      { pattern: /eval\s*\(/g, message: "不允许使用eval()" },
      { pattern: /Function\s*\(/g, message: "不允许使用Function构造器" },
      { pattern: /fetch\s*\(/g, message: "不允许发起网络请求" },
      { pattern: /XMLHttpRequest/g, message: "不允许使用XMLHttpRequest" },
      { pattern: /WebSocket/g, message: "不允许使用WebSocket" },
      { pattern: /localStorage/g, message: "不允许访问localStorage" },
      { pattern: /sessionStorage/g, message: "不允许访问sessionStorage" },
      { pattern: /document\./g, message: "不允许直接操作DOM" },
      { pattern: /window\./g, message: "不允许访问window对象" },
      { pattern: /process\.exit/g, message: "不允许退出进程" },
      { pattern: /require\s*\(/g, message: "不允许使用require" },
      { pattern: /import\s+/g, message: "不允许使用import" },
      { pattern: /__dirname/g, message: "不允许访问__dirname" },
      { pattern: /__filename/g, message: "不允许访问__filename" },
    ]

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(code)) {
        issues.push(message)
      }
    }

    return {
      safe: issues.length === 0,
      issues,
    }
  }

  // 格式化代码
  async formatCode(code: string, language: string): Promise<string> {
    try {
      const response = await fetch("/api/sandbox/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        return code
      }

      const result = await response.json()
      return result.formatted || code
    } catch {
      return code
    }
  }

  // 代码lint检查
  async lintCode(
    code: string,
    language: string,
  ): Promise<{ issues: Array<{ line: number; message: string; severity: string }> }> {
    try {
      const response = await fetch("/api/sandbox/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })

      if (!response.ok) {
        return { issues: [] }
      }

      return await response.json()
    } catch {
      return { issues: [] }
    }
  }
}

export const codeSandbox = new CodeSandbox()
export default codeSandbox
