// 云端数据同步服务
export interface SyncData {
  userId: string
  key: string
  value: any
  version: number
  timestamp: Date
  device: string
}

export interface SyncConflict {
  localData: SyncData
  remoteData: SyncData
  resolution: "local" | "remote" | "merge"
}

class CloudSyncService {
  private syncQueue: SyncData[] = []
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private readonly SYNC_ENDPOINT = process.env.NEXT_PUBLIC_SYNC_API_URL || "/api/sync"

  // 启动自动同步
  startAutoSync(intervalMs = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.syncAll()
    }, intervalMs)

    // 立即执行一次同步
    this.syncAll()
  }

  // 停止自动同步
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // 同步单个数据项
  async sync(userId: string, key: string, value: any): Promise<void> {
    const syncData: SyncData = {
      userId,
      key,
      value,
      version: this.getLocalVersion(userId, key) + 1,
      timestamp: new Date(),
      device: this.getDeviceId(),
    }

    this.syncQueue.push(syncData)
    await this.processQueue()
  }

  // 同步所有数据
  async syncAll(): Promise<void> {
    if (this.isSyncing) return

    this.isSyncing = true
    try {
      const userId = this.getCurrentUserId()
      if (!userId) return

      // 获取本地所有数据
      const localData = this.getAllLocalData(userId)

      // 上传到云端
      await this.uploadToCloud(userId, localData)

      // 下载云端数据
      const remoteData = await this.downloadFromCloud(userId)

      // 合并数据
      await this.mergeData(userId, localData, remoteData)
    } catch (error) {
      console.error("[v0] Sync failed:", error)
    } finally {
      this.isSyncing = false
    }
  }

  // 下拉刷新（从云端获取最新数据）
  async pullFromCloud(userId: string): Promise<void> {
    const remoteData = await this.downloadFromCloud(userId)
    const localData = this.getAllLocalData(userId)

    // 只更新远程版本更新的数据
    for (const remote of remoteData) {
      const local = localData.find((l) => l.key === remote.key)
      if (!local || remote.version > local.version) {
        this.saveLocalData(remote)
      }
    }
  }

  // 推送到云端
  async pushToCloud(userId: string): Promise<void> {
    const localData = this.getAllLocalData(userId)
    await this.uploadToCloud(userId, localData)
  }

  // 处理同步冲突
  private async resolveConflict(conflict: SyncConflict): Promise<SyncData> {
    // 自动解决策略：选择最新版本
    if (conflict.localData.version > conflict.remoteData.version) {
      return conflict.localData
    } else if (conflict.remoteData.version > conflict.localData.version) {
      return conflict.remoteData
    } else {
      // 版本相同，选择最新时间戳
      return conflict.localData.timestamp > conflict.remoteData.timestamp ? conflict.localData : conflict.remoteData
    }
  }

  // 上传到云端
  private async uploadToCloud(userId: string, data: SyncData[]): Promise<void> {
    const token = localStorage.getItem("yyc3_auth_token")
    if (!token) throw new Error("未登录")

    const response = await fetch(`${this.SYNC_ENDPOINT}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, data }),
    })

    if (!response.ok) {
      throw new Error("上传失败")
    }
  }

  // 从云端下载
  private async downloadFromCloud(userId: string): Promise<SyncData[]> {
    const token = localStorage.getItem("yyc3_auth_token")
    if (!token) throw new Error("未登录")

    const response = await fetch(`${this.SYNC_ENDPOINT}/download?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("下载失败")
    }

    const result = await response.json()
    return result.data || []
  }

  // 合并本地和远程数据
  private async mergeData(userId: string, localData: SyncData[], remoteData: SyncData[]): Promise<void> {
    const conflicts: SyncConflict[] = []

    // 检测冲突
    for (const remote of remoteData) {
      const local = localData.find((l) => l.key === remote.key)

      if (local && local.version !== remote.version && local.timestamp !== remote.timestamp) {
        conflicts.push({
          localData: local,
          remoteData: remote,
          resolution: "merge",
        })
      } else if (!local || remote.version > local.version) {
        // 远程更新，直接保存
        this.saveLocalData(remote)
      }
    }

    // 解决冲突
    for (const conflict of conflicts) {
      const resolved = await this.resolveConflict(conflict)
      this.saveLocalData(resolved)
    }

    // 保存合并后的版本号
    localStorage.setItem(`yyc3_sync_version_${userId}`, Date.now().toString())
  }

  // 处理同步队列
  private async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0 || this.isSyncing) return

    this.isSyncing = true
    const batch = this.syncQueue.splice(0, 10) // 每次处理10条

    try {
      const userId = batch[0].userId
      await this.uploadToCloud(userId, batch)
    } catch (error) {
      console.error("[v0] Queue processing failed:", error)
      // 失败的数据重新加入队列
      this.syncQueue.push(...batch)
    } finally {
      this.isSyncing = false
    }
  }

  // 获取本地所有数据
  private getAllLocalData(userId: string): SyncData[] {
    const data: SyncData[] = []
    const prefix = `yyc3_${userId}_`

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix) && !key.includes("_version_")) {
        const value = localStorage.getItem(key)
        if (value) {
          const actualKey = key.replace(prefix, "")
          data.push({
            userId,
            key: actualKey,
            value: JSON.parse(value),
            version: this.getLocalVersion(userId, actualKey),
            timestamp: new Date(),
            device: this.getDeviceId(),
          })
        }
      }
    }

    return data
  }

  // 保存本地数据
  private saveLocalData(data: SyncData): void {
    const key = `yyc3_${data.userId}_${data.key}`
    localStorage.setItem(key, JSON.stringify(data.value))
    localStorage.setItem(`${key}_version`, data.version.toString())
    localStorage.setItem(`${key}_timestamp`, data.timestamp.toISOString())
  }

  // 获取本地版本号
  private getLocalVersion(userId: string, key: string): number {
    const versionKey = `yyc3_${userId}_${key}_version`
    const version = localStorage.getItem(versionKey)
    return version ? Number.parseInt(version, 10) : 0
  }

  // 获取设备ID
  private getDeviceId(): string {
    let deviceId = localStorage.getItem("yyc3_device_id")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("yyc3_device_id", deviceId)
    }
    return deviceId
  }

  // 获取当前用户ID
  private getCurrentUserId(): string | null {
    const token = localStorage.getItem("yyc3_auth_token")
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.userId
    } catch {
      return null
    }
  }

  // 获取同步状态
  getSyncStatus(): { isSyncing: boolean; queueSize: number; lastSync: Date | null } {
    const lastSyncStr = localStorage.getItem("yyc3_last_sync")
    return {
      isSyncing: this.isSyncing,
      queueSize: this.syncQueue.length,
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
    }
  }

  // 清除同步队列
  clearQueue(): void {
    this.syncQueue = []
  }
}

export const cloudSync = new CloudSyncService()
export default cloudSync
