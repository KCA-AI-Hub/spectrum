"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type WidgetType = 'stats' | 'quick-actions' | 'recent-activity'

interface DashboardSettings {
  widgetOrder: WidgetType[]
  hiddenWidgets: WidgetType[]
  refreshInterval: number
}

interface DashboardSettingsContextType {
  settings: DashboardSettings
  updateWidgetOrder: (newOrder: WidgetType[]) => void
  toggleWidgetVisibility: (widget: WidgetType) => void
  updateRefreshInterval: (interval: number) => void
  resetToDefault: () => void
}

const defaultSettings: DashboardSettings = {
  widgetOrder: ['stats', 'quick-actions', 'recent-activity'],
  hiddenWidgets: [],
  refreshInterval: 30000, // 30 seconds
}

const DashboardSettingsContext = createContext<DashboardSettingsContextType | undefined>(undefined)

interface DashboardSettingsProviderProps {
  children: ReactNode
}

export function DashboardSettingsProvider({ children }: DashboardSettingsProviderProps) {
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dashboard-settings')
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) }
        } catch {
          return defaultSettings
        }
      }
    }
    return defaultSettings
  })

  const saveSettings = (newSettings: DashboardSettings) => {
    setSettings(newSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-settings', JSON.stringify(newSettings))
    }
  }

  const updateWidgetOrder = (newOrder: WidgetType[]) => {
    saveSettings({ ...settings, widgetOrder: newOrder })
  }

  const toggleWidgetVisibility = (widget: WidgetType) => {
    const hiddenWidgets = settings.hiddenWidgets.includes(widget)
      ? settings.hiddenWidgets.filter(w => w !== widget)
      : [...settings.hiddenWidgets, widget]

    saveSettings({ ...settings, hiddenWidgets })
  }

  const updateRefreshInterval = (interval: number) => {
    saveSettings({ ...settings, refreshInterval: interval })
  }

  const resetToDefault = () => {
    saveSettings(defaultSettings)
  }

  return (
    <DashboardSettingsContext.Provider value={{
      settings,
      updateWidgetOrder,
      toggleWidgetVisibility,
      updateRefreshInterval,
      resetToDefault,
    }}>
      {children}
    </DashboardSettingsContext.Provider>
  )
}

export function useDashboardSettings() {
  const context = useContext(DashboardSettingsContext)
  if (context === undefined) {
    throw new Error('useDashboardSettings must be used within a DashboardSettingsProvider')
  }
  return context
}