"use client"

import { Bell, Search, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="검색..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>알림</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <div className="font-medium">크롤링 작업 완료</div>
              <div className="text-sm text-gray-500">뉴스 사이트 크롤링이 성공적으로 완료되었습니다.</div>
              <div className="text-xs text-gray-400 mt-1">2분 전</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <div className="font-medium">시스템 성능 경고</div>
              <div className="text-sm text-gray-500">CPU 사용률이 85%를 초과했습니다.</div>
              <div className="text-xs text-gray-400 mt-1">10분 전</div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <div className="font-medium">새 사용자 등록</div>
              <div className="text-sm text-gray-500">김철수님이 시스템에 등록되었습니다.</div>
              <div className="text-xs text-gray-400 mt-1">1시간 전</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm">관리자</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              설정
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              프로필
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}