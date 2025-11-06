"use client"

import { useState, useEffect } from "react"
import { Search, Grid, List, Heart, Download, Copy, Eye, X } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { type Component, componentCategories, getComponentLibrary } from "@/lib/component-library"
import LivePreview from "./LivePreview"

interface ComponentBrowserProps {
  onSelectComponent?: (component: Component) => void
}

type ViewMode = "grid" | "list"
type SortBy = "popular" | "recent" | "name"

export default function ComponentBrowser({ onSelectComponent }: ComponentBrowserProps) {
  const { t } = useLocale()
  const [library] = useState(() => getComponentLibrary())
  const [components, setComponents] = useState<Component[]>([])
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("popular")
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadComponents()
  }, [])

  useEffect(() => {
    filterAndSortComponents()
  }, [components, selectedCategory, searchQuery, sortBy])

  const loadComponents = () => {
    const allComponents = library.getAllComponents()
    setComponents(allComponents)
  }

  const filterAndSortComponents = () => {
    let filtered = components

    // 按分类过滤
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.category === selectedCategory)
    }

    // 按搜索词过滤
    if (searchQuery.trim()) {
      filtered = library.searchComponents(searchQuery)
    }

    // 排序
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads
        case "recent":
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        case "name":
          return a.name.localeCompare(b.name, "zh-CN")
        default:
          return 0
      }
    })

    setFilteredComponents(filtered)
  }

  const handleCopyCode = async (component: Component) => {
    await navigator.clipboard.writeText(component.code)
    library.incrementDownloads(component.id)
    loadComponents()
  }

  const handleLike = (component: Component) => {
    library.toggleLike(component.id)
    loadComponents()
  }

  const handlePreview = (component: Component) => {
    setSelectedComponent(component)
    setShowPreview(true)
  }

  const handleUseComponent = (component: Component) => {
    onSelectComponent?.(component)
    library.incrementDownloads(component.id)
    loadComponents()
  }

  const categoriesWithCounts = componentCategories.map((cat) => ({
    ...cat,
    count: components.filter((c) => c.category === cat.id).length,
  }))

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">组件库</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {filteredComponents.length} 个组件
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 ${viewMode === "grid" ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-1.5 ${viewMode === "list" ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="popular">最受欢迎</option>
            <option value="recent">最近更新</option>
            <option value="name">按名称</option>
          </select>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索组件..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 分类侧边栏 */}
        <div className="w-48 border-r border-zinc-200 overflow-y-auto dark:border-zinc-800">
          <div className="p-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>全部组件</span>
                <span className="text-xs text-zinc-500">{components.length}</span>
              </div>
            </button>

            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

            {categoriesWithCounts.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <span className="text-xs text-zinc-500">{category.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 组件列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredComponents.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
              <div>
                <Search className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                <p>未找到匹配的组件</p>
                <p className="mt-1 text-xs">尝试其他搜索词或分类</p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  className="group rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{component.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{component.description}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {component.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {component.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {component.likes}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handlePreview(component)}
                      className="flex-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      <Eye className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyCode(component)}
                      className="flex-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      <Copy className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleLike(component)}
                      className="flex-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                      <Heart className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleUseComponent(component)}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                    >
                      使用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  className="group flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{component.name}</h3>
                      <div className="flex gap-1">
                        {component.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{component.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {component.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {component.likes}
                      </span>
                      <span>{component.author}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handlePreview(component)}
                      className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="预览"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyCode(component)}
                      className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="复制代码"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleLike(component)}
                      className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="点赞"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUseComponent(component)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      使用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 预览模态框 */}
      {showPreview && selectedComponent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="flex h-[80vh] w-full max-w-6xl flex-col rounded-lg bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{selectedComponent.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{selectedComponent.description}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/2 overflow-auto border-r border-zinc-200 p-6 dark:border-zinc-800">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">代码</h3>
                <pre className="rounded-lg bg-zinc-50 p-4 text-xs dark:bg-zinc-950">
                  <code>{selectedComponent.code}</code>
                </pre>
              </div>
              <div className="w-1/2 p-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">预览</h3>
                <LivePreview code={selectedComponent.code} language={selectedComponent.language} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
