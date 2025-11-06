"use client"

import { useState, useEffect } from "react"
import { Code, Eye, Split, FileCode, Plus, X, History, GitCompare, Share, Users } from "lucide-react"
import { useLocale } from "@/contexts/LocaleContext"
import CodeEditor from "./CodeEditor"
import LivePreview from "./LivePreview"
import VersionHistory from "./VersionHistory"
import CodeDiff from "./CodeDiff"
import ShareDialog from "./ShareDialog"
import CollaborationPanel from "./CollaborationPanel"
import { type CodeFile, CodeExecutor } from "@/lib/code-executor"
import { PreviewManager } from "@/lib/preview-manager"
import { getVersionControl } from "@/lib/version-control"

type ViewMode = "editor" | "preview" | "split"
type SidePanel = "none" | "history" | "diff" | "collaboration"

const INITIAL_FILES: CodeFile[] = [
  {
    id: "1",
    name: "App.jsx",
    language: "react",
    path: "/App.jsx",
    content: `function App() {
  const [count, setCount] = React.useState(0)
  
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>React 实时预览</h1>
      <p>计数器: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px'
        }}
      >
        点击增加
      </button>
    </div>
  )
}`,
  },
]

export default function CodePlayground() {
  const { t } = useLocale()
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES)
  const [activeFileId, setActiveFileId] = useState(files[0].id)
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [sidePanel, setSidePanel] = useState<SidePanel>("none")
  const [executor] = useState(() => new CodeExecutor())
  const [previewManager] = useState(() => new PreviewManager())
  const [compareVersion, setCompareVersion] = useState<string | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const versionControl = getVersionControl()

  const activeFile = files.find((f) => f.id === activeFileId) || files[0]

  useEffect(() => {
    return () => {
      executor.destroy()
      previewManager.destroy()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeFile) {
        versionControl.saveVersion(activeFile.id, activeFile.content, "自动保存")
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [activeFile])

  const handleFileChange = (content: string) => {
    setFiles((prev) => prev.map((f) => (f.id === activeFileId ? { ...f, content } : f)))
  }

  const handleExecute = async () => {
    if (activeFile.language === "javascript" || activeFile.language === "typescript") {
      const result = await executor.executeJavaScript(activeFile.content)
      console.log("[v0] Execution result:", result)
    }
  }

  const addNewFile = () => {
    const name = prompt("文件名 (例如: utils.js)")
    if (!name) return

    const extension = name.split(".").pop() || "js"
    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "react",
      ts: "typescript",
      tsx: "react",
      html: "html",
      css: "css",
    }

    const newFile: CodeFile = {
      id: Math.random().toString(36).slice(2),
      name,
      language: languageMap[extension] || "javascript",
      path: `/${name}`,
      content: "",
    }

    setFiles((prev) => [...prev, newFile])
    setActiveFileId(newFile.id)
  }

  const removeFile = (id: string) => {
    if (files.length === 1) {
      alert("至少保留一个文件")
      return
    }
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (activeFileId === id) {
      setActiveFileId(files[0].id)
    }
  }

  const handleRestore = (content: string) => {
    handleFileChange(content)
    setSidePanel("none")
  }

  const compareVersionContent = compareVersion
    ? versionControl.getVersion(activeFile.id, compareVersion)?.content || ""
    : ""

  const shareFiles = files.map((f) => ({
    name: f.name,
    content: f.content,
    language: f.language,
  }))

  return (
    <div className="flex h-full flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">代码实验室</span>
        </div>

        {/* 文件标签页区域 */}
        <div className="flex items-center gap-1">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                activeFileId === file.id
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span className="font-medium">{file.name}</span>
              {files.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }} 
                  className="opacity-60 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
          <button
            onClick={addNewFile}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="新建文件"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* 协作按钮 */}
          <button
            onClick={() => setSidePanel(sidePanel === "collaboration" ? "none" : "collaboration")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              sidePanel === "collaboration"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            协作
          </button>

          {/* 其他功能按钮 */}
          <button 
            onClick={() => setShowShareDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Share className="h-3.5 w-3.5" />
            分享
          </button>

          <button 
            onClick={() => setSidePanel(sidePanel === "history" ? "none" : "history")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              sidePanel === "history"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            历史
          </button>

          <button 
            onClick={() => setSidePanel(sidePanel === "diff" ? "none" : "diff")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              sidePanel === "diff"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            分析
          </button>

          <button 
            onClick={() => setViewMode("editor")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              viewMode === "editor"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            编辑器
          </button>

          <button 
            onClick={() => setViewMode("split")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              viewMode === "split"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Split className="h-3.5 w-3.5" />
            分屏
          </button>

          <button 
            onClick={() => setViewMode("preview")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              viewMode === "preview"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            预览
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-1 overflow-hidden ${sidePanel !== "none" ? "w-2/3" : "w-full"}`}>
          {(viewMode === "editor" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"}`}>
              <CodeEditor file={activeFile} onChange={handleFileChange} onExecute={handleExecute} />
            </div>
          )}

          <div className="w-px bg-zinc-200 dark:bg-zinc-800" />

          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "split" ? "w-1/2" : "w-full"}`}>
              <LivePreview code={activeFile.content} language={activeFile.language} autoRefresh={true} />
            </div>
          )}
        </div>

        {sidePanel !== "none" && (
          <>
            <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-1/3 overflow-hidden">
              {sidePanel === "history" && (
                <VersionHistory fileId={activeFile.id} currentContent={activeFile.content} onRestore={handleRestore} />
              )}
              {sidePanel === "diff" && compareVersion && (
                <CodeDiff
                  oldContent={compareVersionContent}
                  newContent={activeFile.content}
                  oldLabel="选中版本"
                  newLabel="当前版本"
                />
              )}
              {sidePanel === "diff" && !compareVersion && (
                <div className="flex h-full items-center justify-center text-center text-sm text-zinc-500">
                  <div>
                    <GitCompare className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                    <p>请先在版本历史中选择要对比的版本</p>
                  </div>
                </div>
              )}
              {sidePanel === "collaboration" && <CollaborationPanel />}
            </div>
          </>
        )}
      </div>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        projectName={activeFile.name}
        files={shareFiles}
      />
    </div>
  )
}
