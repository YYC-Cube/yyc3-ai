"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Sparkles,
  Search,
  Plus,
  Copy,
  Check,
  Download,
  Upload,
  Star,
  TrendingUp,
  Folder,
  GitBranch,
} from "lucide-react"

interface PromptTemplate {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  version: string
  rating: number
  downloads: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  versions: PromptVersion[]
}

interface PromptVersion {
  version: string
  content: string
  changelog: string
  createdAt: Date
}

interface PromptCategory {
  id: string
  name: string
  icon: string
  count: number
}

interface PromptPlugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  rating: number
  downloads: number
  installed: boolean
}

export default function PromptLibrary() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [plugins, setPlugins] = useState<PromptPlugin[]>([])
  const [categories] = useState<PromptCategory[]>([
    { id: "code", name: "代码生成", icon: "💻", count: 0 },
    { id: "design", name: "UI设计", icon: "🎨", count: 0 },
    { id: "writing", name: "文案创作", icon: "✍️", count: 0 },
    { id: "analysis", name: "数据分析", icon: "📊", count: 0 },
    { id: "debug", name: "调试修复", icon: "🐛", count: 0 },
    { id: "review", name: "代码审查", icon: "👀", count: 0 },
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<"templates" | "plugins" | "market">("templates")
  const [copied, setCopied] = useState(false)
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)

  useEffect(() => {
    const initialTemplates: PromptTemplate[] = [
      {
        id: "react-component",
        title: "React组件生成器",
        content: `你是一个专业的React开发专家。请根据以下需求生成一个高质量的React组件:

组件名称: {componentName}
功能描述: {description}

要求:
1. 使用TypeScript
2. 使用函数式组件和Hooks
3. 添加PropTypes或TypeScript接口
4. 包含详细的JSDoc注释
5. 遵循React最佳实践
6. 代码格式整洁,使用Prettier风格

输出格式:
\`\`\`tsx
// 完整的组件代码
\`\`\``,
        category: "code",
        tags: ["React", "TypeScript", "组件"],
        author: "YYC³",
        version: "1.0.0",
        rating: 4.8,
        downloads: 1250,
        isPublic: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        versions: [
          {
            version: "1.0.0",
            content: "初始版本",
            changelog: "创建React组件生成器模板",
            createdAt: new Date("2024-01-01"),
          },
        ],
      },
      {
        id: "code-reviewer",
        title: "代码审查助手",
        content: `你是一个资深的代码审查专家。请对以下代码进行全面的审查:

\`\`\`{language}
{code}
\`\`\`

请从以下方面进行评估:

1. **代码质量** (1-10分)
   - 可读性
   - 可维护性
   - 代码风格

2. **性能优化**
   - 时间复杂度
   - 空间复杂度
   - 潜在瓶颈

3. **最佳实践**
   - 设计模式
   - 命名规范
   - 注释文档

4. **安全性**
   - 潜在漏洞
   - 输入验证
   - 错误处理

5. **改进建议**
   - 具体的代码改进
   - 重构建议
   - 优化方案

输出格式:
## 评分: X/10

## 发现的问题
1. ...

## 改进建议
1. ...

## 优化后的代码
\`\`\`{language}
// 改进后的代码
\`\`\``,
        category: "review",
        tags: ["代码审查", "最佳实践", "性能"],
        author: "YYC³",
        version: "2.1.0",
        rating: 4.9,
        downloads: 2100,
        isPublic: true,
        createdAt: new Date("2024-01-05"),
        updatedAt: new Date("2024-01-20"),
        versions: [
          {
            version: "2.1.0",
            content: "添加安全性检查",
            changelog: "新增安全漏洞检测功能",
            createdAt: new Date("2024-01-20"),
          },
          {
            version: "2.0.0",
            content: "重大更新",
            changelog: "重构输出格式,添加评分系统",
            createdAt: new Date("2024-01-10"),
          },
        ],
      },
      {
        id: "bug-fixer",
        title: "智能Bug修复器",
        content: `你是一个专业的调试专家。请帮助分析和修复以下bug:

**错误信息:**
{error}

**相关代码:**
\`\`\`{language}
{code}
\`\`\`

**上下文:**
{context}

请按以下步骤进行:

1. **问题诊断**
   - 分析错误原因
   - 识别问题根源
   - 评估影响范围

2. **解决方案**
   - 提供多个解决方案
   - 说明每个方案的优缺点
   - 推荐最佳方案

3. **修复代码**
   - 提供完整的修复代码
   - 添加必要的注释
   - 包含测试建议

4. **预防措施**
   - 如何避免类似问题
   - 最佳实践建议`,
        category: "debug",
        tags: ["调试", "Bug修复", "错误处理"],
        author: "YYC³",
        version: "1.5.0",
        rating: 4.7,
        downloads: 1800,
        isPublic: true,
        createdAt: new Date("2024-01-10"),
        updatedAt: new Date("2024-01-25"),
        versions: [],
      },
      {
        id: "api-designer",
        title: "RESTful API设计器",
        content: `你是一个API设计专家。请为以下需求设计一套RESTful API:

**项目描述:** {description}
**主要功能:** {features}

请提供:

1. **API结构设计**
\`\`\`
GET    /api/resource          # 列表
GET    /api/resource/:id      # 详情
POST   /api/resource          # 创建
PUT    /api/resource/:id      # 更新
DELETE /api/resource/:id      # 删除
\`\`\`

2. **数据模型**
\`\`\`typescript
interface Resource {
  // 定义数据结构
}
\`\`\`

3. **请求/响应示例**
4. **错误处理**
5. **认证授权方案**
6. **API文档 (OpenAPI格式)**`,
        category: "code",
        tags: ["API", "RESTful", "后端"],
        author: "YYC³",
        version: "1.2.0",
        rating: 4.6,
        downloads: 950,
        isPublic: true,
        createdAt: new Date("2024-01-12"),
        updatedAt: new Date("2024-01-22"),
        versions: [],
      },
    ]

    const initialPlugins: PromptPlugin[] = [
      {
        id: "plugin-1",
        name: "代码格式化器",
        description: "自动格式化各种编程语言的代码",
        version: "1.0.0",
        author: "YYC³",
        rating: 4.5,
        downloads: 500,
        installed: false,
      },
      {
        id: "plugin-2",
        name: "Markdown生成器",
        description: "将内容转换为格式良好的Markdown文档",
        version: "2.1.0",
        author: "Community",
        rating: 4.7,
        downloads: 800,
        installed: false,
      },
      {
        id: "plugin-3",
        name: "测试用例生成器",
        description: "自动生成单元测试和集成测试代码",
        version: "1.3.0",
        author: "YYC³",
        rating: 4.8,
        downloads: 650,
        installed: false,
      },
    ]

    setTemplates(initialTemplates)
    setPlugins(initialPlugins)

    // 从localStorage加载用户自定义模板
    const saved = localStorage.getItem("yyc3_prompt_templates")
    if (saved) {
      const userTemplates = JSON.parse(saved)
      setTemplates([...initialTemplates, ...userTemplates])
    }
  }, [])

  useEffect(() => {
    const userTemplates = templates.filter((t) => t.author !== "YYC³")
    if (userTemplates.length > 0) {
      localStorage.setItem("yyc3_prompt_templates", JSON.stringify(userTemplates))
    }
  }, [templates])

  const createTemplate = (title: string, content: string, category: string, tags: string[]) => {
    const newTemplate: PromptTemplate = {
      id: `template-${Date.now()}`,
      title,
      content,
      category,
      tags,
      author: "User",
      version: "1.0.0",
      rating: 0,
      downloads: 0,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [
        {
          version: "1.0.0",
          content: "初始版本",
          changelog: "创建模板",
          createdAt: new Date(),
        },
      ],
    }
    setTemplates([...templates, newTemplate])
    setShowNewTemplateDialog(false)
  }

  const updateTemplateVersion = (templateId: string, newContent: string, changelog: string) => {
    setTemplates(
      templates.map((t) => {
        if (t.id === templateId) {
          const currentVersion = Number.parseFloat(t.version)
          const newVersion = `${(currentVersion + 0.1).toFixed(1)}`
          return {
            ...t,
            content: newContent,
            version: newVersion,
            updatedAt: new Date(),
            versions: [
              ...t.versions,
              {
                version: newVersion,
                content: newContent,
                changelog,
                createdAt: new Date(),
              },
            ],
          }
        }
        return t
      }),
    )
  }

  const copyTemplate = async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportTemplate = (template: PromptTemplate) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setTemplates([...templates, { ...imported, id: `template-${Date.now()}` }])
      } catch (err) {
        console.error("[v0] Failed to import template:", err)
      }
    }
    reader.readAsText(file)
  }

  const installPlugin = (pluginId: string) => {
    setPlugins(plugins.map((p) => (p.id === pluginId ? { ...p, installed: true } : p)))
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-full gap-4">
      {/* 侧边栏 */}
      <div className="w-64 flex-shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">提示词库</span>
          </div>
          <div className="text-xs text-zinc-500">智能模板管理</div>
        </div>

        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "templates"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Folder className="h-4 w-4" />
            模板库
          </button>
          <button
            onClick={() => setActiveTab("plugins")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "plugins"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            插件管理
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "market"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            模板市场
          </button>
        </div>

        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <div className="mb-2 px-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">分类</div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                selectedCategory === category.id
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{category.icon}</span>
              <span className="flex-1 text-left">{category.name}</span>
              <span className="text-xs text-zinc-500">
                {templates.filter((t) => t.category === category.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col gap-4">
        {/* 搜索和操作栏 */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板或标签..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <button
            onClick={() => setShowNewTemplateDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            新建模板
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800">
            <Upload className="h-4 w-4" />
            导入
            <input type="file" accept=".json" onChange={importTemplate} className="hidden" />
          </label>
        </div>

        {/* 模板列表 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "templates" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-purple-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{template.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>v{template.version}</span>
                        <span>•</span>
                        <span>{template.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{template.rating}</span>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-950"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-3 max-h-20 overflow-hidden text-sm text-zinc-600 dark:text-zinc-400">
                    {template.content.substring(0, 100)}...
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="flex-1 rounded bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => copyTemplate(template.content)}
                      className="rounded border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                      title="复制"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => exportTemplate(template)}
                      className="rounded border border-zinc-200 p-1.5 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                      title="导出"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {template.downloads}
                    </span>
                    <span>更新于 {template.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "plugins" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{plugin.name}</h3>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{plugin.rating}</span>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{plugin.description}</p>
                  <div className="mb-3 flex items-center gap-3 text-xs text-zinc-500">
                    <span>v{plugin.version}</span>
                    <span>•</span>
                    <span>{plugin.author}</span>
                    <span>•</span>
                    <span>{plugin.downloads} 下载</span>
                  </div>
                  {plugin.installed ? (
                    <button className="w-full rounded bg-green-600 px-3 py-1.5 text-sm text-white" disabled>
                      已安装
                    </button>
                  ) : (
                    <button
                      onClick={() => installPlugin(plugin.id)}
                      className="w-full rounded bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700"
                    >
                      安装插件
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "market" && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">模板市场</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">浏览和分享社区贡献的优质提示词模板</p>
              <button className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                浏览市场
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 模板详情模态框 */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedTemplate.title}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>v{selectedTemplate.version}</span>
                  <span>•</span>
                  <span>{selectedTemplate.author}</span>
                  <span>•</span>
                  <span>{selectedTemplate.downloads} 下载</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex flex-wrap gap-1">
                {selectedTemplate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-950"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">模板内容</span>
                  <button
                    onClick={() => copyTemplate(selectedTemplate.content)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    复制
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {selectedTemplate.content}
                </pre>
              </div>

              {selectedTemplate.versions.length > 0 && (
                <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">版本历史</h3>
                  <div className="space-y-2">
                    {selectedTemplate.versions.map((version) => (
                      <div key={version.version} className="border-l-2 border-purple-600 pl-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">v{version.version}</span>
                          <span className="text-xs text-zinc-500">{version.createdAt.toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{version.changelog}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
