import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import { createReadStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoIds, format = 'zip', includeMetadata = true } = body

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: 'Video IDs are required' },
        { status: 400 }
      )
    }

    // Get videos from database
    const videos = await prisma.video.findMany({
      where: {
        id: { in: videoIds },
        status: 'COMPLETED'
      }
    })

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'No completed videos found' },
        { status: 404 }
      )
    }

    // Create batch download job
    const batchJob = {
      id: `batch-${Date.now()}`,
      videoCount: videos.length,
      status: 'processing',
      format,
      includeMetadata,
      createdAt: new Date().toISOString(),
      videos: videos.map(v => ({
        id: v.id,
        title: v.title,
        filePath: v.filePath
      }))
    }

    // In production, this would:
    // 1. Create a background job to zip files
    // 2. Use archiver to create the ZIP file
    // 3. Store it temporarily
    // 4. Return a download URL
    // 5. Clean up after download or expiry

    // For now, return the job information
    return NextResponse.json({
      success: true,
      message: 'Batch download job created',
      data: {
        ...batchJob,
        estimatedSize: videos.reduce((sum, v) => sum + (v.fileSize || 0), 0),
        downloadUrl: `/api/videos/batch/download/${batchJob.id}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    })
  } catch (error) {
    console.error('Error creating batch download:', error)
    return NextResponse.json(
      { error: 'Failed to create batch download' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // In production, retrieve job status from database/cache
    return NextResponse.json({
      success: true,
      data: {
        id: jobId,
        status: 'completed',
        message: 'Batch download is ready',
        downloadUrl: `/downloads/${jobId}.zip`
      }
    })
  } catch (error) {
    console.error('Error getting batch download status:', error)
    return NextResponse.json(
      { error: 'Failed to get batch download status' },
      { status: 500 }
    )
  }
}
