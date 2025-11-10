import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateVideoPrompt, extractKeywords } from '@/lib/api/openai'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      summaryId,
      content,
      style,
      format,
      duration,
      tone,
      targetAudience,
      extractKeywordsFirst = true,
      customTemplate
    } = body

    // 입력 검증
    if (!content && !summaryId) {
      return NextResponse.json(
        { error: 'Either content or summaryId is required' },
        { status: 400 }
      )
    }

    let textContent = content

    // summaryId가 제공된 경우 요약 내용 가져오기
    if (summaryId) {
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

      textContent = summary.content
    }

    // 키워드 추출 (선택사항)
    let keywords: string[] = []
    if (extractKeywordsFirst) {
      const keywordResult = await extractKeywords(textContent, { count: 5 })
      if (keywordResult.success && keywordResult.keywords) {
        // 쉼표로 구분된 키워드를 배열로 변환
        keywords = keywordResult.keywords.split(',').map(k => k.trim())
      }
    }

    // 비디오 프롬프트 생성
    const result = await generateVideoPrompt(textContent, {
      style,
      format,
      duration,
      keywords,
      tone,
      targetAudience,
      customTemplate
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        prompt: result.prompt,
        keywords,
        usage: result.usage
      }
    })

  } catch (error) {
    console.error('Error generating video prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate video prompt' },
      { status: 500 }
    )
  }
}
