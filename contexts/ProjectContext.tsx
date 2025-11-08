// 项目管理Context
"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import type { Project, CodeFile } from "@/types/components"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  selectProject: (id: string) => void
  addFile: (projectId: string, file: Omit<CodeFile, "id">) => void
  updateFile: (projectId: string, fileId: string, updates: Partial<CodeFile>) => void
  deleteFile: (projectId: string, fileId: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const createProject = useCallback(
    (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setProjects((prev) => [...prev, newProject])
      setCurrentProject(newProject)
    },
    [setProjects],
  )

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)))
      if (currentProject?.id === id) {
        setCurrentProject((prev) => (prev ? { ...prev, ...updates, updatedAt: Date.now() } : null))
      }
    },
    [setProjects, currentProject],
  )

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (currentProject?.id === id) {
        setCurrentProject(null)
      }
    },
    [setProjects, currentProject],
  )

  const selectProject = useCallback(
    (id: string) => {
      const project = projects.find((p) => p.id === id)
      setCurrentProject(project || null)
    },
    [projects],
  )

  const addFile = useCallback(
    (projectId: string, file: Omit<CodeFile, "id">) => {
      const newFile: CodeFile = {
        ...file,
        id: `file-${Date.now()}`,
      }
      updateProject(projectId, {
        files: [...(projects.find((p) => p.id === projectId)?.files || []), newFile],
      })
    },
    [projects, updateProject],
  )

  const updateFile = useCallback(
    (projectId: string, fileId: string, updates: Partial<CodeFile>) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return

      const updatedFiles = project.files.map((f) =>
        f.id === fileId ? { ...f, ...updates, lastModified: Date.now() } : f,
      )
      updateProject(projectId, { files: updatedFiles })
    },
    [projects, updateProject],
  )

  const deleteFile = useCallback(
    (projectId: string, fileId: string) => {
      const project = projects.find((p) => p.id === projectId)
      if (!project) return

      const updatedFiles = project.files.filter((f) => f.id !== fileId)
      updateProject(projectId, { files: updatedFiles })
    },
    [projects, updateProject],
  )

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        addFile,
        updateFile,
        deleteFile,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
