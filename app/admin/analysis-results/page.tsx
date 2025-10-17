"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Heart, 
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

// 목업 데이터
const analysisStats = {
  totalAnalyzed: 1247,
  successRate: 98.5,
  averageTime: 2.3,
  todayAnalyzed: 45
}

const keywordData = [
  { word: "인공지능", frequency: 156, confidence: 0.95 },
  { word: "머신러닝", frequency: 134, confidence: 0.92 },
  { word: "딥러닝", frequency: 98, confidence: 0.89 },
  { word: "자연어처리", frequency: 87, confidence: 0.91 },
  { word: "데이터분석", frequency: 76, confidence: 0.88 },
  { word: "알고리즘", frequency: 65, confidence: 0.87 },
  { word: "신경망", frequency: 54, confidence: 0.85 },
  { word: "예측모델", frequency: 43, confidence: 0.83 },
]

const topicData = [
  { category: "기술", count: 456, percentage: 36.6 },
  { category: "경제", count: 234, percentage: 18.8 },
  { category: "정치", count: 198, percentage: 15.9 },
  { category: "사회", count: 156, percentage: 12.5 },
  { category: "문화", count: 123, percentage: 9.9 },
  { category: "스포츠", count: 80, percentage: 6.4 },
]

const sentimentData = [
  { emotion: "긍정", count: 567, percentage: 45.5, color: "bg-green-500" },
  { emotion: "중립", count: 445, percentage: 35.7, color: "bg-gray-500" },
  { emotion: "부정", count: 235, percentage: 18.8, color: "bg-red-500" },
]

const recentAnalyses = [
  { id: 1, title: "AI 기술 발전 동향", status: "completed", type: "키워드 추출", date: "2024-01-15", time: "2.1분" },
  { id: 2, title: "머신러닝 알고리즘 개선", status: "completed", type: "감정 분석", date: "2024-01-15", time: "1.8분" },
  { id: 3, title: "자연어처리 모델 발전", status: "processing", type: "주제 분류", date: "2024-01-15", time: "진행중" },
  { id: 4, title: "딥러닝 프레임워크 비교", status: "completed", type: "요약 생성", date: "2024-01-14", time: "3.2분" },
  { id: 5, title: "데이터 사이언스 트렌드", status: "error", type: "키워드 추출", date: "2024-01-14", time: "오류" },
]

export default function AnalysisResultsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">완료</Badge>
      case "processing":
        return <Badge variant="secondary" className="bg-blue-500 text-white">진행중</Badge>
      case "error":
        return <Badge variant="destructive">오류</Badge>
      default:
        return <Badge variant="outline">대기중</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">분석 결과 대시보드</h1>
          <p className="text-muted-foreground">
            AI 분석 결과를 종합적으로 확인하고 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">데이터 내보내기</Button>
          <Button>새 분석 시작</Button>
        </div>
      </div>

      {/* 요약 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 분석 건수</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisStats.totalAnalyzed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analysisStats.todayAnalyzed} 오늘
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% 지난주 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 처리 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisStats.averageTime}분</div>
            <p className="text-xs text-muted-foreground">
              -0.3분 지난주 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 분석</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisStats.todayAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              +12% 어제 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keywords">키워드 분석</TabsTrigger>
          <TabsTrigger value="topics">주제 분류</TabsTrigger>
          <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
          <TabsTrigger value="history">분석 히스토리</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  키워드 빈도 분석
                </CardTitle>
                <CardDescription>
                  가장 자주 언급된 키워드와 신뢰도
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {keywordData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{item.word}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {item.frequency}회
                        </div>
                        <div className="text-sm font-medium">
                          {(item.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  키워드 트렌드
                </CardTitle>
                <CardDescription>
                  시간별 키워드 언급 빈도 변화
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>차트 구현 예정</p>
                    <p className="text-sm">Chart.js 또는 Recharts 사용</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  주제별 분포
                </CardTitle>
                <CardDescription>
                  콘텐츠의 주제별 분류 결과
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topicData.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                        />
                        <span className="font-medium">{topic.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {topic.count}개
                        </div>
                        <div className="text-sm font-medium">
                          {topic.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  주제 분류 상세
                </CardTitle>
                <CardDescription>
                  각 주제의 세부 카테고리 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>파이 차트 구현 예정</p>
                    <p className="text-sm">시각적 주제 분포 표현</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  감정 분석 결과
                </CardTitle>
                <CardDescription>
                  콘텐츠의 감정 분포 및 톤 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentimentData.map((sentiment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sentiment.emotion}</span>
                        <span className="text-sm text-muted-foreground">
                          {sentiment.count}개 ({sentiment.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${sentiment.color}`}
                          style={{ width: `${sentiment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  감정 트렌드
                </CardTitle>
                <CardDescription>
                  시간별 감정 변화 추이
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p>감정 트렌드 차트 구현 예정</p>
                    <p className="text-sm">시계열 감정 분석</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                최근 분석 작업
              </CardTitle>
              <CardDescription>
                최근 수행된 AI 분석 작업 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(analysis.status)}
                      <div>
                        <div className="font-medium">{analysis.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.type} • {analysis.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        {analysis.time}
                      </div>
                      {getStatusBadge(analysis.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
