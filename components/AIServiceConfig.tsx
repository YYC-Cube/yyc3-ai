// AI服务配置组件
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Check, X, Loader2, Zap } from "lucide-react"
import { unifiedAI, type AIProvider } from "@/lib/unified-ai-service"
import { useLocale } from "@/contexts/LocaleContext"

export default function AIConfig() {
  const { t } = useLocale()
  const [config, setConfig] = useState(unifiedAI.getDefaultConfig())
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([])
  const [models, setModels] = useState<string[]>([])

  useEffect(() => {
    const providers = unifiedAI.getAvailableProviders()
    setAvailableProviders(providers)
    updateModels(config.provider)
  }, [])

  const updateModels = (provider: AIProvider) => {
    const modelList = unifiedAI.getModelsForProvider(provider)
    setModels(modelList)
  }

  const handleProviderChange = (provider: AIProvider) => {
    setConfig((prev) => ({ ...prev, provider }))
    updateModels(provider)
    setTestResult(null)
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setTestResult(null)
  }

  const handleSave = () => {
    unifiedAI.setDefaultConfig(config)
    alert("配置已保存")
  }

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)

    try {
      const success = await unifiedAI.testConnection(config.provider)
      setTestResult({
        success,
        message: success ? "连接成功" : "连接失败,请检查配置",
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `连接失败: ${error instanceof Error ? error.message : "未知错误"}`,
      })
    } finally {
      setIsTesting(false)
    }
  }

  const providerLabels: Record<AIProvider, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google AI",
    local: "本地模型",
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">AI 服务配置</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleTest} disabled={isTesting}>
            {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            测试连接
          </Button>
          <Button size="sm" onClick={handleSave}>
            保存配置
          </Button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              基础配置
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">
              高级设置
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex-1">
              提供商
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* 测试结果 */}
            {testResult && (
              <Card
                className={`p-3 ${testResult.success ? "bg-green-50 border-green-200 dark:bg-green-950/20" : "bg-red-50 border-red-200 dark:bg-red-950/20"}`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${testResult.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {testResult.message}
                  </span>
                </div>
              </Card>
            )}

            <Card className="p-4 space-y-4">
              <div>
                <Label>AI 提供商</Label>
                <Select value={config.provider} onValueChange={(v) => handleProviderChange(v as AIProvider)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {providerLabels[provider]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API 密钥</Label>
                <Input
                  type="password"
                  value={config.apiKey || ""}
                  onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                  placeholder="输入 API 密钥"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>模型</Label>
                <Select value={config.model} onValueChange={(v) => handleConfigChange("model", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label>温度 (Temperature)</Label>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => handleConfigChange("temperature", Number.parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{config.temperature.toFixed(1)}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">控制输出的随机性,值越高越随机</p>
              </div>

              <div>
                <Label>最大令牌数 (Max Tokens)</Label>
                <Input
                  type="number"
                  value={config.maxTokens}
                  onChange={(e) => handleConfigChange("maxTokens", Number.parseInt(e.target.value))}
                  min="1"
                  max="8000"
                  className="mt-1"
                />
                <p className="text-xs text-zinc-500 mt-1">限制生成的最大长度</p>
              </div>

              <div>
                <Label>基础 URL (可选)</Label>
                <Input
                  type="url"
                  value={config.baseURL || ""}
                  onChange={(e) => handleConfigChange("baseURL", e.target.value)}
                  placeholder="https://api.example.com"
                  className="mt-1"
                />
                <p className="text-xs text-zinc-500 mt-1">自定义 API 端点地址</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {availableProviders.map((provider) => (
                <Card key={provider} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{providerLabels[provider]}</h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {provider === "openai" && "GPT-4, GPT-3.5 等模型"}
                        {provider === "anthropic" && "Claude 系列模型"}
                        {provider === "google" && "Gemini 系列模型"}
                        {provider === "local" && "本地运行的开源模型"}
                      </p>
                    </div>
                    {config.provider === provider && <Badge variant="default">当前</Badge>}
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-zinc-500">可用模型:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {unifiedAI
                          .getModelsForProvider(provider)
                          .slice(0, 3)
                          .map((model) => (
                            <Badge key={model} variant="outline" className="text-xs">
                              {model}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
