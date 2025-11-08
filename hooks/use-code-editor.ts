"use client"

// 代码编辑器自定义Hook
import { useState, useCallback, useRef } from "react"

export interface CodeEditorState {
  content: string
  language: string
  cursor: { line: number; column: number }
  selection: { start: number; end: number } | null
  isDirty: boolean
}

export function useCodeEditor(initialContent = "", initialLanguage = "typescript") {
  const [state, setState] = useState<CodeEditorState>({
    content: initialContent,
    language: initialLanguage,
    cursor: { line: 1, column: 1 },
    selection: null,
    isDirty: false,
  })

  const historyRef = useRef<string[]>([initialContent])
  const historyIndexRef = useRef(0)

  // 更新内容
  const updateContent = useCallback((newContent: string) => {
    setState((prev) => {
      if (prev.content === newContent) return prev

      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      historyRef.current.push(newContent)
      historyIndexRef.current = historyRef.current.length - 1

      return {
        ...prev,
        content: newContent,
        isDirty: true,
      }
    })
  }, [])

  // 撤销
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      const content = historyRef.current[historyIndexRef.current]
      setState((prev) => ({ ...prev, content, isDirty: true }))
    }
  }, [])

  // 重做
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      const content = historyRef.current[historyIndexRef.current]
      setState((prev) => ({ ...prev, content, isDirty: true }))
    }
  }, [])

  // 设置语言
  const setLanguage = useCallback((language: string) => {
    setState((prev) => ({ ...prev, language }))
  }, [])

  // 格式化代码
  const formatCode = useCallback(async () => {
    try {
      // 使用Prettier格式化（需要安装prettier）
      const prettier = await import("prettier/standalone")
      const plugins = await Promise.all([import("prettier/parser-typescript"), import("prettier/parser-babel")])

      const formatted = await prettier.format(state.content, {
        parser: state.language === "typescript" ? "typescript" : "babel",
        plugins,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
      })

      updateContent(formatted)
    } catch (error) {
      console.error("[v0] Error formatting code:", error)
    }
  }, [state.content, state.language, updateContent])

  // 保存
  const save = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }))
  }, [])

  // 重置
  const reset = useCallback(() => {
    setState({
      content: initialContent,
      language: initialLanguage,
      cursor: { line: 1, column: 1 },
      selection: null,
      isDirty: false,
    })
    historyRef.current = [initialContent]
    historyIndexRef.current = 0
  }, [initialContent, initialLanguage])

  return {
    ...state,
    updateContent,
    undo,
    redo,
    setLanguage,
    formatCode,
    save,
    reset,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
  }
}
