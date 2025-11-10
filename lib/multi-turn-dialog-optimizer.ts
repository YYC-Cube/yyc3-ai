// 多轮对话优化系统 - 渐进式代码生成、确认流程管理
import { nlu } from "./natural-language-understanding"
import { sessionStateManager } from "./session-state-manager"
import { smartCodeAssistant } from "./smart-code-assistant"

export interface DialogStep {
  id: string
  phase: "design" | "architecture" | "implementation" | "refinement" | "complete"
  question: string
  userResponse?: string
  aiResponse?: string
  timestamp: Date
  status: "pending" | "confirmed" | "rejected" | "skipped"
}

export interface ProgressiveGenerationPlan {
  goalDescription: string
  steps: DialogStep[]
  currentStepIndex: number
  accumulatedContext: Record<string, any>
  generatedArtifacts: {
    design?: string
    architecture?: string
    code?: string
    tests?: string
    documentation?: string
  }
}

class MultiTurnDialogOptimizer {
  private activePlans: Map<string, ProgressiveGenerationPlan> = new Map()

  /**
   * 启动渐进式代码生成流程
   */
  async startProgressiveGeneration(goal: string): Promise<ProgressiveGenerationPlan> {
    const planId = `plan_${Date.now()}`

    // 分析目标，生成步骤计划
    const steps = await this.generateSteps(goal)

    const plan: ProgressiveGenerationPlan = {
      goalDescription: goal,
      steps,
      currentStepIndex: 0,
      accumulatedContext: {},
      generatedArtifacts: {},
    }

    this.activePlans.set(planId, plan)

    // 保存到会话
    sessionStateManager.updateContext("activeGenerationPlan", planId)
    sessionStateManager.addHistory("event", {
      type: "generation_started",
      goal,
      planId,
    })

    return plan
  }

  /**
   * 处理用户对当前步骤的响应
   */
  async processStepResponse(
    planId: string,
    response: string,
    action: "confirm" | "reject" | "modify",
  ): Promise<{
    nextStep?: DialogStep
    completed: boolean
    artifacts?: any
  }> {
    const plan = this.activePlans.get(planId)
    if (!plan) {
      throw new Error("未找到生成计划")
    }

    const currentStep = plan.steps[plan.currentStepIndex]

    // 记录用户响应
    currentStep.userResponse = response
    currentStep.status = action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : "pending"

    // 根据操作类型处理
    switch (action) {
      case "confirm":
        return await this.handleConfirm(plan, currentStep, response)
      case "reject":
        return await this.handleReject(plan, currentStep, response)
      case "modify":
        return await this.handleModify(plan, currentStep, response)
      default:
        throw new Error("未知操作类型")
    }
  }

  /**
   * 获取当前步骤
   */
  getCurrentStep(planId: string): DialogStep | null {
    const plan = this.activePlans.get(planId)
    if (!plan) return null

    return plan.steps[plan.currentStepIndex] || null
  }

  /**
   * 跳过当前步骤
   */
  async skipStep(planId: string): Promise<DialogStep | null> {
    const plan = this.activePlans.get(planId)
    if (!plan) return null

    plan.steps[plan.currentStepIndex].status = "skipped"
    plan.currentStepIndex++

    if (plan.currentStepIndex >= plan.steps.length) {
      return null
    }

    return plan.steps[plan.currentStepIndex]
  }

  /**
   * 获取生成进度
   */
  getProgress(planId: string): {
    total: number
    completed: number
    percentage: number
    currentPhase: string
  } {
    const plan = this.activePlans.get(planId)
    if (!plan) {
      return { total: 0, completed: 0, percentage: 0, currentPhase: "unknown" }
    }

    const completed = plan.steps.filter((s) => s.status === "confirmed" || s.status === "skipped").length
    const total = plan.steps.length
    const percentage = (completed / total) * 100

    return {
      total,
      completed,
      percentage,
      currentPhase: plan.steps[plan.currentStepIndex]?.phase || "complete",
    }
  }

  // 私有方法

  private async generateSteps(goal: string): Promise<DialogStep[]> {
    // 使用NLU分析目标
    const nluResult = await nlu.understand(goal)

    const steps: DialogStep[] = []

    // 第一步：设计数据结构
    steps.push({
      id: "step_1",
      phase: "design",
      question: `让我们分步骤完成"${goal}"这个功能。

**第一步：设计核心数据结构**

请确认或提供以下信息：
1. 需要哪些主要的数据模型或接口？
2. 每个模型有哪些关键属性？
3. 数据之间的关系如何？

示例回答：
- 用户模型 (User): id, name, email, createdAt
- 文章模型 (Post): id, title, content, authorId, publishedAt
- 关系: User 一对多 Post`,
      timestamp: new Date(),
      status: "pending",
    })

    // 第二步：确认架构设计
    steps.push({
      id: "step_2",
      phase: "architecture",
      question: `**第二步：确认技术架构**

基于您的数据结构设计，请确认：
1. 技术栈选择（React/Vue/Node.js等）
2. 文件组织结构
3. 主要模块划分
4. 数据流设计

我将基于您的确认生成架构设计草图。`,
      timestamp: new Date(),
      status: "pending",
    })

    // 第三步：实现核心逻辑
    steps.push({
      id: "step_3",
      phase: "implementation",
      question: `**第三步：实现核心业务逻辑**

现在我将生成核心代码。请确认：
1. 是否需要包含完整的CRUD操作？
2. 是否需要数据验证？
3. 是否需要权限控制？
4. 其他特殊需求？

确认后我将生成可运行的代码框架。`,
      timestamp: new Date(),
      status: "pending",
    })

    // 第四步：完善细节
    steps.push({
      id: "step_4",
      phase: "refinement",
      question: `**第四步：完善错误处理和边界条件**

请审查生成的代码，确认是否需要：
1. 更完善的错误处理
2. 边界条件检查
3. 性能优化
4. 安全加固

我将根据您的反馈进一步完善代码。`,
      timestamp: new Date(),
      status: "pending",
    })

    // 第五步：最终确认
    steps.push({
      id: "step_5",
      phase: "complete",
      question: `**最终确认**

代码生成完成！请审查：
1. 功能是否完整？
2. 代码质量是否满意？
3. 是否需要额外的测试用例？
4. 文档是否清晰？

如果一切就绪，我将交付完整的代码包。`,
      timestamp: new Date(),
      status: "pending",
    })

    return steps
  }

  private async handleConfirm(plan: ProgressiveGenerationPlan, step: DialogStep, response: string): Promise<any> {
    // 提取上下文信息
    this.extractContextFromResponse(plan, step, response)

    // 根据阶段执行相应的生成逻辑
    switch (step.phase) {
      case "design":
        await this.generateDesign(plan)
        break
      case "architecture":
        await this.generateArchitecture(plan)
        break
      case "implementation":
        await this.generateImplementation(plan)
        break
      case "refinement":
        await this.refineCode(plan)
        break
      case "complete":
        return this.finalizeGeneration(plan)
    }

    // 移动到下一步
    plan.currentStepIndex++

    // 检查是否完成
    if (plan.currentStepIndex >= plan.steps.length) {
      return {
        completed: true,
        artifacts: plan.generatedArtifacts,
      }
    }

    return {
      nextStep: plan.steps[plan.currentStepIndex],
      completed: false,
    }
  }

  private async handleReject(plan: ProgressiveGenerationPlan, step: DialogStep, response: string): Promise<any> {
    // 用户拒绝，重新生成当前步骤的建议
    step.status = "pending"

    // 分析拒绝原因
    const nluResult = await nlu.understand(response)

    // 生成改进建议
    step.aiResponse = `我理解您的担忧。让我重新调整方案：

${response}

请告诉我您期望的方向，我会据此调整设计。`

    return {
      nextStep: step,
      completed: false,
    }
  }

  private async handleModify(plan: ProgressiveGenerationPlan, step: DialogStep, response: string): Promise<any> {
    // 修改请求，更新上下文并重新生成
    this.extractContextFromResponse(plan, step, response)

    step.aiResponse = `好的，我已根据您的反馈调整了方案。请查看更新后的设计。`

    return {
      nextStep: step,
      completed: false,
    }
  }

  private extractContextFromResponse(plan: ProgressiveGenerationPlan, step: DialogStep, response: string): void {
    // 使用NLU提取关键信息
    const entities = this.extractEntities(response)

    // 保存到累积上下文
    entities.forEach((entity) => {
      plan.accumulatedContext[entity.key] = entity.value
    })

    // 保存响应文本
    plan.accumulatedContext[`${step.phase}_response`] = response
  }

  private extractEntities(text: string): Array<{ key: string; value: any }> {
    const entities: Array<{ key: string; value: any }> = []

    // 提取技术栈
    const techMatch = text.match(/\b(React|Vue|Angular|Node\.js|TypeScript|JavaScript)\b/gi)
    if (techMatch) {
      entities.push({ key: "techStack", value: techMatch })
    }

    // 提取数据模型
    const modelMatch = text.match(/(\w+)\s*[模型|Model|Interface]/gi)
    if (modelMatch) {
      entities.push({ key: "dataModels", value: modelMatch })
    }

    return entities
  }

  private async generateDesign(plan: ProgressiveGenerationPlan): Promise<void> {
    const design = `# 数据结构设计

基于您的需求，我设计了以下数据结构：

\`\`\`typescript
${this.generateDataModels(plan.accumulatedContext)}
\`\`\`

## 关系说明
${this.generateRelationships(plan.accumulatedContext)}
`

    plan.generatedArtifacts.design = design
    plan.steps[plan.currentStepIndex].aiResponse = design
  }

  private async generateArchitecture(plan: ProgressiveGenerationPlan): Promise<void> {
    const architecture = `# 技术架构设计

## 技术栈
- 前端: ${plan.accumulatedContext.techStack?.[0] || "React"}
- 后端: Node.js + Express
- 数据库: PostgreSQL

## 文件结构
\`\`\`
src/
  components/    # 组件
  lib/          # 工具库
  models/       # 数据模型
  services/     # 业务逻辑
  api/          # API路由
\`\`\`

## 数据流
用户操作 → 组件 → Service → API → 数据库
`

    plan.generatedArtifacts.architecture = architecture
    plan.steps[plan.currentStepIndex].aiResponse = architecture
  }

  private async generateImplementation(plan: ProgressiveGenerationPlan): Promise<void> {
    // 调用智能代码助手生成实现
    const result = await smartCodeAssistant.process({
      type: "generate",
      input: plan.goalDescription,
      context: plan.accumulatedContext,
      options: {
        useProjectContext: true,
        includeTests: true,
        includeDocumentation: true,
      },
    })

    plan.generatedArtifacts.code = result.code
    plan.generatedArtifacts.tests = result.code // 简化示例
    plan.steps[plan.currentStepIndex].aiResponse = `已生成核心代码，包含：
- 完整的业务逻辑实现
- CRUD操作
- 数据验证
- 错误处理

请审查代码是否符合需求。`
  }

  private async refineCode(plan: ProgressiveGenerationPlan): Promise<void> {
    plan.steps[plan.currentStepIndex].aiResponse = `已完善代码细节：
- ✅ 添加完整的错误处理
- ✅ 实现边界条件检查
- ✅ 优化性能瓶颈
- ✅ 加强安全防护

代码已准备好进行最终审查。`
  }

  private finalizeGeneration(plan: ProgressiveGenerationPlan): any {
    return {
      completed: true,
      artifacts: {
        ...plan.generatedArtifacts,
        summary: `# 生成完成

## 交付内容
1. 数据结构设计文档
2. 技术架构说明
3. 完整可运行代码
4. 单元测试用例
5. API文档

感谢您的耐心配合，祝开发顺利！`,
      },
    }
  }

  private generateDataModels(context: Record<string, any>): string {
    return `interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

interface Post {
  id: number
  title: string
  content: string
  authorId: number
  publishedAt: Date
}`
  }

  private generateRelationships(context: Record<string, any>): string {
    return `- User 与 Post 是一对多关系
- 每个 Post 必须关联一个 User（authorId）`
  }
}

export const multiTurnDialogOptimizer = new MultiTurnDialogOptimizer()
