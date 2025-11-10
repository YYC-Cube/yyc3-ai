// 深度代码理解引擎 - 多语言语法分析、代码结构理解、依赖分析
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"

export interface CodeUnderstanding {
  language: string
  structure: CodeStructure
  dependencies: DependencyGraph
  patterns: CodePattern[]
  complexity: ComplexityMetrics
  bestPractices: BestPracticeCheck[]
  semanticAnalysis: SemanticAnalysis
}

export interface CodeStructure {
  functions: FunctionInfo[]
  classes: ClassInfo[]
  imports: ImportInfo[]
  exports: ExportInfo[]
  variables: VariableInfo[]
  constants: ConstantInfo[]
}

export interface FunctionInfo {
  name: string
  params: string[]
  returnType?: string
  isAsync: boolean
  isArrow: boolean
  loc: { start: number; end: number }
  complexity: number
  calls: string[]
}

export interface ClassInfo {
  name: string
  extends?: string
  implements: string[]
  methods: FunctionInfo[]
  properties: string[]
  loc: { start: number; end: number }
}

export interface ImportInfo {
  source: string
  imports: Array<{ name: string; alias?: string }>
  isDefault: boolean
  isDynamic: boolean
}

export interface ExportInfo {
  name: string
  isDefault: boolean
  type: "function" | "class" | "variable" | "const"
}

export interface VariableInfo {
  name: string
  type: "let" | "var" | "const"
  scope: "global" | "function" | "block"
  reassigned: boolean
}

export interface ConstantInfo {
  name: string
  value: any
  type: string
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
  cycles: string[][]
  depth: number
}

export interface DependencyNode {
  id: string
  name: string
  type: "internal" | "external" | "builtin"
  path?: string
}

export interface DependencyEdge {
  from: string
  to: string
  type: "import" | "require" | "dynamic"
}

export interface CodePattern {
  name: string
  description: string
  category: "design" | "architecture" | "idiom"
  confidence: number
  loc: { start: number; end: number }
}

export interface ComplexityMetrics {
  cyclomatic: number
  cognitive: number
  halstead: HalsteadMetrics
  maintainabilityIndex: number
  linesOfCode: {
    total: number
    source: number
    comments: number
    blank: number
  }
}

export interface HalsteadMetrics {
  operators: number
  operands: number
  distinctOperators: number
  distinctOperands: number
  vocabulary: number
  length: number
  volume: number
  difficulty: number
  effort: number
  time: number
  bugs: number
}

export interface BestPracticeCheck {
  rule: string
  passed: boolean
  message: string
  severity: "error" | "warning" | "info"
  line?: number
  suggestion?: string
}

export interface SemanticAnalysis {
  intent: string
  domain: string
  concepts: string[]
  dataFlow: DataFlowNode[]
  controlFlow: ControlFlowNode[]
}

export interface DataFlowNode {
  variable: string
  operations: Array<{ type: "read" | "write" | "modify"; line: number }>
  scope: string
}

export interface ControlFlowNode {
  type: "if" | "loop" | "switch" | "try" | "function"
  condition?: string
  branches: number
  loc: { start: number; end: number }
}

export class DeepCodeUnderstanding {
  // 主分析入口
  async analyze(code: string, language: string): Promise<CodeUnderstanding> {
    const structure = await this.analyzeStructure(code, language)
    const dependencies = await this.analyzeDependencies(code, structure)
    const patterns = await this.detectPatterns(code, structure)
    const complexity = this.calculateComplexity(code, structure)
    const bestPractices = this.checkBestPractices(code, language, structure)
    const semanticAnalysis = await this.performSemanticAnalysis(code, structure)

    return {
      language,
      structure,
      dependencies,
      patterns,
      complexity,
      bestPractices,
      semanticAnalysis,
    }
  }

  // 分析代码结构
  private async analyzeStructure(code: string, language: string): Promise<CodeStructure> {
    if (language === "javascript" || language === "typescript" || language === "react") {
      return this.parseJavaScript(code)
    }

    // 默认结构
    return {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      variables: [],
      constants: [],
    }
  }

  // 解析 JavaScript/TypeScript
  private parseJavaScript(code: string): CodeStructure {
    const structure: CodeStructure = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      variables: [],
      constants: [],
    }

    try {
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      })

      traverse(ast, {
        FunctionDeclaration: (path: any) => {
          const node = path.node
          structure.functions.push({
            name: node.id?.name || "anonymous",
            params: node.params.map((p: any) => p.name || p.type),
            isAsync: node.async || false,
            isArrow: false,
            loc: { start: node.loc?.start.line || 0, end: node.loc?.end.line || 0 },
            complexity: this.calculateFunctionComplexity(path),
            calls: this.extractFunctionCalls(path),
          })
        },
        ArrowFunctionExpression: (path: any) => {
          const node = path.node
          const parent = path.parent

          let name = "anonymous"
          if (parent.type === "VariableDeclarator" && parent.id) {
            name = parent.id.name
          }

          structure.functions.push({
            name,
            params: node.params.map((p: any) => p.name || p.type),
            isAsync: node.async || false,
            isArrow: true,
            loc: { start: node.loc?.start.line || 0, end: node.loc?.end.line || 0 },
            complexity: this.calculateFunctionComplexity(path),
            calls: this.extractFunctionCalls(path),
          })
        },
        ClassDeclaration: (path: any) => {
          const node = path.node
          const methods: FunctionInfo[] = []

          path.traverse({
            ClassMethod: (methodPath: any) => {
              const method = methodPath.node
              methods.push({
                name: method.key.name || "anonymous",
                params: method.params.map((p: any) => p.name || p.type),
                isAsync: method.async || false,
                isArrow: false,
                loc: { start: method.loc?.start.line || 0, end: method.loc?.end.line || 0 },
                complexity: this.calculateFunctionComplexity(methodPath),
                calls: this.extractFunctionCalls(methodPath),
              })
            },
          })

          structure.classes.push({
            name: node.id?.name || "anonymous",
            extends: node.superClass?.name,
            implements: node.implements?.map((i: any) => i.id.name) || [],
            methods,
            properties: [],
            loc: { start: node.loc?.start.line || 0, end: node.loc?.end.line || 0 },
          })
        },
        ImportDeclaration: (path: any) => {
          const node = path.node
          structure.imports.push({
            source: node.source.value,
            imports: node.specifiers.map((s: any) => ({
              name: s.local.name,
              alias: s.imported?.name !== s.local.name ? s.imported?.name : undefined,
            })),
            isDefault: node.specifiers.some((s: any) => s.type === "ImportDefaultSpecifier"),
            isDynamic: false,
          })
        },
        ExportNamedDeclaration: (path: any) => {
          const node = path.node
          if (node.declaration) {
            const decl = node.declaration
            if (decl.type === "FunctionDeclaration" || decl.type === "ClassDeclaration") {
              structure.exports.push({
                name: decl.id?.name || "anonymous",
                isDefault: false,
                type: decl.type === "FunctionDeclaration" ? "function" : "class",
              })
            }
          }
        },
        VariableDeclaration: (path: any) => {
          const node = path.node
          node.declarations.forEach((decl: any) => {
            if (decl.id.name) {
              if (node.kind === "const") {
                structure.constants.push({
                  name: decl.id.name,
                  value: this.extractValue(decl.init),
                  type: this.inferType(decl.init),
                })
              } else {
                structure.variables.push({
                  name: decl.id.name,
                  type: node.kind as "let" | "var",
                  scope: this.inferScope(path),
                  reassigned: false,
                })
              }
            }
          })
        },
      })
    } catch (error) {
      console.error("[v0] Failed to parse JavaScript:", error)
    }

    return structure
  }

  // 分析依赖关系
  private async analyzeDependencies(code: string, structure: CodeStructure): Promise<DependencyGraph> {
    const nodes: DependencyNode[] = []
    const edges: DependencyEdge[] = []
    const nodeMap = new Map<string, DependencyNode>()

    // 构建节点
    structure.imports.forEach((imp) => {
      const nodeId = imp.source
      if (!nodeMap.has(nodeId)) {
        const node: DependencyNode = {
          id: nodeId,
          name: imp.source,
          type: this.classifyDependency(imp.source),
          path: imp.source,
        }
        nodes.push(node)
        nodeMap.set(nodeId, node)
      }

      // 添加边
      edges.push({
        from: "main",
        to: nodeId,
        type: imp.isDynamic ? "dynamic" : "import",
      })
    })

    // 检测循环依赖
    const cycles = this.detectCycles(edges)

    // 计算依赖深度
    const depth = this.calculateDependencyDepth(edges)

    return { nodes, edges, cycles, depth }
  }

  // 检测代码模式
  private async detectPatterns(code: string, structure: CodeStructure): Promise<CodePattern[]> {
    const patterns: CodePattern[] = []

    // 检测单例模式
    if (this.isSingletonPattern(code)) {
      patterns.push({
        name: "Singleton",
        description: "使用单例模式确保类只有一个实例",
        category: "design",
        confidence: 0.85,
        loc: { start: 0, end: 0 },
      })
    }

    // 检测工厂模式
    if (this.isFactoryPattern(structure)) {
      patterns.push({
        name: "Factory",
        description: "使用工厂模式创建对象",
        category: "design",
        confidence: 0.8,
        loc: { start: 0, end: 0 },
      })
    }

    // 检测观察者模式
    if (this.isObserverPattern(code)) {
      patterns.push({
        name: "Observer",
        description: "使用观察者模式实现事件订阅",
        category: "design",
        confidence: 0.75,
        loc: { start: 0, end: 0 },
      })
    }

    // 检测 React Hooks 模式
    if (code.includes("useState") || code.includes("useEffect")) {
      patterns.push({
        name: "React Hooks",
        description: "使用 React Hooks 管理状态和副作用",
        category: "idiom",
        confidence: 0.95,
        loc: { start: 0, end: 0 },
      })
    }

    return patterns
  }

  // 计算复杂度
  private calculateComplexity(code: string, structure: CodeStructure): ComplexityMetrics {
    const lines = code.split("\n")
    const sourceLines = lines.filter((l) => l.trim() && !l.trim().startsWith("//"))
    const commentLines = lines.filter((l) => l.trim().startsWith("//") || l.trim().startsWith("/*"))
    const blankLines = lines.filter((l) => !l.trim())

    const cyclomatic = this.calculateCyclomaticComplexity(code)
    const cognitive = this.calculateCognitiveComplexity(code)
    const halstead = this.calculateHalsteadMetrics(code)
    const maintainabilityIndex = this.calculateMaintainabilityIndex(cyclomatic, halstead, sourceLines.length)

    return {
      cyclomatic,
      cognitive,
      halstead,
      maintainabilityIndex,
      linesOfCode: {
        total: lines.length,
        source: sourceLines.length,
        comments: commentLines.length,
        blank: blankLines.length,
      },
    }
  }

  // 检查最佳实践
  private checkBestPractices(code: string, language: string, structure: CodeStructure): BestPracticeCheck[] {
    const checks: BestPracticeCheck[] = []

    // 命名规范
    structure.functions.forEach((func) => {
      if (func.name.length < 3 && func.name !== "go" && func.name !== "run") {
        checks.push({
          rule: "naming-convention",
          passed: false,
          message: `函数名 '${func.name}' 过短,建议使用描述性命名`,
          severity: "warning",
          line: func.loc.start,
          suggestion: "使用清晰描述功能的函数名,如 'getUserData' 而不是 'get'",
        })
      }
    })

    // 函数长度
    structure.functions.forEach((func) => {
      const lines = func.loc.end - func.loc.start
      if (lines > 50) {
        checks.push({
          rule: "function-length",
          passed: false,
          message: `函数 '${func.name}' 过长 (${lines} 行),建议拆分`,
          severity: "warning",
          line: func.loc.start,
          suggestion: "将大函数拆分为多个小函数,每个函数只做一件事",
        })
      }
    })

    // 参数数量
    structure.functions.forEach((func) => {
      if (func.params.length > 5) {
        checks.push({
          rule: "parameter-count",
          passed: false,
          message: `函数 '${func.name}' 参数过多 (${func.params.length} 个)`,
          severity: "warning",
          line: func.loc.start,
          suggestion: "考虑使用对象参数或拆分函数",
        })
      }
    })

    // 错误处理
    structure.functions.forEach((func) => {
      if (func.isAsync) {
        const funcCode = code.substring(func.loc.start, func.loc.end)
        if (!funcCode.includes("try") && !funcCode.includes("catch")) {
          checks.push({
            rule: "error-handling",
            passed: false,
            message: `异步函数 '${func.name}' 缺少错误处理`,
            severity: "error",
            line: func.loc.start,
            suggestion: "添加 try-catch 块处理可能的异常",
          })
        }
      }
    })

    // 注释覆盖率
    const commentRatio =
      structure.functions.filter((f) => {
        const funcCode = code.substring(f.loc.start, f.loc.end)
        return funcCode.includes("//") || funcCode.includes("/*")
      }).length / structure.functions.length

    if (commentRatio < 0.3 && structure.functions.length > 5) {
      checks.push({
        rule: "comment-coverage",
        passed: false,
        message: "代码注释覆盖率低",
        severity: "info",
        suggestion: "为关键函数添加注释说明",
      })
    }

    return checks
  }

  // 语义分析
  private async performSemanticAnalysis(code: string, structure: CodeStructure): Promise<SemanticAnalysis> {
    // 推断代码意图
    const intent = this.inferIntent(code, structure)

    // 识别领域
    const domain = this.identifyDomain(code, structure)

    // 提取概念
    const concepts = this.extractConcepts(code, structure)

    // 数据流分析
    const dataFlow = this.analyzeDataFlow(code, structure)

    // 控制流分析
    const controlFlow = this.analyzeControlFlow(code, structure)

    return { intent, domain, concepts, dataFlow, controlFlow }
  }

  // 辅助方法
  private calculateFunctionComplexity(path: any): number {
    let complexity = 1
    path.traverse({
      IfStatement: () => complexity++,
      SwitchCase: () => complexity++,
      ForStatement: () => complexity++,
      WhileStatement: () => complexity++,
      ConditionalExpression: () => complexity++,
      LogicalExpression: () => complexity++,
    })
    return complexity
  }

  private extractFunctionCalls(path: any): string[] {
    const calls: string[] = []
    path.traverse({
      CallExpression: (callPath: any) => {
        const callee = callPath.node.callee
        if (callee.type === "Identifier") {
          calls.push(callee.name)
        } else if (callee.type === "MemberExpression" && callee.property.type === "Identifier") {
          calls.push(callee.property.name)
        }
      },
    })
    return calls
  }

  private extractValue(node: any): any {
    if (!node) return undefined
    if (node.type === "StringLiteral") return node.value
    if (node.type === "NumericLiteral") return node.value
    if (node.type === "BooleanLiteral") return node.value
    return "complex"
  }

  private inferType(node: any): string {
    if (!node) return "unknown"
    if (node.type === "StringLiteral") return "string"
    if (node.type === "NumericLiteral") return "number"
    if (node.type === "BooleanLiteral") return "boolean"
    if (node.type === "ArrayExpression") return "array"
    if (node.type === "ObjectExpression") return "object"
    if (node.type === "ArrowFunctionExpression") return "function"
    return "unknown"
  }

  private inferScope(path: any): "global" | "function" | "block" {
    if (path.scope.block.type === "Program") return "global"
    if (path.scope.block.type === "BlockStatement") return "block"
    return "function"
  }

  private classifyDependency(source: string): "internal" | "external" | "builtin" {
    if (source.startsWith(".")) return "internal"
    if (["fs", "path", "http", "https", "crypto"].includes(source)) return "builtin"
    return "external"
  }

  private detectCycles(edges: DependencyEdge[]): string[][] {
    // 简化实现：检测直接循环
    const cycles: string[][] = []
    const edgeMap = new Map<string, Set<string>>()

    edges.forEach((edge) => {
      if (!edgeMap.has(edge.from)) {
        edgeMap.set(edge.from, new Set())
      }
      edgeMap.get(edge.from)!.add(edge.to)
    })

    edgeMap.forEach((targets, source) => {
      targets.forEach((target) => {
        const targetEdges = edgeMap.get(target)
        if (targetEdges && targetEdges.has(source)) {
          cycles.push([source, target])
        }
      })
    })

    return cycles
  }

  private calculateDependencyDepth(edges: DependencyEdge[]): number {
    // 简化实现：计算最长依赖链
    let maxDepth = 0
    const visited = new Set<string>()

    const dfs = (node: string, depth: number) => {
      if (visited.has(node)) return
      visited.add(node)
      maxDepth = Math.max(maxDepth, depth)

      edges
        .filter((e) => e.from === node)
        .forEach((e) => {
          dfs(e.to, depth + 1)
        })
    }

    dfs("main", 0)
    return maxDepth
  }

  private isSingletonPattern(code: string): boolean {
    return code.includes("static instance") || code.includes("getInstance")
  }

  private isFactoryPattern(structure: CodeStructure): boolean {
    return structure.functions.some(
      (f) => f.name.toLowerCase().includes("create") || f.name.toLowerCase().includes("factory"),
    )
  }

  private isObserverPattern(code: string): boolean {
    return (
      (code.includes("subscribe") || code.includes("addEventListener")) &&
      (code.includes("notify") || code.includes("emit"))
    )
  }

  private calculateCyclomaticComplexity(code: string): number {
    let complexity = 1
    complexity += (code.match(/if\s*\(/g) || []).length
    complexity += (code.match(/else\s+if\s*\(/g) || []).length
    complexity += (code.match(/\?\s*.*\s*:/g) || []).length
    complexity += (code.match(/for\s*\(/g) || []).length
    complexity += (code.match(/while\s*\(/g) || []).length
    complexity += (code.match(/case\s+/g) || []).length
    complexity += (code.match(/catch\s*\(/g) || []).length
    complexity += (code.match(/&&|\|\|/g) || []).length
    return complexity
  }

  private calculateCognitiveComplexity(code: string): number {
    // 简化实现：认知复杂度考虑嵌套和线性流程
    let complexity = 0
    let nestingLevel = 0
    const lines = code.split("\n")

    lines.forEach((line) => {
      if (line.includes("if") || line.includes("for") || line.includes("while")) {
        complexity += 1 + nestingLevel
        if (line.includes("{")) nestingLevel++
      }
      if (line.includes("}")) nestingLevel = Math.max(0, nestingLevel - 1)
    })

    return complexity
  }

  private calculateHalsteadMetrics(code: string): HalsteadMetrics {
    // 简化实现
    const operators = (code.match(/[+\-*/%=<>!&|^~?:]/g) || []).length
    const operands = (code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []).length
    const distinctOperators = new Set(code.match(/[+\-*/%=<>!&|^~?:]/g) || []).size
    const distinctOperands = new Set(code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []).size

    const vocabulary = distinctOperators + distinctOperands
    const length = operators + operands
    const volume = length * Math.log2(vocabulary || 1)
    const difficulty = (distinctOperators / 2) * (operands / (distinctOperands || 1))
    const effort = difficulty * volume
    const time = effort / 18
    const bugs = volume / 3000

    return {
      operators,
      operands,
      distinctOperators,
      distinctOperands,
      vocabulary,
      length,
      volume,
      difficulty,
      effort,
      time,
      bugs,
    }
  }

  private calculateMaintainabilityIndex(cyclomatic: number, halstead: HalsteadMetrics, loc: number): number {
    // Microsoft's Maintainability Index formula
    const mi = Math.max(
      0,
      ((171 - 5.2 * Math.log(halstead.volume) - 0.23 * cyclomatic - 16.2 * Math.log(loc || 1)) * 100) / 171,
    )
    return Math.round(mi)
  }

  private inferIntent(code: string, structure: CodeStructure): string {
    if (code.includes("fetch") || code.includes("axios")) return "data-fetching"
    if (code.includes("useState") || code.includes("useEffect")) return "ui-component"
    if (code.includes("express") || code.includes("app.listen")) return "api-server"
    if (structure.functions.some((f) => f.name.includes("test") || f.name.includes("spec"))) return "testing"
    return "general-purpose"
  }

  private identifyDomain(code: string, structure: CodeStructure): string {
    if (code.includes("React") || code.includes("Component")) return "frontend"
    if (code.includes("express") || code.includes("koa")) return "backend"
    if (code.includes("mongodb") || code.includes("postgres")) return "database"
    if (code.includes("ml") || code.includes("tensorflow")) return "machine-learning"
    return "general"
  }

  private extractConcepts(code: string, structure: CodeStructure): string[] {
    const concepts: Set<string> = new Set()

    structure.functions.forEach((f) => {
      const words = f.name.split(/(?=[A-Z])/).filter((w) => w.length > 2)
      words.forEach((w) => concepts.add(w.toLowerCase()))
    })

    structure.classes.forEach((c) => {
      concepts.add(c.name.toLowerCase())
    })

    return Array.from(concepts)
  }

  private analyzeDataFlow(code: string, structure: CodeStructure): DataFlowNode[] {
    const dataFlow: DataFlowNode[] = []

    structure.variables.forEach((v) => {
      const operations: Array<{ type: "read" | "write" | "modify"; line: number }> = []
      const lines = code.split("\n")

      lines.forEach((line, index) => {
        if (line.includes(`${v.name} =`)) {
          operations.push({ type: "write", line: index + 1 })
        } else if (line.includes(v.name)) {
          operations.push({ type: "read", line: index + 1 })
        }
      })

      dataFlow.push({
        variable: v.name,
        operations,
        scope: v.scope,
      })
    })

    return dataFlow
  }

  private analyzeControlFlow(code: string, structure: CodeStructure): ControlFlowNode[] {
    const controlFlow: ControlFlowNode[] = []
    const lines = code.split("\n")

    lines.forEach((line, index) => {
      if (line.includes("if")) {
        const branches = line.includes("else") ? 2 : 1
        controlFlow.push({
          type: "if",
          condition: line.match(/if\s*$$(.*?)$$/)?.[1],
          branches,
          loc: { start: index + 1, end: index + 1 },
        })
      }
      if (line.includes("for") || line.includes("while")) {
        controlFlow.push({
          type: "loop",
          branches: 1,
          loc: { start: index + 1, end: index + 1 },
        })
      }
      if (line.includes("switch")) {
        const caseCount = code.substring(code.indexOf("switch", index)).match(/case\s+/g)?.length || 0
        controlFlow.push({
          type: "switch",
          branches: caseCount,
          loc: { start: index + 1, end: index + 1 },
        })
      }
    })

    return controlFlow
  }
}

export const deepCodeUnderstanding = new DeepCodeUnderstanding()
