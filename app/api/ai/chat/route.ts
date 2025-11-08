// AI聊天API路由
import { type NextRequest, NextResponse } from "next/server"
import unifiedAI from "@/lib/unified-ai-service"
import type { ChatRequest, ChatResponse, APIResponse } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, model, temperature, maxTokens, stream } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Messages are required",
          timestamp: Date.now(),
        },
        { status: 400 },
      )
    }

    // 流式响应
    if (stream) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const aiStream = unifiedAI.stream(messages as any, {
              model,
              temperature,
              maxTokens,
            })

            for await (const chunk of aiStream) {
              const data = JSON.stringify(chunk)
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))

              if (chunk.isComplete) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                break
              }
            }
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`))
          } finally {
            controller.close()
          }
        },
      })

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // 普通响应
    const response = await unifiedAI.chat(messages as any, {
      model,
      temperature,
      maxTokens,
    })

    const chatResponse: ChatResponse = {
      id: `chat-${Date.now()}`,
      content: response.content,
      model: response.model,
      usage: response.usage,
      finishReason: response.finishReason,
    }

    return NextResponse.json<APIResponse<ChatResponse>>({
      success: true,
      data: chatResponse,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
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
