"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw, Maximize2, Minimize2, Monitor, Smartphone, Tablet, AlertCircle } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { generatePreviewHTML } from "@/lib/preview-manager"

interface LivePreviewProps {
  code: string
  language: string
  autoRefresh?: boolean
}

type DeviceMode = "desktop" | "tablet" | "mobile"

export default function LivePreview({ code, language, autoRefresh = true }: LivePreviewProps) {
  const { t } = useLocale()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const deviceSizes = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px" },
    mobile: { width: "375px", height: "667px" },
  }

  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        refreshPreview()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [code, autoRefresh])

  const refreshPreview = () => {
    setIsRefreshing(true)
    setError(null)

    try {
      const html = generatePreviewHTML(code, language)

      if (iframeRef.current) {
        const iframe = iframeRef.current
        iframe.srcdoc = html

        iframe.onload = () => {
          setIsRefreshing(false)
          setLastUpdate(new Date())
        }

        iframe.onerror = () => {
          setError("预览加载失败")
          setIsRefreshing(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "预览生成失败")
      setIsRefreshing(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  }

  return (
    <div
      className={`flex flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${isFullscreen ? "fixed inset-4 z-50" : "h-full"}`}
    >
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">预览</span>
          {isRefreshing && <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
          <span className="text-xs text-zinc-500">更新于 {lastUpdate.toLocaleTimeString("zh-CN")}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* 设备模式切换 */}
          <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map((mode) => {
              const Icon = deviceIcons[mode]
              return (
                <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  className={`rounded p-1.5 ${deviceMode === mode ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}
                  title={mode}
                >
                  <Icon className="h-3.5 w-3.5 text-blue-700" />
                </button>
              )
            })}
          </div>

          <button
            onClick={refreshPreview}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="手动刷新"
          >
            <RefreshCw className="h-4 w-4 text-blue-700" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[rgba(231,27,27,1)]"
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="flex flex-1 items-center justify-center overflow-auto bg-zinc-50 p-4 dark:bg-zinc-950">
        {error ? (
          <div className="flex flex-col items-center gap-2 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">{error}</p>
            <button
              onClick={refreshPreview}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300"
            >
              重试
            </button>
          </div>
        ) : (
          <div
            className="bg-white shadow-lg transition-all duration-300 dark:bg-zinc-900"
            style={{
              width: deviceSizes[deviceMode].width,
              height: deviceSizes[deviceMode].height,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <iframe
              ref={iframeRef}
              className="h-full w-full rounded-lg"
              sandbox="allow-scripts allow-same-origin"
              title="代码预览"
            />
          </div>
        )}
      </div>
    </div>
  )
}
