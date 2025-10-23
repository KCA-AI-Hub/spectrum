'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, RotateCcw, Clock } from 'lucide-react'

interface EditState {
  textOverlay?: any
  backgroundMusic?: any
  filters?: any[]
  effects?: any[]
}

interface EditHistoryProps {
  history: EditState[]
  currentIndex: number
  onRestore: (index: number) => void
}

export function EditHistory({ history, currentIndex, onRestore }: EditHistoryProps) {
  const getChangesSummary = (state: EditState): string[] => {
    const changes: string[] = []

    if (state.textOverlay?.enabled) {
      changes.push('텍스트 오버레이')
    }

    if (state.backgroundMusic?.enabled) {
      changes.push('배경음악')
    }

    if (state.filters && state.filters.length > 0) {
      changes.push(`필터 ${state.filters.length}개`)
    }

    if (state.effects && state.effects.length > 0) {
      changes.push(`효과 ${state.effects.length}개`)
    }

    return changes.length > 0 ? changes : ['초기 상태']
  }

  const formatTimestamp = (index: number): string => {
    const now = new Date()
    const minutesAgo = history.length - index - 1

    if (minutesAgo === 0) return '방금 전'
    if (minutesAgo === 1) return '1분 전'
    return `${minutesAgo}분 전`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4" />
              편집 히스토리
            </CardTitle>
            <CardDescription>
              {history.length}개의 변경 사항이 저장되었습니다
            </CardDescription>
          </div>
          {currentIndex !== history.length - 1 && (
            <Badge variant="outline">
              {history.length - currentIndex - 1}단계 뒤로
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">
              편집 히스토리가 없습니다
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {history.map((state, index) => {
                const isCurrent = index === currentIndex
                const changes = getChangesSummary(state)

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={isCurrent ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            #{index + 1}
                          </Badge>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              현재
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {changes.map((change, i) => (
                              <span
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                {change}
                                {i < changes.length - 1 && ','}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(index)}
                          </div>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(index)}
                          className="flex-shrink-0"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          복원
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {history.length > 10 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              최근 {history.length}개의 변경 사항
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
