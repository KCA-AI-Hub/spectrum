'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  CheckSquare,
  Square,
  MoreVertical,
  Trash2,
  Tag,
  Heart,
  FolderPlus,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoBatchToolbarProps {
  selectedIds: string[]
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onOperationComplete: () => void
}

export function VideoBatchToolbar({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
  onOperationComplete
}: VideoBatchToolbarProps) {
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const executeBatchOperation = async (action: string, data?: any) => {
    try {
      setLoading(true)

      const response = await fetch('/api/videos/batch/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          videoIds: selectedIds,
          data
        })
      })

      if (!response.ok) {
        throw new Error('Batch operation failed')
      }

      const result = await response.json()
      toast.success(result.message || '작업이 완료되었습니다')
      onOperationComplete()
      onClearSelection()
    } catch (error) {
      console.error('Batch operation error:', error)
      toast.error('작업 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    await executeBatchOperation('delete')
    setShowDeleteDialog(false)
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/10 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {selectedIds.length === totalCount ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                전체 선택 해제
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
              >
                <Square className="w-4 h-4 mr-2" />
                전체 선택
              </Button>
            )}
          </div>

          <Badge variant="secondary" className="text-sm">
            {selectedIds.length}개 선택됨
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => executeBatchOperation('addToFavorites')}
            disabled={loading}
          >
            <Heart className="w-4 h-4 mr-2" />
            즐겨찾기 추가
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading}>
                <MoreVertical className="w-4 h-4 mr-2" />
                더보기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  // In production, show a dialog to select tags
                  toast.info('태그 선택 다이얼로그를 표시해야 합니다')
                }}
              >
                <Tag className="w-4 h-4 mr-2" />
                태그 추가
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // In production, show a dialog to select collection
                  toast.info('컬렉션 선택 다이얼로그를 표시해야 합니다')
                }}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                컬렉션에 추가
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => executeBatchOperation('removeFromFavorites')}
                className="text-orange-600"
              >
                <Heart className="w-4 h-4 mr-2" />
                즐겨찾기 제거
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            취소
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>동영상 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedIds.length}개의 동영상을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
