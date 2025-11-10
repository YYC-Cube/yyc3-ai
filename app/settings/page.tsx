"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Globe,
  Bell,
  Shield,
  Palette,
  Crown,
  LogOut,
  ChevronRight,
  Check,
  Mail,
  Calendar,
  ArrowLeft,
} from "lucide-react"
import { authManager, type User as UserType } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [profileName, setProfileName] = useState("")
  const [profileAvatar, setProfileAvatar] = useState("")

  useEffect(() => {
    const currentUser = authManager.getUser()
    console.log("[v0] Settings page loaded, current user:", currentUser)

    if (!currentUser) {
      router.push("/login")
      return
    }

    setUser(currentUser)
    setProfileName(currentUser.name)
    setProfileAvatar(currentUser.avatar || "")

    // 应用当前主题到DOM
    applyTheme(currentUser.preferences.theme)

    const unsubscribe = authManager.subscribe((updatedUser) => {
      console.log("[v0] User updated:", updatedUser)
      setUser(updatedUser)
      if (updatedUser) {
        setProfileName(updatedUser.name)
        setProfileAvatar(updatedUser.avatar || "")
        applyTheme(updatedUser.preferences.theme)
      }
    })

    return unsubscribe
  }, [router])

  const applyTheme = (theme: "light" | "dark" | "system") => {
    console.log("[v0] Applying theme:", theme)
    const root = document.documentElement

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", isDark)
      console.log("[v0] System theme applied, isDark:", isDark)
    } else {
      root.classList.toggle("dark", theme === "dark")
      console.log("[v0] Theme applied:", theme)
    }
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
    authManager.logout()
    router.push("/login")
  }

  const handleLanguageChange = (language: "zh-CN" | "en") => {
    console.log("[v0] Changing language to:", language)
    authManager.updatePreferences({ language })
  }

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    console.log("[v0] Changing theme to:", theme)
    authManager.updatePreferences({ theme })
    applyTheme(theme)
  }

  const handleProfileSave = () => {
    if (!user) return

    console.log("[v0] Saving profile:", { name: profileName, avatar: profileAvatar })

    authManager.updateUser({
      name: profileName,
      avatar: profileAvatar || undefined,
    })

    setActiveSection(null)
  }

  if (!user) {
    return null
  }

  if (activeSection) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl mx-auto p-6">
          <Button variant="ghost" onClick={() => setActiveSection(null)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>

          {activeSection === "profile" && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold">个人资料</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="h-11"
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
                    className="h-11 bg-zinc-100 dark:bg-zinc-800"
                  />
                  <p className="text-xs text-zinc-500">邮箱地址不可更改</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">头像URL</Label>
                  <Input
                    id="avatar"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="https://..."
                    className="h-11"
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold">语言设置</h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleLanguageChange("zh-CN")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                    user.preferences.language === "zh-CN"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">简体中文</div>
                    <div className="text-sm text-zinc-500">Simplified Chinese</div>
                  </div>
                  {user.preferences.language === "zh-CN" && <Check className="h-5 w-5 text-blue-500" />}
                </button>

                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                    user.preferences.language === "en"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-zinc-200 dark:border-zinc-800"
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
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold">外观设置</h2>

              <div className="space-y-3">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border ${
                      user.preferences.theme === theme
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">
                        {theme === "light" ? "浅色" : theme === "dark" ? "深色" : "跟随系统"}
                      </div>
                    </div>
                    {user.preferences.theme === theme && <Check className="h-5 w-5 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === "plan" && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold">订阅计划</h2>

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
                    <Button className="w-full" onClick={() => authManager.upgradePlan("pro")}>
                      升级到Pro
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto p-6">
        {/* 用户信息卡片 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.plan !== "free" && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {user.plan.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                <Calendar className="h-4 w-4" />
                加入于 {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {user.plan !== "pro" && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">升级到Pro版本</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">解锁全部功能和无限制使用</div>
                </div>
                <Button size="sm" onClick={() => setActiveSection("plan")}>
                  了解更多
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 设置菜单 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-zinc-500 mb-2">通用设置</div>

          <button
            onClick={() => setActiveSection("profile")}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span>个人资料</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>

          <button
            onClick={() => setActiveSection("language")}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <span>语言</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">
                {user.preferences.language === "zh-CN" ? "简体中文" : "English"}
              </span>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </div>
          </button>

          <button
            onClick={() => setActiveSection("appearance")}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              <span>外观</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">
                {user.preferences.theme === "light" ? "浅色" : user.preferences.theme === "dark" ? "深色" : "跟随系统"}
              </span>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <span>通知</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <span>安全与隐私</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>

          <div className="text-sm font-medium text-zinc-500 mb-2 mt-6">账户</div>

          <button
            onClick={() => setActiveSection("plan")}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5" />
              <span>订阅计划</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}
