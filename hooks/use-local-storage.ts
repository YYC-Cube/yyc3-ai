"use client"

// 本地存储自定义Hook
import { useState, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`[v0] Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 设置值
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`[v0] Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  // 删除值
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`[v0] Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
