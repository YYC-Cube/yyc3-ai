// 智能文档生成系统 - 自动生成API文档、用户手册和技术文档
export interface APIDocumentation {
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  description: string
  parameters: APIParameter[]
  requestBody?: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
  responses: {
    [statusCode: string]: {
      description: string
      schema?: any
      example?: any
    }
  }
  examples: APIExample[]
  tags: string[]
}

export interface APIParameter {
  name: string
  in: "path" | "query" | "header" | "cookie"
  description: string
  required: boolean
  schema: {
    type: string
    format?: string
    enum?: any[]
    default?: any
  }
}

export interface APIExample {
  title: string
  request: {
    headers?: Record<string, string>
    body?: any
  }
  response: {
    status: number
    body: any
  }
}

export interface ComponentDocumentation {
  name: string
  description: string
  props: ComponentProp[]
  methods: ComponentMethod[]
  events: ComponentEvent[]
  examples: ComponentExample[]
  dependencies: string[]
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  default?: any
  description: string
}

export interface ComponentMethod {
  name: string
  description: string
  parameters: { name: string; type: string; description: string }[]
  returns: { type: string; description: string }
}

export interface ComponentEvent {
  name: string
  description: string
  payload: { type: string; description: string }
}

export interface ComponentExample {
  title: string
  code: string
  description: string
}

class DocumentationGenerator {
  private apiDocs: Map<string, APIDocumentation> = new Map()
  private componentDocs: Map<string, ComponentDocumentation> = new Map()

  // 从代码分析生成API文档
  generateAPIDocumentation(code: string, filePath: string): APIDocumentation | null {
    // 检测是否是API路由文件
    if (!this.isAPIRouteFile(filePath)) {
      return null
    }

    const endpoint = this.extractEndpoint(filePath)
    const methods = this.extractHTTPMethods(code)
    const description = this.extractDescription(code)

    if (methods.length === 0) return null

    const doc: APIDocumentation = {
      endpoint,
      method: methods[0] as APIDocumentation["method"],
      description,
      parameters: this.extractParameters(code),
      responses: this.extractResponses(code),
      examples: this.generateAPIExamples(endpoint, methods[0]),
      tags: this.extractTags(filePath),
    }

    this.apiDocs.set(endpoint, doc)
    return doc
  }

  // 从代码分析生成组件文档
  generateComponentDocumentation(code: string, filePath: string): ComponentDocumentation | null {
    // 检测是否是组件文件
    if (!this.isComponentFile(filePath)) {
      return null
    }

    const componentName = this.extractComponentName(code, filePath)
    if (!componentName) return null

    const doc: ComponentDocumentation = {
      name: componentName,
      description: this.extractDescription(code),
      props: this.extractProps(code),
      methods: this.extractMethods(code),
      events: this.extractEvents(code),
      examples: this.generateComponentExamples(code, componentName),
      dependencies: this.extractDependencies(code),
    }

    this.componentDocs.set(componentName, doc)
    return doc
  }

  // 生成Markdown格式的API文档
  generateAPIMarkdown(): string {
    let markdown = "# API 文档\n\n"
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`

    const groupedDocs = this.groupAPIsByTags()

    for (const [tag, docs] of Object.entries(groupedDocs)) {
      markdown += `## ${tag}\n\n`

      docs.forEach((doc) => {
        markdown += `### ${doc.method} ${doc.endpoint}\n\n`
        markdown += `${doc.description}\n\n`

        if (doc.parameters.length > 0) {
          markdown += "#### 请求参数\n\n"
          markdown += "| 参数名 | 位置 | 类型 | 必填 | 说明 |\n"
          markdown += "|--------|------|------|------|------|\n"

          doc.parameters.forEach((param) => {
            markdown += `| ${param.name} | ${param.in} | ${param.schema.type} | ${param.required ? "是" : "否"} | ${param.description} |\n`
          })

          markdown += "\n"
        }

        if (doc.requestBody) {
          markdown += "#### 请求体\n\n"
          markdown += "```json\n"
          markdown += JSON.stringify(doc.requestBody.properties, null, 2)
          markdown += "\n```\n\n"
        }

        markdown += "#### 响应\n\n"
        for (const [status, response] of Object.entries(doc.responses)) {
          markdown += `**${status}** - ${response.description}\n\n`

          if (response.example) {
            markdown += "```json\n"
            markdown += JSON.stringify(response.example, null, 2)
            markdown += "\n```\n\n"
          }
        }

        if (doc.examples.length > 0) {
          markdown += "#### 示例\n\n"

          doc.examples.forEach((example) => {
            markdown += `**${example.title}**\n\n`
            markdown += "请求:\n```bash\n"
            markdown += `curl -X ${doc.method} ${doc.endpoint}\n`

            if (example.request.body) {
              markdown += `  -H "Content-Type: application/json"\n`
              markdown += `  -d '${JSON.stringify(example.request.body)}'\n`
            }

            markdown += "```\n\n"

            markdown += "响应:\n```json\n"
            markdown += JSON.stringify(example.response.body, null, 2)
            markdown += "\n```\n\n"
          })
        }

        markdown += "---\n\n"
      })
    }

    return markdown
  }

  // 生成Markdown格式的组件文档
  generateComponentMarkdown(): string {
    let markdown = "# 组件文档\n\n"
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`

    this.componentDocs.forEach((doc) => {
      markdown += `## ${doc.name}\n\n`
      markdown += `${doc.description}\n\n`

      if (doc.props.length > 0) {
        markdown += "### Props\n\n"
        markdown += "| 属性名 | 类型 | 必填 | 默认值 | 说明 |\n"
        markdown += "|--------|------|------|--------|------|\n"

        doc.props.forEach((prop) => {
          markdown += `| ${prop.name} | ${prop.type} | ${prop.required ? "是" : "否"} | ${prop.default !== undefined ? `\`${prop.default}\`` : "-"} | ${prop.description} |\n`
        })

        markdown += "\n"
      }

      if (doc.methods.length > 0) {
        markdown += "### 方法\n\n"

        doc.methods.forEach((method) => {
          markdown += `#### ${method.name}\n\n`
          markdown += `${method.description}\n\n`

          if (method.parameters.length > 0) {
            markdown += "参数:\n"
            method.parameters.forEach((param) => {
              markdown += `- \`${param.name}\` (${param.type}): ${param.description}\n`
            })
            markdown += "\n"
          }

          markdown += `返回: \`${method.returns.type}\` - ${method.returns.description}\n\n`
        })
      }

      if (doc.events.length > 0) {
        markdown += "### 事件\n\n"

        doc.events.forEach((event) => {
          markdown += `#### ${event.name}\n\n`
          markdown += `${event.description}\n\n`
          markdown += `负载类型: \`${event.payload.type}\`\n\n`
        })
      }

      if (doc.examples.length > 0) {
        markdown += "### 示例\n\n"

        doc.examples.forEach((example) => {
          markdown += `#### ${example.title}\n\n`
          markdown += `${example.description}\n\n`
          markdown += "```tsx\n"
          markdown += example.code
          markdown += "\n```\n\n"
        })
      }

      markdown += "---\n\n"
    })

    return markdown
  }

  // 辅助方法
  private isAPIRouteFile(filePath: string): boolean {
    return filePath.includes("/api/") || filePath.includes("/routes/")
  }

  private isComponentFile(filePath: string): boolean {
    return (
      (filePath.includes("/components/") || filePath.includes("/src/")) &&
      (filePath.endsWith(".tsx") || filePath.endsWith(".jsx"))
    )
  }

  private extractEndpoint(filePath: string): string {
    const apiIndex = filePath.indexOf("/api/")
    if (apiIndex === -1) return "/unknown"

    const endpoint = filePath.substring(apiIndex + 4).replace(/\.(ts|js|tsx|jsx)$/, "")
    return `/api/${endpoint}`
  }

  private extractHTTPMethods(code: string): string[] {
    const methods: string[] = []
    const methodRegex = /export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/g

    let match
    while ((match = methodRegex.exec(code)) !== null) {
      methods.push(match[1])
    }

    return methods
  }

  private extractDescription(code: string): string {
    // 提取JSDoc注释中的描述
    const docRegex = /\/\*\*\s*\n\s*\*\s*(.*?)\n/
    const match = code.match(docRegex)

    return match ? match[1].trim() : "暂无描述"
  }

  private extractParameters(code: string): APIParameter[] {
    const parameters: APIParameter[] = []

    // 简单的参数提取逻辑
    const paramRegex = /@param\s+\{(\w+)\}\s+(\w+)\s+-\s+(.*)/g
    let match

    while ((match = paramRegex.exec(code)) !== null) {
      parameters.push({
        name: match[2],
        in: "query",
        description: match[3],
        required: false,
        schema: { type: match[1] },
      })
    }

    return parameters
  }

  private extractResponses(code: string): APIDocumentation["responses"] {
    return {
      "200": {
        description: "成功",
        example: { success: true, data: {} },
      },
      "400": {
        description: "请求参数错误",
        example: { error: "Invalid parameters" },
      },
      "500": {
        description: "服务器内部错误",
        example: { error: "Internal server error" },
      },
    }
  }

  private extractTags(filePath: string): string[] {
    const parts = filePath.split("/")
    const apiIndex = parts.indexOf("api")

    if (apiIndex !== -1 && apiIndex + 1 < parts.length) {
      return [parts[apiIndex + 1]]
    }

    return ["通用"]
  }

  private generateAPIExamples(endpoint: string, method: string): APIExample[] {
    return [
      {
        title: "基本示例",
        request: {
          headers: { "Content-Type": "application/json" },
          body: { key: "value" },
        },
        response: {
          status: 200,
          body: { success: true, data: {} },
        },
      },
    ]
  }

  private extractComponentName(code: string, filePath: string): string | null {
    // 从export default提取
    const exportMatch = code.match(/export\s+default\s+(?:function\s+)?(\w+)/)
    if (exportMatch) return exportMatch[1]

    // 从文件名提取
    const fileName = filePath
      .split("/")
      .pop()
      ?.replace(/\.(tsx|jsx)$/, "")
    return fileName || null
  }

  private extractProps(code: string): ComponentProp[] {
    const props: ComponentProp[] = []

    // 提取interface定义的props
    const interfaceRegex = /interface\s+\w+Props\s*\{([^}]+)\}/
    const match = code.match(interfaceRegex)

    if (match) {
      const propsString = match[1]
      const propRegex = /(\w+)(\?)?\s*:\s*([^;\n]+)/g

      let propMatch
      while ((propMatch = propRegex.exec(propsString)) !== null) {
        props.push({
          name: propMatch[1],
          type: propMatch[3].trim(),
          required: !propMatch[2],
          description: "",
        })
      }
    }

    return props
  }

  private extractMethods(code: string): ComponentMethod[] {
    return []
  }

  private extractEvents(code: string): ComponentEvent[] {
    return []
  }

  private generateComponentExamples(code: string, componentName: string): ComponentExample[] {
    return [
      {
        title: "基本用法",
        code: `<${componentName} />`,
        description: `${componentName}的基本使用示例`,
      },
    ]
  }

  private extractDependencies(code: string): string[] {
    const deps: string[] = []
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g

    let match
    while ((match = importRegex.exec(code)) !== null) {
      deps.push(match[1])
    }

    return deps
  }

  private groupAPIsByTags(): Record<string, APIDocumentation[]> {
    const grouped: Record<string, APIDocumentation[]> = {}

    this.apiDocs.forEach((doc) => {
      doc.tags.forEach((tag) => {
        if (!grouped[tag]) {
          grouped[tag] = []
        }
        grouped[tag].push(doc)
      })
    })

    return grouped
  }

  // 公共方法
  getAllAPIDocumentation(): APIDocumentation[] {
    return Array.from(this.apiDocs.values())
  }

  getAllComponentDocumentation(): ComponentDocumentation[] {
    return Array.from(this.componentDocs.values())
  }

  exportDocumentation(format: "markdown" | "json" | "html"): string {
    switch (format) {
      case "markdown":
        return this.generateAPIMarkdown() + "\n\n" + this.generateComponentMarkdown()
      case "json":
        return JSON.stringify(
          {
            api: this.getAllAPIDocumentation(),
            components: this.getAllComponentDocumentation(),
          },
          null,
          2,
        )
      case "html":
        return this.generateHTMLDocumentation()
      default:
        return ""
    }
  }

  private generateHTMLDocumentation(): string {
    const markdown = this.generateAPIMarkdown() + "\n\n" + this.generateComponentMarkdown()

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>API & 组件文档</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f5f5f5; }
    h1, h2, h3 { color: #333; }
    hr { border: none; border-top: 1px solid #ddd; margin: 40px 0; }
  </style>
</head>
<body>
  <pre>${markdown}</pre>
</body>
</html>
`
  }
}

export const docGenerator = new DocumentationGenerator()
