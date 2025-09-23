"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock, Globe, FileText, Video, AlertCircle } from "lucide-react"
import { useRealTime } from "@/components/providers/real-time-provider"

const getIconForType = (type: string) => {
  switch (type) {
    case "crawl":
      return Globe
    case "analysis":
      return FileText
    case "video":
      return Video
    case "error":
      return AlertCircle
    default:
      return Clock
  }
}

const statusColors = {
  success: "text-chart-2",
  processing: "text-chart-1",
  error: "text-destructive",
}

export function RecentActivity() {
  const { data } = useRealTime()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>최근 활동</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.activities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              활동 내역이 없습니다.
            </div>
          ) : (
            <TooltipProvider>
              {data.activities.map((activity) => {
                const Icon = getIconForType(activity.type)
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`mt-1 ${statusColors[activity.status]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{activity.title}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm text-muted-foreground truncate">
                            {activity.description}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{activity.description}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="text-xs text-muted-foreground/80 mt-1">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  )
}