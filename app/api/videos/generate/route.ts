import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { videoJobManager } from '@/lib/video/job-manager'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 입력 검증
    const {
      summaryId,
      title,
      description,
      prompt,
      format = 'VERTICAL',
      style = 'MODERN',
      colorPalette,
      resolution,
      textOverlay,
      backgroundMusic,
      duration = 30,
      segments = 1
    } = body

    if (!summaryId) {
      return NextResponse.json(
        { error: 'summaryId is required' },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // Summary 존재 확인
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
      include: { article: true }
    })

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      )
    }

    // 프롬프트가 제공되지 않은 경우에만 자동 생성
    let videoPrompt = prompt
    if (!videoPrompt) {
      videoPrompt = await generatePrompt(summary.content, {
        style,
        format,
        colorPalette
      })
    }

    // VideoJobManager를 통해 동영상 생성 작업 생성
    const video = await videoJobManager.createJob({
      summaryId,
      articleId: summary.articleId,
      title,
      description: description || summary.content.substring(0, 200),
      prompt: videoPrompt,
      format,
      style,
      colorPalette,
      resolution,
      textOverlay,
      backgroundMusic,
      duration,
      segments
    })

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        status: video.status,
        format: video.format,
        style: video.style,
        duration: video.duration
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating video generation job:', error)
    return NextResponse.json(
      { error: 'Failed to create video generation job' },
      { status: 500 }
    )
  }
}

// 프롬프트 생성 함수
async function generatePrompt(
  content: string,
  options: {
    style: string
    format: string
    colorPalette?: string
  }
): Promise<string> {
  const styleDescriptions: Record<string, string> = {
    MODERN: 'modern, sleek, clean design with smooth transitions',
    MINIMAL: 'minimalist, simple, elegant with subtle animations',
    BOLD: 'bold, vibrant, eye-catching with dynamic movements',
    ELEGANT: 'elegant, sophisticated, refined with graceful transitions',
    PLAYFUL: 'playful, fun, energetic with lively animations'
  }

  const formatDescriptions: Record<string, string> = {
    VERTICAL: 'vertical format optimized for mobile viewing (9:16 aspect ratio)',
    HORIZONTAL: 'horizontal format optimized for desktop and TV (16:9 aspect ratio)',
    SQUARE: 'square format optimized for social media (1:1 aspect ratio)'
  }

  const styleDesc = styleDescriptions[options.style] || 'modern style'
  const formatDesc = formatDescriptions[options.format] || 'standard format'

  // 요약 내용을 바탕으로 프롬프트 생성
  const prompt = `Create a ${styleDesc} video in ${formatDesc}.
Content: ${content.substring(0, 500)}
${options.colorPalette ? `Color palette: ${options.colorPalette}` : ''}

Make it engaging, visually appealing, and suitable for short-form content.`

  return prompt
}

