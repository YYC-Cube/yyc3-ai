// 国际化配置与翻译管理
export type Locale = "zh-CN" | "en"

export const defaultLocale: Locale = "zh-CN"

export const translations = {
  "zh-CN": {
    // 通用
    common: {
      new: "新建",
      edit: "编辑",
      delete: "删除",
      save: "保存",
      cancel: "取消",
      confirm: "确认",
      search: "搜索",
      settings: "设置",
      close: "关闭",
      loading: "加载中...",
      success: "成功",
      error: "错误",
      warning: "警告",
    },

    // 侧边栏
    sidebar: {
      aiAssistant: "AI 助手",
      newChat: "新建对话",
      pinned: "已固定",
      recent: "最近对话",
      folders: "文件夹",
      templates: "模板",
      searchPlaceholder: "搜索对话...",
      createFolder: "创建文件夹",
      folderName: "文件夹名称",
      noConversations: "暂无对话",
    },

    // 聊天界面
    chat: {
      newChat: "新建对话",
      typeMessage: "输入消息...",
      send: "发送",
      thinking: "思考中...",
      pause: "暂停",
      regenerate: "重新生成",
      copy: "复制",
      edit: "编辑",
      delete: "删除",
      pin: "固定",
      unpin: "取消固定",
      emptyState: "开始新对话",
      emptyStateDesc: "向 AI 助手提问任何问题",
    },

    // 模板
    templates: {
      title: "模板",
      create: "创建模板",
      use: "使用模板",
      name: "模板名称",
      content: "模板内容",
      category: "分类",
      noTemplates: "暂无模板",
    },

    // 设置
    settings: {
      title: "设置",
      general: "通用设置",
      language: "语言",
      theme: "主题",
      light: "浅色",
      dark: "深色",
      system: "跟随系统",

      // OpenAI 配置
      openai: "OpenAI 配置",
      apiKey: "API 密钥",
      apiKeyPlaceholder: "输入您的 OpenAI API 密钥",
      model: "模型",
      temperature: "温度",
      maxTokens: "最大令牌数",
      testConnection: "测试连接",
      connectionSuccess: "连接成功",
      connectionFailed: "连接失败",

      // 模型管理
      modelManagement: "模型管理",
      availableModels: "可用模型",
      customModels: "自定义模型",
      addModel: "添加模型",
      modelName: "模型名称",
      modelEndpoint: "模型端点",
      downloadModel: "下载模型",
      trainModel: "训练模型",

      // 工作流
      workflows: "工作流",
      plugins: "插件",
      enabledPlugins: "已启用插件",
      availablePlugins: "可用插件",
      installPlugin: "安装插件",
      pluginSettings: "插件设置",
    },

    // 模型管理
    models: {
      title: "模型管理",
      local: "本地模型",
      remote: "远程模型",
      download: "下载",
      downloading: "下载中...",
      downloaded: "已下载",
      train: "训练",
      training: "训练中...",
      trained: "已训练",
      delete: "删除",
      size: "大小",
      status: "状态",
      lastUsed: "最后使用",
    },

    // 工作流
    workflows: {
      title: "工作流",
      create: "创建工作流",
      name: "工作流名称",
      description: "描述",
      steps: "步骤",
      addStep: "添加步骤",
      run: "运行",
      running: "运行中...",
      completed: "已完成",
      failed: "失败",
    },

    // 插件
    plugins: {
      title: "插件管理",
      installed: "已安装",
      available: "可用插件",
      install: "安装",
      uninstall: "卸载",
      enable: "启用",
      disable: "禁用",
      configure: "配置",
      version: "版本",
      author: "作者",
      description: "描述",
    },

    // 学习功能
    learning: {
      // 学习进度
      progress: {
        title: "学习进度总览",
        currentLevel: "当前等级",
        topicsLearned: "已学主题",
        averageMastery: "平均掌握度",
        studyTime: "学习时长",
        strengths: "擅长领域",
        weaknesses: "需要加强",
        nextSteps: "下一步建议",
        viewDetails: "查看详情",
        hideDetails: "收起详情",
        totalErrors: "总错误数",
        totalQuestions: "总提问数",
        beginner: "初学者",
        intermediate: "进阶学习者",
        advanced: "高级开发者",
      },

      // 智能洞察
      insights: {
        title: "智能洞察",
        personalizedRecommendations: "个性化学习建议",
        techTrends: "热门技术趋势",
        dataSupport: "数据支撑",
        actionable: "可执行建议",
        pitfall: "高频易错点",
        pattern: "学习路径建议",
        trend: "技术趋势分析",
        optimization: "性能优化提示",
      },

      // 情感反馈
      emotional: {
        frustrated: "遇到困难",
        confused: "有点困惑",
        confident: "信心满满",
        curious: "充满好奇",
        excited: "兴奋激动",
        tired: "需要休息",
        neutral: "状态正常",
        yourProgress: "你的进步数据",
        viewDetails: "查看详情",
        hideDetails: "收起",
        moreProgress: "还有更多进步数据",
      },

      // 学习路径
      path: {
        title: "学习路径规划",
        myPaths: "我的学习路径",
        exploreGoals: "探索目标",
        noActivePaths: "还没有开始学习路径",
        noActivePathsDesc: "选择一个学习目标,开始你的学习之旅",
        exploreGoalsBtn: "探索学习目标",
        milestones: "里程碑",
        estimatedCompletion: "预计完成",
        completionRate: "完成度",
        nextActions: "下一步行动",
        complete: "完成",
        start: "开始学习",
        learningRoute: "学习路线",
        about: "约",
        hours: "小时",
      },
    },

    // 工作台
    workspace: {
      title: "工作台",
      chat: "AI 对话",
      codeWorkspace: "代码工作台",
      smartCoding: "智能编程",
      projects: "项目管理",
      codeReview: "代码审查",
      performance: "性能监控",
      layoutCode: "代码开发",
      layoutLearning: "AI 学习",
      layoutFull: "全功能工作台",
      selectLayout: "选择工作区布局",
      selectProject: "选择项目",
      createProject: "创建项目",
      openProject: "打开项目",
    },

    // 项目管理
    project: {
      title: "项目管理",
      name: "项目名称",
      type: "项目类型",
      description: "项目描述",
      files: "文件",
      created: "创建时间",
      updated: "更新时间",
      open: "打开",
      export: "导出",
      import: "导入",
      delete: "删除",
      noProjects: "还没有项目",
      createFirst: "创建你的第一个项目开始编程",
      searchProjects: "搜索项目...",
      allTypes: "全部类型",
      enterProjectName: "输入项目名称",
    },

    // 代码审查
    codeReview: {
      title: "AI 代码审查",
      score: "代码质量评分",
      issues: "问题",
      suggestions: "建议",
      summary: "总结",
      metrics: "代码指标",
      linesOfCode: "代码行数",
      complexity: "圈复杂度",
      maintainability: "可维护性",
      testCoverage: "测试覆盖率",
      reviewing: "审查中...",
      reReview: "重新审查",
      noIssues: "未发现问题",
      noSuggestions: "暂无改进建议",
      applySuggestion: "应用建议",
      excellent: "优秀",
      good: "良好",
      fair: "及格",
      needsImprovement: "需要改进",
      critical: "严重",
      high: "高",
      medium: "中",
      low: "低",
      info: "信息",
      security: "安全",
      performance: "性能",
      maintainability: "可维护性",
      style: "代码风格",
      bestPractice: "最佳实践",
    },

    // 性能监控
    performance: {
      title: "性能监控",
      monitoring: "监控中",
      startMonitoring: "开始监控",
      stopMonitoring: "停止监控",
      score: "性能评分",
      fps: "FPS",
      memory: "内存使用",
      network: "网络请求",
      domNodes: "DOM 节点",
      charts: "图表",
      suggestions: "优化建议",
      details: "详细信息",
      fpsTrend: "FPS 趋势",
      memoryTrend: "内存使用趋势",
      noSuggestions: "性能良好,暂无优化建议",
      memoryDetails: "内存详情",
      networkDetails: "网络详情",
      javascriptDetails: "JavaScript 详情",
      used: "已使用",
      total: "总计",
      limit: "限制",
      requests: "请求数",
      totalSize: "总大小",
      averageTime: "平均时间",
      slowRequests: "慢请求",
      executionTime: "执行时间",
      longTasks: "长任务",
      notStarted: "性能监控未启动",
      clickToStart: "点击开始监控按钮开始收集性能数据",
    },

    // 智能编程
    smartCoding: {
      title: "AI 智能编程工作台",
      preview: "预览",
      suggestions: "建议",
      learning: "学习",
      errors: "错误",
      warnings: "警告",
      runAndLearn: "运行并学习",
      analyzing: "分析中...",
      noSuggestions: "暂无建议",
      continueCoding: "继续编写代码以获取 AI 建议",
      learningOpportunities: "学习机会",
      learningProgress: "学习进度",
      totalNodes: "总学习节点",
      averageMastery: "平均掌握度",
      errorCount: "错误次数",
      startCoding: "开始编写代码",
      aiWillAnalyze: "AI 将分析你的代码并提供学习建议",
      beginner: "初级",
      intermediate: "中级",
      advanced: "高级",
    },
  },

  en: {
    // Common
    common: {
      new: "New",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      search: "Search",
      settings: "Settings",
      close: "Close",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      warning: "Warning",
    },

    // Sidebar
    sidebar: {
      aiAssistant: "AI Assistant",
      newChat: "New Chat",
      pinned: "Pinned",
      recent: "Recent",
      folders: "Folders",
      templates: "Templates",
      searchPlaceholder: "Search conversations...",
      createFolder: "Create Folder",
      folderName: "Folder Name",
      noConversations: "No conversations",
    },

    // Chat
    chat: {
      newChat: "New Chat",
      typeMessage: "Type a message...",
      send: "Send",
      thinking: "Thinking...",
      pause: "Pause",
      regenerate: "Regenerate",
      copy: "Copy",
      edit: "Edit",
      delete: "Delete",
      pin: "Pin",
      unpin: "Unpin",
      emptyState: "Start a new conversation",
      emptyStateDesc: "Ask the AI assistant anything",
    },

    // Templates
    templates: {
      title: "Templates",
      create: "Create Template",
      use: "Use Template",
      name: "Template Name",
      content: "Template Content",
      category: "Category",
      noTemplates: "No templates",
    },

    // Settings
    settings: {
      title: "Settings",
      general: "General",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",

      // OpenAI Config
      openai: "OpenAI Configuration",
      apiKey: "API Key",
      apiKeyPlaceholder: "Enter your OpenAI API key",
      model: "Model",
      temperature: "Temperature",
      maxTokens: "Max Tokens",
      testConnection: "Test Connection",
      connectionSuccess: "Connection successful",
      connectionFailed: "Connection failed",

      // Model Management
      modelManagement: "Model Management",
      availableModels: "Available Models",
      customModels: "Custom Models",
      addModel: "Add Model",
      modelName: "Model Name",
      modelEndpoint: "Model Endpoint",
      downloadModel: "Download Model",
      trainModel: "Train Model",

      // Workflows
      workflows: "Workflows",
      plugins: "Plugins",
      enabledPlugins: "Enabled Plugins",
      availablePlugins: "Available Plugins",
      installPlugin: "Install Plugin",
      pluginSettings: "Plugin Settings",
    },

    // Models
    models: {
      title: "Model Management",
      local: "Local Models",
      remote: "Remote Models",
      download: "Download",
      downloading: "Downloading...",
      downloaded: "Downloaded",
      train: "Train",
      training: "Training...",
      trained: "Trained",
      delete: "Delete",
      size: "Size",
      status: "Status",
      lastUsed: "Last Used",
    },

    // Workflows
    workflows: {
      title: "Workflows",
      create: "Create Workflow",
      name: "Workflow Name",
      description: "Description",
      steps: "Steps",
      addStep: "Add Step",
      run: "Run",
      running: "Running...",
      completed: "Completed",
      failed: "Failed",
    },

    // Plugins
    plugins: {
      title: "Plugin Management",
      installed: "Installed",
      available: "Available Plugins",
      install: "Install",
      uninstall: "Uninstall",
      enable: "Enable",
      disable: "Disable",
      configure: "Configure",
      version: "Version",
      author: "Author",
      description: "Description",
    },

    // Learning Feature
    learning: {
      // Learning Progress
      progress: {
        title: "Learning Progress Overview",
        currentLevel: "Current Level",
        topicsLearned: "Topics Learned",
        averageMastery: "Average Mastery",
        studyTime: "Study Time",
        strengths: "Strengths",
        weaknesses: "Needs Improvement",
        nextSteps: "Next Steps",
        viewDetails: "View Details",
        hideDetails: "Hide Details",
        totalErrors: "Total Errors",
        totalQuestions: "Total Questions",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
      },

      // Smart Insights
      insights: {
        title: "Smart Insights",
        personalizedRecommendations: "Personalized Recommendations",
        techTrends: "Tech Trends",
        dataSupport: "Data Support",
        actionable: "Actionable Advice",
        pitfall: "Common Pitfall",
        pattern: "Learning Path Suggestion",
        trend: "Tech Trend Analysis",
        optimization: "Optimization Tips",
      },

      // Emotional Feedback
      emotional: {
        frustrated: "Frustrated",
        confused: "Confused",
        confident: "Confident",
        curious: "Curious",
        excited: "Excited",
        tired: "Tired",
        neutral: "Neutral",
        yourProgress: "Your Progress",
        viewDetails: "View Details",
        hideDetails: "Hide",
        moreProgress: "More progress data",
      },

      // Learning Path
      path: {
        title: "Learning Path Planner",
        myPaths: "My Learning Paths",
        exploreGoals: "Explore Goals",
        noActivePaths: "No active learning paths",
        noActivePathsDesc: "Choose a learning goal to start your journey",
        exploreGoalsBtn: "Explore Learning Goals",
        milestones: "Milestones",
        estimatedCompletion: "Est. Completion",
        completionRate: "Completion",
        nextActions: "Next Actions",
        complete: "Complete",
        start: "Start Learning",
        learningRoute: "Learning Route",
        about: "About",
        hours: "hours",
      },
    },

    // Workspace
    workspace: {
      title: "Workspace",
      chat: "AI Chat",
      codeWorkspace: "Code Workspace",
      smartCoding: "Smart Coding",
      projects: "Projects",
      codeReview: "Code Review",
      performance: "Performance",
      layoutCode: "Code Development",
      layoutLearning: "AI Learning",
      layoutFull: "Full Workspace",
      selectLayout: "Select Workspace Layout",
      selectProject: "Select Project",
      createProject: "Create Project",
      openProject: "Open Project",
    },

    // Project Management
    project: {
      title: "Project Management",
      name: "Project Name",
      type: "Project Type",
      description: "Description",
      files: "Files",
      created: "Created",
      updated: "Updated",
      open: "Open",
      export: "Export",
      import: "Import",
      delete: "Delete",
      noProjects: "No projects yet",
      createFirst: "Create your first project to start coding",
      searchProjects: "Search projects...",
      allTypes: "All Types",
      enterProjectName: "Enter project name",
    },

    // Code Review
    codeReview: {
      title: "AI Code Review",
      score: "Code Quality Score",
      issues: "Issues",
      suggestions: "Suggestions",
      summary: "Summary",
      metrics: "Code Metrics",
      linesOfCode: "Lines of Code",
      complexity: "Complexity",
      maintainability: "Maintainability",
      testCoverage: "Test Coverage",
      reviewing: "Reviewing...",
      reReview: "Re-review",
      noIssues: "No issues found",
      noSuggestions: "No suggestions",
      applySuggestion: "Apply Suggestion",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needsImprovement: "Needs Improvement",
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info",
      security: "Security",
      performance: "Performance",
      maintainability: "Maintainability",
      style: "Style",
      bestPractice: "Best Practice",
    },

    // Performance Monitoring
    performance: {
      title: "Performance Monitor",
      monitoring: "Monitoring",
      startMonitoring: "Start Monitoring",
      stopMonitoring: "Stop Monitoring",
      score: "Performance Score",
      fps: "FPS",
      memory: "Memory Usage",
      network: "Network Requests",
      domNodes: "DOM Nodes",
      charts: "Charts",
      suggestions: "Optimization Suggestions",
      details: "Details",
      fpsTrend: "FPS Trend",
      memoryTrend: "Memory Usage Trend",
      noSuggestions: "Performance is good, no suggestions",
      memoryDetails: "Memory Details",
      networkDetails: "Network Details",
      javascriptDetails: "JavaScript Details",
      used: "Used",
      total: "Total",
      limit: "Limit",
      requests: "Requests",
      totalSize: "Total Size",
      averageTime: "Average Time",
      slowRequests: "Slow Requests",
      executionTime: "Execution Time",
      longTasks: "Long Tasks",
      notStarted: "Performance monitoring not started",
      clickToStart: "Click Start Monitoring to begin collecting performance data",
    },

    // Smart Coding
    smartCoding: {
      title: "AI Smart Coding Workspace",
      preview: "Preview",
      suggestions: "Suggestions",
      learning: "Learning",
      errors: "Errors",
      warnings: "Warnings",
      runAndLearn: "Run & Learn",
      analyzing: "Analyzing...",
      noSuggestions: "No suggestions",
      continueCoding: "Continue coding to get AI suggestions",
      learningOpportunities: "Learning Opportunities",
      learningProgress: "Learning Progress",
      totalNodes: "Total Nodes",
      averageMastery: "Average Mastery",
      errorCount: "Error Count",
      startCoding: "Start coding",
      aiWillAnalyze: "AI will analyze your code and provide learning suggestions",
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
  },
}

// 获取翻译文本的辅助函数
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".")
  let value: any = translations[locale]

  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === "string" ? value : key
}

// React Hook 用于翻译
export function useTranslation(locale: Locale) {
  return {
    t: (key: string) => getTranslation(locale, key),
    locale,
  }
}
