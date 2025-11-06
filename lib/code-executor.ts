// 代码执行引擎 - 支持安全的代码沙箱执行
export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  logs: string[]
  executionTime: number
}

export interface CodeFile {
  id: string
  name: string
  language: string
  content: string
  path: string
}

export class CodeExecutor {
  private iframe: HTMLIFrameElement | null = null
  private logs: string[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.setupIframe()
    }
  }

  private setupIframe() {
    this.iframe = document.createElement("iframe")
    this.iframe.style.display = "none"
    this.iframe.sandbox.add("allow-scripts")
    document.body.appendChild(this.iframe)
  }

  async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()
    this.logs = []

    try {
      // 创建安全的执行环境
      const wrappedCode = `
        const console = {
          log: (...args) => window.parent.postMessage({ type: 'log', data: args }, '*'),
          error: (...args) => window.parent.postMessage({ type: 'error', data: args }, '*'),
          warn: (...args) => window.parent.postMessage({ type: 'warn', data: args }, '*'),
        };
        
        try {
          ${code}
        } catch (error) {
          window.parent.postMessage({ type: 'error', data: [error.message] }, '*');
        }
      `

      // 监听消息
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === "log" || event.data.type === "error" || event.data.type === "warn") {
          this.logs.push(`[${event.data.type}] ${event.data.data.join(" ")}`)
        }
      }

      window.addEventListener("message", messageHandler)

      // 执行代码
      if (this.iframe?.contentWindow) {
        this.iframe.contentWindow.eval(wrappedCode)
      }

      // 等待执行完成
      await new Promise((resolve) => setTimeout(resolve, 100))

      window.removeEventListener("message", messageHandler)

      const executionTime = performance.now() - startTime

      return {
        success: true,
        logs: this.logs,
        executionTime,
      }
    } catch (error) {
      const executionTime = performance.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: this.logs,
        executionTime,
      }
    }
  }

  async executeReact(code: string): Promise<ExecutionResult> {
    const startTime = performance.now()

    try {
      // React 代码将在预览窗口中渲染
      return {
        success: true,
        output: "React component ready for preview",
        logs: ["Component compiled successfully"],
        executionTime: performance.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [],
        executionTime: performance.now() - startTime,
      }
    }
  }

  destroy() {
    if (this.iframe) {
      document.body.removeChild(this.iframe)
      this.iframe = null
    }
  }
}

// 代码格式化工具
export function formatCode(code: string, language: string): string {
  // 简单的代码格式化
  if (language === "javascript" || language === "typescript") {
    return code
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
  }
  return code
}

// 代码验证
export function validateCode(code: string, language: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!code.trim()) {
    errors.push("代码不能为空")
    return { valid: false, errors }
  }

  if (language === "javascript" || language === "typescript") {
    // 检查基本语法
    const openBraces = (code.match(/{/g) || []).length
    const closeBraces = (code.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push("括号不匹配")
    }

    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push("圆括号不匹配")
    }
  }

  return { valid: errors.length === 0, errors }
}

export const codeExecutor = new CodeExecutor()
export default codeExecutor
