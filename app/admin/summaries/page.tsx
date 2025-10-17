"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Sparkles, 
  FileText, 
  Settings, 
  Download, 
  Star,
  Clock,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from "lucide-react"

const summaryStyles = [
  { id: "concise", name: "간결형", description: "핵심 내용만 간단히 요약" },
  { id: "detailed", name: "상세형", description: "중요한 세부사항 포함" },
  { id: "bullet", name: "불릿형", description: "핵심 포인트를 나열" },
  { id: "narrative", name: "서술형", description: "자연스러운 문장으로 요약" },
]

const languages = [
  { id: "ko", name: "한국어" },
  { id: "en", name: "영어" },
  { id: "ja", name: "일본어" },
  { id: "zh", name: "중국어" },
]

// 목업 데이터
const summaries = [
  {
    id: 1,
    title: "인공지능 기술의 최신 동향",
    originalLength: 2450,
    summaryLength: 320,
    style: "간결형",
    language: "한국어",
    quality: 4.5,
    createdAt: "2024-01-15",
    status: "completed",
    content: "인공지능 기술이 급속도로 발전하고 있으며, 특히 자연어처리와 컴퓨터 비전 분야에서 혁신적인 성과를 보이고 있습니다. 최근 GPT-4와 같은 대규모 언어모델의 등장으로 AI의 활용 범위가 크게 확장되었습니다.",
    originalContent: "인공지능 기술의 발전은 현대 사회에 있어서 매우 중요한 변화를 가져오고 있습니다. 특히 최근 몇 년간 머신러닝과 딥러닝 기술의 발전으로 인해..."
  },
  {
    id: 2,
    title: "머신러닝 알고리즘 개선 방안",
    originalLength: 1800,
    summaryLength: 280,
    style: "불릿형",
    language: "한국어",
    quality: 4.2,
    createdAt: "2024-01-14",
    status: "completed",
    content: "• 데이터 전처리 개선으로 모델 성능 향상\n• 하이퍼파라미터 튜닝을 통한 최적화\n• 앙상블 기법 활용으로 예측 정확도 증가\n• 실시간 학습을 통한 모델 업데이트",
    originalContent: "머신러닝 알고리즘의 성능을 향상시키기 위해서는 여러 가지 접근 방법이 있습니다. 먼저 데이터의 품질과 전처리 과정이 매우 중요합니다..."
  },
  {
    id: 3,
    title: "자연어처리 모델 발전사",
    originalLength: 3200,
    summaryLength: 450,
    style: "상세형",
    language: "한국어",
    quality: 4.8,
    createdAt: "2024-01-13",
    status: "processing",
    content: "자연어처리 기술은 1950년대부터 시작되어 현재까지 지속적으로 발전해왔습니다. 초기 규칙 기반 시스템에서 통계적 방법을 거쳐 현재의 신경망 기반 모델에 이르기까지...",
    originalContent: "자연어처리(Natural Language Processing, NLP)는 인간의 언어를 컴퓨터가 이해하고 처리할 수 있도록 하는 기술입니다..."
  },
]

export default function SummariesPage() {
  const [selectedSummary, setSelectedSummary] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStyle, setFilterStyle] = useState("all")
  const [filterLanguage, setFilterLanguage] = useState("all")

  const handleCreateSummary = () => {
    // 요약 생성 로직
    setIsCreateDialogOpen(false)
  }

  const handleExportSummary = (summary: any, format: string) => {
    // 내보내기 로직
    console.log(`Exporting summary ${summary.id} in ${format} format`)
  }

  const filteredSummaries = summaries.filter(summary => {
    const matchesSearch = summary.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStyle = filterStyle === "all" || summary.style === filterStyle
    const matchesLanguage = filterLanguage === "all" || summary.language === filterLanguage
    return matchesSearch && matchesStyle && matchesLanguage
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "text-yellow-400 fill-current" 
            : i < rating 
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">요약 관리</h1>
          <p className="text-muted-foreground">
            AI가 생성한 요약을 관리하고 품질을 평가하세요
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              새 요약 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 요약 생성</DialogTitle>
              <DialogDescription>
                요약 설정을 구성하고 새로운 요약을 생성하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summaryStyle">요약 스타일</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="스타일 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {summaryStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{style.name}</span>
                            <span className="text-sm text-muted-foreground">{style.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summaryLength">요약 길이</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="길이 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">짧게 (100-200자)</SelectItem>
                      <SelectItem value="medium">보통 (200-400자)</SelectItem>
                      <SelectItem value="long">길게 (400-600자)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLanguage">대상 언어</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="언어 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateSummary}>
                  요약 생성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="요약 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStyle} onValueChange={setFilterStyle}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="스타일" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 스타일</SelectItem>
                {summaryStyles.map((style) => (
                  <SelectItem key={style.id} value={style.name}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="언어" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 언어</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.name}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">요약 목록</TabsTrigger>
          <TabsTrigger value="settings">요약 설정</TabsTrigger>
          <TabsTrigger value="versions">버전 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{summary.title}</CardTitle>
                      <CardDescription>
                        {summary.originalLength}자 → {summary.summaryLength}자 • {summary.createdAt}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{summary.style}</Badge>
                      <Badge variant="secondary">{summary.language}</Badge>
                      {summary.status === "processing" && (
                        <Badge variant="secondary" className="bg-blue-500 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          처리중
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm font-medium mb-2">요약 내용:</div>
                      <div className="text-sm whitespace-pre-line">{summary.content}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">품질:</span>
                          <div className="flex">
                            {renderStars(summary.quality)}
                          </div>
                          <span className="text-sm font-medium ml-1">{summary.quality}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          압축률: {((summary.originalLength - summary.summaryLength) / summary.originalLength * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSummary(summary)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Select onValueChange={(format) => handleExportSummary(summary, format)}>
                          <SelectTrigger className="w-32">
                            <Download className="h-4 w-4 mr-1" />
                            내보내기
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="txt">텍스트</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">워드</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                요약 기본 설정
              </CardTitle>
              <CardDescription>
                기본 요약 생성 설정을 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultStyle">기본 요약 스타일</Label>
                  <Select defaultValue="concise">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {summaryStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLength">기본 요약 길이</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">짧게</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="long">길게</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">기본 언어</Label>
                <Select defaultValue="ko">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button>설정 저장</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                요약 버전 관리
              </CardTitle>
              <CardDescription>
                요약의 수정 히스토리와 버전을 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>버전 관리 시스템 구현 예정</p>
                <p className="text-sm">요약 수정 히스토리 추적</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 요약 상세보기 모달 */}
      {selectedSummary && (
        <Dialog open={!!selectedSummary} onOpenChange={() => setSelectedSummary(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSummary.title}</DialogTitle>
              <DialogDescription>
                원문과 요약을 비교하여 확인하세요
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">원문</h4>
                <div className="bg-muted p-4 rounded-lg text-sm max-h-96 overflow-y-auto">
                  {selectedSummary.originalContent}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">요약</h4>
                <div className="bg-muted p-4 rounded-lg text-sm max-h-96 overflow-y-auto whitespace-pre-line">
                  {selectedSummary.content}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
