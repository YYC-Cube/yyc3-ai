"use client"
import { Asterisk, AppleIcon, Menu, ChevronDown } from "lucide-react"
import { useState } from "react"
import GhostIconButton from "./GhostIconButton"
import { useLocale } from "@/contexts/LocaleContext"

export default function Header({ createNewChat, sidebarCollapsed, setSidebarOpen }) {
  const { t } = useLocale()
  const [selectedBot, setSelectedBot] = useState("GPT-4")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const chatbots = [
    { name: "GPT-4", icon: "🤖" },
    { name: "GPT-4 Turbo", icon: "⚡" },
    { name: "Claude 3 Sonnet", icon: "🎭" },
    { name: "Gemini Pro", icon: "💎" },
    { name: t("sidebar.aiAssistant"), icon: <Asterisk className="h-4 w-4" /> },
  ]

  return (
    <div className="sticky top-0 z-30 flex gap-2 border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 items-center flex-col py-3 px-4">
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      

      <div className="ml-auto flex items-center gap-2 text-[rgba(227,106,106,1)]">
        <GhostIconButton label="More">
          <AppleIcon className="h-4 w-4 text-[rgba(32,158,180,1)]" />
        </GhostIconButton>
      </div>
    </div>
  )
}
