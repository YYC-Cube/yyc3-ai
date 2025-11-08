// AI服务Context
"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import type { AIProvider, AIServiceConfig } from "@/types/ai"
import unifiedAI from "@/lib/unified-ai-service"

interface AIContextType {
  config: AIServiceConfig
  updateConfig: (config: Partial<AIServiceConfig>) => void
  testConnection: (provider?: AIProvider) => Promise<boolean>
  availableProviders: AIProvider[]
  isConnected: boolean
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AIServiceConfig>(unifiedAI.getDefaultConfig())
  const [isConnected, setIsConnected] = useState(false)

  const updateConfig = useCallback((newConfig: Partial<AIServiceConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig }
      unifiedAI.setDefaultConfig(updated)
      return updated
    })
  }, [])

  const testConnection = useCallback(async (provider?: AIProvider) => {
    try {
      const result = await unifiedAI.testConnection(provider)
      setIsConnected(result)
      return result
    } catch (error) {
      console.error("[v0] Connection test failed:", error)
      setIsConnected(false)
      return false
    }
  }, [])

  const availableProviders = unifiedAI.getAvailableProviders()

  return (
    <AIContext.Provider
      value={{
        config,
        updateConfig,
        testConnection,
        availableProviders,
        isConnected,
      }}
    >
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error("useAI must be used within an AIConfigProvider")
  }
  return context
}
