"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Slider
} from "@/components/ui/slider"
import {
  Settings,
  Clock,
  Filter,
  Database,
  AlertCircle,
  Plus,
  X,
  Info
} from "lucide-react"

export interface ScrapingSettings {
  // General Settings
  enabled: boolean
  interval: number // minutes
  maxConcurrent: number
  timeout: number // seconds
  retryAttempts: number

  // Content Filtering
  keywords: string[]
  excludeKeywords: string[]
  categories: string[]
  minRelevanceScore: number
  duplicateDetection: boolean

  // Schedule Settings
  scheduleType: 'continuous' | 'scheduled' | 'manual'
  scheduleTimes: string[]
  timezone: string

  // Advanced Settings
  userAgent: string
  requestDelay: number // milliseconds
  respectRobots: boolean
  enableJavaScript: boolean

  // Storage Settings
  maxArticlesPerSource: number
  retentionDays: number
  autoArchive: boolean
}

interface ScrapingSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings?: Partial<ScrapingSettings>
  onSave: (settings: ScrapingSettings) => void
}

const defaultSettings: ScrapingSettings = {
  enabled: true,
  interval: 30,
  maxConcurrent: 5,
  timeout: 30,
  retryAttempts: 3,

  keywords: [],
  excludeKeywords: [],
  categories: [],
  minRelevanceScore: 0,
  duplicateDetection: true,

  scheduleType: 'continuous',
  scheduleTimes: [],
  timezone: 'Asia/Seoul',

  userAgent: 'Mozilla/5.0 (compatible; SpectrumBot/1.0)',
  requestDelay: 1000,
  respectRobots: true,
  enableJavaScript: false,

  maxArticlesPerSource: 1000,
  retentionDays: 30,
  autoArchive: true
}

export function ScrapingSettingsModal({
  isOpen,
  onClose,
  settings = {},
  onSave
}: ScrapingSettingsModalProps) {
  const [formData, setFormData] = useState<ScrapingSettings>({
    ...defaultSettings,
    ...settings
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [newExcludeKeyword, setNewExcludeKeyword] = useState("")

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword.trim() && !formData.excludeKeywords.includes(newExcludeKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword.trim()]
      }))
      setNewExcludeKeyword("")
    }
  }

  const handleRemoveExcludeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter(k => k !== keyword)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              스크래핑 설정
            </DialogTitle>
            <DialogDescription>
              웹 스크래핑 동작과 필터링 옵션을 구성합니다.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">일반 설정</TabsTrigger>
                  <TabsTrigger value="filtering">필터링</TabsTrigger>
                  <TabsTrigger value="schedule">스케줄</TabsTrigger>
                  <TabsTrigger value="advanced">고급 설정</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">기본 동작 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enabled">스크래핑 활성화</Label>
                          <p className="text-sm text-muted-foreground">전체 스크래핑 기능을 활성화/비활성화합니다</p>
                        </div>
                        <Switch
                          id="enabled"
                          checked={formData.enabled}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="interval">스크래핑 간격 (분)</Label>
                          <Input
                            id="interval"
                            type="number"
                            min="1"
                            max="1440"
                            value={formData.interval}
                            onChange={(e) => setFormData(prev => ({ ...prev, interval: parseInt(e.target.value) || 30 }))}
                          />
                          <p className="text-xs text-muted-foreground mt-1">1분 ~ 24시간 (1440분)</p>
                        </div>

                        <div>
                          <Label htmlFor="maxConcurrent">동시 실행 수</Label>
                          <Input
                            id="maxConcurrent"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.maxConcurrent}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrent: parseInt(e.target.value) || 5 }))}
                          />
                          <p className="text-xs text-muted-foreground mt-1">동시에 스크래핑할 소스 수</p>
                        </div>

                        <div>
                          <Label htmlFor="timeout">타임아웃 (초)</Label>
                          <Input
                            id="timeout"
                            type="number"
                            min="5"
                            max="300"
                            value={formData.timeout}
                            onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="retryAttempts">재시도 횟수</Label>
                          <Input
                            id="retryAttempts"
                            type="number"
                            min="0"
                            max="10"
                            value={formData.retryAttempts}
                            onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) || 3 }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Filtering Settings */}
                <TabsContent value="filtering" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">키워드 필터링</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>포함할 키워드</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="키워드 입력"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                          />
                          <Button type="button" onClick={handleAddKeyword}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <button
                                onClick={() => handleRemoveKeyword(keyword)}
                                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>제외할 키워드</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="제외할 키워드 입력"
                            value={newExcludeKeyword}
                            onChange={(e) => setNewExcludeKeyword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddExcludeKeyword()}
                          />
                          <Button type="button" onClick={handleAddExcludeKeyword}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.excludeKeywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {keyword}
                              <button
                                onClick={() => handleRemoveExcludeKeyword(keyword)}
                                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>최소 관련도 점수</Label>
                        <div className="mt-3">
                          <Slider
                            value={[formData.minRelevanceScore]}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, minRelevanceScore: value[0] }))}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0점</span>
                            <span className="font-medium">{formData.minRelevanceScore}점</span>
                            <span>100점</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>중복 검출</Label>
                          <p className="text-sm text-muted-foreground">유사한 내용의 기사를 자동으로 필터링합니다</p>
                        </div>
                        <Switch
                          checked={formData.duplicateDetection}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, duplicateDetection: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Schedule Settings */}
                <TabsContent value="schedule" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">스케줄 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="scheduleType">스케줄 타입</Label>
                        <Select value={formData.scheduleType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, scheduleType: value }))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="continuous">연속 실행</SelectItem>
                            <SelectItem value="scheduled">예약 실행</SelectItem>
                            <SelectItem value="manual">수동 실행</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.scheduleType === 'scheduled' && (
                        <div>
                          <Label>실행 시간 설정</Label>
                          <div className="mt-2 p-4 border rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span>예약 실행 시간을 설정하세요 (24시간 형식)</span>
                            </div>
                            {/* This could be expanded with time picker components */}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="timezone">시간대</Label>
                        <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Seoul">한국 표준시 (KST)</SelectItem>
                            <SelectItem value="UTC">협정 세계시 (UTC)</SelectItem>
                            <SelectItem value="America/New_York">미국 동부 (EST)</SelectItem>
                            <SelectItem value="Europe/London">영국 (GMT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">고급 설정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="userAgent">User Agent</Label>
                        <Input
                          id="userAgent"
                          value={formData.userAgent}
                          onChange={(e) => setFormData(prev => ({ ...prev, userAgent: e.target.value }))}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="requestDelay">요청 간격 (밀리초)</Label>
                        <Input
                          id="requestDelay"
                          type="number"
                          min="0"
                          max="10000"
                          value={formData.requestDelay}
                          onChange={(e) => setFormData(prev => ({ ...prev, requestDelay: parseInt(e.target.value) || 1000 }))}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">각 요청 사이의 지연 시간</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>robots.txt 준수</Label>
                          <p className="text-sm text-muted-foreground">웹사이트의 robots.txt 규칙을 따릅니다</p>
                        </div>
                        <Switch
                          checked={formData.respectRobots}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, respectRobots: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>JavaScript 실행</Label>
                          <p className="text-sm text-muted-foreground">동적 콘텐츠 로딩을 위한 JavaScript 실행</p>
                        </div>
                        <Switch
                          checked={formData.enableJavaScript}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableJavaScript: checked }))}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxArticlesPerSource">소스당 최대 기사 수</Label>
                          <Input
                            id="maxArticlesPerSource"
                            type="number"
                            min="10"
                            max="10000"
                            value={formData.maxArticlesPerSource}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxArticlesPerSource: parseInt(e.target.value) || 1000 }))}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="retentionDays">데이터 보관 기간 (일)</Label>
                          <Input
                            id="retentionDays"
                            type="number"
                            min="1"
                            max="365"
                            value={formData.retentionDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, retentionDays: parseInt(e.target.value) || 30 }))}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>자동 아카이브</Label>
                          <p className="text-sm text-muted-foreground">보관 기간이 지난 데이터를 자동으로 아카이브합니다</p>
                        </div>
                        <Switch
                          checked={formData.autoArchive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoArchive: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          <Separator />

          <DialogFooter className="p-6 pt-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>
              설정 저장
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}