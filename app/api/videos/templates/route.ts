import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const style = searchParams.get('style')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (style) {
      where.style = style
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const templates = await prisma.videoTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields
    const parsedTemplates = templates.map(template => ({
      ...template,
      textOverlay: JSON.parse(template.textOverlay),
      backgroundMusic: JSON.parse(template.backgroundMusic)
    }))

    return NextResponse.json({
      success: true,
      data: parsedTemplates
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      style,
      colorPalette,
      textOverlay,
      backgroundMusic,
      thumbnailUrl
    } = body

    // 입력 검증
    if (!name || !style || !colorPalette) {
      return NextResponse.json(
        { error: 'name, style, and colorPalette are required' },
        { status: 400 }
      )
    }

    const template = await prisma.videoTemplate.create({
      data: {
        name,
        description,
        style,
        colorPalette,
        textOverlay: JSON.stringify(textOverlay || {
          enabled: true,
          font: 'Arial',
          size: 24,
          position: 'center',
          animation: 'fade'
        }),
        backgroundMusic: JSON.stringify(backgroundMusic || {
          enabled: false,
          track: '',
          volume: 0.5
        }),
        thumbnailUrl
      }
    })

    return NextResponse.json({
      success: true,
      data: template
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
