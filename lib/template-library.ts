// 技术栈框架模板库系统
export type TemplateCategory = "frontend" | "backend" | "fullstack" | "mobile" | "desktop" | "library"
export type TemplateComplexity = "beginner" | "intermediate" | "advanced"
export type UILibrary = "tailwind" | "shadcn" | "antd" | "mui" | "chakra" | "bootstrap" | "element" | "naive"

export interface TemplateTechnology {
  frontend?: string[]
  backend?: string[]
  database?: string[]
  uiLibrary?: UILibrary[]
}

export interface TemplateFeature {
  id: string
  name: string
  description: string
  required: boolean
}

export interface TemplateDependency {
  name: string
  version: string
  dev?: boolean
}

export interface UILibraryConfig {
  id: UILibrary
  name: string
  description: string
  category: "css" | "component" | "full"
  framework: ("react" | "vue" | "html")[]
  features: string[]
  installCommand: string
  setupSteps: string[]
  documentation: string
  popularity: number
}

export interface FrameworkTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  complexity: TemplateComplexity
  technology: TemplateTechnology
  features: TemplateFeature[]
  dependencies: TemplateDependency[]
  setupCommands: string[]
  bestPractices: string[]
  rating: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface TemplateCustomization {
  selectedFeatures: string[]
  projectName: string
  uiLibrary?: UILibrary
}

class TemplateLibraryManager {
  private templates: FrameworkTemplate[] = []
  private uiLibraries: UILibraryConfig[] = []

  constructor() {
    this.initializeTemplates()
    this.initializeUILibraries()
  }

  private initializeUILibraries() {
    this.uiLibraries = [
      {
        id: "tailwind",
        name: "Tailwind CSS",
        description: "实用优先的 CSS 框架,快速构建现代化界面",
        category: "css",
        framework: ["react", "vue", "html"],
        features: ["响应式设计", "深色模式", "自定义主题", "JIT 编译"],
        installCommand: "npm install -D tailwindcss postcss autoprefixer",
        setupSteps: ["npx tailwindcss init -p", "配置 tailwind.config.js", "在 CSS 中添加 @tailwind 指令"],
        documentation: "https://tailwindcss.com",
        popularity: 95,
      },
      {
        id: "shadcn",
        name: "shadcn/ui",
        description: "基于 Radix UI 的可复用组件集合",
        category: "component",
        framework: ["react"],
        features: ["无依赖", "可定制", "可访问性", "TypeScript 支持"],
        installCommand: "npx shadcn@latest init",
        setupSteps: ["初始化配置", "选择样式", "添加所需组件"],
        documentation: "https://ui.shadcn.com",
        popularity: 90,
      },
      {
        id: "antd",
        name: "Ant Design",
        description: "企业级 UI 设计语言和 React 组件库",
        category: "full",
        framework: ["react"],
        features: ["丰富组件", "国际化", "主题定制", "TypeScript"],
        installCommand: "npm install antd",
        setupSteps: ["导入样式", "配置主题", "使用组件"],
        documentation: "https://ant.design",
        popularity: 88,
      },
      {
        id: "mui",
        name: "Material-UI",
        description: "React 的 Material Design 组件库",
        category: "full",
        framework: ["react"],
        features: ["Material Design", "主题系统", "响应式", "可访问性"],
        installCommand: "npm install @mui/material @emotion/react @emotion/styled",
        setupSteps: ["配置主题", "导入组件", "自定义样式"],
        documentation: "https://mui.com",
        popularity: 85,
      },
      {
        id: "element",
        name: "Element Plus",
        description: "基于 Vue 3 的组件库",
        category: "full",
        framework: ["vue"],
        features: ["Vue 3", "TypeScript", "主题定制", "国际化"],
        installCommand: "npm install element-plus",
        setupSteps: ["全局注册", "按需导入", "配置主题"],
        documentation: "https://element-plus.org",
        popularity: 82,
      },
      {
        id: "naive",
        name: "Naive UI",
        description: "Vue 3 的完整组件库",
        category: "full",
        framework: ["vue"],
        features: ["TypeScript", "主题编辑器", "深色模式", "树摇优化"],
        installCommand: "npm install naive-ui",
        setupSteps: ["配置主题", "导入组件", "使用图标"],
        documentation: "https://www.naiveui.com",
        popularity: 78,
      },
      {
        id: "chakra",
        name: "Chakra UI",
        description: "简单、模块化、可访问的 React 组件库",
        category: "full",
        framework: ["react"],
        features: ["可访问性", "深色模式", "响应式", "主题化"],
        installCommand: "npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion",
        setupSteps: ["配置 Provider", "设置主题", "使用组件"],
        documentation: "https://chakra-ui.com",
        popularity: 80,
      },
      {
        id: "bootstrap",
        name: "Bootstrap",
        description: "流行的 CSS 框架",
        category: "css",
        framework: ["react", "vue", "html"],
        features: ["响应式网格", "预制组件", "JavaScript 插件", "主题定制"],
        installCommand: "npm install bootstrap",
        setupSteps: ["导入 CSS", "导入 JS", "使用组件"],
        documentation: "https://getbootstrap.com",
        popularity: 75,
      },
    ]
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: "react-admin",
        name: "React 管理后台",
        description: "基于 React + TypeScript 的现代化管理后台模板",
        category: "frontend",
        complexity: "intermediate",
        technology: {
          frontend: ["React", "TypeScript", "React Router", "Redux Toolkit"],
          uiLibrary: ["tailwind", "shadcn", "antd"],
        },
        features: [
          { id: "auth", name: "用户认证", description: "登录、注册、权限管理", required: true },
          { id: "dashboard", name: "数据看板", description: "图表、统计数据展示", required: true },
          { id: "crud", name: "CRUD 操作", description: "增删改查功能", required: true },
          { id: "table", name: "数据表格", description: "分页、排序、筛选", required: false },
          { id: "form", name: "表单管理", description: "表单验证、动态表单", required: false },
          { id: "i18n", name: "国际化", description: "多语言支持", required: false },
        ],
        dependencies: [
          { name: "react", version: "^18.2.0" },
          { name: "typescript", version: "^5.0.0", dev: true },
          { name: "react-router-dom", version: "^6.20.0" },
          { name: "@reduxjs/toolkit", version: "^2.0.0" },
          { name: "axios", version: "^1.6.0" },
          { name: "recharts", version: "^2.10.0" },
        ],
        setupCommands: [
          "npm create vite@latest my-admin -- --template react-ts",
          "cd my-admin",
          "npm install",
          "npm install react-router-dom @reduxjs/toolkit axios",
        ],
        bestPractices: [
          "使用 TypeScript 提供类型安全",
          "采用 Redux Toolkit 管理全局状态",
          "实现路由懒加载优化性能",
          "使用 React Query 管理服务端状态",
          "遵循 Atomic Design 组件设计原则",
        ],
        rating: 4.8,
        usageCount: 156,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "vue3-dashboard",
        name: "Vue 3 数据看板",
        description: "基于 Vue 3 + TypeScript 的数据可视化看板",
        category: "frontend",
        complexity: "intermediate",
        technology: {
          frontend: ["Vue 3", "TypeScript", "Vue Router", "Pinia"],
          uiLibrary: ["element", "naive"],
        },
        features: [
          { id: "charts", name: "图表展示", description: "ECharts 数据可视化", required: true },
          { id: "realtime", name: "实时数据", description: "WebSocket 实时更新", required: false },
          { id: "export", name: "数据导出", description: "导出 Excel/PDF", required: false },
          { id: "filter", name: "数据筛选", description: "时间范围、条件筛选", required: true },
        ],
        dependencies: [
          { name: "vue", version: "^3.3.0" },
          { name: "typescript", version: "^5.0.0", dev: true },
          { name: "vue-router", version: "^4.2.0" },
          { name: "pinia", version: "^2.1.0" },
          { name: "echarts", version: "^5.4.0" },
        ],
        setupCommands: [
          "npm create vue@latest my-dashboard",
          "cd my-dashboard",
          "npm install",
          "npm install echarts vue-echarts",
        ],
        bestPractices: [
          "使用 Composition API 提高代码复用性",
          "采用 Pinia 管理应用状态",
          "实现图表组件的懒加载",
          "使用 TypeScript 增强类型检查",
        ],
        rating: 4.6,
        usageCount: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "nextjs-saas",
        name: "Next.js SaaS 应用",
        description: "全栈 SaaS 应用模板,包含认证、支付、多租户",
        category: "fullstack",
        complexity: "advanced",
        technology: {
          frontend: ["Next.js", "React", "TypeScript"],
          backend: ["Next.js API Routes", "Prisma"],
          database: ["PostgreSQL"],
          uiLibrary: ["tailwind", "shadcn"],
        },
        features: [
          { id: "auth", name: "身份认证", description: "NextAuth.js 认证系统", required: true },
          { id: "payment", name: "支付集成", description: "Stripe 支付", required: false },
          { id: "subscription", name: "订阅管理", description: "订阅计划、账单", required: false },
          { id: "tenant", name: "多租户", description: "组织、团队管理", required: false },
          { id: "email", name: "邮件服务", description: "邮件通知", required: false },
        ],
        dependencies: [
          { name: "next", version: "^14.0.0" },
          { name: "react", version: "^18.2.0" },
          { name: "typescript", version: "^5.0.0", dev: true },
          { name: "next-auth", version: "^4.24.0" },
          { name: "@prisma/client", version: "^5.7.0" },
          { name: "stripe", version: "^14.9.0" },
        ],
        setupCommands: [
          "npx create-next-app@latest my-saas --typescript --tailwind --app",
          "cd my-saas",
          "npm install next-auth @prisma/client stripe",
          "npx prisma init",
        ],
        bestPractices: [
          "使用 App Router 实现服务端渲染",
          "采用 Prisma ORM 管理数据库",
          "实现 API 路由的中间件认证",
          "使用 Server Components 优化性能",
          "实现完善的错误处理和日志记录",
        ],
        rating: 4.9,
        usageCount: 234,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "html-landing",
        name: "HTML 落地页",
        description: "纯 HTML/CSS/JS 的响应式落地页模板",
        category: "frontend",
        complexity: "beginner",
        technology: {
          frontend: ["HTML5", "CSS3", "JavaScript"],
          uiLibrary: ["tailwind", "bootstrap"],
        },
        features: [
          { id: "hero", name: "英雄区域", description: "吸引眼球的首屏", required: true },
          { id: "features", name: "特性展示", description: "产品特性介绍", required: true },
          { id: "pricing", name: "价格表", description: "定价方案", required: false },
          { id: "contact", name: "联系表单", description: "用户反馈表单", required: false },
        ],
        dependencies: [],
        setupCommands: ["mkdir my-landing", "cd my-landing", "touch index.html style.css script.js"],
        bestPractices: [
          "使用语义化 HTML 标签",
          "实现移动优先的响应式设计",
          "优化图片和资源加载",
          "添加 SEO 元标签",
          "确保跨浏览器兼容性",
        ],
        rating: 4.5,
        usageCount: 312,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }

  getAllTemplates(): FrameworkTemplate[] {
    return [...this.templates]
  }

  getTemplateById(id: string): FrameworkTemplate | undefined {
    return this.templates.find((t) => t.id === id)
  }

  searchTemplates(query: string): FrameworkTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.technology.frontend?.some((tech) => tech.toLowerCase().includes(lowerQuery)) ||
        t.technology.backend?.some((tech) => tech.toLowerCase().includes(lowerQuery)),
    )
  }

  filterByCategory(category: TemplateCategory): FrameworkTemplate[] {
    return this.templates.filter((t) => t.category === category)
  }

  filterByComplexity(complexity: TemplateComplexity): FrameworkTemplate[] {
    return this.templates.filter((t) => t.complexity === complexity)
  }

  incrementUsageCount(id: string): void {
    const template = this.templates.find((t) => t.id === id)
    if (template) {
      template.usageCount++
      template.updatedAt = new Date().toISOString()
    }
  }

  getAllUILibraries(): UILibraryConfig[] {
    return [...this.uiLibraries]
  }

  getUILibrariesByFramework(framework: "react" | "vue" | "html"): UILibraryConfig[] {
    return this.uiLibraries.filter((lib) => lib.framework.includes(framework))
  }

  getUILibraryById(id: UILibrary): UILibraryConfig | undefined {
    return this.uiLibraries.find((lib) => lib.id === id)
  }

  generateAIPrompt(template: FrameworkTemplate, customization: TemplateCustomization): string {
    const selectedFeatures = template.features.filter((f) => customization.selectedFeatures.includes(f.id))

    const uiLibInfo = customization.uiLibrary ? this.getUILibraryById(customization.uiLibrary) : null

    let prompt = `# 项目生成提示词\n\n`
    prompt += `## 项目信息\n`
    prompt += `- 项目名称: ${customization.projectName}\n`
    prompt += `- 模板: ${template.name}\n`
    prompt += `- 描述: ${template.description}\n`
    prompt += `- 复杂度: ${template.complexity}\n\n`

    prompt += `## 技术栈\n`
    if (template.technology.frontend) {
      prompt += `- 前端: ${template.technology.frontend.join(", ")}\n`
    }
    if (template.technology.backend) {
      prompt += `- 后端: ${template.technology.backend.join(", ")}\n`
    }
    if (template.technology.database) {
      prompt += `- 数据库: ${template.technology.database.join(", ")}\n`
    }
    if (uiLibInfo) {
      prompt += `- UI 库: ${uiLibInfo.name}\n`
    }
    prompt += `\n`

    prompt += `## 功能需求\n`
    selectedFeatures.forEach((feature, index) => {
      prompt += `${index + 1}. ${feature.name}: ${feature.description}\n`
    })
    prompt += `\n`

    prompt += `## 项目结构\n`
    prompt += `请创建一个完整的项目结构,包括:\n`
    prompt += `- 源代码目录\n`
    prompt += `- 配置文件\n`
    prompt += `- 必要的依赖\n`
    prompt += `- README 文档\n\n`

    prompt += `## 最佳实践\n`
    template.bestPractices.forEach((practice, index) => {
      prompt += `${index + 1}. ${practice}\n`
    })
    prompt += `\n`

    if (uiLibInfo) {
      prompt += `## UI 库配置\n`
      prompt += `请按照以下步骤配置 ${uiLibInfo.name}:\n`
      uiLibInfo.setupSteps.forEach((step, index) => {
        prompt += `${index + 1}. ${step}\n`
      })
      prompt += `\n`
    }

    prompt += `## 安装命令\n`
    prompt += `\`\`\`bash\n`
    template.setupCommands.forEach((cmd) => {
      prompt += `${cmd}\n`
    })
    if (uiLibInfo) {
      prompt += `${uiLibInfo.installCommand}\n`
    }
    prompt += `\`\`\`\n\n`

    prompt += `## 要求\n`
    prompt += `1. 生成完整可运行的代码\n`
    prompt += `2. 包含必要的注释和文档\n`
    prompt += `3. 遵循代码规范和最佳实践\n`
    prompt += `4. 实现所有选定的功能模块\n`
    prompt += `5. 确保代码的可维护性和可扩展性\n`

    return prompt
  }
}

export const templateLibraryManager = new TemplateLibraryManager()
