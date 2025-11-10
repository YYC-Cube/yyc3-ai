"use client"

import { useState, useRef, useEffect } from "react"
import { AtomIcon, X, Maximize2, Minimize2 } from "lucide-react"
import Composer from "./Composer"
import Message from "./Message"

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 500, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMaximized, setIsMaximized] = useState(false)
  const chatRef = useRef(null)
  const resizeRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPosition({
        x: (window.innerWidth - 500) / 2,
        y: (window.innerHeight - 600) / 2,
      })
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
      if (isResizing) {
        const newWidth = Math.max(400, e.clientX - position.x)
        const newHeight = Math.max(400, e.clientY - position.y)
        setSize({ width: newWidth, height: newHeight })
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
  }, [isDragging, isResizing, dragOffset, position])

  const handleDragStart = (e) => {
    if (isMaximized) return
    const rect = chatRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setIsDragging(true)
  }

  const handleResizeStart = (e) => {
    if (isMaximized) return
    e.stopPropagation()
    setIsResizing(true)
  }

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages([...messages, newMessage])

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "我是AI助手,我收到了您的消息。",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold transition-all hover:scale-105 hover:shadow-lg mx-0 px-0 leading-7 tracking-tighter text-xs italic"
          title="打开AI对话"
        >
          {"YYC³"}
        </button>
      )}

      {isOpen && (
        <div
          ref={chatRef}
          className="fixed z-50 flex flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          style={
            isMaximized
              ? {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                }
              : {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                }
          }
        >
          <div
            className="flex items-center justify-between border-b border-zinc-200 p-4 cursor-move dark:border-zinc-800 bg-white dark:bg-zinc-900"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <AtomIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">AI 对话</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMaximize}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={isMaximized ? "还原窗口" : "最大化窗口"}
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="关闭聊天"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-950">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <AtomIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Composer onSendMessage={handleSendMessage} />
          </div>

          {!isMaximized && (
            <div
              ref={resizeRef}
              className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
              onMouseDown={handleResizeStart}
            >
              <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-zinc-400" />
            </div>
          )}
        </div>
      )}
    </>
  )
}
