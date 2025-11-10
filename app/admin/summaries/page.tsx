'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkles,
  FileText,
  Video,
  Copy,
  RefreshCw,
  Save,
  Download,
  Play,
  ChevronRight,
  Newspaper,
  Brain,
  Film,
  Wand2,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react'

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error'

interface ArticleData {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  content: string
}

interface VideoPrompt {
  id: number
  duration: number
  prompt: string
  status: ProcessingStatus
}

export default function SummariesPage() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null)
  const [summaryStatus, setSummaryStatus] = useState<ProcessingStatus>('idle')
  const [scenarioStatus, setScenarioStatus] = useState<ProcessingStatus>('idle')
  const [promptsStatus, setPromptsStatus] = useState<ProcessingStatus>('idle')

  const [summary, setSummary] = useState('')
  const [scenario, setScenario] = useState('')
  const [videoPrompts, setVideoPrompts] = useState<VideoPrompt[]>([
    { id: 1, duration: 8, prompt: '', status: 'idle' },
    { id: 2, duration: 8, prompt: '', status: 'idle' },
    { id: 3, duration: 8, prompt: '', status: 'idle' },
    { id: 4, duration: 8, prompt: '', status: 'idle' },
    { id: 5, duration: 8, prompt: '', status: 'idle' },
    { id: 6, duration: 8, prompt: '', status: 'idle' },
  ])

  // Mock article data
  const mockArticle: ArticleData = {
    id: '1',
    title: 'AI 기술의 급격한 발전, 산업 전반에 혁신 가져와',
    source: '테크뉴스',
    url: 'https://example.com/article/1',
    publishedAt: '2025-11-10',
    content: '인공지능(AI) 기술이 빠른 속도로 발전하면서 산업 전반에 걸쳐 큰 변화를 일으키고 있다. 특히 생성형 AI의 등장으로 콘텐츠 제작, 고객 서비스, 의료 진단 등 다양한 분야에서 혁신이 일어나고 있으며, 전문가들은 향후 5년 내에 AI가 더욱 보편화될 것으로 전망하고 있다.'
  }

  const getStatusBadge = (status: ProcessingStatus) => {
    const statusConfig = {
      idle: { label: '대기', variant: 'secondary' as const, icon: Clock },
      processing: { label: '처리 중', variant: 'default' as const, icon: Loader2 },
      completed: { label: '완료', variant: 'success' as const, icon: CheckCircle2 },
      error: { label: '오류', variant: 'destructive' as const, icon: Clock }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={status === 'processing' ? 'w-3 h-3 animate-spin' : 'w-3 h-3'} />
        {config.label}
      </Badge>
    )
  }

  const handleGenerateSummary = () => {
    setSummaryStatus('processing')
    // Mock API call
    setTimeout(() => {
      setSummary('AI 기술이 급격히 발전하면서 산업 전반의 혁신을 이끌고 있습니다. 생성형 AI의 등장으로 콘텐츠 제작, 고객 서비스, 의료 진단 등 다양한 분야에서 변화가 일어나고 있으며, 전문가들은 향후 5년 내에 AI가 더욱 보편화될 것으로 예측하고 있습니다.')
      setSummaryStatus('completed')
    }, 2000)
  }

  const handleGenerateScenario = () => {
    setScenarioStatus('processing')
    // Mock API call
    setTimeout(() => {
      setScenario(`[오프닝 - 3초]
화면: AI 로봇과 디지털 네트워크 이미지
내레이션: "인공지능, 우리 삶을 바꾸고 있습니다"

[본문 1 - 8초]
화면: 다양한 산업 현장에서 AI 활용 모습
내레이션: "생성형 AI의 등장으로 콘텐츠 제작부터 고객 서비스까지, 산업 전반에 혁신의 바람이 불고 있습니다"

[본문 2 - 8초]
화면: 의료 AI 진단 시스템
내레이션: "의료 진단에서도 AI가 정확도를 높이며 의사들을 돕고 있습니다"

[본문 3 - 8초]
화면: 오피스에서 AI 도구 사용하는 직장인들
내레이션: "업무 자동화와 효율성 증대로 일하는 방식도 변화하고 있습니다"

[본문 4 - 8초]
화면: 미래 도시 스카이라인
내레이션: "전문가들은 5년 내 AI가 일상에 더욱 깊숙이 자리잡을 것으로 전망합니다"

[클로징 - 8초]
화면: AI 기술과 인간이 협력하는 미래 이미지
내레이션: "AI와 함께하는 미래, 이미 시작되었습니다"`)
      setScenarioStatus('completed')
    }, 2000)
  }

  const handleGeneratePrompts = () => {
    setPromptsStatus('processing')
    // Mock API call - generate prompts one by one
    const prompts = [
      'A futuristic AI robot surrounded by glowing digital networks and data streams, cinematic lighting, high-tech aesthetic, blue and purple color scheme',
      'Wide shot of diverse industries: factories, offices, hospitals showing AI integration, modern and clean visual style, documentary feel',
      'Close-up of medical AI diagnostic system with holographic displays, doctor analyzing results, professional medical environment, soft lighting',
      'Modern office workers collaborating with AI assistants, productivity tools on screens, bright and optimistic atmosphere, corporate setting',
      'Futuristic city skyline at sunset with AI-powered infrastructure, flying drones, smart buildings, warm golden hour lighting',
      'Harmonious scene of humans and AI working together, symbolic representation of partnership, hopeful and inspiring mood, soft focus'
    ]

    prompts.forEach((prompt, index) => {
      setTimeout(() => {
        setVideoPrompts(prev => prev.map((p, i) =>
          i === index ? { ...p, prompt, status: 'completed' as ProcessingStatus } : p
        ))
        if (index === prompts.length - 1) {
          setPromptsStatus('completed')
        }
      }, (index + 1) * 500)
    })
  }

  const handleLoadArticle = () => {
    setSelectedArticle(mockArticle)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI 요약 관리</h1>
        <p className="text-muted-foreground mt-2">
          뉴스 기사를 AI로 요약하고 동영상 생성을 위한 시나리오와 프롬프트를 작성합니다
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 요약</p>
                <p className="text-2xl font-bold mt-2">156</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">시나리오</p>
                <p className="text-2xl font-bold mt-2">142</p>
              </div>
              <Film className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">프롬프트</p>
                <p className="text-2xl font-bold mt-2">852</p>
              </div>
              <Wand2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">생성된 영상</p>
                <p className="text-2xl font-bold mt-2">127</p>
              </div>
              <Video className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                원본 기사
              </CardTitle>
              <CardDescription>분석할 뉴스 기사를 선택하세요</CardDescription>
            </div>
            {!selectedArticle && (
              <Button onClick={handleLoadArticle} className="gap-2">
                <Play className="w-4 h-4" />
                샘플 기사 불러오기
              </Button>
            )}
          </div>
        </CardHeader>
        {selectedArticle && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedArticle.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedArticle.source}</Badge>
                    <span className="text-sm text-muted-foreground">{selectedArticle.publishedAt}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)}>
                  다시 선택
                </Button>
              </div>
              <Separator />
              <ScrollArea className="h-32">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedArticle.content}
                </p>
              </ScrollArea>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Processing Tabs */}
      {selectedArticle && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="gap-2">
              <Brain className="w-4 h-4" />
              AI 요약
            </TabsTrigger>
            <TabsTrigger value="scenario" className="gap-2">
              <Film className="w-4 h-4" />
              시나리오
            </TabsTrigger>
            <TabsTrigger value="prompts" className="gap-2">
              <Wand2 className="w-4 h-4" />
              프롬프트 생성
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI 요약 생성
                    </CardTitle>
                    <CardDescription>OpenAI API를 사용하여 기사를 요약합니다</CardDescription>
                  </div>
                  {getStatusBadge(summaryStatus)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={summaryStatus === 'processing'}
                    className="gap-2"
                  >
                    {summaryStatus === 'processing' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        요약 생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        요약 생성
                      </>
                    )}
                  </Button>
                  {summary && (
                    <>
                      <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        재생성
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" />
                        복사
                      </Button>
                    </>
                  )}
                </div>

                {summary && (
                  <div className="space-y-2">
                    <Label>생성된 요약</Label>
                    <Textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="min-h-32 resize-none"
                      placeholder="AI가 생성한 요약이 여기에 표시됩니다..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenario Tab */}
          <TabsContent value="scenario" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="w-5 h-5" />
                      시나리오 작성
                    </CardTitle>
                    <CardDescription>48초 분량의 동영상 시나리오를 생성합니다</CardDescription>
                  </div>
                  {getStatusBadge(scenarioStatus)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateScenario}
                    disabled={scenarioStatus === 'processing' || !summary}
                    className="gap-2"
                  >
                    {scenarioStatus === 'processing' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        시나리오 생성 중...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4" />
                        시나리오 생성
                      </>
                    )}
                  </Button>
                  {scenario && (
                    <>
                      <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        재생성
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Copy className="w-4 h-4" />
                        복사
                      </Button>
                    </>
                  )}
                </div>

                {!summary && (
                  <div className="p-4 border border-dashed rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                      먼저 AI 요약을 생성해주세요
                    </p>
                  </div>
                )}

                {scenario && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>생성된 시나리오</Label>
                      <Badge variant="outline">총 48초</Badge>
                    </div>
                    <Textarea
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      className="min-h-96 resize-none font-mono text-sm"
                      placeholder="AI가 생성한 시나리오가 여기에 표시됩니다..."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      프롬프트 생성
                    </CardTitle>
                    <CardDescription>
                      8초 분량 × 6개 = 총 48초 분량의 동영상 프롬프트를 생성합니다
                    </CardDescription>
                  </div>
                  {getStatusBadge(promptsStatus)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleGeneratePrompts}
                    disabled={promptsStatus === 'processing' || !scenario}
                    className="gap-2"
                  >
                    {promptsStatus === 'processing' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        프롬프트 생성 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        전체 프롬프트 생성
                      </>
                    )}
                  </Button>
                  {promptsStatus === 'completed' && (
                    <>
                      <Button variant="outline" className="gap-2">
                        <Save className="w-4 h-4" />
                        저장
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        내보내기
                      </Button>
                      <Button className="gap-2 ml-auto">
                        <Video className="w-4 h-4" />
                        영상 생성하기
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {!scenario && (
                  <div className="p-4 border border-dashed rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                      먼저 시나리오를 생성해주세요
                    </p>
                  </div>
                )}

                {scenario && (
                  <div className="space-y-4">
                    {videoPrompts.map((prompt, index) => (
                      <Card key={prompt.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                {prompt.id}
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  씬 {prompt.id}
                                </CardTitle>
                                <CardDescription>{prompt.duration}초</CardDescription>
                              </div>
                            </div>
                            {getStatusBadge(prompt.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={prompt.prompt}
                            onChange={(e) => {
                              setVideoPrompts(prev => prev.map(p =>
                                p.id === prompt.id ? { ...p, prompt: e.target.value } : p
                              ))
                            }}
                            className="min-h-24 resize-none text-sm"
                            placeholder={`씬 ${prompt.id}의 프롬프트가 여기에 생성됩니다...`}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {promptsStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">프롬프트 생성 중...</span>
                      <span className="font-medium">
                        {videoPrompts.filter(p => p.status === 'completed').length} / {videoPrompts.length}
                      </span>
                    </div>
                    <Progress
                      value={(videoPrompts.filter(p => p.status === 'completed').length / videoPrompts.length) * 100}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
