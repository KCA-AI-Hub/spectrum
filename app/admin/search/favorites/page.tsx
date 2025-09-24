"use client"

import { useState } from "react"
import { Star, Plus, Trash2, Search, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

type FavoriteKeyword = {
  id: string
  keyword: string
  tags: string[]
  createdAt: string
  lastUsed: string
  useCount: number
  description?: string
}

const mockFavorites: FavoriteKeyword[] = [
  {
    id: "1",
    keyword: "AI 인공지능",
    tags: ["기술", "트렌드"],
    createdAt: "2024-01-10",
    lastUsed: "2024-01-15",
    useCount: 15,
    description: "인공지능 관련 최신 뉴스와 기술 동향"
  },
  {
    id: "2",
    keyword: "블록체인",
    tags: ["금융", "기술"],
    createdAt: "2024-01-08",
    lastUsed: "2024-01-14",
    useCount: 12,
    description: "블록체인 기술과 암호화폐 관련 소식"
  },
  {
    id: "3",
    keyword: "메타버스",
    tags: ["VR", "AR", "플랫폼"],
    createdAt: "2024-01-05",
    lastUsed: "2024-01-13",
    useCount: 8,
  },
  {
    id: "4",
    keyword: "전기차",
    tags: ["자동차", "친환경"],
    createdAt: "2024-01-03",
    lastUsed: "2024-01-12",
    useCount: 7,
    description: "전기차 시장 동향과 기술 발전"
  }
]

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newKeyword, setNewKeyword] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTags, setNewTags] = useState("")

  const filteredFavorites = favorites.filter(item =>
    item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddFavorite = () => {
    if (!newKeyword.trim()) return

    const newFavorite: FavoriteKeyword = {
      id: Date.now().toString(),
      keyword: newKeyword,
      description: newDescription || undefined,
      tags: newTags.split(",").map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: new Date().toISOString().split("T")[0],
      useCount: 0
    }

    setFavorites(prev => [newFavorite, ...prev])
    setNewKeyword("")
    setNewDescription("")
    setNewTags("")
    setIsAddDialogOpen(false)
  }

  const handleDeleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
  }

  const handleSearchKeyword = (keyword: string) => {
    // TODO: Navigate to search page with this keyword
    console.log("Search for:", keyword)

    // Update last used and use count
    setFavorites(prev => prev.map(item =>
      item.keyword === keyword
        ? { ...item, lastUsed: new Date().toISOString().split("T")[0], useCount: item.useCount + 1 }
        : item
    ))
  }

  const startEdit = (favorite: FavoriteKeyword) => {
    setEditingId(favorite.id)
    setNewKeyword(favorite.keyword)
    setNewDescription(favorite.description || "")
    setNewTags(favorite.tags.join(", "))
  }

  const saveEdit = (id: string) => {
    setFavorites(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            keyword: newKeyword,
            description: newDescription || undefined,
            tags: newTags.split(",").map(tag => tag.trim()).filter(Boolean)
          }
        : item
    ))
    setEditingId(null)
    setNewKeyword("")
    setNewDescription("")
    setNewTags("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setNewKeyword("")
    setNewDescription("")
    setNewTags("")
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">즐겨찾기 키워드</h1>
          <p className="text-muted-foreground">자주 사용하는 검색 키워드를 관리하세요</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              키워드 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>즐겨찾기 키워드 추가</DialogTitle>
              <DialogDescription>
                자주 검색할 키워드를 즐겨찾기에 추가하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">키워드 *</label>
                <Input
                  placeholder="검색 키워드 입력"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">설명</label>
                <Input
                  placeholder="키워드 설명 (선택사항)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">태그</label>
                <Input
                  placeholder="태그를 쉼표로 구분하여 입력"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddFavorite}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 검색 필터 */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="즐겨찾기에서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 즐겨찾기</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground">
              이번 주에 {favorites.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}개 추가
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">가장 많이 사용</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {favorites.length > 0 ? Math.max(...favorites.map(f => f.useCount)) : 0}회
            </div>
            <p className="text-xs text-muted-foreground">
              {favorites.length > 0 && favorites.reduce((max, f) => f.useCount > max.useCount ? f : max).keyword}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 사용 횟수</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {favorites.length > 0 ? Math.round(favorites.reduce((acc, f) => acc + f.useCount, 0) / favorites.length) : 0}회
            </div>
            <p className="text-xs text-muted-foreground">
              키워드당 평균 사용
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 즐겨찾기 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFavorites.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>즐겨찾기 키워드가 없습니다</p>
          </div>
        ) : (
          filteredFavorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {editingId === favorite.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="font-semibold"
                      />
                      <Input
                        placeholder="설명"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                      <Input
                        placeholder="태그 (쉼표로 구분)"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(favorite.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <CardTitle className="text-lg cursor-pointer hover:text-primary"
                                 onClick={() => handleSearchKeyword(favorite.keyword)}>
                          {favorite.keyword}
                        </CardTitle>
                        {favorite.description && (
                          <CardDescription className="mt-1">
                            {favorite.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(favorite)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>즐겨찾기 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{favorite.keyword}" 키워드를 즐겨찾기에서 삭제하시겠습니까?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFavorite(favorite.id)}>
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              {editingId !== favorite.id && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {favorite.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>사용 {favorite.useCount}회</span>
                      <span>최근 {new Date(favorite.lastUsed).toLocaleDateString("ko-KR")}</span>
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleSearchKeyword(favorite.keyword)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      검색하기
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}