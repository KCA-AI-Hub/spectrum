"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  Globe,
  Calendar,
  Tag,
  RefreshCw,
  History,
  Star
} from "lucide-react"

interface SearchHistoryItem {
  id: string
  searchQuery: string
  resultCount: number
  searchTime: number
  filters: string | null
  createdAt: string
}

interface Article {
  id: string
  title: string
  content: string
  url: string
  author?: string
  publishedAt?: string
  extractedAt: string
  imageUrl?: string
  sourceName: string
  sourceUrl: string
  relevanceScore?: number
  keywordMatches: string[]
  status: string
}

export function SearchAndArticlesTab() {
  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [maxArticles, setMaxArticles] = useState<number>(30)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [favoriteKeywords, setFavoriteKeywords] = useState<string[]>([])

  // Articles states
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("extractedAt")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    fetchArticles()
    fetchSearchHistory()
    fetchFavoriteKeywords()
  }, [page, statusFilter, sortBy, sortOrder])

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history?page=1&pageSize=5')
      if (!response.ok) throw new Error('Failed to fetch history')

      const data = await response.json()
      setSearchHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
    }
  }

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchProgress(0)

    try {
      const keywords = searchQuery.split(',').map(k => k.trim()).filter(Boolean)

      const response = await fetch('/api/scraping/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          maxArticles,
          relevanceThreshold: 10,
          enableAutoBackup: false
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start search')
      }

      toast.success('검색이 완료되었습니다')
      await fetchArticles()
      await fetchSearchHistory()
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : '검색에 실패했습니다')
    } finally {
      setIsSearching(false)
      setSearchProgress(100)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        sortBy,
        sortOrder
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toUpperCase())
      }

      const response = await fetch(`/api/articles?${params}`)
      if (!response.ok) throw new Error('Failed to fetch articles')

      const data = await response.json()
      setArticles(data.articles || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('기사 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
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
      await fetchArticles()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('삭제에 실패했습니다')
    }
  }

  const handleExport = () => {
    const csv = [
      ['제목', '소스', '작성자', '발행일', '수집일', '관련도', 'URL'].join(','),
      ...articles.map(a => [
        `"${a.title.replace(/"/g, '""')}"`,
        a.sourceName,
        a.author || '',
        a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('ko-KR') : '',
        new Date(a.extractedAt).toLocaleDateString('ko-KR'),
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

  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article)
    setIsArticleModalOpen(true)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>키워드 검색</CardTitle>
          <CardDescription>키워드를 입력하여 새로운 뉴스를 검색하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색할 키워드를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Select value={maxArticles.toString()} onValueChange={(value) => setMaxArticles(parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10개 기사</SelectItem>
                <SelectItem value="20">20개 기사</SelectItem>
                <SelectItem value="30">30개 기사</SelectItem>
                <SelectItem value="50">50개 기사</SelectItem>
                <SelectItem value="100">100개 기사</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  검색 중
                </>
              ) : (
                "검색"
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  최근 검색
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>최근 검색어</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {searchHistory.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    검색 기록이 없습니다
                  </div>
                ) : (
                  searchHistory.map((item) => (
                    <DropdownMenuItem key={item.id} onClick={() => setSearchQuery(item.searchQuery)}>
                      <div className="flex flex-col gap-1">
                        <span>{item.searchQuery}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {favoriteKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">즐겨찾기 키워드</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favoriteKeywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">뉴스 기사를 검색하고 수집하는 중...</span>
              </div>
              <Progress value={searchProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles List with Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>기사 목록 ({total.toLocaleString()}개)</CardTitle>
            {selectedArticleIds.length > 0 && (
              <Badge variant="secondary">
                {selectedArticleIds.length}개 선택됨
              </Badge>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="제목 또는 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="processed">처리 완료</SelectItem>
                <SelectItem value="raw">원본</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extractedAt">수집일순</SelectItem>
                <SelectItem value="publishedAt">발행일순</SelectItem>
                <SelectItem value="relevanceScore">관련도순</SelectItem>
                <SelectItem value="title">제목순</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchArticles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport} disabled={articles.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
            {selectedArticleIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제 ({selectedArticleIds.length})
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>기사가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                <Checkbox
                  checked={selectedArticleIds.length === articles.length && articles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">전체 선택</span>
              </div>
              {filteredArticles.map((article) => (
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
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-lg flex-1">{article.title}</h3>
                        <Badge variant={
                          article.status === 'PROCESSED' ? 'default' :
                          article.status === 'RAW' ? 'secondary' :
                          'destructive'
                        }>
                          {article.status === 'PROCESSED' ? '처리완료' :
                           article.status === 'RAW' ? '원본' :
                           '실패'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {article.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {article.sourceName}
                        </div>
                        {article.author && (
                          <span>by {article.author}</span>
                        )}
                        {article.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                        <span>수집: {new Date(article.extractedAt).toLocaleDateString('ko-KR')}</span>
                        {article.relevanceScore && (
                          <Badge variant="outline" className="ml-auto">
                            관련도: {article.relevanceScore}%
                          </Badge>
                        )}
                      </div>
                      {article.keywordMatches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {article.keywordMatches.slice(0, 5).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {article.keywordMatches.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.keywordMatches.length - 5}
                            </Badge>
                          )}
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

          {total > 20 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {((page - 1) * 20) + 1} - {Math.min(page * 20, total)} / {total}개
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Detail Modal - Enhanced */}
      <Dialog open={isArticleModalOpen} onOpenChange={setIsArticleModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1400px] h-[90vh] flex flex-col p-0 gap-0">
          {selectedArticle && (
            <>
              <DialogHeader className="px-8 pt-6 pb-4 space-y-3 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <DialogTitle className="text-2xl leading-tight pr-8">
                      {selectedArticle.title}
                    </DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="font-medium">{selectedArticle.sourceName}</span>
                      </span>
                      {selectedArticle.author && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <span>{selectedArticle.author}</span>
                        </>
                      )}
                      {selectedArticle.publishedAt && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(selectedArticle.publishedAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <Badge variant={
                      selectedArticle.status === 'PROCESSED' ? 'default' :
                      selectedArticle.status === 'RAW' ? 'secondary' :
                      'destructive'
                    } className="text-xs">
                      {selectedArticle.status === 'PROCESSED' ? '처리완료' :
                       selectedArticle.status === 'RAW' ? '원본' :
                       '실패'}
                    </Badge>
                    {selectedArticle.relevanceScore && (
                      <Badge variant="outline" className="text-xs font-semibold">
                        관련도 {selectedArticle.relevanceScore}%
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedArticle.keywordMatches.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {selectedArticle.keywordMatches.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogHeader>

              <Separator className="shrink-0" />

              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="px-8 py-6 space-y-6">
                    {selectedArticle.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden border bg-muted max-w-4xl mx-auto">
                        <img
                          src={selectedArticle.imageUrl}
                          alt={selectedArticle.title}
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    <div className="prose prose-base max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap leading-relaxed text-foreground text-base">
                        {selectedArticle.content}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-muted/30 p-4 rounded-lg">
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">수집 정보</div>
                        <div className="text-foreground">
                          {new Date(selectedArticle.extractedAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">원문 URL</div>
                        <a
                          href={selectedArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 break-all"
                        >
                          <span>{selectedArticle.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              <Separator className="shrink-0" />

              <div className="px-8 py-4 flex items-center justify-between bg-muted/30 shrink-0">
                <div className="text-xs text-muted-foreground">
                  ID: {selectedArticle.id}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => window.open(selectedArticle.url, '_blank')}
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    원문 보기
                  </Button>
                  <Button
                    onClick={() => setIsArticleModalOpen(false)}
                    size="sm"
                    variant="outline"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
