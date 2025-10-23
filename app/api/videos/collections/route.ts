import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const collections = await prisma.videoCollection.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        videos: {
          orderBy: { order: 'asc' },
          take: 5 // Preview first 5 videos
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: collections
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, isPublic, thumbnailId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    const collection = await prisma.videoCollection.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        thumbnailId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Collection created successfully',
      data: collection
    })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
