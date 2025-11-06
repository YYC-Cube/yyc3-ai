"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Info, Zap, RefreshCw, FileCode, Wand2, History, TrendingUp } from "lucide-react"
import { codeReviewAI, type CodeReviewResult, type CodeIssue, type ReviewHistory } from "@/lib/code-review-ai"
import { useLocale } from "@/contexts/LocaleContext"

interface CodeReviewPanelProps {
  code: string
  language: string
  onApplyFix?: (fixedCode: string) => void
}

export default function CodeReviewPanel({ code, language, onApplyFix }: CodeReviewPanelProps) {
  const { t } = useLocale()
  const [review, setReview] = useState<CodeReviewResult | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<CodeIssue | null>(null)
  const [isApplyingFix, setIsApplyingFix] = useState(false)
  const [reviewHistory, setReviewHistory] = useState<ReviewHistory[]>([])
  const [learningStats, setLearningStats] = useState<{ patternsLearned: number; accuracy: number } | null>(null)

  useEffect(() => {
    if (code.trim()) {
      performReview()
    }
  }, [code, language])

  useEffect(() => {
    loadReviewHistory()
    loadLearningStats()
  }, [])

  const performReview = async () => {
    setIsReviewing(true)
    try {
      const result = await codeReviewAI.reviewCode(code, language)
      setReview(result)
      loadReviewHistory()
    } catch (error) {
      console.error("代码审查失败:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  const handleAutoFixAll = async () => {
    if (!review || !onApplyFix) return

    setIsApplyingFix(true)
    try {
      const { fixedCode, appliedFixes } = await codeReviewAI.autoFixAll(code, review.issues)
      onApplyFix(fixedCode)

      // 重新审查修复后的代码
      setTimeout(() => {
        performReview()
      }, 500)
    } catch (error) {
      console.error("自动修复失败:", error)
    } finally {
      setIsApplyingFix(false)
    }
  }

  const handleApplySingleFix = async (issue: CodeIssue) => {
    if (!onApplyFix) return

    setIsApplyingFix(true)
    try {
      const fixedCode = await codeReviewAI.applySingleFix(code, issue)
      onApplyFix(fixedCode)

      setTimeout(() => {
        performReview()
      }, 500)
    } catch (error) {
      console.error("应用修复失败:", error)
    } finally {
      setIsApplyingFix(false)
    }
  }

  const loadReviewHistory = () => {
    const history = codeReviewAI.getReviewHistory(10)
    setReviewHistory(history)
  }

  const loadLearningStats = async () => {
    try {
      const stats = await codeReviewAI.learnFromHistory()
      setLearningStats(stats)
    } catch (error) {
      console.error("加载学习统计失败:", error)
    }
  }

  const getSeverityColor = (severity: CodeIssue["severity"]) => {
    const colors = {
      critical: "text-red-500 bg-red-50 dark:bg-red-950",
      high: "text-orange-500 bg-orange-50 dark:bg-orange-950",
      medium: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
      low: "text-blue-500 bg-blue-50 dark:bg-blue-950",
      info: "text-zinc-500 bg-zinc-50 dark:bg-zinc-900",
    }
    return colors[severity]
  }

  const getSeverityIcon = (severity: CodeIssue["severity"]) => {
    if (severity === "critical" || severity === "high") return <AlertCircle className="h-4 w-4" />
    if (severity === "info") return <Info className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 75) return "text-blue-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">AI 代码审查</h3>
          {learningStats && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              准确率 {learningStats.accuracy}%
            </Badge>
          )}
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
              自动修复 ({review.fixableIssuesCount})
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={performReview} disabled={isReviewing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isReviewing ? "animate-spin" : ""}`} />
            {isReviewing ? "审查中..." : "重新审查"}
          </Button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto p-4">
        {!review ? (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <FileCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>等待代码审查...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 总分卡片 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-500 mb-1">代码质量评分</h4>
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
                  <div className="text-xs text-zinc-500">{review.issues.length} 个问题</div>
                  {review.autoFixAvailable && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {review.fixableIssuesCount} 个可自动修复
                    </div>
                  )}
                </div>
              </div>
              <Progress value={review.score} className="h-2" />
            </Card>

            {/* 代码指标 */}
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">代码指标</h4>
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
                  <div className="text-zinc-500 mb-1">测试覆盖率</div>
                  <div className="font-medium">{review.metrics.testCoverage}%</div>
                </div>
              </div>
            </Card>

            {/* 标签页 */}
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="issues" className="flex-1">
                  问题 ({review.issues.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex-1">
                  建议 ({review.suggestions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <History className="h-3 w-3 mr-1" />
                  历史
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex-1">
                  总结
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-2 mt-4">
                {review.issues.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>未发现问题</p>
                  </div>
                ) : (
                  review.issues.map((issue) => (
                    <Card key={issue.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded ${getSeverityColor(issue.severity)}`}>
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="font-medium text-sm">{issue.title}</h5>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                行 {issue.line}
                              </Badge>
                              {issue.autoFix && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                                >
                                  <Wand2 className="h-3 w-3 mr-1" />
                                  可修复
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{issue.description}</p>
                          {issue.code && (
                            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded mb-2 overflow-x-auto">
                              <code>{issue.code}</code>
                            </pre>
                          )}
                          {issue.fix && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                建议修复:
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400">{issue.fix}</div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {issue.category}
                              </Badge>
                              {issue.resources.map((resource, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                            {issue.autoFix && onApplyFix && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplySingleFix(issue)}
                                disabled={isApplyingFix}
                                className="text-xs h-7"
                              >
                                <Wand2 className="h-3 w-3 mr-1" />
                                应用修复
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-2 mt-4">
                {review.suggestions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <Zap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>暂无改进建议</p>
                  </div>
                ) : (
                  review.suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{suggestion.title}</h5>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            影响: {suggestion.impact === "high" ? "高" : suggestion.impact === "medium" ? "中" : "低"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            工作量: {suggestion.effort === "high" ? "高" : suggestion.effort === "medium" ? "中" : "低"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">{suggestion.description}</p>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">修改前:</div>
                          <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                            <code>{suggestion.before}</code>
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">修改后:</div>
                          <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                            <code>{suggestion.after}</code>
                          </pre>
                        </div>
                      </div>
                      {onApplyFix && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs bg-transparent"
                          onClick={() => onApplyFix(suggestion.after)}
                        >
                          应用建议
                        </Button>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-2 mt-4">
                {reviewHistory.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>暂无审查历史</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {learningStats && (
                      <Card className="p-3 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-purple-900 dark:text-purple-100">学习统计</div>
                            <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                              已学习 {learningStats.patternsLearned} 种问题模式
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {learningStats.accuracy}%
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">准确率</div>
                          </div>
                        </div>
                      </Card>
                    )}
                    {reviewHistory.map((history) => (
                      <Card key={history.id} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-medium">{history.fileName}</div>
                            <div className="text-xs text-zinc-500">
                              {new Date(history.timestamp).toLocaleString("zh-CN")}
                            </div>
                          </div>
                          <Badge variant={history.result.score >= 75 ? "default" : "destructive"}>
                            {history.result.score}/100
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                          <span>{history.result.issues.length} 个问题</span>
                          <span>{history.result.suggestions.length} 条建议</span>
                          {history.appliedFixes.length > 0 && (
                            <span className="text-green-600 dark:text-green-400">
                              已修复 {history.appliedFixes.length} 个
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <Card className="p-4">
                  <pre className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{review.summary}</pre>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
