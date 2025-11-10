"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Play, Download, Copy, Check } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useLocale } from "@/contexts/LocaleContext"
import { type CodeFile, validateCode } from "@/lib/code-executor"

interface CodeEditorProps {
  file?: CodeFile
  value?: string
  language?: string
  onChange: (content: string) => void
  onLanguageChange?: (language: string) => void
  onExecute?: () => void
  readOnly?: boolean
}

export default function CodeEditor({
  file,
  value,
  language: propLanguage,
  onChange,
  onLanguageChange,
  onExecute,
  readOnly = false,
}: CodeEditorProps) {
  const { t } = useLocale()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] }>({
    valid: true,
    errors: [],
  })

  const currentContent = file?.content ?? value ?? ""
  const currentLanguage = file?.language ?? propLanguage ?? "text"
  const currentName = file?.name ?? "untitled.txt"

  useEffect(() => {
    const lines = currentContent.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [currentContent])

  useEffect(() => {
    if (currentLanguage && currentContent) {
      const result = validateCode(currentContent, currentLanguage)
      setValidation(result)
    } else {
      setValidation({ valid: true, errors: [] })
    }
  }, [currentContent, currentLanguage])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] 复制失败:", error)
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([currentContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = currentName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] 下载失败:", error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newContent = currentContent.substring(0, start) + "  " + currentContent.substring(end)
      onChange(newContent)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      if (onExecute) {
        onExecute()
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      console.log("[v0] 保存触发")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{currentName}</span>
          {onLanguageChange && (
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-none outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
            </select>
          )}
          {!onLanguageChange && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {currentLanguage}
            </span>
          )}
          {!validation.valid && <span className="text-xs text-red-500">{validation.errors.length} 个错误</span>}
        </div>
        <div className="flex items-center gap-1">
          {onExecute && (
            <button
              onClick={onExecute}
              disabled={!currentContent.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
              title="运行代码 (Cmd/Ctrl + Enter)"
            >
              <Play className="h-3.5 w-3.5" />
              运行
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={!currentContent}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="复制代码"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-blue-800" />}
          </button>
          <button
            onClick={handleDownload}
            disabled={!currentContent}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="下载文件"
          >
            <Download className="h-4 w-4 text-blue-700" />
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 overflow-hidden">
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
              value={currentContent}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              readOnly={readOnly}
              className="h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-zinc-900 outline-none dark:text-zinc-100"
              spellCheck={false}
              placeholder="在此输入代码..."
            />
          </ResizablePanel>
        </ResizablePanelGroup>
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
