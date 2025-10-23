'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Music, Volume2, Play, Pause, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AudioTrack {
  id: string
  name: string
  genre: string
  duration?: number
}

interface AudioMixerEditorProps {
  value: any
  onChange: (value: any) => void
}

export function AudioMixerEditor({ value = {}, onChange }: AudioMixerEditorProps) {
  const [audioSettings, setAudioSettings] = useState({
    enabled: value.enabled || false,
    track: value.track || '',
    volume: value.volume || 50,
    fadeIn: value.fadeIn || 0,
    fadeOut: value.fadeOut || 0,
    loop: value.loop || false,
    startTime: value.startTime || 0,
    endTime: value.endTime || null,
    ...value
  })

  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useState<HTMLAudioElement | null>(null)[0]

  useEffect(() => {
    fetchAudioTracks()
  }, [])

  const fetchAudioTracks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audio')
      if (!response.ok) {
        throw new Error('Failed to fetch audio tracks')
      }

      const data = await response.json()
      setAudioTracks(data.data || [])
    } catch (error) {
      console.error('Error fetching audio tracks:', error)
      toast.error('오디오 트랙을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (updates: any) => {
    const newValue = { ...audioSettings, ...updates }
    setAudioSettings(newValue)
    onChange(newValue)
  }

  const togglePreview = () => {
    if (!audioSettings.track) {
      toast.error('오디오 트랙을 먼저 선택해주세요')
      return
    }

    if (playing) {
      // Stop playback
      if (audioRef) {
        audioRef.pause()
        audioRef.currentTime = 0
      }
      setPlaying(false)
    } else {
      // Start playback
      const selectedTrack = audioTracks.find(t => t.name === audioSettings.track)
      if (selectedTrack) {
        const audio = new Audio(`/audio/${selectedTrack.id}`)
        audio.volume = audioSettings.volume / 100

        audio.play()
        audio.onended = () => setPlaying(false)
        setPlaying(true)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Music className="w-4 h-4" />
          배경음악
        </Label>
        <Switch
          checked={audioSettings.enabled}
          onCheckedChange={(enabled) => handleChange({ enabled })}
        />
      </div>

      {audioSettings.enabled && (
        <>
          <div className="space-y-2">
            <Label>오디오 트랙</Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Select
                value={audioSettings.track}
                onValueChange={(track) => handleChange({ track })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="트랙 선택" />
                </SelectTrigger>
                <SelectContent>
                  {audioTracks.map((track) => (
                    <SelectItem key={track.id} value={track.name}>
                      <div className="flex items-center gap-2">
                        <span>{track.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {track.genre}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {audioSettings.track && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={togglePreview}
              >
                {playing ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    정지
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    미리듣기
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    음량
                  </Label>
                  <span className="text-sm text-muted-foreground">{audioSettings.volume}%</span>
                </div>
                <Slider
                  value={[audioSettings.volume]}
                  onValueChange={([volume]) => handleChange({ volume })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>페이드 인</Label>
                  <span className="text-sm text-muted-foreground">{audioSettings.fadeIn}s</span>
                </div>
                <Slider
                  value={[audioSettings.fadeIn]}
                  onValueChange={([fadeIn]) => handleChange({ fadeIn })}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>페이드 아웃</Label>
                  <span className="text-sm text-muted-foreground">{audioSettings.fadeOut}s</span>
                </div>
                <Slider
                  value={[audioSettings.fadeOut]}
                  onValueChange={([fadeOut]) => handleChange({ fadeOut })}
                  min={0}
                  max={5}
                  step={0.1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>반복 재생</Label>
                <Switch
                  checked={audioSettings.loop}
                  onCheckedChange={(loop) => handleChange({ loop })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>시작 시간</Label>
                  <span className="text-sm text-muted-foreground">{audioSettings.startTime}s</span>
                </div>
                <Slider
                  value={[audioSettings.startTime]}
                  onValueChange={([startTime]) => handleChange({ startTime })}
                  min={0}
                  max={30}
                  step={0.1}
                />
              </div>

              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">선택한 트랙:</span>
                      <span className="font-medium">{audioSettings.track}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">음량:</span>
                      <span className="font-medium">{audioSettings.volume}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">페이드 효과:</span>
                      <span className="font-medium">
                        {audioSettings.fadeIn}s / {audioSettings.fadeOut}s
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">반복:</span>
                      <span className="font-medium">
                        {audioSettings.loop ? '활성화' : '비활성화'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}
