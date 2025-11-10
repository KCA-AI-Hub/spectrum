"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Play,
  X,
  Loader2,
  Plus,
  CheckCircle,
  History
} from "lucide-react"

interface SearchHistoryItem {
  id: string
  searchQuery: string
  resultCount: number
  searchTime: number
  filters: string | null
  createdAt: string
}

export default function ScrapingJobsPage() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [maxArticles, setMaxArticles] = useState(20)
  const [relevanceThreshold, setRelevanceThreshold] = useState(10)
  const [isRunning, setIsRunning] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  const fetchSearchHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await fetch('/api/search-history?page=1&pageSize=10')
      if (!response.ok) throw new Error('Failed to fetch history')

      const data = await response.json()
      setSearchHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleLoadHistory = (historyId: string) => {
    const selected = searchHistory.find(h => h.id === historyId)
    if (!selected) return

    try {
      const filters = selected.filters ? JSON.parse(selected.filters) : {}

      if (selected.searchQuery) {
        const keywordsFromQuery = selected.searchQuery.split(',').map(k => k.trim()).filter(Boolean)
        setKeywords(keywordsFromQuery)
      }

      if (filters.maxArticles) {
        setMaxArticles(filters.maxArticles)
      }

      if (filters.relevanceThreshold !== undefined) {
        setRelevanceThreshold(filters.relevanceThreshold)
      }

      toast.success('이전 검색 설정을 불러왔습니다')
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('검색 기록을 불러오는데 실패했습니다')
    }
  }

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleStartScraping = async () => {
    if (keywords.length === 0) {
      toast.error('최소 하나 이상의 키워드를 입력하세요')
      return
    }

    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/scraping/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          maxArticles,
          relevanceThreshold,
          enableAutoBackup: false
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start scraping')
      }

      const data = await response.json()
      setResult(data.result)
      setJobId(data.result?.jobId || null)

      toast.success('스크래핑이 완료되었습니다')
    } catch (error) {
      console.error('Scraping error:', error)
      toast.error(error instanceof Error ? error.message : '스크래핑 실행에 실패했습니다')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">스크래핑 작업</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          뉴스 스크래핑 작업을 생성하고 실행합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>작업 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <History className="h-4 w-4" />
              이전 검색 불러오기
            </Label>
            <Select onValueChange={handleLoadHistory} disabled={historyLoading || isRunning}>
              <SelectTrigger>
                <SelectValue placeholder={historyLoading ? "불러오는 중..." : "검색 기록 선택"} />
              </SelectTrigger>
              <SelectContent>
                {searchHistory.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    검색 기록이 없습니다
                  </SelectItem>
                ) : (
                  searchHistory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate max-w-[200px]">{item.searchQuery}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>키워드</Label>
            <div className="flex gap-2">
              <Input
                placeholder="키워드 입력 후 추가 버튼 클릭"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddKeyword()
                  }
                }}
                disabled={isRunning}
              />
              <Button
                onClick={handleAddKeyword}
                size="icon"
                disabled={isRunning}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="pl-3 pr-1">
                    {keyword}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 ml-1"
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isRunning}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>최대 수집 기사 수: {maxArticles}개</Label>
              <Slider
                value={[maxArticles]}
                onValueChange={(value) => setMaxArticles(value[0])}
                min={5}
                max={50}
                step={5}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label>관련도 임계값: {relevanceThreshold}%</Label>
              <Slider
                value={[relevanceThreshold]}
                onValueChange={(value) => setRelevanceThreshold(value[0])}
                min={0}
                max={50}
                step={5}
                disabled={isRunning}
              />
            </div>
          </div>

          <Button
            onClick={handleStartScraping}
            disabled={isRunning || keywords.length === 0}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                스크래핑 진행중...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                스크래핑 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>진행 상황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">뉴스 기사를 검색하고 수집하는 중...</span>
              </div>
              <Progress value={50} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              완료
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobId && (
              <div className="text-sm">
                <span className="text-muted-foreground">작업 ID:</span>{' '}
                <code className="bg-muted px-2 py-1 rounded">{jobId}</code>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">상태</div>
                <Badge variant={
                  result.status === 'COMPLETED' ? 'default' :
                  result.status === 'FAILED' ? 'destructive' :
                  'secondary'
                }>
                  {result.status === 'COMPLETED' ? '완료' :
                   result.status === 'FAILED' ? '실패' :
                   result.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">처리된 기사</div>
                <div className="text-2xl font-bold">
                  {result.statistics?.processedItems || 0}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">저장된 기사</div>
                <div className="text-2xl font-bold">
                  {result.statistics?.savedItems || 0}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">중복 제외</div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {result.statistics?.duplicateCount || 0}
                </div>
              </div>
            </div>

            {result.warnings && result.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">경고</div>
                <div className="space-y-1">
                  {result.warnings.map((warning: string, idx: number) => (
                    <div key={idx} className="text-sm text-yellow-600 dark:text-yellow-500">
                      • {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">오류</div>
                <div className="space-y-1">
                  {result.errors.map((error: string, idx: number) => (
                    <div key={idx} className="text-sm text-destructive">
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => window.location.href = '/admin/crawling/search'}
              className="w-full"
            >
              수집된 기사 확인
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
