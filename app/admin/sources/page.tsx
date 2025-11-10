"use client"

import { SourcesManagementTab } from "@/components/admin/search/sources-management-tab"

export default function SourcesManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">크롤링 소스 관리</h1>
        <p className="text-muted-foreground">뉴스 크롤링에 사용되는 소스를 관리합니다</p>
      </div>

      <SourcesManagementTab />
    </div>
  )
}
