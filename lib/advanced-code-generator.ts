import { codeQualityAnalyzer } from "./code-quality-analyzer"
import { unifiedAI } from "./unified-ai-service"

// ==================== 函数生成 ====================

export interface FunctionGenerationRequest {
  name: string
  language: string
  description: string
  parameters: Array<{
    name: string
    type: string
    description: string
    optional?: boolean
    defaultValue?: any
  }>
  returnType: {
    type: string
    description: string
  }
  requirements: {
    errorHandling: string[]
    performance: string[]
    security: string[]
  }
}

export interface FunctionGenerationResult {
  code: string
  tests: string
  documentation: string
  examples: string[]
  qualityScore: number
  performanceAnalysis: PerformanceAnalysis
}

export interface PerformanceAnalysis {
  timeComplexity: string
  spaceComplexity: string
  optimizations: string[]
  benchmarks?: string
}

export class FunctionGenerator {
  async generate(request: FunctionGenerationRequest): Promise<FunctionGenerationResult> {
    // 第一步：构建函数代码
    const code = await this.buildFunctionCode(request)

    // 第二步：生成测试用例
    const tests = await this.generateTests(code, request)

    // 第三步：生成文档
    const documentation = await this.generateDocumentation(code, request)

    // 第四步：生成示例
    const examples = await this.generateExamples(code, request)

    // 第五步：质量分析
    const quality = codeQualityAnalyzer.analyze(code, request.language)

    // 第六步：性能分析
    const performanceAnalysis = await this.analyzePerformance(code, request)

    return {
      code,
      tests,
      documentation,
      examples,
      qualityScore: quality.overallScore,
      performanceAnalysis,
    }
  }

  private async buildFunctionCode(request: FunctionGenerationRequest): Promise<string> {
    const { name, language, description, parameters, returnType, requirements } = request

    // 构建参数列表
    const paramList = parameters.map((p) => {
      const optional = p.optional ? "?" : ""
      const defaultVal = p.defaultValue !== undefined ? ` = ${JSON.stringify(p.defaultValue)}` : ""
      return `${p.name}${optional}: ${p.type}${defaultVal}`
    })

    // 构建函数签名
    const signature =
      language === "typescript"
        ? `async function ${name}(${paramList.join(", ")}): Promise<${returnType.type}>`
        : `async function ${name}(${parameters.map((p) => p.name).join(", ")})`

    // 构建错误处理逻辑
    const errorHandling = this.buildErrorHandling(requirements.errorHandling)

    // 构建参数验证
    const paramValidation = this.buildParameterValidation(parameters)

    // 构建性能优化代码
    const performanceOptimizations = this.buildPerformanceOptimizations(requirements.performance)

    // 构建安全检查
    const securityChecks = this.buildSecurityChecks(requirements.security)

    // 使用AI生成函数实现
    const prompt = `生成一个高质量的${language}函数:

函数名: ${name}
功能描述: ${description}

参数:
${parameters.map((p) => `- ${p.name} (${p.type}): ${p.description}`).join("\n")}

返回值: ${returnType.type} - ${returnType.description}

要求:
1. 错误处理: ${requirements.errorHandling.join(", ")}
2. 性能要求: ${requirements.performance.join(", ")}
3. 安全要求: ${requirements.security.join(", ")}

请生成完整的函数实现，包括:
- 完整的参数验证
- 详细的错误处理
- 性能优化代码
- 安全检查
- 清晰的注释

函数签名: ${signature}`

    const implementation = await unifiedAI.complete(prompt)

    // 组装完整代码
    const fullCode = `/**
 * ${description}
 * 
${parameters.map((p) => ` * @param {${p.type}} ${p.name} - ${p.description}`).join("\n")}
 * @returns {Promise<${returnType.type}>} ${returnType.description}
 * 
 * @example
 * const result = await ${name}(${parameters.map((p) => `sample${p.name}`).join(", ")});
 */
${implementation}

${errorHandling}
${paramValidation}
${performanceOptimizations}
${securityChecks}`

    return fullCode
  }

  private buildErrorHandling(requirements: string[]): string {
    if (requirements.length === 0) return ""

    return `
// 错误处理工具函数
class ${this.capitalize(requirements[0].replace(/\s/g, ""))}Error extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = '${this.capitalize(requirements[0].replace(/\s/g, ""))}Error';
  }
}

function handleError(error: unknown): never {
  if (error instanceof ${this.capitalize(requirements[0].replace(/\s/g, ""))}Error) {
    console.error(\`[\${error.name}] \${error.code}: \${error.message}\`);
  } else if (error instanceof Error) {
    console.error(\`[Error] \${error.message}\`);
  } else {
    console.error('[Unknown Error]', error);
  }
  throw error;
}`
  }

  private buildParameterValidation(parameters: Array<any>): string {
    if (parameters.length === 0) return ""

    const validations = parameters
      .filter((p) => !p.optional)
      .map(
        (p) => `
  if (${p.name} === undefined || ${p.name} === null) {
    throw new Error('参数 ${p.name} 是必需的');
  }`,
      )

    return `
// 参数验证
function validateParameters(${parameters.map((p) => `${p.name}: any`).join(", ")}): void {
${validations.join("")}
}`
  }

  private buildPerformanceOptimizations(requirements: string[]): string {
    if (requirements.length === 0) return ""

    let optimizations = `
// 性能优化工具`

    if (requirements.some((r) => r.includes("缓存") || r.includes("cache"))) {
      optimizations += `
const cache = new Map<string, any>();

function getCached<T>(key: string, compute: () => T): T {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const value = compute();
  cache.set(key, value);
  return value;
}`
    }

    if (requirements.some((r) => r.includes("并发") || r.includes("parallel"))) {
      optimizations += `

async function parallel<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  return Promise.all(tasks.map((task) => task()));
}`
    }

    return optimizations
  }

  private buildSecurityChecks(requirements: string[]): string {
    if (requirements.length === 0) return ""

    let checks = `
// 安全检查工具`

    if (requirements.some((r) => r.includes("注入") || r.includes("injection"))) {
      checks += `
function sanitizeInput(input: string): string {
  return input.replace(/[<>'"]/g, '');
}

function validateSQL(query: string): boolean {
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
  return !dangerousKeywords.some((keyword) => query.toUpperCase().includes(keyword));
}`
    }

    if (requirements.some((r) => r.includes("认证") || r.includes("auth"))) {
      checks += `

function verifyAuth(token: string): boolean {
  // 验证token有效性
  return token.length > 0 && !token.includes('expired');
}`
    }

    return checks
  }

  private async generateTests(code: string, request: FunctionGenerationRequest): Promise<string> {
    const prompt = `为以下${request.language}函数生成完整的单元测试:

${code}

测试要求:
1. 使用 Jest 测试框架
2. 覆盖所有参数组合
3. 测试边界条件
4. 测试错误处理
5. 测试性能要求: ${request.requirements.performance.join(", ")}
6. 每个测试用例要有清晰的描述

请生成完整的测试文件。`

    return await unifiedAI.complete(prompt)
  }

  private async generateDocumentation(code: string, request: FunctionGenerationRequest): Promise<string> {
    return `# ${request.name} 函数文档

## 功能描述
${request.description}

## 函数签名
\`\`\`${request.language}
${request.name}(${request.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}): Promise<${request.returnType.type}>
\`\`\`

## 参数说明
${request.parameters
  .map(
    (p) => `
### ${p.name}
- **类型**: \`${p.type}\`
- **必需**: ${p.optional ? "否" : "是"}
${p.defaultValue !== undefined ? `- **默认值**: \`${JSON.stringify(p.defaultValue)}\`` : ""}
- **描述**: ${p.description}`,
  )
  .join("\n")}

## 返回值
- **类型**: \`${request.returnType.type}\`
- **描述**: ${request.returnType.description}

## 错误处理
${request.requirements.errorHandling.map((e) => `- ${e}`).join("\n")}

## 性能要求
${request.requirements.performance.map((p) => `- ${p}`).join("\n")}

## 安全要求
${request.requirements.security.map((s) => `- ${s}`).join("\n")}

## 使用示例
见下方示例代码。`
  }

  private async generateExamples(code: string, request: FunctionGenerationRequest): Promise<string[]> {
    const examples: string[] = []

    // 基本用例
    examples.push(`// 基本用例
const result = await ${request.name}(${request.parameters.map((p) => this.generateSampleValue(p.type)).join(", ")});
console.log(result);`)

    // 错误处理用例
    examples.push(`// 错误处理
try {
  const result = await ${request.name}(${request.parameters.map(() => "null").join(", ")});
} catch (error) {
  console.error('发生错误:', error);
}`)

    // 异步用例
    examples.push(`// 异步处理
Promise.all([
  ${request.name}(${request.parameters.map((p) => this.generateSampleValue(p.type)).join(", ")}),
  ${request.name}(${request.parameters.map((p) => this.generateSampleValue(p.type)).join(", ")})
]).then((results) => {
  console.log('所有结果:', results);
});`)

    return examples
  }

  private async analyzePerformance(code: string, request: FunctionGenerationRequest): Promise<PerformanceAnalysis> {
    // 分析时间复杂度
    const timeComplexity = this.analyzeTimeComplexity(code)

    // 分析空间复杂度
    const spaceComplexity = this.analyzeSpaceComplexity(code)

    // 生成优化建议
    const optimizations = await this.generateOptimizations(code, request)

    return {
      timeComplexity,
      spaceComplexity,
      optimizations,
    }
  }

  private analyzeTimeComplexity(code: string): string {
    if (code.includes("for") && code.includes("for")) return "O(n²)"
    if (code.includes("for") || code.includes("while")) return "O(n)"
    if (code.includes("sort")) return "O(n log n)"
    return "O(1)"
  }

  private analyzeSpaceComplexity(code: string): string {
    if (code.includes("new Array") || code.includes("[]")) return "O(n)"
    if (code.includes("new Map") || code.includes("new Set")) return "O(n)"
    return "O(1)"
  }

  private async generateOptimizations(code: string, request: FunctionGenerationRequest): Promise<string[]> {
    const optimizations: string[] = []

    // 缓存优化
    if (request.requirements.performance.some((p) => p.includes("缓存"))) {
      optimizations.push("使用Map缓存重复计算结果，避免重复运算")
    }

    // 并发优化
    if (request.requirements.performance.some((p) => p.includes("并发"))) {
      optimizations.push("使用Promise.all并行处理独立任务，提升执行效率")
    }

    // 内存优化
    if (code.includes("new Array")) {
      optimizations.push("考虑使用迭代器或生成器减少内存占用")
    }

    return optimizations
  }

  private generateSampleValue(type: string): any {
    switch (type.toLowerCase()) {
      case "string":
        return '"sample"'
      case "number":
        return "42"
      case "boolean":
        return "true"
      case "array":
        return "[1, 2, 3]"
      case "object":
        return "{ key: 'value' }"
      default:
        return "null"
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// ==================== 类设计生成 ====================

export interface ClassGenerationRequest {
  name: string
  language: string
  responsibility: string
  properties: Array<{
    name: string
    type: string
    access: "public" | "private" | "protected"
    description: string
  }>
  methods: Array<{
    name: string
    description: string
    parameters: Array<{ name: string; type: string }>
    returnType: string
  }>
  designPrinciples: string[]
  extensionPoints: string[]
  designPatterns: string[]
}

export interface ClassGenerationResult {
  code: string
  tests: string
  documentation: string
  umlDiagram: string
  qualityScore: number
}

export class ClassGenerator {
  async generate(request: ClassGenerationRequest): Promise<ClassGenerationResult> {
    // 第一步：生成类定义
    const code = await this.buildClassCode(request)

    // 第二步：生成测试
    const tests = await this.generateTests(code, request)

    // 第三步：生成文档
    const documentation = await this.generateDocumentation(code, request)

    // 第四步：生成UML图
    const umlDiagram = this.generateUMLDiagram(request)

    // 第五步：质量分析
    const quality = codeQualityAnalyzer.analyze(code, request.language)

    return {
      code,
      tests,
      documentation,
      umlDiagram,
      qualityScore: quality.overallScore,
    }
  }

  private async buildClassCode(request: ClassGenerationRequest): Promise<string> {
    const { name, responsibility, properties, methods, designPrinciples, designPatterns } = request

    // 构建属性声明
    const propertyDeclarations = properties
      .map(
        (p) => `  /**
   * ${p.description}
   */
  ${p.access} ${p.name}: ${p.type};`,
      )
      .join("\n\n")

    // 构建构造函数
    const constructor = this.buildConstructor(properties)

    // 构建方法
    const methodImplementations = await this.buildMethods(methods, name)

    // 应用设计模式
    const patternImplementation = this.applyDesignPatterns(designPatterns, name)

    return `/**
 * ${name} - ${responsibility}
 * 
 * 设计原则: ${designPrinciples.join(", ")}
 * 设计模式: ${designPatterns.join(", ")}
 */
export class ${name} {
${propertyDeclarations}

${constructor}

${methodImplementations}

${patternImplementation}
}`
  }

  private buildConstructor(properties: Array<any>): string {
    const params = properties
      .filter((p) => p.access !== "private")
      .map((p) => `${p.name}: ${p.type}`)
      .join(", ")

    const assignments = properties.map((p) => `    this.${p.name} = ${p.name};`).join("\n")

    return `  /**
   * 构造函数
   */
  constructor(${params}) {
${assignments}
  }`
  }

  private async buildMethods(methods: Array<any>, className: string): Promise<string> {
    const implementations: string[] = []

    for (const method of methods) {
      const params = method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(", ")

      const prompt = `为类 ${className} 生成方法 ${method.name} 的实现:

功能描述: ${method.description}
参数: ${method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(", ")}
返回类型: ${method.returnType}

要求:
1. 遵循单一职责原则
2. 完整的错误处理
3. 清晰的注释
4. 高性能实现

请生成完整的方法实现。`

      const implementation = await unifiedAI.complete(prompt)

      implementations.push(`  /**
   * ${method.description}
   */
  async ${method.name}(${params}): Promise<${method.returnType}> {
${implementation}
  }`)
    }

    return implementations.join("\n\n")
  }

  private applyDesignPatterns(patterns: string[], className: string): string {
    let code = ""

    patterns.forEach((pattern) => {
      switch (pattern.toLowerCase()) {
        case "singleton":
          code += `
  private static instance: ${className};

  static getInstance(): ${className} {
    if (!${className}.instance) {
      ${className}.instance = new ${className}();
    }
    return ${className}.instance;
  }`
          break

        case "factory":
          code += `
  static create(type: string): ${className} {
    switch (type) {
      case 'default':
        return new ${className}();
      default:
        throw new Error(\`Unknown type: \${type}\`);
    }
  }`
          break

        case "observer":
          code += `
  private observers: Array<(data: any) => void> = [];

  subscribe(observer: (data: any) => void): void {
    this.observers.push(observer);
  }

  notify(data: any): void {
    this.observers.forEach((observer) => observer(data));
  }`
          break
      }
    })

    return code
  }

  private async generateTests(code: string, request: ClassGenerationRequest): Promise<string> {
    const prompt = `为以下类生成完整的单元测试:

${code}

测试要求:
1. 使用 Jest 测试框架
2. 测试所有公开方法
3. 测试属性的getter和setter
4. 测试设计模式的正确实现
5. 测试错误处理

请生成完整的测试文件。`

    return await unifiedAI.complete(prompt)
  }

  private async generateDocumentation(code: string, request: ClassGenerationRequest): Promise<string> {
    return `# ${request.name} 类文档

## 类职责
${request.responsibility}

## 设计原则
${request.designPrinciples.map((p) => `- ${p}`).join("\n")}

## 设计模式
${request.designPatterns.map((p) => `- ${p}`).join("\n")}

## 属性

${request.properties
  .map(
    (p) => `### ${p.name}
- **类型**: \`${p.type}\`
- **访问权限**: ${p.access}
- **描述**: ${p.description}`,
  )
  .join("\n\n")}

## 方法

${request.methods
  .map(
    (m) => `### ${m.name}
- **描述**: ${m.description}
- **参数**: ${m.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}
- **返回类型**: \`${m.returnType}\``,
  )
  .join("\n\n")}

## 使用示例

\`\`\`typescript
const instance = new ${request.name}(${request.properties
      .filter((p) => p.access !== "private")
      .map((p) => `sample${p.name.charAt(0).toUpperCase() + p.name.slice(1)}`)
      .join(", ")});
${request.methods[0] ? `const result = await instance.${request.methods[0].name}(${request.methods[0].parameters.map(() => "sample").join(", ")});` : ""}
\`\`\`
`
  }

  private generateUMLDiagram(request: ClassGenerationRequest): string {
    return `@startuml
class ${request.name} {
${request.properties.map((p) => `  ${p.access === "private" ? "-" : p.access === "protected" ? "#" : "+"} ${p.name}: ${p.type}`).join("\n")}
  --
${request.methods.map((m) => `  + ${m.name}(${m.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}): ${m.returnType}`).join("\n")}
}
@enduml`
  }
}

// ==================== RESTful API 生成 ====================

export interface APIGenerationRequest {
  framework: string
  endpoint: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    path: string
  }
  parameters: {
    query?: Record<string, string>
    body?: Record<string, string>
    path?: Record<string, string>
  }
  response: {
    success: string
    error: string
  }
  businessLogic: string
  security: {
    authentication: string
    authorization: string
    validation: string[]
  }
}

export interface APIGenerationResult {
  controller: string
  dto: string
  service: string
  tests: string
  documentation: string
  qualityScore: number
}

export class APIGenerator {
  async generate(request: APIGenerationRequest): Promise<APIGenerationResult> {
    // 第一步：生成控制器
    const controller = await this.generateController(request)

    // 第二步：生成DTO
    const dto = this.generateDTO(request)

    // 第三步：生成服务层
    const service = await this.generateService(request)

    // 第四步：生成测试
    const tests = await this.generateTests(controller, service, request)

    // 第五步：生成API文档
    const documentation = this.generateDocumentation(request)

    // 第六步：质量分析
    const quality = codeQualityAnalyzer.analyze(controller + dto + service, "typescript")

    return {
      controller,
      dto,
      service,
      tests,
      documentation,
      qualityScore: quality.overallScore,
    }
  }

  private async generateController(request: APIGenerationRequest): Promise<string> {
    const { endpoint, parameters, response, security } = request

    const routePath = endpoint.path
    const method = endpoint.method.toLowerCase()

    // 构建参数解构
    const queryParams = parameters.query ? Object.keys(parameters.query).join(", ") : ""
    const bodyParams = parameters.body ? Object.keys(parameters.body).join(", ") : ""
    const pathParams = parameters.path ? Object.keys(parameters.path).join(", ") : ""

    // 构建认证中间件
    const authMiddleware = security.authentication ? `authenticate, ` : ""

    // 构建验证逻辑
    const validation = security.validation
      .map(
        (v) => `
  // ${v}
  if (!${v.split(" ")[0]}) {
    return res.status(400).json({ error: '${v}' });
  }`,
      )
      .join("")

    return `import { Request, Response, Router } from 'express';
import { ${request.framework === "express" ? "authenticate" : "auth"} } from './middleware/auth';
import { ${this.getServiceName(endpoint.path)} } from './services/${this.getServiceName(endpoint.path)}';

const router = Router();

/**
 * ${endpoint.method} ${endpoint.path}
 * ${request.businessLogic}
 */
router.${method}('${routePath}', ${authMiddleware}async (req: Request, res: Response) => {
  try {
${validation}

    // 提取参数
${queryParams ? `    const { ${queryParams} } = req.query;` : ""}
${bodyParams ? `    const { ${bodyParams} } = req.body;` : ""}
${pathParams ? `    const { ${pathParams} } = req.params;` : ""}

    // 调用服务层
    const service = new ${this.capitalize(this.getServiceName(endpoint.path))}();
    const result = await service.${method}(${[queryParams, bodyParams, pathParams].filter((p) => p).join(", ")});

    // 返回成功响应
    res.status(200).json(result);
  } catch (error) {
    console.error('[API Error]', error);
    res.status(500).json({ error: '${response.error}' });
  }
});

export default router;`
  }

  private generateDTO(request: APIGenerationRequest): string {
    const { endpoint, parameters, response } = request

    const dtoName = this.capitalize(this.getServiceName(endpoint.path)) + "DTO"

    // 请求DTO
    const requestDTO = parameters.body
      ? `export interface ${dtoName}Request {
${Object.entries(parameters.body)
  .map(([key, type]) => `  ${key}: ${type};`)
  .join("\n")}
}`
      : ""

    // 响应DTO
    const responseDTO = `export interface ${dtoName}Response {
  success: boolean;
  data?: ${response.success};
  error?: string;
}`

    return `// Data Transfer Objects for ${endpoint.path}

${requestDTO}

${responseDTO}

// 验证函数
export function validate${dtoName}Request(data: any): data is ${dtoName}Request {
${Object.entries(parameters.body || {})
  .map(([key, type]) => `  if (typeof data.${key} !== '${type.toLowerCase()}') return false;`)
  .join("\n")}
  return true;
}`
  }

  private async generateService(request: APIGenerationRequest): Promise<string> {
    const { endpoint, businessLogic } = request

    const serviceName = this.capitalize(this.getServiceName(endpoint.path))

    const prompt = `生成一个 ${serviceName} 服务类，实现以下业务逻辑:

${businessLogic}

HTTP方法: ${endpoint.method}
路径: ${endpoint.path}

要求:
1. 完整的业务逻辑实现
2. 数据库操作（如需要）
3. 错误处理
4. 事务管理
5. 日志记录

请生成完整的服务类代码。`

    const implementation = await unifiedAI.complete(prompt)

    return `export class ${serviceName} {
${implementation}
}`
  }

  private async generateTests(controller: string, service: string, request: APIGenerationRequest): Promise<string> {
    const prompt = `为以下API生成完整的集成测试:

控制器:
${controller}

服务:
${service}

测试要求:
1. 使用 Jest 和 Supertest
2. 测试所有HTTP状态码
3. 测试认证和授权
4. 测试参数验证
5. 测试业务逻辑
6. 测试错误处理

请生成完整的测试文件。`

    return await unifiedAI.complete(prompt)
  }

  private generateDocumentation(request: APIGenerationRequest): string {
    const { endpoint, parameters, response, businessLogic, security } = request

    return `# API 文档: ${endpoint.method} ${endpoint.path}

## 功能描述
${businessLogic}

## 请求

### 端点
\`${endpoint.method} ${endpoint.path}\`

### 认证
${security.authentication || "无需认证"}

### 授权
${security.authorization || "无需授权"}

### 请求参数

${
  parameters.query
    ? `#### Query参数\n${Object.entries(parameters.query)
        .map(([key, type]) => `- \`${key}\` (${type})`)
        .join("\n")}`
    : ""
}

${parameters.body ? `#### Body参数\n\`\`\`json\n${JSON.stringify(Object.fromEntries(Object.entries(parameters.body).map(([key, type]) => [key, `<${type}>`])), null, 2)}\n\`\`\`` : ""}

${
  parameters.path
    ? `#### Path参数\n${Object.entries(parameters.path)
        .map(([key, type]) => `- \`${key}\` (${type})`)
        .join("\n")}`
    : ""
}

## 响应

### 成功响应 (200)
\`\`\`json
{
  "success": true,
  "data": ${response.success}
}
\`\`\`

### 错误响应 (400/500)
\`\`\`json
{
  "success": false,
  "error": "${response.error}"
}
\`\`\`

## 示例

### cURL
\`\`\`bash
curl -X ${endpoint.method} \\
  '${endpoint.path}' \\
  -H 'Content-Type: application/json' \\
${security.authentication ? "  -H 'Authorization: Bearer <token>' \\\\" : ""}
${parameters.body ? `  -d '${JSON.stringify(Object.fromEntries(Object.entries(parameters.body).map(([key]) => [key, "sample"])))}'\n` : ""}
\`\`\`

### JavaScript
\`\`\`javascript
const response = await fetch('${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
${security.authentication ? "    'Authorization': 'Bearer <token>',\n" : ""}
  },
${parameters.body ? `  body: JSON.stringify(${JSON.stringify(Object.fromEntries(Object.entries(parameters.body).map(([key]) => [key, "sample"])))})\n` : ""}
});
const data = await response.json();
\`\`\`
`
  }

  private getServiceName(path: string): string {
    return path
      .split("/")
      .filter((p) => p && !p.startsWith(":"))
      .join("-")
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// ==================== 数据处理代码生成 ====================

export interface DataProcessingRequest {
  dataSource: {
    format: string
    source: string
    scale: string
  }
  processing: {
    cleaning: string[]
    transformation: string[]
    aggregation: string[]
    output: string
  }
  performance: {
    memoryLimit: string
    timeLimit: string
    errorHandling: string
  }
}

export interface DataProcessingResult {
  code: string
  tests: string
  documentation: string
  performanceAnalysis: PerformanceAnalysis
  qualityScore: number
}

export class DataProcessingGenerator {
  async generate(request: DataProcessingRequest): Promise<DataProcessingResult> {
    // 第一步：生成数据处理代码
    const code = await this.buildProcessingCode(request)

    // 第二步：生成测试
    const tests = await this.generateTests(code, request)

    // 第三步：生成文档
    const documentation = this.generateDocumentation(request)

    // 第四步：性能分析
    const performanceAnalysis = await this.analyzePerformance(code, request)

    // 第五步：质量分析
    const quality = codeQualityAnalyzer.analyze(code, "typescript")

    return {
      code,
      tests,
      documentation,
      performanceAnalysis,
      qualityScore: quality.overallScore,
    }
  }

  private async buildProcessingCode(request: DataProcessingRequest): Promise<string> {
    const { dataSource, processing, performance } = request

    const prompt = `生成高性能数据处理代码:

数据源:
- 格式: ${dataSource.format}
- 来源: ${dataSource.source}
- 规模: ${dataSource.scale}

处理要求:
- 数据清洗: ${processing.cleaning.join(", ")}
- 数据转换: ${processing.transformation.join(", ")}
- 数据聚合: ${processing.aggregation.join(", ")}
- 结果输出: ${processing.output}

性能考虑:
- 内存限制: ${performance.memoryLimit}
- 时间限制: ${performance.timeLimit}
- 错误处理: ${performance.errorHandling}

要求:
1. 使用流式处理减少内存占用
2. 支持大文件处理
3. 完善的错误处理和日志
4. 性能监控和统计
5. 支持并行处理

请生成完整的数据处理代码，使用TypeScript。`

    const implementation = await unifiedAI.complete(prompt)

    return `import { createReadStream, createWriteStream } from 'fs';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

/**
 * 数据处理管道
 * 数据源: ${dataSource.source}
 * 输出格式: ${processing.output}
 */
export class DataProcessor {
  private stats = {
    processed: 0,
    errors: 0,
    startTime: 0,
    endTime: 0,
  };

  /**
   * 数据清洗转换流
   */
  private createCleaningTransform(): Transform {
    return new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        try {
          // 数据清洗逻辑
${processing.cleaning
  .map(
    (rule) => `          // ${rule}
          chunk = this.applyCleaning(chunk, '${rule}');`,
  )
  .join("\n")}

          callback(null, chunk);
        } catch (error) {
          this.stats.errors++;
          console.error('[Cleaning Error]', error);
          callback(error);
        }
      },
    });
  }

  /**
   * 数据转换流
   */
  private createTransformationStream(): Transform {
    return new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        try {
          // 数据转换逻辑
${processing.transformation
  .map(
    (rule) => `          // ${rule}
          chunk = this.applyTransformation(chunk, '${rule}');`,
  )
  .join("\n")}

          this.stats.processed++;
          callback(null, chunk);
        } catch (error) {
          this.stats.errors++;
          console.error('[Transformation Error]', error);
          callback();
        }
      },
    });
  }

  /**
   * 数据聚合流
   */
  private createAggregationStream(): Transform {
    const aggregatedData = new Map();

    return new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        try {
          // 数据聚合逻辑
${processing.aggregation
  .map(
    (rule) => `          // ${rule}
          this.applyAggregation(aggregatedData, chunk, '${rule}');`,
  )
  .join("\n")}

          callback();
        } catch (error) {
          this.stats.errors++;
          console.error('[Aggregation Error]', error);
          callback();
        }
      },
      flush: (callback) => {
        // 输出聚合结果
        for (const [key, value] of aggregatedData.entries()) {
          this.push(JSON.stringify({ key, value }) + '\\n');
        }
        callback();
      },
    });
  }

  /**
   * 执行数据处理
   */
  async process(inputPath: string, outputPath: string): Promise<void> {
    this.stats.startTime = Date.now();

    try {
      await pipelineAsync(
        createReadStream(inputPath),
        this.createCleaningTransform(),
        this.createTransformationStream(),
        this.createAggregationStream(),
        createWriteStream(outputPath)
      );

      this.stats.endTime = Date.now();
      this.logStats();
    } catch (error) {
      console.error('[Pipeline Error]', error);
      throw error;
    }
  }

  /**
   * 应用清洗规则
   */
  private applyCleaning(data: any, rule: string): any {
    // 清洗逻辑实现
    return data;
  }

  /**
   * 应用转换规则
   */
  private applyTransformation(data: any, rule: string): any {
    // 转换逻辑实现
    return data;
  }

  /**
   * 应用聚合规则
   */
  private applyAggregation(map: Map<any, any>, data: any, rule: string): void {
    // 聚合逻辑实现
  }

  /**
   * 记录统计信息
   */
  private logStats(): void {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    console.log('[Processing Complete]');
    console.log(\`  Processed: \${this.stats.processed} records\`);
    console.log(\`  Errors: \${this.stats.errors}\`);
    console.log(\`  Duration: \${duration.toFixed(2)}s\`);
    console.log(\`  Throughput: \${(this.stats.processed / duration).toFixed(2)} records/s\`);
  }
}

${implementation}
`
  }

  private async generateTests(code: string, request: DataProcessingRequest): Promise<string> {
    const prompt = `为以下数据处理代码生成完整的测试:

${code}

测试要求:
1. 单元测试所有转换函数
2. 集成测试完整数据管道
3. 性能测试（内存、速度）
4. 边界测试（空数据、大数据、异常数据）
5. 错误处理测试

请生成完整的测试文件。`

    return await unifiedAI.complete(prompt)
  }

  private generateDocumentation(request: DataProcessingRequest): string {
    return `# 数据处理代码文档

## 数据源
- **格式**: ${request.dataSource.format}
- **来源**: ${request.dataSource.source}
- **规模**: ${request.dataSource.scale}

## 处理流程

### 1. 数据清洗
${request.processing.cleaning.map((c) => `- ${c}`).join("\n")}

### 2. 数据转换
${request.processing.transformation.map((t) => `- ${t}`).join("\n")}

### 3. 数据聚合
${request.processing.aggregation.map((a) => `- ${a}`).join("\n")}

### 4. 结果输出
格式: ${request.processing.output}

## 性能指标
- **内存限制**: ${request.performance.memoryLimit}
- **时间限制**: ${request.performance.timeLimit}
- **错误处理**: ${request.performance.errorHandling}

## 使用示例

\`\`\`typescript
const processor = new DataProcessor();
await processor.process('input.${request.dataSource.format}', 'output.${request.processing.output}');
\`\`\`

## 性能优化
- 使用流式处理减少内存占用
- 支持大文件增量处理
- 错误数据跳过不中断处理
- 实时统计处理进度
`
  }

  private async analyzePerformance(code: string, request: DataProcessingRequest): Promise<PerformanceAnalysis> {
    return {
      timeComplexity: "O(n) - 线性处理",
      spaceComplexity: "O(1) - 流式处理，常量内存",
      optimizations: [
        "使用 Node.js Stream 实现流式处理，避免一次性加载所有数据到内存",
        "支持并行处理独立数据块，提升处理速度",
        "错误数据跳过机制，不中断整体处理流程",
        "实时统计和日志，便于监控处理进度",
      ],
    }
  }
}

// ==================== 导出所有生成器 ====================

export const functionGenerator = new FunctionGenerator()
export const classGenerator = new ClassGenerator()
export const apiGenerator = new APIGenerator()
export const dataProcessingGenerator = new DataProcessingGenerator()
