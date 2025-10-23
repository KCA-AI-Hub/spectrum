'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface VideoShareDialogProps {
  videoId: string
  videoTitle: string
  children?: React.ReactNode
}

interface ShareLinks {
  direct: string
  video: string
  facebook: string
  twitter: string
  linkedin: string
  whatsapp: string
  telegram: string
  embed: string
  token: string
}

export function VideoShareDialog({
  videoId,
  videoTitle,
  children
}: VideoShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shareLinks, setShareLinks] = useState<ShareLinks | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [embedWidth, setEmbedWidth] = useState('640')
  const [embedHeight, setEmbedHeight] = useState('360')
  const [embedAutoplay, setEmbedAutoplay] = useState(false)

  useEffect(() => {
    if (open && !shareLinks) {
      fetchShareLinks()
    }
  }, [open])

  const fetchShareLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/videos/${videoId}/share`)

      if (!response.ok) {
        throw new Error('Failed to fetch share links')
      }

      const data = await response.json()
      setShareLinks(data.data)
    } catch (error) {
      console.error('Error fetching share links:', error)
      toast.error('공유 링크를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('클립보드에 복사되었습니다')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('복사에 실패했습니다')
    }
  }

  const handleSocialShare = async (platform: string, url: string) => {
    try {
      // Track share
      await fetch(`/api/videos/${videoId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })

      // Open share URL
      window.open(url, '_blank', 'width=600,height=400')
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const getEmbedCode = () => {
    if (!shareLinks) return ''

    const autoplayParam = embedAutoplay ? '&autoplay=1' : ''
    return `<iframe src="${shareLinks.direct}/embed?width=${embedWidth}&height=${embedHeight}${autoplayParam}" width="${embedWidth}" height="${embedHeight}" frameborder="0" allowfullscreen></iframe>`
  }

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: () => shareLinks?.facebook
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: () => shareLinks?.twitter
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      getUrl: () => shareLinks?.linkedin
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      getUrl: () => shareLinks?.whatsapp
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      getUrl: () => shareLinks?.telegram
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            동영상 공유
          </DialogTitle>
          <DialogDescription>
            {videoTitle}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : shareLinks ? (
          <Tabs defaultValue="social" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">소셜 미디어</TabsTrigger>
              <TabsTrigger value="link">링크</TabsTrigger>
              <TabsTrigger value="embed">임베드</TabsTrigger>
            </TabsList>

            {/* Social Media Tab */}
            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon
                  const url = platform.getUrl()
                  if (!url) return null

                  return (
                    <Button
                      key={platform.name}
                      className={`${platform.color} text-white`}
                      onClick={() => handleSocialShare(platform.name.toLowerCase(), url)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform.name}에 공유
                    </Button>
                  )
                })}
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    소셜 미디어 플랫폼에 직접 공유하거나, 링크를 복사하여 사용하세요.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Link Tab */}
            <TabsContent value="link" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>공유 페이지 링크</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareLinks.direct}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareLinks.direct, 'direct')}
                    >
                      {copiedField === 'direct' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(shareLinks.direct, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>동영상 직접 링크</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareLinks.video}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareLinks.video, 'video')}
                    >
                      {copiedField === 'video' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">공유 링크 사용 방법</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 공유 페이지: 동영상 정보와 플레이어가 포함된 페이지</li>
                        <li>• 직접 링크: 동영상 파일 자체의 URL</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Embed Tab */}
            <TabsContent value="embed" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>너비</Label>
                  <Input
                    type="number"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    placeholder="640"
                  />
                </div>
                <div className="space-y-2">
                  <Label>높이</Label>
                  <Input
                    type="number"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    placeholder="360"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>임베드 코드</Label>
                <div className="relative">
                  <Textarea
                    value={getEmbedCode()}
                    readOnly
                    className="font-mono text-sm resize-none"
                    rows={4}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(getEmbedCode(), 'embed')}
                  >
                    {copiedField === 'embed' ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    복사
                  </Button>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">임베드 코드 사용</p>
                      <p className="text-sm text-muted-foreground">
                        위의 코드를 복사하여 웹사이트나 블로그에 붙여넣으세요.
                        동영상 플레이어가 자동으로 표시됩니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="space-y-2">
                <Label>미리보기</Label>
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center aspect-video">
                  <div
                    className="bg-background border rounded-lg overflow-hidden"
                    style={{
                      width: Math.min(parseInt(embedWidth) || 640, 400),
                      height: Math.min(parseInt(embedHeight) || 360, 225)
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                      <p className="text-sm text-muted-foreground">
                        임베드 미리보기
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
