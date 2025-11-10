"use client"

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react"
import Message from "./Message"
import Composer from "./Composer"
import EmotionalFeedback from "./EmotionalFeedback"
import { cls, timeAgo } from "./utils"
import { useLocale } from "@/contexts/LocaleContext"
import { contextAnalyzer } from "@/lib/context-analyzer"
import { learningTracker } from "@/lib/learning-tracker"

function ThinkingMessage({ onPause }) {
  const { t } = useLocale()
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">{t("chat.thinking")}</span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Square className="h-3 w-3" /> {t("chat.pause")}
        </button>
      </div>
    </Message>
  )
}

const ChatPane = forwardRef(function ChatPane(
  { conversation, onSend, onEditMessage, onResendMessage, isThinking, onPauseThinking },
  ref,
) {
  const { t } = useLocale()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const composerRef = useRef(null)

  const [sessionStart] = useState(Date.now())
  const [recentErrors, setRecentErrors] = useState(0)
  const [currentTopic, setCurrentTopic] = useState(null)

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent) => {
        composerRef.current?.insertTemplate(templateContent)
      },
    }),
    [],
  )

  useEffect(() => {
    if (conversation?.messages) {
      conversation.messages.forEach((msg) => {
        contextAnalyzer.addMessage(msg.role, msg.content)
      })

      const analysis = contextAnalyzer.analyzeContext()
      if (analysis.currentTopic) {
        setCurrentTopic(analysis.currentTopic)
      }
    }
  }, [conversation?.messages])

  if (!conversation) return null

  const tags = ["Certified", "Personalized", "Experienced", "Helpful"]
  const messages = Array.isArray(conversation.messages) ? conversation.messages : []
  const count = messages.length || conversation.messageCount || 0

  function startEdit(m) {
    setEditingId(m.id)
    setDraft(m.content)
  }
  function cancelEdit() {
    setEditingId(null)
    setDraft("")
  }
  function saveEdit() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    cancelEdit()
  }
  function saveAndResend() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    onResendMessage?.(editingId)
    cancelEdit()
  }

  const handleSend = async (text) => {
    if (!text.trim()) return
    setBusy(true)

    console.log("[v0] Sending message:", text)

    contextAnalyzer.addMessage("user", text)

    const analysis = contextAnalyzer.analyzeContext()
    if (analysis.currentTopic) {
      learningTracker.recordLearningNode({
        topic: analysis.currentTopic,
        category: "编程学习",
        duration: 300,
        difficulty: analysis.difficulty,
        mastery: 60,
        interactions: 1,
        errors: [],
        questions: [text],
      })
    }

    try {
      await onSend?.(text)
      console.log("[v0] Message sent successfully")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setBusy(false)
    }
  }

  const sessionDuration = Date.now() - sessionStart
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content)

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-1 sm:px-8 bg-white dark:bg-zinc-900">
        <div className="mb-2 text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl"></div>
        <div className="mb-4 text-sm dark:text-zinc-400 italic underline text-sidebar-ring">
          Updated {timeAgo(conversation.updatedAt)} · {count} messages
        </div>

        {messages.length > 0 && (
          <EmotionalFeedback messages={userMessages} recentErrors={recentErrors} sessionDuration={sessionDuration} />
        )}

        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 text-[rgba(14,14,188,1)] leading-10">
            <p className="italic leading-10 text-sm font-normal text-[rgba(190,202,207,1)]">
              Words convey thousands of lines of code 丨 Language pivots the intelligence of all things
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {console.log("[v0] Rendering message:", m.id, m.role, m.content?.substring(0, 30))}
                {editingId === m.id ? (
                  <div className={cls("rounded-2xl border p-2", "border-zinc-200 dark:border-zinc-800")}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-white dark:text-zinc-900"
                      >
                        <Check className="h-3.5 w-3.5" /> {t("common.save")}
                      </button>
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> {t("chat.regenerate")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                      >
                        <X className="h-3.5 w-3.5" /> {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Message role={m.role} isTyping={m.isTyping}>
                    {m.content}
                    {m.role === "user" && (
                      <div className="mt-1 flex gap-2 text-[11px] text-zinc-500">
                        <button className="inline-flex items-center gap-1 hover:underline" onClick={() => startEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" /> {t("chat.edit")}
                        </button>
                        <button
                          className="inline-flex items-center gap-1 hover:underline"
                          onClick={() => onResendMessage?.(m.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> {t("chat.regenerate")}
                        </button>
                      </div>
                    )}
                  </Message>
                )}
              </div>
            ))}
            {isThinking && <ThinkingMessage onPause={onPauseThinking} />}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-zinc-200 bg-white pb-20 pt-4 px-4 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900">
        <Composer ref={composerRef} onSend={handleSend} busy={busy} />
      </div>
    </div>
  )
})

export default ChatPane
