"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, X, Sparkles } from "lucide-react"
import { IntentRecognizer, type IntentResult } from "@/lib/intent-recognition"

interface SmartPromptFloaterProps {
  userInput: string
  onSelectSuggestion: (suggestion: string) => void
}

export default function SmartPromptFloater({ userInput, onSelectSuggestion }: SmartPromptFloaterProps) {
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (userInput.length > 5) {
      const result = IntentRecognizer.analyze(userInput)

      if (result.confidence > 0.3) {
        setIntentResult(result)
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
    }
  }, [userInput])

  return (
    <AnimatePresence>
      {isVisible && intentResult && (
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute bottom-full left-0 mb-2 w-full sm:w-96 rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900/95 overflow-hidden"
        >
          {/* 渐变装饰条 */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">智能建议</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    检测到意图: {intentResult.intent} (置信度: {Math.round(intentResult.confidence * 100)}%)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {intentResult.suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    onSelectSuggestion(suggestion)
                    setIsVisible(false)
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors group"
                >
                  <Sparkles className="h-4 w-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  <span className="text-zinc-700 dark:text-zinc-300">{suggestion}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
