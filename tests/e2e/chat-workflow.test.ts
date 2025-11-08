// 端到端测试：聊天工作流
import { test, expect } from "@playwright/test"

test.describe("Chat Workflow", () => {
  test("should complete full chat interaction", async ({ page }) => {
    await page.goto("http://localhost:3000")

    // 等待页面加载
    await page.waitForSelector('[data-testid="chat-input"]')

    // 输入消息
    await page.fill('[data-testid="chat-input"]', "Hello, AI!")

    // 发送消息
    await page.click('[data-testid="send-button"]')

    // 等待响应
    await page.waitForSelector('[data-testid="assistant-message"]', { timeout: 10000 })

    // 验证消息显示
    const messages = await page.$$('[data-testid="chat-message"]')
    expect(messages.length).toBeGreaterThan(0)
  })

  test("should switch AI models", async ({ page }) => {
    await page.goto("http://localhost:3000")

    // 打开模型选择器
    await page.click('[data-testid="model-selector"]')

    // 选择不同模型
    await page.click('[data-testid="model-gpt-4"]')

    // 验证模型已切换
    const selectedModel = await page.textContent('[data-testid="selected-model"]')
    expect(selectedModel).toContain("GPT-4")
  })
})
