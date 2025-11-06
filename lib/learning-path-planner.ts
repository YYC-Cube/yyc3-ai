// 学习路径规划器 - 基于用户目标和当前水平生成个性化学习路径

import { learningTracker } from "./learning-tracker"

export interface LearningGoal {
  id: string
  title: string
  description: string
  targetLevel: "beginner" | "intermediate" | "advanced"
  estimatedTime: number // 小时
  prerequisites: string[]
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  topics: string[]
  estimatedTime: number
  completed: boolean
  resources: Resource[]
}

export interface Resource {
  type: "article" | "video" | "practice" | "project"
  title: string
  url?: string
  description: string
}

export interface LearningPath {
  goalId: string
  goalTitle: string
  currentMilestone: number
  totalMilestones: number
  progress: number // 0-100
  milestones: Milestone[]
  nextSteps: string[]
  estimatedCompletion: Date
}

class LearningPathPlanner {
  private storageKey = "learning_paths"

  // 预定义学习目标
  private predefinedGoals: LearningGoal[] = [
    {
      id: "web-dev-beginner",
      title: "Web 开发入门",
      description: "从零开始学习 Web 开发,掌握 HTML、CSS 和 JavaScript 基础",
      targetLevel: "beginner",
      estimatedTime: 40,
      prerequisites: [],
      milestones: [
        {
          id: "m1",
          title: "HTML 基础",
          description: "学习 HTML 标签、语义化和表单",
          topics: ["HTML 标签", "语义化", "表单元素", "多媒体"],
          estimatedTime: 8,
          completed: false,
          resources: [
            { type: "article", title: "HTML 入门教程", description: "基础标签和结构" },
            { type: "practice", title: "创建个人简历页面", description: "实践 HTML 基础" },
          ],
        },
        {
          id: "m2",
          title: "CSS 样式",
          description: "掌握 CSS 选择器、布局和响应式设计",
          topics: ["CSS 选择器", "Flexbox", "Grid", "响应式设计"],
          estimatedTime: 12,
          completed: false,
          resources: [
            { type: "article", title: "CSS 布局指南", description: "Flexbox 和 Grid" },
            { type: "practice", title: "响应式导航栏", description: "实践布局技巧" },
          ],
        },
        {
          id: "m3",
          title: "JavaScript 基础",
          description: "学习 JavaScript 语法、DOM 操作和事件处理",
          topics: ["变量和数据类型", "函数", "DOM 操作", "事件处理"],
          estimatedTime: 15,
          completed: false,
          resources: [
            { type: "article", title: "JavaScript 核心概念", description: "语法和基础" },
            { type: "project", title: "待办事项应用", description: "综合实践项目" },
          ],
        },
        {
          id: "m4",
          title: "实战项目",
          description: "完成一个完整的 Web 项目",
          topics: ["项目规划", "代码组织", "调试技巧"],
          estimatedTime: 5,
          completed: false,
          resources: [{ type: "project", title: "个人作品集网站", description: "展示你的学习成果" }],
        },
      ],
    },
    {
      id: "react-developer",
      title: "React 开发者",
      description: "成为专业的 React 开发者,掌握现代前端开发技能",
      targetLevel: "intermediate",
      estimatedTime: 60,
      prerequisites: ["JavaScript 基础", "HTML/CSS"],
      milestones: [
        {
          id: "m1",
          title: "React 基础",
          description: "理解组件、Props 和 State",
          topics: ["组件", "Props", "State", "生命周期"],
          estimatedTime: 15,
          completed: false,
          resources: [
            { type: "article", title: "React 官方文档", description: "核心概念" },
            { type: "practice", title: "计数器应用", description: "理解状态管理" },
          ],
        },
        {
          id: "m2",
          title: "React Hooks",
          description: "掌握 useState、useEffect 等 Hooks",
          topics: ["useState", "useEffect", "useContext", "自定义 Hooks"],
          estimatedTime: 12,
          completed: false,
          resources: [
            { type: "article", title: "Hooks 完全指南", description: "深入理解 Hooks" },
            { type: "practice", title: "数据获取应用", description: "使用 useEffect" },
          ],
        },
        {
          id: "m3",
          title: "状态管理",
          description: "学习 Context API 和状态管理库",
          topics: ["Context API", "Redux", "Zustand"],
          estimatedTime: 10,
          completed: false,
          resources: [{ type: "article", title: "状态管理最佳实践", description: "选择合适的方案" }],
        },
        {
          id: "m4",
          title: "Next.js 框架",
          description: "学习服务端渲染和全栈开发",
          topics: ["App Router", "Server Components", "API Routes"],
          estimatedTime: 15,
          completed: false,
          resources: [{ type: "article", title: "Next.js 官方教程", description: "现代 React 框架" }],
        },
        {
          id: "m5",
          title: "实战项目",
          description: "构建完整的 React 应用",
          topics: ["项目架构", "性能优化", "部署"],
          estimatedTime: 8,
          completed: false,
          resources: [{ type: "project", title: "社交媒体应用", description: "综合实战" }],
        },
      ],
    },
    {
      id: "python-data-science",
      title: "Python 数据科学",
      description: "学习使用 Python 进行数据分析和机器学习",
      targetLevel: "intermediate",
      estimatedTime: 50,
      prerequisites: ["Python 基础"],
      milestones: [
        {
          id: "m1",
          title: "NumPy 和 Pandas",
          description: "掌握数据处理基础库",
          topics: ["NumPy 数组", "Pandas DataFrame", "数据清洗"],
          estimatedTime: 12,
          completed: false,
          resources: [{ type: "article", title: "Pandas 入门指南", description: "数据处理基础" }],
        },
        {
          id: "m2",
          title: "数据可视化",
          description: "使用 Matplotlib 和 Seaborn",
          topics: ["Matplotlib", "Seaborn", "图表类型"],
          estimatedTime: 10,
          completed: false,
          resources: [{ type: "practice", title: "数据可视化项目", description: "创建交互式图表" }],
        },
        {
          id: "m3",
          title: "机器学习基础",
          description: "学习 Scikit-learn",
          topics: ["监督学习", "非监督学习", "模型评估"],
          estimatedTime: 20,
          completed: false,
          resources: [{ type: "article", title: "机器学习入门", description: "核心算法" }],
        },
        {
          id: "m4",
          title: "实战项目",
          description: "完成数据分析项目",
          topics: ["数据探索", "特征工程", "模型部署"],
          estimatedTime: 8,
          completed: false,
          resources: [{ type: "project", title: "预测模型项目", description: "端到端实践" }],
        },
      ],
    },
  ]

  // 获取所有预定义目标
  getAllGoals(): LearningGoal[] {
    return this.predefinedGoals
  }

  // 根据用户水平推荐目标
  recommendGoals(currentLevel: string, interests: string[]): LearningGoal[] {
    return this.predefinedGoals.filter((goal) => {
      // 匹配等级
      const levelMatch =
        goal.targetLevel === currentLevel || (currentLevel === "beginner" && goal.targetLevel === "intermediate")

      // 匹配兴趣
      const interestMatch =
        interests.length === 0 ||
        interests.some(
          (interest) =>
            goal.title.toLowerCase().includes(interest.toLowerCase()) ||
            goal.description.toLowerCase().includes(interest.toLowerCase()),
        )

      return levelMatch && interestMatch
    })
  }

  // 创建学习路径
  createLearningPath(goalId: string): LearningPath | null {
    const goal = this.predefinedGoals.find((g) => g.id === goalId)
    if (!goal) return null

    const path: LearningPath = {
      goalId: goal.id,
      goalTitle: goal.title,
      currentMilestone: 0,
      totalMilestones: goal.milestones.length,
      progress: 0,
      milestones: goal.milestones,
      nextSteps: this.generateNextSteps(goal.milestones[0]),
      estimatedCompletion: this.calculateEstimatedCompletion(goal.estimatedTime),
    }

    this.saveLearningPath(path)
    return path
  }

  // 更新里程碑状态
  completeMilestone(goalId: string, milestoneId: string): LearningPath | null {
    const path = this.getLearningPath(goalId)
    if (!path) return null

    const milestoneIndex = path.milestones.findIndex((m) => m.id === milestoneId)
    if (milestoneIndex === -1) return null

    path.milestones[milestoneIndex].completed = true
    path.currentMilestone = milestoneIndex + 1
    path.progress = Math.round((path.currentMilestone / path.totalMilestones) * 100)

    // 更新下一步建议
    if (path.currentMilestone < path.totalMilestones) {
      path.nextSteps = this.generateNextSteps(path.milestones[path.currentMilestone])
    } else {
      path.nextSteps = ["恭喜完成所有里程碑!可以开始新的学习目标了"]
    }

    this.saveLearningPath(path)

    // 记录到学习追踪器
    const milestone = path.milestones[milestoneIndex]
    learningTracker.recordLearningNode({
      topic: milestone.title,
      category: path.goalTitle,
      duration: milestone.estimatedTime * 3600,
      difficulty: this.getDifficultyFromGoal(goalId),
      mastery: 80,
      interactions: 1,
      errors: [],
      questions: [],
    })

    return path
  }

  // 获取学习路径
  getLearningPath(goalId: string): LearningPath | null {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(`${this.storageKey}_${goalId}`)
    if (!stored) return null

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  // 获取所有活跃的学习路径
  getActivePaths(): LearningPath[] {
    if (typeof window === "undefined") return []

    const paths: LearningPath[] = []
    this.predefinedGoals.forEach((goal) => {
      const path = this.getLearningPath(goal.id)
      if (path && path.progress < 100) {
        paths.push(path)
      }
    })

    return paths
  }

  // 私有方法
  private saveLearningPath(path: LearningPath): void {
    if (typeof window === "undefined") return
    localStorage.setItem(`${this.storageKey}_${path.goalId}`, JSON.stringify(path))
  }

  private generateNextSteps(milestone: Milestone): string[] {
    const steps: string[] = []

    steps.push(`开始学习: ${milestone.title}`)

    milestone.topics.forEach((topic, index) => {
      if (index < 3) {
        steps.push(`掌握 ${topic}`)
      }
    })

    if (milestone.resources.length > 0) {
      steps.push(`完成 ${milestone.resources.length} 个学习资源`)
    }

    return steps
  }

  private calculateEstimatedCompletion(totalHours: number): Date {
    // 假设每天学习2小时
    const daysNeeded = Math.ceil(totalHours / 2)
    const completion = new Date()
    completion.setDate(completion.getDate() + daysNeeded)
    return completion
  }

  private getDifficultyFromGoal(goalId: string): "beginner" | "intermediate" | "advanced" {
    const goal = this.predefinedGoals.find((g) => g.id === goalId)
    return goal?.targetLevel || "beginner"
  }
}

export const learningPathPlanner = new LearningPathPlanner()
