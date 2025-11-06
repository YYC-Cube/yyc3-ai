// UI 库选择器组件
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Palette, Star, ExternalLink, Copy, Check } from "lucide-react"
import { templateLibraryManager, type UILibraryConfig, type UILibrary } from "@/lib/template-library"

interface UILibrarySelectorProps {
  framework?: "react" | "vue" | "html"
  onSelect?: (library: UILibrary) => void
}

export default function UILibrarySelector({ framework, onSelect }: UILibrarySelectorProps) {
  const [libraries, setLibraries] = useState<UILibraryConfig[]>(
    framework
      ? templateLibraryManager.getUILibrariesByFramework(framework)
      : templateLibraryManager.getAllUILibraries(),
  )
  const [selectedLibrary, setSelectedLibrary] = useState<UILibraryConfig | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "css" | "component" | "full">("all")
  const [copiedCommand, setCopiedCommand] = useState(false)

  const filteredLibraries = libraries.filter((lib) => {
    const matchesSearch =
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || lib.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectLibrary = (library: UILibraryConfig) => {
    setSelectedLibrary(library)
    setShowDetailDialog(true)
  }

  const handleCopyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedCommand(true)
      setTimeout(() => setCopiedCommand(false), 2000)
    } catch (error) {
      console.error("复制失败:", error)
    }
  }

  const getCategoryLabel = (category: "css" | "component" | "full") => {
    const labels = {
      css: "CSS 框架",
      component: "组件库",
      full: "完整方案",
    }
    return labels[category]
  }

  const getCategoryColor = (category: "css" | "component" | "full") => {
    const colors = {
      css: "bg-blue-500",
      component: "bg-purple-500",
      full: "bg-green-500",
    }
    return colors[category]
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">UI 库选择器</h3>
          <Badge variant="outline" className="text-xs">
            {libraries.length} 个选项
          </Badge>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="搜索 UI 库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="component">组件</TabsTrigger>
            <TabsTrigger value="full">完整</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* UI 库列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLibraries.map((library) => (
            <Card
              key={library.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectLibrary(library)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold text-sm">{library.name}</h4>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span>{library.popularity}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{library.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${getCategoryColor(library.category)}`} />
                <span className="text-xs text-zinc-500">{getCategoryLabel(library.category)}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {library.framework.map((fw) => (
                  <Badge key={fw} variant="outline" className="text-xs">
                    {fw}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{library.features.length} 个特性</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onSelect) onSelect(library.id)
                  }}
                >
                  选择
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredLibraries.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <Palette className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>未找到匹配的 UI 库</p>
              <p className="text-sm mt-2">尝试调整搜索条件</p>
            </div>
          </div>
        )}
      </div>

      {/* UI 库详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              {selectedLibrary?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedLibrary && (
            <div className="space-y-6 mt-4">
              {/* 基本信息 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">描述</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedLibrary.description}</p>
              </div>

              {/* 支持框架 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">支持框架</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLibrary.framework.map((fw) => (
                    <Badge key={fw} variant="secondary">
                      {fw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 特性 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">主要特性</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedLibrary.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 安装命令 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">安装命令</h4>
                <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-xs">{selectedLibrary.installCommand}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCommand(selectedLibrary.installCommand)}
                    className="text-zinc-400 hover:text-zinc-100"
                  >
                    {copiedCommand ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* 配置步骤 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">配置步骤</h4>
                <ol className="space-y-2">
                  {selectedLibrary.setupSteps.map((step, index) => (
                    <li key={index} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                      <span className="font-semibold text-purple-500">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 文档链接 */}
              <div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={selectedLibrary.documentation} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    查看官方文档
                  </a>
                </Button>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (onSelect) onSelect(selectedLibrary.id)
                    setShowDetailDialog(false)
                  }}
                >
                  选择此 UI 库
                </Button>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
