"use client"

import { useState, useEffect } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Plus,
  Edit,
  Trash2,
  Power,
  Globe,
  Rss,
  Twitter,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import type { NewsSource, NewsSourceFormData } from "@/lib/types/news-source"

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

export function SourcesManagementTab() {
  const [sourcesList, setSourcesList] = useState<NewsSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<NewsSourceFormData>({
    name: "",
    url: "",
    type: "news",
    category: "",
    description: "",
    headers: "",
    enabled: true
  })

  useEffect(() => {
    fetchSources()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSources()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchSources = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/news-sources')
      if (!response.ok) throw new Error("Failed to fetch sources")

      const data = await response.json()
      setSourcesList(data.sources || [])
    } catch (error) {
      console.error("Error fetching sources:", error)
      toast.error("소스 목록을 불러오는데 실패했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      type: "news",
      category: "",
      description: "",
      headers: "",
      enabled: true
    })
    setEditingSource(null)
  }

  const handleAddSource = () => {
    setIsAddDialogOpen(true)
    resetForm()
  }

  const handleEditSource = (source: NewsSource) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      url: source.url,
      type: source.type,
      category: source.category,
      description: source.description || "",
      headers: source.headers ? JSON.stringify(source.headers, null, 2) : "",
      enabled: source.enabled
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveSource = async () => {
    if (!formData.name.trim()) {
      toast.error("소스 이름을 입력하세요")
      return
    }

    if (!formData.url.trim()) {
      toast.error("URL을 입력하세요")
      return
    }

    try {
      new URL(formData.url)
    } catch {
      toast.error("올바른 URL 형식을 입력하세요 (예: https://example.com)")
      return
    }

    try {
      setIsSaving(true)

      let headers: Record<string, string> | undefined
      if (formData.headers?.trim()) {
        try {
          headers = JSON.parse(formData.headers)
        } catch {
          headers = {}
          const lines = formData.headers.split('\n')
          for (const line of lines) {
            const [key, ...values] = line.split(':')
            if (key && values.length > 0) {
              headers[key.trim()] = values.join(':').trim()
            }
          }
        }
      }

      const payload = {
        name: formData.name,
        url: formData.url,
        type: formData.type,
        category: formData.category || "일반",
        description: formData.description,
        headers,
        enabled: formData.enabled
      }

      if (editingSource) {
        const response = await fetch(`/api/news-sources/${editingSource.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || "Failed to update source")
        }

        toast.success("소스가 수정되었습니다")
      } else {
        const response = await fetch("/api/news-sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || `Failed to create source (HTTP ${response.status})`)
        }

        toast.success("소스가 추가되었습니다!")
      }

      setIsAddDialogOpen(false)
      resetForm()
      await fetchSources()
    } catch (error) {
      console.error("Error saving source:", error)
      toast.error(error instanceof Error ? error.message : "소스 저장에 실패했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const response = await fetch(`/api/news-sources/${sourceId}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete source")

      toast.success("소스가 삭제되었습니다")
      await fetchSources()
    } catch (error) {
      console.error("Error deleting source:", error)
      toast.error("소스 삭제에 실패했습니다")
    }
  }

  const handleToggleSource = async (sourceId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/news-sources/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled })
      })

      if (!response.ok) throw new Error("Failed to toggle source")

      toast.success(currentEnabled ? "소스가 비활성화되었습니다" : "소스가 활성화되었습니다")
      await fetchSources()
    } catch (error) {
      console.error("Error toggling source:", error)
      toast.error("소스 상태 변경에 실패했습니다")
    }
  }

  const formatLastCrawl = (lastCrawl: Date | string | null | undefined): string => {
    if (!lastCrawl) return "아직 없음"

    const date = typeof lastCrawl === 'string' ? new Date(lastCrawl) : lastCrawl
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "방금 전"
    if (diffMins < 60) return `${diffMins}분 전`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}시간 전`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}일 전`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddSource}>
          <Plus className="h-4 w-4 mr-2" />
          새 소스 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>크롤링 소스 목록 ({sourcesList.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sourcesList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 소스가 없습니다
            </div>
          ) : (
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
                {sourcesList.map((source) => (
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
                        {source.status === "active" && formatLastCrawl(source.lastCrawl) === "방금 전" ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                            <span className="text-chart-1">진행중</span>
                          </div>
                        ) : (
                          <span>{formatLastCrawl(source.lastCrawl)}</span>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSource(source)}
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSource(source.id, source.enabled)}
                          title={source.enabled ? "비활성화" : "활성화"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="삭제">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>소스 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{source.name}" 소스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSource(source.id)}>
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? "소스 편집" : "새 소스 추가"}
            </DialogTitle>
            <DialogDescription>
              크롤링할 소스의 정보를 입력하세요. URL과 이름은 필수 항목입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="예: 네이버 뉴스"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL *
              </Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="col-span-3"
                placeholder="https://news.naver.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                타입
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">뉴스 사이트</SelectItem>
                  <SelectItem value="rss">RSS 피드</SelectItem>
                  <SelectItem value="social">소셜 미디어</SelectItem>
                  <SelectItem value="blog">블로그</SelectItem>
                  <SelectItem value="forum">포럼</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                카테고리
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="col-span-3"
                placeholder="예: 정치, 경제, IT"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                설명
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="소스에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="headers" className="text-right mt-2">
                HTTP 헤더
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="headers"
                  value={formData.headers}
                  onChange={(e) => setFormData(prev => ({ ...prev, headers: e.target.value }))}
                  placeholder={`User-Agent: Mozilla/5.0...\nAuthorization: Bearer token`}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JSON 형식 또는 key: value 형식으로 입력하세요
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enabled" className="text-right">
                활성화
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="enabled" className="text-sm text-muted-foreground">
                  {formData.enabled ? "소스가 활성화됩니다" : "소스가 비활성화됩니다"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                resetForm()
              }}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button onClick={handleSaveSource} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장중...
                </>
              ) : (
                <>{editingSource ? "수정" : "추가"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
