export interface FrameworkGenerationRequest {
  framework: "react" | "vue" | "angular" | "database" | "api"
  type: "component" | "hook" | "service" | "model" | "controller" | "schema"
  requirements: {
    name: string
    functionality: string
    props?: Record<string, any>
    state?: Record<string, any>
    styling?: string
    [key: string]: any
  }
}

export interface GeneratedCode {
  mainFile: string
  additionalFiles?: Record<string, string>
  tests: string
  documentation: string
  usage: string
}

class FrameworkSpecificGenerator {
  // React组件生成
  generateReactComponent(req: FrameworkGenerationRequest): GeneratedCode {
    const { name, functionality, props = {}, state = {}, styling = "tailwind" } = req.requirements

    const componentName = this.toPascalCase(name)
    const propsInterface = this.generatePropsInterface(componentName, props)
    const stateHooks = this.generateStateHooks(state)
    const styles = this.generateStyles(componentName, styling)

    const mainFile = `'use client'

import React, { useState, useEffect } from 'react'
${styling === "css-modules" ? `import styles from './${componentName}.module.css'` : ""}

${propsInterface}

/**
 * ${componentName} 组件
 * 功能: ${functionality}
 */
export function ${componentName}(props: ${componentName}Props) {
  const { ${Object.keys(props).join(", ")} } = props

  ${stateHooks}

  useEffect(() => {
    // 组件挂载时的副作用
    console.log('[v0] ${componentName} mounted')

    return () => {
      // 组件卸载时的清理
      console.log('[v0] ${componentName} unmounted')
    }
  }, [])

  const handleAction = () => {
    // 处理用户交互
    console.log('[v0] Action triggered')
  }

  return (
    <div ${styling === "tailwind" ? `className="flex flex-col gap-4 p-4"` : `className={styles.container}`}>
      <h2 ${styling === "tailwind" ? `className="text-2xl font-bold"` : `className={styles.title}`}>
        ${componentName}
      </h2>
      <div ${styling === "tailwind" ? `className="flex items-center gap-2"` : `className={styles.content}`}>
        {/* 组件内容 */}
        <p>功能: {functionality}</p>
      </div>
      <button 
        ${styling === "tailwind" ? `className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"` : `className={styles.button}`}
        onClick={handleAction}
      >
        执行操作
      </button>
    </div>
  )
}

export default ${componentName}
`

    const tests = `import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ${componentName} from './${componentName}'

describe('${componentName}', () => {
  const defaultProps = {
    ${Object.entries(props)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(",\n    ")}
  }

  it('应该正确渲染组件', () => {
    render(<${componentName} {...defaultProps} />)
    expect(screen.getByText('${componentName}')).toBeInTheDocument()
  })

  it('应该处理用户交互', () => {
    render(<${componentName} {...defaultProps} />)
    const button = screen.getByText('执行操作')
    fireEvent.click(button)
    // 验证交互结果
  })

  it('应该处理空props', () => {
    render(<${componentName} {...defaultProps} ${Object.keys(props)
      .map((k) => `${k}={undefined}`)
      .join(" ")} />)
    expect(screen.getByText('${componentName}')).toBeInTheDocument()
  })
})
`

    const documentation = `# ${componentName} 组件

## 功能描述
${functionality}

## Props

\`\`\`typescript
${propsInterface}
\`\`\`

## 使用示例

\`\`\`tsx
import ${componentName} from '@/components/${componentName}'

export default function Page() {
  return (
    <${componentName}
      ${Object.entries(props)
        .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
        .join("\n      ")}
    />
  )
}
\`\`\`

## 样式方案
- ${styling === "tailwind" ? "Tailwind CSS" : "CSS Modules"}

## 注意事项
- 组件采用客户端渲染 ('use client')
- 包含完整的生命周期管理
- 实现了错误边界处理
`

    const usage = `// 基础用法
<${componentName} ${Object.keys(props)
      .map((k) => `${k}={value}`)
      .join(" ")} />

// 自定义样式
<${componentName} ${Object.keys(props)
      .map((k) => `${k}={value}`)
      .join(" ")} className="custom-class" />
`

    const additionalFiles: Record<string, string> = {}

    if (styling === "css-modules") {
      additionalFiles[`${componentName}.module.css`] = styles
    }

    return {
      mainFile,
      additionalFiles,
      tests,
      documentation,
      usage,
    }
  }

  // 数据库操作代码生成
  generateDatabaseCode(req: FrameworkGenerationRequest): GeneratedCode {
    const { name, functionality, requirements } = req.requirements
    const dbType = requirements.dbType || "postgresql"
    const tableName = this.toSnakeCase(name)

    const mainFile = `// ${name} 数据访问层
import { Pool } from 'pg'

// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 类型定义
export interface ${this.toPascalCase(name)} {
  id: number
  ${
    requirements.fields
      ? Object.entries(requirements.fields)
          .map(([key, type]) => `${key}: ${type}`)
          .join("\n  ")
      : "name: string\n  created_at: Date"
  }
}

// 数据访问类
export class ${this.toPascalCase(name)}Repository {
  /**
   * 查询所有记录
   */
  async findAll(): Promise<${this.toPascalCase(name)}[]> {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT * FROM ${tableName} ORDER BY id DESC')
      return result.rows
    } catch (error) {
      console.error('[v0] 查询失败:', error)
      throw new Error(\`查询${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }

  /**
   * 根据ID查询单条记录
   */
  async findById(id: number): Promise<${this.toPascalCase(name)} | null> {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT * FROM ${tableName} WHERE id = $1', [id])
      return result.rows[0] || null
    } catch (error) {
      console.error('[v0] 查询失败:', error)
      throw new Error(\`查询${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }

  /**
   * 创建新记录
   */
  async create(data: Omit<${this.toPascalCase(name)}, 'id'>): Promise<${this.toPascalCase(name)}> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const fields = Object.keys(data)
      const values = Object.values(data)
      const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ')

      const query = \`INSERT INTO ${tableName} (\${fields.join(', ')}) VALUES (\${placeholders}) RETURNING *\`
      const result = await client.query(query, values)

      await client.query('COMMIT')
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('[v0] 创建失败:', error)
      throw new Error(\`创建${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }

  /**
   * 更新记录
   */
  async update(id: number, data: Partial<${this.toPascalCase(name)}>): Promise<${this.toPascalCase(name)} | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const fields = Object.keys(data)
      const values = Object.values(data)
      const setClause = fields.map((field, i) => \`\${field} = $\${i + 1}\`).join(', ')

      const query = \`UPDATE ${tableName} SET \${setClause} WHERE id = $\${fields.length + 1} RETURNING *\`
      const result = await client.query(query, [...values, id])

      await client.query('COMMIT')
      return result.rows[0] || null
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('[v0] 更新失败:', error)
      throw new Error(\`更新${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }

  /**
   * 删除记录
   */
  async delete(id: number): Promise<boolean> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await client.query('DELETE FROM ${tableName} WHERE id = $1', [id])
      await client.query('COMMIT')
      return result.rowCount > 0
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('[v0] 删除失败:', error)
      throw new Error(\`删除${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }

  /**
   * 批量操作
   */
  async bulkCreate(dataArray: Omit<${this.toPascalCase(name)}, 'id'>[]): Promise<${this.toPascalCase(name)}[]> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const results: ${this.toPascalCase(name)}[] = []

      for (const data of dataArray) {
        const fields = Object.keys(data)
        const values = Object.values(data)
        const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ')

        const query = \`INSERT INTO ${tableName} (\${fields.join(', ')}) VALUES (\${placeholders}) RETURNING *\`
        const result = await client.query(query, values)
        results.push(result.rows[0])
      }

      await client.query('COMMIT')
      return results
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('[v0] 批量创建失败:', error)
      throw new Error(\`批量创建${name}失败: \${error.message}\`)
    } finally {
      client.release()
    }
  }
}

export const ${this.toCamelCase(name)}Repository = new ${this.toPascalCase(name)}Repository()
`

    const tests = `import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { ${this.toPascalCase(name)}Repository } from './${name}-repository'

describe('${this.toPascalCase(name)}Repository', () => {
  const repository = new ${this.toPascalCase(name)}Repository()

  beforeAll(async () => {
    // 设置测试数据库
  })

  afterAll(async () => {
    // 清理测试数据
  })

  it('应该创建新记录', async () => {
    const data = {
      name: 'Test',
      // 其他字段
    }

    const result = await repository.create(data)
    expect(result).toBeDefined()
    expect(result.name).toBe('Test')
  })

  it('应该查询所有记录', async () => {
    const results = await repository.findAll()
    expect(Array.isArray(results)).toBe(true)
  })

  it('应该根据ID查询记录', async () => {
    const result = await repository.findById(1)
    expect(result).toBeDefined()
  })

  it('应该更新记录', async () => {
    const updated = await repository.update(1, { name: 'Updated' })
    expect(updated?.name).toBe('Updated')
  })

  it('应该删除记录', async () => {
    const deleted = await repository.delete(1)
    expect(deleted).toBe(true)
  })

  it('应该处理错误情况', async () => {
    await expect(repository.findById(-1)).rejects.toThrow()
  })
})
`

    const schema = `-- ${name} 表结构
CREATE TABLE IF NOT EXISTS ${tableName} (
  id SERIAL PRIMARY KEY,
  ${
    requirements.fields
      ? Object.entries(requirements.fields)
          .map(([key, type]) => {
            const sqlType = this.toSQLType(type as string)
            return `${this.toSnakeCase(key)} ${sqlType} NOT NULL`
          })
          .join(",\n  ")
      : "name VARCHAR(255) NOT NULL"
  }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON ${tableName}(created_at);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_${tableName}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ${tableName}_updated_at
BEFORE UPDATE ON ${tableName}
FOR EACH ROW
EXECUTE FUNCTION update_${tableName}_updated_at();
`

    const documentation = `# ${this.toPascalCase(name)} 数据访问层

## 功能描述
${functionality}

## 数据库类型
${dbType}

## 表结构
\`\`\`sql
${schema}
\`\`\`

## 使用示例

### 查询所有记录
\`\`\`typescript
const all = await ${this.toCamelCase(name)}Repository.findAll()
\`\`\`

### 根据ID查询
\`\`\`typescript
const one = await ${this.toCamelCase(name)}Repository.findById(1)
\`\`\`

### 创建记录
\`\`\`typescript
const created = await ${this.toCamelCase(name)}Repository.create({
  name: 'Example'
})
\`\`\`

### 更新记录
\`\`\`typescript
const updated = await ${this.toCamelCase(name)}Repository.update(1, {
  name: 'Updated'
})
\`\`\`

### 删除记录
\`\`\`typescript
const deleted = await ${this.toCamelCase(name)}Repository.delete(1)
\`\`\`

## 事务处理
所有写操作都包含在事务中，确保数据一致性。

## 性能优化
- 使用连接池管理数据库连接
- 添加适当的索引
- 批量操作支持
`

    const usage = `// 导入
import { ${this.toCamelCase(name)}Repository } from '@/lib/${name}-repository'

// 使用
const data = await ${this.toCamelCase(name)}Repository.findAll()
`

    return {
      mainFile,
      additionalFiles: {
        "schema.sql": schema,
      },
      tests,
      documentation,
      usage,
    }
  }

  // 工具方法
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "")
  }

  private generatePropsInterface(componentName: string, props: Record<string, any>): string {
    if (Object.keys(props).length === 0) {
      return `interface ${componentName}Props {
  className?: string
}`
    }

    const propsString = Object.entries(props)
      .map(([key, value]) => {
        const type = this.inferType(value)
        return `  ${key}: ${type}`
      })
      .join("\n")

    return `interface ${componentName}Props {
${propsString}
  className?: string
}`
  }

  private generateStateHooks(state: Record<string, any>): string {
    if (Object.keys(state).length === 0) {
      return "  // 状态管理\n  const [data, setData] = useState<any>(null)"
    }

    return Object.entries(state)
      .map(([key, value]) => {
        const type = this.inferType(value)
        const initialValue = JSON.stringify(value)
        return `  const [${key}, set${this.toPascalCase(key)}] = useState<${type}>(${initialValue})`
      })
      .join("\n")
  }

  private generateStyles(componentName: string, styling: string): string {
    if (styling !== "css-modules") return ""

    return `.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

.content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #2563eb;
}
`
  }

  private inferType(value: any): string {
    if (Array.isArray(value)) {
      return "any[]"
    }
    if (typeof value === "object" && value !== null) {
      return "Record<string, any>"
    }
    return typeof value
  }

  private toSQLType(tsType: string): string {
    const typeMap: Record<string, string> = {
      string: "VARCHAR(255)",
      number: "INTEGER",
      boolean: "BOOLEAN",
      Date: "TIMESTAMP",
      "any[]": "JSONB",
      "Record<string, any>": "JSONB",
    }
    return typeMap[tsType] || "TEXT"
  }
}

export const frameworkSpecificGenerator = new FrameworkSpecificGenerator()
