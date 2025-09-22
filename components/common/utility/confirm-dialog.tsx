"use client"

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  children?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading = false,
  children,
  icon: Icon
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
      onOpenChange?.(false)
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: Trash2,
          iconColor: 'text-destructive',
          confirmVariant: 'destructive' as const
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          confirmVariant: 'default' as const
        }
      default:
        return {
          icon: Check,
          iconColor: 'text-primary',
          confirmVariant: 'default' as const
        }
    }
  }

  const variantStyles = getVariantStyles()
  const IconComponent = Icon || variantStyles.icon

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <IconComponent className={cn("h-5 w-5", variantStyles.iconColor)} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading || loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || loading}
            className={cn(
              variantStyles.confirmVariant === 'destructive' &&
              "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {isLoading || loading ? "Loading..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Preset confirm dialogs for common use cases
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Delete item",
  description = "This action cannot be undone. This will permanently delete the item.",
  onConfirm,
  onCancel,
  loading,
  children,
  itemName
}: Omit<ConfirmDialogProps, 'variant' | 'confirmText'> & { itemName?: string }) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={itemName ? `Delete ${itemName}` : title}
      description={description}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    >
      {children}
    </ConfirmDialog>
  )
}

export function SaveConfirmDialog({
  open,
  onOpenChange,
  title = "Save changes",
  description = "Are you sure you want to save these changes?",
  onConfirm,
  onCancel,
  loading,
  children
}: Omit<ConfirmDialogProps, 'variant' | 'confirmText'>) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="Save"
      cancelText="Cancel"
      variant="default"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    >
      {children}
    </ConfirmDialog>
  )
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  loading,
  children
}: Omit<ConfirmDialogProps, 'variant' | 'confirmText' | 'title' | 'description'>) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      description="Are you sure you want to sign out of your account?"
      confirmText="Sign out"
      cancelText="Cancel"
      variant="warning"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    >
      {children}
    </ConfirmDialog>
  )
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  const confirm = (action: () => void | Promise<void>) => {
    return async () => {
      try {
        setIsLoading(true)
        await action()
        closeDialog()
      } catch (error) {
        console.error('Confirm action failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return {
    isOpen,
    isLoading,
    openDialog,
    closeDialog,
    confirm
  }
}