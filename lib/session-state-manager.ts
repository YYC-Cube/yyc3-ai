// 会话状态管理 - 维护对话状态、历史记录管理
export interface SessionState {
  id: string
  userId: string
  startTime: Date
  lastActivity: Date
  isActive: boolean
  context: Record<string, any>
  history: SessionHistory[]
  metadata: SessionMetadata
}

export interface SessionHistory {
  id: string
  timestamp: Date
  type: "interaction" | "event" | "error"
  data: any
}

export interface SessionMetadata {
  totalInteractions: number
  successfulInteractions: number
  errors: number
  averageResponseTime: number
  tags: string[]
}

class SessionStateManager {
  private sessions: Map<string, SessionState> = new Map()
  private currentSessionId: string | null = null
  private maxHistorySize = 1000
  private sessionTimeout = 30 * 60 * 1000 // 30分钟

  // 创建新会话
  createSession(userId: string): SessionState {
    const sessionId = this.generateSessionId()
    const session: SessionState = {
      id: sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      isActive: true,
      context: {},
      history: [],
      metadata: {
        totalInteractions: 0,
        successfulInteractions: 0,
        errors: 0,
        averageResponseTime: 0,
        tags: [],
      },
    }

    this.sessions.set(sessionId, session)
    this.currentSessionId = sessionId

    // 持久化到localStorage
    this.persistSession(session)

    return session
  }

  // 获取当前会话
  getCurrentSession(): SessionState | null {
    if (!this.currentSessionId) return null
    return this.sessions.get(this.currentSessionId) || null
  }

  // 更新会话上下文
  updateContext(key: string, value: any): void {
    const session = this.getCurrentSession()
    if (!session) return

    session.context[key] = value
    session.lastActivity = new Date()
    this.persistSession(session)
  }

  // 批量更新上下文
  batchUpdateContext(updates: Record<string, any>): void {
    const session = this.getCurrentSession()
    if (!session) return

    Object.assign(session.context, updates)
    session.lastActivity = new Date()
    this.persistSession(session)
  }

  // 获取上下文值
  getContext<T>(key: string): T | undefined {
    const session = this.getCurrentSession()
    return session?.context[key] as T | undefined
  }

  // 添加历史记录
  addHistory(type: SessionHistory["type"], data: any): void {
    const session = this.getCurrentSession()
    if (!session) return

    const historyEntry: SessionHistory = {
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
      type,
      data,
    }

    session.history.push(historyEntry)

    // 限制历史记录大小
    if (session.history.length > this.maxHistorySize) {
      session.history = session.history.slice(-this.maxHistorySize)
    }

    // 更新元数据
    session.metadata.totalInteractions++
    if (type === "interaction" && data.success) {
      session.metadata.successfulInteractions++
    }
    if (type === "error") {
      session.metadata.errors++
    }

    session.lastActivity = new Date()
    this.persistSession(session)
  }

  // 获取历史记录
  getHistory(filter?: {
    type?: SessionHistory["type"]
    startTime?: Date
    endTime?: Date
    limit?: number
  }): SessionHistory[] {
    const session = this.getCurrentSession()
    if (!session) return []

    let history = session.history

    // 应用过滤
    if (filter) {
      if (filter.type) {
        history = history.filter((h) => h.type === filter.type)
      }
      if (filter.startTime) {
        history = history.filter((h) => h.timestamp >= filter.startTime!)
      }
      if (filter.endTime) {
        history = history.filter((h) => h.timestamp <= filter.endTime!)
      }
      if (filter.limit) {
        history = history.slice(-filter.limit)
      }
    }

    return history
  }

  // 清除历史记录
  clearHistory(): void {
    const session = this.getCurrentSession()
    if (!session) return

    session.history = []
    this.persistSession(session)
  }

  // 结束会话
  endSession(): void {
    const session = this.getCurrentSession()
    if (!session) return

    session.isActive = false
    this.persistSession(session)

    // 移除当前会话引用
    this.currentSessionId = null
  }

  // 恢复会话
  resumeSession(sessionId: string): SessionState | null {
    // 尝试从内存加载
    let session = this.sessions.get(sessionId)

    // 尝试从localStorage恢复
    if (!session) {
      session = this.loadSession(sessionId)
      if (session) {
        this.sessions.set(sessionId, session)
      }
    }

    if (session) {
      session.isActive = true
      session.lastActivity = new Date()
      this.currentSessionId = sessionId
      this.persistSession(session)
    }

    return session || null
  }

  // 获取所有会话
  getAllSessions(): SessionState[] {
    return Array.from(this.sessions.values())
  }

  // 清理过期会话
  cleanupExpiredSessions(): void {
    const now = Date.now()

    this.sessions.forEach((session, sessionId) => {
      const timeSinceLastActivity = now - session.lastActivity.getTime()
      if (timeSinceLastActivity > this.sessionTimeout) {
        session.isActive = false
        this.persistSession(session)
      }
    })
  }

  // 获取会话统计
  getSessionStats(): {
    totalSessions: number
    activeSessions: number
    averageSessionDuration: number
    totalInteractions: number
  } {
    const sessions = this.getAllSessions()

    const totalSessions = sessions.length
    const activeSessions = sessions.filter((s) => s.isActive).length

    const totalDuration = sessions.reduce((sum, s) => {
      const duration = s.lastActivity.getTime() - s.startTime.getTime()
      return sum + duration
    }, 0)

    const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

    const totalInteractions = sessions.reduce((sum, s) => sum + s.metadata.totalInteractions, 0)

    return {
      totalSessions,
      activeSessions,
      averageSessionDuration,
      totalInteractions,
    }
  }

  // 辅助方法
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }

  private persistSession(session: SessionState): void {
    try {
      localStorage.setItem(`session_${session.id}`, JSON.stringify(session))
    } catch (error) {
      console.error("[v0] 无法持久化会话:", error)
    }
  }

  private loadSession(sessionId: string): SessionState | null {
    try {
      const data = localStorage.getItem(`session_${sessionId}`)
      if (data) {
        const session = JSON.parse(data)
        // 恢复Date对象
        session.startTime = new Date(session.startTime)
        session.lastActivity = new Date(session.lastActivity)
        session.history = session.history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }))
        return session
      }
    } catch (error) {
      console.error("[v0] 无法加载会话:", error)
    }
    return null
  }

  // 启动自动清理
  startAutoCleanup(interval: number = 5 * 60 * 1000): void {
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, interval)
  }
}

export const sessionStateManager = new SessionStateManager()

// 启动自动清理
if (typeof window !== "undefined") {
  sessionStateManager.startAutoCleanup()
}
