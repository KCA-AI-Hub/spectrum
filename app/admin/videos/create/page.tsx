'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Video,
  Wand2,
  Settings,
  Type,
  Music,
  Clock,
  Palette,
  Monitor,
  Smartphone,
  Square,
  FileText,
  Sparkles,
  Loader2
} from 'lucide-react'

type VideoFormat = 'vertical' | 'horizontal' | 'square'
type VideoStyle = 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful'

interface VideoSettings {
  summaryId: string
  format: VideoFormat
  style: VideoStyle
  colorPalette: string
  textOverlay: {
    enabled: boolean
    font: string
    size: number
    position: 'top' | 'center' | 'bottom'
    animation: 'fade' | 'slide' | 'zoom' | 'none'
  }
  backgroundMusic: {
    enabled: boolean
    track: string
    volume: number
  }
  duration: number
  segments: number
  prompt: string
  keywords: string[]
  tone: 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic'
}

export default function VideoCreatePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<VideoSettings>({
    summaryId: '',
    format: 'vertical',
    style: 'modern',
    colorPalette: 'vibrant',
    textOverlay: {
      enabled: true,
      font: 'inter',
      size: 32,
      position: 'center',
      animation: 'fade'
    },
    backgroundMusic: {
      enabled: true,
      track: 'upbeat',
      volume: 30
    },
    duration: 30,
    segments: 3,
    prompt: '',
    keywords: [],
    tone: 'professional'
  })

  const [selectedSummaries, setSelectedSummaries] = useState<string[]>([])
  const [summaries, setSummaries] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [audioTracks, setAudioTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [generatingPrompt, setGeneratingPrompt] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [summariesRes, templatesRes, audioRes] = await Promise.all([
        fetch('/api/summaries?limit=20'),
        fetch('/api/videos/templates'),
        fetch('/api/audio?isActive=true')
      ])

      if (summariesRes.ok) {
        const data = await summariesRes.json()
        setSummaries(data.data || [])
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json()
        setTemplates(data.data || [])
      }

      if (audioRes.ok) {
        const data = await audioRes.json()
        setAudioTracks(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const videoFormats = [
    { value: 'vertical', label: '세로형 (9:16)', icon: Smartphone, desc: 'TikTok, Instagram Reels' },
    { value: 'horizontal', label: '가로형 (16:9)', icon: Monitor, desc: 'YouTube, 일반 영상' },
    { value: 'square', label: '정사각형 (1:1)', icon: Square, desc: 'Instagram Feed' }
  ]

  const videoStyles = [
    { value: 'modern', label: '모던', desc: '깔끔하고 세련된 스타일', color: 'bg-blue-500' },
    { value: 'minimal', label: '미니멀', desc: '단순하고 간결한 디자인', color: 'bg-gray-500' },
    { value: 'bold', label: '볼드', desc: '강렬하고 임팩트 있는 스타일', color: 'bg-red-500' },
    { value: 'elegant', label: '엘레강트', desc: '우아하고 고급스러운 느낌', color: 'bg-purple-500' },
    { value: 'playful', label: '플레이풀', desc: '재미있고 활기찬 분위기', color: 'bg-orange-500' }
  ]

  const colorPalettes = [
    { value: 'vibrant', label: '생동감', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'] },
    { value: 'pastel', label: '파스텔', colors: ['#FFD3E1', '#C7CEEA', '#B5EAD7', '#FFDAC1'] },
    { value: 'corporate', label: '기업용', colors: ['#2C3E50', '#3498DB', '#ECF0F1', '#95A5A6'] },
    { value: 'sunset', label: '석양', colors: ['#FF6B35', '#F7931E', '#FDC830', '#F37335'] },
    { value: 'ocean', label: '오션', colors: ['#006994', '#0091AD', '#7FCDCD', '#B5E5CF'] }
  ]

  const fonts = [
    { value: 'inter', label: 'Inter' },
    { value: 'roboto', label: 'Roboto' },
    { value: 'montserrat', label: 'Montserrat' },
    { value: 'noto-sans', label: 'Noto Sans KR' },
    { value: 'pretendard', label: 'Pretendard' }
  ]

  // musicTracks는 이제 audioTracks state에서 가져옴

  const handleCreateVideo = async () => {
    if (selectedSummaries.length === 0) {
      toast.error('콘텐츠를 선택해주세요')
      return
    }

    // 프롬프트가 없으면 먼저 생성
    if (!settings.prompt) {
      toast.error('먼저 프롬프트를 생성해주세요')
      return
    }

    try {
      setCreating(true)

      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summaryId: selectedSummaries[0],
          title: summaries.find(s => s.id === selectedSummaries[0])?.article?.title || '동영상',
          prompt: settings.prompt,
          format: settings.format.toUpperCase(),
          style: settings.style.toUpperCase(),
          colorPalette: settings.colorPalette,
          resolution: getResolutionFromFormat(settings.format),
          textOverlay: settings.textOverlay.enabled ? settings.textOverlay : undefined,
          backgroundMusic: settings.backgroundMusic.enabled ? settings.backgroundMusic : undefined,
          duration: settings.duration,
          segments: settings.segments
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create video')
      }

      const data = await response.json()

      toast.success('동영상 생성이 시작되었습니다!')
      router.push('/admin/videos')
    } catch (error) {
      console.error('Error creating video:', error)
      toast.error('동영상 생성에 실패했습니다')
    } finally {
      setCreating(false)
    }
  }

  const getResolutionFromFormat = (format: VideoFormat): string => {
    const resolutions = {
      vertical: '1080x1920',
      horizontal: '1920x1080',
      square: '1080x1080'
    }
    return resolutions[format]
  }

  const handleGeneratePrompt = async () => {
    if (selectedSummaries.length === 0) {
      toast.error('먼저 콘텐츠를 선택해주세요')
      return
    }

    try {
      setGeneratingPrompt(true)

      const response = await fetch('/api/videos/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summaryId: selectedSummaries[0],
          style: settings.style.toUpperCase(),
          format: settings.format.toUpperCase(),
          duration: settings.duration,
          tone: settings.tone,
          extractKeywordsFirst: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate prompt')
      }

      const data = await response.json()

      setSettings({
        ...settings,
        prompt: data.data.prompt || '',
        keywords: data.data.keywords || []
      })

      toast.success('프롬프트가 생성되었습니다!')
    } catch (error) {
      console.error('Error generating prompt:', error)
      toast.error('프롬프트 생성에 실패했습니다')
    } finally {
      setGeneratingPrompt(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">동영상 생성</h1>
        <p className="text-muted-foreground mt-2">
          요약된 콘텐츠를 바탕으로 숏폼 동영상을 생성합니다
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            콘텐츠
          </TabsTrigger>
          <TabsTrigger value="style">
            <Palette className="w-4 h-4 mr-2" />
            스타일
          </TabsTrigger>
          <TabsTrigger value="format">
            <Settings className="w-4 h-4 mr-2" />
            형식
          </TabsTrigger>
          <TabsTrigger value="text">
            <Type className="w-4 h-4 mr-2" />
            텍스트
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Music className="w-4 h-4 mr-2" />
            오디오
          </TabsTrigger>
        </TabsList>

        {/* 1. 콘텐츠 선택 */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>콘텐츠 선택</CardTitle>
              <CardDescription>
                동영상으로 만들 요약된 텍스트를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
                </div>
              ) : summaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>사용 가능한 콘텐츠가 없습니다</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {summaries.map((summary) => (
                    <Card
                      key={summary.id}
                      className={`cursor-pointer transition-all ${
                        selectedSummaries.includes(summary.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedSummaries((prev) =>
                          prev.includes(summary.id)
                            ? prev.filter((id) => id !== summary.id)
                            : [...prev, summary.id]
                        )
                        setSettings({ ...settings, summaryId: summary.id })
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{summary.article?.title || '제목 없음'}</h3>
                              <Badge variant="outline">{summary.type || 'short'}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {summary.content.substring(0, 200)}...
                            </p>
                          </div>
                          {selectedSummaries.includes(summary.id) && (
                            <Sparkles className="w-5 h-5 text-primary ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && selectedSummaries.length === 0 && summaries.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>위에서 콘텐츠를 선택하세요</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 프롬프트 편집 */}
          {selectedSummaries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>비디오 프롬프트</span>
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={generatingPrompt}
                    variant="outline"
                    size="sm"
                  >
                    {generatingPrompt ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI로 프롬프트 생성
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI가 생성한 프롬프트를 확인하고 수정할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 톤 선택 */}
                <div>
                  <Label className="mb-2 block">영상 톤</Label>
                  <Select
                    value={settings.tone}
                    onValueChange={(value: any) => setSettings({ ...settings, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">전문적</SelectItem>
                      <SelectItem value="casual">캐주얼</SelectItem>
                      <SelectItem value="energetic">활기찬</SelectItem>
                      <SelectItem value="calm">차분한</SelectItem>
                      <SelectItem value="dramatic">극적인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 키워드 표시 */}
                {settings.keywords.length > 0 && (
                  <div>
                    <Label className="mb-2 block">추출된 키워드</Label>
                    <div className="flex flex-wrap gap-2">
                      {settings.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 프롬프트 편집 */}
                <div>
                  <Label className="mb-2 block">프롬프트 (직접 편집 가능)</Label>
                  <Textarea
                    value={settings.prompt}
                    onChange={(e) => setSettings({ ...settings, prompt: e.target.value })}
                    placeholder="AI가 프롬프트를 생성하거나 직접 입력하세요..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    이 프롬프트는 Text-to-Video AI에 전달되어 동영상을 생성하는 데 사용됩니다
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 2. 스타일 선택 */}
        <TabsContent value="style" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>동영상 스타일</CardTitle>
              <CardDescription>
                동영상의 전체적인 분위기와 테마를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 템플릿 갤러리 */}
              {templates.length > 0 && (
                <div>
                  <Label className="mb-4 block">저장된 템플릿</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templates.map((template) => {
                      const textOverlay = typeof template.textOverlay === 'string'
                        ? JSON.parse(template.textOverlay)
                        : template.textOverlay
                      const backgroundMusic = typeof template.backgroundMusic === 'string'
                        ? JSON.parse(template.backgroundMusic)
                        : template.backgroundMusic

                      return (
                        <Card
                          key={template.id}
                          className="cursor-pointer transition-all hover:border-primary/50"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              style: template.style.toLowerCase() as VideoStyle,
                              colorPalette: template.colorPalette,
                              textOverlay: textOverlay || settings.textOverlay,
                              backgroundMusic: backgroundMusic || settings.backgroundMusic
                            })
                            toast.success(`"${template.name}" 템플릿이 적용되었습니다`)
                          }}
                        >
                          <CardContent className="p-4">
                            {template.thumbnailUrl && (
                              <div
                                className="w-full h-24 rounded-lg bg-cover bg-center mb-3"
                                style={{ backgroundImage: `url(${template.thumbnailUrl})` }}
                              />
                            )}
                            <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {template.style}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {template.usageCount}회 사용
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  <div className="border-t my-6" />
                </div>
              )}

              <div>
                <Label className="mb-4 block">스타일 선택</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {videoStyles.map((style) => (
                    <Card
                      key={style.value}
                      className={`cursor-pointer transition-all ${
                        settings.style === style.value
                          ? 'border-primary ring-2 ring-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSettings({ ...settings, style: style.value as VideoStyle })}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-full h-24 rounded-lg ${style.color} mb-3`} />
                        <h4 className="font-semibold mb-1">{style.label}</h4>
                        <p className="text-xs text-muted-foreground">{style.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-4 block">색상 팔레트</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {colorPalettes.map((palette) => (
                    <Card
                      key={palette.value}
                      className={`cursor-pointer transition-all ${
                        settings.colorPalette === palette.value
                          ? 'border-primary ring-2 ring-primary'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSettings({ ...settings, colorPalette: palette.value })}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-1 mb-3">
                          {palette.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-16 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium text-center">{palette.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. 형식 설정 */}
        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>동영상 형식</CardTitle>
              <CardDescription>
                해상도와 화면 비율을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-4 block">화면 비율</Label>
                <RadioGroup
                  value={settings.format}
                  onValueChange={(value) => setSettings({ ...settings, format: value as VideoFormat })}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {videoFormats.map((format) => {
                      const Icon = format.icon
                      return (
                        <Card
                          key={format.value}
                          className={`cursor-pointer transition-all ${
                            settings.format === format.value
                              ? 'border-primary ring-2 ring-primary'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <CardContent className="p-6">
                            <RadioGroupItem value={format.value} id={format.value} className="sr-only" />
                            <label htmlFor={format.value} className="cursor-pointer">
                              <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                              <h4 className="font-semibold text-center mb-1">{format.label}</h4>
                              <p className="text-xs text-muted-foreground text-center">{format.desc}</p>
                            </label>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>동영상 길이</Label>
                  <span className="text-sm text-muted-foreground">{settings.duration}초</span>
                </div>
                <Slider
                  value={[settings.duration]}
                  onValueChange={([value]) => setSettings({ ...settings, duration: value })}
                  min={15}
                  max={180}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>15초</span>
                  <span>60초</span>
                  <span>180초</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>세그먼트 수</Label>
                  <span className="text-sm text-muted-foreground">{settings.segments}개</span>
                </div>
                <Slider
                  value={[settings.segments]}
                  onValueChange={([value]) => setSettings({ ...settings, segments: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  콘텐츠를 몇 개의 장면으로 나눌지 설정합니다
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. 텍스트 오버레이 */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>텍스트 오버레이</CardTitle>
              <CardDescription>
                동영상에 표시될 텍스트 스타일을 설정하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>텍스트 오버레이 사용</Label>
                  <p className="text-sm text-muted-foreground">
                    동영상에 텍스트를 표시합니다
                  </p>
                </div>
                <Switch
                  checked={settings.textOverlay.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      textOverlay: { ...settings.textOverlay, enabled: checked }
                    })
                  }
                />
              </div>

              {settings.textOverlay.enabled && (
                <>
                  <div>
                    <Label className="mb-2 block">폰트</Label>
                    <Select
                      value={settings.textOverlay.font}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          textOverlay: { ...settings.textOverlay, font: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>텍스트 크기</Label>
                      <span className="text-sm text-muted-foreground">{settings.textOverlay.size}px</span>
                    </div>
                    <Slider
                      value={[settings.textOverlay.size]}
                      onValueChange={([value]) =>
                        setSettings({
                          ...settings,
                          textOverlay: { ...settings.textOverlay, size: value }
                        })
                      }
                      min={16}
                      max={72}
                      step={4}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">텍스트 위치</Label>
                    <RadioGroup
                      value={settings.textOverlay.position}
                      onValueChange={(value: any) =>
                        setSettings({
                          ...settings,
                          textOverlay: { ...settings.textOverlay, position: value }
                        })
                      }
                    >
                      <div className="grid grid-cols-3 gap-4">
                        {['top', 'center', 'bottom'].map((pos) => (
                          <Card
                            key={pos}
                            className={`cursor-pointer transition-all ${
                              settings.textOverlay.position === pos
                                ? 'border-primary ring-2 ring-primary'
                                : 'hover:border-primary/50'
                            }`}
                          >
                            <CardContent className="p-4">
                              <RadioGroupItem value={pos} id={pos} className="sr-only" />
                              <label htmlFor={pos} className="cursor-pointer block text-center">
                                <p className="font-medium capitalize">{pos === 'top' ? '상단' : pos === 'center' ? '중앙' : '하단'}</p>
                              </label>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="mb-2 block">애니메이션</Label>
                    <Select
                      value={settings.textOverlay.animation}
                      onValueChange={(value: any) =>
                        setSettings({
                          ...settings,
                          textOverlay: { ...settings.textOverlay, animation: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">없음</SelectItem>
                        <SelectItem value="fade">페이드 인/아웃</SelectItem>
                        <SelectItem value="slide">슬라이드</SelectItem>
                        <SelectItem value="zoom">줌 인/아웃</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. 오디오 설정 */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>배경음악 및 효과음</CardTitle>
              <CardDescription>
                동영상에 사용할 오디오를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>배경음악 사용</Label>
                  <p className="text-sm text-muted-foreground">
                    동영상에 배경음악을 추가합니다
                  </p>
                </div>
                <Switch
                  checked={settings.backgroundMusic.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      backgroundMusic: { ...settings.backgroundMusic, enabled: checked }
                    })
                  }
                />
              </div>

              {settings.backgroundMusic.enabled && (
                <>
                  <div>
                    <Label className="mb-2 block">음악 트랙</Label>
                    {audioTracks.length > 0 ? (
                      <Select
                        value={settings.backgroundMusic.track}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            backgroundMusic: { ...settings.backgroundMusic, track: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="음악 트랙을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {audioTracks.map((track) => (
                            <SelectItem key={track.id} value={track.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{track.name}</span>
                                <Badge variant="outline" className="ml-2">{track.genre}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-muted-foreground p-4 border rounded-lg">
                        사용 가능한 음악 트랙이 없습니다. 먼저 오디오 파일을 업로드하세요.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>음량</Label>
                      <span className="text-sm text-muted-foreground">{settings.backgroundMusic.volume}%</span>
                    </div>
                    <Slider
                      value={[settings.backgroundMusic.volume]}
                      onValueChange={([value]) =>
                        setSettings({
                          ...settings,
                          backgroundMusic: { ...settings.backgroundMusic, volume: value }
                        })
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 생성 버튼 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">동영상 생성 준비 완료</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedSummaries.length}개 콘텐츠 선택됨 • {settings.format} • {settings.duration}초
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCreateVideo}
              disabled={selectedSummaries.length === 0 || creating}
              className="gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  동영상 생성 시작
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
