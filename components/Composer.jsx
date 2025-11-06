"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Send, Loader2, Mic, ChevronDown, Smile, Paperclip, ImageIcon, FileText, Download } from "lucide-react"
import { cls } from "./utils"
import { SymmetricContainer, SymmetricContent } from "./SymmetricContainer"

const Composer = forwardRef(function Composer({ onSend, onSendMessage, busy }, ref) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedModel, setSelectedModel] = useState("文心一言 4.0 (百度)")
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [composerHeight, setComposerHeight] = useState(120)
  const [isResizingComposer, setIsResizingComposer] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const inputRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const composerRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const attachmentMenuRef = useRef(null)

  const models = [
    { name: "DeepSeek (深度求索)", region: "国内", icon: "🔍" },
    { name: "GPT-4 (OpenAI)", region: "国际", icon: "🤖" },
    { name: "GPT-3.5 Turbo (OpenAI)", region: "国际", icon: "⚡" },
    { name: "Claude 3 (Anthropic)", region: "国际", icon: "🎭" },
    { name: "文心一言 4.0 (百度)", region: "国内", icon: "🎯" },
    { name: "通义千问 Plus (阿里云)", region: "国内", icon: "☁️" },
    { name: "星火认知 3.0 (讯飞)", region: "国内", icon: "✨" },
    { name: "ChatGLM3 (智谱AI)", region: "国内", icon: "🧠" },
  ]

  const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "🚀", "💡", "🤔", "👏"]

  const cloudStorageOptions = [
    { name: "言语云 NAS", icon: "☁️", type: "yanyucloud" },
    { name: "阿里云 OSS", icon: "☁️", type: "aliyun" },
    { name: "腾讯云 COS", icon: "🔷", type: "tencent" },
    { name: "华为云 OBS", icon: "🌺", type: "huawei" },
    { name: "百度云 BOS", icon: "🔍", type: "baidu" },
    { name: "公有云", icon: "⏫", type: "yun" },
  ]

  const attachmentOptions = [
    { name: "添加图片和文件", icon: ImageIcon, enabled: true, description: "上传本地文件" },
    { name: "添加文档", icon: FileText, enabled: true, description: "支持PDF、Word等" },
    { name: "从云端导入", icon: Download, enabled: true, description: "从云存储导入文件" },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingComposer && composerRef.current) {
        const rect = composerRef.current.getBoundingClientRect()
        const newHeight = rect.bottom - e.clientY
        const clampedHeight = Math.max(80, Math.min(400, newHeight))
        setComposerHeight(clampedHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizingComposer(false)
    }

    if (isResizingComposer) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizingComposer])

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(""),
  }))

  const handleSend = async () => {
    if (!value.trim() || sending || busy) return

    setSending(true)
    const message = value.trim()
    setValue("")

    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    try {
      if (onSendMessage) {
        await onSendMessage(message)
      } else if (onSend) {
        await onSend(message)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    const newValue = e.target.value
    setValue(newValue)

    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      const newHeight = Math.min(inputRef.current.scrollHeight, composerHeight - 40)
      inputRef.current.style.height = `${newHeight}px`
    }
  }

  const handleEmojiClick = (emoji) => {
    const newValue = value + emoji
    setValue(newValue)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={composerRef} className="relative bg-white dark:bg-zinc-900">
      <SymmetricContainer>
        <div className="py-4">
          <div
            ref={resizeHandleRef}
            onMouseDown={() => setIsResizingComposer(true)}
            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize group flex items-center justify-center"
          >
            <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600 transition-colors" />
          </div>

          <SymmetricContent className="p-0 border border-zinc-200 dark:border-zinc-800">
            <div
              className={cls(
                "flex items-end gap-2 p-3 transition-colors",
                isFocused && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900",
              )}
              style={{ minHeight: `${composerHeight}px` }}
            >
              {/* 模型选择器 */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                  title={selectedModel}
                >
                  <span className="text-lg">{models.find((m) => m.name === selectedModel)?.icon || "🤖"}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {isModelDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
                    <div className="p-2 space-y-1">
                      {models.map((model) => (
                        <button
                          key={model.name}
                          onClick={() => {
                            setSelectedModel(model.name)
                            setIsModelDropdownOpen(false)
                          }}
                          className={cls(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
                            selectedModel === model.name
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          )}
                        >
                          <span className="text-lg">{model.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{model.name}</div>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{model.region}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 输入框 */}
              <textarea
                ref={inputRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="输入消息..."
                className="flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
                style={{
                  minHeight: "24px",
                  maxHeight: `${composerHeight - 40}px`,
                  overflow: "auto",
                }}
                rows={1}
              />

              {/* 功能按钮区域 */}
              <div className="flex shrink-0 items-center gap-1">
                {/* 语音输入 */}
                <button
                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                  title="语音输入"
                >
                  <Mic className="h-4 w-4" />
                </button>

                {/* 附件菜单 */}
                <div className="relative" ref={attachmentMenuRef}>
                  <button
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                    title="上传附件"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  {showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
                      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">附件功能</h3>
                        <div className="space-y-1">
                          {attachmentOptions.map((option) => (
                            <label
                              key={option.name}
                              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={option.enabled}
                                onChange={() => {}}
                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                              />
                              <option.icon className="h-4 w-4 text-zinc-500" />
                              <div className="flex-1">
                                <div className="text-sm text-zinc-900 dark:text-zinc-100">{option.name}</div>
                                <div className="text-xs text-zinc-500">{option.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">云存储连接</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {cloudStorageOptions.map((storage) => (
                            <button
                              key={storage.type}
                              className="flex items-center gap-2 p-2 rounded border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <span className="text-lg">{storage.icon}</span>
                              <span className="text-xs text-zinc-700 dark:text-zinc-300">{storage.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 表情选择 */}
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="inline-flex items-center justify-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
                    title="添加表情"
                  >
                    <Smile className="h-4 w-4" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-3 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50">
                      <div className="grid grid-cols-6 gap-2">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-1 transition-colors w-8 h-8 flex items-center justify-center"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 发送按钮 */}
              <button
                onClick={handleSend}
                disabled={sending || busy || !value.trim()}
                className={cls(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  (sending || busy || !value.trim()) && "opacity-50 cursor-not-allowed",
                )}
              >
                {sending || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>发送</span>
              </button>
            </div>
          </SymmetricContent>

          {/* 快捷键提示 */}
          <div className="mt-2 text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
            按{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">
              Enter
            </kbd>{" "}
            发送 ·{" "}
            <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1 dark:border-zinc-600 dark:bg-zinc-800">
              Shift + Enter
            </kbd>{" "}
            换行
          </div>
        </div>
      </SymmetricContainer>
    </div>
  )
})

export default Composer
