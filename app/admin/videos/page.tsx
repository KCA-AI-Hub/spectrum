'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Video,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Download,
  Share2,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Grid3x3,
  List,
  TrendingUp,
  BarChart3
} from 'lucide-react'

type VideoStatus = 'pending' | 'generating' | 'completed' | 'failed'

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail?: string
  status: VideoStatus
  format: string
  duration: number
  createdAt: string
  views?: number
  downloads?: number
}

export default function VideosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const mockVideos: VideoItem[] = [
    {
      id: '1',
      title: 'AI 기술의 미래',
      description: 'AI 기술이 우리 생활을 변화시킬 미래',
      status: 'completed',
      format: 'vertical',
      duration: 30,
      createdAt: '2025-10-20',
      views: 1234,
      downloads: 56
    },
    {
      id: '2',
      title: '기후 변화 대응',
      description: '지구 온난화에 대한 글로벌 대응 전략',
      status: 'generating',
      format: 'horizontal',
      duration: 60,
      createdAt: '2025-10-23',
    },
    {
      id: '3',
      title: '경제 전망 2024',
      description: '2024년 경제 전망과 주요 이슈',
      status: 'pending',
      format: 'square',
      duration: 45,
      createdAt: '2025-10-23',
    },
    {
      id: '4',
      title: '건강한 생활 습관',
      description: '바쁜 일상 속 건강 관리 방법',
      status: 'failed',
      format: 'vertical',
      duration: 30,
      createdAt: '2025-10-22',
    }
  ]

  const stats = [
    {
      label: '총 동영상',
      value: '127',
      change: '+12%',
      icon: Video,
      color: 'text-blue-500'
    },
    {
      label: '생성 중',
      value: '8',
      change: '+3',
      icon: Loader2,
      color: 'text-orange-500'
    },
    {
      label: '완료',
      value: '115',
      change: '+9%',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      label: '총 조회수',
      value: '45.2K',
      change: '+18%',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  const getStatusBadge = (status: VideoStatus) => {
    const statusConfig = {
      pending: { label: '대기 중', variant: 'secondary' as const, icon: Clock },
      generating: { label: '생성 중', variant: 'default' as const, icon: Loader2 },
      completed: { label: '완료', variant: 'success' as const, icon: CheckCircle },
      failed: { label: '실패', variant: 'destructive' as const, icon: XCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      vertical: '세로형 (9:16)',
      horizontal: '가로형 (16:9)',
      square: '정사각형 (1:1)'
    }
    return formats[format] || format
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">동영상 관리</h1>
          <p className="text-muted-foreground mt-2">
            AI로 생성된 숏폼 동영상을 관리합니다
          </p>
        </div>
        <Link href="/admin/videos/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            새 동영상 생성
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="동영상 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              필터
            </Button>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="generating">생성 중</TabsTrigger>
          <TabsTrigger value="failed">실패</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {video.status === 'generating' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    {video.status === 'completed' && (
                      <button className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-12 h-12 text-white" />
                      </button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {video.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            재생
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            다운로드
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            공유
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      {getStatusBadge(video.status)}
                      <span className="text-xs text-muted-foreground">{video.duration}초</span>
                    </div>
                    {video.views !== undefined && (
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>조회 {video.views.toLocaleString()}</span>
                        <span>다운로드 {video.downloads}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockVideos.map((video) => (
                    <div key={video.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-32 aspect-video bg-muted rounded flex-shrink-0 flex items-center justify-center">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <Video className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{video.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {video.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {getStatusBadge(video.status)}
                            <Badge variant="outline">{getFormatLabel(video.format)}</Badge>
                            <span className="text-xs text-muted-foreground">{video.duration}초</span>
                            <span className="text-xs text-muted-foreground">{video.createdAt}</span>
                          </div>
                        </div>
                        {video.views !== undefined && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium">{video.views.toLocaleString()} 조회</p>
                            <p className="text-xs text-muted-foreground mt-1">{video.downloads} 다운로드</p>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              재생
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              편집
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              다운로드
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              공유
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
