// 用户认证服务 - 支持多用户数据隔离
import { jwtVerify, SignJWT } from "jose"

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: Date
  plan: "free" | "pro" | "enterprise"
  permissions: string[]
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
}

class AuthService {
  private readonly JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
  )
  private readonly TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

  // 用户注册
  async register(data: RegisterData): Promise<AuthSession> {
    // 验证输入
    if (!data.email || !data.username || !data.password) {
      throw new Error("所有字段都是必填的")
    }

    if (data.password.length < 8) {
      throw new Error("密码至少需要8个字符")
    }

    // 检查用户是否已存在
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new Error("该邮箱已被注册")
    }

    // 创建新用户
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      username: data.username,
      createdAt: new Date(),
      plan: "free",
      permissions: ["read", "write"],
    }

    // 哈希密码
    const hashedPassword = await this.hashPassword(data.password)

    // 保存用户
    await this.saveUser(user, hashedPassword)

    // 生成token
    const token = await this.generateToken(user)
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY)

    return { user, token, expiresAt }
  }

  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const user = await this.getUserByEmail(credentials.email)
    if (!user) {
      throw new Error("用户不存在")
    }

    const isValidPassword = await this.verifyPassword(credentials.password, user.id)
    if (!isValidPassword) {
      throw new Error("密码错误")
    }

    const token = await this.generateToken(user)
    const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY)

    return { user, token, expiresAt }
  }

  // 验证token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const { payload } = await jwtVerify(token, this.JWT_SECRET)
      const userId = payload.userId as string

      if (!userId) return null

      return await this.getUserById(userId)
    } catch (error) {
      console.error("[v0] Token verification failed:", error)
      return null
    }
  }

  // 刷新token
  async refreshToken(oldToken: string): Promise<string> {
    const user = await this.verifyToken(oldToken)
    if (!user) {
      throw new Error("无效的token")
    }

    return await this.generateToken(user)
  }

  // 登出
  async logout(token: string): Promise<void> {
    // 将token加入黑名单
    const blacklist = this.getBlacklist()
    blacklist.add(token)
    localStorage.setItem("yyc3_token_blacklist", JSON.stringify(Array.from(blacklist)))
  }

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    const token = this.getStoredToken()
    if (!token) return null

    // 检查黑名单
    if (this.isTokenBlacklisted(token)) {
      this.clearStoredToken()
      return null
    }

    return await this.verifyToken(token)
  }

  // 更新用户信息
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new Error("用户不存在")
    }

    const updatedUser = { ...user, ...updates }
    await this.saveUser(updatedUser)
    return updatedUser
  }

  // 修改密码
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const isValid = await this.verifyPassword(oldPassword, userId)
    if (!isValid) {
      throw new Error("旧密码错误")
    }

    if (newPassword.length < 8) {
      throw new Error("新密码至少需要8个字符")
    }

    const hashedPassword = await this.hashPassword(newPassword)
    await this.savePassword(userId, hashedPassword)
  }

  // 删除账户
  async deleteAccount(userId: string, password: string): Promise<void> {
    const isValid = await this.verifyPassword(password, userId)
    if (!isValid) {
      throw new Error("密码错误")
    }

    // 删除用户数据
    localStorage.removeItem(`yyc3_user_${userId}`)
    localStorage.removeItem(`yyc3_password_${userId}`)

    // 删除用户的所有数据
    this.deleteUserData(userId)
  }

  // 私有辅助方法

  private async generateToken(user: User): Promise<string> {
    return await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.JWT_SECRET)
  }

  private async hashPassword(password: string): Promise<string> {
    // 简单的哈希实现（生产环境应使用bcrypt或argon2）
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  private async verifyPassword(password: string, userId: string): Promise<boolean> {
    const storedHash = localStorage.getItem(`yyc3_password_${userId}`)
    if (!storedHash) return false

    const inputHash = await this.hashPassword(password)
    return inputHash === storedHash
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getAllUsers()
    return users.find((u) => u.email === email) || null
  }

  private async getUserById(userId: string): Promise<User | null> {
    const userData = localStorage.getItem(`yyc3_user_${userId}`)
    return userData ? JSON.parse(userData) : null
  }

  private async saveUser(user: User, password?: string): Promise<void> {
    localStorage.setItem(`yyc3_user_${user.id}`, JSON.stringify(user))
    if (password) {
      localStorage.setItem(`yyc3_password_${user.id}`, password)
    }

    // 更新用户列表
    const users = this.getAllUsers().filter((u) => u.id !== user.id)
    users.push(user)
    localStorage.setItem("yyc3_users", JSON.stringify(users))
  }

  private async savePassword(userId: string, hashedPassword: string): Promise<void> {
    localStorage.setItem(`yyc3_password_${userId}`, hashedPassword)
  }

  private getAllUsers(): User[] {
    const usersData = localStorage.getItem("yyc3_users")
    return usersData ? JSON.parse(usersData) : []
  }

  private getStoredToken(): string | null {
    return localStorage.getItem("yyc3_auth_token")
  }

  private clearStoredToken(): void {
    localStorage.removeItem("yyc3_auth_token")
  }

  private getBlacklist(): Set<string> {
    const data = localStorage.getItem("yyc3_token_blacklist")
    return data ? new Set(JSON.parse(data)) : new Set()
  }

  private isTokenBlacklisted(token: string): boolean {
    return this.getBlacklist().has(token)
  }

  private deleteUserData(userId: string): void {
    // 删除所有与用户相关的数据
    const keys = Object.keys(localStorage).filter((key) => key.includes(userId))
    keys.forEach((key) => localStorage.removeItem(key))
  }

  // 存储token
  storeToken(token: string): void {
    localStorage.setItem("yyc3_auth_token", token)
  }

  // 检查权限
  hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes("admin")
  }

  // 获取用户隔离的数据键
  getUserDataKey(userId: string, key: string): string {
    return `yyc3_${userId}_${key}`
  }
}

export const authService = new AuthService()
export default authService
