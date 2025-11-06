# 开发指南

## 环境要求

- Node.js 18+
- npm 或 yarn
- Git

## 本地开发

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
\`\`\`

## 代码规范

### 组件命名
- 使用 PascalCase: `MyComponent.tsx`
- 文件名与组件名一致

### 样式规范
- 优先使用 Tailwind CSS 实用类
- 避免内联样式
- 使用语义化类名

### 状态管理
- 简单状态使用 useState
- 复杂状态考虑 useReducer
- 跨组件状态使用 Context

### 性能优化
- 使用 React.memo 避免不必要的重渲染
- 使用 useCallback 和 useMemo 优化性能
- 懒加载大型组件

## 调试技巧

### 使用 console.log
\`\`\`javascript
console.log("[v0] 组件渲染:", props)
\`\`\`

### React DevTools
- 安装 React DevTools 浏览器扩展
- 检查组件树和状态

### 网络请求调试
- 使用浏览器开发者工具的 Network 面板
- 检查 API 请求和响应

## 常见问题

### 1. 样式不生效
- 检查 Tailwind CSS 配置
- 确保类名正确
- 清除缓存重新构建

### 2. 组件不更新
- 检查状态更新逻辑
- 确保使用不可变数据更新
- 检查依赖数组

### 3. 性能问题
- 使用 React Profiler 分析
- 检查是否有不必要的重渲染
- 优化大列表渲染

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 测试

\`\`\`bash
# 运行测试
npm test

# 运行测试覆盖率
npm run test:coverage
\`\`\`

## 发布

\`\`\`bash
# 更新版本号
npm version patch|minor|major

# 发布到 npm
npm publish
