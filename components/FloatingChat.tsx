"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Maximize2, Minimize2, Plus } from "lucide-react"
import Composer from "./Composer"
import Message from "./Message"

interface ChatWindow {
  id: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  messages: any[]
  isMaximized: boolean
  isMinimized: boolean
  zIndex: number
}

const SNAP_THRESHOLD = 20

export default function FloatingChat() {
  const [windows, setWindows] = useState<ChatWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [maxZIndex, setMaxZIndex] = useState(100)
  const chatRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    const saved = localStorage.getItem("yyc3_chat_windows")
    if (saved) {
      const parsed = JSON.parse(saved)
      setWindows(parsed)
      if (parsed.length > 0) {
        setActiveWindowId(parsed[0].id)
      }
    }
  }, [])

  useEffect(() => {
    if (windows.length > 0) {
      localStorage.setItem("yyc3_chat_windows", JSON.stringify(windows))
    }
  }, [windows])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeWindowId) return

      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        const snappedPosition = getSnappedPosition(newX, newY)

        setWindows((windows) =>
          windows.map((win) => (win.id === activeWindowId ? { ...win, position: snappedPosition } : win)),
        )
      }

      if (isResizing) {
        const currentWindow = windows.find((w) => w.id === activeWindowId)
        if (!currentWindow) return

        const newWidth = Math.max(400, e.clientX - currentWindow.position.x)
        const newHeight = Math.max(400, e.clientY - currentWindow.position.y)

        setWindows((windows) =>
          windows.map((win) =>
            win.id === activeWindowId ? { ...win, size: { width: newWidth, height: newHeight } } : win,
          ),
        )
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragOffset, activeWindowId, windows])

  const getSnappedPosition = (x: number, y: number) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const currentWindow = windows.find((w) => w.id === activeWindowId)
    if (!currentWindow) return { x, y }

    let snappedX = x
    let snappedY = y

    if (x < SNAP_THRESHOLD) snappedX = 0
    if (y < SNAP_THRESHOLD) snappedY = 0
    if (x + currentWindow.size.width > viewportWidth - SNAP_THRESHOLD) {
      snappedX = viewportWidth - currentWindow.size.width
    }
    if (y + currentWindow.size.height > viewportHeight - SNAP_THRESHOLD) {
      snappedY = viewportHeight - currentWindow.size.height
    }

    windows.forEach((otherWindow) => {
      if (otherWindow.id === activeWindowId) return

      const otherRight = otherWindow.position.x + otherWindow.size.width
      const otherBottom = otherWindow.position.y + otherWindow.size.height
      const thisRight = x + currentWindow.size.width
      const thisBottom = y + currentWindow.size.height

      if (Math.abs(x - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight
      }
      if (Math.abs(thisRight - otherWindow.position.x) < SNAP_THRESHOLD) {
        snappedX = otherWindow.position.x - currentWindow.size.width
      }
      if (Math.abs(y - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom
      }
      if (Math.abs(thisBottom - otherWindow.position.y) < SNAP_THRESHOLD) {
        snappedY = otherWindow.position.y - currentWindow.size.height
      }
    })

    return { x: snappedX, y: snappedY }
  }

  const createNewWindow = () => {
    const newWindow: ChatWindow = {
      id: `window-${Date.now()}`,
      title: `对话 ${windows.length + 1}`,
      position: {
        x: (window.innerWidth - 500) / 2 + windows.length * 30,
        y: (window.innerHeight - 600) / 2 + windows.length * 30,
      },
      size: { width: 500, height: 600 },
      messages: [],
      isMaximized: false,
      isMinimized: false,
      zIndex: maxZIndex + 1,
    }
    setWindows([...windows, newWindow])
    setActiveWindowId(newWindow.id)
    setMaxZIndex(maxZIndex + 1)
  }

  const closeWindow = (windowId: string) => {
    setWindows((prevWindows) => prevWindows.filter((w) => w.id !== windowId))
    if (activeWindowId === windowId) {
      const remainingWindows = windows.filter((w) => w.id !== windowId)
      setActiveWindowId(remainingWindows[0]?.id || null)
    }
  }

  const toggleMaximize = (windowId: string) => {
    setWindows(windows.map((win) => (win.id === windowId ? { ...win, isMaximized: !win.isMaximized } : win)))
  }

  const toggleMinimize = (windowId: string) => {
    setWindows(windows.map((win) => (win.id === windowId ? { ...win, isMinimized: !win.isMinimized } : win)))
  }

  const bringToFront = (windowId: string) => {
    const newZIndex = maxZIndex + 1
    setWindows(windows.map((win) => (win.id === windowId ? { ...win, zIndex: newZIndex } : win)))
    setActiveWindowId(windowId)
    setMaxZIndex(newZIndex)
  }

  const handleDragStart = (windowId: string, e: React.MouseEvent) => {
    const chatWindow = windows.find((w) => w.id === windowId)
    if (!chatWindow || chatWindow.isMaximized) return

    const rect = chatRefs.current.get(windowId)?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setActiveWindowId(windowId)
    setIsDragging(true)
    bringToFront(windowId)
  }

  const handleResizeStart = (windowId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveWindowId(windowId)
    setIsResizing(true)
    bringToFront(windowId)
  }

  const handleSendMessage = (windowId: string, content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    setWindows(windows.map((win) => (win.id === windowId ? { ...win, messages: [...win.messages, newMessage] } : win)))

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "我是AI助手,收到您的消息。",
        timestamp: new Date().toISOString(),
      }
      setWindows((windows) =>
        windows.map((win) => (win.id === windowId ? { ...win, messages: [...win.messages, aiMessage] } : win)),
      )
    }, 1000)
  }

  return (
    <div>
      {windows.length === 0 ? (
        <button
          onClick={createNewWindow}
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold transition-all hover:scale-105 hover:shadow-lg"
          title="打开AI对话"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      ) : (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={createNewWindow}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white shadow-lg hover:bg-purple-700"
            title="新建对话窗口"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </button>
          <div className="rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{windows.length} 个窗口</div>
          </div>
        </div>
      )}

      {windows.map((chatWindow) => (
        <div
          key={chatWindow.id}
          ref={(el) => {
            if (el) chatRefs.current.set(chatWindow.id, el)
          }}
          onClick={() => bringToFront(chatWindow.id)}
          className="fixed flex flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          style={
            chatWindow.isMaximized
              ? {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                  zIndex: chatWindow.zIndex,
                }
              : chatWindow.isMinimized
                ? {
                    left: `${chatWindow.position.x}px`,
                    top: `${chatWindow.position.y}px`,
                    width: `${chatWindow.size.width}px`,
                    height: "auto",
                    zIndex: chatWindow.zIndex,
                  }
                : {
                    left: `${chatWindow.position.x}px`,
                    top: `${chatWindow.position.y}px`,
                    width: `${chatWindow.size.width}px`,
                    height: `${chatWindow.size.height}px`,
                    zIndex: chatWindow.zIndex,
                  }
          }
        >
          <div
            className="flex cursor-move items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800"
            onMouseDown={(e) => handleDragStart(chatWindow.id, e)}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{chatWindow.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMinimize(chatWindow.id)
                }}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={chatWindow.isMinimized ? "展开" : "最小化"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMaximize(chatWindow.id)
                }}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={chatWindow.isMaximized ? "还原" : "最大化"}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeWindow(chatWindow.id)
                }}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
                title="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!chatWindow.isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950">
                {chatWindow.messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                      <p className="text-gray-400">开始新对话</p>
                      <p className="text-sm text-gray-500">选择模型并输入您的问题</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatWindow.messages.map((message) => (
                      <Message key={message.id} message={message} />
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800">
                <Composer onSendMessage={(content) => handleSendMessage(chatWindow.id, content)} />
              </div>

              {!chatWindow.isMaximized && (
                <div
                  className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(chatWindow.id, e)}
                >
                  <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-zinc-400" />
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}
