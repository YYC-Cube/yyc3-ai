"use client"

import { useState } from "react"
import { Download, Trash2, Play, Loader2, HardDrive, Cloud } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import { type ModelInfo, localModels, downloadModel } from "@/lib/model-manager"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export default function ModelManagementPanel() {
  const { t } = useLocale()
  const [models, setModels] = useState<ModelInfo[]>(localModels)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleDownload = async (modelId: string) => {
    setDownloadingId(modelId)
    setDownloadProgress(0)

    await downloadModel(modelId, (progress) => {
      setDownloadProgress(progress)
    })

    setModels(models.map((m) => (m.id === modelId ? { ...m, status: "downloaded" as const } : m)))
    setDownloadingId(null)
  }

  const handleDelete = (modelId: string) => {
    setModels(models.map((m) => (m.id === modelId ? { ...m, status: "available" as const } : m)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("models.title")}</h3>

        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              {t("models.local")}
            </TabsTrigger>
            <TabsTrigger value="remote" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              {t("models.remote")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-3 mt-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {model.provider} · {model.size}
                  </div>
                  {downloadingId === model.id && <Progress value={downloadProgress} className="mt-2" />}
                </div>

                <div className="flex items-center gap-2">
                  {model.status === "available" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(model.id)}
                      disabled={downloadingId !== null}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("models.download")}
                    </Button>
                  )}

                  {model.status === "downloaded" && (
                    <>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        {t("models.train")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(model.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {downloadingId === model.id && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {downloadProgress}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="remote" className="mt-4">
            <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
              远程模型通过 API 调用,无需下载
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
