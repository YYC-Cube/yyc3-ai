interface ConversationMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  tokens?: number
  parentId?: string
}

interface ConversationBranch {
  id: string
  parentMessageId: string
  messages: ConversationMessage[]
  createdAt: number
}

interface ConversationMetadata {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  totalTokens: number
  maxContextTokens: number
  branches: ConversationBranch[]
}

export class ConversationManager {
  private conversations: Map<string, ConversationMetadata> = new Map()
  private readonly MAX_CONTEXT_TOKENS = 8000
  private readonly SUMMARY_THRESHOLD = 6000

  constructor() {
    this.loadFromStorage()
  }

  // 创建新对话
  createConversation(title = "新对话"): ConversationMetadata {
    const conversation: ConversationMetadata = {
      id: this.generateId(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalTokens: 0,
      maxContextTokens: this.MAX_CONTEXT_TOKENS,
      branches: [
        {
          id: "main",
          parentMessageId: "",
          messages: [],
          createdAt: Date.now(),
        },
      ],
    }

    this.conversations.set(conversation.id, conversation)
    this.saveToStorage()
    return conversation
  }

  // 添加消息
  addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    branchId = "main",
  ): ConversationMessage {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) throw new Error("对话不存在")

    const branch = conversation.branches.find((b) => b.id === branchId)
    if (!branch) throw new Error("分支不存在")

    const message: ConversationMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: Date.now(),
      tokens: this.estimateTokens(content),
      parentId: branch.messages[branch.messages.length - 1]?.id,
    }

    branch.messages.push(message)
    conversation.totalTokens += message.tokens || 0
    conversation.updatedAt = Date.now()

    // 检查是否需要压缩上下文
    if (conversation.totalTokens > this.SUMMARY_THRESHOLD) {
      this.compressContext(conversationId, branchId)
    }

    this.saveToStorage()
    return message
  }

  // 创建分支
  createBranch(conversationId: string, parentMessageId: string): ConversationBranch {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) throw new Error("对话不存在")

    const mainBranch = conversation.branches.find((b) => b.id === "main")
    if (!mainBranch) throw new Error("主分支不存在")

    const parentIndex = mainBranch.messages.findIndex((m) => m.id === parentMessageId)
    if (parentIndex === -1) throw new Error("父消息不存在")

    const newBranch: ConversationBranch = {
      id: this.generateId(),
      parentMessageId,
      messages: mainBranch.messages.slice(0, parentIndex + 1),
      createdAt: Date.now(),
    }

    conversation.branches.push(newBranch)
    this.saveToStorage()
    return newBranch
  }

  // 切换到分支
  switchToBranch(conversationId: string, branchId: string): ConversationBranch {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) throw new Error("对话不存在")

    const branch = conversation.branches.find((b) => b.id === branchId)
    if (!branch) throw new Error("分支不存在")

    return branch
  }

  // 获取对话上下文(自动管理长度)
  getContext(conversationId: string, branchId = "main", maxTokens?: number): ConversationMessage[] {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return []

    const branch = conversation.branches.find((b) => b.id === branchId)
    if (!branch) return []

    const limit = maxTokens || conversation.maxContextTokens
    const messages: ConversationMessage[] = []
    let currentTokens = 0

    // 从最新消息开始,逆序添加直到达到token限制
    for (let i = branch.messages.length - 1; i >= 0; i--) {
      const msg = branch.messages[i]
      const msgTokens = msg.tokens || 0

      if (currentTokens + msgTokens > limit) {
        break
      }

      messages.unshift(msg)
      currentTokens += msgTokens
    }

    return messages
  }

  // 压缩上下文(使用AI总结)
  private async compressContext(conversationId: string, branchId: string): Promise<void> {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return

    const branch = conversation.branches.find((b) => b.id === branchId)
    if (!branch || branch.messages.length < 10) return

    // 保留最近的5条消息,将之前的消息总结
    const recentMessages = branch.messages.slice(-5)
    const oldMessages = branch.messages.slice(0, -5)

    const summary = this.generateSummary(oldMessages)
    const summaryMessage: ConversationMessage = {
      id: this.generateId(),
      role: "system",
      content: `[对话摘要] ${summary}`,
      timestamp: Date.now(),
      tokens: this.estimateTokens(summary),
    }

    branch.messages = [summaryMessage, ...recentMessages]
    conversation.totalTokens = branch.messages.reduce((sum, m) => sum + (m.tokens || 0), 0)
    this.saveToStorage()
  }

  // 生成对话摘要
  private generateSummary(messages: ConversationMessage[]): string {
    const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content)
    const topics = new Set<string>()

    userMessages.forEach((content) => {
      if (content.includes("代码")) topics.add("代码")
      if (content.includes("调试")) topics.add("调试")
      if (content.includes("优化")) topics.add("优化")
      if (content.includes("功能")) topics.add("功能开发")
    })

    const topicList = Array.from(topics).join("、")
    return `用户讨论了${topicList},共${messages.length}条消息`
  }

  // 导出对话为 Markdown
  exportToMarkdown(conversationId: string, branchId = "main"): string {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return ""

    const branch = conversation.branches.find((b) => b.id === branchId)
    if (!branch) return ""

    let markdown = `# ${conversation.title}\n\n`
    markdown += `创建时间: ${new Date(conversation.createdAt).toLocaleString()}\n`
    markdown += `更新时间: ${new Date(conversation.updatedAt).toLocaleString()}\n`
    markdown += `总消息数: ${branch.messages.length}\n\n`
    markdown += `---\n\n`

    branch.messages.forEach((msg) => {
      const time = new Date(msg.timestamp).toLocaleString()
      const role = msg.role === "user" ? "👤 用户" : msg.role === "assistant" ? "🤖 AI助手" : "⚙️ 系统"

      markdown += `## ${role} (${time})\n\n`
      markdown += `${msg.content}\n\n`
      markdown += `---\n\n`
    })

    return markdown
  }

  // 导出对话为 JSON
  exportToJSON(conversationId: string): string {
    const conversation = this.conversations.get(conversationId)
    if (!conversation) return "{}"

    return JSON.stringify(
      {
        ...conversation,
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    )
  }

  // 导入对话
  importFromJSON(json: string): ConversationMetadata {
    const conversation = JSON.parse(json) as ConversationMetadata
    conversation.id = this.generateId()
    this.conversations.set(conversation.id, conversation)
    this.saveToStorage()
    return conversation
  }

  // 删除对话
  deleteConversation(conversationId: string): void {
    this.conversations.delete(conversationId)
    this.saveToStorage()
  }

  // 获取所有对话
  getAllConversations(): ConversationMetadata[] {
    return Array.from(this.conversations.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  // Token估算
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  // 生成ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 持久化存储
  private saveToStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = JSON.stringify(Array.from(this.conversations.entries()))
      localStorage.setItem("ai-conversations", data)
    } catch (error) {
      console.error("[v0] 保存对话失败:", error)
    }
  }

  // 从存储加载
  private loadFromStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = localStorage.getItem("ai-conversations")
      if (data) {
        const entries = JSON.parse(data) as [string, ConversationMetadata][]
        this.conversations = new Map(entries)
      }
    } catch (error) {
      console.error("[v0] 加载对话失败:", error)
    }
  }
}

export const conversationManager = new ConversationManager()
