"use client"

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { HelpCircle, Info, AlertCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  content: React.ReactNode
  children?: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'info' | 'warning' | 'tip'
  className?: string
}

export function HelpTooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  size = 'md',
  variant = 'default',
  className
}: HelpTooltipProps) {
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return Info
      case 'warning':
        return AlertCircle
      case 'tip':
        return Lightbulb
      default:
        return HelpCircle
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-500'
      case 'warning':
        return 'text-yellow-500'
      case 'tip':
        return 'text-green-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  const Icon = getIcon()

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-0 hover:bg-transparent",
                getIconColor(),
                className
              )}
            >
              <Icon className={getSizeClasses()} />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Preset help tooltips for common use cases
export function FieldHelpTooltip({
  content,
  className
}: {
  content: React.ReactNode
  className?: string
}) {
  return (
    <HelpTooltip
      content={content}
      size="sm"
      variant="info"
      side="right"
      className={cn("ml-1", className)}
    />
  )
}

export function WarningTooltip({
  content,
  children,
  className
}: {
  content: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <HelpTooltip
      content={content}
      variant="warning"
      side="top"
      className={className}
    >
      {children}
    </HelpTooltip>
  )
}

export function TipTooltip({
  content,
  children,
  className
}: {
  content: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <HelpTooltip
      content={content}
      variant="tip"
      side="top"
      className={className}
    >
      {children}
    </HelpTooltip>
  )
}

// Interactive tooltip with rich content
interface RichTooltipProps {
  title: string
  description?: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function RichTooltip({
  title,
  description,
  children,
  side = 'top',
  align = 'center',
  className
}: RichTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={cn("max-w-sm", className)}>
          <div className="space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltip with keyboard shortcut
interface ShortcutTooltipProps {
  content: React.ReactNode
  shortcut: string | string[]
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function ShortcutTooltip({
  content,
  shortcut,
  children,
  side = 'bottom',
  className
}: ShortcutTooltipProps) {
  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} className={cn("max-w-xs", className)}>
          <div className="space-y-2">
            <div>{content}</div>
            <div className="flex items-center space-x-1 text-xs">
              {shortcuts.map((key, index) => (
                <React.Fragment key={key}>
                  {index > 0 && <span className="text-muted-foreground">+</span>}
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}