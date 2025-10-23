import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get video from database
    const video = await prisma.video.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Generate share links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const videoUrl = `${baseUrl}${video.filePath}`
    const sharePageUrl = `${baseUrl}/watch/${video.id}`

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString('hex')

    const shareLinks = {
      direct: sharePageUrl,
      video: videoUrl,

      // Social media share URLs
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(video.title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${video.title} ${sharePageUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(video.title)}`,

      // Embed code
      embed: `<iframe src="${sharePageUrl}/embed" width="640" height="360" frameborder="0" allowfullscreen></iframe>`,

      // Share token for tracking
      token: shareToken
    }

    return NextResponse.json({
      success: true,
      data: shareLinks
    })
  } catch (error) {
    console.error('Error generating share links:', error)
    return NextResponse.json(
      { error: 'Failed to generate share links' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { platform, customMessage } = body

    // Get video from database
    const video = await prisma.video.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Update share count
    await prisma.video.update({
      where: { id: params.id },
      data: {
        shares: {
          increment: 1
        }
      }
    })

    // Platform-specific sharing logic
    let shareResult: any = {
      platform,
      videoId: params.id,
      timestamp: new Date().toISOString()
    }

    switch (platform) {
      case 'youtube':
        // In production, integrate with YouTube Data API
        shareResult.status = 'pending'
        shareResult.message = 'YouTube upload requires OAuth authentication'
        shareResult.uploadUrl = 'https://www.youtube.com/upload'
        break

      case 'tiktok':
        // In production, integrate with TikTok API
        shareResult.status = 'pending'
        shareResult.message = 'TikTok upload requires API credentials'
        break

      case 'instagram':
        // Instagram doesn't have direct video upload API for web
        shareResult.status = 'manual'
        shareResult.message = 'Please download and upload manually to Instagram'
        break

      case 'facebook':
        // In production, integrate with Facebook Graph API
        shareResult.status = 'pending'
        shareResult.message = 'Facebook upload requires app credentials'
        break

      case 'twitter':
        // In production, integrate with Twitter API
        shareResult.status = 'pending'
        shareResult.message = 'Twitter upload requires API credentials'
        break

      default:
        shareResult.status = 'unsupported'
        shareResult.message = `Platform ${platform} is not supported`
    }

    return NextResponse.json({
      success: true,
      message: 'Share request processed',
      data: shareResult
    })
  } catch (error) {
    console.error('Error processing share:', error)
    return NextResponse.json(
      { error: 'Failed to process share' },
      { status: 500 }
    )
  }
}
