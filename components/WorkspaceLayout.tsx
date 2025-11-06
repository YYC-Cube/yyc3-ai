"use client"

import React, { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { FileCode, FolderTree, Terminal, Layout, Settings, Play, Save, Download } from "lucide-react"
import { workspaceManager, type WorkspaceLayout as WorkspaceLayoutType, type Project } from "@/lib/workspace-manager"
import CodePlayground from "./CodePlayground"
import ChatPane from "./ChatPane"
import LearningProgressPanel from "./LearningProgressPanel"
import ComponentBrowser from "./ComponentBrowser"
import { useLocale } from "@/contexts/LocaleContext"

interface WorkspaceLayoutProps {
  onSendMessage?: (content: string) => void
  conversation?: any
}

export default function WorkspaceLayout({ onSendMessage, conversation }: WorkspaceLayoutProps) {
  const { t } = useLocale()
  const [activeLayout, setActiveLayout] = useState<WorkspaceLayoutType | null>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [layouts, setLayouts] = useState<WorkspaceLayoutType[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeView, setActiveView] = useState<"workspace" | "projects">("workspace")

  useEffect(() => {
    loadWorkspace()
  }, [])

  const loadWorkspace = () => {
    const allLayouts = workspaceManager.getAllLayouts()
    const allProjects = workspaceManager.getAllProjects()
    setLayouts(allLayouts)
    setProjects(allProjects)

    const currentLayout = workspaceManager.getActiveWorkspace()
    const currentProject = workspaceManager.getActiveProject()
    setActiveLayout(currentLayout)
    setActiveProject(currentProject)
  }

  const switchLayout = (layoutId: string) => {
    workspaceManager.setActiveWorkspace(layoutId)
    const layout = workspaceManager.getLayout(layoutId)
    setActiveLayout(layout || null)
  }

  const createNewProject = () => {
    const name = prompt(t("enterProjectName") || "输入项目名称")
    if (!name) return

    const project = workspaceManager.createProject(name, "react", "新建 React 项目")
    setProjects([...workspaceManager.getAllProjects()])
    setActiveProject(project)
    workspaceManager.setActiveProject(project.id)
  }

  const switchProject = (projectId: string) => {
    workspaceManager.setActiveProject(projectId)
    const project = workspaceManager.getProject(projectId)
    setActiveProject(project || null)
  }

  const renderPanel = (panelType: string) => {
    switch (panelType) {
      case "chat":
        return (
          null
        )
      case "code-editor":
        return <CodePlayground />
      case "learning":
        return (
          <div className="h-full overflow-hidden">
            <LearningProgressPanel />
          </div>
        )
      case "components":
        return (
          <div className="h-full overflow-hidden">
            <ComponentBrowser />
          </div>
        )
      case "files":
        return (
          <div className="h-full overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">文件浏览器</h3>
                <Button size="sm" variant="ghost">
                  <FolderTree className="h-4 w-4" />
                </Button>
              </div>
              {activeProject ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-500 mb-2">{activeProject.name}</div>
                  {activeProject.files.length === 0 ? (
                    <div className="text-xs text-zinc-400 py-8 text-center">暂无文件</div>
                  ) : (
                    activeProject.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm"
                      >
                        <FileCode className="h-4 w-4 text-zinc-400" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-400 py-8 text-center">请先创建或选择项目</div>
              )}
            </div>
          </div>
        )
      case "terminal":
        return (
          <div className="h-full overflow-hidden bg-black text-green-400 font-mono text-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="h-4 w-4" />
              <span>终端</span>
            </div>
            <div className="opacity-70">$ 准备就绪...</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
  <div className="h-full flex flex-col">
    {/* 顶部工具栏 */}
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2">
      <div className="flex items-center gap-4">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
          <TabsList className="h-8 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger 
              value="workspace" 
              className="text-xs gap-1 rounded-md px-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Layout className="h-3 w-3" />
              工作区
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="text-xs gap-1 rounded-md px-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FolderTree className="h-3 w-3" />
              项目
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeView === "workspace" && (
          <div className="flex items-center gap-2">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => switchLayout(layout.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeLayout?.id === layout.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {layout.name}
              </button>
            ))}
          </div>
        )}

        {activeView === "projects" && (
          <div className="flex items-center gap-2">
            <button
              onClick={createNewProject}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              新建项目
            </button>
            {projects.slice(0, 3).map((project) => (
              <button
                key={project.id}
                onClick={() => switchProject(project.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  activeProject?.id === project.id
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
          <Save className="h-3.5 w-3.5" />
          保存
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
          <Play className="h-3.5 w-3.5" />
          运行
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
          <Download className="h-3.5 w-3.5" />
          导出
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

      {/* 主工作区 */}
      <div className="flex-1 overflow-hidden">
        {activeLayout ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {activeLayout.panels
              .filter((panel) => panel.visible)
              .map((panel, index) => {
                const renderedPanel = renderPanel(panel.type)
                if (!renderedPanel) return null

                return (
                  <React.Fragment key={panel.id}>
                    <ResizablePanel defaultSize={panel.size} minSize={15}>
                      {renderedPanel}
                    </ResizablePanel>
                    {index <
                      activeLayout.panels.filter((p) => p.visible && renderPanel(p.type) !== null).length - 1 && (
                      <ResizableHandle withHandle />
                    )}
                  </React.Fragment>
                )
              })}
          </ResizablePanelGroup>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <Layout className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">欢迎使用 AI 智能编程工作台</p>
              <p className="text-sm">请选择一个工作区布局开始</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
