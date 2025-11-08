// 实时协作服务 - WebRTC + WebSocket
export interface CollaborationSession {
  id: string
  hostId: string
  participants: Participant[]
  document: string
  cursors: Map<string, CursorPosition>
  createdAt: Date
}

export interface Participant {
  id: string
  username: string
  avatar?: string
  color: string
  isHost: boolean
  isActive: boolean
  lastSeen: Date
}

export interface CursorPosition {
  line: number
  column: number
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

export interface CollaborationUpdate {
  type: "insert" | "delete" | "cursor" | "selection"
  userId: string
  position: { line: number; column: number }
  content?: string
  timestamp: Date
}

class CollaborationService {
  private ws: WebSocket | null = null
  private sessions: Map<string, CollaborationSession> = new Map()
  private currentSessionId: string | null = null
  private reconnectAttempts = 0
  private readonly MAX_RECONNECT_ATTEMPTS = 5
  private readonly WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"

  // 创建协作会话
  async createSession(userId: string, username: string, initialDocument: string): Promise<CollaborationSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: CollaborationSession = {
      id: sessionId,
      hostId: userId,
      participants: [
        {
          id: userId,
          username,
          color: this.generateColor(),
          isHost: true,
          isActive: true,
          lastSeen: new Date(),
        },
      ],
      document: initialDocument,
      cursors: new Map(),
      createdAt: new Date(),
    }

    this.sessions.set(sessionId, session)
    this.currentSessionId = sessionId

    // 连接WebSocket
    await this.connectWebSocket(sessionId)

    return session
  }

  // 加入协作会话
  async joinSession(sessionId: string, userId: string, username: string): Promise<CollaborationSession | null> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      // 从服务器获取会话信息
      const remoteSession = await this.fetchSessionFromServer(sessionId)
      if (!remoteSession) return null

      this.sessions.set(sessionId, remoteSession)
    }

    const updatedSession = this.sessions.get(sessionId)!

    // 添加参与者
    if (!updatedSession.participants.find((p) => p.id === userId)) {
      updatedSession.participants.push({
        id: userId,
        username,
        color: this.generateColor(),
        isHost: false,
        isActive: true,
        lastSeen: new Date(),
      })
    }

    this.currentSessionId = sessionId
    await this.connectWebSocket(sessionId)

    return updatedSession
  }

  // 离开会话
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) return

    // 更新参与者状态
    const participant = session.participants.find((p) => p.id === userId)
    if (participant) {
      participant.isActive = false
      participant.lastSeen = new Date()
    }

    // 如果是主持人离开，转移主持权
    if (session.hostId === userId) {
      const nextHost = session.participants.find((p) => p.isActive && p.id !== userId)
      if (nextHost) {
        session.hostId = nextHost.id
        nextHost.isHost = true
      }
    }

    // 断开WebSocket
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.currentSessionId = null
  }

  // 发送文本更新
  async sendUpdate(update: CollaborationUpdate): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[v0] WebSocket not connected")
      return
    }

    this.ws.send(
      JSON.stringify({
        type: "update",
        sessionId: this.currentSessionId,
        update,
      }),
    )

    // 更新本地会话
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId)
      if (session && update.type === "cursor") {
        session.cursors.set(update.userId, update.position)
      }
    }
  }

  // 发送光标位置
  async sendCursor(userId: string, position: CursorPosition): Promise<void> {
    const update: CollaborationUpdate = {
      type: "cursor",
      userId,
      position: { line: position.line, column: position.column },
      timestamp: new Date(),
    }

    await this.sendUpdate(update)
  }

  // 接收更新的回调
  onUpdate(callback: (update: CollaborationUpdate) => void): void {
    if (this.ws) {
      this.ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "update") {
            callback(data.update)
          }
        } catch (error) {
          console.error("[v0] Failed to parse update:", error)
        }
      })
    }
  }

  // 获取会话信息
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null
  }

  // 获取所有参与者
  getParticipants(sessionId: string): Participant[] {
    const session = this.sessions.get(sessionId)
    return session ? session.participants : []
  }

  // 获取参与者光标位置
  getCursors(sessionId: string): Map<string, CursorPosition> {
    const session = this.sessions.get(sessionId)
    return session ? session.cursors : new Map()
  }

  // 私有方法

  private async connectWebSocket(sessionId: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.ws = new WebSocket(this.WS_URL)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0

        // 发送加入会话消息
        this.ws!.send(
          JSON.stringify({
            type: "join",
            sessionId,
          }),
        )
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.attemptReconnect(sessionId)
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }
    } catch (error) {
      console.error("[v0] Failed to connect WebSocket:", error)
      this.attemptReconnect(sessionId)
    }
  }

  private attemptReconnect(sessionId: string): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error("[v0] Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`[v0] Reconnecting in ${delay}ms...`)
    setTimeout(() => {
      this.connectWebSocket(sessionId)
    }, delay)
  }

  private async fetchSessionFromServer(sessionId: string): Promise<CollaborationSession | null> {
    try {
      const response = await fetch(`/api/collaboration/session/${sessionId}`)
      if (!response.ok) return null

      return await response.json()
    } catch (error) {
      console.error("[v0] Failed to fetch session:", error)
      return null
    }
  }

  private generateColor(): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52B788",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // 获取会话邀请链接
  getInviteLink(sessionId: string): string {
    return `${window.location.origin}/collaborate?session=${sessionId}`
  }

  // 检查WebSocket连接状态
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export const collaboration = new CollaborationService()
export default collaboration
