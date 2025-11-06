import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LocaleProvider } from "@/contexts/LocaleContext"

export const metadata: Metadata = {
  title: "AI 助手 - 现代化智能对话平台",
  description: "基于 Next.js 构建的现代化 AI 助手界面",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
