"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles, Code, FileCode, Wand2, Send, Loader2, Copy, Check, Download } from "lucide-react"
import { unifiedAI } from "@/lib/unified-ai-service"

interface CodeCompletionSuggestion {
  code: string
  description: string
  confidence: number
}

interface EnhancedAICodeAssistantProps {
  currentCode: string
  currentLanguage: string
  cursorPosition: { line: number; column: number }
  onCodeGenerated: (code: string) => void
  onInsertCode: (code: string, position?: { line: number; column: number }) => void
}

export default function EnhancedAICodeAssistant({
  currentCode,
  currentLanguage,
  cursorPosition,
  onCodeGenerated,
  onInsertCode,
}: EnhancedAICodeAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"generate" | "complete" | "improve" | "refactor">("generate")
  const [completionSuggestions, setCompletionSuggestions] = useState<CodeCompletionSuggestion[]>([])
  const [isAutoCompleting, setIsAutoCompleting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "complete" && currentCode && currentCode.trim().length > 10) {
        handleAutoComplete()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [currentCode, cursorPosition, activeTab])

  const handleAutoComplete = useCallback(async () => {
    if (isAutoCompleting) return

    setIsAutoCompleting(true)
    try {
      const codeBeforeCursor = getCurrentLineCode()
      const context = getCodeContext()

      const systemPrompt = `你是一个智能代码补全助手。根据当前代码上下文,提供3个最合适的代码补全建议。每个建议应该:
1. 符合当前语言(${currentLanguage})的语法
2. 考虑代码上下文和模式
3. 提供简短的描述
返回JSON格式: { "suggestions": [{ "code": "...", "description": "...", "confidence": 0-1 }] }`

      const userPrompt = `当前代码行: ${codeBeforeCursor}
      
上下文:
${context}

请提供代码补全建议。`

      const response = await unifiedAI.completeWithSystem(systemPrompt, userPrompt, {
        temperature: 0.3,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response)
      if (parsed.suggestions) {
        setCompletionSuggestions(parsed.suggestions)
      }
    } catch (err) {
      console.error("[v0] Auto-complete error:", err)
    } finally {
      setIsAutoCompleting(false)
    }
  }, [currentCode, cursorPosition, currentLanguage, isAutoCompleting])

  const getCurrentLineCode = () => {
    const lines = currentCode.split("\n")
    return lines[cursorPosition.line] || ""
  }

  const getCodeContext = () => {
    const lines = currentCode.split("\n")
    const start = Math.max(0, cursorPosition.line - 10)
    const end = Math.min(lines.length, cursorPosition.line + 5)
    return lines.slice(start, end).join("\n")
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const systemPrompt = `你是一个专业的${currentLanguage}代码生成器。生成高质量、可运行的代码,包含:
1. 完整的实现
2. 适当的注释
3. 错误处理
4. 最佳实践`

      const response = await unifiedAI.completeWithSystem(systemPrompt, prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      })

      setResult({
        code: response,
        explanation: "代码已生成",
      })
      onCodeGenerated(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImprove = async () => {
    if (!currentCode.trim()) {
      setError("请先输入代码")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const systemPrompt = `你是一个代码优化专家。分析代码并提供改进版本,关注:
1. 性能优化
2. 可读性提升
3. 最佳实践
4. 代码简洁性
5. 错误处理`

      const userPrompt = `优化以下${currentLanguage}代码:

${currentCode}

${prompt ? `特别关注: ${prompt}` : ""}`

      const response = await unifiedAI.completeWithSystem(systemPrompt, userPrompt, {
        temperature: 0.5,
        maxTokens: 2000,
      })

      setResult({
        code: response,
        explanation: "代码已优化",
      })
      onCodeGenerated(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "改进失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefactor = async () => {
    if (!currentCode.trim()) {
      setError("请先输入代码")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const systemPrompt = `你是一个代码重构专家。重构代码以提高:
1. 模块化和组件化
2. 可维护性
3. 可测试性
4. 代码复用
5. 设计模式应用`

      const userPrompt = `重构以下${currentLanguage}代码:

${currentCode}

重构目标: ${prompt || "提高代码质量和可维护性"}`

      const response = await unifiedAI.completeWithSystem(systemPrompt, userPrompt, {
        temperature: 0.6,
        maxTokens: 2500,
      })

      setResult({
        code: response,
        explanation: "代码已重构",
      })
      onCodeGenerated(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "重构失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (result?.code) {
      await navigator.clipboard.writeText(result.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (result?.code) {
      const blob = new Blob([result.code], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `code.${getFileExtension()}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getFileExtension = () => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      html: "html",
      css: "css",
    }
    return extensions[currentLanguage] || "txt"
  }

  const tabs = [
    { id: "generate" as const, label: "生成代码", icon: Sparkles, action: handleGenerate },
    { id: "complete" as const, label: "智能补全", icon: Code, action: () => {} },
    { id: "improve" as const, label: "代码优化", icon: Wand2, action: handleImprove },
    { id: "refactor" as const, label: "代码重构", icon: FileCode, action: handleRefactor },
  ]

  const activeAction = tabs.find((t) => t.id === activeTab)?.action

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">智能编程助手</span>
        </div>
        {result && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
              title="复制代码"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
              title="下载代码"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "complete" ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              实时代码补全建议 {isAutoCompleting && <Loader2 className="inline h-3 w-3 animate-spin" />}
            </div>
            {completionSuggestions.length > 0 ? (
              <div className="space-y-2">
                {completionSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => onInsertCode(suggestion.code, cursorPosition)}
                    className="w-full rounded-lg border border-zinc-200 p-3 text-left transition-colors hover:border-purple-500 hover:bg-purple-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-600">
                        建议 {i + 1} (置信度: {Math.round(suggestion.confidence * 100)}%)
                      </span>
                    </div>
                    <code className="block text-sm text-zinc-900 dark:text-zinc-100">{suggestion.code}</code>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
                <div>
                  <Code className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                  <p>开始输入代码,系统将自动提供补全建议</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 输入区 */}
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === "generate"
                    ? "描述你想要生成的代码功能...\n例如: 创建一个带表单验证的用户登录组件"
                    : activeTab === "improve"
                      ? "描述优化重点...\n例如: 优化性能并添加错误处理"
                      : "描述重构目标...\n例如: 将函数拆分为更小的可复用模块"
                }
                className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950"
                rows={3}
                disabled={isGenerating}
              />

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  当前语言: {currentLanguage} | 行: {cursorPosition.line + 1} 列: {cursorPosition.column + 1}
                </div>
                <button
                  onClick={activeAction}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      执行
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 结果区 */}
            <div className="flex-1 overflow-y-auto p-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20">
                  {error}
                </div>
              )}

              {result && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20">
                    {result.explanation}
                  </div>
                  <pre className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <code>{result.code}</code>
                  </pre>
                </div>
              )}

              {!error && !result && !isGenerating && (
                <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
                  <div>
                    <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                    <p>输入需求后点击执行按钮</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
