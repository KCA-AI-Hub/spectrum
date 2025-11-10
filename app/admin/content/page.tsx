"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { toast } from "sonner"
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  Globe,
  Calendar,
  Tag,
  TrendingUp,
  RefreshCw
} from "lucide-react"

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

export default function ContentManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("extractedAt")
  const [sortOrder, setSortOrder] = useState("desc")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    raw: 0,
    failed: 0
  })

  useEffect(() => {
    fetchArticles()
    fetchStats()
  }, [page, statusFilter, sortBy, sortOrder])

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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/articles/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
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
      await fetchStats()
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

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">콘텐츠 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            수집된 뉴스 기사를 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchArticles}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={articles.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">전체 기사</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">처리 완료</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.processed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">원본 데이터</span>
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.raw.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">처리 실패</span>
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
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
              <SelectTrigger className="w-[150px]">
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
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extractedAt">수집일순</SelectItem>
                <SelectItem value="publishedAt">발행일순</SelectItem>
                <SelectItem value="relevanceScore">관련도순</SelectItem>
                <SelectItem value="title">제목순</SelectItem>
              </SelectContent>
            </Select>
            {selectedArticleIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    선택 삭제 ({selectedArticleIds.length})
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
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>기사 목록 ({total.toLocaleString()}개)</CardTitle>
            {selectedArticleIds.length > 0 && (
              <Badge variant="secondary">
                {selectedArticleIds.length}개 선택됨
              </Badge>
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

          {/* Pagination */}
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

      {/* Article Detail Modal */}
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
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
                {selectedArticle.keywordMatches.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">키워드</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.keywordMatches.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                  <span>수집일: {new Date(selectedArticle.extractedAt).toLocaleString('ko-KR')}</span>
                  {selectedArticle.relevanceScore && (
                    <span>관련도: {selectedArticle.relevanceScore}%</span>
                  )}
                  <Badge variant={
                    selectedArticle.status === 'PROCESSED' ? 'default' :
                    selectedArticle.status === 'RAW' ? 'secondary' :
                    'destructive'
                  }>
                    {selectedArticle.status}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
