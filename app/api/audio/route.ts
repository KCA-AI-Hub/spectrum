import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { audioFileManager } from '@/lib/audio/audio-file-manager'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const genre = searchParams.get('genre')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (genre) {
      where.genre = genre
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const audioTracks = await prisma.audioTrack.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: audioTracks
    })

  } catch (error) {
    console.error('Error fetching audio tracks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio tracks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const genre = formData.get('genre') as string | null
    const tags = formData.get('tags') as string | null

    if (!file || !name) {
      return NextResponse.json(
        { error: 'file and name are required' },
        { status: 400 }
      )
    }

    // Create audio track record in database
    const audioTrack = await prisma.audioTrack.create({
      data: {
        name,
        description: description || null,
        genre: genre || 'General',
        filePath: '', // Will be updated after file save
        tags: tags || null
      }
    })

    // Save audio file
    const buffer = Buffer.from(await file.arrayBuffer())
    const extension = file.name.split('.').pop() || 'mp3'
    const fileMetadata = await audioFileManager.saveAudioFile(audioTrack.id, buffer, extension)

    // Update audio track with file info
    const updatedAudioTrack = await prisma.audioTrack.update({
      where: { id: audioTrack.id },
      data: {
        filePath: fileMetadata.filePath,
        fileSize: fileMetadata.fileSize
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedAudioTrack
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating audio track:', error)
    return NextResponse.json(
      { error: 'Failed to create audio track' },
      { status: 500 }
    )
  }
}
