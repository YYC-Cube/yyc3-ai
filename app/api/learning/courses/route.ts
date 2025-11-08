// 学习课程API路由
import { type NextRequest, NextResponse } from "next/server"
import type { APIResponse, LearningCourseRequest } from "@/types/api"

interface Course {
  id: string
  title: string
  description: string
  level: string
  duration: number
  topics: string[]
  lessons: Array<{
    id: string
    title: string
    content: string
    duration: number
  }>
}

export async function GET() {
  try {
    const mockCourses: Course[] = [
      {
        id: "course-1",
        title: "React 基础教程",
        description: "学习React核心概念和最佳实践",
        level: "beginner",
        duration: 10,
        topics: ["components", "hooks", "state"],
        lessons: [
          {
            id: "lesson-1",
            title: "React 简介",
            content: "了解React的基本概念和优势",
            duration: 30,
          },
          {
            id: "lesson-2",
            title: "组件和Props",
            content: "学习如何创建和使用React组件",
            duration: 45,
          },
        ],
      },
      {
        id: "course-2",
        title: "TypeScript 进阶",
        description: "深入学习TypeScript的高级特性",
        level: "intermediate",
        duration: 15,
        topics: ["types", "generics", "decorators"],
        lessons: [
          {
            id: "lesson-3",
            title: "泛型编程",
            content: "掌握TypeScript泛型的使用",
            duration: 60,
          },
        ],
      },
    ]

    return NextResponse.json<APIResponse<Course[]>>({
      success: true,
      data: mockCourses,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Courses GET API error:", error)
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

export async function POST(request: NextRequest) {
  try {
    const body: LearningCourseRequest = await request.json()
    const { level, topics, duration } = body

    // 这里应该根据用户需求生成定制化课程
    const customCourse: Course = {
      id: `course-${Date.now()}`,
      title: `定制${level}课程`,
      description: `针对${topics.join(", ")}的学习路径`,
      level,
      duration: duration || 10,
      topics,
      lessons: [],
    }

    return NextResponse.json<APIResponse<Course>>({
      success: true,
      data: customCourse,
      message: "Custom course created successfully",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Courses POST API error:", error)
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
