"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, UserIcon, Eye, EyeOff, Loader2, Check } from "lucide-react"
import { authManager } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agree, setAgree] = useState(false)

  // 密码强度检查
  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!agree) {
      setError("请同意服务条款和隐私政策")
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    if (!isPasswordStrong) {
      setError("密码强度不够")
      return
    }

    setLoading(true)

    const result = await authManager.register(email, password, name)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "注册失败")
    }

    setLoading(false)
  }

  const handleOAuthLogin = async (provider: "github" | "wechat" | "google") => {
    setLoading(true)
    setError("")

    const result = await authManager.loginWithOAuth(provider)

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl)
    } else {
      setError(result.error || "OAuth登录失败")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold mb-4">
            YYC³
          </div>
          <h1 className="text-3xl font-bold mb-2">创建账户</h1>
          <p className="text-zinc-600 dark:text-zinc-400">开启您的智能编程之旅</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                姓名
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                邮箱地址
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="创建一个强密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* 密码强度指示器 */}
              {password && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1 flex-1 rounded ${passwordStrength.length ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${passwordStrength.uppercase ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${passwordStrength.lowercase ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${passwordStrength.number ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                    />
                  </div>
                  <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Check className={`h-3 w-3 ${passwordStrength.length ? "text-green-500" : "text-zinc-300"}`} />
                      <span>至少8个字符</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`h-3 w-3 ${passwordStrength.uppercase ? "text-green-500" : "text-zinc-300"}`} />
                      <span>包含大写字母</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`h-3 w-3 ${passwordStrength.lowercase ? "text-green-500" : "text-zinc-300"}`} />
                      <span>包含小写字母</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={`h-3 w-3 ${passwordStrength.number ? "text-green-500" : "text-zinc-300"}`} />
                      <span>包含数字</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 rounded border-zinc-300"
              />
              <span className="text-zinc-600 dark:text-zinc-400">
                我已阅读并同意
                <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mx-1">
                  服务条款
                </Link>
                和
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mx-1">
                  隐私政策
                </Link>
              </span>
            </label>

            <Button type="submit" disabled={loading || !agree} className="w-full h-11">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  注册中...
                </>
              ) : (
                "创建账户"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">已有账户? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
              立即登录
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-zinc-900 text-zinc-500">或使用以下方式注册</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleOAuthLogin("github")}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleOAuthLogin("wechat")}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 bg-transparent"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>
            </div>

            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-4">
              使用第三方登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
