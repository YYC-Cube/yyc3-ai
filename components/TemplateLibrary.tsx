// 技术栈框架模板库组件
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Star, Code2, Sparkles, Layers, Zap, Copy } from "lucide-react"
import {
  templateLibraryManager,
  type FrameworkTemplate,
  type TemplateCategory,
  type TemplateComplexity,
  type TemplateCustomization,
} from "@/lib/template-library"

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<FrameworkTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<FrameworkTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all")
  const [selectedComplexity, setSelectedComplexity] = useState<TemplateComplexity | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<FrameworkTemplate | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [customization, setCustomization] = useState<TemplateCustomization>({
    selectedFeatures: [],
    projectName: "",
  })
  const [generatedPrompt, setGeneratedPrompt] = useState("")

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, selectedCategory, selectedComplexity, searchQuery])

  const loadTemplates = () => {
    const allTemplates = templateLibraryManager.getAllTemplates()
    setTemplates(allTemplates)
  }

  const filterTemplates = () => {
    let filtered = templates

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    if (selectedComplexity !== "all") {
      filtered = filtered.filter((t) => t.complexity === selectedComplexity)
    }

    if (searchQuery) {
      filtered = templateLibraryManager.searchTemplates(searchQuery)
    }

    setFilteredTemplates(filtered)
  }

  const handleSelectTemplate = (template: FrameworkTemplate) => {
    setSelectedTemplate(template)
    setCustomization({
      selectedFeatures: template.features.filter((f) => f.required).map((f) => f.id),
      projectName: "",
    })
    setShowDetailDialog(true)
  }

  const handleFeatureToggle = (featureId: string) => {
    setCustomization((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter((id) => id !== featureId)
        : [...prev.selectedFeatures, featureId],
    }))
  }

  const handleGeneratePrompt = () => {
    if (!selectedTemplate || !customization.projectName) {
      alert("请填写项目名称")
      return
    }

    const prompt = templateLibraryManager.generateAIPrompt(selectedTemplate, customization)
    setGeneratedPrompt(prompt)
    templateLibraryManager.incrementUsageCount(selectedTemplate.id)
    loadTemplates()
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      alert("提示词已复制到剪贴板")
    } catch (error) {
      console.error("复制失败:", error)
    }
  }

  const getCategoryLabel = (category: TemplateCategory | "all") => {
    const labels = {
      all: "全部",
      frontend: "前端",
      backend: "后端",
      fullstack: "全栈",
      mobile: "移动端",
      desktop: "桌面端",
      library: "库/工具",
    }
    return labels[category]
  }

  const getComplexityLabel = (complexity: TemplateComplexity | "all") => {
    const labels = {
      all: "全部难度",
      beginner: "初级",
      intermediate: "中级",
      advanced: "高级",
    }
    return labels[complexity]
  }

  const getComplexityColor = (complexity: TemplateComplexity) => {
    const colors = {
      beginner: "bg-green-500",
      intermediate: "bg-yellow-500",
      advanced: "bg-red-500",
    }
    return colors[complexity]
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">技术栈框架模板库</h3>
          <Badge variant="outline" className="text-xs">
            {templates.length} 个模板
          </Badge>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左侧筛选栏 */}
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-4 overflow-y-auto">
          <div>
            <Label className="text-xs font-semibold mb-2 block">搜索</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">分类</Label>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="frontend">前端</SelectItem>
                <SelectItem value="backend">后端</SelectItem>
                <SelectItem value="fullstack">全栈</SelectItem>
                <SelectItem value="mobile">移动端</SelectItem>
                <SelectItem value="desktop">桌面端</SelectItem>
                <SelectItem value="library">库/工具</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">难度</Label>
            <Select value={selectedComplexity} onValueChange={(v) => setSelectedComplexity(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部难度</SelectItem>
                <SelectItem value="beginner">初级</SelectItem>
                <SelectItem value="intermediate">中级</SelectItem>
                <SelectItem value="advanced">高级</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Label className="text-xs font-semibold mb-2 block">AI 推荐</Label>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <Sparkles className="h-4 w-4 mr-2" />
              获取推荐
            </Button>
          </div>
        </div>

        {/* 右侧模板列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{template.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{template.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full ${getComplexityColor(template.complexity)}`} />
                  <span className="text-xs text-zinc-500">{getComplexityLabel(template.complexity)}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {template.technology.frontend?.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>使用 {template.usageCount} 次</span>
                  <span>{template.features.length} 个功能</span>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="h-full flex items-center justify-center text-zinc-400">
              <div className="text-center">
                <Layers className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>未找到匹配的模板</p>
                <p className="text-sm mt-2">尝试调整筛选条件</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 模板详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-500" />
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList>
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="features">功能定制</TabsTrigger>
                <TabsTrigger value="setup">安装步骤</TabsTrigger>
                <TabsTrigger value="ai">AI 生成</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">描述</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedTemplate.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">技术栈</h4>
                  <div className="space-y-2">
                    {selectedTemplate.technology.frontend && (
                      <div>
                        <span className="text-xs text-zinc-500">前端：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.technology.frontend.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTemplate.technology.backend && (
                      <div>
                        <span className="text-xs text-zinc-500">后端：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.technology.backend.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">最佳实践</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.bestPractices.map((practice, index) => (
                      <li key={index} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                        <Zap className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">项目名称</Label>
                  <Input
                    placeholder="my-project"
                    value={customization.projectName}
                    onChange={(e) => setCustomization({ ...customization, projectName: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">选择功能模块</Label>
                  <div className="space-y-2">
                    {selectedTemplate.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-2">
                        <Checkbox
                          id={feature.id}
                          checked={customization.selectedFeatures.includes(feature.id)}
                          onCheckedChange={() => handleFeatureToggle(feature.id)}
                          disabled={feature.required}
                        />
                        <div className="flex-1">
                          <Label htmlFor={feature.id} className="text-sm font-medium cursor-pointer">
                            {feature.name}
                            {feature.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <p className="text-xs text-zinc-500">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="setup" className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">安装命令</h4>
                  <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg text-xs font-mono space-y-2">
                    {selectedTemplate.setupCommands.map((cmd, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-zinc-500">$</span>
                        <span>{cmd}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">主要依赖</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.dependencies.slice(0, 6).map((dep) => (
                      <div key={dep.name} className="text-xs bg-zinc-50 dark:bg-zinc-800 p-2 rounded">
                        <span className="font-medium">{dep.name}</span>
                        <span className="text-zinc-500 ml-2">{dep.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                {!generatedPrompt ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold mb-1">AI 辅助生成</h4>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            根据您选择的功能模块和定制选项,生成完整的 AI 提示词,用于生成项目代码
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleGeneratePrompt} className="w-full" disabled={!customization.projectName}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成 AI 提示词
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold">生成的提示词</h4>
                      <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
                        <Copy className="h-4 w-4 mr-2" />
                        复制
                      </Button>
                    </div>
                    <pre className="text-xs bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {generatedPrompt}
                    </pre>
                    <p className="text-xs text-zinc-500">将此提示词复制到 AI 对话中,即可生成完整的项目代码</p>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
