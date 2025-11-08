// AI模型列表API路由
import { NextResponse } from "next/server"
import unifiedAI from "@/lib/unified-ai-service"
import type { APIResponse, ModelInfo } from "@/types/api"

export async function GET() {
  try {
    const providers = unifiedAI.getAvailableProviders()
    const models: ModelInfo[] = []

    for (const provider of providers) {
      const providerModels = unifiedAI.getModelsForProvider(provider)
      providerModels.forEach((modelId) => {
        models.push({
          id: modelId,
          name: modelId,
          provider,
          available: true,
          contextWindow: getContextWindow(modelId),
        })
      })
    }

    return NextResponse.json<APIResponse<ModelInfo[]>>({
      success: true,
      data: models,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Models API error:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

function getContextWindow(model: string): number {
  const contextWindows: Record<string, number> = {
    "gpt-4": 8192,
    "gpt-4-turbo": 128000,
    "gpt-3.5-turbo": 16385,
    "gpt-4o": 128000,
    "claude-3-opus": 200000,
    "claude-3-sonnet": 200000,
    "gemini-pro": 32768,
  }
  return contextWindows[model] || 4096
}
