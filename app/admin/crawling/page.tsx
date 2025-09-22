import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Globe,
  Play,
  Pause,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

const crawlingStats = [
  {
    label: "활성 소스",
    value: "156/160",
    progress: 97.5,
    status: "good"
  },
  {
    label: "오늘 수집",
    value: "1,247",
    progress: 78,
    status: "normal"
  },
  {
    label: "성공률",
    value: "94.2%",
    progress: 94.2,
    status: "good"
  },
  {
    label: "평균 속도",
    value: "2.3초",
    progress: 65,
    status: "warning"
  }
]

const recentCrawls = [
  {
    source: "연합뉴스",
    status: "success",
    items: 45,
    duration: "2분 30초",
    lastRun: "5분 전"
  },
  {
    source: "조선일보",
    status: "success",
    items: 38,
    duration: "1분 45초",
    lastRun: "10분 전"
  },
  {
    source: "네이버 뉴스",
    status: "running",
    items: 0,
    duration: "진행중",
    lastRun: "현재"
  },
  {
    source: "트위터 API",
    status: "error",
    items: 0,
    duration: "실패",
    lastRun: "15분 전"
  }
]

export default function CrawlingManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">크롤링 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            웹 크롤링 소스와 작업을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            긴급 크롤링
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {crawlingStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <Badge variant={stat.status === "good" ? "default" : stat.status === "warning" ? "secondary" : "outline"}>
                  {stat.status === "good" ? "양호" : stat.status === "warning" ? "주의" : "정상"}
                </Badge>
              </div>
              <div className="text-xl font-bold mb-2">{stat.value}</div>
              <Progress value={stat.progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/crawling/sources">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium mb-2">소스 관리</h3>
              <p className="text-sm text-gray-500">크롤링 대상 사이트 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/schedules">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium mb-2">스케줄 관리</h3>
              <p className="text-sm text-gray-500">크롤링 일정 및 주기 설정</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/monitoring">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium mb-2">모니터링</h3>
              <p className="text-sm text-gray-500">실시간 크롤링 상태 확인</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/crawling/quality">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-medium mb-2">데이터 품질</h3>
              <p className="text-sm text-gray-500">수집 데이터 품질 관리</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Crawling Activity */}
      <Card>
        <CardHeader>
          <CardTitle>최근 크롤링 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCrawls.map((crawl, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {crawl.status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {crawl.status === "running" && <Play className="h-5 w-5 text-blue-600" />}
                    {crawl.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="font-medium">{crawl.source}</span>
                  </div>
                  <Badge variant={
                    crawl.status === "success" ? "default" :
                    crawl.status === "running" ? "secondary" :
                    "destructive"
                  }>
                    {crawl.status === "success" ? "완료" :
                     crawl.status === "running" ? "진행중" :
                     "실패"}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>아이템: {crawl.items}</span>
                  <span>소요시간: {crawl.duration}</span>
                  <span>마지막 실행: {crawl.lastRun}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}