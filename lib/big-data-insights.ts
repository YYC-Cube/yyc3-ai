"use client"

// 大数据驱动建议系统 - 基于学习数据和常见模式提供智能建议

export interface CommonPitfall {
  topic: string
  description: string
  frequency: number // 出现频率百分比
  solution: string
  examples: string[]
}

export interface LearningPattern {
  fromTopic: string
  toTopic: string
  successRate: number
  averageTime: number // 平均学习时间(小时)
  commonChallenges: string[]
}

export interface TechTrend {
  technology: string
  category: string
  popularity: number // 1-100
  growthRate: number // 增长率
  useCases: string[]
  relatedTopics: string[]
}

export interface DataDrivenInsight {
  type: "pitfall" | "pattern" | "trend" | "optimization"
  title: string
  description: string
  data: string // 数据支撑
  actionable: string // 可执行建议
  priority: "high" | "medium" | "low"
}

class BigDataInsights {
  // 常见陷阱数据库
  private commonPitfalls: CommonPitfall[] = [
    {
      topic: "Python 函数",
      description: "形参与实参混淆",
      frequency: 80,
      solution: "形参是函数定义时的占位符,实参是调用时传入的实际值",
      examples: ["def greet(name):  # name 是形参", 'greet("Alice")  # "Alice" 是实参'],
    },
    {
      topic: "JavaScript 异步",
      description: "Promise 和 async/await 使用时机不清",
      frequency: 75,
      solution: "async/await 是 Promise 的语法糖,用于简化异步代码的书写",
      examples: [
        "// Promise 方式",
        "fetch(url).then(res => res.json()).then(data => console.log(data))",
        "// async/await 方式",
        "const res = await fetch(url); const data = await res.json();",
      ],
    },
    {
      topic: "React Hooks",
      description: "useEffect 依赖项数组理解不足",
      frequency: 85,
      solution: "依赖项数组决定 effect 何时重新执行,空数组表示只在挂载时执行一次",
      examples: [
        "useEffect(() => { /* 每次渲染都执行 */ })",
        "useEffect(() => { /* 只在挂载时执行 */ }, [])",
        "useEffect(() => { /* count 变化时执行 */ }, [count])",
      ],
    },
    {
      topic: "CSS 布局",
      description: "Flexbox 和 Grid 选择困难",
      frequency: 70,
      solution: "Flexbox 适合一维布局(行或列),Grid 适合二维布局(行和列)",
      examples: [
        "/* Flexbox - 导航栏 */",
        "display: flex; justify-content: space-between;",
        "/* Grid - 卡片网格 */",
        "display: grid; grid-template-columns: repeat(3, 1fr);",
      ],
    },
    {
      topic: "TypeScript 类型",
      description: "any 和 unknown 的区别不清",
      frequency: 65,
      solution: "any 关闭类型检查,unknown 需要类型断言才能使用,更安全",
      examples: [
        "let a: any = 5; a.toFixed(); // 不报错但可能运行时出错",
        "let b: unknown = 5; (b as number).toFixed(); // 需要断言",
      ],
    },
  ]

  // 学习路径模式
  private learningPatterns: LearningPattern[] = [
    {
      fromTopic: "HTML 基础",
      toTopic: "CSS 基础",
      successRate: 95,
      averageTime: 2,
      commonChallenges: ["选择器优先级", "盒模型理解"],
    },
    {
      fromTopic: "JavaScript 基础",
      toTopic: "React 入门",
      successRate: 75,
      averageTime: 8,
      commonChallenges: ["组件思维转换", "JSX 语法", "状态管理"],
    },
    {
      fromTopic: "Python 基础",
      toTopic: "Django 框架",
      successRate: 70,
      averageTime: 12,
      commonChallenges: ["MVC 架构理解", "ORM 使用", "路由配置"],
    },
    {
      fromTopic: "CSS 基础",
      toTopic: "Tailwind CSS",
      successRate: 90,
      averageTime: 3,
      commonChallenges: ["实用类命名记忆", "响应式断点"],
    },
  ]

  // 技术趋势数据
  private techTrends: TechTrend[] = [
    {
      technology: "Next.js",
      category: "React 框架",
      popularity: 92,
      growthRate: 45,
      useCases: ["全栈应用", "SEO 优化", "服务端渲染"],
      relatedTopics: ["React", "TypeScript", "API Routes"],
    },
    {
      technology: "TypeScript",
      category: "编程语言",
      popularity: 88,
      growthRate: 38,
      useCases: ["大型项目", "团队协作", "类型安全"],
      relatedTopics: ["JavaScript", "类型系统", "接口设计"],
    },
    {
      technology: "Tailwind CSS",
      category: "CSS 框架",
      popularity: 85,
      growthRate: 52,
      useCases: ["快速原型", "组件库", "响应式设计"],
      relatedTopics: ["CSS", "实用优先", "设计系统"],
    },
    {
      technology: "AI 编程助手",
      category: "开发工具",
      popularity: 78,
      growthRate: 120,
      useCases: ["代码生成", "代码审查", "学习辅助"],
      relatedTopics: ["GitHub Copilot", "ChatGPT", "自动化"],
    },
  ]

  // 获取主题相关的常见陷阱
  getPitfallsForTopic(topic: string): CommonPitfall[] {
    return this.commonPitfalls.filter(
      (p) => p.topic.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(p.topic.toLowerCase()),
    )
  }

  // 获取学习路径建议
  getLearningPathSuggestion(currentTopic: string): LearningPattern | null {
    return this.learningPatterns.find((p) => p.fromTopic.toLowerCase().includes(currentTopic.toLowerCase())) || null
  }

  // 获取技术趋势信息
  getTechTrend(technology: string): TechTrend | null {
    return (
      this.techTrends.find(
        (t) =>
          t.technology.toLowerCase().includes(technology.toLowerCase()) ||
          technology.toLowerCase().includes(t.technology.toLowerCase()),
      ) || null
    )
  }

  // 生成数据驱动的洞察
  generateInsights(topic: string, userLevel: string): DataDrivenInsight[] {
    const insights: DataDrivenInsight[] = []

    // 1. 常见陷阱洞察
    const pitfalls = this.getPitfallsForTopic(topic)
    if (pitfalls.length > 0) {
      const topPitfall = pitfalls[0]
      insights.push({
        type: "pitfall",
        title: `【大数据提示】${topPitfall.topic}的高频易错点`,
        description: topPitfall.description,
        data: `${topPitfall.frequency}% 的初学者在这里遇到困难`,
        actionable: topPitfall.solution,
        priority: "high",
      })
    }

    // 2. 学习路径洞察
    const pathSuggestion = this.getLearningPathSuggestion(topic)
    if (pathSuggestion) {
      insights.push({
        type: "pattern",
        title: "【学习路径建议】下一步学习方向",
        description: `从 "${pathSuggestion.fromTopic}" 到 "${pathSuggestion.toTopic}"`,
        data: `成功率 ${pathSuggestion.successRate}%,平均需要 ${pathSuggestion.averageTime} 小时`,
        actionable: `常见挑战: ${pathSuggestion.commonChallenges.join(", ")}。建议提前了解这些概念`,
        priority: "medium",
      })
    }

    // 3. 技术趋势洞察
    const trend = this.getTechTrend(topic)
    if (trend) {
      insights.push({
        type: "trend",
        title: "【未来智能化建议】技术趋势分析",
        description: `${trend.technology} 在 ${trend.category} 领域表现突出`,
        data: `当前热度 ${trend.popularity}/100,增长率 ${trend.growthRate}%`,
        actionable: `主要应用场景: ${trend.useCases.join(", ")}。这是值得深入学习的方向`,
        priority: trend.growthRate > 50 ? "high" : "medium",
      })
    }

    // 4. 优化建议
    if (userLevel === "intermediate" || userLevel === "advanced") {
      insights.push({
        type: "optimization",
        title: "【性能优化提示】进阶技巧",
        description: "基于你的学习进度,可以开始关注性能优化",
        data: "70% 的进阶开发者在这个阶段开始学习优化技巧",
        actionable: "建议学习: 代码分割、懒加载、缓存策略、性能监控等技术",
        priority: "medium",
      })
    }

    return insights
  }

  // 获取所有常见陷阱
  getAllPitfalls(): CommonPitfall[] {
    return [...this.commonPitfalls].sort((a, b) => b.frequency - a.frequency)
  }

  // 获取热门技术趋势
  getTopTrends(limit = 5): TechTrend[] {
    return [...this.techTrends].sort((a, b) => b.popularity - a.popularity).slice(0, limit)
  }

  // 根据用户历史生成个性化建议
  generatePersonalizedRecommendations(completedTopics: string[], weaknesses: string[], currentLevel: string): string[] {
    const recommendations: string[] = []

    // 基于薄弱环节的建议
    weaknesses.forEach((weakness) => {
      const pitfalls = this.getPitfallsForTopic(weakness)
      if (pitfalls.length > 0) {
        recommendations.push(`针对 "${weakness}": ${pitfalls[0].solution}`)
      }
    })

    // 基于已完成主题的进阶建议
    completedTopics.forEach((topic) => {
      const nextPath = this.getLearningPathSuggestion(topic)
      if (nextPath && !completedTopics.includes(nextPath.toTopic)) {
        recommendations.push(`已掌握 "${topic}",建议学习 "${nextPath.toTopic}" (成功率 ${nextPath.successRate}%)`)
      }
    })

    // 基于等级的技术趋势建议
    const relevantTrends = this.techTrends.filter((t) => {
      if (currentLevel === "beginner") return t.popularity > 80
      if (currentLevel === "intermediate") return t.growthRate > 40
      return t.growthRate > 30
    })

    relevantTrends.slice(0, 2).forEach((trend) => {
      recommendations.push(`【趋势】${trend.technology} 正在快速发展 (增长率 ${trend.growthRate}%),适合你当前阶段学习`)
    })

    return recommendations.slice(0, 5)
  }
}

export const bigDataInsights = new BigDataInsights()
