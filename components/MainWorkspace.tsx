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
import BrandLogo from "./BrandLogo"
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
    "nav-item group relative gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 " +
    "data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] " +
    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted"

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
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="h-16 border-b border-border bg-card shrink-0">
          <div className="w-full h-full px-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-4">
                <FloatingChat />
                <BrandLogo size="md" showText={true} />
              </div>

              <button
                onClick={handleGithubDeploy}
                className="btn-primary flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                title="一键部署到GitHub"
              >
                <Github className="icon icon-button" />
                <span className="font-medium">部署</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-border bg-card shrink-0">
          <div className="w-full px-6">
            <TabsList className="w-full justify-start h-12 rounded-none bg-transparent gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className={tabClassName}>
                    <IconComponent className="icon icon-nav shrink-0" />
                    <span className="hidden group-hover:inline-block group-data-[state=active]:inline-block transition-all text-sm">
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
                  <div className="card h-full overflow-hidden">
                    <IntegratedWorkspace onCodeChange={handleCodeChange} />
                  </div>
                </div>
              </div>
              <div className="w-[450px] border-l border-border">
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
          <div className="popover w-full max-w-4xl max-h-[80vh] overflow-auto">
            <HelpSystem onClose={() => setShowHelp(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
