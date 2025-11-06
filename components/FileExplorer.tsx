"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileCode, FilePlus, Trash2 } from "lucide-react"
import { workspaceManager, type Project, type ProjectFile } from "@/lib/workspace-manager"

interface FileExplorerProps {
  projectId: string
  onFileSelect?: (file: ProjectFile) => void
}

export default function FileExplorer({ projectId, onFileSelect }: FileExplorerProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = () => {
    const proj = workspaceManager.getProject(projectId)
    setProject(proj || null)
  }

  const createFile = () => {
    if (!newFileName.trim() || !project) return

    const extension = newFileName.split(".").pop() || "txt"
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      py: "python",
    }

    workspaceManager.addFile(project.id, {
      name: newFileName,
      path: `/${newFileName}`,
      content: "",
      language: languageMap[extension] || "plaintext",
      size: 0,
    })

    loadProject()
    setIsCreateDialogOpen(false)
    setNewFileName("")
  }

  const deleteFile = (fileId: string) => {
    if (!project || !confirm("确定要删除这个文件吗?")) return
    workspaceManager.deleteFile(project.id, fileId)
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
    loadProject()
  }

  const handleFileClick = (file: ProjectFile) => {
    setSelectedFile(file)
    onFileSelect?.(file)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()
    return <FileCode className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-semibold text-sm">文件浏览器</h3>
        <Button size="sm" variant="ghost" onClick={() => setIsCreateDialogOpen(true)}>
          <FilePlus className="h-4 w-4" />
        </Button>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-auto p-2">
        {project ? (
          <>
            <div className="text-xs font-medium text-zinc-500 px-2 py-1 mb-1">{project.name}</div>
            {project.files.length === 0 ? (
              <div className="text-xs text-zinc-400 py-8 text-center">
                <FileCode className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>暂无文件</p>
                <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setIsCreateDialogOpen(true)}>
                  创建文件
                </Button>
              </div>
            ) : (
              <div className="space-y-0.5">
                {project.files.map((file) => (
                  <div
                    key={file.id}
                    className={`
                      flex items-center justify-between px-2 py-1.5 rounded cursor-pointer
                      hover:bg-zinc-100 dark:hover:bg-zinc-800
                      ${selectedFile?.id === file.id ? "bg-zinc-100 dark:bg-zinc-800" : ""}
                    `}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-zinc-400 py-8 text-center">请先选择一个项目</div>
        )}
      </div>

      {/* 创建文件对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">文件名</label>
              <Input
                placeholder="index.js"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFile()}
              />
            </div>
            <Button onClick={createFile} className="w-full">
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
