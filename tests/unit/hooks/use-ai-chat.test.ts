// useAIChat Hook单元测试
import { renderHook, act } from "@testing-library/react"
import { useAIChat } from "@/hooks/use-ai-chat"

describe("useAIChat", () => {
  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useAIChat())
    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it("should add user message when sending", async () => {
    const { result } = renderHook(() => useAIChat())

    await act(async () => {
      await result.current.sendMessage("Hello")
    })

    expect(result.current.messages.length).toBeGreaterThan(0)
    expect(result.current.messages[0].role).toBe("user")
    expect(result.current.messages[0].content).toBe("Hello")
  })

  it("should clear messages", () => {
    const { result } = renderHook(() => useAIChat())

    act(() => {
      result.current.clearMessages()
    })

    expect(result.current.messages).toEqual([])
  })

  it("should delete specific message", async () => {
    const { result } = renderHook(() => useAIChat())

    await act(async () => {
      await result.current.sendMessage("Test message")
    })

    const messageId = result.current.messages[0].id

    act(() => {
      result.current.deleteMessage(messageId)
    })

    expect(result.current.messages.find((m) => m.id === messageId)).toBeUndefined()
  })
})
