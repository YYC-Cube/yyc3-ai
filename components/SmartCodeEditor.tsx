// 智能代码编辑器 - 集成AI补全功能
"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Play, Download, Copy, Check, Sparkles, Loader2 } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useLocale } from "@/contexts/LocaleContext"
import { type CodeFile, validateCode } from "@/lib/code-executor"
import { aiCodeCompletion, type CompletionResult } from "@/lib/ai-code-completion"

interface SmartCodeEditorProps {
  file?: CodeFile
  onChange: (content: string) => void
  onExecute?: () => void
  readOnly?: boolean
  enableAICompletion?: boolean
}

const DEFAULT_FILE: CodeFile = {
  name: "untitled.txt",
  language: "text",
  content: "",
}

export default function SmartCodeEditor({
  file,
  onChange,
  onExecute,
  readOnly = false,
  enableAICompletion = true,
}: SmartCodeEditorProps) {
  const { t } = useLocale()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({
    valid: true,
    errors: [],
  })
  const [completions, setCompletions] = useState<CompletionResult | null>(null)
  const [showCompletions, setShowCompletions] = useState(false)
  const [selectedCompletion, setSelectedCompletion] = useState(0)
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(false)

  const currentFile = file || DEFAULT_FILE

  useEffect(() => {
    const content = currentFile.content || ""
    const lines = content.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [currentFile.content])

  useEffect(() => {
    if (currentFile.language && currentFile.content) {
      const result = validateCode(currentFile.content, currentFile.language)
      setValidation(result)
    } else {
      setValidation({ valid: true, errors: [] })
    }
  }, [currentFile.content, currentFile.language])

  const requestCompletions = useCallback(
    async (cursorPosition: number) => {
      if (!enableAICompletion || !currentFile.content) return

      setIsLoadingCompletions(true)
      try {
        const result = await aiCodeCompletion.getCompletions({
          code: currentFile.content,
          cursorPosition,
          language: currentFile.language,
          context: {
            fileName: currentFile.name,
          },
        })

        if (result.completions.length > 0) {
          setCompletions(result)
          setShowCompletions(true)
          setSelectedCompletion(0)
        }
      } catch (error) {
        console.error("[v0] Completion request failed:", error)
      } finally {
        setIsLoadingCompletions(false)
      }
    },
    [enableAICompletion, currentFile.content, currentFile.language, currentFile.name],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("复制失败:", error)
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([currentFile.content || ""], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = currentFile.name || "code.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("下载失败:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab 键缩进
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const content = currentFile.content || ""
      const newContent = content.substring(0, start) + "  " + content.substring(end)
      onChange(newContent)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
      return
    }

    // Ctrl/Cmd + Enter 运行代码
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      onExecute?.()
      return
    }

    // Ctrl/Cmd + Space 触发补全
    if ((e.metaKey || e.ctrlKey) && e.key === " ") {
      e.preventDefault()
      const cursorPosition = e.currentTarget.selectionStart
      requestCompletions(cursorPosition)
      return
    }

    // 补全列表导航
    if (showCompletions && completions) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedCompletion((prev) => Math.min(prev + 1, completions.completions.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedCompletion((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        applyCompletion(selectedCompletion)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setShowCompletions(false)
        return
      }
    }
  }

  const applyCompletion = (index: number) => {
    if (!completions || !textareaRef.current) return

    const completion = completions.completions[index]
    const cursorPosition = textareaRef.current.selectionStart
    const content = currentFile.content || ""
    const newContent = content.substring(0, cursorPosition) + completion.insertText + content.substring(cursorPosition)

    onChange(newContent)
    setShowCompletions(false)

    // 设置新的光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + completion.insertText.length + (completion.cursorOffset || 0)
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPosition
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // 隐藏补全列表
    setShowCompletions(false)
  }

  const content = currentFile.content || ""

  return (
    <div className="relative flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {currentFile.name || "未命名文件"}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {currentFile.language || "text"}
          </span>
          {enableAICompletion && (
            <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Sparkles className="h-3 w-3" />
              AI 补全
            </span>
          )}
          {!validation.valid && <span className="text-xs text-red-500">{validation.errors.length} 个错误</span>}
        </div>
        <div className="flex items-center gap-1">
          {onExecute && (
            <button
              onClick={onExecute}
              disabled={!content.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              title="运行代码 (Cmd/Ctrl + Enter)"
            >
              <Play className="h-3.5 w-3.5" />
              运行
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!content}
            className="rounded-lg p-1.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800"
            title="复制代码"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            disabled={!content}
            className="rounded-lg p-1.5 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800"
            title="下载文件"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="relative flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={8} minSize={5} maxSize={15} className="overflow-hidden">
            <div className="flex h-full flex-col bg-zinc-50 px-2 py-3 text-right text-xs text-zinc-400 dark:bg-zinc-950">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-zinc-200 dark:bg-zinc-800" />

          <ResizablePanel defaultSize={92} minSize={85}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              readOnly={readOnly}
              className="h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-zinc-900 outline-none dark:text-zinc-100"
              spellCheck={false}
              placeholder="在此输入代码... (Ctrl/Cmd + Space 触发 AI 补全)"
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        {showCompletions && completions && (
          <div className="absolute left-20 top-12 z-50 w-96 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  AI 补全建议 (置信度: {completions.confidence}%)
                </span>
                <button
                  onClick={() => setShowCompletions(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ESC 关闭
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {completions.completions.map((completion, index) => (
                <button
                  key={index}
                  onClick={() => applyCompletion(index)}
                  className={`w-full border-b border-zinc-100 px-3 py-2 text-left transition-colors last:border-b-0 dark:border-zinc-700 ${
                    index === selectedCompletion
                      ? "bg-purple-50 dark:bg-purple-900/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{completion.text}</span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                          {completion.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{completion.description}</p>
                      <pre className="mt-1 overflow-x-auto rounded bg-zinc-50 p-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {completion.insertText.substring(0, 100)}
                        {completion.insertText.length > 100 && "..."}
                      </pre>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              ↑↓ 选择 • Enter/Tab 应用 • ESC 关闭
            </div>
          </div>
        )}

        {isLoadingCompletions && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            正在生成补全建议...
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {!validation.valid && validation.errors.length > 0 && (
        <div className="border-t border-zinc-200 bg-red-50 px-4 py-2 dark:border-zinc-800 dark:bg-red-950/20">
          {validation.errors.map((error, i) => (
            <div key={i} className="text-xs text-red-600 dark:text-red-400">
              • {error}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
