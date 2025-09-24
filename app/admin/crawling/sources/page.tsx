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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type Source = {
  id: number
  name: string
  url: string
  type: string
  status: string
  category: string
  lastCrawl: string
  itemsCollected: number
  successRate: number
  description?: string
  headers?: string
  enabled?: boolean
}

export default function CrawlingSources() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sourcesList, setSourcesList] = useState<Source[]>(sources)

  // Add/Edit source dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<Source | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    type: "news",
    category: "",
    description: "",
    headers: "",
    enabled: true
  })

  // Form handlers
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

  const handleEditSource = (source: Source) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      url: source.url,
      type: source.type,
      category: source.category,
      description: source.description || "",
      headers: source.headers || "",
      enabled: source.status === "active"
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveSource = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      alert("이름과 URL은 필수입니다.")
      return
    }

    const newSource: Source = {
      id: editingSource ? editingSource.id : Math.max(...sourcesList.map(s => s.id)) + 1,
      name: formData.name,
      url: formData.url,
      type: formData.type,
      category: formData.category,
      status: formData.enabled ? "active" : "inactive",
      lastCrawl: "아직 없음",
      itemsCollected: 0,
      successRate: 0,
      description: formData.description,
      headers: formData.headers,
      enabled: formData.enabled
    }

    if (editingSource) {
      setSourcesList(prev => prev.map(source =>
        source.id === editingSource.id ? newSource : source
      ))
    } else {
      setSourcesList(prev => [...prev, newSource])
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleDeleteSource = (sourceId: number) => {
    setSourcesList(prev => prev.filter(source => source.id !== sourceId))
  }

  const handleToggleSource = (sourceId: number) => {
    setSourcesList(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, status: source.status === "active" ? "inactive" : "active" }
        : source
    ))
  }

  const filteredSources = sourcesList.filter(source => {
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
        <Button onClick={handleAddSource}>
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
                        onClick={() => handleToggleSource(source.id)}
                        title={source.status === "active" ? "비활성화" : "활성화"}
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
        </CardContent>
      </Card>

      {/* Add/Edit Source Dialog */}
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
            {/* Basic Information */}
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

            {/* Advanced Settings */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="headers" className="text-right mt-2">
                HTTP 헤더
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="headers"
                  value={formData.headers}
                  onChange={(e) => setFormData(prev => ({ ...prev, headers: e.target.value }))}
                  placeholder={`User-Agent: Mozilla/5.0...\nAuthorization: Bearer token\nContent-Type: application/json`}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JSON 형식으로 입력하거나 key: value 형식으로 각 줄에 입력하세요
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveSource}>
              {editingSource ? "수정" : "추가"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}