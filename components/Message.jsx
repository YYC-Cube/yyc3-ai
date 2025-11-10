"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { cls } from "./utils"
import EnhancedCodeBlock from "./EnhancedCodeBlock"
import { TypewriterEffect } from "@/lib/typewriter"

export default function Message({ role, children, isTyping = false, emotion }) {
  const isUser = role === "user"
  const [displayText, setDisplayText] = useState(isTyping ? "" : children)
  const [isComplete, setIsComplete] = useState(!isTyping)
  const rafRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    console.log("[v0] Message component mounted:", { role, children, isTyping })

    // 如果不是打字机模式，直接显示内容
    if (!isTyping) {
      setDisplayText(children)
      setIsComplete(true)
      return
    }

    // 如果内容为空，也直接完成
    if (!children || typeof children !== "string") {
      setDisplayText(children || "")
      setIsComplete(true)
      return
    }

    const typewriter = new TypewriterEffect({
      text: children,
      speed: 30,
      onUpdate: (text) => {
        // 使用RAF批量更新DOM，避免触发ResizeObserver错误
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(() => {
          setDisplayText(text)
        })
      },
      onComplete: () => {
        console.log("[v0] Typewriter complete")
        setIsComplete(true)
      },
    })

    typewriter.start()

    return () => {
      typewriter.stop()
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [children, isTyping])

  const contentParts = useMemo(() => {
    const parseContent = (text) => {
      if (typeof text !== "string") return [{ type: "text", content: text }]

      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      const parts = []
      let lastIndex = 0
      let match

      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: text.slice(lastIndex, match.index),
          })
        }

        parts.push({
          type: "code",
          language: match[1] || "text",
          content: match[2].trim(),
        })

        lastIndex = match.index + match[0].length
      }

      if (lastIndex < text.length) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex),
        })
      }

      return parts.length > 0 ? parts : [{ type: "text", content: text }]
    }

    return parseContent(displayText)
  }, [displayText])

  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")} ref={containerRef}>
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
          AI
        </div>
      )}
      <div
        className={cls(
          "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
          isUser
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700",
        )}
      >
        {!isUser && emotion && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{emotion.message}</span>
          </div>
        )}

        <div className="space-y-3 text-base font-medium">
          {contentParts.map((part, index) => (
            <div key={index}>
              {part.type === "text" && part.content && (
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{part.content}</div>
              )}
              {part.type === "code" && (
                <div className="my-2">
                  <EnhancedCodeBlock code={part.content} language={part.language} />
                </div>
              )}
            </div>
          ))}

          {isTyping && !isComplete && (
            <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />
          )}
        </div>
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
          你
        </div>
      )}
    </div>
  )
}
