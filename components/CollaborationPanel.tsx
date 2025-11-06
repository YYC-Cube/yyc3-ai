"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, LogOut, Circle, Share2 } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { getCollaborationManager, type CollaborationSession } from "@/lib/collaboration"

interface CollaborationPanelProps {
  sessionId?: string
  onInvite?: () => void
}

export default function CollaborationPanel({ sessionId, onInvite }: CollaborationPanelProps) {
  const { t } = useLocale()
  const [manager] = useState(() => getCollaborationManager())
  const [session, setSession] = useState<CollaborationSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (sessionId) {
      const currentSession = manager.getSession(sessionId)
      setSession(currentSession)
    }
  }, [sessionId])

  const handleCreateSession = () => {
    const name = prompt("会话名称")
    if (!name) return

    const newSession = manager.createSession(name)
    setSession(newSession)
    setIsCreating(false)
  }

  const handleLeaveSession = () => {
    if (!session) return
    if (confirm("确定要离开协作会话吗?")) {
      manager.leaveSession(session.id)
      setSession(null)
    }
  }

  const handleCopyLink = async () => {
    if (!session) return
    await navigator.clipboard.writeText(session.shareLink)
    alert("分享链接已复制")
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">实时协作</span>
        </div>

        {session && (
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Share2 className="h-3.5 w-3.5" />
            邀请
          </button>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!session ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <Users className="mx-auto mb-3 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">开始协作</h3>
              <p className="mb-4 text-sm text-zinc-500">创建协作会话,邀请其他人一起编辑代码</p>
              <button
                onClick={handleCreateSession}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                创建会话
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 会话信息 */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{session.name}</h3>
              <p className="text-xs text-zinc-500">创建于 {session.createdAt.toLocaleString("zh-CN")}</p>
            </div>

            {/* 参与者列表 */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                参与者 ({session.participants.length})
              </h4>
              <div className="space-y-2">
                {session.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: participant.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{participant.name}</span>
                        {participant.isActive && <Circle className="h-2 w-2 fill-green-500 text-green-500" />}
                      </div>
                      <p className="text-xs text-zinc-500">加入于 {participant.joinedAt.toLocaleTimeString("zh-CN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <button
              onClick={handleLeaveSession}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              离开会话
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
