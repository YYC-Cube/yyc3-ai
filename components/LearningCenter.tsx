"use client"

import { useState, useEffect } from "react"
import { GraduationCap, BookOpen, Trophy, TrendingUp, CheckCircle2, Clock, Award, Share2 } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  category: "ai" | "frontend" | "backend" | "fullstack" | "ml"
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  lessons: Lesson[]
  quizzes: Quiz[]
  completed: boolean
  progress: number
}

interface Lesson {
  id: string
  title: string
  content: string
  codeExample?: string
  videoUrl?: string
  completed: boolean
}

interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface UserProgress {
  coursesCompleted: number
  lessonsCompleted: number
  quizzesPassed: number
  totalPoints: number
  level: number
  badges: Badge[]
  streak: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
}

export default function LearningCenter() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    coursesCompleted: 0,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    totalPoints: 0,
    level: 1,
    badges: [],
    streak: 0,
  })
  const [activeTab, setActiveTab] = useState<"courses" | "progress" | "achievements">("courses")

  useEffect(() => {
    const initialCourses: Course[] = [
      {
        id: "ai-fundamentals",
        title: "生成式AI基础",
        description: "学习大语言模型(LLM)的基本原理和应用",
        category: "ai",
        level: "beginner",
        duration: 120,
        progress: 0,
        completed: false,
        lessons: [
          {
            id: "lesson-1",
            title: "什么是生成式AI",
            content: `生成式AI是一种能够创造新内容的人工智能技术。它可以生成文本、图像、音频等多种形式的内容。

核心概念:
1. 大语言模型(LLM): 如GPT-4、Claude等
2. Transformer架构: 现代AI的基础
3. 提示工程: 如何有效地与AI对话
4. 上下文学习: AI如何理解和生成内容

应用场景:
- 代码生成和辅助编程
- 内容创作和文案写作
- 问答和知识检索
- 数据分析和可视化`,
            codeExample: `// 使用AI API的基本示例
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: '解释什么是生成式AI' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`,
            completed: false,
          },
          {
            id: "lesson-2",
            title: "提示工程基础",
            content: `提示工程是与AI有效沟通的艺术。一个好的提示可以大大提升AI的输出质量。

提示设计原则:
1. 清晰明确: 说明你的具体需求
2. 提供上下文: 给AI足够的背景信息
3. 设定角色: 让AI扮演特定角色
4. 示例引导: 提供期望输出的示例
5. 分步思考: 将复杂任务拆分为步骤

提示模板:
[角色] + [任务] + [要求] + [格式]

例如: "你是一个资深前端工程师。请帮我创建一个响应式导航栏组件,要求支持移动端适配,使用React和Tailwind CSS,代码要包含注释。"`,
            codeExample: `// 高级提示工程示例
const systemPrompt = \`你是一个专业的TypeScript工程师。
任务: 编写类型安全的代码
要求: 
- 使用严格的类型定义
- 添加详细的JSDoc注释
- 处理边界情况
- 遵循最佳实践\`;

const userPrompt = \`创建一个用户管理系统的类型定义,包括:
1. User接口
2. UserRole枚举
3. 用户CRUD操作的类型定义
4. API响应类型\`;

const response = await ai.chat([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
]);`,
            completed: false,
          },
        ],
        quizzes: [
          {
            id: "quiz-1",
            question: "以下哪个不是生成式AI的主要应用场景?",
            options: ["代码生成", "图像识别", "内容创作", "数据加密"],
            correctAnswer: 3,
            explanation: "数据加密不是生成式AI的主要应用场景,它属于传统的密码学领域。",
          },
          {
            id: "quiz-2",
            question: "提示工程的核心原则是什么?",
            options: ["使用复杂的技术术语", "提供清晰明确的指令", "让提示越短越好", "避免给出示例"],
            correctAnswer: 1,
            explanation: "提示工程的核心是提供清晰明确的指令,帮助AI理解你的需求。",
          },
        ],
      },
      {
        id: "llm-models",
        title: "大模型分类与选择",
        description: "深入了解GPT-4、Claude、Gemini等主流大模型的特点和应用场景",
        category: "ai",
        level: "intermediate",
        duration: 90,
        progress: 0,
        completed: false,
        lessons: [
          {
            id: "lesson-1",
            title: "主流大模型对比",
            content: `目前市面上有多种大语言模型,各有特点:

1. GPT-4 (OpenAI)
   - 优势: 综合能力强,代码生成优秀
   - 适用: 通用任务,编程辅助
   - 定价: 高级,按token计费

2. Claude 3 (Anthropic)
   - 优势: 上下文窗口大,安全性好
   - 适用: 长文本处理,内容审核
   - 定价: 中等

3. Gemini Pro (Google)
   - 优势: 多模态能力,集成Google服务
   - 适用: 图像理解,知识检索
   - 定价: 免费层+付费

4. 国内模型
   - 文心一言: 中文理解优秀
   - 通义千问: 阿里生态集成
   - 星火认知: 实时性强

选择建议:
- 代码任务 → GPT-4 / Claude
- 长文本 → Claude
- 中文场景 → 文心一言 / 通义千问
- 成本敏感 → Gemini / 国内模型`,
            completed: false,
          },
        ],
        quizzes: [],
      },
      {
        id: "prompt-engineering",
        title: "高级提示工程",
        description: "掌握高级提示技巧,提升AI输出质量",
        category: "ai",
        level: "advanced",
        duration: 150,
        progress: 0,
        completed: false,
        lessons: [
          {
            id: "lesson-1",
            title: "Chain-of-Thought提示",
            content: `Chain-of-Thought (CoT) 是一种让AI逐步思考的提示技术。

基本原理:
通过引导AI展示推理过程,可以显著提升复杂问题的准确性。

应用示例:

普通提示:
"23 * 47 = ?"

CoT提示:
"计算 23 * 47,请逐步展示计算过程:
步骤1: ...
步骤2: ...
最终答案: ..."

高级技巧:
1. Few-Shot CoT: 提供示例推理过程
2. Zero-Shot CoT: 简单加上"让我们逐步思考"
3. Tree-of-Thought: 探索多条推理路径
4. Self-Consistency: 多次采样选最佳答案`,
            codeExample: `// Chain-of-Thought实现
const cotPrompt = \`问题: \${question}

请按以下格式逐步解答:

**分析:**
[分析问题的关键点]

**步骤:**
1. [第一步]
2. [第二步]
3. [第三步]

**验证:**
[检查答案是否合理]

**最终答案:**
[简洁的最终答案]\`;

const response = await ai.complete(cotPrompt);`,
            completed: false,
          },
        ],
        quizzes: [],
      },
      {
        id: "react-advanced",
        title: "React高级模式",
        description: "学习React性能优化、高阶组件、Hooks等高级特性",
        category: "frontend",
        level: "advanced",
        duration: 180,
        progress: 0,
        completed: false,
        lessons: [
          {
            id: "lesson-1",
            title: "性能优化策略",
            content: `React性能优化的核心策略:

1. 使用React.memo避免不必要的渲染
2. useMemo和useCallback缓存计算结果
3. 虚拟化长列表(react-window)
4. 代码分割和懒加载
5. 合理使用useEffect依赖

最佳实践:
- 避免在render中创建新对象
- 使用key提升列表性能
- 状态提升与下沉的权衡
- Context性能陷阱及解决方案`,
            codeExample: `// React性能优化示例
import { memo, useMemo, useCallback } from 'react';

// 1. 使用memo避免重渲染
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* 复杂渲染 */}</div>;
});

// 2. useMemo缓存计算
function DataList({ items }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);
  
  return <div>{/* 渲染sorted */}</div>;
}

// 3. useCallback缓存函数
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}`,
            completed: false,
          },
        ],
        quizzes: [],
      },
    ]

    setCourses(initialCourses)

    // 加载用户进度
    const savedProgress = localStorage.getItem("yyc3_learning_progress")
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("yyc3_learning_progress", JSON.stringify(userProgress))
  }, [userProgress])

  const completeLesson = (courseId: string, lessonId: string) => {
    const updatedCourses = courses.map((course) => {
      if (course.id === courseId) {
        const updatedLessons = course.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson,
        )
        const progress = (updatedLessons.filter((l) => l.completed).length / updatedLessons.length) * 100
        const completed = progress === 100
        return { ...course, lessons: updatedLessons, progress, completed }
      }
      return course
    })
    setCourses(updatedCourses)

    setUserProgress({
      ...userProgress,
      lessonsCompleted: userProgress.lessonsCompleted + 1,
      totalPoints: userProgress.totalPoints + 10,
    })
  }

  const submitQuiz = (courseId: string, quizId: string, answer: number) => {
    const course = courses.find((c) => c.id === courseId)
    const quiz = course?.quizzes.find((q) => q.id === quizId)
    if (!quiz) return false

    const isCorrect = quiz.correctAnswer === answer
    if (isCorrect) {
      setUserProgress({
        ...userProgress,
        quizzesPassed: userProgress.quizzesPassed + 1,
        totalPoints: userProgress.totalPoints + 20,
      })
    }
    return isCorrect
  }

  const shareCertificate = (courseName: string) => {
    const text = `我在YYC³ AI智能编程助手完成了《${courseName}》课程!🎉`
    if (navigator.share) {
      navigator.share({
        title: "学习成就",
        text: text,
      })
    }
  }

  return (
    <div className="flex h-full gap-4">
      {/* 侧边栏 */}
      <div className="w-64 flex-shrink-0 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">学习中心</span>
          </div>
          <div className="text-xs text-zinc-500">永久免费,持续更新</div>
        </div>

        <div className="flex flex-col gap-1 p-2">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "courses"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            课程
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "progress"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            进度
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === "achievements"
                ? "bg-purple-100 text-purple-900 dark:bg-purple-950"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Trophy className="h-4 w-4" />
            成就
          </button>
        </div>

        {/* 用户统计 */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">学习统计</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">完成课程</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{userProgress.coursesCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">完成课时</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{userProgress.lessonsCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">通过测试</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{userProgress.quizzesPassed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">总积分</span>
              <span className="font-medium text-purple-600">{userProgress.totalPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">连续学习</span>
              <span className="font-medium text-orange-600">{userProgress.streak}天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "courses" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="rounded-lg border border-zinc-200 bg-white p-4 text-left transition-all hover:border-purple-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      course.level === "beginner"
                        ? "bg-green-100 text-green-700"
                        : course.level === "intermediate"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {course.level === "beginner" ? "初级" : course.level === "intermediate" ? "中级" : "高级"}
                  </div>
                  {course.completed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
                <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{course.title}</h3>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.lessons.length}课时
                  </span>
                </div>
                {course.progress > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">进度</span>
                      <span className="font-medium text-purple-600">{Math.round(course.progress)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-purple-600" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">学习进度</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-1 text-2xl font-bold text-purple-600">{userProgress.coursesCompleted}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">完成课程</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-1 text-2xl font-bold text-blue-600">{userProgress.lessonsCompleted}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">完成课时</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-1 text-2xl font-bold text-green-600">{userProgress.quizzesPassed}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">通过测试</div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-1 text-2xl font-bold text-orange-600">{userProgress.totalPoints}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">总积分</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">成就与徽章</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userProgress.badges.map((badge) => (
                <div key={badge.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-2 text-3xl">{badge.icon}</div>
                  <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{badge.name}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 课程详情模态框 */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedCourse.title}</h2>
              <button
                onClick={() => setSelectedCourse(null)}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {selectedCourse.lessons.map((lesson) => (
                <div key={lesson.id} className="mb-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{lesson.title}</h3>
                    {lesson.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <button
                        onClick={() => completeLesson(selectedCourse.id, lesson.id)}
                        className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
                      >
                        标记完成
                      </button>
                    )}
                  </div>
                  <p className="mb-3 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{lesson.content}</p>
                  {lesson.codeExample && (
                    <pre className="rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                      <code>{lesson.codeExample}</code>
                    </pre>
                  )}
                </div>
              ))}

              {selectedCourse.completed && (
                <div className="mt-6 rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center dark:bg-green-950/20">
                  <Award className="mx-auto mb-3 h-12 w-12 text-green-600" />
                  <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-green-100">恭喜完成课程!</h3>
                  <p className="mb-4 text-sm text-green-700 dark:text-green-300">
                    你已掌握《{selectedCourse.title}》的全部内容
                  </p>
                  <button
                    onClick={() => shareCertificate(selectedCourse.title)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    <Share2 className="h-4 w-4" />
                    分享成就
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
