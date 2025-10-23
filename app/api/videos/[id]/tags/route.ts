import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { tagId, tagName } = body

    let tag

    if (tagId) {
      // Use existing tag
      tag = await prisma.videoTag.findUnique({
        where: { id: tagId }
      })
    } else if (tagName) {
      // Find or create tag by name
      tag = await prisma.videoTag.findUnique({
        where: { name: tagName }
      })

      if (!tag) {
        tag = await prisma.videoTag.create({
          data: {
            name: tagName,
            color: '#3b82f6'
          }
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Tag ID or name is required' },
        { status: 400 }
      )
    }

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if relation already exists
    const existing = await prisma.videoTagRelation.findUnique({
      where: {
        videoId_tagId: {
          videoId: params.id,
          tagId: tag.id
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tag already added to this video' },
        { status: 409 }
      )
    }

    // Create relation
    await prisma.videoTagRelation.create({
      data: {
        videoId: params.id,
        tagId: tag.id
      }
    })

    // Increment usage count
    await prisma.videoTag.update({
      where: { id: tag.id },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tag added successfully',
      data: tag
    })
  } catch (error) {
    console.error('Error adding tag:', error)
    return NextResponse.json(
      { error: 'Failed to add tag' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const tagId = searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      )
    }

    // Delete relation
    await prisma.videoTagRelation.deleteMany({
      where: {
        videoId: params.id,
        tagId
      }
    })

    // Decrement usage count
    await prisma.videoTag.update({
      where: { id: tagId },
      data: {
        usageCount: { decrement: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tag removed successfully'
    })
  } catch (error) {
    console.error('Error removing tag:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag' },
      { status: 500 }
    )
  }
}
