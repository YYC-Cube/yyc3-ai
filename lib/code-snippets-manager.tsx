"use client"

interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  tags: string[]
  category: string
  framework?: string
  createdAt: number
  updatedAt: number
  usageCount: number
  isFavorite: boolean
}

interface SnippetCategory {
  id: string
  name: string
  icon: string
  count: number
}

export class CodeSnippetsManager {
  private snippets: Map<string, CodeSnippet> = new Map()
  private readonly STORAGE_KEY = "code-snippets"

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultSnippets()
  }

  // 添加代码片段
  addSnippet(snippet: Omit<CodeSnippet, "id" | "createdAt" | "updatedAt" | "usageCount">): CodeSnippet {
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
    }

    this.snippets.set(newSnippet.id, newSnippet)
    this.saveToStorage()
    return newSnippet
  }

  // 更新代码片段
  updateSnippet(id: string, updates: Partial<CodeSnippet>): CodeSnippet | null {
    const snippet = this.snippets.get(id)
    if (!snippet) return null

    const updated = {
      ...snippet,
      ...updates,
      updatedAt: Date.now(),
    }

    this.snippets.set(id, updated)
    this.saveToStorage()
    return updated
  }

  // 删除代码片段
  deleteSnippet(id: string): boolean {
    const deleted = this.snippets.delete(id)
    if (deleted) this.saveToStorage()
    return deleted
  }

  // 获取代码片段
  getSnippet(id: string): CodeSnippet | null {
    const snippet = this.snippets.get(id)
    if (snippet) {
      snippet.usageCount++
      snippet.updatedAt = Date.now()
      this.saveToStorage()
    }
    return snippet || null
  }

  // 搜索代码片段
  searchSnippets(query: string): CodeSnippet[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.snippets.values()).filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(lowerQuery) ||
        snippet.description.toLowerCase().includes(lowerQuery) ||
        snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        snippet.code.toLowerCase().includes(lowerQuery),
    )
  }

  // 按分类获取
  getByCategory(category: string): CodeSnippet[] {
    return Array.from(this.snippets.values()).filter((snippet) => snippet.category === category)
  }

  // 按语言获取
  getByLanguage(language: string): CodeSnippet[] {
    return Array.from(this.snippets.values()).filter((snippet) => snippet.language === language)
  }

  // 按标签获取
  getByTag(tag: string): CodeSnippet[] {
    return Array.from(this.snippets.values()).filter((snippet) => snippet.tags.includes(tag))
  }

  // 获取收藏的片段
  getFavorites(): CodeSnippet[] {
    return Array.from(this.snippets.values()).filter((snippet) => snippet.isFavorite)
  }

  // 获取最常用的片段
  getMostUsed(limit = 10): CodeSnippet[] {
    return Array.from(this.snippets.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  // 获取所有分类
  getCategories(): SnippetCategory[] {
    const categoriesMap = new Map<string, SnippetCategory>()

    Array.from(this.snippets.values()).forEach((snippet) => {
      if (!categoriesMap.has(snippet.category)) {
        categoriesMap.set(snippet.category, {
          id: snippet.category,
          name: snippet.category,
          icon: this.getCategoryIcon(snippet.category),
          count: 0,
        })
      }
      const cat = categoriesMap.get(snippet.category)!
      cat.count++
    })

    return Array.from(categoriesMap.values()).sort((a, b) => b.count - a.count)
  }

  // 获取所有标签
  getAllTags(): string[] {
    const tags = new Set<string>()
    Array.from(this.snippets.values()).forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  // 切换收藏
  toggleFavorite(id: string): boolean {
    const snippet = this.snippets.get(id)
    if (!snippet) return false

    snippet.isFavorite = !snippet.isFavorite
    this.saveToStorage()
    return snippet.isFavorite
  }

  // 导出所有片段
  exportAll(): string {
    const data = Array.from(this.snippets.values())
    return JSON.stringify(data, null, 2)
  }

  // 导入片段
  importSnippets(json: string): number {
    try {
      const imported = JSON.parse(json) as CodeSnippet[]
      let count = 0

      imported.forEach((snippet) => {
        snippet.id = this.generateId()
        this.snippets.set(snippet.id, snippet)
        count++
      })

      this.saveToStorage()
      return count
    } catch (error) {
      console.error("[v0] 导入代码片段失败:", error)
      return 0
    }
  }

  // 获取分类图标
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      组件: "🧩",
      钩子: "🪝",
      工具: "🔧",
      样式: "🎨",
      数据: "💾",
      网络: "🌐",
      算法: "🧮",
      其他: "📦",
    }
    return icons[category] || "📄"
  }

  // 初始化默认片段
  private initializeDefaultSnippets(): void {
    if (this.snippets.size > 0) return

    const defaults: Omit<CodeSnippet, "id" | "createdAt" | "updatedAt" | "usageCount">[] = [
      {
        title: "React 函数组件模板",
        description: "带 TypeScript 的基础 React 函数组件",
        language: "typescript",
        framework: "React",
        category: "组件",
        tags: ["react", "typescript", "component"],
        isFavorite: false,
        code: `interface Props {
  title: string
  onAction?: () => void
}

export default function Component({ title, onAction }: Props) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          执行操作
        </button>
      )}
    </div>
  )
}`,
      },
      {
        title: "useLocalStorage Hook",
        description: "本地存储状态管理钩子",
        language: "typescript",
        framework: "React",
        category: "钩子",
        tags: ["react", "hook", "localstorage"],
        isFavorite: false,
        code: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }, [key, value])

  return [value, setValue] as const
}`,
      },
      {
        title: "Fetch 包装器",
        description: "带错误处理和超时的 fetch 封装",
        language: "typescript",
        category: "网络",
        tags: ["fetch", "api", "typescript"],
        isFavorite: false,
        code: `interface FetchOptions extends RequestInit {
  timeout?: number
}

export async function fetchWithTimeout(url: string, options: FetchOptions = {}) {
  const { timeout = 5000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}`,
      },
    ]

    defaults.forEach((snippet) => this.addSnippet(snippet))
  }

  // 生成ID
  private generateId(): string {
    return `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 持久化存储
  private saveToStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = JSON.stringify(Array.from(this.snippets.entries()))
      localStorage.setItem(this.STORAGE_KEY, data)
    } catch (error) {
      console.error("[v0] 保存代码片段失败:", error)
    }
  }

  // 从存储加载
  private loadFromStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        const entries = JSON.parse(data) as [string, CodeSnippet][]
        this.snippets = new Map(entries)
      }
    } catch (error) {
      console.error("[v0] 加载代码片段失败:", error)
    }
  }
}

export const codeSnippetsManager = new CodeSnippetsManager()
