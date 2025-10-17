"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Brain, 
  Key, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap
} from "lucide-react"

// 목업 데이터
const aiModels = [
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "최고 성능의 대화형 AI 모델",
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    speed: "medium",
    quality: "excellent",
    capabilities: ["텍스트 생성", "분석", "요약", "번역"],
    status: "active"
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "빠르고 효율적인 모델",
    maxTokens: 4096,
    costPer1kTokens: 0.002,
    speed: "fast",
    quality: "good",
    capabilities: ["텍스트 생성", "분석", "요약"],
    status: "active"
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "대용량 컨텍스트 처리 모델",
    maxTokens: 128000,
    costPer1kTokens: 0.01,
    speed: "slow",
    quality: "excellent",
    capabilities: ["텍스트 생성", "분석", "요약", "번역", "코드 생성"],
    status: "active"
  }
]

const promptTemplates = [
  {
    id: "keyword-extraction",
    name: "키워드 추출",
    description: "텍스트에서 주요 키워드를 추출합니다",
    template: "다음 텍스트에서 주요 키워드 5개를 추출해주세요:\n\n{text}",
    usage: 245
  },
  {
    id: "sentiment-analysis",
    name: "감정 분석",
    description: "텍스트의 감정을 분석합니다",
    template: "다음 텍스트의 감정을 긍정/부정/중립으로 분류하고 이유를 설명해주세요:\n\n{text}",
    usage: 189
  },
  {
    id: "topic-classification",
    name: "주제 분류",
    description: "텍스트의 주제를 분류합니다",
    template: "다음 텍스트의 주제를 다음 카테고리 중에서 분류해주세요: 기술, 경제, 정치, 사회, 문화, 스포츠\n\n{text}",
    usage: 156
  },
  {
    id: "content-summary",
    name: "콘텐츠 요약",
    description: "텍스트를 요약합니다",
    template: "다음 텍스트를 3-5문장으로 요약해주세요:\n\n{text}",
    usage: 312
  }
]

const usageStats = {
  totalTokens: 1250000,
  totalCost: 125.50,
  requestsToday: 245,
  averageResponseTime: 2.3
}

export default function ModelSettingsPage() {
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [apiKey, setApiKey] = useState("")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [topP, setTopP] = useState(1.0)

  const handleSaveSettings = () => {
    // 설정 저장 로직
    console.log("Settings saved")
  }

  const handleTestConnection = () => {
    // 연결 테스트 로직
    console.log("Testing connection...")
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "fast": return "text-green-600"
      case "medium": return "text-yellow-600"
      case "slow": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent": return "text-green-600"
      case "good": return "text-yellow-600"
      case "fair": return "text-orange-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 모델 설정</h1>
          <p className="text-muted-foreground">
            OpenAI 모델 설정과 프롬프트 템플릿을 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection}>
            <CheckCircle className="h-4 w-4 mr-2" />
            연결 테스트
          </Button>
          <Button onClick={handleSaveSettings}>
            <Settings className="h-4 w-4 mr-2" />
            설정 저장
          </Button>
        </div>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">모델 관리</TabsTrigger>
          <TabsTrigger value="prompts">프롬프트 템플릿</TabsTrigger>
          <TabsTrigger value="api">API 설정</TabsTrigger>
          <TabsTrigger value="usage">사용량 모니터링</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  사용 가능한 모델
                </CardTitle>
                <CardDescription>
                  OpenAI에서 제공하는 모델 목록
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiModels.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedModel === model.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{model.name}</h4>
                          <Badge variant={model.status === "active" ? "default" : "secondary"}>
                            {model.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className={getSpeedColor(model.speed)}>
                              {model.speed === "fast" ? "빠름" : model.speed === "medium" ? "보통" : "느림"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className={getQualityColor(model.quality)}>
                              {model.quality === "excellent" ? "우수" : model.quality === "good" ? "양호" : "보통"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${model.costPer1kTokens}/1K토큰</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  모델 파라미터 설정
                </CardTitle>
                <CardDescription>
                  선택된 모델의 동작을 제어하는 파라미터
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="temperature">온도 (Temperature)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{temperature}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    낮을수록 일관성 있고, 높을수록 창의적입니다
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">최대 토큰 수</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="8192"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP">Top P</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="topP"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{topP}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    토큰 선택의 다양성을 제어합니다
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                프롬프트 템플릿 관리
              </CardTitle>
              <CardDescription>
                AI 분석에 사용되는 프롬프트 템플릿을 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promptTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.usage}회 사용</Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                        {template.template}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">편집</Button>
                        <Button variant="outline" size="sm">테스트</Button>
                        <Button variant="outline" size="sm">복사</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API 키 설정
              </CardTitle>
              <CardDescription>
                OpenAI API 키와 연결 설정을 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API 키</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleTestConnection}>
                    테스트
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  API 키는 안전하게 암호화되어 저장됩니다
                </p>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">API 연결 상태: 정상</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 토큰 사용량</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% 지난주 대비
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 비용</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${usageStats.totalCost}</div>
                <p className="text-xs text-muted-foreground">
                  이번 달 누적
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 요청 수</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.requestsToday}</div>
                <p className="text-xs text-muted-foreground">
                  +8% 어제 대비
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.averageResponseTime}초</div>
                <p className="text-xs text-muted-foreground">
                  -0.3초 개선됨
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                사용량 트렌드
              </CardTitle>
              <CardDescription>
                일별 API 사용량 및 비용 추이
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>사용량 차트 구현 예정</p>
                  <p className="text-sm">Chart.js 또는 Recharts 사용</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
