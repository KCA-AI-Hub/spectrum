"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  FileText,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

type SearchStep = {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  duration?: number
  error?: string
}

type SearchProgressProps = {
  isSearching: boolean
  searchQuery: string
  onCancel?: () => void
}

export function SearchProgress({ isSearching, searchQuery, onCancel }: SearchProgressProps) {
  const [steps, setSteps] = useState<SearchStep[]>([
    {
      id: "validate",
      name: "검색 조건 검증",
      description: "키워드와 필터 조건을 확인하고 있습니다",
      status: "pending",
      progress: 0
    },
    {
      id: "sources",
      name: "뉴스 소스 조회",
      description: "네이버, 구글, 다음 뉴스에서 데이터를 수집합니다",
      status: "pending",
      progress: 0
    },
    {
      id: "crawl",
      name: "웹 크롤링",
      description: "Firecrawl API를 사용하여 기사 내용을 추출합니다",
      status: "pending",
      progress: 0
    },
    {
      id: "process",
      name: "데이터 처리",
      description: "텍스트 정제 및 중복 제거를 수행합니다",
      status: "pending",
      progress: 0
    },
    {
      id: "analyze",
      name: "AI 분석",
      description: "OpenAI API를 사용하여 관련도를 분석합니다",
      status: "pending",
      progress: 0
    },
    {
      id: "save",
      name: "결과 저장",
      description: "분석 결과를 데이터베이스에 저장합니다",
      status: "pending",
      progress: 0
    }
  ])

  const [overallProgress, setOverallProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Simulate search progress
  useEffect(() => {
    if (!isSearching) {
      setSteps(prev => prev.map(step => ({ ...step, status: "pending" as const, progress: 0 })))
      setOverallProgress(0)
      setCurrentStepIndex(0)
      setStartTime(null)
      setElapsedTime(0)
      return
    }

    setStartTime(new Date())

    const simulateProgress = async () => {
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        setCurrentStepIndex(stepIndex)

        // Start current step
        setSteps(prev => prev.map((step, index) =>
          index === stepIndex
            ? { ...step, status: "running" as const }
            : step
        ))

        // Simulate step progress
        const stepDuration = Math.random() * 2000 + 1000 // 1-3 seconds
        const progressSteps = 20
        const intervalTime = stepDuration / progressSteps

        for (let progress = 0; progress <= 100; progress += 5) {
          await new Promise(resolve => setTimeout(resolve, intervalTime))

          setSteps(prev => prev.map((step, index) =>
            index === stepIndex
              ? { ...step, progress }
              : step
          ))

          // Update overall progress
          const completedSteps = stepIndex
          const currentStepProgress = progress / 100
          const newOverallProgress = ((completedSteps + currentStepProgress) / steps.length) * 100
          setOverallProgress(newOverallProgress)
        }

        // Complete current step (with small chance of error)
        const hasError = stepIndex === 2 && Math.random() < 0.2 // 20% chance of crawling error

        setSteps(prev => prev.map((step, index) =>
          index === stepIndex
            ? {
                ...step,
                status: hasError ? "error" as const : "completed" as const,
                progress: 100,
                duration: stepDuration,
                error: hasError ? "일부 웹사이트에 접근할 수 없습니다" : undefined
              }
            : step
        ))

        if (hasError && stepIndex < steps.length - 1) {
          // Continue with next step even with error
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    simulateProgress()
  }, [isSearching])

  // Update elapsed time
  useEffect(() => {
    if (!isSearching || !startTime) return

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime.getTime())
    }, 100)

    return () => clearInterval(interval)
  }, [isSearching, startTime])

  if (!isSearching) {
    return null
  }

  const getStepIcon = (step: SearchStep) => {
    switch (step.status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return minutes > 0
      ? `${minutes}분 ${seconds % 60}초`
      : `${seconds}초`
  }

  const completedSteps = steps.filter(step => step.status === "completed").length
  const errorSteps = steps.filter(step => step.status === "error").length

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              "{searchQuery}" 검색 진행 중
            </CardTitle>
            <CardDescription>
              실시간으로 뉴스 데이터를 수집하고 분석하고 있습니다
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            취소
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>전체 진행률</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              완료: {completedSteps}/{steps.length}
            </span>
            {errorSteps > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                오류: {errorSteps}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            소요 시간: {formatTime(elapsedTime)}
          </span>
        </div>

        {/* Step Details */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">세부 진행 상황</h4>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{step.name}</p>
                    <div className="flex items-center gap-2">
                      {step.duration && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(step.duration)}ms
                        </span>
                      )}
                      <Badge
                        variant={
                          step.status === "completed" ? "default" :
                          step.status === "running" ? "secondary" :
                          step.status === "error" ? "destructive" :
                          "outline"
                        }
                        className="text-xs"
                      >
                        {step.status === "completed" && "완료"}
                        {step.status === "running" && "진행중"}
                        {step.status === "error" && "오류"}
                        {step.status === "pending" && "대기중"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                  {step.status === "running" && (
                    <Progress value={step.progress} className="h-1 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}