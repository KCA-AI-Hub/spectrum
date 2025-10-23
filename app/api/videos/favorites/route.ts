import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const favorites = await prisma.videoFavorite.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, note } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.videoFavorite.findUnique({
      where: { videoId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Video already in favorites' },
        { status: 409 }
      )
    }

    // Add to favorites
    const favorite = await prisma.videoFavorite.create({
      data: {
        videoId,
        note
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      data: favorite
    })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    await prisma.videoFavorite.delete({
      where: { videoId }
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    )
  }
}
