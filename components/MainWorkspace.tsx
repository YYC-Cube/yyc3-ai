"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { MessageSquare, Code2, FolderTree, Activity, FileCode, Zap, BookOpen, Lightbulb, Github } from "lucide-react"
import AIAssistantUI from "./AIAssistantUI"
import WorkspaceLayout from "./WorkspaceLayout"
import IntegratedWorkspace from "./IntegratedWorkspace"
import ProjectManager from "./ProjectManager"
import EnhancedCodeReviewPanel from "./EnhancedCodeReviewPanel"
import PerformanceMonitorPanel from "./PerformanceMonitorPanel"
import LearningPathPlanner from "./LearningPathPlanner"
import PromptTemplateManager from "./PromptTemplateManager"
import HelpSystem from "./HelpSystem"
import FloatingChat from "./FloatingChat"
import { useLocale } from "@/contexts/LocaleContext"

export default function MainWorkspace() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState("chat")
  const [currentCode, setCurrentCode] = useState("")
  const [currentLanguage, setCurrentLanguage] = useState("javascript")
  const [showHelp, setShowHelp] = useState(false)

  const tabs = [
    { value: "chat", icon: MessageSquare, label: "AI 对话" },
    { value: "workspace", icon: Code2, label: "代码工作台" },
    { value: "integrated", icon: Zap, label: "智能编程" },
    { value: "projects", icon: FolderTree, label: "项目管理" },
    { value: "review", icon: FileCode, label: "代码审查" },
    { value: "performance", icon: Activity, label: "性能监控" },
    { value: "learning", icon: BookOpen, label: "学习中心" },
    { value: "prompts", icon: Lightbulb, label: "提示词库" },
  ]

  const tabClassName =
    "group relative gap-2 rounded-lg px-3 py-2 text-sm transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-zinc-600 data-[state=inactive]:hover:bg-zinc-100 dark:data-[state=inactive]:text-zinc-400 dark:data-[state=inactive]:hover:bg-zinc-800"

  const handleCodeChange = (code: string, language: string) => {
    setCurrentCode(code)
    setCurrentLanguage(language)
  }

  const handleGithubDeploy = () => {
    window.open("https://github.com/new", "_blank")
  }

  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const { tab } = event.detail
      const tabMap: Record<string, string> = {
        help: "learning",
        learning: "learning",
        prompts: "prompts",
      }
      const targetTab = tabMap[tab] || tab
      setActiveTab(targetTab)
    }

    window.addEventListener("navigate-to-tab", handleNavigate as EventListener)
    return () => window.removeEventListener("navigate-to-tab", handleNavigate as EventListener)
  }, [])

  return (
    <div className="h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div className="w-full px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FloatingChat />
                <div>
                  <h1 className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                    万象归元于云栈 | 深耕智启新纪元
                  </h1>
                </div>
              </div>
              <button
                onClick={handleGithubDeploy}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95"
                title="一键部署到GitHub"
              >
                <Github className="h-4 w-4" />
                <span>部署</span>
              </button>
            </div>
          </div>

          <div className="w-full px-4">
            <TabsList className="w-full justify-start h-12 rounded-none bg-transparent gap-1 border-t border-zinc-100 dark:border-zinc-800">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className={tabClassName}>
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden group-hover:inline-block group-data-[state=active]:inline-block transition-all">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0">
            <div className="h-full w-full">
              <AIAssistantUI />
            </div>
          </TabsContent>

          <TabsContent value="workspace" className="h-full m-0">
            <div className="h-full w-full">
              <WorkspaceLayout />
            </div>
          </TabsContent>

          <TabsContent value="integrated" className="h-full m-0">
            <div className="h-full w-full">
              <IntegratedWorkspace onCodeChange={handleCodeChange} />
            </div>
          </TabsContent>

          <TabsContent value="projects" className="h-full m-0">
            <div className="h-full w-full">
              <ProjectManager />
            </div>
          </TabsContent>

          <TabsContent value="review" className="h-full m-0">
            <div className="h-full flex">
              <div className="flex-1">
                <div className="h-full p-4">
                  <div className="h-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                    <IntegratedWorkspace onCodeChange={handleCodeChange} />
                  </div>
                </div>
              </div>
              <div className="w-[450px] border-l border-zinc-200 dark:border-zinc-800">
                <EnhancedCodeReviewPanel
                  code={currentCode}
                  language={currentLanguage}
                  onApplyFix={setCurrentCode}
                  techStack={["React", "TypeScript", "Tailwind CSS"]}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="h-full m-0">
            <div className="h-full w-full">
              <PerformanceMonitorPanel />
            </div>
          </TabsContent>

          <TabsContent value="learning" className="h-full m-0">
            <div className="h-full w-full p-6">
              <LearningPathPlanner />
            </div>
          </TabsContent>

          <TabsContent value="prompts" className="h-full m-0">
            <div className="h-full w-full">
              <PromptTemplateManager />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-auto bg-white dark:bg-zinc-900 rounded-lg shadow-xl">
            <HelpSystem onClose={() => setShowHelp(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
