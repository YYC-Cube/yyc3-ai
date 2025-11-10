// components/EnhancedCodeReviewPanel.tsx
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { 
  FileCode, RefreshCw, Wand2, TrendingUp, History, 
  Shield, Zap, Cpu, Package 
} from "lucide-react"

// ... 其余代码保持不变

interface TechStackIssue {
  type: 'compatibility' | 'performance' | 'security' | 'best-practice'
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
  techStack: string[]
  autoFixable: boolean
}

interface EnhancedCodeReview {
  score: number
  issues: TechStackIssue[]
  suggestions: TechStackIssue[]
  metrics: {
    linesOfCode: number
    complexity: number
    maintainability: number
    testCoverage: number
    techStackCoverage: number
  }
  techStackAnalysis: {
    detectedFrameworks: string[]
    recommendedFrameworks: string[]
    compatibilityIssues: string[]
    performanceSuggestions: string[]
  }
  autoFixAvailable: boolean
  fixableIssuesCount: number
}

interface EnhancedCodeReviewPanelProps {
  code: string
  language: string
  onApplyFix: (code: string) => void
  techStack?: string[]
}

export default function EnhancedCodeReviewPanel({ 
  code, 
  language, 
  onApplyFix,
  techStack = [] 
}: EnhancedCodeReviewPanelProps) {
  const [review, setReview] = useState<EnhancedCodeReview | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isApplyingFix, setIsApplyingFix] = useState(false)
  const [learningStats, setLearningStats] = useState({ accuracy: 92 })

  // 模拟代码审查
  const performReview = async () => {
    setIsReviewing(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockReview: EnhancedCodeReview = {
      score: 82,
      issues: [
        {
          type: 'compatibility',
          severity: 'medium',
          message: 'React 18特性使用不完整',
          suggestion: '建议使用useId钩子处理SSR兼容性',
          techStack: ['React'],
          autoFixable: true
        },
        {
          type: 'performance',
          severity: 'high',
          message: '未使用React.memo优化组件',
          suggestion: '对大型组件使用React.memo进行记忆化',
          techStack: ['React', '性能'],
          autoFixable: false
        }
      ],
      suggestions: [
        {
          type: 'best-practice',
          severity: 'low',
          message: '可考虑使用Zustand替代useState管理复杂状态',
          suggestion: '安装并配置Zustand状态管理',
          techStack: ['React', 'Zustand'],
          autoFixable: true
        }
      ],
      metrics: {
        linesOfCode: 247,
        complexity: 12,
        maintainability: 78,
        testCoverage: 65,
        techStackCoverage: 85
      },
      techStackAnalysis: {
        detectedFrameworks: ['React', 'TypeScript', 'Tailwind CSS'],
        recommendedFrameworks: ['React Query', 'Zustand', 'React Hook Form'],
        compatibilityIssues: ['React 17 -> 18 升级建议'],
        performanceSuggestions: ['代码分割', '图片懒加载', 'Bundle分析']
      },
      autoFixAvailable: true,
      fixableIssuesCount: 2
    }
    
    setReview(mockReview)
    setIsReviewing(false)
  }

  const handleAutoFixAll = async () => {
    setIsApplyingFix(true)
    // 模拟自动修复
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsApplyingFix(false)
    // 应用修复后的代码
    onApplyFix('// 自动修复后的代码...')
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  useEffect(() => {
    if (code) {
      performReview()
    }
  }, [code, language])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold bg-blue-500 rounded-md px-0 mx-0 text-background text-sm leading-5 tracking-normal text-center">AI 检索 </h3>
          {learningStats && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              准确率 {learningStats.accuracy}%
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Cpu className="h-3 w-3 mr-1" />
            感知
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {review && review.autoFixAvailable && onApplyFix && (
            <Button
              size="sm"
              variant="default"
              onClick={handleAutoFixAll}
              disabled={isApplyingFix}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Wand2 className={`h-4 w-4 mr-2 ${isApplyingFix ? "animate-spin" : ""}`} />
              智能修复 ({review.fixableIssuesCount})
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={performReview} disabled={isReviewing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isReviewing ? "animate-spin" : ""}`} />
            {isReviewing ? "分析中..." : "重新分析"}
          </Button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {!review ? (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <FileCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>技术栈分析中...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 综合评分卡片 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-500 mb-1">综合质量评分</h4>
                  <div className={`text-4xl font-bold ${getScoreColor(review.score)}`}>
                    {review.score}
                    <span className="text-lg text-zinc-400">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={review.score >= 75 ? "default" : "destructive"} className="mb-2">
                    {review.score >= 90
                      ? "优秀"
                      : review.score >= 75
                        ? "良好"
                        : review.score >= 60
                          ? "及格"
                          : "需要改进"}
                  </Badge>
                  <div className="text-xs text-zinc-500">
                    {review.issues.length} 个问题 · {review.suggestions.length} 个建议
                  </div>
                  {review.autoFixAvailable && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {review.fixableIssuesCount} 个可自动修复
                    </div>
                  )}
                </div>
              </div>
              <Progress value={review.score} className="h-2" />
            </Card>

            {/* 技术栈检测 */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-semibold">技术栈分析</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-500 mb-2">检测到的框架</div>
                  <div className="flex flex-wrap gap-1">
                    {review.techStackAnalysis.detectedFrameworks.map((framework, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-2">推荐集成</div>
                  <div className="flex flex-wrap gap-1">
                    {review.techStackAnalysis.recommendedFrameworks.map((framework, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 代码指标 */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-semibold">代码指标</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-zinc-500 mb-1">代码行数</div>
                  <div className="font-medium">{review.metrics.linesOfCode}</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">圈复杂度</div>
                  <div className="font-medium">{review.metrics.complexity}</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">可维护性</div>
                  <div className="font-medium">{Math.round(review.metrics.maintainability)}/100</div>
                </div>
                <div>
                  <div className="text-zinc-500 mb-1">技术栈覆盖率</div>
                  <div className="font-medium">{review.metrics.techStackCoverage}%</div>
                </div>
              </div>
            </Card>

            {/* 标签页 */}
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="issues" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  问题 ({review.issues.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  建议 ({review.suggestions.length})
                </TabsTrigger>
                <TabsTrigger value="tech" className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  技术栈
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <History className="h-3 w-3" />
                  历史
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-3 mt-4">
                {review.issues.map((issue, index) => (
                  <Card key={index} className="p-3 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity === 'high' ? '高危' : issue.severity === 'medium' ? '中危' : '低危'}
                        </Badge>
                        <span className="font-medium">{issue.message}</span>
                      </div>
                      {issue.autoFixable && (
                        <Wand2 className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      {issue.suggestion}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {issue.techStack.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-3 mt-4">
                {review.suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-3 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          优化建议
                        </Badge>
                        <span className="font-medium">{suggestion.message}</span>
                      </div>
                      {suggestion.autoFixable && (
                        <Wand2 className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {suggestion.suggestion}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suggestion.techStack.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tech" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-2">兼容性问题</h5>
                    {review.techStackAnalysis.compatibilityIssues.map((issue, index) => (
                      <div key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded mb-1">
                        ⚠️ {issue}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">性能优化建议</h5>
                    {review.techStackAnalysis.performanceSuggestions.map((suggestion, index) => (
                      <div key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded mb-1">
                        🚀 {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="text-center text-zinc-500 py-8">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>审查历史记录</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
