# AI 智能编程助手 - 架构文档

## 项目概述

AI 智能编程助手是一个现代化的 Web 应用,集成了多个 AI 模型,提供代码编写、审查、性能监控等功能。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI 库**: React 19
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **图标**: Lucide React
- **字体**: Inter (Google Fonts)

## 核心功能模块

### 1. AI 对话 (AIAssistantUI)
- 支持多模型切换(GPT-4, Claude, Gemini等)
- 实时对话交互
- 消息历史记录
- 浮动聊天窗口

### 2. 代码工作台 (WorkspaceLayout)
- 代码编辑器
- 实时预览
- 语法高亮
- 多语言支持

### 3. 智能编程 (IntegratedWorkspace)
- AI 辅助编程
- 代码补全
- 智能建议

### 4. 项目管理 (ProjectManager)
- 项目创建与管理
- 文件树结构
- 版本控制集成

### 5. 代码审查 (EnhancedCodeReviewPanel)
- 自动代码审查
- 问题检测
- 修复建议

### 6. 性能监控 (PerformanceMonitorPanel)
- 实时性能指标
- 资源使用监控
- 性能优化建议

### 7. 学习中心 (LearningPathPlanner)
- 学习路径规划
- 课程推荐
- 进度跟踪

### 8. 提示词库 (PromptTemplateManager)
- 提示词模板管理
- 分类与搜索
- 自定义模板

## 组件架构

\`\`\`
app/
├── layout.tsx          # 根布局
├── page.tsx           # 首页入口
└── globals.css        # 全局样式

components/
├── MainWorkspace.tsx           # 主工作台(标签页管理)
├── AIAssistantUI.jsx          # AI 对话界面
├── FloatingChat.tsx           # 浮动聊天窗口
├── Composer.jsx               # 消息输入框
├── Message.jsx                # 消息组件
├── Sidebar.jsx                # 侧边栏
├── Header.jsx                 # 头部导航
├── WorkspaceLayout.tsx        # 代码工作台
├── IntegratedWorkspace.tsx    # 智能编程
├── ProjectManager.tsx         # 项目管理
├── EnhancedCodeReviewPanel.tsx # 代码审查
├── PerformanceMonitorPanel.tsx # 性能监控
├── LearningPathPlanner.tsx    # 学习中心
└── PromptTemplateManager.tsx  # 提示词库
\`\`\`

## 数据流

1. **用户输入** → Composer → AIAssistantUI → AI 模型
2. **AI 响应** → AIAssistantUI → Message 组件 → 用户界面
3. **代码编辑** → WorkspaceLayout → 实时预览
4. **代码审查** → EnhancedCodeReviewPanel → 问题列表 → 修复建议

## 状态管理

- 使用 React Hooks (useState, useEffect, useRef)
- 自定义 Context (LocaleContext)
- 组件间通信使用自定义事件

## 样式系统

- Tailwind CSS 实用类
- 深色模式支持
- 响应式设计
- 统一的设计令牌

## 部署

- 支持 Vercel 一键部署
- GitHub 集成
- 环境变量配置

## 未来规划

1. **多语言支持**: 完善国际化
2. **插件系统**: 支持第三方插件
3. **协作功能**: 多人实时协作
4. **云端同步**: 数据云端存储
5. **移动端适配**: 响应式优化
