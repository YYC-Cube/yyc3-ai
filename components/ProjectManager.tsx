"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Folder, FolderPlus, FileCode, Trash2, Download, Search, Clock } from "lucide-react"
import { workspaceManager, type Project } from "@/lib/workspace-manager"
import { useLocale } from "@/contexts/LocaleContext"
import TemplateLibrary from "./TemplateLibrary"
import UILibrarySelector from "./UILibrarySelector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProjectManager() {
  const { t } = useLocale()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | Project["type"]>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    type: "react" as Project["type"],
    description: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    const allProjects = workspaceManager.getAllProjects()
    setProjects(allProjects)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || project.type === filterType
    return matchesSearch && matchesType
  })

  const createProject = () => {
    if (!newProject.name.trim()) {
      alert("请输入项目名称")
      return
    }

    const project = workspaceManager.createProject(newProject.name, newProject.type, newProject.description)

    if (newProject.type === "react") {
      workspaceManager.addFile(project.id, {
        name: "App.jsx",
        path: "/src/App.jsx",
        content: `import React from 'react'\n\nfunction App() {\n  return (\n    <div style={{ padding: '20px' }}>\n      <h1>Hello React</h1>\n      <p>开始构建你的应用</p>\n    </div>\n  )\n}\n\nexport default App`,
        language: "javascript",
        size: 200,
      })
    } else if (newProject.type === "nextjs") {
      workspaceManager.addFile(project.id, {
        name: "page.tsx",
        path: "/app/page.tsx",
        content: `export default function Page() {\n  return (\n    <div>\n      <h1>Welcome to Next.js</h1>\n    </div>\n  )\n}`,
        language: "typescript",
        size: 150,
      })
    } else if (newProject.type === "web") {
      workspaceManager.addFile(project.id, {
        name: "index.html",
        path: "/index.html",
        content: `<!DOCTYPE html>\n<html>\n<head>\n  <title>${newProject.name}</title>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>`,
        language: "html",
        size: 200,
      })
    }

    loadProjects()
    setIsCreateDialogOpen(false)
    setNewProject({ name: "", type: "react", description: "" })

    workspaceManager.setActiveProject(project.id)
  }

  const deleteProject = (id: string) => {
    if (confirm("确定要删除这个项目吗? 此操作无法撤销。")) {
      workspaceManager.deleteProject(id)
      loadProjects()
    }
  }

  const exportProject = (project: Project) => {
    try {
      const dataStr = JSON.stringify(project, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${project.name}.json`
      link.click()
      URL.revokeObjectURL(url)
      console.log("[v0] 项目导出成功:", project.name)
    } catch (error) {
      console.error("[v0] 项目导出失败:", error)
      alert("导出失败,请重试")
    }
  }

  const getProjectTypeColor = (type: Project["type"]) => {
    const colors = {
      web: "bg-blue-500",
      react: "bg-cyan-500",
      nextjs: "bg-black",
      node: "bg-green-500",
      python: "bg-yellow-500",
    }
    return colors[type] || "bg-gray-500"
  }

  const getProjectTypeLabel = (type: Project["type"]) => {
    const labels = {
      web: "Web",
      react: "React",
      nextjs: "Next.js",
      node: "Node.js",
      python: "Python",
    }
    return labels[type] || type
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">项目管理</h2>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="nextjs">Next.js</SelectItem>
              <SelectItem value="node">Node.js</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">项目名称</label>
                <Input
                  placeholder="我的项目"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">项目类型</label>
                <Select
                  value={newProject.type}
                  onValueChange={(v) => setNewProject({ ...newProject, type: v as Project["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web 应用</SelectItem>
                    <SelectItem value="react">React 应用</SelectItem>
                    <SelectItem value="nextjs">Next.js 应用</SelectItem>
                    <SelectItem value="node">Node.js 应用</SelectItem>
                    <SelectItem value="python">Python 应用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">项目描述</label>
                <Input
                  placeholder="项目描述(可选)"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <Button onClick={createProject} className="w-full">
                创建项目
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="projects" className="h-full flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="projects">项目</TabsTrigger>
          <TabsTrigger value="templates">模板</TabsTrigger>
          <TabsTrigger value="ui-libraries">UI 库</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="flex-1 overflow-hidden">
          {/* 项目列表 */}
          <div className="h-full overflow-auto p-4">
            {filteredProjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400">
                <div className="text-center">
                  <Folder className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">
                    {searchQuery || filterType !== "all" ? "未找到匹配的项目" : "还没有项目"}
                  </p>
                  <p className="text-sm mb-4">
                    {searchQuery || filterType !== "all" ? "尝试调整搜索条件" : "创建你的第一个项目开始编程"}
                  </p>
                  {!searchQuery && filterType === "all" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      新建项目
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getProjectTypeColor(project.type)}`} />
                        <h3 className="font-semibold">{project.name}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getProjectTypeLabel(project.type)}
                      </Badge>
                    </div>

                    {project.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                      <div className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        <span>{project.files.length} 文件</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          workspaceManager.setActiveProject(project.id)
                          console.log("[v0] 已激活项目:", project.name)
                        }}
                      >
                        打开
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => exportProject(project)} title="导出项目">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)} title="删除项目">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-hidden">
          <TemplateLibrary />
        </TabsContent>

        <TabsContent value="ui-libraries" className="flex-1 overflow-hidden">
          <UILibrarySelector />
        </TabsContent>
      </Tabs>
    </div>
  )
}
