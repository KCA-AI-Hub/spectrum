import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export type VideoStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type VideoFormat = 'VERTICAL' | 'HORIZONTAL' | 'SQUARE'
export type VideoStyle = 'MODERN' | 'MINIMAL' | 'BOLD' | 'ELEGANT' | 'PLAYFUL'

interface CreateVideoJobOptions {
  summaryId: string
  articleId?: string
  title: string
  description?: string
  prompt: string
  format?: VideoFormat
  style?: VideoStyle
  colorPalette?: string
  resolution?: string
  textOverlay?: object
  backgroundMusic?: object
  duration?: number
  segments?: number
  priority?: number
}

interface UpdateVideoJobOptions {
  status?: VideoStatus
  filePath?: string
  thumbnailPath?: string
  fileSize?: number
  errorMessage?: string
  processingTime?: number
}

export class VideoJobManager {
  private static instance: VideoJobManager
  private processingQueue: Set<string> = new Set()
  private maxConcurrent = 3 // 최대 동시 처리 작업 수

  private constructor() {}

  static getInstance(): VideoJobManager {
    if (!VideoJobManager.instance) {
      VideoJobManager.instance = new VideoJobManager()
    }
    return VideoJobManager.instance
  }

  async createJob(options: CreateVideoJobOptions) {
    const job = await prisma.video.create({
      data: {
        summaryId: options.summaryId,
        articleId: options.articleId,
        title: options.title,
        description: options.description,
        prompt: options.prompt,
        format: options.format || 'VERTICAL',
        style: options.style || 'MODERN',
        colorPalette: options.colorPalette,
        resolution: options.resolution || this.getDefaultResolution(options.format || 'VERTICAL'),
        textOverlay: options.textOverlay ? JSON.stringify(options.textOverlay) : null,
        backgroundMusic: options.backgroundMusic ? JSON.stringify(options.backgroundMusic) : null,
        duration: options.duration || 30,
        segments: options.segments || 1,
        status: 'PENDING'
      },
      include: {
        summary: true,
        article: true
      }
    })

    // 처리 로그 생성
    await this.addProcessingLog(job.id, 'initialization', 'completed', 'Video job created successfully')

    // 자동으로 큐에 추가
    this.processQueue().catch(console.error)

    return job
  }

  async updateJob(jobId: string, updates: UpdateVideoJobOptions) {
    const job = await prisma.video.update({
      where: { id: jobId },
      data: updates
    })

    return job
  }

  async getJob(jobId: string) {
    const job = await prisma.video.findUnique({
      where: { id: jobId },
      include: {
        summary: true,
        article: true,
        processingLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return job
  }

  async getJobsByStatus(status: VideoStatus) {
    const jobs = await prisma.video.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        summary: true,
        article: true
      }
    })

    return jobs
  }

  async cancelJob(jobId: string) {
    const job = await prisma.video.update({
      where: { id: jobId },
      data: { status: 'CANCELLED' }
    })

    await this.addProcessingLog(jobId, 'cancellation', 'completed', 'Job cancelled by user')

    // 큐에서 제거
    this.processingQueue.delete(jobId)

    return job
  }

  async retryJob(jobId: string) {
    const job = await prisma.video.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      throw new Error('Job not found')
    }

    if (job.status !== 'FAILED') {
      throw new Error('Only failed jobs can be retried')
    }

    const updatedJob = await prisma.video.update({
      where: { id: jobId },
      data: {
        status: 'PENDING',
        errorMessage: null
      }
    })

    await this.addProcessingLog(jobId, 'retry', 'started', 'Job retry initiated')

    // 큐에 다시 추가
    this.processQueue().catch(console.error)

    return updatedJob
  }

  async addProcessingLog(
    videoId: string,
    stage: string,
    status: string,
    message?: string,
    duration?: number
  ) {
    await prisma.videoProcessingLog.create({
      data: {
        videoId,
        stage,
        status,
        message,
        duration
      }
    })
  }

  async processQueue() {
    // 현재 처리 중인 작업 수 확인
    if (this.processingQueue.size >= this.maxConcurrent) {
      return
    }

    // PENDING 상태의 작업 가져오기
    const pendingJobs = await prisma.video.findMany({
      where: {
        status: 'PENDING',
        id: {
          notIn: Array.from(this.processingQueue)
        }
      },
      orderBy: { createdAt: 'asc' },
      take: this.maxConcurrent - this.processingQueue.size
    })

    for (const job of pendingJobs) {
      this.processingQueue.add(job.id)
      this.processJob(job.id).catch(console.error)
    }
  }

  private async processJob(jobId: string) {
    const startTime = Date.now()

    try {
      // 상태를 GENERATING으로 변경
      await this.updateJob(jobId, { status: 'GENERATING' })
      await this.addProcessingLog(jobId, 'video_generation', 'started', 'Starting video generation')

      const job = await this.getJob(jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      // TODO: 실제 Text-to-Video API 호출
      // 현재는 시뮬레이션
      await this.simulateVideoGeneration(job)

      const processingTime = Date.now() - startTime

      // 완료 처리
      await this.addProcessingLog(
        jobId,
        'video_generation',
        'completed',
        'Video generation completed successfully',
        processingTime
      )

    } catch (error) {
      const processingTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.updateJob(jobId, {
        status: 'FAILED',
        errorMessage
      })

      await this.addProcessingLog(
        jobId,
        'video_generation',
        'failed',
        errorMessage,
        processingTime
      )
    } finally {
      // 큐에서 제거
      this.processingQueue.delete(jobId)

      // 다음 작업 처리
      this.processQueue().catch(console.error)
    }
  }

  private async simulateVideoGeneration(job: any) {
    // Text-to-Video API 호출 및 동영상 처리 파이프라인
    const { textToVideoClient } = await import('./text-to-video-api')
    const { videoFileManager } = await import('./file-manager')
    const { videoProcessor } = await import('./video-processor')
    const path = await import('path')

    try {
      // 프롬프트 및 옵션 준비
      const options = {
        prompt: job.prompt,
        duration: job.duration || 30,
        format: job.format.toLowerCase() as 'vertical' | 'horizontal' | 'square',
        style: job.style,
        colorPalette: job.colorPalette,
        resolution: job.resolution
      }

      // 동영상 생성
      await this.addProcessingLog(job.id, 'api_call', 'started', 'Calling Text-to-Video API')
      const result = await textToVideoClient.generateVideo(options)
      await this.addProcessingLog(job.id, 'api_call', 'completed', 'Text-to-Video API call completed')

      // 동영상 파일 다운로드 및 저장
      await this.addProcessingLog(job.id, 'file_download', 'started', 'Downloading video file')
      const videoMetadata = await videoFileManager.downloadVideoFromUrl(result.videoUrl, job.id)
      await this.addProcessingLog(job.id, 'file_download', 'completed', 'Video file downloaded')

      const videoFilePath = path.join(process.cwd(), 'public', videoMetadata.filePath)

      // 동영상 품질 검증
      await this.addProcessingLog(job.id, 'validation', 'started', 'Validating video quality')
      const validation = await videoProcessor.validateVideo(videoFilePath)

      if (!validation.isValid) {
        throw new Error(`Video validation failed: ${validation.errors.join(', ')}`)
      }

      if (validation.warnings.length > 0) {
        await this.addProcessingLog(
          job.id,
          'validation',
          'completed',
          `Video validated with warnings: ${validation.warnings.join(', ')}`
        )
      } else {
        await this.addProcessingLog(job.id, 'validation', 'completed', 'Video validated successfully')
      }

      // 동영상 최적화 (필요시)
      let finalVideoPath = videoMetadata.filePath
      const shouldOptimize = validation.warnings.some(w =>
        w.includes('resolution') || w.includes('bitrate') || w.includes('codec')
      )

      if (shouldOptimize) {
        await this.addProcessingLog(job.id, 'optimization', 'started', 'Optimizing video')
        const optimizedPath = path.join(
          process.cwd(),
          'public',
          'videos',
          `${job.id}-optimized.mp4`
        )

        await videoProcessor.optimizeVideo(
          videoFilePath,
          optimizedPath,
          job.format.toLowerCase() as 'vertical' | 'horizontal' | 'square'
        )

        finalVideoPath = `/videos/${job.id}-optimized.mp4`
        await this.addProcessingLog(job.id, 'optimization', 'completed', 'Video optimized successfully')
      }

      // 썸네일 처리
      let thumbnailPath = null

      if (result.thumbnailUrl) {
        // API에서 제공한 썸네일 다운로드
        await this.addProcessingLog(job.id, 'thumbnail_download', 'started', 'Downloading thumbnail')
        const thumbnailMetadata = await videoFileManager.downloadThumbnailFromUrl(result.thumbnailUrl, job.id)
        thumbnailPath = thumbnailMetadata.filePath
        await this.addProcessingLog(job.id, 'thumbnail_download', 'completed', 'Thumbnail downloaded')
      } else {
        // 썸네일 자동 생성
        await this.addProcessingLog(job.id, 'thumbnail_generation', 'started', 'Generating thumbnail')

        const thumbnails = await videoProcessor.generateThumbnails(
          shouldOptimize ? path.join(process.cwd(), 'public', finalVideoPath) : videoFilePath,
          {
            count: 1,
            size: '640x?',
            folder: path.join(process.cwd(), 'public', 'videos', 'thumbnails')
          }
        )

        if (thumbnails.length > 0) {
          // Convert absolute path to public path
          const thumbnailFileName = path.basename(thumbnails[0])
          thumbnailPath = `/videos/thumbnails/${thumbnailFileName}`
          await this.addProcessingLog(job.id, 'thumbnail_generation', 'completed', 'Thumbnail generated successfully')
        }
      }

      // 최종 파일 크기 확인
      const finalFileSize = await videoFileManager.getFileSize(job.id)

      // 작업 완료 업데이트
      await this.updateJob(job.id, {
        status: 'COMPLETED',
        filePath: finalVideoPath,
        thumbnailPath,
        fileSize: finalFileSize || videoMetadata.fileSize
      })

    } catch (error) {
      throw error
    }
  }

  private getDefaultResolution(format: VideoFormat): string {
    const resolutions: Record<VideoFormat, string> = {
      VERTICAL: '1080x1920',
      HORIZONTAL: '1920x1080',
      SQUARE: '1080x1080'
    }
    return resolutions[format] || '1920x1080'
  }

  async getQueueStatus() {
    const [pending, generating, completed, failed] = await Promise.all([
      prisma.video.count({ where: { status: 'PENDING' } }),
      prisma.video.count({ where: { status: 'GENERATING' } }),
      prisma.video.count({ where: { status: 'COMPLETED' } }),
      prisma.video.count({ where: { status: 'FAILED' } })
    ])

    return {
      pending,
      generating,
      completed,
      failed,
      processingNow: this.processingQueue.size,
      maxConcurrent: this.maxConcurrent
    }
  }

  async getRecentJobs(limit = 10) {
    const jobs = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        summary: {
          select: {
            id: true,
            type: true,
            content: true
          }
        },
        article: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            processingLogs: true
          }
        }
      }
    })

    return jobs
  }

  async getStatistics() {
    const [total, byStatus, byFormat, byStyle] = await Promise.all([
      prisma.video.count(),
      prisma.video.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.video.groupBy({
        by: ['format'],
        _count: true
      }),
      prisma.video.groupBy({
        by: ['style'],
        _count: true
      })
    ])

    const totalViews = await prisma.video.aggregate({
      _sum: { views: true },
      _avg: { views: true }
    })

    const totalDownloads = await prisma.video.aggregate({
      _sum: { downloads: true },
      _avg: { downloads: true }
    })

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      byFormat: byFormat.reduce((acc, item) => {
        acc[item.format] = item._count
        return acc
      }, {} as Record<string, number>),
      byStyle: byStyle.reduce((acc, item) => {
        acc[item.style] = item._count
        return acc
      }, {} as Record<string, number>),
      totalViews: totalViews._sum.views || 0,
      averageViews: totalViews._avg.views || 0,
      totalDownloads: totalDownloads._sum.downloads || 0,
      averageDownloads: totalDownloads._avg.downloads || 0
    }
  }
}

export const videoJobManager = VideoJobManager.getInstance()
