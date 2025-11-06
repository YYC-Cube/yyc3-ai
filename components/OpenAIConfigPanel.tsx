"use client"

import { useState, useEffect } from "react"
import { Key, TestTube, Check, X, Loader2 } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import {
  type OpenAIConfig,
  loadOpenAIConfig,
  saveOpenAIConfig,
  testOpenAIConnection,
  availableModels,
} from "@/lib/openai-config"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export default function OpenAIConfigPanel() {
  const { t } = useLocale()
  const [config, setConfig] = useState<OpenAIConfig>(loadOpenAIConfig())
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    saveOpenAIConfig(config)
  }, [config])

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    const success = await testOpenAIConnection(config)
    setTestResult(success ? "success" : "error")
    setTesting(false)

    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("settings.openai")}</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("settings.apiKey")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={t("settings.apiKeyPlaceholder")}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? "隐藏" : "显示"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">{t("settings.model")}</Label>
            <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">{t("settings.temperature")}</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">{t("settings.maxTokens")}</Label>
              <Input
                id="maxTokens"
                type="number"
                min="100"
                max="4000"
                step="100"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={handleTestConnection} disabled={!config.apiKey || testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("common.loading")}
              </>
            ) : testResult === "success" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {t("settings.connectionSuccess")}
              </>
            ) : testResult === "error" ? (
              <>
                <X className="h-4 w-4 mr-2" />
                {t("settings.connectionFailed")}
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                {t("settings.testConnection")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
