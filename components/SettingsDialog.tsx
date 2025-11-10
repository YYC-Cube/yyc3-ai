"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Globe, Palette, Crown, LogOut, ChevronRight, Check, Moon, Sun, Monitor } from "lucide-react"
import { authManager, type User as UserType } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState("")

  useEffect(() => {
    if (!open) return

    const currentUser = authManager.getUser()
    console.log("[v0] Settings dialog opened, current user:", currentUser)

    if (!currentUser) {
      onOpenChange(false)
      router.push("/login")
      return
    }

    setUser(currentUser)
    setProfileName(currentUser.name)
    setProfileAvatar(currentUser.avatar || "")

    applyTheme(currentUser.preferences.theme)

    const unsubscribe = authManager.subscribe((updatedUser) => {
      console.log("[v0] User updated in settings:", updatedUser)
      setUser(updatedUser)
      if (updatedUser) {
        setProfileName(updatedUser.name)
        setProfileAvatar(updatedUser.avatar || "")
        applyTheme(updatedUser.preferences.theme)
      }
    })

    return unsubscribe
  }, [open, router, onOpenChange])

  const applyTheme = (theme: "light" | "dark" | "system") => {
    console.log("[v0] Applying theme:", theme)
    const root = document.documentElement

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
      console.log("[v0] System theme applied, isDark:", isDark)
    } else {
      root.classList.toggle("dark", theme === "dark")
      console.log("[v0] Theme applied to root element, dark mode:", theme === "dark")
    }

    setTimeout(() => {
      document.body.style.display = "none"
      document.body.offsetHeight
      document.body.style.display = ""
    }, 0)
  }

  const handleLogout = () => {
    console.log("[v0] Logging out from settings")
    authManager.logout()
    onOpenChange(false)
    router.push("/login")
  }

  const handleLanguageChange = (language: "zh-CN" | "en") => {
    console.log("[v0] Changing language to:", language)
    const success = authManager.updatePreferences({ language })
    console.log("[v0] Language update success:", success)
  }

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    console.log("[v0] Changing theme to:", theme)
    const success = authManager.updatePreferences({ theme })
    console.log("[v0] Theme update success:", success)
    if (success) {
      applyTheme(theme)
    }
  }

  const handleProfileSave = () => {
    if (!user) return

    console.log("[v0] Saving profile:", { name: profileName, avatar: profileAvatar })

    const success = authManager.updateUser({
      name: profileName,
      avatar: profileAvatar || undefined,
    })

    console.log("[v0] Profile update success:", success)

    if (success) {
      setActiveSection(null)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {activeSection ? (
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => {
                console.log("[v0] Returning to main settings")
                setActiveSection(null)
              }}
              className="mb-4"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              返回
            </Button>

            {activeSection === "profile" && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>个人资料</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => {
                        console.log("[v0] Name input changed:", e.target.value)
                        setProfileName(e.target.value)
                      }}
                      placeholder="请输入姓名"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-zinc-100 dark:bg-zinc-800"
                    />
                    <p className="text-xs text-zinc-500">邮箱地址不可更改</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">头像URL</Label>
                    <Input
                      id="avatar"
                      value={profileAvatar}
                      onChange={(e) => {
                        console.log("[v0] Avatar URL changed:", e.target.value)
                        setProfileAvatar(e.target.value)
                      }}
                      placeholder="https://..."
                    />
                    {profileAvatar && (
                      <div className="mt-2">
                        <img
                          src={profileAvatar || "/placeholder.svg"}
                          alt="头像预览"
                          className="w-16 h-16 rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={handleProfileSave} className="w-full">
                    保存更改
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "language" && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>语言设置</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      console.log("[v0] Language button clicked: zh-CN")
                      handleLanguageChange("zh-CN")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      user.preferences.language === "zh-CN"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">简体中文</div>
                      <div className="text-sm text-zinc-500">Simplified Chinese</div>
                    </div>
                    {user.preferences.language === "zh-CN" && <Check className="h-5 w-5 text-blue-500" />}
                  </button>

                  <button
                    onClick={() => {
                      console.log("[v0] Language button clicked: en")
                      handleLanguageChange("en")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      user.preferences.language === "en"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">English</div>
                      <div className="text-sm text-zinc-500">英语</div>
                    </div>
                    {user.preferences.language === "en" && <Check className="h-5 w-5 text-blue-500" />}
                  </button>
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>外观设置</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      console.log("[v0] Theme button clicked: light")
                      handleThemeChange("light")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      user.preferences.theme === "light"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">浅色</div>
                        <div className="text-sm text-zinc-500">Light mode</div>
                      </div>
                    </div>
                    {user.preferences.theme === "light" && <Check className="h-5 w-5 text-blue-500" />}
                  </button>

                  <button
                    onClick={() => {
                      console.log("[v0] Theme button clicked: dark")
                      handleThemeChange("dark")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      user.preferences.theme === "dark"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">深色</div>
                        <div className="text-sm text-zinc-500">Dark mode</div>
                      </div>
                    </div>
                    {user.preferences.theme === "dark" && <Check className="h-5 w-5 text-blue-500" />}
                  </button>

                  <button
                    onClick={() => {
                      console.log("[v0] Theme button clicked: system")
                      handleThemeChange("system")
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      user.preferences.theme === "system"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">跟随系统</div>
                        <div className="text-sm text-zinc-500">System default</div>
                      </div>
                    </div>
                    {user.preferences.theme === "system" && <Check className="h-5 w-5 text-blue-500" />}
                  </button>
                </div>
              </div>
            )}

            {activeSection === "plan" && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>订阅计划</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                  <div
                    className={`p-6 rounded-xl border-2 ${
                      user.plan === "free"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Free</h3>
                      {user.plan === "free" && <Check className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="text-3xl font-bold mb-4">
                      ¥0<span className="text-lg text-zinc-500">/月</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        基础AI功能
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        10次/天对话限制
                      </li>
                    </ul>
                  </div>

                  <div
                    className={`p-6 rounded-xl border-2 ${
                      user.plan === "pro"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">Pro</h3>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">推荐</span>
                      </div>
                      {user.plan === "pro" && <Check className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="text-3xl font-bold mb-4">
                      ¥99<span className="text-lg text-zinc-500">/月</span>
                    </div>
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        所有AI功能
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        无限制对话
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        优先支持
                      </li>
                    </ul>
                    {user.plan !== "pro" && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          console.log("[v0] Upgrading to Pro plan")
                          authManager.upgradePlan("pro")
                        }}
                      >
                        升级到Pro
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle>设置</DialogTitle>
            </DialogHeader>

            {/* 用户信息卡片 */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    {user.plan !== "free" && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {user.plan.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-500 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* 设置菜单 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-500 mb-2">通用设置</div>

              <button
                onClick={() => {
                  console.log("[v0] Opening profile section")
                  setActiveSection("profile")
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  <span className="text-sm">个人资料</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>

              <button
                onClick={() => {
                  console.log("[v0] Opening language section")
                  setActiveSection("language")
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">语言</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {user.preferences.language === "zh-CN" ? "简体中文" : "English"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
              </button>

              <button
                onClick={() => {
                  console.log("[v0] Opening appearance section")
                  setActiveSection("appearance")
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm">外观</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {user.preferences.theme === "light" ? "浅色" : user.preferences.theme === "dark" ? "深色" : "系统"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </div>
              </button>

              <div className="text-xs font-medium text-zinc-500 mb-2 mt-4">账户</div>

              <button
                onClick={() => {
                  console.log("[v0] Opening plan section")
                  setActiveSection("plan")
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm">订阅计划</span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
