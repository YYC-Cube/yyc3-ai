interface APIKeyConfig {
  id: string
  provider: string
  apiKey: string
  encryptedKey: string
  isEncrypted: boolean
  createdAt: number
  lastUsed: number
  usageCount: number
}

export class APIKeyManager {
  private keys: Map<string, APIKeyConfig> = new Map()
  private readonly STORAGE_KEY = "ai-api-keys"
  private readonly ENCRYPTION_KEY = "v0-ai-assistant-key"

  constructor() {
    this.loadFromStorage()
  }

  // 添加API密钥(自动加密)
  addKey(provider: string, apiKey: string): string {
    const id = this.generateId()
    const encryptedKey = this.encrypt(apiKey)

    const config: APIKeyConfig = {
      id,
      provider,
      apiKey: "",
      encryptedKey,
      isEncrypted: true,
      createdAt: Date.now(),
      lastUsed: 0,
      usageCount: 0,
    }

    this.keys.set(id, config)
    this.saveToStorage()
    return id
  }

  // 获取解密后的API密钥
  getKey(id: string): string | null {
    const config = this.keys.get(id)
    if (!config) return null

    config.lastUsed = Date.now()
    config.usageCount++
    this.saveToStorage()

    if (config.isEncrypted) {
      return this.decrypt(config.encryptedKey)
    }
    return config.apiKey
  }

  // 按提供商获取密钥
  getKeyByProvider(provider: string): string | null {
    const config = Array.from(this.keys.values()).find((k) => k.provider === provider)
    if (!config) return null
    return this.getKey(config.id)
  }

  // 删除密钥
  deleteKey(id: string): void {
    this.keys.delete(id)
    this.saveToStorage()
  }

  // 列出所有密钥(隐藏敏感信息)
  listKeys(): Array<{ id: string; provider: string; maskedKey: string; lastUsed: number; usageCount: number }> {
    return Array.from(this.keys.values()).map((config) => {
      const decrypted = config.isEncrypted ? this.decrypt(config.encryptedKey) : config.apiKey
      const maskedKey = this.maskKey(decrypted)

      return {
        id: config.id,
        provider: config.provider,
        maskedKey,
        lastUsed: config.lastUsed,
        usageCount: config.usageCount,
      }
    })
  }

  // 测试密钥是否有效
  async testKey(id: string): Promise<boolean> {
    const apiKey = this.getKey(id)
    if (!apiKey) return false

    // 这里应该调用实际的API进行测试
    // 简化版本:检查密钥格式
    return apiKey.length > 10
  }

  // 简单加密(实际生产环境应使用更强的加密算法)
  private encrypt(text: string): string {
    if (typeof window === "undefined") return Buffer.from(text).toString("base64")

    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const key = encoder.encode(this.ENCRYPTION_KEY)

    const encrypted = Array.from(data).map((byte, i) => byte ^ key[i % key.length])
    return btoa(String.fromCharCode(...encrypted))
  }

  // 简单解密
  private decrypt(encrypted: string): string {
    if (typeof window === "undefined") return Buffer.from(encrypted, "base64").toString("utf-8")

    try {
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      const key = encoder.encode(this.ENCRYPTION_KEY)

      const decoded = atob(encrypted)
      const data = Array.from(decoded).map((char) => char.charCodeAt(0))
      const decrypted = data.map((byte, i) => byte ^ key[i % key.length])

      return decoder.decode(new Uint8Array(decrypted))
    } catch (error) {
      console.error("[v0] 解密失败:", error)
      return ""
    }
  }

  // 隐藏密钥
  private maskKey(key: string): string {
    if (key.length <= 8) return "****"
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  // 生成ID
  private generateId(): string {
    return `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 持久化存储
  private saveToStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = JSON.stringify(Array.from(this.keys.entries()))
      localStorage.setItem(this.STORAGE_KEY, data)
    } catch (error) {
      console.error("[v0] 保存密钥失败:", error)
    }
  }

  // 从存储加载
  private loadFromStorage(): void {
    if (typeof window === "undefined") return
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (data) {
        const entries = JSON.parse(data) as [string, APIKeyConfig][]
        this.keys = new Map(entries)
      }
    } catch (error) {
      console.error("[v0] 加载密钥失败:", error)
    }
  }

  // 清空所有密钥
  clearAll(): void {
    this.keys.clear()
    this.saveToStorage()
  }

  // 导出密钥(加密)
  exportKeys(): string {
    const data = Array.from(this.keys.values())
    return JSON.stringify(data, null, 2)
  }

  // 导入密钥
  importKeys(json: string): number {
    try {
      const imported = JSON.parse(json) as APIKeyConfig[]
      let count = 0

      imported.forEach((config) => {
        config.id = this.generateId()
        this.keys.set(config.id, config)
        count++
      })

      this.saveToStorage()
      return count
    } catch (error) {
      console.error("[v0] 导入密钥失败:", error)
      return 0
    }
  }
}

export const apiKeyManager = new APIKeyManager()
