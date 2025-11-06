"use client"

import { useMemo } from "react"
import { useLocale } from "@/contexts/LocaleContext"
import { getVersionControl } from "@/lib/version-control"

interface CodeDiffProps {
  oldContent: string
  newContent: string
  oldLabel?: string
  newLabel?: string
}

export default function CodeDiff({ oldContent, newContent, oldLabel = "旧版本", newLabel = "新版本" }: CodeDiffProps) {
  const { t } = useLocale()
  const versionControl = getVersionControl()

  const diff = useMemo(() => {
    return versionControl.compareVersions(oldContent, newContent)
  }, [oldContent, newContent])

  const stats = useMemo(() => {
    const additions = diff.filter((d) => d.type === "add").length
    const deletions = diff.filter((d) => d.type === "remove").length
    const unchanged = diff.filter((d) => d.type === "unchanged").length
    return { additions, deletions, unchanged, total: diff.length }
  }, [diff])

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">代码对比</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-600">
                <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>+{stats.additions}
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <span className="inline-block h-2 w-2 rounded-full bg-red-600"></span>-{stats.deletions}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{oldLabel}</span>
            <span>→</span>
            <span>{newLabel}</span>
          </div>
        </div>
      </div>

      {/* 差异视图 */}
      <div className="flex-1 overflow-auto">
        <div className="font-mono text-xs">
          {diff.map((line, index) => (
            <div
              key={index}
              className={`flex ${
                line.type === "add"
                  ? "bg-green-50 dark:bg-green-950/20"
                  : line.type === "remove"
                    ? "bg-red-50 dark:bg-red-950/20"
                    : ""
              }`}
            >
              {/* 行号 */}
              <div className="flex border-r border-zinc-200 dark:border-zinc-800">
                <div className="w-12 px-2 py-1 text-right text-zinc-400">{line.oldLineNumber || ""}</div>
                <div className="w-12 px-2 py-1 text-right text-zinc-400">{line.newLineNumber || ""}</div>
              </div>

              {/* 变更标记 */}
              <div className="w-6 px-1 py-1 text-center">
                {line.type === "add" && <span className="text-green-600">+</span>}
                {line.type === "remove" && <span className="text-red-600">-</span>}
              </div>

              {/* 代码内容 */}
              <div
                className={`flex-1 px-2 py-1 ${
                  line.type === "add"
                    ? "text-green-900 dark:text-green-100"
                    : line.type === "remove"
                      ? "text-red-900 dark:text-red-100"
                      : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <pre className="whitespace-pre-wrap break-all">{line.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        共 {stats.total} 行 · {stats.additions} 行新增 · {stats.deletions} 行删除 · {stats.unchanged} 行未变更
      </div>
    </div>
  )
}
