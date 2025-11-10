// 边界条件处理器 - 专门处理各类边界情况

export interface BoundaryConditionRequest {
  functionality: string
  language: string
  inputTypes: InputType[]
  concurrencyLevel: "single" | "multi" | "high"
  resourceLimits: ResourceLimit[]
}

export interface InputType {
  name: string
  type: string
  constraints: string[]
}

export interface ResourceLimit {
  resource: string
  limit: string
  action: string
}

export interface BoundaryHandlingResult {
  code: string
  handledConditions: HandledCondition[]
  testCases: TestCase[]
  documentation: string
}

export interface HandledCondition {
  condition: string
  handling: string
  code: string
}

export interface TestCase {
  name: string
  input: string
  expectedBehavior: string
  code: string
}

export class BoundaryConditionHandler {
  // 生成具备完整边界条件处理的代码
  async generateWithBoundaryHandling(request: BoundaryConditionRequest): Promise<BoundaryHandlingResult> {
    console.log("[v0] 生成边界条件处理代码...")

    const handledConditions: HandledCondition[] = []
    const testCases: TestCase[] = []

    // 1. 空输入处理
    const nullHandling = this.generateNullHandling(request)
    handledConditions.push(nullHandling)
    testCases.push(...this.generateNullTests(request))

    // 2. 极值处理
    const extremeValueHandling = this.generateExtremeValueHandling(request)
    handledConditions.push(extremeValueHandling)
    testCases.push(...this.generateExtremeValueTests(request))

    // 3. 并发访问处理
    const concurrencyHandling = this.generateConcurrencyHandling(request)
    if (request.concurrencyLevel !== "single") {
      handledConditions.push(concurrencyHandling)
      testCases.push(...this.generateConcurrencyTests(request))
    }

    // 4. 资源限制处理
    const resourceHandling = this.generateResourceLimitHandling(request)
    handledConditions.push(resourceHandling)
    testCases.push(...this.generateResourceLimitTests(request))

    // 5. 组合所有处理逻辑
    const code = this.combineHandlers(request, handledConditions)

    // 6. 生成文档
    const documentation = this.generateDocumentation(request, handledConditions, testCases)

    return {
      code,
      handledConditions,
      testCases,
      documentation,
    }
  }

  // 空输入处理
  private generateNullHandling(request: BoundaryConditionRequest): HandledCondition {
    const code = `
// 空输入处理
function validateInput(input: any): void {
  if (input === null || input === undefined) {
    throw new Error('输入不能为null或undefined');
  }
  
  if (typeof input === 'string' && input.trim() === '') {
    throw new Error('输入字符串不能为空');
  }
  
  if (Array.isArray(input) && input.length === 0) {
    throw new Error('输入数组不能为空');
  }
  
  if (typeof input === 'object' && Object.keys(input).length === 0) {
    throw new Error('输入对象不能为空');
  }
}
`

    return {
      condition: "空输入(null/undefined/空字符串/空数组/空对象)",
      handling: "验证并抛出清晰的错误信息",
      code,
    }
  }

  // 极值处理
  private generateExtremeValueHandling(request: BoundaryConditionRequest): HandledCondition {
    const code = `
// 极值处理
function validateRange(value: number, min: number, max: number): void {
  if (value < min) {
    throw new Error(\`值\${value}小于最小值\${min}\`);
  }
  
  if (value > max) {
    throw new Error(\`值\${value}大于最大值\${max}\`);
  }
  
  if (value === 0 && min > 0) {
    throw new Error('值不能为零');
  }
  
  if (!Number.isFinite(value)) {
    throw new Error('值必须是有限数字');
  }
}

function validateArraySize(array: any[], maxSize: number): void {
  if (array.length > maxSize) {
    throw new Error(\`数组大小\${array.length}超过限制\${maxSize}\`);
  }
}
`

    return {
      condition: "极值情况(最大值/最小值/零值/无穷大)",
      handling: "范围检查和边界验证",
      code,
    }
  }

  // 并发访问处理
  private generateConcurrencyHandling(request: BoundaryConditionRequest): HandledCondition {
    const code = `
// 并发访问处理
class ConcurrencyController {
  private locks = new Map<string, Promise<void>>();
  private activeOperations = new Map<string, number>();
  private maxConcurrency: number;

  constructor(maxConcurrency: number = 10) {
    this.maxConcurrency = maxConcurrency;
  }

  // 获取锁
  async acquireLock(key: string): Promise<() => void> {
    // 等待现有锁释放
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    // 检查并发限制
    const current = this.activeOperations.get(key) || 0;
    if (current >= this.maxConcurrency) {
      throw new Error(\`并发操作数量超过限制: \${this.maxConcurrency}\`);
    }

    // 创建新锁
    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.locks.delete(key);
        this.activeOperations.set(key, (this.activeOperations.get(key) || 1) - 1);
        resolve();
      };
    });

    this.locks.set(key, lockPromise);
    this.activeOperations.set(key, current + 1);

    return releaseLock!;
  }

  // 使用锁执行操作
  async withLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const release = await this.acquireLock(key);
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

const concurrencyController = new ConcurrencyController();
`

    return {
      condition: "并发访问和竞态条件",
      handling: "使用锁机制和并发限制",
      code,
    }
  }

  // 资源限制处理
  private generateResourceLimitHandling(request: BoundaryConditionRequest): HandledCondition {
    const limits = request.resourceLimits.map((limit) => `  ${limit.resource}: ${limit.limit}`).join(",\n")

    const code = `
// 资源限制处理
class ResourceMonitor {
  private limits = {
${limits || "    memory: '1GB',\n    timeout: '30s',\n    connections: 100"}
  };
  
  private usage = {
    memory: 0,
    timeout: 0,
    connections: 0
  };

  checkMemory(required: number): void {
    const limit = this.parseSize(this.limits.memory as string);
    if (this.usage.memory + required > limit) {
      throw new Error(\`内存使用将超过限制: \${this.limits.memory}\`);
    }
  }

  checkTimeout(duration: number): void {
    const limit = this.parseTime(this.limits.timeout as string);
    if (duration > limit) {
      throw new Error(\`操作超时: 超过\${this.limits.timeout}\`);
    }
  }

  checkConnections(): void {
    const limit = this.limits.connections as number;
    if (this.usage.connections >= limit) {
      throw new Error(\`连接数达到限制: \${limit}\`);
    }
  }

  private parseSize(size: string): number {
    const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
    const match = size.match(/(\\d+)(\\w+)/);
    if (!match) return 0;
    return parseInt(match[1]) * (units[match[2] as keyof typeof units] || 1);
  }

  private parseTime(time: string): number {
    const units = { ms: 1, s: 1000, m: 60000, h: 3600000 };
    const match = time.match(/(\\d+)(\\w+)/);
    if (!match) return 0;
    return parseInt(match[1]) * (units[match[2] as keyof typeof units] || 1);
  }

  allocate(resource: string, amount: number): void {
    this.usage[resource as keyof typeof this.usage] += amount;
  }

  release(resource: string, amount: number): void {
    this.usage[resource as keyof typeof this.usage] -= amount;
  }
}

const resourceMonitor = new ResourceMonitor();
`

    return {
      condition: "资源限制(内存/时间/连接数)",
      handling: "资源监控和限制检查",
      code,
    }
  }

  // 组合所有处理器
  private combineHandlers(request: BoundaryConditionRequest, handlers: HandledCondition[]): string {
    let code = `// ${request.functionality}\n// 包含完整边界条件处理\n\n`

    handlers.forEach((handler) => {
      code += `// ========== ${handler.condition} ==========\n`
      code += handler.code + "\n\n"
    })

    code += `// 主函数示例\n`
    code += `async function ${this.toCamelCase(request.functionality)}(`
    code += request.inputTypes.map((input) => `${input.name}: ${input.type}`).join(", ")
    code += `): Promise<any> {\n`
    code += `  // 1. 输入验证\n`
    code += `  validateInput(${request.inputTypes[0]?.name || "input"});\n\n`

    if (request.inputTypes.some((t) => t.type.includes("number"))) {
      code += `  // 2. 范围验证\n`
      code += `  validateRange(${request.inputTypes.find((t) => t.type.includes("number"))?.name}, 0, 1000);\n\n`
    }

    if (request.concurrencyLevel !== "single") {
      code += `  // 3. 并发控制\n`
      code += `  return await concurrencyController.withLock('operation', async () => {\n`
      code += `    // 4. 资源检查\n`
      code += `    resourceMonitor.checkMemory(1024 * 1024); // 1MB\n`
      code += `    resourceMonitor.checkConnections();\n\n`
      code += `    try {\n`
      code += `      resourceMonitor.allocate('connections', 1);\n`
      code += `      // 实际业务逻辑\n`
      code += `      return await performOperation();\n`
      code += `    } finally {\n`
      code += `      resourceMonitor.release('connections', 1);\n`
      code += `    }\n`
      code += `  });\n`
    } else {
      code += `  // 4. 资源检查\n`
      code += `  resourceMonitor.checkMemory(1024 * 1024);\n\n`
      code += `  // 实际业务逻辑\n`
      code += `  return await performOperation();\n`
    }

    code += `}\n\n`

    code += `async function performOperation(): Promise<any> {\n`
    code += `  // TODO: 实现具体业务逻辑\n`
    code += `  return { success: true };\n`
    code += `}\n`

    return code
  }

  // 生成测试用例
  private generateNullTests(request: BoundaryConditionRequest): TestCase[] {
    return [
      {
        name: "测试null输入",
        input: "null",
        expectedBehavior: "应该抛出错误: 输入不能为null或undefined",
        code: `test('应该拒绝null输入', () => {\n  expect(() => validateInput(null)).toThrow('输入不能为null或undefined');\n});`,
      },
      {
        name: "测试undefined输入",
        input: "undefined",
        expectedBehavior: "应该抛出错误: 输入不能为null或undefined",
        code: `test('应该拒绝undefined输入', () => {\n  expect(() => validateInput(undefined)).toThrow('输入不能为null或undefined');\n});`,
      },
      {
        name: "测试空字符串",
        input: '""',
        expectedBehavior: "应该抛出错误: 输入字符串不能为空",
        code: `test('应该拒绝空字符串', () => {\n  expect(() => validateInput('')).toThrow('输入字符串不能为空');\n});`,
      },
    ]
  }

  private generateExtremeValueTests(request: BoundaryConditionRequest): TestCase[] {
    return [
      {
        name: "测试最小值",
        input: "0",
        expectedBehavior: "应该处理最小边界值",
        code: `test('应该处理最小值', () => {\n  expect(() => validateRange(0, 0, 100)).not.toThrow();\n});`,
      },
      {
        name: "测试最大值",
        input: "100",
        expectedBehavior: "应该处理最大边界值",
        code: `test('应该处理最大值', () => {\n  expect(() => validateRange(100, 0, 100)).not.toThrow();\n});`,
      },
      {
        name: "测试超出范围",
        input: "101",
        expectedBehavior: "应该拒绝超出范围的值",
        code: `test('应该拒绝超出范围的值', () => {\n  expect(() => validateRange(101, 0, 100)).toThrow();\n});`,
      },
    ]
  }

  private generateConcurrencyTests(request: BoundaryConditionRequest): TestCase[] {
    return [
      {
        name: "测试并发访问",
        input: "多个并发请求",
        expectedBehavior: "应该正确处理并发访问",
        code: `test('应该处理并发访问', async () => {\n  const promises = Array(5).fill(0).map(() => \n    concurrencyController.withLock('test', async () => {\n      await new Promise(resolve => setTimeout(resolve, 10));\n      return 'success';\n    })\n  );\n  const results = await Promise.all(promises);\n  expect(results).toEqual(Array(5).fill('success'));\n});`,
      },
    ]
  }

  private generateResourceLimitTests(request: BoundaryConditionRequest): TestCase[] {
    return [
      {
        name: "测试内存限制",
        input: "超大内存请求",
        expectedBehavior: "应该拒绝超过限制的内存分配",
        code: `test('应该拒绝超大内存请求', () => {\n  expect(() => resourceMonitor.checkMemory(2 * 1024 ** 3)).toThrow('内存使用将超过限制');\n});`,
      },
    ]
  }

  // 生成文档
  private generateDocumentation(
    request: BoundaryConditionRequest,
    handlers: HandledCondition[],
    tests: TestCase[],
  ): string {
    let doc = `# 边界条件处理文档\n\n`
    doc += `## 功能: ${request.functionality}\n\n`

    doc += `## 处理的边界条件\n\n`
    handlers.forEach((handler, index) => {
      doc += `### ${index + 1}. ${handler.condition}\n`
      doc += `**处理方式**: ${handler.handling}\n\n`
    })

    doc += `## 测试用例\n\n`
    tests.forEach((test, index) => {
      doc += `### ${index + 1}. ${test.name}\n`
      doc += `- **输入**: ${test.input}\n`
      doc += `- **预期行为**: ${test.expectedBehavior}\n\n`
    })

    doc += `## 使用建议\n\n`
    doc += `1. 在所有公共API入口使用输入验证\n`
    doc += `2. 对数值型参数进行范围检查\n`
    doc += `3. 在高并发场景使用并发控制\n`
    doc += `4. 监控资源使用情况避免超限\n`
    doc += `5. 为所有边界条件编写测试用例\n`

    return doc
  }

  private toCamelCase(str: string): string {
    return str.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^[A-Z]/, (chr) => chr.toLowerCase())
  }
}

export const boundaryConditionHandler = new BoundaryConditionHandler()
