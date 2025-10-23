'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette, Plus, X, Sparkles } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Filter {
  id: string
  type: string
  value: number
  enabled: boolean
}

interface Effect {
  id: string
  type: string
  intensity: number
  enabled: boolean
}

interface VideoFilterEditorProps {
  filters: Filter[]
  effects: Effect[]
  onChange: (filters: Filter[], effects: Effect[]) => void
}

export function VideoFilterEditor({ filters = [], effects = [], onChange }: VideoFilterEditorProps) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>(filters)
  const [activeEffects, setActiveEffects] = useState<Effect[]>(effects)

  const availableFilters = [
    { type: 'brightness', label: '밝기', min: 0.5, max: 2, default: 1 },
    { type: 'contrast', label: '대비', min: 0.5, max: 2, default: 1 },
    { type: 'saturation', label: '채도', min: 0, max: 2, default: 1 },
    { type: 'blur', label: '흐림', min: 0, max: 10, default: 0 },
    { type: 'grayscale', label: '흑백', min: 0, max: 1, default: 0 },
    { type: 'sepia', label: '세피아', min: 0, max: 1, default: 0 },
    { type: 'hue-rotate', label: '색조 회전', min: 0, max: 360, default: 0 },
    { type: 'invert', label: '반전', min: 0, max: 1, default: 0 }
  ]

  const availableEffects = [
    { type: 'vignette', label: '비네트', description: '가장자리 어둡게' },
    { type: 'glow', label: '글로우', description: '빛나는 효과' },
    { type: 'grain', label: '그레인', description: '필름 질감' },
    { type: 'chromatic', label: '색수차', description: '색 분산 효과' },
    { type: 'scanlines', label: '스캔라인', description: 'CRT 모니터 효과' },
    { type: 'pixelate', label: '픽셀화', description: '픽셀 아트 효과' }
  ]

  const addFilter = (type: string) => {
    const filterConfig = availableFilters.find(f => f.type === type)
    if (!filterConfig) return

    const newFilter: Filter = {
      id: `${type}-${Date.now()}`,
      type,
      value: filterConfig.default,
      enabled: true
    }

    const newFilters = [...activeFilters, newFilter]
    setActiveFilters(newFilters)
    onChange(newFilters, activeEffects)
  }

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    const newFilters = activeFilters.map(f =>
      f.id === id ? { ...f, ...updates } : f
    )
    setActiveFilters(newFilters)
    onChange(newFilters, activeEffects)
  }

  const removeFilter = (id: string) => {
    const newFilters = activeFilters.filter(f => f.id !== id)
    setActiveFilters(newFilters)
    onChange(newFilters, activeEffects)
  }

  const addEffect = (type: string) => {
    const newEffect: Effect = {
      id: `${type}-${Date.now()}`,
      type,
      intensity: 50,
      enabled: true
    }

    const newEffects = [...activeEffects, newEffect]
    setActiveEffects(newEffects)
    onChange(activeFilters, newEffects)
  }

  const updateEffect = (id: string, updates: Partial<Effect>) => {
    const newEffects = activeEffects.map(e =>
      e.id === id ? { ...e, ...updates } : e
    )
    setActiveEffects(newEffects)
    onChange(activeFilters, newEffects)
  }

  const removeEffect = (id: string) => {
    const newEffects = activeEffects.filter(e => e.id !== id)
    setActiveEffects(newEffects)
    onChange(activeFilters, newEffects)
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            필터
          </Label>
          <Select onValueChange={addFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="필터 추가" />
            </SelectTrigger>
            <SelectContent>
              {availableFilters.map((filter) => (
                <SelectItem key={filter.type} value={filter.type}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeFilters.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">
                필터가 추가되지 않았습니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeFilters.map((filter) => {
              const config = availableFilters.find(f => f.type === filter.type)
              if (!config) return null

              return (
                <Card key={filter.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{config.label}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {filter.value.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilter(filter.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Slider
                      value={[filter.value]}
                      onValueChange={([value]) => updateFilter(filter.id, { value })}
                      min={config.min}
                      max={config.max}
                      step={0.01}
                      disabled={!filter.enabled}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Effects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            효과
          </Label>
          <Select onValueChange={addEffect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="효과 추가" />
            </SelectTrigger>
            <SelectContent>
              {availableEffects.map((effect) => (
                <SelectItem key={effect.type} value={effect.type}>
                  <div>
                    <div className="font-medium">{effect.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {effect.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeEffects.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">
                효과가 추가되지 않았습니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeEffects.map((effect) => {
              const config = availableEffects.find(e => e.type === effect.type)
              if (!config) return null

              return (
                <Card key={effect.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline">{config.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEffect(effect.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <Label>강도</Label>
                        <span className="text-muted-foreground">{effect.intensity}%</span>
                      </div>
                      <Slider
                        value={[effect.intensity]}
                        onValueChange={([intensity]) =>
                          updateEffect(effect.id, { intensity })
                        }
                        min={0}
                        max={100}
                        step={1}
                        disabled={!effect.enabled}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      {(activeFilters.length > 0 || activeEffects.length > 0) && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">적용된 필터:</span>
                <span className="font-medium">{activeFilters.length}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">적용된 효과:</span>
                <span className="font-medium">{activeEffects.length}개</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
