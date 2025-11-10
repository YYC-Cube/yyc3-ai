"use client"

import { useEffect, useRef } from "react"

interface CodeHighlightProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

// 简单的语法高亮规则
const highlightRules: Record<string, Array<{ pattern: RegExp; className: string }>> = {
  javascript: [
    {
      pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await)\b/g,
      className: "text-purple-500",
    },
    { pattern: /(["'`])(.*?)\1/g, className: "text-green-600" },
    { pattern: /\/\/.*/g, className: "text-gray-500 italic" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
    { pattern: /\b(\d+)\b/g, className: "text-blue-500" },
  ],
  typescript: [
    {
      pattern:
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|interface|type|enum)\b/g,
      className: "text-purple-500",
    },
    { pattern: /(["'`])(.*?)\1/g, className: "text-green-600" },
    { pattern: /\/\/.*/g, className: "text-gray-500 italic" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
    { pattern: /\b(\d+)\b/g, className: "text-blue-500" },
  ],
  python: [
    {
      pattern: /\b(def|class|import|from|return|if|else|elif|for|while|try|except|with|as|lambda|yield)\b/g,
      className: "text-purple-500",
    },
    { pattern: /(["'])(.*?)\1/g, className: "text-green-600" },
    { pattern: /#.*/g, className: "text-gray-500 italic" },
    { pattern: /\b(\d+)\b/g, className: "text-blue-500" },
  ],
  html: [
    { pattern: /(&lt;\/?)(\w+)([^&gt;]*?)(&gt;)/g, className: "text-blue-600" },
    { pattern: /(["'])(.*?)\1/g, className: "text-green-600" },
  ],
  css: [
    { pattern: /([.#][\w-]+)/g, className: "text-yellow-600" },
    { pattern: /([\w-]+):/g, className: "text-blue-500" },
    { pattern: /(["'])(.*?)\1/g, className: "text-green-600" },
  ],
}

export default function CodeHighlight({ code, language, showLineNumbers = true }: CodeHighlightProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!codeRef.current) return

    const rules = highlightRules[language.toLowerCase()] || []
    let highlightedCode = code

    // 转义 HTML
    highlightedCode = highlightedCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")

    // 应用高亮规则
    rules.forEach(({ pattern, className }) => {
      highlightedCode = highlightedCode.replace(pattern, (match) => {
        return `<span class="${className}">${match}</span>`
      })
    })

    codeRef.current.innerHTML = highlightedCode
  }, [code, language])

  const lines = code.split("\n")

  return (
    <div className="relative">
      <pre className="overflow-x-auto bg-zinc-900 dark:bg-zinc-950 rounded-lg p-4 text-sm">
        <code ref={codeRef} className="block font-mono text-zinc-100">
          {code}
        </code>
      </pre>
      {showLineNumbers && (
        <div className="absolute left-0 top-0 bottom-0 flex flex-col text-xs text-zinc-500 select-none pointer-events-none px-2 py-4">
          {lines.map((_, i) => (
            <span key={i} className="leading-[1.5rem]">
              {i + 1}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
