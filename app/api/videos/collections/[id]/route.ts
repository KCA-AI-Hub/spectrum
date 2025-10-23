import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.videoCollection.findUnique({
      where: { id: params.id },
      include: {
        videos: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: collection
    })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, isPublic, thumbnailId } = body

    const collection = await prisma.videoCollection.update({
      where: { id: params.id },
      data: {
        name,
        description,
        isPublic,
        thumbnailId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Collection updated successfully',
      data: collection
    })
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.videoCollection.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
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
    const { action, videoId, note } = body

    if (action === 'add') {
      // Add video to collection
      if (!videoId) {
        return NextResponse.json(
          { error: 'Video ID is required' },
          { status: 400 }
        )
      }

      // Get current max order
      const maxOrder = await prisma.videoCollectionItem.findFirst({
        where: { collectionId: params.id },
        orderBy: { order: 'desc' },
        select: { order: true }
      })

      await prisma.videoCollectionItem.create({
        data: {
          collectionId: params.id,
          videoId,
          order: (maxOrder?.order || 0) + 1,
          note
        }
      })

      // Update video count
      await prisma.videoCollection.update({
        where: { id: params.id },
        data: {
          videoCount: { increment: 1 }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Video added to collection'
      })
    } else if (action === 'remove') {
      // Remove video from collection
      if (!videoId) {
        return NextResponse.json(
          { error: 'Video ID is required' },
          { status: 400 }
        )
      }

      await prisma.videoCollectionItem.deleteMany({
        where: {
          collectionId: params.id,
          videoId
        }
      })

      // Update video count
      await prisma.videoCollection.update({
        where: { id: params.id },
        data: {
          videoCount: { decrement: 1 }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Video removed from collection'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing collection:', error)
    return NextResponse.json(
      { error: 'Failed to manage collection' },
      { status: 500 }
    )
  }
}
