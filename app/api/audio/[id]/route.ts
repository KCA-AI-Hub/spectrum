import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { audioFileManager } from '@/lib/audio/audio-file-manager'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audioTrack = await prisma.audioTrack.findUnique({
      where: { id: params.id }
    })

    if (!audioTrack) {
      return NextResponse.json(
        { error: 'Audio track not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: audioTrack
    })

  } catch (error) {
    console.error('Error fetching audio track:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio track' },
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
    const { name, description, genre, isActive, tags } = body

    const audioTrack = await prisma.audioTrack.update({
      where: { id: params.id },
      data: {
        name,
        description,
        genre,
        isActive,
        tags
      }
    })

    return NextResponse.json({
      success: true,
      data: audioTrack
    })

  } catch (error) {
    console.error('Error updating audio track:', error)
    return NextResponse.json(
      { error: 'Failed to update audio track' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audioTrack = await prisma.audioTrack.findUnique({
      where: { id: params.id }
    })

    if (!audioTrack) {
      return NextResponse.json(
        { error: 'Audio track not found' },
        { status: 404 }
      )
    }

    // Delete audio file from storage
    const extension = audioTrack.filePath.split('.').pop() || 'mp3'
    await audioFileManager.deleteAudioFile(params.id, extension)

    // Delete audio track from database
    await prisma.audioTrack.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Audio track deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting audio track:', error)
    return NextResponse.json(
      { error: 'Failed to delete audio track' },
      { status: 500 }
    )
  }
}
