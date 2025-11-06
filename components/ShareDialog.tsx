"use client"

import { useState } from "react"
import { Share2, Link, Code, Download, Copy, Check, Lock, Users, X } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { getShareManager, type ShareSettings } from "@/lib/collaboration"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  files: Array<{ name: string; content: string; language: string }>
}

export default function ShareDialog({ isOpen, onClose, projectName, files }: ShareDialogProps) {
  const { t } = useLocale()
  const [shareManager] = useState(() => getShareManager())
  const [settings, setSettings] = useState<ShareSettings>({
    allowEdit: false,
    allowDownload: true,
  })
  const [description, setDescription] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [copied, setCopied] = useState<"link" | "embed" | null>(null)
  const [isShared, setIsShared] = useState(false)

  if (!isOpen) return null

  const handleShare = () => {
    const project = shareManager.createShare(projectName, description, files, settings)
    const link = shareManager.generateShareLink(project.id)
    const embed = shareManager.generateEmbedCode(project.id)

    setShareLink(link)
    setEmbedCode(embed)
    setIsShared(true)
  }

  const handleCopy = async (text: string, type: "link" | "embed") => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">分享项目</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!isShared ? (
            <div className="space-y-4">
              {/* 项目描述 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">项目描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简要描述这个项目..."
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
                  rows={3}
                />
              </div>

              {/* 分享设置 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">分享设置</h3>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.allowEdit}
                    onChange={(e) => setSettings({ ...settings, allowEdit: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">允许编辑</div>
                    <div className="text-xs text-zinc-500">其他人可以修改代码</div>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.allowDownload}
                    onChange={(e) => setSettings({ ...settings, allowDownload: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">允许下载</div>
                    <div className="text-xs text-zinc-500">其他人可以下载项目文件</div>
                  </div>
                </label>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    访问密码 (可选)
                  </label>
                  <input
                    type="text"
                    value={settings.password || ""}
                    onChange={(e) => setSettings({ ...settings, password: e.target.value || undefined })}
                    placeholder="留空表示公开访问"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    最大参与人数 (可选)
                  </label>
                  <input
                    type="number"
                    value={settings.maxParticipants || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxParticipants: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="不限制"
                    min="1"
                    max="100"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  取消
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  创建分享链接
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 成功提示 */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">分享链接已创建</span>
                </div>
                <p className="mt-1 text-sm text-green-600 dark:text-green-500">你可以通过以下方式分享你的项目</p>
              </div>

              {/* 分享链接 */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Link className="h-4 w-4" />
                  分享链接
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <button
                    onClick={() => handleCopy(shareLink, "link")}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === "link" ? "已复制" : "复制"}
                  </button>
                </div>
              </div>

              {/* 嵌入代码 */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Code className="h-4 w-4" />
                  嵌入代码
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={embedCode}
                    readOnly
                    className="flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    rows={3}
                  />
                  <button
                    onClick={() => handleCopy(embedCode, "embed")}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  >
                    {copied === "embed" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === "embed" ? "已复制" : "复制"}
                  </button>
                </div>
              </div>

              {/* 分享信息 */}
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <h4 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">分享设置</h4>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <span>{settings.password ? "需要密码访问" : "公开访问"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{settings.maxParticipants ? `最多 ${settings.maxParticipants} 人` : "不限制人数"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-3 w-3" />
                    <span>{settings.allowDownload ? "允许下载" : "禁止下载"}</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  完成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
