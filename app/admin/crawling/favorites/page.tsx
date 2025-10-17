"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Star,
  Plus,
  Trash2,
  Edit,
  Search,
  Loader2
} from "lucide-react"

interface Keyword {
  id: string
  keyword: string
  description?: string
  category?: string
  isFavorite: boolean
  useCount: number
  createdAt: string
  updatedAt: string
}

export default function FavoritesPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    keyword: "",
    description: "",
    category: ""
  })

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/keywords?action=favorites')
      if (!response.ok) throw new Error('Failed to fetch keywords')

      const data = await response.json()
      setKeywords(data.keywords || [])
    } catch (error) {
      console.error('Error fetching keywords:', error)
      toast.error('즐겨찾기 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = async () => {
    if (!formData.keyword.trim()) {
      toast.error('키워드를 입력하세요')
      return
    }

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isFavorite: true
        })
      })

      if (!response.ok) throw new Error('Failed to add keyword')

      toast.success('즐겨찾기가 추가되었습니다')
      setIsAddDialogOpen(false)
      setFormData({ keyword: "", description: "", category: "" })
      await fetchKeywords()
    } catch (error) {
      console.error('Add keyword error:', error)
      toast.error('추가에 실패했습니다')
    }
  }

  const handleUpdateKeyword = async () => {
    if (!editingKeyword) return

    try {
      const response = await fetch(`/api/keywords/${editingKeyword.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          category: formData.category,
          isFavorite: true
        })
      })

      if (!response.ok) throw new Error('Failed to update keyword')

      toast.success('수정되었습니다')
      setEditingKeyword(null)
      setFormData({ keyword: "", description: "", category: "" })
      await fetchKeywords()
    } catch (error) {
      console.error('Update keyword error:', error)
      toast.error('수정에 실패했습니다')
    }
  }

  const handleRemoveFavorite = async (id: string) => {
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: false })
      })

      if (!response.ok) throw new Error('Failed to remove favorite')

      toast.success('즐겨찾기가 해제되었습니다')
      await fetchKeywords()
    } catch (error) {
      console.error('Remove favorite error:', error)
      toast.error('즐겨찾기 해제에 실패했습니다')
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    try {
      const response = await fetch(`/api/keywords/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete keyword')

      toast.success('삭제되었습니다')
      await fetchKeywords()
    } catch (error) {
      console.error('Delete keyword error:', error)
      toast.error('삭제에 실패했습니다')
    }
  }

  const handleEdit = (keyword: Keyword) => {
    setEditingKeyword(keyword)
    setFormData({
      keyword: keyword.keyword,
      description: keyword.description || "",
      category: keyword.category || ""
    })
    setIsAddDialogOpen(true)
  }

  const filteredKeywords = keywords.filter(k =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedByCategory = filteredKeywords.reduce((acc, keyword) => {
    const category = keyword.category || '미분류'
    if (!acc[category]) acc[category] = []
    acc[category].push(keyword)
    return acc
  }, {} as Record<string, Keyword[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">즐겨찾기 키워드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            자주 사용하는 키워드를 관리합니다
          </p>
        </div>
        <Button onClick={() => {
          setEditingKeyword(null)
          setFormData({ keyword: "", description: "", category: "" })
          setIsAddDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          즐겨찾기 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>즐겨찾기 목록 ({keywords.length}개)</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="검색..."
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
          ) : Object.keys(groupedByCategory).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              즐겨찾기한 키워드가 없습니다
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((keyword) => (
                      <Card key={keyword.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{keyword.keyword}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(keyword)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveFavorite(keyword.id)}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteKeyword(keyword.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {keyword.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {keyword.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>사용 횟수: {keyword.useCount}</span>
                            <span>{new Date(keyword.updatedAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKeyword ? '즐겨찾기 수정' : '즐겨찾기 추가'}
            </DialogTitle>
            <DialogDescription>
              키워드 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>키워드 *</Label>
              <Input
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="예: 인공지능"
                disabled={!!editingKeyword}
              />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: IT, 경제, 정치"
              />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="키워드에 대한 설명"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setEditingKeyword(null)
              setFormData({ keyword: "", description: "", category: "" })
            }}>
              취소
            </Button>
            <Button onClick={editingKeyword ? handleUpdateKeyword : handleAddKeyword}>
              {editingKeyword ? '수정' : '추가'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
