"use client"

import { useState } from "react"
import { Download, Trash2, SettingsIcon } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { type Plugin, availablePlugins } from "@/lib/workflow-system"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"

export default function PluginPanel() {
  const { t } = useLocale()
  const [plugins, setPlugins] = useState<Plugin[]>(availablePlugins)

  const handleInstall = (pluginId: string) => {
    setPlugins(plugins.map((p) => (p.id === pluginId ? { ...p, installed: true } : p)))
  }

  const handleUninstall = (pluginId: string) => {
    setPlugins(plugins.map((p) => (p.id === pluginId ? { ...p, installed: false, enabled: false } : p)))
  }

  const handleToggle = (pluginId: string) => {
    setPlugins(plugins.map((p) => (p.id === pluginId ? { ...p, enabled: !p.enabled } : p)))
  }

  const categoryColors = {
    productivity: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    integration: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    ai: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    utility: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("plugins.title")}</h3>

        <div className="space-y-3">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="flex items-start gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{plugin.name}</div>
                  <Badge className={categoryColors[plugin.category]}>{plugin.category}</Badge>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{plugin.description}</div>
                <div className="text-xs text-zinc-400">
                  v{plugin.version} · {plugin.author}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {plugin.installed ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Switch checked={plugin.enabled} onCheckedChange={() => handleToggle(plugin.id)} />
                      <span className="text-sm text-zinc-500">{plugin.enabled ? "已启用" : "已禁用"}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleUninstall(plugin.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => handleInstall(plugin.id)}>
                    <Download className="h-4 w-4 mr-1" />
                    {t("plugins.install")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
