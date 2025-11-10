// 情感化浮窗组件 - 动画效果与虚化浮现
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Sparkles } from "lucide-react"
import { emotionalEngine, type EmotionalResponse, type EmotionalState } from "@/lib/emotional-interaction"

interface EmotionalFloaterProps {
  userInput: string
  onEmojiClick?: (emoji: string) => void
}

export default function EmotionalFloater({ userInput, onEmojiClick }: EmotionalFloaterProps) {
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null)
  const [response, setResponse] = useState<EmotionalResponse | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const analyzeEmotion = async () => {
      if (userInput.length > 3) {
        const state = await emotionalEngine.recognizeEmotion(userInput)
        const emotionalResponse = emotionalEngine.generateResponse(state)

        setEmotionalState(state)
        setResponse(emotionalResponse)
        setIsVisible(state.intensity > 0.4)
      } else {
        setIsVisible(false)
      }
    }

    analyzeEmotion()
  }, [userInput])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!response || !emotionalState) return null

  // 动画变体
  const animationVariants = {
    gentle: {
      initial: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
      animate: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.8, ease: "easeOut" },
      },
      exit: { opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.5 } },
    },
    bounce: {
      initial: { opacity: 0, y: 50, filter: "blur(8px)" },
      animate: {
        opacity: 1,
        y: [0, -10, 0],
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: "easeOut", y: { repeat: 2, duration: 0.4 } },
      },
      exit: { opacity: 0, y: 50, filter: "blur(8px)" },
    },
    pulse: {
      initial: { opacity: 0, scale: 0.5, filter: "blur(12px)" },
      animate: {
        opacity: 1,
        scale: [1, 1.1, 1],
        filter: "blur(0px)",
        transition: { duration: 0.7, scale: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 } },
      },
      exit: { opacity: 0, scale: 0.5, filter: "blur(12px)" },
    },
    fade: {
      initial: { opacity: 0, filter: "blur(15px)" },
      animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 1, ease: "easeInOut" } },
      exit: { opacity: 0, filter: "blur(15px)", transition: { duration: 0.6 } },
    },
  }

  const currentAnimation = animationVariants[response.animation]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          {...currentAnimation}
          className="fixed z-50 pointer-events-auto"
          style={{
            left: `${mousePosition.x + 20}px`,
            top: `${mousePosition.y - 100}px`,
          }}
        >
          <div
            className="relative rounded-2xl shadow-2xl backdrop-blur-md border overflow-hidden"
            style={{
              backgroundColor: `${response.color}15`,
              borderColor: `${response.color}40`,
            }}
          >
            {/* 渐变装饰 */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${response.color}, transparent)`,
              }}
            />

            <div className="relative p-4 max-w-xs">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      rotate: response.tone === "humor" ? [0, 10, -10, 0] : 0,
                      scale: response.tone === "encouraging" ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-3xl cursor-pointer"
                    onClick={() => onEmojiClick?.(response.emoji)}
                  >
                    {response.emoji}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{response.message}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      情绪: {emotionalState.primary} · 强度: {Math.round(emotionalState.intensity * 100)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 互动按钮 */}
              <div className="flex gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEmojiClick?.(response.emoji)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/50 hover:bg-white/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <Heart className="h-3 w-3" />
                  <span>回复表情</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(response.emoji)
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/50 hover:bg-white/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>保存</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
