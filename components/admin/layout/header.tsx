"use client"

import { Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="검색..."
            className="h-9 w-96 rounded-md border border-input bg-muted pl-10 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <ModeToggle />
        <div className="h-8 w-8 rounded-full bg-primary"></div>
      </div>
    </header>
  )
}