// 防御性编程代码生成器 - 生成具备完整错误处理和边界检查的代码

import { unifiedAI } from "./unified-ai-service"

export interface DefensiveProgrammingRequest {
  functionality: string
  language: string
  defensiveRequirements: {
    inputValidation: string[]
    exceptionHandling: string[]
    resourceManagement: string[]
    failureRecovery: string[]
  }
  securityRequirements: string[]
}

export interface DefensiveProgrammingResult {
  code: string
  securityAnalysis: SecurityAnalysis
  errorHandlingCoverage: ErrorHandlingCoverage
  boundaryConditions: BoundaryCondition[]
  documentation: string
}

interface SecurityAnalysis {
  threats: string[]
  mitigations: string[]
  securityScore: number
}

interface ErrorHandlingCoverage {
  totalErrorScenarios: number
  handledScenarios: number
  coverage: number
  unhandledScenarios: string[]
}

interface BoundaryCondition {
  condition: string
  handling: string
  tested: boolean
}

export class DefensiveProgrammingGenerator {
  // 生成防御性代码
  async generate(request: DefensiveProgrammingRequest): Promise<DefensiveProgrammingResult> {
    console.log("[v0] 生成防御性编程代码...")

    // 第一步：生成基础功能代码
    const baseCode = await this.generateBaseCode(request)

    // 第二步：添加输入验证
    const validatedCode = await this.addInputValidation(baseCode, request)

    // 第三步：添加异常处理
    const exceptionHandledCode = await this.addExceptionHandling(validatedCode, request)

    // 第四步：添加资源管理
    const resourceManagedCode = await this.addResourceManagement(exceptionHandledCode, request)

    // 第五步：添加故障恢复
    const finalCode = await this.addFailureRecovery(resourceManagedCode, request)

    // 第六步：安全分析
    const securityAnalysis = await this.analyzeSecuri(finalCode, request)

    // 第七步：错误处理覆盖分析
    const errorHandlingCoverage = this.analyzeErrorHandling(finalCode, request)

    // 第八步：边界条件识别
    const boundaryConditions = this.identifyBoundaryConditions(finalCode, request)

    // 第九步：生成文档
    const documentation = this.generateDocumentation(finalCode, request, securityAnalysis, boundaryConditions)

    return {
      code: finalCode,
      securityAnalysis,
      errorHandlingCoverage,
      boundaryConditions,
      documentation,
    }
  }

  // 生成基础功能代码
  private async generateBaseCode(request: DefensiveProgrammingRequest): Promise<string> {
    const prompt = `生成${request.language}代码实现以下功能:

功能描述: ${request.functionality}

要求:
1. 代码结构清晰
2. 使用最佳实践
3. 遵循${request.language}编码规范
4. 函数职责单一

请生成代码:`

    return await unifiedAI.complete(prompt)
  }

  // 添加输入验证
  private async addInputValidation(code: string, request: DefensiveProgrammingRequest): Promise<string> {
    const validationRules = request.defensiveRequirements.inputValidation

    if (validationRules.length === 0) return code

    const prompt = `为以下代码添加完整的输入验证:

原始代码:
${code}

验证规则:
${validationRules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}

要求:
1. 在函数入口处验证所有输入参数
2. 检查参数类型、范围、格式
3. 对无效输入抛出清晰的错误信息
4. 使用类型守卫和断言
5. 添加JSDoc注释说明参数要求

请生成添加输入验证后的代码:`

    return await unifiedAI.complete(prompt)
  }

  // 添加异常处理
  private async addExceptionHandling(code: string, request: DefensiveProgrammingRequest): Promise<string> {
    const exceptionTypes = request.defensiveRequirements.exceptionHandling

    const prompt = `为以下代码添加完整的异常处理:

原始代码:
${code}

需要处理的异常类型:
${exceptionTypes.map((type, i) => `${i + 1}. ${type}`).join("\n")}

要求:
1. 使用try-catch包装可能失败的操作
2. 为不同类型的错误提供具体的处理逻辑
3. 记录错误日志包含上下文信息
4. 向用户返回友好的错误消息
5. 避免吞噬异常,确保错误可追踪
6. 在finally块中清理资源

请生成添加异常处理后的代码:`

    return await unifiedAI.complete(prompt)
  }

  // 添加资源管理
  private async addResourceManagement(code: string, request: DefensiveProgrammingRequest): Promise<string> {
    const resources = request.defensiveRequirements.resourceManagement

    if (resources.length === 0) return code

    const prompt = `为以下代码添加资源管理:

原始代码:
${code}

需要管理的资源:
${resources.map((res, i) => `${i + 1}. ${res}`).join("\n")}

要求:
1. 确保资源在使用后正确释放
2. 使用RAII模式或try-finally保证清理
3. 处理资源获取失败的情况
4. 避免资源泄漏
5. 实现资源池复用机制(如适用)

请生成添加资源管理后的代码:`

    return await unifiedAI.complete(prompt)
  }

  // 添加故障恢复
  private async addFailureRecovery(code: string, request: DefensiveProgrammingRequest): Promise<string> {
    const recoveryStrategies = request.defensiveRequirements.failureRecovery

    if (recoveryStrategies.length === 0) return code

    const prompt = `为以下代码添加故障恢复机制:

原始代码:
${code}

恢复策略:
${recoveryStrategies.map((strategy, i) => `${i + 1}. ${strategy}`).join("\n")}

要求:
1. 实现重试机制(指数退避)
2. 提供降级方案
3. 保存错误状态以便恢复
4. 实现断路器模式防止级联失败
5. 记录恢复过程便于审计

请生成添加故障恢复后的代码:`

    return await unifiedAI.complete(prompt)
  }

  // 安全分析
  private async analyzeSecurity(code: string, request: DefensiveProgrammingRequest): Promise<SecurityAnalysis> {
    const threats: string[] = []
    const mitigations: string[] = []

    // 检查常见安全威胁
    if (code.includes("eval(")) {
      threats.push("代码注入: 使用eval()可能导致任意代码执行")
      mitigations.push("移除eval()或使用JSON.parse()等安全替代方案")
    }

    if (code.match(/innerHTML\s*=/)) {
      threats.push("XSS攻击: 直接设置innerHTML可能导致跨站脚本攻击")
      mitigations.push("使用textContent或DOMPurify清理用户输入")
    }

    if (code.match(/(password|secret|token|key)\s*=\s*['"][^'"]+['"]/i)) {
      threats.push("敏感信息泄露: 硬编码的密钥或密码")
      mitigations.push("使用环境变量或密钥管理服务存储敏感信息")
    }

    if (code.includes("SELECT") && code.includes("+")) {
      threats.push("SQL注入: 字符串拼接构造SQL查询")
      mitigations.push("使用参数化查询或ORM")
    }

    if (!code.includes("validate") && !code.includes("sanitize")) {
      threats.push("输入验证缺失: 未发现输入验证逻辑")
      mitigations.push("添加完整的输入验证和清理")
    }

    // 应用用户指定的安全要求
    request.securityRequirements.forEach((req) => {
      if (!code.toLowerCase().includes(req.toLowerCase())) {
        threats.push(`缺少安全要求: ${req}`)
        mitigations.push(`实现${req}安全措施`)
      }
    })

    const securityScore = Math.max(0, 100 - threats.length * 15)

    return { threats, mitigations, securityScore }
  }

  // 错误处理覆盖分析
  private analyzeErrorHandling(code: string, request: DefensiveProgrammingRequest): ErrorHandlingCoverage {
    const requiredScenarios = [
      ...request.defensiveRequirements.inputValidation,
      ...request.defensiveRequirements.exceptionHandling,
      ...request.defensiveRequirements.resourceManagement,
      ...request.defensiveRequirements.failureRecovery,
    ]

    const totalErrorScenarios = requiredScenarios.length
    const handledScenarios = requiredScenarios.filter((scenario) => {
      const keywords = scenario.toLowerCase().split(" ")
      return keywords.some((keyword) => code.toLowerCase().includes(keyword))
    }).length

    const coverage = totalErrorScenarios > 0 ? (handledScenarios / totalErrorScenarios) * 100 : 100

    const unhandledScenarios = requiredScenarios.filter((scenario) => {
      const keywords = scenario.toLowerCase().split(" ")
      return !keywords.some((keyword) => code.toLowerCase().includes(keyword))
    })

    return {
      totalErrorScenarios,
      handledScenarios,
      coverage: Math.round(coverage),
      unhandledScenarios,
    }
  }

  // 识别边界条件
  private identifyBoundaryConditions(code: string, request: DefensiveProgrammingRequest): BoundaryCondition[] {
    const conditions: BoundaryCondition[] = []

    // 空输入处理
    if (code.includes("null") || code.includes("undefined") || code.includes("!")) {
      conditions.push({
        condition: "空输入(null/undefined)",
        handling: code.includes("throw") ? "抛出错误" : "使用默认值",
        tested: code.includes("if") && (code.includes("null") || code.includes("undefined")),
      })
    }

    // 极值情况
    if (code.match(/>\s*\d+|<\s*\d+|===\s*0/)) {
      conditions.push({
        condition: "极值情况(最大值/最小值/零)",
        handling: "边界检查",
        tested: code.includes("if") && code.match(/>\s*\d+|<\s*\d+/) !== null,
      })
    }

    // 空数组/字符串
    if (code.includes(".length")) {
      conditions.push({
        condition: "空数组或空字符串",
        handling: "长度检查",
        tested: code.includes(".length") && code.includes("==="),
      })
    }

    // 并发访问
    if (code.includes("async") || code.includes("Promise")) {
      conditions.push({
        condition: "并发访问",
        handling: code.includes("lock") || code.includes("mutex") ? "使用锁机制" : "需要同步控制",
        tested: false,
      })
    }

    // 资源限制
    if (code.includes("memory") || code.includes("timeout") || code.includes("limit")) {
      conditions.push({
        condition: "资源限制(内存/时间/连接数)",
        handling: "限制检查和降级",
        tested: code.includes("if") && code.includes("limit"),
      })
    }

    return conditions
  }

  // 生成文档
  private generateDocumentation(
    code: string,
    request: DefensiveProgrammingRequest,
    securityAnalysis: SecurityAnalysis,
    boundaryConditions: BoundaryCondition[],
  ): string {
    let doc = `# 防御性编程代码文档\n\n`

    doc += `## 功能描述\n${request.functionality}\n\n`

    doc += `## 防御性特性\n\n`
    doc += `### 输入验证\n`
    request.defensiveRequirements.inputValidation.forEach((rule) => {
      doc += `- ${rule}\n`
    })

    doc += `\n### 异常处理\n`
    request.defensiveRequirements.exceptionHandling.forEach((type) => {
      doc += `- ${type}\n`
    })

    doc += `\n### 资源管理\n`
    request.defensiveRequirements.resourceManagement.forEach((res) => {
      doc += `- ${res}\n`
    })

    doc += `\n### 故障恢复\n`
    request.defensiveRequirements.failureRecovery.forEach((strategy) => {
      doc += `- ${strategy}\n`
    })

    doc += `\n## 安全分析\n\n`
    doc += `**安全评分**: ${securityAnalysis.securityScore}/100\n\n`

    if (securityAnalysis.threats.length > 0) {
      doc += `**识别的威胁**:\n`
      securityAnalysis.threats.forEach((threat) => {
        doc += `- ${threat}\n`
      })

      doc += `\n**缓解措施**:\n`
      securityAnalysis.mitigations.forEach((mitigation) => {
        doc += `- ${mitigation}\n`
      })
    }

    doc += `\n## 边界条件处理\n\n`
    boundaryConditions.forEach((condition) => {
      doc += `### ${condition.condition}\n`
      doc += `- **处理方式**: ${condition.handling}\n`
      doc += `- **已测试**: ${condition.tested ? "✅" : "❌"}\n\n`
    })

    doc += `## 使用示例\n\n`
    doc += "```" + request.language + "\n"
    doc += "// 示例代码\n"
    doc += "// TODO: 添加具体使用示例\n"
    doc += "```\n\n"

    doc += `## 测试建议\n\n`
    doc += `1. 测试所有输入验证规则\n`
    doc += `2. 模拟异常场景验证错误处理\n`
    doc += `3. 测试所有边界条件\n`
    doc += `4. 进行安全渗透测试\n`
    doc += `5. 验证资源正确释放\n`
    doc += `6. 测试故障恢复机制\n`

    return doc
  }
}

export const defensiveProgrammingGenerator = new DefensiveProgrammingGenerator()
