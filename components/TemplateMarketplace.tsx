"use client"

import { useState, useEffect } from "react"
import { Search, Download, Star, Share2, Heart, Filter, Clock, Upload, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface Template {
  id: string
  name: string
  description: string
  code: string
  author: string
  category: string
  tags: string[]
  downloads: number
  rating: number
  ratingCount: number
  version: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  language: string
}

export default function TemplateMarketplace() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "rating">("popular")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [userTemplates, setUserTemplates] = useState<Template[]>([])

  useEffect(() => {
    const savedTemplates = localStorage.getItem("yyc3_template_marketplace")
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    } else {
      // 初始化示例模板
      const initialTemplates: Template[] = [
        {
          id: "1",
          name: "React Todo App",
          description: "完整的待办事项应用,包含增删改查功能",
          code: `import { useState } from 'react'

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }])
      setInput('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">待办事项</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={addTodo} className="px-4 py-2 bg-blue-600 text-white rounded">
          添加
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 p-2 border rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}`,
          author: "YYC³ Team",
          category: "React",
          tags: ["React", "Hooks", "状态管理"],
          downloads: 1234,
          rating: 4.8,
          ratingCount: 156,
          version: "1.0.0",
          createdAt: "2024-01-15",
          updatedAt: "2024-01-20",
          isFavorite: false,
          language: "TypeScript",
        },
        {
          id: "2",
          name: "Next.js API Route",
          description: "RESTful API路由模板,包含错误处理和验证",
          code: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    // 模拟数据库查询
    const data = { id, name: 'Example', createdAt: new Date().toISOString() }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证数据
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // 模拟数据库插入
    const data = { id: Date.now(), ...body, createdAt: new Date().toISOString() }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}`,
          author: "YYC³ Team",
          category: "Next.js",
          tags: ["Next.js", "API", "服务端"],
          downloads: 892,
          rating: 4.9,
          ratingCount: 98,
          version: "1.0.0",
          createdAt: "2024-01-18",
          updatedAt: "2024-01-18",
          isFavorite: false,
          language: "TypeScript",
        },
        {
          id: "3",
          name: "Custom Hook - useLocalStorage",
          description: "localStorage持久化Hook,带自动序列化",
          code: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing localStorage:', error)
    }
  }, [key, value])

  return [value, setValue] as const
}

// 使用示例
function App() {
  const [name, setName] = useLocalStorage('username', '')

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="输入用户名"
    />
  )
}`,
          author: "Community",
          category: "Hooks",
          tags: ["React", "Hooks", "存储"],
          downloads: 2156,
          rating: 5.0,
          ratingCount: 234,
          version: "1.0.0",
          createdAt: "2024-01-10",
          updatedAt: "2024-01-22",
          isFavorite: true,
          language: "TypeScript",
        },
      ]
      setTemplates(initialTemplates)
      localStorage.setItem("yyc3_template_marketplace", JSON.stringify(initialTemplates))
    }

    const savedUserTemplates = localStorage.getItem("yyc3_user_templates")
    if (savedUserTemplates) {
      setUserTemplates(JSON.parse(savedUserTemplates))
    }
  }, [])

  const filteredTemplates = templates
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads
        case "recent":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

  const downloadTemplate = (template: Template) => {
    const blob = new Blob([template.code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.name.replace(/\s+/g, "-")}.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // 更新下载次数
    setTemplates(templates.map((t) => (t.id === template.id ? { ...t, downloads: t.downloads + 1 } : t)))
  }

  const toggleFavorite = (templateId: string) => {
    setTemplates(templates.map((t) => (t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t)))
  }

  const rateTemplate = (templateId: string, rating: number) => {
    setTemplates(
      templates.map((t) => {
        if (t.id === templateId) {
          const newRatingCount = t.ratingCount + 1
          const newRating = (t.rating * t.ratingCount + rating) / newRatingCount
          return { ...t, rating: newRating, ratingCount: newRatingCount }
        }
        return t
      }),
    )
  }

  const shareTemplate = async (template: Template) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.name,
          text: template.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("分享取消")
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert("链接已复制到剪贴板")
    }
  }

  const uploadTemplate = (templateData: Partial<Template>) => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateData.name || "新模板",
      description: templateData.description || "",
      code: templateData.code || "",
      author: "You",
      category: templateData.category || "Other",
      tags: templateData.tags || [],
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      language: templateData.language || "TypeScript",
    }

    setUserTemplates([...userTemplates, newTemplate])
    localStorage.setItem("yyc3_user_templates", JSON.stringify([...userTemplates, newTemplate]))
    setShowUploadDialog(false)
  }

  const categories = ["all", "React", "Next.js", "Hooks", "API", "Components", "Utils"]

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* 头部搜索栏 */}
      <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
        <h1 className="mb-4 text-2xl font-bold">模板市场</h1>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板、标签..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            上传模板
          </button>
        </div>

        {/* 分类和排序 */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat === "all" ? "全部" : cat}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <option value="popular">最受欢迎</option>
              <option value="recent">最新更新</option>
              <option value="rating">最高评分</option>
            </select>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList>
            <TabsTrigger value="marketplace">市场模板 ({filteredTemplates.length})</TabsTrigger>
            <TabsTrigger value="myTemplates">我的模板 ({userTemplates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group rounded-lg border border-zinc-200 p-4 transition-all hover:border-blue-500 hover:shadow-lg dark:border-zinc-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">by {template.author}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Heart
                        className={`h-4 w-4 ${template.isFavorite ? "fill-red-500 text-red-500" : "text-zinc-400"}`}
                      />
                    </button>
                  </div>

                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{template.description}</p>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-3 flex items-center gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {template.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {template.rating.toFixed(1)} ({template.ratingCount})
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="flex-1 rounded-lg bg-zinc-100 py-2 text-sm font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => downloadTemplate(template)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => shareTemplate(template)}
                      className="rounded-lg bg-zinc-100 px-4 py-2 text-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="myTemplates" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userTemplates.map((template) => (
                <div key={template.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">by {template.author}</p>
                    </div>
                    <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <Edit className="h-4 w-4 text-zinc-400" />
                    </button>
                  </div>
                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{template.description}</p>
                  <button
                    onClick={() => downloadTemplate(template)}
                    className="w-full rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    下载
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 模板详情对话框 */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTemplate.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedTemplate.description}</p>
                  <p className="mt-2 text-xs text-zinc-500">作者: {selectedTemplate.author}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-zinc-100 px-3 py-1 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-lg bg-zinc-900 p-4">
                  <pre className="overflow-x-auto text-sm text-zinc-100">
                    <code>{selectedTemplate.code}</code>
                  </pre>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadTemplate(selectedTemplate)}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    <Download className="mx-auto h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTemplate.code)
                      alert("代码已复制到剪贴板")
                    }}
                    className="flex-1 rounded-lg bg-zinc-100 py-2 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    复制代码
                  </button>
                </div>

                {/* 评分系统 */}
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <h4 className="mb-2 font-medium">为这个模板评分</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => rateTemplate(selectedTemplate.id, star)}
                        className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= selectedTemplate.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 上传模板对话框 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>上传新模板</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              uploadTemplate({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                code: formData.get("code") as string,
                category: formData.get("category") as string,
                tags: (formData.get("tags") as string).split(",").map((t) => t.trim()),
                language: formData.get("language") as string,
              })
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">模板名称</label>
              <input
                name="name"
                required
                placeholder="输入模板名称"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">描述</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="描述模板的功能和用途"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">分类</label>
                <select
                  name="category"
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {categories
                    .filter((c) => c !== "all")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">语言</label>
                <select
                  name="language"
                  required
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">标签 (用逗号分隔)</label>
              <input
                name="tags"
                placeholder="React, Hooks, 组件"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">代码</label>
              <textarea
                name="code"
                required
                rows={12}
                placeholder="粘贴您的代码..."
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700">
                上传模板
              </button>
              <button
                type="button"
                onClick={() => setShowUploadDialog(false)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                取消
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
