import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Video,
  Brain,
  CheckSquare,
  Plus,
  Settings,
  TrendingUp,
  Clock,
  Users
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
    createdAt: "2시간 전"
  },
  {
    title: "블록체인 기술 설명 영상",
    type: "video",
    status: "processing",
    views: 0,
    createdAt: "30분 전"
  },
  {
    title: "데이터 사이언스 기초 퀴즈",
    type: "quiz",
    status: "draft",
    views: 89,
    createdAt: "1시간 전"
  },
  {
    title: "클라우드 컴퓨팅 가이드",
    type: "summary",
    status: "published",
    views: 892,
    createdAt: "3시간 전"
  }
]

export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI 생성 콘텐츠와 품질을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
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
                <span className="text-sm text-gray-600">{stat.label}</span>
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
              <Brain className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium mb-2">요약 관리</h3>
              <p className="text-sm text-gray-500">AI 문서 요약 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/videos">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 mx-auto mb-3 text-red-600" />
              <h3 className="font-medium mb-2">동영상 관리</h3>
              <p className="text-sm text-gray-500">AI 동영상 생성 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/quizzes">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <CheckSquare className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium mb-2">퀴즈 관리</h3>
              <p className="text-sm text-gray-500">자동 퀴즈 생성 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content/quality">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium mb-2">품질 검토</h3>
              <p className="text-sm text-gray-500">콘텐츠 품질 관리</p>
            </CardContent>
          </Card>
        </Link>
      </div>

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
                    <div className="p-2 rounded-lg bg-gray-100">
                      {content.type === "summary" && <FileText className="h-4 w-4" />}
                      {content.type === "video" && <Video className="h-4 w-4" />}
                      {content.type === "quiz" && <CheckSquare className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{content.title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {content.createdAt}
                        <Users className="h-3 w-3 ml-2" />
                        {content.views} 조회
                      </div>
                    </div>
                  </div>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}