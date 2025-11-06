// 实时协作系统
export interface CollaborationSession {
  id: string
  name: string
  createdBy: string
  createdAt: Date
  participants: Participant[]
  isActive: boolean
  shareLink: string
}

export interface Participant {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
  selection?: { start: number; end: number }
  isActive: boolean
  joinedAt: Date
}

export interface ShareSettings {
  allowEdit: boolean
  allowDownload: boolean
  expiresAt?: Date
  password?: string
  maxParticipants?: number
}

export interface SharedProject {
  id: string
  name: string
  description: string
  files: Array<{ name: string; content: string; language: string }>
  owner: string
  createdAt: Date
  settings: ShareSettings
  views: number
  forks: number
}

export class CollaborationManager {
  private sessions: Map<string, CollaborationSession> = new Map()
  private currentUser: Participant
  private colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

  constructor(userName = "访客") {
    this.currentUser = {
      id: Math.random().toString(36).slice(2),
      name: userName,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      isActive: true,
      joinedAt: new Date(),
    }
  }

  // 创建协作会话
  createSession(name: string): CollaborationSession {
    const session: CollaborationSession = {
      id: Math.random().toString(36).slice(2),
      name,
      createdBy: this.currentUser.id,
      createdAt: new Date(),
      participants: [this.currentUser],
      isActive: true,
      shareLink: this.generateShareLink(),
    }

    this.sessions.set(session.id, session)
    return session
  }

  // 加入会话
  joinSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) return false

    if (!session.participants.find((p) => p.id === this.currentUser.id)) {
      session.participants.push(this.currentUser)
    }

    return true
  }

  // 离开会话
  leaveSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.participants = session.participants.filter((p) => p.id !== this.currentUser.id)

    if (session.participants.length === 0) {
      session.isActive = false
    }
  }

  // 更新光标位置
  updateCursor(sessionId: string, line: number, column: number): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const participant = session.participants.find((p) => p.id === this.currentUser.id)
    if (participant) {
      participant.cursor = { line, column }
    }
  }

  // 获取会话信息
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null
  }

  // 获取所有活跃会话
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.isActive)
  }

  private generateShareLink(): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const sessionId = Math.random().toString(36).slice(2, 10)
    return `${baseUrl}/share/${sessionId}`
  }
}

// 分享管理器
export class ShareManager {
  private sharedProjects: Map<string, SharedProject> = new Map()

  constructor() {
    this.loadSharedProjects()
  }

  // 创建分享
  createShare(
    name: string,
    description: string,
    files: Array<{ name: string; content: string; language: string }>,
    settings: ShareSettings,
  ): SharedProject {
    const project: SharedProject = {
      id: Math.random().toString(36).slice(2),
      name,
      description,
      files,
      owner: "当前用户",
      createdAt: new Date(),
      settings,
      views: 0,
      forks: 0,
    }

    this.sharedProjects.set(project.id, project)
    this.saveSharedProjects()

    return project
  }

  // 获取分享
  getShare(id: string): SharedProject | null {
    const project = this.sharedProjects.get(id)
    if (project) {
      project.views++
      this.saveSharedProjects()
    }
    return project || null
  }

  // 获取所有分享
  getAllShares(): SharedProject[] {
    return Array.from(this.sharedProjects.values())
  }

  // Fork 项目
  forkProject(id: string): SharedProject | null {
    const original = this.sharedProjects.get(id)
    if (!original) return null

    original.forks++

    const forked: SharedProject = {
      ...original,
      id: Math.random().toString(36).slice(2),
      name: `${original.name} (Fork)`,
      owner: "当前用户",
      createdAt: new Date(),
      views: 0,
      forks: 0,
    }

    this.sharedProjects.set(forked.id, forked)
    this.saveSharedProjects()

    return forked
  }

  // 删除分享
  deleteShare(id: string): boolean {
    const deleted = this.sharedProjects.delete(id)
    if (deleted) {
      this.saveSharedProjects()
    }
    return deleted
  }

  // 生成分享链接
  generateShareLink(projectId: string): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/share/${projectId}`
  }

  // 生成嵌入代码
  generateEmbedCode(projectId: string): string {
    const shareLink = this.generateShareLink(projectId)
    return `<iframe src="${shareLink}/embed" width="100%" height="600" frameborder="0"></iframe>`
  }

  // 导出项目
  exportProject(id: string): string {
    const project = this.sharedProjects.get(id)
    if (!project) return ""

    return JSON.stringify(project, null, 2)
  }

  // 导入项目
  importProject(data: string): SharedProject | null {
    try {
      const project: SharedProject = JSON.parse(data)
      project.id = Math.random().toString(36).slice(2)
      project.createdAt = new Date()
      project.views = 0
      project.forks = 0

      this.sharedProjects.set(project.id, project)
      this.saveSharedProjects()

      return project
    } catch (error) {
      console.error("[v0] Failed to import project:", error)
      return null
    }
  }

  private saveSharedProjects(): void {
    try {
      const data = Array.from(this.sharedProjects.values())
      localStorage.setItem("shared-projects", JSON.stringify(data))
    } catch (error) {
      console.error("[v0] Failed to save shared projects:", error)
    }
  }

  private loadSharedProjects(): void {
    try {
      const data = localStorage.getItem("shared-projects")
      if (data) {
        const projects: SharedProject[] = JSON.parse(data)
        projects.forEach((p) => {
          this.sharedProjects.set(p.id, {
            ...p,
            createdAt: new Date(p.createdAt),
          })
        })
      }
    } catch (error) {
      console.error("[v0] Failed to load shared projects:", error)
    }
  }
}

// 全局实例
let collaborationManagerInstance: CollaborationManager | null = null
let shareManagerInstance: ShareManager | null = null

export function getCollaborationManager(userName?: string): CollaborationManager {
  if (!collaborationManagerInstance) {
    collaborationManagerInstance = new CollaborationManager(userName)
  }
  return collaborationManagerInstance
}

export function getShareManager(): ShareManager {
  if (!shareManagerInstance) {
    shareManagerInstance = new ShareManager()
  }
  return shareManagerInstance
}
