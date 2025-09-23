"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"
import { useDashboardSettings } from "@/components/providers/dashboard-settings-provider"

const widgetNames = {
  'stats': '시스템 현황',
  'quick-actions': '빠른 작업',
  'recent-activity': '최근 활동'
}

export function DashboardSettings() {
  const {
    settings,
    updateWidgetOrder,
    toggleWidgetVisibility,
    resetToDefault
  } = useDashboardSettings()

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.widgetOrder]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]
      updateWidgetOrder(newOrder)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          대시보드 설정
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>대시보드 설정</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Widget Order */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">위젯 순서</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.widgetOrder.map((widget, index) => (
                  <div key={widget} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{widgetNames[widget]}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveWidget(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveWidget(index, 'down')}
                        disabled={index === settings.widgetOrder.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">위젯 표시</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(widgetNames).map(([key, name]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key}>{name}</Label>
                    <Switch
                      id={key}
                      checked={!settings.hiddenWidgets.includes(key as 'stats' | 'quick-actions' | 'recent-activity')}
                      onCheckedChange={() => toggleWidgetVisibility(key as 'stats' | 'quick-actions' | 'recent-activity')}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reset */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">기본값 복원</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                기본 설정으로 복원
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}