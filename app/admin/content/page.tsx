import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Video,
  Brain,
  CheckSquare,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  Users,
  Search,
  Filter,
  Target,
  Zap,
  BarChart3
} from "lucide-react"
import Link from "next/link"

const contentStats = [
  {
    label: "총 요약 문서",
    value: "2,847",
    change: "+12%",
    trend: "up"
  },
  {
    label: "생성된 동영상",
    value: "456",
    change: "+8%",
    trend: "up"
  },
  {
    label: "퀴즈 문제",
    value: "1,234",
    change: "+15%",
    trend: "up"
  },
  {
    label: "품질 점수",
    value: "94.2%",
    change: "-2%",
    trend: "down"
  }
]

const recentContent = [
  {
    title: "AI 기술 동향 분석",
    type: "summary",
    status: "published",
    views: 1247,
    createdAt: "2시간 전",
    analysisStatus: "completed",
    keywords: ["인공지능", "머신러닝", "딥러닝"],
    sentiment: "positive"
  },
  {
    title: "블록체인 기술 설명 영상",
    type: "video",
    status: "processing",
    views: 0,
    createdAt: "30분 전",
    analysisStatus: "processing",
    keywords: ["블록체인", "암호화폐", "분산원장"],
    sentiment: "neutral"
  },
  {
    title: "데이터 사이언스 기초 퀴즈",
    type: "quiz",
    status: "draft",
    views: 89,
    createdAt: "1시간 전",
    analysisStatus: "pending",
    keywords: [],
    sentiment: "neutral"
  },
  {
    title: "클라우드 컴퓨팅 가이드",
    type: "summary",
    status: "published",
    views: 892,
    createdAt: "3시간 전",
    analysisStatus: "completed",
    keywords: ["클라우드", "AWS", "서버리스"],
    sentiment: "positive"
  }
]

const analysisStatusColors = {
  completed: "bg-green-500",
  processing: "bg-blue-500", 
  pending: "bg-gray-500",
  error: "bg-red-500"
}

const sentimentColors = {
  positive: "text-green-600",
  negative: "text-red-600",
  neutral: "text-gray-600"
}

export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">콘텐츠 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI 생성 콘텐츠와 품질을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </Button>
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            AI 분석
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 콘텐츠
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contentStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Badge variant={stat.trend === "up" ? "default" : "destructive"}>
                  {stat.change}
                </Badge>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/content/summaries">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-3 text-chart-1" />
              <h3 className="font-medium mb-2">요약 관리</h3>
              <p className="text-sm text-muted-foreground">AI 문서 요약 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/videos">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 mx-auto mb-3 text-destructive" />
              <h3 className="font-medium mb-2">동영상 관리</h3>
              <p className="text-sm text-muted-foreground">AI 동영상 생성 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/quizzes">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 mx-auto mb-3 text-chart-2" />
              <h3 className="font-medium mb-2">퀴즈 관리</h3>
              <p className="text-sm text-muted-foreground">자동 퀴즈 생성 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/quality">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-chart-3" />
              <h3 className="font-medium mb-2">품질 검토</h3>
              <p className="text-sm text-muted-foreground">콘텐츠 품질 관리</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* AI Analysis Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI 분석 빠른 실행
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Brain className="h-6 w-6" />
              <span>키워드 추출</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>감정 분석</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Zap className="h-6 w-6" />
              <span>주제 분류</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="콘텐츠 제목으로 검색..." className="pl-10" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="분석 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="completed">분석 완료</SelectItem>
                <SelectItem value="processing">분석 중</SelectItem>
                <SelectItem value="pending">대기 중</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="콘텐츠 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="summary">요약</SelectItem>
                <SelectItem value="video">동영상</SelectItem>
                <SelectItem value="quiz">퀴즈</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI 처리 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>요약 처리 중</span>
                  <span>23/30</span>
                </div>
                <Progress value={76.7} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>동영상 생성 중</span>
                  <span>5/8</span>
                </div>
                <Progress value={62.5} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>퀴즈 생성 중</span>
                  <span>12/15</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 생성 콘텐츠</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox />
                    <div className="p-2 rounded-lg bg-muted">
                      {content.type === "summary" && <FileText className="h-4 w-4" />}
                      {content.type === "video" && <Video className="h-4 w-4" />}
                      {content.type === "quiz" && <CheckSquare className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{content.title}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {content.createdAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {content.views} 조회
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${analysisStatusColors[content.analysisStatus as keyof typeof analysisStatusColors]}`} />
                          <span className={sentimentColors[content.sentiment as keyof typeof sentimentColors]}>
                            {content.sentiment === "positive" ? "긍정" : content.sentiment === "negative" ? "부정" : "중립"}
                          </span>
                        </div>
                      </div>
                      {content.keywords.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {content.keywords.slice(0, 3).map((keyword, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {content.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{content.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      content.analysisStatus === "completed" ? "default" :
                      content.analysisStatus === "processing" ? "secondary" :
                      content.analysisStatus === "error" ? "destructive" :
                      "outline"
                    }>
                      {content.analysisStatus === "completed" ? "분석완료" :
                       content.analysisStatus === "processing" ? "분석중" :
                       content.analysisStatus === "error" ? "오류" :
                       "대기중"}
                    </Badge>
                    <Badge variant={
                      content.status === "published" ? "default" :
                      content.status === "processing" ? "secondary" :
                      "outline"
                    }>
                      {content.status === "published" ? "게시됨" :
                       content.status === "processing" ? "처리중" :
                       "초안"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                일괄 분석 실행
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}