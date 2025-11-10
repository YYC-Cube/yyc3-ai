"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { useEffect } from "react"
import { LocaleProvider } from "@/contexts/LocaleContext"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message?.includes("ResizeObserver loop")) {
        event.stopImmediatePropagation()
        event.preventDefault()
        return true
      }
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  return (
    <>
      <LocaleProvider>{children}</LocaleProvider>
      <Analytics />
    </>
  )
}
