"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Code2, GraduationCap, Lightbulb, AlertCircle, TrendingUp } from "lucide-react"
import CodeEditor from "./CodeEditor"
import LivePreview from "./LivePreview"
import { aiIntegrationBridge, type AICodeSuggestion, type CodeAnalysisResult } from "@/lib/ai-integration-bridge"
import { useLocale } from "@/contexts/LocaleContext"

export default function IntegratedWorkspace({
  onCodeChange,
}: { onCodeChange?: (code: string, language: string) => void }) {
  const { t } = useLocale()
  const [code, setCode] = useState(`// 开始编写你的代码
function greet(name) {
  return "Hello, " + name + "!"
}

console.log(greet("World"))`)
  const [language, setLanguage] = useState("javascript")
  const [analysis, setAnalysis] = useState<CodeAnalysisResult | null>(null)
  const [suggestions, setSuggestions] = useState<AICodeSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [learningProgress, setLearningProgress] = useState<any>(null)

  // 实时分析代码
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeCode()
    }, 1000)
    return () => clearTimeout(timer)
  }, [code, language])

  const analyzeCode = async () => {
    setIsAnalyzing(true)
    try {
      const result = await aiIntegrationBridge.analyzeCodeForLearning(code, language)
      setAnalysis(result)

      // 生成改进建议
      const improvements = await aiIntegrationBridge.generateImprovements(code, language, "用户正在编写代码")
      setSuggestions(improvements)
    } catch (error) {
      console.error("代码分析失败:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeCode = async () => {
    try {
      const result = await aiIntegrationBridge.executeAndLearn(code, language)
      setAnalysis(result.analysis)
      setLearningProgress(result.learningProgress)

      // 同步预览
      await aiIntegrationBridge.syncPreviewWithLearning(code, language)
    } catch (error) {
      console.error("代码执行失败:", error)
    }
  }

  const applySuggestion = (suggestion: AICodeSuggestion) => {
    if (suggestion.type === "fix" || suggestion.type === "improve" || suggestion.type === "refactor") {
      setCode(suggestion.code)
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (onCodeChange) {
      onCodeChange(newCode, language)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    if (onCodeChange) {
      onCodeChange(code, newLanguage)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">AI 智能编程工作台</span>
          </div>
          {analysis && (
            <div className="flex items-center gap-3 text-xs">
              <Badge variant={analysis.errors.length > 0 ? "destructive" : "secondary"}>
                {analysis.errors.length} 错误
              </Badge>
              <Badge variant="outline">{analysis.warnings.length} 警告</Badge>
              <Badge variant="secondary">复杂度: {analysis.complexity}</Badge>
              <Badge variant="default">得分: {analysis.performance.score}</Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={executeCode} disabled={isAnalyzing}>
            {isAnalyzing ? "分析中..." : "运行并学习"}
          </Button>
        </div>
      </div>

      {/* 主工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧: 代码编辑器 */}
        <div className="flex-1 flex flex-col">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>

        {/* 右侧: 预览和建议 */}
        <div className="w-[400px] border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
          <Tabs defaultValue="preview" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="preview" className="flex-1">
                <Code2 className="h-3 w-3 mr-1" />
                预览
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex-1">
                <Lightbulb className="h-3 w-3 mr-1" />
                建议 {suggestions.length > 0 && `(${suggestions.length})`}
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex-1">
                <GraduationCap className="h-3 w-3 mr-1" />
                学习
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 overflow-hidden m-0">
              <LivePreview code={code} language={language} />
            </TabsContent>

            <TabsContent value="suggestions" className="flex-1 overflow-auto m-0 p-4">
              <div className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>暂无建议</p>
                    <p className="text-xs mt-1">继续编写代码以获取 AI 建议</p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {suggestion.type === "fix" && <AlertCircle className="h-4 w-4 text-red-500" />}
                          {suggestion.type === "improve" && <TrendingUp className="h-4 w-4 text-blue-500" />}
                          {suggestion.type === "optimize" && <TrendingUp className="h-4 w-4 text-green-500" />}
                          <span className="font-medium text-sm">{suggestion.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{suggestion.description}</p>
                      {suggestion.learningTopic && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {suggestion.learningTopic}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs bg-transparent"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        应��建议
                      </Button>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="learning" className="flex-1 overflow-auto m-0 p-4">
              <div className="space-y-4">
                {analysis?.learningOpportunities && analysis.learningOpportunities.length > 0 ? (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        学习机会
                      </h3>
                      <div className="space-y-2">
                        {analysis.learningOpportunities.map((opportunity, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-sm">{opportunity.topic}</span>
                              <Badge
                                variant={
                                  opportunity.difficulty === "beginner"
                                    ? "secondary"
                                    : opportunity.difficulty === "intermediate"
                                      ? "default"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {opportunity.difficulty === "beginner"
                                  ? "初级"
                                  : opportunity.difficulty === "intermediate"
                                    ? "中级"
                                    : "高级"}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{opportunity.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {opportunity.resources.map((resource, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {learningProgress && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          学习进度
                        </h3>
                        <Card className="p-3">
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>总学习节点:</span>
                              <span className="font-medium">{learningProgress.totalNodes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>平均掌握度:</span>
                              <span className="font-medium">{Math.round(learningProgress.averageMastery * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>错误次数:</span>
                              <span className="font-medium">{learningProgress.totalErrors}</span>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>开始编写代码</p>
                    <p className="text-xs mt-1">AI 将分析你的代码并提供学习建议</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
