// 代码版本控制系统
export interface CodeVersion {
  id: string
  fileId: string
  content: string
  timestamp: Date
  message: string
  author: string
  changes: {
    additions: number
    deletions: number
    modifications: number
  }
}

export interface DiffLine {
  type: "add" | "remove" | "unchanged"
  lineNumber: number
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}

export class VersionControl {
  private versions: Map<string, CodeVersion[]> = new Map()
  private maxVersions = 50

  constructor(maxVersions = 50) {
    this.maxVersions = maxVersions
    this.loadFromStorage()
  }

  // 保存新版本
  saveVersion(fileId: string, content: string, message = "自动保存"): CodeVersion {
    const versions = this.versions.get(fileId) || []
    const previousVersion = versions[0]

    const changes = previousVersion
      ? this.calculateChanges(previousVersion.content, content)
      : { additions: content.split("\n").length, deletions: 0, modifications: 0 }

    const version: CodeVersion = {
      id: Math.random().toString(36).slice(2),
      fileId,
      content,
      timestamp: new Date(),
      message,
      author: "当前用户",
      changes,
    }

    versions.unshift(version)

    // 限制版本数量
    if (versions.length > this.maxVersions) {
      versions.splice(this.maxVersions)
    }

    this.versions.set(fileId, versions)
    this.saveToStorage()

    return version
  }

  // 获取文件的所有版本
  getVersions(fileId: string): CodeVersion[] {
    return this.versions.get(fileId) || []
  }

  // 获取特定版本
  getVersion(fileId: string, versionId: string): CodeVersion | null {
    const versions = this.versions.get(fileId) || []
    return versions.find((v) => v.id === versionId) || null
  }

  // 恢复到特定版本
  restoreVersion(fileId: string, versionId: string): CodeVersion | null {
    const version = this.getVersion(fileId, versionId)
    if (!version) return null

    return this.saveVersion(fileId, version.content, `恢复到版本: ${version.message}`)
  }

  // 比较两个版本
  compareVersions(oldContent: string, newContent: string): DiffLine[] {
    const oldLines = oldContent.split("\n")
    const newLines = newContent.split("\n")
    const diff: DiffLine[] = []

    // 简单的逐行比较算法
    let oldIndex = 0
    let newIndex = 0

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex]
      const newLine = newLines[newIndex]

      if (oldLine === newLine) {
        diff.push({
          type: "unchanged",
          lineNumber: newIndex + 1,
          content: newLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1,
        })
        oldIndex++
        newIndex++
      } else if (oldIndex >= oldLines.length) {
        diff.push({
          type: "add",
          lineNumber: newIndex + 1,
          content: newLine,
          newLineNumber: newIndex + 1,
        })
        newIndex++
      } else if (newIndex >= newLines.length) {
        diff.push({
          type: "remove",
          lineNumber: oldIndex + 1,
          content: oldLine,
          oldLineNumber: oldIndex + 1,
        })
        oldIndex++
      } else {
        // 检查是否是修改
        const nextOldLine = oldLines[oldIndex + 1]
        const nextNewLine = newLines[newIndex + 1]

        if (nextOldLine === newLine) {
          diff.push({
            type: "remove",
            lineNumber: oldIndex + 1,
            content: oldLine,
            oldLineNumber: oldIndex + 1,
          })
          oldIndex++
        } else if (nextNewLine === oldLine) {
          diff.push({
            type: "add",
            lineNumber: newIndex + 1,
            content: newLine,
            newLineNumber: newIndex + 1,
          })
          newIndex++
        } else {
          diff.push({
            type: "remove",
            lineNumber: oldIndex + 1,
            content: oldLine,
            oldLineNumber: oldIndex + 1,
          })
          diff.push({
            type: "add",
            lineNumber: newIndex + 1,
            content: newLine,
            newLineNumber: newIndex + 1,
          })
          oldIndex++
          newIndex++
        }
      }
    }

    return diff
  }

  // 计算变更统计
  private calculateChanges(
    oldContent: string,
    newContent: string,
  ): {
    additions: number
    deletions: number
    modifications: number
  } {
    const diff = this.compareVersions(oldContent, newContent)

    const additions = diff.filter((d) => d.type === "add").length
    const deletions = diff.filter((d) => d.type === "remove").length

    // 简单估算修改行数
    const modifications = Math.min(additions, deletions)

    return {
      additions: additions - modifications,
      deletions: deletions - modifications,
      modifications,
    }
  }

  // 删除版本
  deleteVersion(fileId: string, versionId: string): boolean {
    const versions = this.versions.get(fileId) || []
    const index = versions.findIndex((v) => v.id === versionId)

    if (index === -1) return false

    versions.splice(index, 1)
    this.versions.set(fileId, versions)
    this.saveToStorage()

    return true
  }

  // 清空文件的所有版本
  clearVersions(fileId: string): void {
    this.versions.delete(fileId)
    this.saveToStorage()
  }

  // 持久化到本地存储
  private saveToStorage(): void {
    try {
      const data: Record<string, CodeVersion[]> = {}
      this.versions.forEach((versions, fileId) => {
        data[fileId] = versions.map((v) => ({
          ...v,
          timestamp: v.timestamp.toISOString(),
        })) as any
      })
      localStorage.setItem("code-versions", JSON.stringify(data))
    } catch (error) {
      console.error("[v0] Failed to save versions:", error)
    }
  }

  // 从本地存储加载
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem("code-versions")
      if (!data) return

      const parsed: Record<string, any[]> = JSON.parse(data)
      Object.entries(parsed).forEach(([fileId, versions]) => {
        this.versions.set(
          fileId,
          versions.map((v) => ({
            ...v,
            timestamp: new Date(v.timestamp),
          })),
        )
      })
    } catch (error) {
      console.error("[v0] Failed to load versions:", error)
    }
  }

  // 导出版本历史
  exportHistory(fileId: string): string {
    const versions = this.getVersions(fileId)
    return JSON.stringify(versions, null, 2)
  }

  // 导入版本历史
  importHistory(fileId: string, data: string): boolean {
    try {
      const versions: CodeVersion[] = JSON.parse(data)
      this.versions.set(
        fileId,
        versions.map((v) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })),
      )
      this.saveToStorage()
      return true
    } catch (error) {
      console.error("[v0] Failed to import history:", error)
      return false
    }
  }
}

// 全局版本控制实例
let versionControlInstance: VersionControl | null = null

export function getVersionControl(): VersionControl {
  if (!versionControlInstance) {
    versionControlInstance = new VersionControl()
  }
  return versionControlInstance
}
