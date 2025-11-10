"use client"

import { SearchAndArticlesTab } from "@/components/admin/search/search-and-articles-tab"

export default function NewsManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">크롤링 관리</h1>
        <p className="text-muted-foreground">키워드 검색 및 기사를 관리합니다</p>
      </div>

      <SearchAndArticlesTab />
    </div>
  )
}
