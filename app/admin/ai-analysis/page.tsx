"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  FileText, 
  Settings, 
  Play, 
  Clock, 
  DollarSign,
  Target,
  Zap,
  BarChart3
} from "lucide-react"

const analysisTypes = [
  { id: "keyword", label: "키워드 추출", description: "주요 키워드와 핵심 개념 추출" },
  { id: "topic", label: "주제 분류", description: "콘텐츠의 주제와 카테고리 분류" },
  { id: "sentiment", label: "감정 분석", description: "텍스트의 감정과 톤 분석" },
  { id: "summary", label: "요약 생성", description: "콘텐츠의 핵심 내용 요약" },
]

const aiModels = [
  { id: "gpt-4", name: "GPT-4", description: "최고 성능, 높은 정확도" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "빠른 처리, 비용 효율적" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "균형잡힌 성능과 속도" },
]

export default function AIAnalysisPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  // 목업 데이터
  const articles = [
    { id: "1", title: "인공지능 기술의 최신 동향", source: "TechNews", date: "2024-01-15", status: "pending" },
    { id: "2", title: "머신러닝 알고리즘 개선", source: "AIWeekly", date: "2024-01-14", status: "analyzed" },
    { id: "3", title: "자연어처리 모델 발전", source: "NLPJournal", date: "2024-01-13", status: "pending" },
    { id: "4", title: "딥러닝 프레임워크 비교", source: "DeepTech", date: "2024-01-12", status: "analyzed" },
  ]

  const handleAnalysisTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, typeId])
    } else {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId))
    }
  }

  const handleArticleSelect = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles([...selectedArticles, articleId])
    } else {
      setSelectedArticles(selectedArticles.filter(id => id !== articleId))
    }
  }

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)
    
    // 시뮬레이션
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }
    
    setIsAnalyzing(false)
  }

  const estimatedCost = selectedArticles.length * selectedTypes.length * 0.02
  const estimatedTime = selectedArticles.length * selectedTypes.length * 2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 분석 설정</h1>
          <p className="text-muted-foreground">
            OpenAI API를 활용한 콘텐츠 분석을 설정하고 실행하세요
          </p>
        </div>
        <Button 
          onClick={handleStartAnalysis} 
          disabled={isAnalyzing || selectedTypes.length === 0 || selectedArticles.length === 0}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {isAnalyzing ? "분석 중..." : "분석 시작"}
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">분석 설정</TabsTrigger>
          <TabsTrigger value="content">콘텐츠 선택</TabsTrigger>
          <TabsTrigger value="parameters">AI 파라미터</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                분석 유형 선택
              </CardTitle>
              <CardDescription>
                수행할 AI 분석 유형을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisTypes.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={type.id}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={(checked) => handleAnalysisTypeChange(type.id, checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={type.id} className="text-sm font-medium">
                        {type.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                분석 대상 콘텐츠 선택
              </CardTitle>
              <CardDescription>
                분석할 기사를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    전체 선택
                  </Button>
                  <Button variant="outline" size="sm">
                    선택 해제
                  </Button>
                  <Badge variant="secondary">
                    {selectedArticles.length}개 선택됨
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {articles.map((article) => (
                    <div key={article.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={article.id}
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleArticleSelect(article.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{article.title}</span>
                          <Badge variant={article.status === 'analyzed' ? 'default' : 'secondary'}>
                            {article.status === 'analyzed' ? '분석완료' : '대기중'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {article.source} • {article.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI 모델 파라미터 설정
              </CardTitle>
              <CardDescription>
                AI 모델의 동작을 제어하는 파라미터를 설정하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="model">AI 모델 선택</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="모델을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-sm text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">온도 (Temperature): {temperature}</Label>
                <Input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  낮을수록 일관성 있고, 높을수록 창의적입니다
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">최대 토큰 수</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min="100"
                  max="4000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 분석 진행 상태 */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              분석 진행 중
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{progress}% 완료</span>
              <span>남은 시간: 약 {Math.max(0, (100 - progress) / 10)}분</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 분석 예상 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            분석 예상 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{estimatedTime}분</div>
                <div className="text-sm text-muted-foreground">예상 처리 시간</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">예상 비용</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{selectedTypes.length * selectedArticles.length}</div>
                <div className="text-sm text-muted-foreground">총 분석 작업</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
