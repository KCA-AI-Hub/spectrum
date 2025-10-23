import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (videoId) {
      // Get tags for a specific video
      const tags = await prisma.videoTagRelation.findMany({
        where: { videoId },
        include: {
          tag: true
        }
      })

      return NextResponse.json({
        success: true,
        data: tags.map(t => t.tag)
      })
    }

    // Get all tags
    const tags = await prisma.videoTag.findMany({
      orderBy: { usageCount: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Check if tag already exists
    const existing = await prisma.videoTag.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      )
    }

    // Create new tag
    const tag = await prisma.videoTag.create({
      data: {
        name,
        description,
        color: color || '#3b82f6' // Default blue color
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
