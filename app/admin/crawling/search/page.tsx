"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import {
  Search,
  Plus,
  X,
  Play,
  Pause,
  Settings,
  Filter,
  Calendar,
  TrendingUp,
  Eye,
  ExternalLink,
  Loader2,
  Star,
  Trash2,
  Download,
  History
} from "lucide-react"
import { useScraping, useArticles } from "@/lib/hooks/use-scraping"
import type { ScrapingJobRequest, ArticleFilter, ScrapedArticle } from "@/lib/types/scraping"
import type { NewsSource } from "@/lib/types/news-source"

interface SearchHistoryItem {
  id: string
  searchQuery: string
  resultCount: number
  searchTime: number
  filters: string | null
  createdAt: string
}

export default function CrawlingSearch() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState("")
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [sources, setSources] = useState<NewsSource[]>([])
  const [maxArticles, setMaxArticles] = useState(50)
  const [relevanceThreshold, setRelevanceThreshold] = useState(10)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ScrapedArticle | null>(null)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)
  const [favoriteKeywords, setFavoriteKeywords] = useState<string[]>([])
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [filter, setFilter] = useState<ArticleFilter>({
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const { startScraping, cancelJob, progress, currentJobId, loading } = useScraping()
  const { articles, total, page, setPage, loading: articlesLoading, refresh } = useArticles(filter)

  useEffect(() => {
    fetchSources()
    fetchFavoriteKeywords()
    fetchSearchHistory()
  }, [])

  const fetchFavoriteKeywords = async () => {
    try {
      const response = await fetch('/api/keywords?action=favorites')
      if (!response.ok) throw new Error('Failed to fetch favorites')

      const data = await response.json()
      setFavoriteKeywords(data.keywords?.map((k: any) => k.keyword) || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

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

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/news-sources?status=active')
      if (!response.ok) throw new Error('Failed to fetch sources')

      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Error fetching sources:', error)
      toast.error('소스 목록을 불러오는데 실패했습니다')
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

      if (filters.sources && Array.isArray(filters.sources)) {
        setSelectedSources(filters.sources)
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

    try {
      const request: ScrapingJobRequest = {
        keywords,
        sources: selectedSources.length > 0 ? selectedSources : undefined,
        maxArticles,
        relevanceThreshold,
        enableAutoBackup: true
      }

      await startScraping(request)
      toast.success('스크래핑이 시작되었습니다')
    } catch (error) {
      console.error('Scraping error:', error)
      toast.error(error instanceof Error ? error.message : '스크래핑 시작에 실패했습니다')
    }
  }

  const handleCancelScraping = async () => {
    if (currentJobId) {
      try {
        await cancelJob(currentJobId)
        toast.success('스크래핑이 취소되었습니다')
      } catch (error) {
        toast.error('스크래핑 취소에 실패했습니다')
      }
    }
  }

  const handleViewArticle = (article: ScrapedArticle) => {
    setSelectedArticle(article)
    setIsArticleModalOpen(true)
  }

  const handleToggleFavorite = async (keyword: string) => {
    try {
      const isFavorite = favoriteKeywords.includes(keyword)

      if (isFavorite) {
        // Find and unfavorite
        const response = await fetch('/api/keywords?action=favorites')
        const data = await response.json()
        const keywordObj = data.keywords?.find((k: any) => k.keyword === keyword)

        if (keywordObj) {
          await fetch(`/api/keywords/${keywordObj.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: false })
          })
          toast.success('즐겨찾기가 해제되었습니다')
        }
      } else {
        // Add to favorites
        await fetch('/api/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword,
            isFavorite: true
          })
        })
        toast.success('즐겨찾기에 추가되었습니다')
      }

      await fetchFavoriteKeywords()
    } catch (error) {
      console.error('Toggle favorite error:', error)
      toast.error('즐겨찾기 처리에 실패했습니다')
    }
  }

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return text

    let result = text
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      result = result.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    })
    return result
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticleIds(articles.map(a => a.id))
    } else {
      setSelectedArticleIds([])
    }
  }

  const handleSelectArticle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedArticleIds([...selectedArticleIds, id])
    } else {
      setSelectedArticleIds(selectedArticleIds.filter(i => i !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedArticleIds.length === 0) return

    try {
      const response = await fetch(`/api/articles?ids=${selectedArticleIds.join(',')}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete articles')

      toast.success(`${selectedArticleIds.length}개의 기사가 삭제되었습니다`)
      setSelectedArticleIds([])
      await refresh()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('삭제에 실패했습니다')
    }
  }

  const handleExportArticles = () => {
    const csv = [
      ['제목', '소스', '작성자', '날짜', '관련도', 'URL'].join(','),
      ...articles.map(a => [
        `"${a.title.replace(/"/g, '""')}"`,
        a.sourceName,
        a.author || '',
        a.publishedAt ? new Date(a.publishedAt).toLocaleString('ko-KR') : '',
        a.relevanceScore || '',
        a.url
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `articles-${Date.now()}.csv`
    link.click()

    toast.success('기사 목록이 내보내기 되었습니다')
  }

  const isRunning = progress?.status === 'running'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">키워드 검색</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            키워드로 뉴스를 검색하고 수집합니다
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <History className="h-4 w-4" />
              이전 검색 불러오기
            </Label>
            <Select onValueChange={handleLoadHistory} disabled={historyLoading || loading}>
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
              />
              <Button onClick={handleAddKeyword} size="icon">
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
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>소스 선택</Label>
              <Select
                value={selectedSources.length > 0 ? selectedSources[0] : 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedSources([])
                  } else {
                    setSelectedSources([value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="모든 소스" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 소스</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                고급 설정
              </Button>
              {isRunning ? (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelScraping}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  중지
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  onClick={handleStartScraping}
                  disabled={loading || keywords.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  검색 시작
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>검색 진행 상황</span>
              <Badge variant={
                progress.status === 'running' ? 'default' :
                progress.status === 'completed' ? 'secondary' :
                'destructive'
              }>
                {progress.status === 'running' ? '진행중' :
                 progress.status === 'completed' ? '완료' :
                 progress.status === 'failed' ? '실패' : '대기'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>전체 진행률</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <Progress value={progress.progress} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">처리된 기사</div>
                <div className="text-2xl font-bold">{progress.processedArticles}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">총 기사</div>
                <div className="text-2xl font-bold">{progress.totalArticles}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">완료된 소스</div>
                <div className="text-2xl font-bold">{progress.completedSources}/{progress.totalSources}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">실패한 기사</div>
                <div className="text-2xl font-bold text-destructive">{progress.failedArticles}</div>
              </div>
            </div>

            {progress.currentSource && (
              <div className="text-sm text-muted-foreground">
                현재 처리 중: {progress.currentSource}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>검색 결과 ({total}개)</CardTitle>
              {selectedArticleIds.length > 0 && (
                <Badge variant="secondary">
                  {selectedArticleIds.length}개 선택됨
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportArticles}
                disabled={articles.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                내보내기
              </Button>
              {selectedArticleIds.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      선택 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>기사 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedArticleIds.length}개의 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Select
                value={filter.sortBy}
                onValueChange={(value) => setFilter({ ...filter, sortBy: value as any })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">날짜순</SelectItem>
                  <SelectItem value="relevance">관련도순</SelectItem>
                  <SelectItem value="title">제목순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              검색된 기사가 없습니다
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={selectedArticleIds.length === articles.length && articles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">전체 선택</span>
              </div>
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedArticleIds.includes(article.id)}
                      onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 cursor-pointer" onClick={() => handleViewArticle(article)}>
                      <h3 className="font-medium text-lg mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.sourceName}</span>
                        {article.author && <span>by {article.author}</span>}
                        {article.publishedAt && (
                          <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
                        )}
                        {article.relevanceScore && (
                          <Badge variant="outline" className="ml-auto">
                            관련도: {article.relevanceScore}%
                          </Badge>
                        )}
                      </div>
                      {article.keywordMatches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.keywordMatches.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewArticle(article)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>고급 설정</DialogTitle>
            <DialogDescription>
              스크래핑 상세 옵션을 설정합니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>최대 수집 기사 수: {maxArticles}개</Label>
              <Slider
                value={[maxArticles]}
                onValueChange={(value) => setMaxArticles(value[0])}
                min={10}
                max={200}
                step={10}
              />
            </div>
            <div className="space-y-2">
              <Label>관련도 임계값: {relevanceThreshold}%</Label>
              <Slider
                value={[relevanceThreshold]}
                onValueChange={(value) => setRelevanceThreshold(value[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsSettingsOpen(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedArticle.sourceName}</span>
                  {selectedArticle.author && <span>by {selectedArticle.author}</span>}
                  {selectedArticle.publishedAt && (
                    <span>{new Date(selectedArticle.publishedAt).toLocaleString('ko-KR')}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    원문 보기
                  </Button>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {selectedArticle.imageUrl && (
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full rounded-lg"
                  />
                )}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: highlightKeywords(selectedArticle.content, selectedArticle.keywordMatches)
                  }}
                />
                {selectedArticle.keywordMatches.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">일치 키워드</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.keywordMatches.map((keyword, idx) => {
                        const isFavorite = favoriteKeywords.includes(keyword)
                        return (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => handleToggleFavorite(keyword)}
                          >
                            <Star
                              className={`h-3 w-3 mr-1 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                            />
                            {keyword}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
