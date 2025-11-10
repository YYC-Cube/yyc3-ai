import { unifiedAI } from "./unified-ai-service"

// ==================== 测试用例生成器 ====================

export interface TestGenerationRequest {
  code: string
  language: string
  testFramework: string
  requirements: {
    unitTestCoverage: number // 0-100
    boundaryConditions: string[]
    exceptionScenarios: string[]
    performanceBenchmarks: string[]
  }
}

export interface TestGenerationResult {
  unitTests: string
  integrationTests: string
  performanceTests: string
  coverage: CoverageReport
  documentation: string
}

export interface CoverageReport {
  lines: number
  functions: number
  branches: number
  statements: number
}

export class TestGenerator {
  async generate(request: TestGenerationRequest): Promise<TestGenerationResult> {
    // 第一步：生成单元测试
    const unitTests = await this.generateUnitTests(request)

    // 第二步：生成集成测试
    const integrationTests = await this.generateIntegrationTests(request)

    // 第三步：生成性能测试
    const performanceTests = await this.generatePerformanceTests(request)

    // 第四步：计算覆盖率
    const coverage = this.calculateCoverage(request.code, unitTests)

    // 第五步：生成测试文档
    const documentation = this.generateTestDocumentation(request)

    return {
      unitTests,
      integrationTests,
      performanceTests,
      coverage,
      documentation,
    }
  }

  private async generateUnitTests(request: TestGenerationRequest): Promise<string> {
    const { code, language, testFramework, requirements } = request

    // 提取函数和类
    const functions = this.extractFunctions(code)
    const classes = this.extractClasses(code)

    let testCode = this.generateTestHeader(testFramework, language)

    // 为每个函数生成测试
    for (const func of functions) {
      testCode += await this.generateFunctionTest(func, requirements, testFramework)
    }

    // 为每个类生成测试
    for (const cls of classes) {
      testCode += await this.generateClassTest(cls, requirements, testFramework)
    }

    return testCode
  }

  private generateTestHeader(framework: string, language: string): string {
    switch (framework.toLowerCase()) {
      case "jest":
        return `import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// 测试配置
describe('Code Unit Tests', () => {
  let testContext: any;

  beforeEach(() => {
    testContext = {};
  });

  afterEach(() => {
    testContext = null;
  });

`
      case "mocha":
        return `import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Code Unit Tests', () => {
`
      case "vitest":
        return `import { describe, it, expect, beforeEach } from 'vitest';

describe('Code Unit Tests', () => {
`
      default:
        return `// ${framework} 测试套件\n\n`
    }
  }

  private async generateFunctionTest(
    func: FunctionInfo,
    requirements: TestGenerationRequest["requirements"],
    framework: string,
  ): Promise<string> {
    const prompt = `为以下${func.language}函数生成完整的单元测试:

函数名: ${func.name}
参数: ${func.parameters.join(", ")}
返回类型: ${func.returnType}

测试框架: ${framework}
覆盖率要求: ${requirements.unitTestCoverage}%

请生成以下测试用例:
1. 正常输入测试
2. 边界条件测试: ${requirements.boundaryConditions.join(", ")}
3. 异常场景测试: ${requirements.exceptionScenarios.join(", ")}
4. 类型检查测试
5. 返回值验证测试

每个测试用例必须有清晰的描述和断言。`

    const testCases = await unifiedAI.complete(prompt)

    return `  describe('${func.name}', () => {
${testCases}
  });

`
  }

  private async generateClassTest(
    cls: ClassInfo,
    requirements: TestGenerationRequest["requirements"],
    framework: string,
  ): Promise<string> {
    const prompt = `为以下类生成完整的单元测试:

类名: ${cls.name}
属性: ${cls.properties.join(", ")}
方法: ${cls.methods.join(", ")}

测试框架: ${framework}

请生成以下测试:
1. 构造函数测试
2. 每个公开方法的测试
3. 属性getter/setter测试
4. 边界条件测试
5. 异常处理测试
6. 状态变化测试

确保测试覆盖所有公开API。`

    const testCases = await unifiedAI.complete(prompt)

    return `  describe('${cls.name} Class', () => {
${testCases}
  });

`
  }

  private async generateIntegrationTests(request: TestGenerationRequest): Promise<string> {
    const { code, testFramework } = request

    const prompt = `为以下代码生成集成测试:

${code}

测试框架: ${testFramework}

请生成集成测试,验证:
1. 多个模块协同工作
2. 外部依赖集成
3. 端到端功能流程
4. 数据流转正确性
5. 错误传播和处理

使用mock和stub隔离外部依赖。`

    return await unifiedAI.complete(prompt)
  }

  private async generatePerformanceTests(request: TestGenerationRequest): Promise<string> {
    const { code, requirements, testFramework } = request

    let perfTests = `// 性能测试套件
describe('Performance Tests', () => {
`

    for (const benchmark of requirements.performanceBenchmarks) {
      perfTests += `
  it('should meet ${benchmark}', async () => {
    const startTime = performance.now();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      // 执行被测代码
      await testFunction();
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;

    console.log(\`Average execution time: \${avgTime.toFixed(2)}ms\`);
    expect(avgTime).toBeLessThan(10); // 根据实际需求调整阈值
  });
`
    }

    perfTests += `});

`

    return perfTests
  }

  private calculateCoverage(code: string, tests: string): CoverageReport {
    // 简化的覆盖率计算 (实际应该集成 Istanbul/c8)
    const codeLines = code.split("\n").filter((line) => line.trim() && !line.trim().startsWith("//"))
    const testLines = tests.split("\n").filter((line) => line.includes("it(") || line.includes("test("))

    const functions = this.extractFunctions(code)
    const testedFunctions = testLines.length

    return {
      lines: Math.min(100, (testLines.length / codeLines.length) * 100),
      functions: Math.min(100, (testedFunctions / functions.length) * 100),
      branches: 75, // 简化处理
      statements: 80, // 简化处理
    }
  }

  private generateTestDocumentation(request: TestGenerationRequest): string {
    return `# 测试文档

## 测试框架
${request.testFramework}

## 测试覆盖率目标
${request.requirements.unitTestCoverage}%

## 测试策略

### 单元测试
- 测试所有公开函数和方法
- 覆盖边界条件: ${request.requirements.boundaryConditions.join(", ")}
- 覆盖异常场景: ${request.requirements.exceptionScenarios.join(", ")}

### 集成测试
- 验证模块间协作
- 测试外部依赖集成
- 端到端功能测试

### 性能测试
${request.requirements.performanceBenchmarks.map((b) => `- ${b}`).join("\n")}

## 运行测试

\`\`\`bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage
\`\`\`

## 测试报告
测试完成后会生成详细的覆盖率报告,包括:
- 行覆盖率
- 函数覆盖率
- 分支覆盖率
- 语句覆盖率
`
  }

  private extractFunctions(code: string): FunctionInfo[] {
    const functions: FunctionInfo[] = []
    const functionRegex = /(?:async\s+)?function\s+(\w+)\s*$$([^)]*)$$(?:\s*:\s*([^{]+))?/g

    let match
    while ((match = functionRegex.exec(code)) !== null) {
      functions.push({
        name: match[1],
        parameters: match[2].split(",").map((p) => p.trim()),
        returnType: match[3]?.trim() || "void",
        language: "typescript",
      })
    }

    return functions
  }

  private extractClasses(code: string): ClassInfo[] {
    const classes: ClassInfo[] = []
    const classRegex = /class\s+(\w+)\s*{([^}]*)}/g

    let match
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1]
      const classBody = match[2]

      const properties = this.extractProperties(classBody)
      const methods = this.extractMethods(classBody)

      classes.push({
        name: className,
        properties,
        methods,
      })
    }

    return classes
  }

  private extractProperties(classBody: string): string[] {
    const properties: string[] = []
    const propertyRegex = /(?:public|private|protected)?\s+(\w+)\s*:/g

    let match
    while ((match = propertyRegex.exec(classBody)) !== null) {
      properties.push(match[1])
    }

    return properties
  }

  private extractMethods(classBody: string): string[] {
    const methods: string[] = []
    const methodRegex = /(\w+)\s*$$[^)]*$$\s*(?::\s*[^{]+)?{/g

    let match
    while ((match = methodRegex.exec(classBody)) !== null) {
      methods.push(match[1])
    }

    return methods
  }
}

interface FunctionInfo {
  name: string
  parameters: string[]
  returnType: string
  language: string
}

interface ClassInfo {
  name: string
  properties: string[]
  methods: string[]
}

export const testGenerator = new TestGenerator()
