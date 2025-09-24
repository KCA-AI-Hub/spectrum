"use client"

import { useState } from "react"
import { Search, Filter, History, Star, Table, Grid, CalendarDays, ChevronDown, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SearchResultsTable } from "@/components/admin/search/search-results-table"
import { SearchResultsCards } from "@/components/admin/search/search-results-cards"
import { SearchProgress } from "@/components/admin/search/search-progress"
import { CrawlingLogs } from "@/components/admin/search/crawling-logs"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Filter states
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  })
  const [selectedSource, setSelectedSource] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<string>("relevance")

  // Search state
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const recentSearches = [
    "AI 기술 동향",
    "블록체인 뉴스",
    "스타트업 투자",
    "메타버스 플랫폼",
    "ESG 경영"
  ]

  const favoriteKeywords = [
    "인공지능",
    "핀테크",
    "전기차",
    "반도체"
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    // Simulate search duration (in real app, this would be actual API calls)
    await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds

    setIsSearching(false)
  }

  const handleCancelSearch = () => {
    setIsSearching(false)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword)
    if (keyword.trim()) {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">뉴스 검색</h1>
          <p className="text-muted-foreground">키워드를 입력하여 관련 뉴스를 검색하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <Table className="h-4 w-4 mr-2" />
            테이블 뷰
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
          >
            <Grid className="h-4 w-4 mr-2" />
            카드 뷰
          </Button>
        </div>
      </div>

      {/* 검색 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 설정</CardTitle>
          <CardDescription>키워드와 필터 옵션을 설정하여 뉴스를 검색하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 메인 검색 바 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색할 키워드를 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isSearching && handleSearch()}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  검색 중
                </>
              ) : (
                "검색"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              고급 검색
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4 mr-2" />
                  최근 검색
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>최근 검색어</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentSearches.map((search, index) => (
                  <DropdownMenuItem key={index} onClick={() => setSearchQuery(search)}>
                    {search}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 고급 검색 옵션 */}
          {showAdvancedFilters && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-medium mb-3">고급 검색 옵션</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 날짜 범위 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">날짜 범위</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "PPP", { locale: ko })} -{" "}
                              {format(dateRange.to, "PPP", { locale: ko })}
                            </>
                          ) : (
                            format(dateRange.from, "PPP", { locale: ko })
                          )
                        ) : (
                          "날짜 선택"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={(range) => setDateRange(range ? {from: range.from, to: range.to} : {from: undefined, to: undefined})}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 뉴스 출처 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">뉴스 출처</label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="출처 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      <SelectItem value="naver">네이버 뉴스</SelectItem>
                      <SelectItem value="google">구글 뉴스</SelectItem>
                      <SelectItem value="daum">다음 뉴스</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 카테고리 선택 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">카테고리</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      <SelectItem value="politics">정치</SelectItem>
                      <SelectItem value="economy">경제</SelectItem>
                      <SelectItem value="society">사회</SelectItem>
                      <SelectItem value="it">IT/과학</SelectItem>
                      <SelectItem value="sports">스포츠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 정렬 옵션 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">정렬 기준</label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">관련도순</SelectItem>
                      <SelectItem value="date-desc">최신순</SelectItem>
                      <SelectItem value="date-asc">오래된순</SelectItem>
                      <SelectItem value="source">출처순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 필터 초기화 */}
              <div className="flex justify-end mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateRange({from: undefined, to: undefined})
                    setSelectedSource("")
                    setSelectedCategory("")
                    setSortOrder("relevance")
                  }}
                >
                  필터 초기화
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 즐겨찾기 키워드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            즐겨찾기 키워드
          </CardTitle>
          <CardDescription>자주 사용하는 키워드를 빠르게 검색할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {favoriteKeywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleKeywordClick(keyword)}
              >
                {keyword}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="h-6">
              + 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 검색 진행 상황 */}
      {isSearching && (
        <SearchProgress
          isSearching={isSearching}
          searchQuery={searchQuery}
          onCancel={handleCancelSearch}
        />
      )}

      {/* 검색 결과 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 결과</CardTitle>
          <CardDescription>
            {searchQuery ? `"${searchQuery}"에 대한 검색 결과` : "키워드를 입력하여 검색을 시작하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSearched && !isSearching ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>검색할 키워드를 입력해주세요</p>
            </div>
          ) : isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>검색 결과를 불러오고 있습니다...</p>
            </div>
          ) : viewMode === "table" ? (
            <SearchResultsTable
              searchQuery={searchQuery}
              onRowClick={(result) => {
                console.log("Row clicked:", result)
                // TODO: Open detail modal
              }}
            />
          ) : (
            <SearchResultsCards
              searchQuery={searchQuery}
              onCardClick={(result) => {
                console.log("Card clicked:", result)
                // TODO: Open detail modal
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* 크롤링 로그 */}
      <CrawlingLogs />
    </div>
  )
}