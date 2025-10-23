import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'mp4'
    const quality = searchParams.get('quality') || 'original'
    const resolution = searchParams.get('resolution')

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

    if (!video.filePath) {
      return NextResponse.json(
        { error: 'Video file not available' },
        { status: 400 }
      )
    }

    // Check if file exists
    const filePath = path.join(process.cwd(), 'public', video.filePath)

    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'Video file not found on server' },
        { status: 404 }
      )
    }

    // Update download count
    await prisma.video.update({
      where: { id: params.id },
      data: {
        downloads: {
          increment: 1
        }
      }
    })

    // For now, return the original file URL
    // In production, this would handle format conversion using FFmpeg
    const downloadUrl = video.filePath
    const fileName = `${video.title}.${format}`

    return NextResponse.json({
      success: true,
      data: {
        url: downloadUrl,
        fileName,
        format,
        quality,
        resolution: resolution || video.resolution,
        size: video.fileSize
      }
    })
  } catch (error) {
    console.error('Error processing download:', error)
    return NextResponse.json(
      { error: 'Failed to process download' },
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
    const { format, quality, resolution, startTime, endTime } = body

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

    if (!video.filePath) {
      return NextResponse.json(
        { error: 'Video file not available' },
        { status: 400 }
      )
    }

    // In production, this would use FFmpeg to convert the video
    // For now, we'll return a conversion job ID
    const conversionJob = {
      id: `conv-${Date.now()}`,
      videoId: params.id,
      status: 'processing',
      format,
      quality,
      resolution,
      startTime,
      endTime,
      createdAt: new Date().toISOString()
    }

    // Here you would typically:
    // 1. Queue a background job for video conversion
    // 2. Use FFmpeg to convert the video
    // 3. Store the converted file
    // 4. Return the download URL when complete

    return NextResponse.json({
      success: true,
      message: 'Video conversion started',
      data: conversionJob
    })
  } catch (error) {
    console.error('Error starting conversion:', error)
    return NextResponse.json(
      { error: 'Failed to start conversion' },
      { status: 500 }
    )
  }
}
