"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  Globe,
  Rss,
  Twitter,
  CheckCircle,
  XCircle
} from "lucide-react"

const sources = [
  {
    id: 1,
    name: "연합뉴스",
    url: "https://www.yna.co.kr",
    type: "news",
    status: "active",
    category: "정치",
    lastCrawl: "2분 전",
    itemsCollected: 1247,
    successRate: 98.5
  },
  {
    id: 2,
    name: "조선일보",
    url: "https://www.chosun.com",
    type: "news",
    status: "active",
    category: "경제",
    lastCrawl: "5분 전",
    itemsCollected: 892,
    successRate: 96.2
  },
  {
    id: 3,
    name: "네이버 뉴스",
    url: "https://news.naver.com",
    type: "rss",
    status: "active",
    category: "종합",
    lastCrawl: "진행중",
    itemsCollected: 2156,
    successRate: 94.7
  },
  {
    id: 4,
    name: "트위터 API",
    url: "https://api.twitter.com",
    type: "social",
    status: "error",
    category: "소셜미디어",
    lastCrawl: "15분 전",
    itemsCollected: 0,
    successRate: 0
  },
  {
    id: 5,
    name: "IT 조선",
    url: "https://it.chosun.com",
    type: "news",
    status: "inactive",
    category: "기술",
    lastCrawl: "2시간 전",
    itemsCollected: 456,
    successRate: 89.3
  }
]

function getTypeIcon(type: string) {
  switch (type) {
    case "news":
      return <Globe className="h-4 w-4" />
    case "rss":
      return <Rss className="h-4 w-4" />
    case "social":
      return <Twitter className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-chart-2/10 text-chart-2">활성</Badge>
    case "inactive":
      return <Badge variant="secondary">비활성</Badge>
    case "error":
      return <Badge variant="destructive">오류</Badge>
    default:
      return <Badge variant="outline">알수없음</Badge>
  }
}

export default function CrawlingSources() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || source.type === filterType
    const matchesStatus = filterStatus === "all" || source.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">크롤링 소스 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            크롤링 대상 사이트와 API를 관리합니다
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          새 소스 추가
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="소스 이름 또는 URL 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="타입 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 타입</SelectItem>
                <SelectItem value="news">뉴스 사이트</SelectItem>
                <SelectItem value="rss">RSS 피드</SelectItem>
                <SelectItem value="social">소셜 미디어</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="error">오류</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>크롤링 소스 목록 ({filteredSources.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>소스 정보</TableHead>
                <TableHead>타입</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>마지막 크롤링</TableHead>
                <TableHead>수집 아이템</TableHead>
                <TableHead>성공률</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">{source.url}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(source.type)}
                      <span className="capitalize">{source.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(source.status)}
                  </TableCell>
                  <TableCell>{source.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {source.status === "active" && source.lastCrawl === "진행중" ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                          <span className="text-chart-1">진행중</span>
                        </div>
                      ) : (
                        <span>{source.lastCrawl}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{source.itemsCollected.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {source.successRate > 95 ? (
                        <CheckCircle className="h-4 w-4 text-chart-2" />
                      ) : source.successRate > 80 ? (
                        <CheckCircle className="h-4 w-4 text-chart-4" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>{source.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}