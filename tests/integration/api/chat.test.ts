// 聊天API集成测试
import { POST } from "@/app/api/ai/chat/route"
import { NextRequest } from "next/server"

describe("Chat API", () => {
  it("should handle chat request", async () => {
    const request = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-4",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  it("should return error for empty messages", async () => {
    const request = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [],
        model: "gpt-4",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
