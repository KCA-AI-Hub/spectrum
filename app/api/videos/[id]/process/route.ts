import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { videoProcessor } from '@/lib/video/video-processor'
import { videoFileManager } from '@/lib/video/file-manager'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const {
      operation, // 'compress', 'optimize', 'convert', 'watermark'
      options
    } = body

    if (!operation) {
      return NextResponse.json(
        { error: 'operation is required' },
        { status: 400 }
      )
    }

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

    if (!video.filePath) {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      )
    }

    const inputPath = path.join(process.cwd(), 'public', video.filePath)
    const outputPath = path.join(
      process.cwd(),
      'public',
      'videos',
      `${id}-processed-${Date.now()}.mp4`
    )

    let result: any = {}

    switch (operation) {
      case 'compress':
        await videoProcessor.compressVideo(inputPath, outputPath, options)
        result.message = 'Video compressed successfully'
        break

      case 'optimize':
        await videoProcessor.optimizeVideo(
          inputPath,
          outputPath,
          options?.format || 'vertical'
        )
        result.message = 'Video optimized successfully'
        break

      case 'convert':
        if (!options?.format) {
          return NextResponse.json(
            { error: 'format is required for conversion' },
            { status: 400 }
          )
        }

        const convertOutputPath = path.join(
          process.cwd(),
          'public',
          'videos',
          `${id}-converted-${Date.now()}.${options.format}`
        )

        await videoProcessor.convertFormat(inputPath, convertOutputPath, options)
        result.message = `Video converted to ${options.format} successfully`
        result.outputPath = `/videos/${path.basename(convertOutputPath)}`
        break

      case 'watermark':
        if (!options?.imagePath) {
          return NextResponse.json(
            { error: 'imagePath is required for watermark' },
            { status: 400 }
          )
        }

        await videoProcessor.addWatermark(inputPath, outputPath, options)
        result.message = 'Watermark added successfully'
        break

      case 'thumbnail':
        const thumbnails = await videoProcessor.generateThumbnails(inputPath, options)
        result.message = 'Thumbnails generated successfully'
        result.thumbnails = thumbnails.map(t => `/videos/thumbnails/${path.basename(t)}`)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    // Update video metadata if output file was created
    if (operation !== 'thumbnail' && result.outputPath) {
      const fileSize = await videoFileManager.getFileSize(id)
      await prisma.video.update({
        where: { id },
        data: {
          filePath: result.outputPath,
          fileSize: fileSize || video.fileSize
        }
      })
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error processing video:', error)
    return NextResponse.json(
      {
        error: 'Failed to process video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
