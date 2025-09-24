"use client"

import { Star, ExternalLink, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SearchResult } from "./search-results-table"

// Using the same mock data structure
const mockData: SearchResult[] = [
  {
    id: "1",
    title: "AI 기술의 최신 동향과 미래 전망",
    source: "네이버 뉴스",
    publishedAt: "2024-01-15",
    relevanceScore: 95,
    category: "IT/과학",
    summary: "인공지능 기술이 빠르게 발전하면서 다양한 산업 분야에서의 활용이 확대되고 있습니다. 특히 대화형 AI와 생성형 AI가 주목받고 있으며, 향후 5년 내에 AI는 우리 일상생활의 필수 요소가 될 것으로 전망됩니다.",
    url: "https://example.com/news/1",
    isFavorite: false,
    tags: ["인공지능", "기술동향", "미래전망"]
  },
  {
    id: "2",
    title: "블록체인 기반 핀테크 서비스 급성장",
    source: "구글 뉴스",
    publishedAt: "2024-01-14",
    relevanceScore: 87,
    category: "경제",
    summary: "블록체인 기술을 활용한 금융 서비스들이 시장에서 주목받고 있습니다. 디지털 화폐부터 스마트 컨트랙트까지 다양한 영역에서 혁신적인 서비스들이 등장하고 있어 금융업계의 패러다임 변화가 예상됩니다.",
    url: "https://example.com/news/2",
    isFavorite: true,
    tags: ["블록체인", "핀테크", "금융서비스"]
  },
  {
    id: "3",
    title: "메타버스 플랫폼 이용자 수 급증",
    source: "다음 뉴스",
    publishedAt: "2024-01-13",
    relevanceScore: 82,
    category: "IT/과학",
    summary: "가상현실 기반 메타버스 플랫폼들의 사용자가 크게 늘어나고 있습니다. 업무, 교육, 엔터테인먼트 등 다양한 분야에서 메타버스 활용이 확산되면서 새로운 디지털 생태계가 형성되고 있습니다.",
    url: "https://example.com/news/3",
    isFavorite: false,
    tags: ["메타버스", "가상현실", "플랫폼"]
  },
  {
    id: "4",
    title: "전기차 배터리 기술 혁신 가속화",
    source: "네이버 뉴스",
    publishedAt: "2024-01-12",
    relevanceScore: 78,
    category: "IT/과학",
    summary: "전기차용 배터리의 에너지 밀도와 충전 속도가 크게 개선되면서 전기차 시장 성장에 힘을 싣고 있습니다. 고체 배터리와 초고속 충전 기술 등 차세대 배터리 기술 개발이 활발히 진행되고 있습니다.",
    url: "https://example.com/news/4",
    isFavorite: false,
    tags: ["전기차", "배터리", "기술혁신"]
  },
]

interface SearchResultsCardsProps {
  searchQuery: string
  onCardClick?: (result: SearchResult) => void
}

export function SearchResultsCards({ searchQuery, onCardClick }: SearchResultsCardsProps) {
  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement favorite toggle functionality
    console.log("Toggle favorite for:", id)
  }

  const handleExternalLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {mockData.length}개의 결과를 카드 형태로 표시
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockData.map((result) => (
          <Card
            key={result.id}
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onCardClick?.(result)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {result.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleFavoriteToggle(result.id, e)}
                >
                  <Star
                    className={`h-4 w-4 ${result.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                  />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {result.source}
                </Badge>
                <Badge className="text-xs">
                  {result.category}
                </Badge>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                {result.summary}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {result.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(result.publishedAt).toLocaleDateString("ko-KR")}
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{result.relevanceScore}%</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <div className="flex justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleExternalLink(result.url, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  원문 보기
                </Button>

                <div className="flex items-center space-x-1">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${result.relevanceScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button variant="outline" size="lg">
          더 많은 결과 보기
        </Button>
      </div>
    </div>
  )
}