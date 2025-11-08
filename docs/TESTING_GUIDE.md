# 测试指南

本文档介绍项目的测试策略和最佳实践。

## 测试结构

\`\`\`
tests/
├── unit/              # 单元测试
│   ├── hooks/        # Hook测试
│   ├── lib/          # 工具函数测试
│   └── components/   # 组件测试
├── integration/       # 集成测试
│   └── api/          # API测试
├── e2e/              # 端到端测试
├── jest.config.json  # Jest配置
└── setup.ts          # 测试环境设置
\`\`\`

## 运行测试

### 单元测试
\`\`\`bash
npm run test:unit
\`\`\`

### 集成测试
\`\`\`bash
npm run test:integration
\`\`\`

### 端到端测试
\`\`\`bash
npm run test:e2e
\`\`\`

### 所有测试
\`\`\`bash
npm test
\`\`\`

### 测试覆盖率
\`\`\`bash
npm run test:coverage
\`\`\`

## 编写测试

### 单元测试示例

\`\`\`typescript
import { renderHook } from '@testing-library/react'
import { useAIChat } from '@/hooks/use-ai-chat'

describe('useAIChat', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useAIChat())
    expect(result.current.messages).toEqual([])
  })
})
\`\`\`

### 集成测试示例

\`\`\`typescript
import { POST } from '@/app/api/ai/chat/route'

describe('Chat API', () => {
  it('should handle valid request', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
  })
})
\`\`\`

### E2E测试示例

\`\`\`typescript
import { test, expect } from '@playwright/test'

test('chat workflow', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="input"]', 'Hello')
  await page.click('[data-testid="send"]')
  await expect(page.locator('[data-testid="message"]')).toBeVisible()
})
\`\`\`

## 测试最佳实践

1. 每个功能都应该有对应的测试
2. 测试应该独立且可重复
3. 使用描述性的测试名称
4. Mock外部依赖
5. 保持测试简单和聚焦
6. 定期运行测试套件
7. 维护高测试覆盖率(>70%)

## 持续集成

测试会在以下情况自动运行：
- 每次提交代码
- 创建Pull Request时
- 合并到main分支前

## 调试测试

\`\`\`bash
# 运行特定测试文件
npm test -- path/to/test.ts

# 以watch模式运行
npm test -- --watch

# 生成详细输出
npm test -- --verbose
