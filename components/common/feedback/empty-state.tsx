"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  FileText,
  Users,
  Database,
  Settings,
  Plus,
  RefreshCw,
  AlertCircle,
  FileX,
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  illustration?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {illustration || (
        <div className="mb-4">
          <Icon className="h-16 w-16 text-muted-foreground/50" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
          >
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="outline"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Predefined empty states for common scenarios
export function NoSearchResults({
  query,
  onClearSearch,
  className
}: {
  query?: string
  onClearSearch?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try adjusting your search criteria.`
          : "No results found. Try adjusting your search criteria."
      }
      action={onClearSearch ? {
        label: "Clear search",
        onClick: onClearSearch,
        variant: "outline"
      } : undefined}
      className={className}
    />
  )
}

export function NoData({
  title = "No data available",
  description = "There's no data to display at the moment.",
  onCreate,
  onRefresh,
  className
}: {
  title?: string
  description?: string
  onCreate?: () => void
  onRefresh?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      action={onCreate ? {
        label: "Create new",
        onClick: onCreate
      } : undefined}
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
      className={className}
    />
  )
}

export function NoUsers({
  onInviteUser,
  className
}: {
  onInviteUser?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Users}
      title="No users found"
      description="Get started by inviting team members to join your workspace."
      action={onInviteUser ? {
        label: "Invite users",
        onClick: onInviteUser
      } : undefined}
      className={className}
    />
  )
}

export function NoDocuments({
  onCreateDocument,
  onUploadDocument,
  className
}: {
  onCreateDocument?: () => void
  onUploadDocument?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents"
      description="Start by creating a new document or uploading existing files."
      action={onCreateDocument ? {
        label: "Create document",
        onClick: onCreateDocument
      } : undefined}
      secondaryAction={onUploadDocument ? {
        label: "Upload files",
        onClick: onUploadDocument
      } : undefined}
      className={className}
    />
  )
}

export function EmptyFolder({
  onAddFile,
  onCreateFolder,
  className
}: {
  onAddFile?: () => void
  onCreateFolder?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="This folder is empty"
      description="Add files or create subfolders to organize your content."
      action={onAddFile ? {
        label: "Add files",
        onClick: onAddFile
      } : undefined}
      secondaryAction={onCreateFolder ? {
        label: "Create folder",
        onClick: onCreateFolder
      } : undefined}
      className={className}
    />
  )
}

export function ConfigurationRequired({
  title = "Configuration required",
  description = "Please configure the settings before you can start using this feature.",
  onConfigure,
  className
}: {
  title?: string
  description?: string
  onConfigure?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={Settings}
      title={title}
      description={description}
      action={onConfigure ? {
        label: "Configure settings",
        onClick: onConfigure
      } : undefined}
      className={className}
    />
  )
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry,
  onReportIssue,
  className
}: {
  title?: string
  description?: string
  onRetry?: () => void
  onReportIssue?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try again",
        onClick: onRetry
      } : undefined}
      secondaryAction={onReportIssue ? {
        label: "Report issue",
        onClick: onReportIssue
      } : undefined}
      className={className}
    />
  )
}

// Empty state with illustration
export function EmptyStateWithIllustration({
  title,
  description,
  action,
  secondaryAction,
  className
}: Omit<EmptyStateProps, 'icon' | 'illustration'>) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      illustration={
        <div className="mb-6">
          <svg
            className="h-32 w-32 text-muted-foreground/20"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 2a1 1 0 000 2h6a1 1 0 100-2H9zM4 5a2 2 0 012-2h1V2a3 3 0 116 0v1h1a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 0v14h10V5H7z" />
          </svg>
        </div>
      }
      className={className}
    />
  )
}

// Card wrapper for empty states
export function EmptyStateCard({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}