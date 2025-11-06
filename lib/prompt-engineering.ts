// 提示词工程管理系统 - 管理和优化AI提示词模板
export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: PromptCategory
  template: string
  variables: PromptVariable[]
  examples: PromptExample[]
  tags: string[]
  usageCount: number
  rating: number
  isCustom: boolean
  createdAt: number
  updatedAt: number
}

export interface PromptVariable {
  name: string
  description: string
  type: "text" | "number" | "select" | "multiline"
  required: boolean
  default?: string
  options?: string[]
}

export interface PromptExample {
  input: Record<string, string>
  output: string
  description: string
}

export type PromptCategory =
  | "code-generation"
  | "code-review"
  | "debugging"
  | "refactoring"
  | "documentation"
  | "testing"
  | "optimization"
  | "learning"
  | "general"

export interface PromptRecommendation {
  template: PromptTemplate
  relevance: number
  reason: string
}

class PromptEngineeringManager {
  private templates: Map<string, PromptTemplate> = new Map()
  private customTemplates: Map<string, PromptTemplate> = new Map()

  constructor() {
    this.initializePresetTemplates()
  }

  // 初始化预置模板
  private initializePresetTemplates() {
    const presetTemplates: PromptTemplate[] = [
      {
        id: "code-gen-function",
        name: "函数生成",
        description: "生成指定功能的函数代码",
        category: "code-generation",
        template: `请用 {{language}} 编写一个函数,实现以下功能:

功能描述: {{description}}

要求:
- 函数名: {{functionName}}
- 参数: {{parameters}}
- 返回值: {{returnType}}
- 添加必要的注释和错误处理
- 遵循最佳实践

请提供完整的函数实现。`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
          },
          { name: "description", description: "功能描述", type: "multiline", required: true },
          { name: "functionName", description: "函数名称", type: "text", required: true },
          { name: "parameters", description: "参数列表", type: "text", required: true },
          { name: "returnType", description: "返回值类型", type: "text", required: true },
        ],
        examples: [
          {
            input: {
              language: "JavaScript",
              description: "计算数组中所有数字的总和",
              functionName: "sumArray",
              parameters: "arr: number[]",
              returnType: "number",
            },
            output: "function sumArray(arr) { ... }",
            description: "生成数组求和函数",
          },
        ],
        tags: ["函数", "代码生成", "基础"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "code-review-security",
        name: "安全审查",
        description: "审查代码中的安全问题",
        category: "code-review",
        template: `请审查以下 {{language}} 代码的安全性:

\`\`\`{{language}}
{{code}}
\`\`\`

请重点检查:
1. SQL注入风险
2. XSS跨站脚本攻击
3. CSRF跨站请求伪造
4. 敏感信息泄露
5. 不安全的依赖
6. 权限控制问题

对每个发现的问题,请提供:
- 问题描述
- 风险等级
- 修复建议
- 示例代码`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java", "PHP"],
          },
          { name: "code", description: "待审查的代码", type: "multiline", required: true },
        ],
        examples: [],
        tags: ["安全", "代码审查", "漏洞"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "debug-error",
        name: "错误调试",
        description: "分析和修复代码错误",
        category: "debugging",
        template: `我的 {{language}} 代码出现了以下错误:

错误信息:
\`\`\`
{{errorMessage}}
\`\`\`

相关代码:
\`\`\`{{language}}
{{code}}
\`\`\`

上下文信息:
{{context}}

请帮我:
1. 分析错误原因
2. 定位问题代码
3. 提供修复方案
4. 给出修复后的完整代码
5. 建议如何避免类似问题`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
          },
          { name: "errorMessage", description: "错误信息", type: "multiline", required: true },
          { name: "code", description: "相关代码", type: "multiline", required: true },
          { name: "context", description: "上下文信息", type: "multiline", required: false },
        ],
        examples: [],
        tags: ["调试", "错误", "修复"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "refactor-optimize",
        name: "代码重构",
        description: "重构和优化现有代码",
        category: "refactoring",
        template: `请重构以下 {{language}} 代码:

\`\`\`{{language}}
{{code}}
\`\`\`

重构目标:
{{goals}}

请提供:
1. 重构后的代码
2. 改进说明
3. 性能对比
4. 可维护性提升
5. 最佳实践应用`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
          },
          { name: "code", description: "待重构的代码", type: "multiline", required: true },
          {
            name: "goals",
            description: "重构目标",
            type: "multiline",
            required: true,
            default: "提高可读性、性能和可维护性",
          },
        ],
        examples: [],
        tags: ["重构", "优化", "最佳实践"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "doc-generate",
        name: "文档生成",
        description: "为代码生成文档",
        category: "documentation",
        template: `请为以下 {{language}} 代码生成详细文档:

\`\`\`{{language}}
{{code}}
\`\`\`

文档要求:
- 函数/类的用途说明
- 参数说明(类型、含义、默认值)
- 返回值说明
- 使用示例
- 注意事项
- {{additionalRequirements}}

请使用 {{docStyle}} 风格的文档注释。`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
          },
          { name: "code", description: "待文档化的代码", type: "multiline", required: true },
          {
            name: "docStyle",
            description: "文档风格",
            type: "select",
            required: true,
            options: ["JSDoc", "TSDoc", "Docstring", "Javadoc"],
            default: "JSDoc",
          },
          { name: "additionalRequirements", description: "额外要求", type: "text", required: false },
        ],
        examples: [],
        tags: ["文档", "注释", "说明"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "test-generate",
        name: "测试用例生成",
        description: "生成单元测试代码",
        category: "testing",
        template: `请为以下 {{language}} 代码生成单元测试:

\`\`\`{{language}}
{{code}}
\`\`\`

测试框架: {{testFramework}}

请生成:
1. 正常情况测试
2. 边界条件测试
3. 异常情况测试
4. 性能测试(如需要)

测试覆盖率目标: {{coverage}}%`,
        variables: [
          {
            name: "language",
            description: "编程语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
          },
          { name: "code", description: "待测试的代码", type: "multiline", required: true },
          {
            name: "testFramework",
            description: "测试框架",
            type: "select",
            required: true,
            options: ["Jest", "Mocha", "Pytest", "JUnit"],
            default: "Jest",
          },
          { name: "coverage", description: "覆盖率目标", type: "number", required: false, default: "80" },
        ],
        examples: [],
        tags: ["测试", "单元测试", "TDD"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "learn-concept",
        name: "概念学习",
        description: "学习编程概念和技术",
        category: "learning",
        template: `请详细解释 {{concept}} 的概念:

学习者水平: {{level}}

请包含:
1. 基本定义和原理
2. 为什么需要它
3. 如何使用(带示例)
4. 常见误区
5. 最佳实践
6. 进阶学习资源

请用{{language}}语言举例说明。`,
        variables: [
          { name: "concept", description: "要学习的概念", type: "text", required: true },
          {
            name: "level",
            description: "学习者水平",
            type: "select",
            required: true,
            options: ["初学者", "中级", "高级"],
            default: "初学者",
          },
          {
            name: "language",
            description: "示例语言",
            type: "select",
            required: true,
            options: ["JavaScript", "TypeScript", "Python", "Java"],
            default: "JavaScript",
          },
        ],
        examples: [],
        tags: ["学习", "教程", "概念"],
        usageCount: 0,
        rating: 5,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]

    for (const template of presetTemplates) {
      this.templates.set(template.id, template)
    }
  }

  // 获取所有模板
  getAllTemplates(): PromptTemplate[] {
    return [...this.templates.values(), ...this.customTemplates.values()]
  }

  // 按分类获取模板
  getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category)
  }

  // 搜索模板
  searchTemplates(query: string): PromptTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTemplates().filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  // 获取单个模板
  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id) || this.customTemplates.get(id)
  }

  // 创建自定义模板
  createCustomTemplate(
    template: Omit<PromptTemplate, "id" | "usageCount" | "rating" | "isCustom" | "createdAt" | "updatedAt">,
  ): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      usageCount: 0,
      rating: 0,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    this.customTemplates.set(newTemplate.id, newTemplate)
    return newTemplate
  }

  // 更新模板
  updateTemplate(id: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const template = this.customTemplates.get(id)
    if (!template) return null

    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now(),
    }

    this.customTemplates.set(id, updated)
    return updated
  }

  // 删除自定义模板
  deleteTemplate(id: string): boolean {
    return this.customTemplates.delete(id)
  }

  // 填充模板
  fillTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId)
    if (!template) throw new Error("Template not found")

    let filled = template.template

    // 替换变量
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g")
      filled = filled.replace(regex, value)
    }

    // 增加使用次数
    template.usageCount++

    return filled
  }

  // 根据用户输入推荐模板
  recommendTemplates(
    userInput: string,
    context?: { language?: string; recentCategories?: PromptCategory[] },
  ): PromptRecommendation[] {
    const recommendations: PromptRecommendation[] = []
    const lowerInput = userInput.toLowerCase()

    for (const template of this.getAllTemplates()) {
      let relevance = 0
      const reasons: string[] = []

      // 关键词匹配
      if (template.name.toLowerCase().includes(lowerInput)) {
        relevance += 50
        reasons.push("名称匹配")
      }

      if (template.description.toLowerCase().includes(lowerInput)) {
        relevance += 30
        reasons.push("描述匹配")
      }

      for (const tag of template.tags) {
        if (lowerInput.includes(tag.toLowerCase())) {
          relevance += 20
          reasons.push(`标签匹配: ${tag}`)
        }
      }

      // 上下文匹配
      if (context?.language) {
        const hasLanguageVar = template.variables.some(
          (v) => v.name === "language" && v.options?.includes(context.language!),
        )
        if (hasLanguageVar) {
          relevance += 15
          reasons.push("支持当前语言")
        }
      }

      if (context?.recentCategories?.includes(template.category)) {
        relevance += 10
        reasons.push("最近使用的分类")
      }

      // 使用频率加成
      if (template.usageCount > 0) {
        relevance += Math.min(template.usageCount, 20)
        reasons.push("常用模板")
      }

      // 评分加成
      relevance += template.rating * 2

      if (relevance > 0) {
        recommendations.push({
          template,
          relevance,
          reason: reasons.join(", "),
        })
      }
    }

    // 按相关度排序
    recommendations.sort((a, b) => b.relevance - a.relevance)

    return recommendations.slice(0, 5)
  }

  // 评价模板
  rateTemplate(id: string, rating: number): boolean {
    const template = this.getTemplate(id)
    if (!template) return false

    template.rating = Math.max(0, Math.min(5, rating))
    template.updatedAt = Date.now()

    return true
  }

  // 导出模板
  exportTemplate(id: string): string {
    const template = this.getTemplate(id)
    if (!template) throw new Error("Template not found")

    return JSON.stringify(template, null, 2)
  }

  // 导入模板
  importTemplate(jsonString: string): PromptTemplate {
    const template = JSON.parse(jsonString) as PromptTemplate
    template.id = `imported-${Date.now()}`
    template.isCustom = true
    template.createdAt = Date.now()
    template.updatedAt = Date.now()

    this.customTemplates.set(template.id, template)
    return template
  }

  // 获取统计信息
  getStatistics() {
    const templates = this.getAllTemplates()
    const categories = new Map<PromptCategory, number>()

    for (const template of templates) {
      categories.set(template.category, (categories.get(template.category) || 0) + 1)
    }

    return {
      totalTemplates: templates.length,
      presetTemplates: this.templates.size,
      customTemplates: this.customTemplates.size,
      categoryCounts: Object.fromEntries(categories),
      totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
      averageRating: templates.reduce((sum, t) => sum + t.rating, 0) / templates.length,
    }
  }
}

export const promptEngineeringManager = new PromptEngineeringManager()
export default promptEngineeringManager
