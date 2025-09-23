"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface DashboardData {
  stats: {
    totalSites: number
    totalArticles: number
    totalVideos: number
    activeUsers: number
  }
  activities: Array<{
    id: number
    type: string
    title: string
    description: string
    time: string
    status: 'success' | 'processing' | 'error'
  }>
  lastUpdated: Date
}

interface RealTimeContextType {
  data: DashboardData
  isLoading: boolean
  refreshData: () => void
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

interface RealTimeProviderProps {
  children: ReactNode
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalSites: 12,
      totalArticles: 1247,
      totalVideos: 89,
      activeUsers: 24,
    },
    activities: [],
    lastUpdated: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call with random data updates
      await new Promise(resolve => setTimeout(resolve, 1000))

      setData(prev => ({
        stats: {
          totalSites: prev.stats.totalSites + Math.floor(Math.random() * 2),
          totalArticles: prev.stats.totalArticles + Math.floor(Math.random() * 50),
          totalVideos: prev.stats.totalVideos + Math.floor(Math.random() * 5),
          activeUsers: Math.max(20, prev.stats.activeUsers + Math.floor(Math.random() * 6) - 3),
        },
        activities: [
          {
            id: Date.now(),
            type: "crawl",
            title: "새로운 크롤링 완료",
            description: `${Math.floor(Math.random() * 100)}개의 새로운 기사가 수집되었습니다`,
            time: "방금 전",
            status: Math.random() > 0.8 ? 'error' : 'success' as 'success' | 'error',
          },
          ...prev.activities.slice(0, 9),
        ],
        lastUpdated: new Date(),
      }))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchData()

    // Set up interval for real-time updates
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    fetchData()
  }

  return (
    <RealTimeContext.Provider value={{ data, isLoading, refreshData }}>
      {children}
    </RealTimeContext.Provider>
  )
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}