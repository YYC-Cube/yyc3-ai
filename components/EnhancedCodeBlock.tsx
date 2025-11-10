"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Copy, Play, Download, Maximize2 } from "lucide-react"
import CodeHighlight from "./CodeHighlight"

interface EnhancedCodeBlockProps {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
  onRun?: () => void
}

export default function EnhancedCodeBlock({
  code,
  language,
  filename,
  showLineNumbers = true,
  onRun,
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || `code.${language}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden ${
        isFullscreen ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* 代码块工具栏 */}
      <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{language}</span>
          {filename && <span className="text-xs text-zinc-500 dark:text-zinc-500">{filename}</span>}
        </div>

        <div className="flex items-center gap-1">
          {onRun && (
            <button
              onClick={onRun}
              className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="运行代码"
            >
              <Play className="h-4 w-4 text-green-600 dark:text-green-500" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="复制代码"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="下载代码"
          >
            <Download className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="全屏查看"
          >
            <Maximize2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      <div className={`overflow-auto ${isFullscreen ? "h-[calc(100%-48px)]" : "max-h-96"}`}>
        <CodeHighlight code={code} language={language} showLineNumbers={showLineNumbers} />
      </div>
    </motion.div>
  )
}
