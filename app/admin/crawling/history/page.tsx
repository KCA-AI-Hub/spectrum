"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { toast } from "sonner"
import {
  Search,
  Trash2,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react"

interface SearchHistoryItem {
  id: string
  searchQuery: string
  resultCount: number
  searchTime: number
  status: string
  createdAt: string
  keyword?: {
    keyword: string
    isFavorite: boolean
  }
}

export default function SearchHistoryPage() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchHistory()
  }, [page])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/search-history?page=${page}&pageSize=20`)
      if (!response.ok) throw new Error('Failed to fetch history')

      const data = await response.json()
      setHistory(data.history || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('검색 기록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(history.map(h => h.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return

    try {
      const response = await fetch(`/api/search-history?ids=${selectedIds.join(',')}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete history')

      toast.success(`${selectedIds.length}개의 기록이 삭제되었습니다`)
      setSelectedIds([])
      await fetchHistory()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('삭제에 실패했습니다')
    }
  }

  const handleExport = () => {
    const csv = [
      ['검색어', '결과 수', '검색 시간(초)', '상태', '날짜'].join(','),
      ...history.map(h => [
        h.searchQuery,
        h.resultCount,
        h.searchTime.toFixed(2),
        h.status,
        new Date(h.createdAt).toLocaleString('ko-KR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `search-history-${Date.now()}.csv`
    link.click()

    toast.success('검색 기록이 내보내기 되었습니다')
  }

  const filteredHistory = history.filter(h =>
    h.searchQuery.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSearches = history.length
  const avgSearchTime = history.length > 0
    ? history.reduce((sum, h) => sum + h.searchTime, 0) / history.length
    : 0
  const totalResults = history.reduce((sum, h) => sum + h.resultCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">검색 기록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            검색 이력을 조회하고 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  선택 삭제 ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>검색 기록 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedIds.length}개의 검색 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">총 검색 횟수</span>
            </div>
            <div className="text-2xl font-bold mt-2">{totalSearches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">평균 검색 시간</span>
            </div>
            <div className="text-2xl font-bold mt-2">{avgSearchTime.toFixed(2)}초</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">총 결과 수</span>
            </div>
            <div className="text-2xl font-bold mt-2">{totalResults.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>검색 기록 ({total}개)</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="검색어 필터링..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              검색 기록이 없습니다
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === history.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>검색어</TableHead>
                  <TableHead>결과 수</TableHead>
                  <TableHead>검색 시간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>날짜</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.searchQuery}</span>
                        {item.keyword?.isFavorite && (
                          <Badge variant="secondary" className="text-xs">즐겨찾기</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.resultCount.toLocaleString()}개</TableCell>
                    <TableCell>{item.searchTime.toFixed(2)}초</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'COMPLETED' ? 'default' :
                        item.status === 'IN_PROGRESS' ? 'secondary' :
                        'destructive'
                      }>
                        {item.status === 'COMPLETED' ? '완료' :
                         item.status === 'IN_PROGRESS' ? '진행중' :
                         '실패'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
