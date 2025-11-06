// 工作台管理系统 - 统一管理所有工作区和面板
export interface WorkspaceLayout {
  id: string
  name: string
  panels: PanelConfig[]
  activePanel: string
}

export interface PanelConfig {
  id: string
  type: "chat" | "code-editor" | "learning" | "components" | "files" | "terminal"
  position: "left" | "center" | "right" | "bottom"
  size: number // 百分比
  visible: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  type: "web" | "react" | "nextjs" | "node" | "python"
  files: ProjectFile[]
  createdAt: string
  updatedAt: string
  settings: ProjectSettings
}

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  size: number
  modifiedAt: string
}

export interface ProjectSettings {
  autoSave: boolean
  linting: boolean
  formatting: boolean
  aiAssist: boolean
  theme: string
}

class WorkspaceManager {
  private layouts: Map<string, WorkspaceLayout> = new Map()
  private projects: Map<string, Project> = new Map()
  private activeWorkspace: string | null = null
  private activeProject: string | null = null

  constructor() {
    this.loadFromStorage()
    this.initializeDefaultLayouts()
  }

  // 工作区布局管理
  createLayout(name: string, panels: PanelConfig[]): WorkspaceLayout {
    const layout: WorkspaceLayout = {
      id: `layout-${Date.now()}`,
      name,
      panels,
      activePanel: panels[0]?.id || "",
    }
    this.layouts.set(layout.id, layout)
    this.saveToStorage()
    return layout
  }

  getLayout(id: string): WorkspaceLayout | undefined {
    return this.layouts.get(id)
  }

  updateLayout(id: string, updates: Partial<WorkspaceLayout>): void {
    const layout = this.layouts.get(id)
    if (layout) {
      Object.assign(layout, updates)
      this.saveToStorage()
    }
  }

  deleteLayout(id: string): void {
    this.layouts.delete(id)
    this.saveToStorage()
  }

  getAllLayouts(): WorkspaceLayout[] {
    return Array.from(this.layouts.values())
  }

  setActiveWorkspace(id: string): void {
    this.activeWorkspace = id
    this.saveToStorage()
  }

  getActiveWorkspace(): WorkspaceLayout | null {
    return this.activeWorkspace ? this.layouts.get(this.activeWorkspace) || null : null
  }

  // 项目管理
  createProject(name: string, type: Project["type"], description = ""): Project {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      type,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        autoSave: true,
        linting: true,
        formatting: true,
        aiAssist: true,
        theme: "auto",
      },
    }
    this.projects.set(project.id, project)
    this.saveToStorage()
    return project
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id)
  }

  updateProject(id: string, updates: Partial<Project>): void {
    const project = this.projects.get(id)
    if (project) {
      Object.assign(project, updates)
      project.updatedAt = new Date().toISOString()
      this.saveToStorage()
    }
  }

  deleteProject(id: string): void {
    this.projects.delete(id)
    if (this.activeProject === id) {
      this.activeProject = null
    }
    this.saveToStorage()
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values())
  }

  setActiveProject(id: string): void {
    this.activeProject = id
    this.saveToStorage()
  }

  getActiveProject(): Project | null {
    return this.activeProject ? this.projects.get(this.activeProject) || null : null
  }

  // 文件管理
  addFile(projectId: string, file: Omit<ProjectFile, "id" | "modifiedAt">): ProjectFile | null {
    const project = this.projects.get(projectId)
    if (!project) return null

    const newFile: ProjectFile = {
      ...file,
      id: `file-${Date.now()}`,
      modifiedAt: new Date().toISOString(),
    }

    project.files.push(newFile)
    project.updatedAt = new Date().toISOString()
    this.saveToStorage()
    return newFile
  }

  updateFile(projectId: string, fileId: string, updates: Partial<ProjectFile>): void {
    const project = this.projects.get(projectId)
    if (!project) return

    const file = project.files.find((f) => f.id === fileId)
    if (file) {
      Object.assign(file, updates)
      file.modifiedAt = new Date().toISOString()
      project.updatedAt = new Date().toISOString()
      this.saveToStorage()
    }
  }

  deleteFile(projectId: string, fileId: string): void {
    const project = this.projects.get(projectId)
    if (!project) return

    project.files = project.files.filter((f) => f.id !== fileId)
    project.updatedAt = new Date().toISOString()
    this.saveToStorage()
  }

  getFile(projectId: string, fileId: string): ProjectFile | undefined {
    const project = this.projects.get(projectId)
    return project?.files.find((f) => f.id === fileId)
  }

  // 初始化默认布局
  private initializeDefaultLayouts(): void {
    if (this.layouts.size === 0) {
      this.createLayout("代码开发", [
        { id: "files", type: "files", position: "left", size: 20, visible: true },
        { id: "editor", type: "code-editor", position: "center", size: 80, visible: true },
      ])

      // AI 学习布局
      this.createLayout("AI 学习", [
        { id: "chat", type: "chat", position: "left", size: 40, visible: true },
        { id: "learning", type: "learning", position: "center", size: 60, visible: true },
      ])

      this.createLayout("全功能工作台", [
        { id: "editor", type: "code-editor", position: "center", size: 100, visible: true },
      ])

      // 设置第一个为活动工作区
      const firstLayout = this.getAllLayouts()[0]
      if (firstLayout) {
        this.setActiveWorkspace(firstLayout.id)
      }
    }
  }

  // 持久化
  private saveToStorage(): void {
    try {
      localStorage.setItem("workspace-layouts", JSON.stringify(Array.from(this.layouts.entries())))
      localStorage.setItem("workspace-projects", JSON.stringify(Array.from(this.projects.entries())))
      localStorage.setItem(
        "workspace-active",
        JSON.stringify({
          workspace: this.activeWorkspace,
          project: this.activeProject,
        }),
      )
    } catch (error) {
      console.error("Failed to save workspace:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const layoutsData = localStorage.getItem("workspace-layouts")
      if (layoutsData) {
        this.layouts = new Map(JSON.parse(layoutsData))
      }

      const projectsData = localStorage.getItem("workspace-projects")
      if (projectsData) {
        this.projects = new Map(JSON.parse(projectsData))
      }

      const activeData = localStorage.getItem("workspace-active")
      if (activeData) {
        const { workspace, project } = JSON.parse(activeData)
        this.activeWorkspace = workspace
        this.activeProject = project
      }
    } catch (error) {
      console.error("Failed to load workspace:", error)
    }
  }
}

export const workspaceManager = new WorkspaceManager()
export default workspaceManager
