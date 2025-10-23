'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Type, AlignCenter, AlignLeft, AlignRight } from 'lucide-react'

interface TextOverlayEditorProps {
  value: any
  onChange: (value: any) => void
}

export function TextOverlayEditor({ value = {}, onChange }: TextOverlayEditorProps) {
  const [textOverlay, setTextOverlay] = useState({
    enabled: value.enabled || false,
    text: value.text || '',
    font: value.font || 'Arial',
    size: value.size || 32,
    color: value.color || '#ffffff',
    position: value.position || 'bottom',
    animation: value.animation || 'none',
    duration: value.duration || 1,
    delay: value.delay || 0,
    opacity: value.opacity || 100,
    ...value
  })

  const handleChange = (updates: any) => {
    const newValue = { ...textOverlay, ...updates }
    setTextOverlay(newValue)
    onChange(newValue)
  }

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS'
  ]

  const positions = [
    { value: 'top', label: '상단' },
    { value: 'center', label: '중앙' },
    { value: 'bottom', label: '하단' },
    { value: 'custom', label: '사용자 지정' }
  ]

  const animations = [
    { value: 'none', label: '없음' },
    { value: 'fade', label: '페이드 인' },
    { value: 'slide-up', label: '위로 슬라이드' },
    { value: 'slide-down', label: '아래로 슬라이드' },
    { value: 'slide-left', label: '왼쪽으로 슬라이드' },
    { value: 'slide-right', label: '오른쪽으로 슬라이드' },
    { value: 'zoom', label: '줌 인' },
    { value: 'bounce', label: '바운스' },
    { value: 'typewriter', label: '타이핑 효과' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          텍스트 오버레이
        </Label>
        <Switch
          checked={textOverlay.enabled}
          onCheckedChange={(enabled) => handleChange({ enabled })}
        />
      </div>

      {textOverlay.enabled && (
        <>
          <div className="space-y-2">
            <Label>텍스트</Label>
            <Textarea
              value={textOverlay.text}
              onChange={(e) => handleChange({ text: e.target.value })}
              placeholder="표시할 텍스트를 입력하세요"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>폰트</Label>
              <Select
                value={textOverlay.font}
                onValueChange={(font) => handleChange({ font })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={textOverlay.color}
                  onChange={(e) => handleChange({ color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={textOverlay.color}
                  onChange={(e) => handleChange({ color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>크기</Label>
              <span className="text-sm text-muted-foreground">{textOverlay.size}px</span>
            </div>
            <Slider
              value={[textOverlay.size]}
              onValueChange={([size]) => handleChange({ size })}
              min={16}
              max={120}
              step={2}
            />
          </div>

          <div className="space-y-2">
            <Label>위치</Label>
            <Select
              value={textOverlay.position}
              onValueChange={(position) => handleChange({ position })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>애니메이션</Label>
            <Select
              value={textOverlay.animation}
              onValueChange={(animation) => handleChange({ animation })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {animations.map((anim) => (
                  <SelectItem key={anim.value} value={anim.value}>
                    {anim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {textOverlay.animation !== 'none' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>애니메이션 지속 시간</Label>
                  <span className="text-sm text-muted-foreground">{textOverlay.duration}s</span>
                </div>
                <Slider
                  value={[textOverlay.duration]}
                  onValueChange={([duration]) => handleChange({ duration })}
                  min={0.1}
                  max={5}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>애니메이션 시작 시간</Label>
                  <span className="text-sm text-muted-foreground">{textOverlay.delay}s</span>
                </div>
                <Slider
                  value={[textOverlay.delay]}
                  onValueChange={([delay]) => handleChange({ delay })}
                  min={0}
                  max={10}
                  step={0.1}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>불투명도</Label>
              <span className="text-sm text-muted-foreground">{textOverlay.opacity}%</span>
            </div>
            <Slider
              value={[textOverlay.opacity]}
              onValueChange={([opacity]) => handleChange({ opacity })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="pt-4 border-t">
            <Label className="text-sm text-muted-foreground">미리보기</Label>
            <div className="mt-2 p-8 bg-muted rounded-lg flex items-center justify-center min-h-[120px]">
              <p
                style={{
                  fontFamily: textOverlay.font,
                  fontSize: `${Math.min(textOverlay.size, 24)}px`,
                  color: textOverlay.color,
                  opacity: textOverlay.opacity / 100,
                  textAlign: 'center'
                }}
              >
                {textOverlay.text || '텍스트 미리보기'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
