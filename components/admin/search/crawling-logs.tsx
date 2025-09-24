"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, XCircle, Info, Eye, Download, Filter as FilterIcon } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type LogLevel = "info" | "warning" | "error" | "success"

type CrawlingLog = {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  details?: string
  url?: string
  duration?: number
  retryCount?: number
}

const mockLogs: CrawlingLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15T10:30:15.123Z",
    level: "success",
    source: "Firecrawl API",
    message: "네이버 뉴스 크롤링 완료",
    details: "AI 기술 동향 키워드로 45개 기사 성공적으로 수집",
    url: "https://news.naver.com/search",
    duration: 2340
  },
  {
    id: "2",
    timestamp: "2024-01-15T10:29:45.789Z",
    level: "warning",
    source: "네이버 API",
    message: "일부 기사 접근 제한",
    details: "로그인이 필요한 기사 3개를 건너뜀. 공개 기사만 수집함",
    url: "https://news.naver.com/article/123",
    duration: 1200,
    retryCount: 1
  },
  {
    id: "3",
    timestamp: "2024-01-15T10:29:12.456Z",
    level: "error",
    source: "구글 뉴스",
    message: "HTTP 429 - 요청 제한 초과",
    details: "구글 뉴스 API 요청 한도를 초과했습니다. 1시간 후 재시도 필요",
    url: "https://news.google.com/search",
    retryCount: 3
  },
  {
    id: "4",
    timestamp: "2024-01-15T10:28:30.789Z",
    level: "info",
    source: "다음 뉴스",
    message: "크롤링 작업 시작",
    details: "블록체인 키워드 검색 시작. 예상 소요 시간: 2-3분",
    url: "https://news.daum.net/search"
  },
  {
    id: "5",
    timestamp: "2024-01-15T10:27:58.123Z",
    level: "error",
    source: "OpenAI API",
    message: "텍스트 분석 실패",
    details: "API 응답 시간 초과. 텍스트가 너무 길어서 분할 처리 필요",
    retryCount: 2
  },
  {
    id: "6",
    timestamp: "2024-01-15T10:27:30.456Z",
    level: "success",
    source: "데이터베이스",
    message: "검색 결과 저장 완료",
    details: "127개 기사가 SQLite 데이터베이스에 성공적으로 저장됨",
    duration: 850
  }
]

export function CrawlingLogs() {
  const [logs, setLogs] = useState(mockLogs)
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === "all" || log.level === filterLevel
    const matchesSource = filterSource === "all" || log.source === filterSource
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesLevel && matchesSource && matchesSearch
  })

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadge = (level: LogLevel) => {
    const variants = {
      success: "default" as const,
      warning: "secondary" as const,
      error: "destructive" as const,
      info: "outline" as const
    }

    const labels = {
      success: "성공",
      warning: "경고",
      error: "오류",
      info: "정보"
    }

    return (
      <Badge variant={variants[level]} className="text-xs">
        {labels[level]}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      month: "short",
      day: "numeric"
    })
  }

  const sources = Array.from(new Set(logs.map(log => log.source)))

  const exportLogs = () => {
    const logData = filteredLogs.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      source: log.source,
      message: log.message,
      details: log.details || "",
      url: log.url || "",
      duration: log.duration || 0,
      retryCount: log.retryCount || 0
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `crawling-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const logCounts = {
    total: logs.length,
    success: logs.filter(log => log.level === "success").length,
    warning: logs.filter(log => log.level === "warning").length,
    error: logs.filter(log => log.level === "error").length,
    info: logs.filter(log => log.level === "info").length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              크롤링 로그
            </CardTitle>
            <CardDescription>
              실시간 크롤링 작업 로그와 오류 현황을 확인할 수 있습니다
            </CardDescription>
          </div>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            로그 내보내기
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold">{logCounts.total}</div>
            <div className="text-xs text-muted-foreground">전체</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-green-600">{logCounts.success}</div>
            <div className="text-xs text-muted-foreground">성공</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{logCounts.warning}</div>
            <div className="text-xs text-muted-foreground">경고</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-red-600">{logCounts.error}</div>
            <div className="text-xs text-muted-foreground">오류</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-bold text-blue-600">{logCounts.info}</div>
            <div className="text-xs text-muted-foreground">정보</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-4">
          <Input
            placeholder="로그 메시지 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="레벨" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="success">성공</SelectItem>
              <SelectItem value="warning">경고</SelectItem>
              <SelectItem value="error">오류</SelectItem>
              <SelectItem value="info">정보</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="소스" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 소스</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 로그 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">레벨</TableHead>
                <TableHead className="w-32">시간</TableHead>
                <TableHead className="w-32">소스</TableHead>
                <TableHead>메시지</TableHead>
                <TableHead className="w-20">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    조건에 맞는 로그가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.level)}
                        {getLevelBadge(log.level)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {log.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{log.message}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {log.duration && (
                            <span>⏱️ {log.duration}ms</span>
                          )}
                          {log.retryCount !== undefined && log.retryCount > 0 && (
                            <span>🔄 {log.retryCount}회 재시도</span>
                          )}
                          {log.url && (
                            <span className="truncate max-w-xs">🔗 {log.url}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getLogIcon(log.level)}
                                로그 상세 내용
                              </DialogTitle>
                              <DialogDescription>
                                {formatTimestamp(log.timestamp)} - {log.source}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-96">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">메시지</h4>
                                  <p className="text-sm text-muted-foreground">{log.message}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">상세 내용</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {log.details}
                                  </p>
                                </div>
                                {log.url && (
                                  <div>
                                    <h4 className="font-medium mb-2">URL</h4>
                                    <p className="text-sm text-muted-foreground break-all">
                                      {log.url}
                                    </p>
                                  </div>
                                )}
                                {(log.duration || log.retryCount !== undefined) && (
                                  <div className="flex gap-4">
                                    {log.duration && (
                                      <div>
                                        <h4 className="font-medium mb-1">소요 시간</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {log.duration}ms
                                        </p>
                                      </div>
                                    )}
                                    {log.retryCount !== undefined && (
                                      <div>
                                        <h4 className="font-medium mb-1">재시도 횟수</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {log.retryCount}회
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}