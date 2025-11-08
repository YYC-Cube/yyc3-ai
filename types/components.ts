// 组件相关类型定义
import type { ReactNode } from "react"

export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: number
  isStreaming?: boolean
  error?: string
}

export interface CodeFile {
  id: string
  name: string
  path: string
  content: string
  language: string
  size: number
  lastModified: number
}

export interface Project {
  id: string
  name: string
  description: string
  type: "web" | "mobile" | "desktop" | "library"
  framework: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  files: CodeFile[]
  createdAt: number
  updatedAt: number
}

export interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  category: string
  isPublic: boolean
  usageCount: number
  createdAt: number
  updatedAt: number
}

export interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  score: number
  timestamp: number
}

export interface LearningProgress {
  courseId: string
  progress: number
  completedLessons: string[]
  quizScores: Record<string, number>
  lastAccessedAt: number
}
