"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Keyboard, Search, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KeyboardShortcut {
  id: string
  keys: string[]
  description: string
  category: string
  action?: () => void
}

interface ShortcutHelperProps {
  shortcuts: KeyboardShortcut[]
  className?: string
}

export function ShortcutHelper({ shortcuts, className }: ShortcutHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Listen for Ctrl+? or Cmd+? to open shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setIsOpen(true)
      }
      // Also listen for F1
      if (event.key === 'F1') {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const categories = Array.from(new Set(filteredShortcuts.map(s => s.category)))

  const getShortcutsByCategory = (category: string) =>
    filteredShortcuts.filter(s => s.category === category)

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      'mod': navigator.platform.includes('Mac') ? '⌘' : 'Ctrl',
      'ctrl': navigator.platform.includes('Mac') ? '⌃' : 'Ctrl',
      'meta': navigator.platform.includes('Mac') ? '⌘' : 'Win',
      'alt': navigator.platform.includes('Mac') ? '⌥' : 'Alt',
      'shift': navigator.platform.includes('Mac') ? '⇧' : 'Shift',
      'enter': '↵',
      'backspace': '⌫',
      'delete': '⌦',
      'tab': '⇥',
      'escape': 'Esc',
      'space': 'Space',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→'
    }

    return keyMap[key.toLowerCase()] || key
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)}>
          <Keyboard className="h-4 w-4" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Shortcuts List */}
          <ScrollArea className="h-[50vh]">
            <div className="space-y-6">
              {categories.map(category => {
                const categoryShortcuts = getShortcutsByCategory(category)
                if (categoryShortcuts.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map(shortcut => (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <div className="flex items-center space-x-1">
                            {shortcut.keys.map((key, index) => (
                              <React.Fragment key={key}>
                                {index > 0 && (
                                  <span className="text-muted-foreground text-xs">+</span>
                                )}
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs px-1.5 py-0.5"
                                >
                                  {formatKey(key)}
                                </Badge>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {category !== categories[categories.length - 1] && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                )
              })}

              {filteredShortcuts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Keyboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No shortcuts found</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Press <Badge variant="outline" className="font-mono text-xs">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </Badge> + <Badge variant="outline" className="font-mono text-xs">/</Badge> or{' '}
            <Badge variant="outline" className="font-mono text-xs">F1</Badge> to open this dialog
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keys = shortcut.keys.map(k => k.toLowerCase())
        const pressedKeys = []

        if (event.ctrlKey || event.metaKey) {
          pressedKeys.push(keys.includes('mod') ? 'mod' : keys.includes('ctrl') ? 'ctrl' : 'meta')
        }
        if (event.altKey) pressedKeys.push('alt')
        if (event.shiftKey) pressedKeys.push('shift')

        const mainKey = event.key.toLowerCase()
        if (!['control', 'meta', 'alt', 'shift'].includes(mainKey)) {
          pressedKeys.push(mainKey)
        }

        const normalizedKeys = keys.map(k => k === 'mod' ? (navigator.platform.includes('Mac') ? 'meta' : 'ctrl') : k)

        if (normalizedKeys.length === pressedKeys.length &&
            normalizedKeys.every(k => pressedKeys.includes(k))) {
          event.preventDefault()
          shortcut.action?.()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts for admin applications
export const commonShortcuts: KeyboardShortcut[] = [
  {
    id: 'help',
    keys: ['mod', '/'],
    description: 'Show keyboard shortcuts',
    category: 'General'
  },
  {
    id: 'search',
    keys: ['mod', 'k'],
    description: 'Open search',
    category: 'General'
  },
  {
    id: 'save',
    keys: ['mod', 's'],
    description: 'Save current form',
    category: 'Editing'
  },
  {
    id: 'new',
    keys: ['mod', 'n'],
    description: 'Create new item',
    category: 'Actions'
  },
  {
    id: 'refresh',
    keys: ['mod', 'r'],
    description: 'Refresh current page',
    category: 'Navigation'
  },
  {
    id: 'home',
    keys: ['mod', 'h'],
    description: 'Go to dashboard',
    category: 'Navigation'
  },
  {
    id: 'logout',
    keys: ['mod', 'shift', 'q'],
    description: 'Sign out',
    category: 'Account'
  }
]