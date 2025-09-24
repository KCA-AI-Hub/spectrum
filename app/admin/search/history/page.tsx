"use client"

import { useState } from "react"
import { History, Search, Trash2, Clock, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type SearchHistoryItem = {
  id: string
  keyword: string
  searchTime: string
  resultCount: number
  filters: {
    source?: string
    category?: string
    dateRange?: string
  }
  executionTime: number // ms
}

const mockSearchHistory: SearchHistoryItem[] = [
  {
    id: "1",
    keyword: "AI 기술 동향",
    searchTime: "2024-01-15T10:30:00",
    resultCount: 127,
    filters: {
      category: "IT/과학",
      dateRange: "최근 7일"
    },
    executionTime: 1250
  },
  {
    id: "2",
    keyword: "블록체인 투자",
    searchTime: "2024-01-15T09:45:00",
    resultCount: 89,
    filters: {
      source: "네이버 뉴스",
      category: "경제"
    },
    executionTime: 2100
  },
  {
    id: "3",
    keyword: "메타버스",
    searchTime: "2024-01-14T16:20:00",
    resultCount: 203,
    filters: {},
    executionTime: 980
  },
  {
    id: "4",
    keyword: "전기차 시장",
    searchTime: "2024-01-14T14:15:00",
    resultCount: 156,
    filters: {
      dateRange: "최근 30일"
    },
    executionTime: 1680
  },
  {
    id: "5",
    keyword: "스타트업 투자",
    searchTime: "2024-01-13T11:30:00",
    resultCount: 78,
    filters: {
      source: "구글 뉴스",
      category: "경제"
    },
    executionTime: 1450
  }
]

const popularKeywords = [
  { keyword: "AI", count: 15 },
  { keyword: "블록체인", count: 12 },
  { keyword: "메타버스", count: 8 },
  { keyword: "전기차", count: 7 },
  { keyword: "NFT", count: 6 },
  { keyword: "스타트업", count: 5 },
]

export default function SearchHistoryPage() {
  const [searchHistory, setSearchHistory] = useState(mockSearchHistory)
  const [filterQuery, setFilterQuery] = useState("")

  const filteredHistory = searchHistory.filter(item =>
    item.keyword.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const handleDeleteHistory = (id: string) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id))
  }

  const handleClearAllHistory = () => {
    setSearchHistory([])
  }

  const handleRepeatSearch = (keyword: string) => {
    // TODO: Navigate to search page with this keyword
    console.log("Repeat search for:", keyword)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getFilterBadges = (filters: SearchHistoryItem["filters"]) => {
    const badges = []
    if (filters.source) badges.push({ text: filters.source, variant: "secondary" as const })
    if (filters.category) badges.push({ text: filters.category, variant: "default" as const })
    if (filters.dateRange) badges.push({ text: filters.dateRange, variant: "outline" as const })
    return badges
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">검색 기록</h1>
          <p className="text-muted-foreground">과거 검색 내역과 통계를 확인할 수 있습니다</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={searchHistory.length === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>검색 기록 전체 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  모든 검색 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllHistory}>삭제</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 검색 횟수</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              오늘 3회 검색
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 응답 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(searchHistory.reduce((acc, item) => acc + item.executionTime, 0) / searchHistory.length)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              지난주 대비 -200ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 검색 결과</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(searchHistory.reduce((acc, item) => acc + item.resultCount, 0) / searchHistory.length)}개
            </div>
            <p className="text-xs text-muted-foreground">
              검색당 평균 결과 수
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 검색 기록 테이블 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              검색 기록
            </CardTitle>
            <CardDescription>최근 검색한 키워드와 결과를 확인할 수 있습니다</CardDescription>
            <div className="flex items-center gap-2">
              <Input
                placeholder="검색 기록 내에서 찾기..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>검색 기록이 없습니다</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>키워드</TableHead>
                      <TableHead>검색 시간</TableHead>
                      <TableHead>결과 수</TableHead>
                      <TableHead>필터</TableHead>
                      <TableHead>응답시간</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium cursor-pointer text-primary hover:underline"
                               onClick={() => handleRepeatSearch(item.keyword)}>
                            {item.keyword}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(item.searchTime)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.resultCount}개</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getFilterBadges(item.filters).map((badge, index) => (
                              <Badge key={index} variant={badge.variant} className="text-xs">
                                {badge.text}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.executionTime}ms
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRepeatSearch(item.keyword)}
                            >
                              <Search className="h-3 w-3 mr-1" />
                              재검색
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteHistory(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 인기 검색어 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              인기 검색어
            </CardTitle>
            <CardDescription>자주 검색한 키워드 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularKeywords.map((item, index) => (
                <div key={item.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {index + 1}
                    </div>
                    <span
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleRepeatSearch(item.keyword)}
                    >
                      {item.keyword}
                    </span>
                  </div>
                  <Badge variant="outline">{item.count}회</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}