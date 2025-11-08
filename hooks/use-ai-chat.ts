"use client"

// AI聊天自定义Hook
import { useState, useCallback, useRef, useEffect } from "react"
import type { AIMessage, AIProvider } from "@/types/ai"
import unifiedAI from "@/lib/unified-ai-service"

interface UseAIChatOptions {
  provider?: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
  onError?: (error: Error) => void
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: AIMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const response = await unifiedAI.chat([...messages, userMessage], {
          provider: options.provider,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        })

        const assistantMessage: AIMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: "assistant",
          content: response.content,
          timestamp: Date.now(),
          tokens: response.usage.totalTokens,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        const error = err as Error
        setError(error)
        options.onError?.(error)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, options],
  )

  // 流式发送消息
  const sendMessageStream = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: AIMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsStreaming(true)
      setError(null)

      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        const stream = unifiedAI.stream([...messages, userMessage], {
          provider: options.provider,
          model: options.model,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        })

        for await (const chunk of stream) {
          if (chunk.isComplete) break

          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg.role === "assistant") {
              lastMsg.content += chunk.content
            }
            return updated
          })
        }
      } catch (err) {
        const error = err as Error
        setError(error)
        options.onError?.(error)
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, options],
  )

  // 清除对话
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  // 删除消息
  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }, [])

  // 停止生成
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    sendMessageStream,
    clearMessages,
    deleteMessage,
    stopGeneration,
  }
}
