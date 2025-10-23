'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter, Calendar } from 'lucide-react'

export interface VideoFilters {
  search: string
  status: string
  format: string
  style: string
  tag: string
  category: string
  favorite: boolean
  dateFrom: string
  dateTo: string
  minViews: string
  maxViews: string
  sortBy: string
  sortOrder: string
}

interface VideoFilterPanelProps {
  filters: VideoFilters
  onFiltersChange: (filters: VideoFilters) => void
  tags?: Array<{ id: string; name: string; color?: string }>
  categories?: Array<{ id: string; name: string }>
}

export function VideoFilterPanel({
  filters,
  onFiltersChange,
  tags = [],
  categories = []
}: VideoFilterPanelProps) {
  const updateFilter = (key: keyof VideoFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      format: '',
      style: '',
      tag: '',
      category: '',
      favorite: false,
      dateFrom: '',
      dateTo: '',
      minViews: '',
      maxViews: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false
    if (typeof value === 'boolean') return value
    return value !== ''
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            필터
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="w-4 h-4 mr-2" />
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>검색</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="제목, 설명, 프롬프트 검색..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>상태</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="PENDING">대기 중</SelectItem>
              <SelectItem value="GENERATING">생성 중</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="FAILED">실패</SelectItem>
              <SelectItem value="CANCELLED">취소됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>포맷</Label>
          <Select
            value={filters.format}
            onValueChange={(value) => updateFilter('format', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="VERTICAL">세로형 (9:16)</SelectItem>
              <SelectItem value="HORIZONTAL">가로형 (16:9)</SelectItem>
              <SelectItem value="SQUARE">정사각형 (1:1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <Label>스타일</Label>
          <Select
            value={filters.style}
            onValueChange={(value) => updateFilter('style', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="MODERN">모던</SelectItem>
              <SelectItem value="MINIMAL">미니멀</SelectItem>
              <SelectItem value="BOLD">볼드</SelectItem>
              <SelectItem value="ELEGANT">우아함</SelectItem>
              <SelectItem value="PLAYFUL">경쾌함</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <Label>태그</Label>
            <Select
              value={filters.tag}
              onValueChange={(value) => updateFilter('tag', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    <div className="flex items-center gap-2">
                      {tag.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Favorites */}
        <div className="flex items-center justify-between">
          <Label>즐겨찾기만 표시</Label>
          <Switch
            checked={filters.favorite}
            onCheckedChange={(checked) => updateFilter('favorite', checked)}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            생성 날짜
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              placeholder="시작일"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              placeholder="종료일"
            />
          </div>
        </div>

        {/* Views Range */}
        <div className="space-y-2">
          <Label>조회수 범위</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={filters.minViews}
              onChange={(e) => updateFilter('minViews', e.target.value)}
              placeholder="최소"
              min="0"
            />
            <Input
              type="number"
              value={filters.maxViews}
              onChange={(e) => updateFilter('maxViews', e.target.value)}
              placeholder="최대"
              min="0"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>정렬</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">생성일</SelectItem>
                <SelectItem value="updatedAt">수정일</SelectItem>
                <SelectItem value="title">제목</SelectItem>
                <SelectItem value="views">조회수</SelectItem>
                <SelectItem value="downloads">다운로드</SelectItem>
                <SelectItem value="shares">공유수</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => updateFilter('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">내림차순</SelectItem>
                <SelectItem value="asc">오름차순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
