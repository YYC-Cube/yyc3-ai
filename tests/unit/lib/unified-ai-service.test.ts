// 统一AI服务单元测试
import unifiedAI from "@/lib/unified-ai-service"

describe("UnifiedAIService", () => {
  it("should get default config", () => {
    const config = unifiedAI.getDefaultConfig()
    expect(config).toBeDefined()
    expect(config.provider).toBeDefined()
    expect(config.model).toBeDefined()
  })

  it("should update default config", () => {
    unifiedAI.setDefaultConfig({ temperature: 0.5 })
    const config = unifiedAI.getDefaultConfig()
    expect(config.temperature).toBe(0.5)
  })

  it("should list available providers", () => {
    const providers = unifiedAI.getAvailableProviders()
    expect(providers).toContain("openai")
    expect(providers.length).toBeGreaterThan(0)
  })

  it("should get models for provider", () => {
    const models = unifiedAI.getModelsForProvider("openai")
    expect(models).toContain("gpt-4")
    expect(models.length).toBeGreaterThan(0)
  })

  it("should estimate tokens", () => {
    const text = "Hello, world!"
    const tokens = unifiedAI.estimateTokens(text)
    expect(tokens).toBeGreaterThan(0)
    expect(tokens).toBeLessThan(text.length)
  })

  it("should calculate cost", () => {
    const usage = {
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
    }
    const cost = unifiedAI.calculateCost(usage, "openai", "gpt-4")
    expect(cost).toBeGreaterThan(0)
  })
})
