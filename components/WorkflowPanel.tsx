"use client"

import { useState } from "react"
import { Plus, Play, Trash2, SettingsIcon } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import type { Workflow } from "@/lib/workflow-system"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

export default function WorkflowPanel() {
  const { t } = useLocale()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({ name: "", description: "" })

  const handleCreate = () => {
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: newWorkflow.name,
      description: newWorkflow.description,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setWorkflows([...workflows, workflow])
    setNewWorkflow({ name: "", description: "" })
    setShowCreate(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("workflows.title")}</h3>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 mr-1" />
          {t("workflows.create")}
        </Button>
      </div>

      {showCreate && (
        <div className="rounded-lg border border-zinc-200 p-4 space-y-4 dark:border-zinc-800">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">{t("workflows.name")}</Label>
            <Input
              id="workflow-name"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              placeholder="输入工作流名称"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-desc">{t("workflows.description")}</Label>
            <Textarea
              id="workflow-desc"
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              placeholder="描述工作流的用途"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!newWorkflow.name}>
              {t("common.save")}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {workflows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            暂无工作流,点击上方按钮创建
          </div>
        ) : (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex-1">
                <div className="font-medium">{workflow.name}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{workflow.description}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  {t("workflows.run")}
                </Button>
                <Button size="sm" variant="outline">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
