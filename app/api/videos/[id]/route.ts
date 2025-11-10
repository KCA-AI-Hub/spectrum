import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { videoFileManager } from '@/lib/video/file-manager'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        summary: {
          include: {
            article: true
          }
        },
        article: true,
        processingLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const response = {
      ...video,
      textOverlay: video.textOverlay ? JSON.parse(video.textOverlay) : null,
      backgroundMusic: video.backgroundMusic ? JSON.parse(video.backgroundMusic) : null
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 동영상 존재 확인
    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // 실제 파일 삭제 (동영상 및 썸네일)
    try {
      if (video.filePath) {
        await videoFileManager.deleteVideo(id)
      }
      if (video.thumbnailPath) {
        await videoFileManager.deleteThumbnail(id)
      }
    } catch (fileError) {
      console.error('Error deleting video files:', fileError)
      // 파일 삭제 실패해도 DB 삭제는 진행
    }

    // 데이터베이스에서 삭제 (cascade로 processingLogs도 함께 삭제)
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // 업데이트 가능한 필드
    const {
      title,
      description,
      status,
      views,
      downloads,
      shares
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (views !== undefined) updateData.views = views
    if (downloads !== undefined) updateData.downloads = downloads
    if (shares !== undefined) updateData.shares = shares

    const video = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        summary: true,
        article: true
      }
    })

    return NextResponse.json({
      success: true,
      data: video
    })

  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}
