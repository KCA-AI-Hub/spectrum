"use client"

import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-end border-b border-sidebar-border bg-sidebar px-6">
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