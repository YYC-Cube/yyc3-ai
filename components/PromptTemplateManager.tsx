// 提示词模板管理器组件
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Star, Copy, Trash2, Download, Upload, Sparkles, TrendingUp, BookOpen } from "lucide-react"
import {
  promptEngineeringManager,
  type PromptTemplate,
  type PromptCategory,
  type PromptRecommendation,
} from "@/lib/prompt-engineering"
import { useLocale } from "@/contexts/LocaleContext"
import WorkflowPanel from "@/components/WorkflowPanel" // Import the WorkflowPanel component

export default function PromptTemplateManager() {
  const { t } = useLocale()
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [filledPrompt, setFilledPrompt] = useState("")
  const [recommendations, setRecommendations] = useState<PromptRecommendation[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadTemplates()
    loadStatistics()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, selectedCategory, searchQuery])

  const loadTemplates = () => {
    const allTemplates = promptEngineeringManager.getAllTemplates()
    setTemplates(allTemplates)
  }

  const loadStatistics = () => {
    const stats = promptEngineeringManager.getStatistics()
    setStatistics(stats)
  }

  const filterTemplates = () => {
    let filtered = templates

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = promptEngineeringManager.searchTemplates(searchQuery)
    }

    setFilteredTemplates(filtered)
  }

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    const initialVars: Record<string, string> = {}
    template.variables.forEach((v) => {
      initialVars[v.name] = v.default || ""
    })
    setTemplateVariables(initialVars)
    setFilledPrompt("")
  }

  const handleVariableChange = (name: string, value: string) => {
    setTemplateVariables((prev) => ({ ...prev, [name]: value }))
  }

  const handleFillTemplate = () => {
    if (!selectedTemplate) return

    try {
      const filled = promptEngineeringManager.fillTemplate(selectedTemplate.id, templateVariables)
      setFilledPrompt(filled)
      loadStatistics()
    } catch (error) {
      console.error("填充模板失败:", error)
    }
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(filledPrompt)
    } catch (error) {
      console.error("复制失败:", error)
    }
  }

  const handleRecommend = () => {
    if (!searchQuery) return

    const recs = promptEngineeringManager.recommendTemplates(searchQuery)
    setRecommendations(recs)
  }

  const handleRateTemplate = (id: string, rating: number) => {
    promptEngineeringManager.rateTemplate(id, rating)
    loadTemplates()
    loadStatistics()
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm("确定要删除这个模板吗?")) {
      promptEngineeringManager.deleteTemplate(id)
      loadTemplates()
      loadStatistics()
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }
    }
  }

  const handleExportTemplate = (id: string) => {
    try {
      const json = promptEngineeringManager.exportTemplate(id)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prompt-template-${id}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("导出失败:", error)
    }
  }

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        promptEngineeringManager.importTemplate(json)
        loadTemplates()
        loadStatistics()
      } catch (error) {
        console.error("导入失败:", error)
      }
    }
    reader.readAsText(file)
  }

  const categories: { value: PromptCategory | "all"; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "code-generation", label: "代码生成" },
    { value: "code-review", label: "代码审查" },
    { value: "debugging", label: "调试" },
    { value: "refactoring", label: "重构" },
    { value: "documentation", label: "文档" },
    { value: "testing", label: "测试" },
    { value: "optimization", label: "优化" },
    { value: "learning", label: "学习" },
    { value: "general", label: "通用" },
  ]

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">提示词工程</h3>
          {statistics && (
            <Badge variant="outline" className="text-xs">
              {statistics.totalTemplates} 个模板
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" id="import-template" />
          <Button size="sm" variant="outline" onClick={() => document.getElementById("import-template")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                新建模板
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建自定义模板</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-zinc-500">自定义模板功能开发中...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="templates">模板库</TabsTrigger>
            <TabsTrigger value="recommend">智能推荐</TabsTrigger>
            <TabsTrigger value="workflow">工作流</TabsTrigger>
            <TabsTrigger value="statistics">统计</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 overflow-hidden flex gap-4 p-4">
            {/* 左侧:模板列表 */}
            <div className="w-1/3 flex flex-col gap-4">
              {/* 搜索和筛选 */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="搜索模板..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 模板列表 */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <div className="flex items-center gap-1">
                        {template.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            自定义
                          </Badge>
                        )}
                        <div className="flex items-center text-xs text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="ml-0.5">{template.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.usageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          使用 {template.usageCount} 次
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* 右侧:模板详情和填充 */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {!selectedTemplate ? (
                <div className="h-full flex items-center justify-center text-zinc-400">
                  <div className="text-center">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>选择一个模板开始使用</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* 模板信息 */}
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{selectedTemplate.name}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedTemplate.description}</p>
                      </div>
                      <div className="flex gap-1">
                        {selectedTemplate.isCustom && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleExportTemplate(selectedTemplate.id)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(selectedTemplate.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">评分:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRateTemplate(selectedTemplate.id, rating)}
                          className="text-yellow-500 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-4 w-4 ${rating <= selectedTemplate.rating ? "fill-current" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* 变量输入 */}
                  <Card className="p-4">
                    <h4 className="text-sm font-semibold mb-3">填写变量</h4>
                    <div className="space-y-3">
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable.name}>
                          <Label className="text-xs">
                            {variable.description}
                            {variable.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {variable.type === "select" ? (
                            <Select
                              value={templateVariables[variable.name]}
                              onValueChange={(v) => handleVariableChange(variable.name, v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {variable.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : variable.type === "multiline" ? (
                            <Textarea
                              value={templateVariables[variable.name]}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              placeholder={variable.description}
                              className="mt-1"
                              rows={3}
                            />
                          ) : (
                            <Input
                              type={variable.type === "number" ? "number" : "text"}
                              value={templateVariables[variable.name]}
                              onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                              placeholder={variable.description}
                              className="mt-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleFillTemplate} className="w-full mt-4">
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成提示词
                    </Button>
                  </Card>

                  {/* 生成的提示词 */}
                  {filledPrompt && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold">生成的提示词</h4>
                        <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </Button>
                      </div>
                      <pre className="text-sm bg-zinc-50 dark:bg-zinc-800 p-3 rounded whitespace-pre-wrap">
                        {filledPrompt}
                      </pre>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommend" className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">智能推荐</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                输入您的需求,AI 将为您推荐最合适的提示词模板
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="例如: 我想生成一个排序算法..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
                />
                <Button onClick={handleRecommend}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  推荐
                </Button>
              </div>
            </Card>

            {recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">推荐结果</h4>
                {recommendations.map((rec, index) => (
                  <Card key={rec.template.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <h5 className="font-medium text-sm">{rec.template.name}</h5>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                        <TrendingUp className="h-3 w-3" />
                        相关度 {rec.relevance}%
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{rec.template.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-500">推荐理由: {rec.reason}</p>
                      <Button size="sm" variant="outline" onClick={() => handleSelectTemplate(rec.template)}>
                        使用模板
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="workflow" className="flex-1 overflow-y-auto p-4">
            <WorkflowPanel />
          </TabsContent>

          <TabsContent value="statistics" className="flex-1 overflow-y-auto p-4">
            {statistics && (
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-3">总体统计</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{statistics.totalTemplates}</div>
                      <div className="text-xs text-zinc-500">总模板数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{statistics.totalUsage}</div>
                      <div className="text-xs text-zinc-500">总使用次数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{statistics.customTemplates}</div>
                      <div className="text-xs text-zinc-500">自定义模板</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{statistics.averageRating.toFixed(1)}</div>
                      <div className="text-xs text-zinc-500">平均评分</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="text-sm font-semibold mb-3">分类统计</h4>
                  <div className="space-y-2">
                    {Object.entries(statistics.categoryCounts).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {categories.find((c) => c.value === category)?.label || category}
                        </span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
