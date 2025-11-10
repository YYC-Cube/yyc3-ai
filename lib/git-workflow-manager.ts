// Git工作流规范管理器 - 自动化Git操作和分支管理
export interface GitBranch {
  name: string
  type: "main" | "develop" | "feature" | "hotfix" | "release"
  baseBranch: string
  createdAt: Date
  lastCommit: string
  status: "active" | "merged" | "deleted"
}

export interface GitCommit {
  hash: string
  message: string
  author: string
  timestamp: Date
  files: string[]
  type: "feat" | "fix" | "docs" | "style" | "refactor" | "test" | "chore"
}

export interface GitWorkflowConfig {
  mainBranch: string
  developBranch: string
  featurePrefix: string
  hotfixPrefix: string
  releasePrefix: string
  commitMessageRules: {
    maxLength: number
    requireType: boolean
    requireScope: boolean
  }
}

class GitWorkflowManager {
  private config: GitWorkflowConfig = {
    mainBranch: "main",
    developBranch: "develop",
    featurePrefix: "feature/",
    hotfixPrefix: "hotfix/",
    releasePrefix: "release/",
    commitMessageRules: {
      maxLength: 72,
      requireType: true,
      requireScope: false,
    },
  }

  private branches: Map<string, GitBranch> = new Map()
  private commits: GitCommit[] = []
  private currentBranch = "main"

  constructor(config?: Partial<GitWorkflowConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.initializeBranches()
    this.loadFromStorage()
  }

  // 初始化默认分支
  private initializeBranches(): void {
    this.branches.set(this.config.mainBranch, {
      name: this.config.mainBranch,
      type: "main",
      baseBranch: "",
      createdAt: new Date(),
      lastCommit: "",
      status: "active",
    })

    this.branches.set(this.config.developBranch, {
      name: this.config.developBranch,
      type: "develop",
      baseBranch: this.config.mainBranch,
      createdAt: new Date(),
      lastCommit: "",
      status: "active",
    })
  }

  // 创建新分支
  createBranch(name: string, type: GitBranch["type"], baseBranch?: string): GitBranch {
    const fullName = this.getBranchFullName(name, type)

    if (this.branches.has(fullName)) {
      throw new Error(`分支 ${fullName} 已存在`)
    }

    const base = baseBranch || this.getDefaultBaseBranch(type)
    const branch: GitBranch = {
      name: fullName,
      type,
      baseBranch: base,
      createdAt: new Date(),
      lastCommit: "",
      status: "active",
    }

    this.branches.set(fullName, branch)
    this.saveToStorage()
    return branch
  }

  // 获取分支全名
  private getBranchFullName(name: string, type: GitBranch["type"]): string {
    switch (type) {
      case "feature":
        return name.startsWith(this.config.featurePrefix) ? name : `${this.config.featurePrefix}${name}`
      case "hotfix":
        return name.startsWith(this.config.hotfixPrefix) ? name : `${this.config.hotfixPrefix}${name}`
      case "release":
        return name.startsWith(this.config.releasePrefix) ? name : `${this.config.releasePrefix}${name}`
      default:
        return name
    }
  }

  // 获取默认基础分支
  private getDefaultBaseBranch(type: GitBranch["type"]): string {
    switch (type) {
      case "feature":
      case "release":
        return this.config.developBranch
      case "hotfix":
        return this.config.mainBranch
      default:
        return this.config.mainBranch
    }
  }

  // 切换分支
  checkoutBranch(name: string): boolean {
    const branch = this.branches.get(name)
    if (!branch || branch.status !== "active") {
      return false
    }

    this.currentBranch = name
    this.saveToStorage()
    return true
  }

  // 创建提交
  commit(message: string, files: string[], type?: GitCommit["type"]): GitCommit {
    const validation = this.validateCommitMessage(message)
    if (!validation.valid) {
      throw new Error(`提交消息不符合规范: ${validation.error}`)
    }

    const commitType = type || this.extractCommitType(message)
    const commit: GitCommit = {
      hash: this.generateCommitHash(),
      message,
      author: "当前用户",
      timestamp: new Date(),
      files,
      type: commitType,
    }

    this.commits.unshift(commit)

    // 更新当前分支的最后提交
    const currentBranch = this.branches.get(this.currentBranch)
    if (currentBranch) {
      currentBranch.lastCommit = commit.hash
      this.branches.set(this.currentBranch, currentBranch)
    }

    // 限制提交历史数量
    if (this.commits.length > 100) {
      this.commits = this.commits.slice(0, 100)
    }

    this.saveToStorage()
    return commit
  }

  // 验证提交消息
  validateCommitMessage(message: string): { valid: boolean; error?: string } {
    if (message.length === 0) {
      return { valid: false, error: "提交消息不能为空" }
    }

    if (message.length > this.config.commitMessageRules.maxLength) {
      return {
        valid: false,
        error: `提交消息超过最大长度 ${this.config.commitMessageRules.maxLength}`,
      }
    }

    if (this.config.commitMessageRules.requireType) {
      const types = ["feat", "fix", "docs", "style", "refactor", "test", "chore"]
      const hasType = types.some((type) => message.toLowerCase().startsWith(`${type}:`))

      if (!hasType) {
        return {
          valid: false,
          error: `提交消息必须以类型开头 (${types.join(", ")}): 例如 "feat: 添加新功能"`,
        }
      }
    }

    return { valid: true }
  }

  // 提取提交类型
  private extractCommitType(message: string): GitCommit["type"] {
    const lowerMessage = message.toLowerCase()
    const types: GitCommit["type"][] = ["feat", "fix", "docs", "style", "refactor", "test", "chore"]

    for (const type of types) {
      if (lowerMessage.startsWith(`${type}:`)) {
        return type
      }
    }

    return "chore"
  }

  // 合并分支
  mergeBranch(sourceBranch: string, targetBranch: string): { success: boolean; conflicts?: string[] } {
    const source = this.branches.get(sourceBranch)
    const target = this.branches.get(targetBranch)

    if (!source || !target) {
      return { success: false, conflicts: ["源分支或目标分支不存在"] }
    }

    if (source.status !== "active" || target.status !== "active") {
      return { success: false, conflicts: ["分支状态不正确"] }
    }

    // 模拟合并操作
    source.status = "merged"
    this.branches.set(sourceBranch, source)

    // 创建合并提交
    this.currentBranch = targetBranch
    this.commit(`Merge branch '${sourceBranch}' into '${targetBranch}'`, [], "chore")

    this.saveToStorage()
    return { success: true }
  }

  // 删除分支
  deleteBranch(name: string, force = false): boolean {
    const branch = this.branches.get(name)
    if (!branch) return false

    // 不能删除主要分支
    if (branch.type === "main" || branch.type === "develop") {
      if (!force) return false
    }

    // 不能删除当前分支
    if (name === this.currentBranch) {
      return false
    }

    branch.status = "deleted"
    this.branches.set(name, branch)
    this.saveToStorage()
    return true
  }

  // 获取所有分支
  getAllBranches(): GitBranch[] {
    return Array.from(this.branches.values()).filter((b) => b.status === "active")
  }

  // 获取提交历史
  getCommitHistory(limit = 20): GitCommit[] {
    return this.commits.slice(0, limit)
  }

  // 获取当前分支
  getCurrentBranch(): string {
    return this.currentBranch
  }

  // 生成提交哈希
  private generateCommitHash(): string {
    return Math.random().toString(36).substring(2, 9)
  }

  // 格式化提交消息
  formatCommitMessage(type: GitCommit["type"], scope: string | null, description: string): string {
    if (scope) {
      return `${type}(${scope}): ${description}`
    }
    return `${type}: ${description}`
  }

  // 获取分支统计
  getBranchStatistics(): {
    totalBranches: number
    activeBranches: number
    mergedBranches: number
    featureBranches: number
    hotfixBranches: number
  } {
    const all = Array.from(this.branches.values())
    return {
      totalBranches: all.length,
      activeBranches: all.filter((b) => b.status === "active").length,
      mergedBranches: all.filter((b) => b.status === "merged").length,
      featureBranches: all.filter((b) => b.type === "feature" && b.status === "active").length,
      hotfixBranches: all.filter((b) => b.type === "hotfix" && b.status === "active").length,
    }
  }

  // 持久化
  private saveToStorage(): void {
    try {
      localStorage.setItem("git-branches", JSON.stringify(Array.from(this.branches.entries())))
      localStorage.setItem("git-commits", JSON.stringify(this.commits))
      localStorage.setItem("git-current-branch", this.currentBranch)
    } catch (error) {
      console.error("[v0] Failed to save git data:", error)
    }
  }

  private loadFromStorage(): void {
    try {
      const branchesData = localStorage.getItem("git-branches")
      if (branchesData) {
        const entries = JSON.parse(branchesData)
        this.branches = new Map(entries)
      }

      const commitsData = localStorage.getItem("git-commits")
      if (commitsData) {
        this.commits = JSON.parse(commitsData)
      }

      const currentBranch = localStorage.getItem("git-current-branch")
      if (currentBranch) {
        this.currentBranch = currentBranch
      }
    } catch (error) {
      console.error("[v0] Failed to load git data:", error)
    }
  }
}

export const gitWorkflow = new GitWorkflowManager()
