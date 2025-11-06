"use client"

import { useState } from "react"
import { Sparkles, Wand2, MessageSquare, Lightbulb, Bug, Send, Loader2 } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { AICodeGenerator, type CodeGenerationRequest, type CodeGenerationResult } from "@/lib/ai-code-generator"

interface AICodeAssistantProps {
  currentCode: string
  currentLanguage: string
  onCodeGenerated: (code: string) => void
}

export default function AICodeAssistant({ currentCode, currentLanguage, onCodeGenerated }: AICodeAssistantProps) {
  const { t } = useLocale()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<CodeGenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"generate" | "improve" | "explain" | "fix">("generate")
  const [generator] = useState(() => new AICodeGenerator())

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const request: CodeGenerationRequest = {
        prompt,
        language: currentLanguage,
        framework: currentLanguage === "react" ? "React" : undefined,
        context: currentCode ? `当前代码:\n${currentCode}` : undefined,
      }

      const generatedResult = await generator.generateCode(request)
      setResult(generatedResult)
      onCodeGenerated(generatedResult.code)
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
      const instruction = prompt || "优化代码性能和可读性"
      const improvedResult = await generator.improveCode(currentCode, currentLanguage, instruction)
      setResult(improvedResult)
      onCodeGenerated(improvedResult.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "改进失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExplain = async () => {
    if (!currentCode.trim()) {
      setError("请先输入代码")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const explanation = await generator.explainCode(currentCode, currentLanguage)
      setResult({
        code: currentCode,
        explanation,
        suggestions: [],
        language: currentLanguage,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "解释失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFix = async () => {
    if (!currentCode.trim()) {
      setError("请先输入代码")
      return
    }

    const errorMessage = prompt || "修复代码中的错误"
    setIsGenerating(true)
    setError(null)

    try {
      const fixedResult = await generator.fixCode(currentCode, currentLanguage, errorMessage)
      setResult(fixedResult)
      onCodeGenerated(fixedResult.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : "修复失败")
    } finally {
      setIsGenerating(false)
    }
  }

  const tabs = [
    { id: "generate" as const, label: "生成代码", icon: Sparkles, action: handleGenerate },
    { id: "improve" as const, label: "改进代码", icon: Wand2, action: handleImprove },
    { id: "explain" as const, label: "解释代码", icon: MessageSquare, action: handleExplain },
    { id: "fix" as const, label: "修复错误", icon: Bug, action: handleFix },
  ]

  const activeAction = tabs.find((t) => t.id === activeTab)?.action

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">AI 代码助手</span>
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
        {/* 输入区 */}
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              activeTab === "generate"
                ? "描述你想要生成的代码...\n例如: 创建一个带有表单验证的登录组件"
                : activeTab === "improve"
                  ? "描述如何改进代码...\n例如: 添加错误处理和性能优化"
                  : activeTab === "explain"
                    ? "留空以解释整个代码,或指定要解释的部分"
                    : "描述遇到的错误或问题..."
            }
            className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            rows={4}
            disabled={isGenerating}
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              {activeTab === "generate" && "描述你的需求,AI 将生成完整代码"}
              {activeTab === "improve" && "基于当前代码进行优化改进"}
              {activeTab === "explain" && "解释当前代码的功能和逻辑"}
              {activeTab === "fix" && "自动检测并修复代码错误"}
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* 说明 */}
              {result.explanation && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <MessageSquare className="h-4 w-4" />
                    说明
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{result.explanation}</p>
                </div>
              )}

              {/* 建议 */}
              {result.suggestions.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <Lightbulb className="h-4 w-4" />
                    优化建议
                  </div>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="text-purple-600">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 成功提示 */}
              {activeTab !== "explain" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
                  代码已更新到编辑器,请在预览窗口查看效果
                </div>
              )}
            </div>
          )}

          {!error && !result && !isGenerating && (
            <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
              <div>
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                <p>输入需求后点击执行按钮</p>
                <p className="mt-1 text-xs">AI 将帮助你生成或优化代码</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
