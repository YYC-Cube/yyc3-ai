// 工作流系统
export interface WorkflowStep {
  id: string
  type: "prompt" | "transform" | "api" | "condition"
  name: string
  config: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  createdAt: string
  updatedAt: string
}

export interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  enabled: boolean
  installed: boolean
  category: "productivity" | "integration" | "ai" | "utility"
  config?: Record<string, any>
}

export const availablePlugins: Plugin[] = [
  {
    id: "web-search",
    name: "网页搜索",
    description: "允许 AI 搜索互联网获取实时信息",
    version: "1.0.0",
    author: "AI Assistant Team",
    enabled: false,
    installed: false,
    category: "integration",
  },
  {
    id: "code-interpreter",
    name: "代码解释器",
    description: "执行 Python 代码并返回结果",
    version: "1.2.0",
    author: "AI Assistant Team",
    enabled: false,
    installed: false,
    category: "ai",
  },
  {
    id: "image-generation",
    name: "图像生成",
    description: "使用 DALL-E 或 Stable Diffusion 生成图像",
    version: "1.1.0",
    author: "AI Assistant Team",
    enabled: false,
    installed: false,
    category: "ai",
  },
  {
    id: "document-analyzer",
    name: "文档分析",
    description: "分析和提取 PDF、Word 等文档内容",
    version: "1.0.0",
    author: "AI Assistant Team",
    enabled: false,
    installed: false,
    category: "productivity",
  },
  {
    id: "voice-input",
    name: "语音输入",
    description: "支持语音转文字输入",
    version: "1.0.0",
    author: "AI Assistant Team",
    enabled: false,
    installed: false,
    category: "utility",
  },
]

// 执行工作流
export async function executeWorkflow(workflow: Workflow, input: string): Promise<string> {
  let result = input

  for (const step of workflow.steps) {
    // 模拟步骤执行
    await new Promise((resolve) => setTimeout(resolve, 500))
    result = `[${step.name}] ${result}`
  }

  return result
}
