# AI 智能编程助手

一个现代化的 AI 驱动的编程助手平台,集成多个 AI 模型,提供代码编写、审查、性能监控等全方位功能。

## ✨ 特性

- 🤖 **多模型支持**: GPT-4, Claude, Gemini, DeepSeek 等 11+ AI 模型
- 💻 **代码工作台**: 实时编辑和预览代码
- 🔍 **智能审查**: 自动检测代码问题并提供修复建议
- 📊 **性能监控**: 实时监控应用性能指标
- 📚 **学习中心**: 个性化学习路径规划
- 💬 **浮动聊天**: 可拖拽、可调整大小的聊天窗口
- 🎨 **现代 UI**: 响应式设计,支持深色模式
- 🚀 **一键部署**: 快速部署到 GitHub

## 🚀 快速开始

### 安装

\`\`\`bash
# 克隆仓库
git clone https://github.com/your-username/ai-coding-assistant.git

# 进入目录
cd ai-coding-assistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev
\`\`\`

访问 http://localhost:3000 查看应用。

### 环境变量

创建 `.env.local` 文件:

\`\`\`env
# AI 模型 API 密钥
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
\`\`\`

## 📖 文档

- [架构文档](docs/ARCHITECTURE.md)
- [开发指南](docs/DEVELOPMENT.md)
- [用户指南](docs/USER_GUIDE.md)

## 🛠️ 技术栈

- **框架**: Next.js 15
- **UI**: React 19, Tailwind CSS
- **图标**: Lucide React
- **字体**: Inter (Google Fonts)
- **部署**: Vercel

## 📦 项目结构

\`\`\`
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 首页
│   └── globals.css       # 全局样式
├── components/            # React 组件
│   ├── MainWorkspace.tsx # 主工作台
│   ├── AIAssistantUI.jsx # AI 对话界面
│   ├── FloatingChat.tsx  # 浮动聊天
│   └── ...               # 其他组件
├── docs/                  # 文档
│   ├── ARCHITECTURE.md   # 架构文档
│   ├── DEVELOPMENT.md    # 开发指南
│   └── USER_GUIDE.md     # 用户指南
└── public/               # 静态资源
\`\`\`

## 🎯 核心功能

### 1. AI 对话
- 支持 11+ AI 模型
- 实时对话交互
- 消息历史记录
- 语音输入和表情支持

### 2. 代码工作台
- 多语言支持
- 语法高亮
- 实时预览
- 代码导出

### 3. 智能编程
- AI 辅助编程
- 代码补全
- 智能建议

### 4. 代码审查
- 自动检测问题
- 修复建议
- 代码质量评分

### 5. 性能监控
- 实时性能指标
- 资源使用分析
- 优化建议

## 🤝 贡献

欢迎贡献!请查看 [开发指南](docs/DEVELOPMENT.md) 了解如何参与项目。

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有贡献者和开源社区的支持。

## 📞 联系方式

- GitHub: https://github.com/your-username
- Email: support@example.com
