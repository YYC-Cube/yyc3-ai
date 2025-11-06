"use client"

import { useState, useEffect } from "react"
import { Clock, RotateCcw, Trash2, Download, Upload, GitBranch, Plus, Minus } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { type CodeVersion, getVersionControl } from "@/lib/version-control"

interface VersionHistoryProps {
  fileId: string
  currentContent: string
  onRestore: (content: string) => void
}

export default function VersionHistory({ fileId, currentContent, onRestore }: VersionHistoryProps) {
  const { t } = useLocale()
  const [versions, setVersions] = useState<CodeVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<CodeVersion | null>(null)
  const versionControl = getVersionControl()

  useEffect(() => {
    loadVersions()
  }, [fileId])

  const loadVersions = () => {
    const fileVersions = versionControl.getVersions(fileId)
    setVersions(fileVersions)
  }

  const handleSaveVersion = () => {
    const message = prompt("版本说明 (可选)")
    versionControl.saveVersion(fileId, currentContent, message || "手动保存")
    loadVersions()
  }

  const handleRestore = (version: CodeVersion) => {
    if (confirm(`确定要恢复到版本 "${version.message}" 吗?`)) {
      versionControl.restoreVersion(fileId, version.id)
      onRestore(version.content)
      loadVersions()
    }
  }

  const handleDelete = (versionId: string) => {
    if (confirm("确定要删除这个版本吗?")) {
      versionControl.deleteVersion(fileId, versionId)
      loadVersions()
      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null)
      }
    }
  }

  const handleExport = () => {
    const data = versionControl.exportHistory(fileId)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `version-history-${fileId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (versionControl.importHistory(fileId, data)) {
          loadVersions()
          alert("导入成功")
        } else {
          alert("导入失败")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "刚刚"
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString("zh-CN")
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">版本历史</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {versions.length} 个版本
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveVersion}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            title="保存当前版本"
          >
            <GitBranch className="h-3.5 w-3.5" />
            保存
          </button>
          <button
            onClick={handleExport}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="导出历史"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleImport}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="导入历史"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 版本列表 */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
            <div>
              <Clock className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
              <p>暂无版本历史</p>
              <p className="mt-1 text-xs">点击"保存版本"创建第一个版本</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`group cursor-pointer p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                  selectedVersion?.id === version.id ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{version.message}</span>
                      {index === 0 && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-400">
                          最新
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span>{formatTimestamp(version.timestamp)}</span>
                      <span>·</span>
                      <span>{version.author}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {version.changes.additions > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Plus className="h-3 w-3" />
                          {version.changes.additions}
                        </span>
                      )}
                      {version.changes.deletions > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <Minus className="h-3 w-3" />
                          {version.changes.deletions}
                        </span>
                      )}
                      {version.changes.modifications > 0 && (
                        <span className="text-zinc-500">{version.changes.modifications} 处修改</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(version)
                      }}
                      className="rounded-lg p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      title="恢复此版本"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(version.id)
                        }}
                        className="rounded-lg p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                        title="删除版本"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 版本详情 */}
      {selectedVersion && (
        <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">版本详情</div>
          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <div>ID: {selectedVersion.id}</div>
            <div>时间: {selectedVersion.timestamp.toLocaleString("zh-CN")}</div>
            <div>代码行数: {selectedVersion.content.split("\n").length}</div>
          </div>
        </div>
      )}
    </div>
  )
}
