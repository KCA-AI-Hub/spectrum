"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Globe,
  Search,
  Clock,
  Star,
  TrendingUp,
  ChevronRight,
  Loader2
} from "lucide-react"

interface Keyword {
  id: string
  keyword: string
  useCount: number
}

export default function CrawlingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [favoriteKeywords, setFavoriteKeywords] = useState<Keyword[]>([])
  const [popularKeywords, setPopularKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      setLoading(true)
      const [favoritesRes, popularRes] = await Promise.all([
        fetch('/api/keywords?action=favorites'),
        fetch('/api/keywords?action=popular')
      ])

      const [favoritesData, popularData] = await Promise.all([
        favoritesRes.json(),
        popularRes.json()
      ])

      setFavoriteKeywords(favoritesData.keywords?.slice(0, 5) || [])
      setPopularKeywords(popularData.keywords?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching keywords:', error)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    {
      label: "대시보드",
      href: "/admin/crawling",
      icon: TrendingUp,
      exact: true
    },
    {
      label: "키워드 검색",
      href: "/admin/crawling/search",
      icon: Search
    },
    {
      label: "소스 관리",
      href: "/admin/crawling/sources",
      icon: Globe
    },
    {
      label: "검색 기록",
      href: "/admin/crawling/history",
      icon: Clock
    },
    {
      label: "즐겨찾기",
      href: "/admin/crawling/favorites",
      icon: Star
    }
  ]

  return (
    <div className="flex gap-6">
      <aside className="w-64 space-y-4 flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">메뉴</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent",
                        isActive && "bg-accent font-medium text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">즐겨찾기 키워드</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : favoriteKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                즐겨찾기한 키워드가 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {favoriteKeywords.map((keyword) => (
                  <Link
                    key={keyword.id}
                    href={`/admin/crawling/search?keyword=${encodeURIComponent(keyword.keyword)}`}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto py-2"
                    >
                      <span className="text-sm">{keyword.keyword}</span>
                      <Badge variant="secondary" className="ml-2">
                        {keyword.useCount}
                      </Badge>
                    </Button>
                  </Link>
                ))}
                <Link href="/admin/crawling/favorites">
                  <Button variant="link" className="w-full text-xs">
                    모두 보기 →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">인기 검색어</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : popularKeywords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                검색 기록이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {popularKeywords.map((keyword, index) => (
                  <Link
                    key={keyword.id}
                    href={`/admin/crawling/search?keyword=${encodeURIComponent(keyword.keyword)}`}
                  >
                    <div className="flex items-center justify-between py-1.5 hover:bg-accent rounded px-2 transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{keyword.keyword}</span>
                      </div>
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
