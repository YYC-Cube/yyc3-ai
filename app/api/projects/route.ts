// 项目管理API路由
import { type NextRequest, NextResponse } from "next/server"
import type { APIResponse, ProjectCreateRequest, PaginatedResponse } from "@/types/api"
import type { Project } from "@/types/components"

// GET - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

    // 这里应该从数据库获取，暂时返回模拟数据
    const mockProjects: Project[] = [
      {
        id: "project-1",
        name: "React Dashboard",
        description: "Modern admin dashboard built with React and TypeScript",
        type: "web",
        framework: "react",
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          vite: "^4.0.0",
        },
        files: [],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now(),
      },
    ]

    const total = mockProjects.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const data = mockProjects.slice(start, start + pageSize)

    return NextResponse.json<PaginatedResponse<Project>>({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Projects GET API error:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

// POST - 创建项目
export async function POST(request: NextRequest) {
  try {
    const body: ProjectCreateRequest = await request.json()
    const { name, description, type, framework, template } = body

    if (!name || !type || !framework) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Name, type, and framework are required",
          timestamp: Date.now(),
        },
        { status: 400 },
      )
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description: description || "",
      type: type as any,
      framework,
      dependencies: {},
      devDependencies: {},
      files: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // 这里应该保存到数据库

    return NextResponse.json<APIResponse<Project>>({
      success: true,
      data: newProject,
      message: "Project created successfully",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Projects POST API error:", error)
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: (error as Error).message,
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
