"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  BarChart3, 
  Heart, 
  FileText, 
  Brain,
  TrendingUp,
  RefreshCw,
  Download,
  Share
} from "lucide-react"

interface KeywordResult {
  word: string
  frequency: number
  confidence: number
  category?: string
}

interface TopicResult {
  category: string
  probability: number
  reasoning: string
  subcategories?: string[]
}

interface SentimentResult {
  overall: "positive" | "negative" | "neutral"
  scores: {
    positive: number
    negative: number
    neutral: number
  }
  emotions: Array<{
    emotion: string
    intensity: number
  }>
  reasoning: string
}

interface AnalysisDetail {
  id: string
  title: string
  content: string
  analysisType: "keyword" | "topic" | "sentiment" | "summary"
  keywords?: KeywordResult[]
  topics?: TopicResult[]
  sentiment?: SentimentResult
  summary?: string
  metadata: {
    model: string
    timestamp: Date
    processingTime: number
    tokenCount: number
    confidence: number
  }
}

interface AnalysisDetailModalProps {
  analysis: AnalysisDetail | null
  isOpen: boolean
  onClose: () => void
  onReanalyze?: (analysisId: string) => void
}

export function AnalysisDetailModal({ 
  analysis, 
  isOpen, 
  onClose, 
  onReanalyze 
}: AnalysisDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!analysis) return null

  const handleReanalyze = () => {
    onReanalyze?.(analysis.id)
  }

  const handleExport = (format: string) => {
    // 내보내기 로직
    console.log(`Exporting analysis ${analysis.id} in ${format} format`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {analysis.title}
          </DialogTitle>
          <DialogDescription>
            AI 분석 결과 상세 정보
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 메타데이터 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">분석 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">모델:</span>
                  <div className="font-medium">{analysis.metadata.model}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">처리 시간:</span>
                  <div className="font-medium">{analysis.metadata.processingTime}초</div>
                </div>
                <div>
                  <span className="text-muted-foreground">토큰 수:</span>
                  <div className="font-medium">{analysis.metadata.tokenCount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">신뢰도:</span>
                  <div className="font-medium">{(analysis.metadata.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 분석 결과 탭 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">개요</TabsTrigger>
              <TabsTrigger value="keywords">키워드</TabsTrigger>
              <TabsTrigger value="topics">주제</TabsTrigger>
              <TabsTrigger value="sentiment">감정</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    원문 내용
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{analysis.content}</p>
                  </div>
                </CardContent>
              </Card>

              {analysis.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI 요약
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm">{analysis.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              {analysis.keywords && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      키워드 추출 결과
                    </CardTitle>
                    <CardDescription>
                      텍스트에서 추출된 주요 키워드와 빈도
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.keywords.map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{keyword.word}</span>
                            {keyword.category && (
                              <Badge variant="secondary">{keyword.category}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                              {keyword.frequency}회
                            </div>
                            <div className="text-sm font-medium">
                              {(keyword.confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="topics" className="space-y-4">
              {analysis.topics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      주제 분류 결과
                    </CardTitle>
                    <CardDescription>
                      콘텐츠의 주제 분류 및 확률
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.topics.map((topic, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{topic.category}</h4>
                            <Badge variant="outline">
                              {(topic.probability * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${topic.probability * 100}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {topic.reasoning}
                          </p>
                          {topic.subcategories && topic.subcategories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {topic.subcategories.map((subcategory, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {subcategory}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4">
              {analysis.sentiment && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        감정 분석 결과
                      </CardTitle>
                      <CardDescription>
                        텍스트의 전반적인 감정과 세부 감정 분석
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold mb-2">
                            {analysis.sentiment.overall === "positive" && "😊"}
                            {analysis.sentiment.overall === "negative" && "😞"}
                            {analysis.sentiment.overall === "neutral" && "😐"}
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              analysis.sentiment.overall === "positive" ? "border-green-500 text-green-700" :
                              analysis.sentiment.overall === "negative" ? "border-red-500 text-red-700" :
                              "border-gray-500 text-gray-700"
                            }
                          >
                            {analysis.sentiment.overall === "positive" ? "긍정적" :
                             analysis.sentiment.overall === "negative" ? "부정적" :
                             "중립적"}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {Object.entries(analysis.sentiment.scores).map(([emotion, score]) => (
                            <div key={emotion} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">
                                  {emotion === "positive" ? "긍정" : 
                                   emotion === "negative" ? "부정" : "중립"}
                                </span>
                                <span className="font-medium">{(score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    emotion === "positive" ? "bg-green-500" :
                                    emotion === "negative" ? "bg-red-500" :
                                    "bg-gray-500"
                                  }`}
                                  style={{ width: `${score * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>분석 근거:</strong> {analysis.sentiment.reasoning}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        세부 감정
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {analysis.sentiment.emotions.map((emotion, index) => (
                          <div key={index} className="text-center p-3 border rounded-lg">
                            <div className="text-lg mb-1">{emotion.emotion}</div>
                            <div className="text-sm font-medium">
                              {(emotion.intensity * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* 액션 버튼 */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReanalyze}>
                <RefreshCw className="h-4 w-4 mr-2" />
                재분석
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                공유
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("json")}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button onClick={onClose}>닫기</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
