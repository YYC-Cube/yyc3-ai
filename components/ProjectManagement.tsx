"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  FileCode,
  Plus,
  Download,
  Upload,
  GitBranch,
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface FileNode {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  content?: string
  children?: FileNode[]
  size?: number
  modified?: Date
}

interface Project {
  id: string
  name: string
  description: string
  root: FileNode
  created: Date
  modified: Date
  dependencies: Record<string, string>
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("yyc3_projects")
    if (saved) {
      const parsed = JSON.parse(saved)
      setProjects(
        parsed.map((p: any) => ({
          ...p,
          created: new Date(p.created),
          modified: new Date(p.modified),
        })),
      )
    }
  }, [])

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem("yyc3_projects", JSON.stringify(projects))
    }
  }, [projects])

  const createProject = (name: string, description: string, template: string) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      created: new Date(),
      modified: new Date(),
      dependencies: getTemplateDependencies(template),
      root: {
        id: "root",
        name: name,
        type: "folder",
        path: "/",
        children: getTemplateStructure(template),
      },
    }
    setProjects([...projects, newProject])
    setCurrentProject(newProject)
    setShowNewProjectDialog(false)
  }

  const getTemplateDependencies = (template: string): Record<string, string> => {
    const templates: Record<string, Record<string, string>> = {
      react: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        typescript: "^5.0.0",
      },
      nextjs: {
        next: "^14.2.0",
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        typescript: "^5.0.0",
      },
      vue: {
        vue: "^3.4.0",
        typescript: "^5.0.0",
      },
      node: {
        express: "^4.18.0",
        typescript: "^5.0.0",
      },
    }
    return templates[template] || {}
  }

  const getTemplateStructure = (template: string): FileNode[] => {
    const templates: Record<string, FileNode[]> = {
      react: [
        {
          id: "src",
          name: "src",
          type: "folder",
          path: "/src",
          children: [
            { id: "app", name: "App.tsx", type: "file", path: "/src/App.tsx", content: "// React App" },
            { id: "main", name: "main.tsx", type: "file", path: "/src/main.tsx", content: "// Entry point" },
          ],
        },
        { id: "package", name: "package.json", type: "file", path: "/package.json", content: "{}" },
        { id: "tsconfig", name: "tsconfig.json", type: "file", path: "/tsconfig.json", content: "{}" },
      ],
      nextjs: [
        {
          id: "app",
          name: "app",
          type: "folder",
          path: "/app",
          children: [
            { id: "page", name: "page.tsx", type: "file", path: "/app/page.tsx", content: "// Next.js Page" },
            { id: "layout", name: "layout.tsx", type: "file", path: "/app/layout.tsx", content: "// Layout" },
          ],
        },
        { id: "package", name: "package.json", type: "file", path: "/package.json", content: "{}" },
      ],
      vue: [
        {
          id: "src",
          name: "src",
          type: "folder",
          path: "/src",
          children: [
            { id: "app", name: "App.vue", type: "file", path: "/src/App.vue", content: "<!-- Vue App -->" },
            { id: "main", name: "main.ts", type: "file", path: "/src/main.ts", content: "// Entry point" },
          ],
        },
        { id: "package", name: "package.json", type: "file", path: "/package.json", content: "{}" },
      ],
      node: [
        {
          id: "src",
          name: "src",
          type: "folder",
          path: "/src",
          children: [{ id: "index", name: "index.ts", type: "file", path: "/src/index.ts", content: "// Server" }],
        },
        { id: "package", name: "package.json", type: "file", path: "/package.json", content: "{}" },
      ],
    }
    return templates[template] || []
  }

  const createFile = (parent: FileNode, name: string, type: "file" | "folder") => {
    if (!currentProject) return

    const newNode: FileNode = {
      id: `node-${Date.now()}`,
      name,
      type,
      path: `${parent.path}/${name}`,
      children: type === "folder" ? [] : undefined,
      content: type === "file" ? "" : undefined,
      modified: new Date(),
    }

    const updateNode = (node: FileNode): FileNode => {
      if (node.id === parent.id) {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        }
      }
      return node
    }

    const updatedRoot = updateNode(currentProject.root)
    setCurrentProject({
      ...currentProject,
      root: updatedRoot,
      modified: new Date(),
    })
    setProjects(projects.map((p) => (p.id === currentProject.id ? { ...currentProject, root: updatedRoot } : p)))
  }

  const deleteNode = (nodeId: string) => {
    if (!currentProject) return

    const deleteFromNode = (node: FileNode): FileNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter((child) => child.id !== nodeId).map(deleteFromNode),
        }
      }
      return node
    }

    const updatedRoot = deleteFromNode(currentProject.root)
    setCurrentProject({ ...currentProject, root: updatedRoot, modified: new Date() })
    setProjects(projects.map((p) => (p.id === currentProject.id ? { ...currentProject, root: updatedRoot } : p)))
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const exportProject = () => {
    if (!currentProject) return
    const blob = new Blob([JSON.stringify(currentProject, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${currentProject.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setProjects([...projects, imported])
        setCurrentProject(imported)
      } catch (err) {
        console.error("[v0] Failed to import project:", err)
      }
    }
    reader.readAsText(file)
  }

  const renderFileTree = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.id)
    const isSelected = selectedNode?.id === node.id
    const Icon = node.type === "folder" ? (isExpanded ? FolderOpen : Folder) : FileCode

    return (
      <div key={node.id}>
        <button
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id)
            }
            setSelectedNode(node)
          }}
          className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
            isSelected
              ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-100"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {node.type === "folder" && (
            <span className="text-zinc-400">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}
          <Icon className="h-4 w-4" />
          <span className="flex-1 truncate text-left">{node.name}</span>
          {node.size && <span className="text-xs text-zinc-500">{formatSize(node.size)}</span>}
        </button>
        {node.type === "folder" && isExpanded && node.children?.map((child) => renderFileTree(child, level + 1))}
      </div>
    )
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="flex h-full gap-4">
      {/* 项目列表 */}
      <div className="w-64 flex-shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">项目</h3>
          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="新建项目"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setCurrentProject(project)}
              className={`mb-1 w-full rounded p-2 text-left text-sm transition-colors ${
                currentProject?.id === project.id
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="font-medium">{project.name}</div>
              <div className="text-xs text-zinc-500">{project.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 文件树 */}
      {currentProject && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex-1 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 p-3 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">文件</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNewFileDialog(true)}
                  className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="新建文件"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={exportProject}
                  className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="导出项目"
                >
                  <Download className="h-4 w-4" />
                </button>
                <label className="cursor-pointer rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800" title="导入项目">
                  <Upload className="h-4 w-4" />
                  <input type="file" accept=".json" onChange={importProject} className="hidden" />
                </label>
              </div>
            </div>
            <div className="p-2">{renderFileTree(currentProject.root)}</div>
          </div>

          {/* package.json管理 */}
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">依赖管理</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(currentProject.dependencies).map(([name, version]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded border border-zinc-200 p-2 text-sm dark:border-zinc-800"
                >
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">{name}</span>
                  <span className="text-zinc-500">{version}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
