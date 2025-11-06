"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Book, Keyboard, Video, MessageCircle, Search, ExternalLink } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"

export default function HelpSystem() {
  const { t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const shortcuts = [
    { keys: ["Ctrl/Cmd", "N"], description: "创建新对话" },
    { keys: ["Ctrl/Cmd", "S"], description: "保存文件" },
    { keys: ["Ctrl/Cmd", "Enter"], description: "运行代码" },
    { keys: ["Ctrl/Cmd", "Space"], description: "触发AI补全" },
    { keys: ["Tab"], description: "插入缩进" },
    { keys: ["/"], description: "聚焦搜索" },
    { keys: ["Esc"], description: "关闭侧边栏" },
  ]

  const tutorials = [
    {
      title: "快速开始",
      description: "5分钟了解基本功能",
      duration: "5 分钟",
      link: "/docs/QUICK_START.md",
    },
    {
      title: "完整用户指南",
      description: "详细的功能说明和使用方法",
      duration: "20 分钟",
      link: "/docs/USER_GUIDE.md",
    },
    {
      title: "AI编程最佳实践",
      description: "如何高效使用AI辅助编程",
      duration: "15 分钟",
      link: "#",
    },
    {
      title: "代码审查指南",
      description: "理解和应用代码审查建议",
      duration: "10 分钟",
      link: "#",
    },
  ]

  const faqs = [
    {
      question: "如何配置AI服务?",
      answer: "进入设置面板,在'AI服务配置'标签页中配置API密钥和选择模型。",
    },
    {
      question: "代码预览不更新怎么办?",
      answer: "检查代码是否有语法错误,或尝试手动点击'运行'按钮刷新预览。",
    },
    {
      question: "如何保存我的工作?",
      answer: "系统会自动保存,您也可以使用 Ctrl/Cmd + S 手动保存。",
    },
    {
      question: "如何分享我的项目?",
      answer: "在代码工作台点击'分享'按钮,生成分享链接或导出项目文件。",
    },
    {
      question: "AI建议不准确怎么办?",
      answer: "AI会持续学习,您可以通过反馈帮助改进。同时可以尝试更换不同的AI模型。",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          帮助
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            帮助中心
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="guide" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guide">
              <Book className="h-4 w-4 mr-2" />
              指南
            </TabsTrigger>
            <TabsTrigger value="shortcuts">
              <Keyboard className="h-4 w-4 mr-2" />
              快捷键
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <Video className="h-4 w-4 mr-2" />
              教程
            </TabsTrigger>
            <TabsTrigger value="faq">
              <MessageCircle className="h-4 w-4 mr-2" />
              常见问题
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="guide" className="m-0">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">欢迎使用 AI 智能编程助手</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    这是一个功能强大的现代化开发环境,集成了AI辅助编程、实时预览、代码审查等多项功能。
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">1</Badge>
                      <div>
                        <p className="text-sm font-medium">配置AI服务</p>
                        <p className="text-xs text-zinc-500">进入设置配置API密钥</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">2</Badge>
                      <div>
                        <p className="text-sm font-medium">创建项目</p>
                        <p className="text-xs text-zinc-500">在项目管理中创建新项目</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">3</Badge>
                      <div>
                        <p className="text-sm font-medium">开始编程</p>
                        <p className="text-xs text-zinc-500">在智能编程环境中编写代码</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">主要功能</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-sm">
                      <p className="font-medium">AI 对话</p>
                      <p className="text-xs text-zinc-500">与AI助手对话交流</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">代码工作台</p>
                      <p className="text-xs text-zinc-500">多面板代码编辑</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">智能编程</p>
                      <p className="text-xs text-zinc-500">AI辅助编程环境</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">代码审查</p>
                      <p className="text-xs text-zinc-500">AI代码质量分析</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts" className="m-0">
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <Badge key={i} variant="outline" className="font-mono text-xs">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tutorials" className="m-0">
              <div className="space-y-3">
                {tutorials.map((tutorial, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{tutorial.title}</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{tutorial.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.duration}
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="m-0">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="搜索问题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-semibold mb-2 text-sm">{faq.question}</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
                    </Card>
                  ))}
                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-8 text-zinc-400">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">未找到相关问题</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
