import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LocaleProvider } from "@/contexts/LocaleContext"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "YYC³ - 万象归元于云枢 | 深栈智启新纪元",
  description: "现代化AI智能编程平台，集成多模型对话、代码生成、项目管理、学习中心等功能",
  generator: "v0.app",
  icons: {
    icon: "/yyc3-pwa-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans">
        <LocaleProvider>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
