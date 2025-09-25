"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Share2,
  ExternalLink,
  Calendar,
  Globe,
  Tag,
  BookmarkPlus,
  Copy,
  Check
} from "lucide-react"

export interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  source: string
  url: string
  publishedAt: string
  category: string
  tags: string[]
  relevanceScore: number
  isFavorited?: boolean
}

interface NewsDetailModalProps {
  article: NewsArticle | null
  isOpen: boolean
  onClose: () => void
  keywords?: string[]
  onToggleFavorite?: (articleId: string) => void
}

export function NewsDetailModal({
  article,
  isOpen,
  onClose,
  keywords = [],
  onToggleFavorite
}: NewsDetailModalProps) {
  const [isFavorited, setIsFavorited] = useState(article?.isFavorited || false)
  const [copied, setCopied] = useState(false)

  if (!article) return null

  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return text

    const keywordRegex = new RegExp(`(${keywords.join('|')})`, 'gi')
    return text.replace(keywordRegex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
  }

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    onToggleFavorite?.(article.id)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.url
        })
      } catch (error) {
        // Fallback to copy URL
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(article.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleOpenOriginal = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl leading-tight mb-3">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(article.title, keywords)
                    }}
                  />
                </DialogTitle>
                <DialogDescription className="text-base">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(article.summary, keywords)
                    }}
                  />
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-chart-1/10 text-chart-1"
                >
                  관련도 {article.relevanceScore}점
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Meta Information */}
          <div className="px-6 py-3">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{article.source}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{article.category}</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4">
              <div
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightKeywords(article.content, keywords)
                }}
              />
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer Actions */}
          <div className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={isFavorited ? "text-red-500 hover:text-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "즐겨찾기 제거" : "즐겨찾기"}
                </Button>

                <Button variant="ghost" size="sm">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  나중에 읽기
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  공유하기
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      URL 복사
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenOriginal}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  원문 보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}