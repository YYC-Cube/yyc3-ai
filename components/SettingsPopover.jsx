"use client"
import { useState } from "react"
import {
  User,
  Globe,
  HelpCircle,
  Crown,
  BookOpen,
  LogOut,
  ChevronRight,
  SettingsIcon,
  Cpu,
  Workflow,
  Puzzle,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useLocale } from "@/contexts/LocaleContext"
import OpenAIConfigPanel from "./OpenAIConfigPanel"
import ModelManagementPanel from "./ModelManagementPanel"
import WorkflowPanel from "./WorkflowPanel"
import PluginPanel from "./PluginPanel"

// 模型配置
const MODEL_OPTIONS = [
  { value: "deepseek", label: "DeepSeek", provider: "深度求索", type: "国内" },
  { value: "gpt-4", label: "GPT-4", provider: "OpenAI", type: "国际" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "OpenAI", type: "国际" },
  { value: "claude-3", label: "Claude 3", provider: "Anthropic", type: "国际" },
  { value: "ernie-4.0", label: "文心一言 4.0", provider: "百度", type: "国内" },
  { value: "qwen-plus", label: "通义千问 Plus", provider: "阿里云", type: "国内" },
  { value: "spark-3.0", label: "星火认知 3.0", provider: "讯飞", type: "国内" },
  { value: "chatglm3", label: "ChatGLM3", provider: "智谱AI", type: "国内" },
]

// 提示词分类选项
const PROMPT_CATEGORIES = {
  technology: {
    label: "技术栈",
    options: ["React", "Vue", "Angular", "Node.js", "Python", "Java", "Go", "Rust"]
  },
  framework: {
    label: "开发框架",
    options: ["Next.js", "Nuxt.js", "Spring Boot", "Django", "Flask", "Express", "Laravel"]
  },
  projectType: {
    label: "项目类型",
    options: ["Web应用", "移动应用", "桌面应用", "API服务", "微服务", "数据可视化", "AI应用"]
  },
  complexity: {
    label: "复杂度",
    options: ["初级", "中级", "高级", "企业级"]
  },
  style: {
    label: "代码风格",
    options: ["简洁", "可读性", "高性能", "安全", "可维护", "模块化"]
  }
}

export default function SettingsPopover({ children }) {
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLanguage, setShowLanguage] = useState(false)
  const { locale, setLocale, t } = useLocale()
  
  // 模型选择状态
  const [selectedModel, setSelectedModel] = useState("deepseek")
  
  // 提示词生成状态
  const [promptCategories, setPromptCategories] = useState({})
  const [generatedPrompt, setGeneratedPrompt] = useState("")

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale)
    setShowLanguage(false)
  }

  const handleCategoryChange = (category, value) => {
    setPromptCategories(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const generatePrompt = () => {
    const selected = Object.values(promptCategories).filter(Boolean)
    if (selected.length === 0) {
      setGeneratedPrompt("请选择至少一个分类来生成提示词")
      return
    }
    
    const basePrompt = `基于以下要求开发项目：${selected.join("，")}。请提供完整的代码实现，包含详细的注释和最佳实践。`
    setGeneratedPrompt(basePrompt)
  }

  const refreshOptions = (category) => {
    // 模拟刷新选项，实际项目中可以从API获取
    console.log(`刷新 ${category} 选项`)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start" side="top">
          <div className="p-4">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">j@gmail.com</div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{t("settings.general")}</span>
              </div>
              <div className="ml-auto">
                <div className="text-xs text-zinc-500">Pro plan</div>
              </div>
              <div className="text-blue-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">{t("settings.title")}</div>

              <button
                onClick={() => {
                  setShowSettings(true)
                  setOpen(false)
                }}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>高级设置</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>

              <button
                onClick={() => setShowLanguage(true)}
                className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <Globe className="h-4 w-4" />
                <span>{t("settings.language")}</span>
                <span className="ml-auto text-xs text-zinc-500">{locale === "zh-CN" ? "简体中文" : "English"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <HelpCircle className="h-4 w-4" />
                <span>{t("settings.general")}</span>
              </button>

              <button className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <Crown className="h-4 w-4" />
                <span>升级计划</span>
              </button>

              <button className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <BookOpen className="h-4 w-4" />
                <span>了解更多</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </button>

              <button className="flex items-center gap-3 w-full p-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("settings.title")}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="openai" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="openai" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                AI配置
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                模型管理
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                提示词生成
              </TabsTrigger>
              <TabsTrigger value="plugins" className="flex items-center gap-2">
                <Puzzle className="h-4 w-4" />
                插件管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="openai" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 左侧：模型选择 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">选择模型</label>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        {MODEL_OPTIONS.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label} ({model.provider}) - {model.type}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">API 密钥</label>
                      <input 
                        type="password"
                        placeholder="输入您的 API 密钥"
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </div>

                  {/* 右侧：模型配置 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">温度 (Temperature)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          defaultValue="0.7"
                          className="flex-1"
                        />
                        <span className="text-sm text-zinc-500 w-8">0.7</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">最大令牌数</label>
                      <input 
                        type="number"
                        defaultValue="2000"
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      测试连接
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 左侧：分类选择 */}
                  <div className="space-y-4">
                    <h3 className="font-medium">智能提示词生成</h3>
                    {Object.entries(PROMPT_CATEGORIES).map(([key, category]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">{category.label}</label>
                          <button 
                            onClick={() => refreshOptions(key)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                            title="刷新选项"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                        <select 
                          value={promptCategories[key] || ""}
                          onChange={(e) => handleCategoryChange(key, e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <option value="">请选择...</option>
                          {category.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    
                    <button 
                      onClick={generatePrompt}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      生成提示词
                    </button>
                  </div>

                  {/* 右侧：生成的提示词 */}
                  <div className="space-y-4">
                    <h3 className="font-medium">生成的提示词</h3>
                    <div className="h-48 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900">
                      <textarea
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        placeholder="生成的提示词将显示在这里..."
                        className="w-full h-full resize-none bg-transparent text-sm outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        复制
                      </button>
                      <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        清空
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="mt-6">
              <ModelManagementPanel />
            </TabsContent>

            <TabsContent value="plugins" className="mt-6">
              <PluginPanel />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 语言选择对话框保持不变 */}
      <Dialog open={showLanguage} onOpenChange={setShowLanguage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.language")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <button
              onClick={() => handleLanguageChange("zh-CN")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                locale === "zh-CN"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div>
                <div className="font-medium">简体中文</div>
                <div className="text-sm text-zinc-500">Simplified Chinese</div>
              </div>
              {locale === "zh-CN" && (
                <div className="text-blue-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                locale === "en" ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div>
                <div className="font-medium">English</div>
                <div className="text-sm text-zinc-500">英语</div>
              </div>
              {locale === "en" && (
                <div className="text-blue-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
