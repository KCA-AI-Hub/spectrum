/**
 * Parallel Video Generation Job Queue
 * Handles concurrent video generation with priority and resource management
 */

export interface VideoJob {
  id: string
  videoId: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  retryCount: number
  maxRetries: number
  data: {
    summaryId: string
    templateId?: string
    config: any
  }
}

export interface JobQueueConfig {
  maxConcurrentJobs?: number
  maxRetries?: number
  retryDelay?: number
  priorityWeights?: {
    high: number
    medium: number
    low: number
  }
}

/**
 * Job Queue Manager for parallel video generation
 */
export class VideoJobQueue {
  private jobs: Map<string, VideoJob> = new Map()
  private activeJobs: Set<string> = new Set()
  private config: Required<JobQueueConfig>
  private isProcessing = false
  private workers: Map<string, Worker | null> = new Map()

  constructor(config: JobQueueConfig = {}) {
    this.config = {
      maxConcurrentJobs: config.maxConcurrentJobs || 3,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 5000,
      priorityWeights: {
        high: 10,
        medium: 5,
        low: 1,
        ...config.priorityWeights
      }
    }
  }

  /**
   * Add job to queue
   */
  addJob(job: Omit<VideoJob, 'status' | 'progress' | 'createdAt' | 'retryCount'>): VideoJob {
    const newJob: VideoJob = {
      ...job,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: job.maxRetries || this.config.maxRetries
    }

    this.jobs.set(job.id, newJob)
    this.processQueue()

    return newJob
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): VideoJob | undefined {
    return this.jobs.get(jobId)
  }

  /**
   * Get all jobs
   */
  getAllJobs(): VideoJob[] {
    return Array.from(this.jobs.values())
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: VideoJob['status']): VideoJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status)
  }

  /**
   * Update job progress
   */
  updateJobProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId)
    if (job) {
      job.progress = Math.min(100, Math.max(0, progress))
      this.jobs.set(jobId, job)
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    // If job is processing, terminate worker
    if (job.status === 'processing' && this.workers.has(jobId)) {
      const worker = this.workers.get(jobId)
      if (worker) {
        worker.terminate()
        this.workers.delete(jobId)
      }
      this.activeJobs.delete(jobId)
    }

    // Remove job from queue
    this.jobs.delete(jobId)

    // Process next job in queue
    this.processQueue()
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job || job.status !== 'failed') return

    job.status = 'pending'
    job.progress = 0
    job.error = undefined
    this.jobs.set(jobId, job)

    this.processQueue()
  }

  /**
   * Process job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.activeJobs.size < this.config.maxConcurrentJobs) {
      const nextJob = this.getNextJob()
      if (!nextJob) break

      this.processJob(nextJob)
    }

    this.isProcessing = false
  }

  /**
   * Get next job based on priority
   */
  private getNextJob(): VideoJob | undefined {
    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => {
        // Sort by priority weight and creation time
        const weightA = this.config.priorityWeights[a.priority]
        const weightB = this.config.priorityWeights[b.priority]

        if (weightA !== weightB) {
          return weightB - weightA // Higher weight first
        }

        return a.createdAt.getTime() - b.createdAt.getTime() // Earlier first
      })

    return pendingJobs[0]
  }

  /**
   * Process individual job
   */
  private async processJob(job: VideoJob): Promise<void> {
    job.status = 'processing'
    job.startedAt = new Date()
    this.activeJobs.add(job.id)
    this.jobs.set(job.id, job)

    try {
      // Call video generation API
      await this.executeVideoGeneration(job)

      // Mark as completed
      job.status = 'completed'
      job.progress = 100
      job.completedAt = new Date()
      this.jobs.set(job.id, job)
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error)

      // Handle retry
      if (job.retryCount < job.maxRetries) {
        job.retryCount++
        job.status = 'pending'
        job.progress = 0
        this.jobs.set(job.id, job)

        // Schedule retry
        setTimeout(() => {
          this.processQueue()
        }, this.config.retryDelay)
      } else {
        // Max retries reached, mark as failed
        job.status = 'failed'
        job.error = error instanceof Error ? error.message : 'Unknown error'
        job.completedAt = new Date()
        this.jobs.set(job.id, job)
      }
    } finally {
      this.activeJobs.delete(job.id)
      this.workers.delete(job.id)

      // Process next job in queue
      this.processQueue()
    }
  }

  /**
   * Execute video generation
   */
  private async executeVideoGeneration(job: VideoJob): Promise<void> {
    // Create generation request
    const response = await fetch('/api/videos/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summaryId: job.data.summaryId,
        templateId: job.data.templateId,
        config: job.data.config
      })
    })

    if (!response.ok) {
      throw new Error(`Video generation failed: ${response.statusText}`)
    }

    const result = await response.json()
    const generatedVideoId = result.videoId

    // Poll for completion
    await this.pollVideoStatus(generatedVideoId, job)
  }

  /**
   * Poll video generation status
   */
  private async pollVideoStatus(videoId: string, job: VideoJob): Promise<void> {
    const pollInterval = 2000 // 2 seconds
    const maxPolls = 300 // 10 minutes max

    for (let i = 0; i < maxPolls; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))

      const response = await fetch(`/api/videos/${videoId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video status')
      }

      const video = await response.json()

      // Update progress
      if (video.progress !== undefined) {
        this.updateJobProgress(job.id, video.progress)
      }

      // Check status
      if (video.status === 'COMPLETED') {
        return // Success
      }

      if (video.status === 'FAILED') {
        throw new Error(video.error || 'Video generation failed')
      }

      if (video.status === 'CANCELLED') {
        throw new Error('Video generation was cancelled')
      }
    }

    throw new Error('Video generation timeout')
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    averageProcessingTime: number
  } {
    const jobs = Array.from(this.jobs.values())

    const completed = jobs.filter(j => j.status === 'completed')
    const totalProcessingTime = completed.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime())
      }
      return sum
    }, 0)

    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: completed.length,
      failed: jobs.filter(j => j.status === 'failed').length,
      averageProcessingTime: completed.length > 0 ? totalProcessingTime / completed.length : 0
    }
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    Array.from(this.jobs.entries()).forEach(([id, job]) => {
      if (job.status === 'completed') {
        this.jobs.delete(id)
      }
    })
  }

  /**
   * Clear all jobs
   */
  clearAll(): void {
    // Cancel all processing jobs
    this.activeJobs.forEach(jobId => {
      const worker = this.workers.get(jobId)
      if (worker) {
        worker.terminate()
      }
    })

    this.jobs.clear()
    this.activeJobs.clear()
    this.workers.clear()
  }
}

// Global queue instance
let globalQueue: VideoJobQueue | null = null

/**
 * Get global job queue instance
 */
export function getVideoJobQueue(): VideoJobQueue {
  if (!globalQueue) {
    globalQueue = new VideoJobQueue({
      maxConcurrentJobs: 3,
      maxRetries: 3,
      retryDelay: 5000
    })
  }
  return globalQueue
}

/**
 * Batch job processor for multiple videos
 */
export class BatchJobProcessor {
  private queue: VideoJobQueue

  constructor(queue: VideoJobQueue) {
    this.queue = queue
  }

  /**
   * Add multiple jobs in batch
   */
  addBatch(
    jobs: Array<Omit<VideoJob, 'status' | 'progress' | 'createdAt' | 'retryCount'>>
  ): VideoJob[] {
    return jobs.map(job => this.queue.addJob(job))
  }

  /**
   * Wait for all jobs in batch to complete
   */
  async waitForBatch(jobIds: string[]): Promise<{
    completed: VideoJob[]
    failed: VideoJob[]
  }> {
    const checkInterval = 1000 // 1 second

    while (true) {
      const jobs = jobIds.map(id => this.queue.getJob(id)).filter(Boolean) as VideoJob[]

      const pending = jobs.filter(j => j.status === 'pending' || j.status === 'processing')

      if (pending.length === 0) {
        // All jobs completed
        return {
          completed: jobs.filter(j => j.status === 'completed'),
          failed: jobs.filter(j => j.status === 'failed')
        }
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }
  }

  /**
   * Get batch progress
   */
  getBatchProgress(jobIds: string[]): {
    totalProgress: number
    completedCount: number
    failedCount: number
    processingCount: number
  } {
    const jobs = jobIds.map(id => this.queue.getJob(id)).filter(Boolean) as VideoJob[]

    const totalProgress = jobs.reduce((sum, job) => sum + job.progress, 0) / jobs.length

    return {
      totalProgress,
      completedCount: jobs.filter(j => j.status === 'completed').length,
      failedCount: jobs.filter(j => j.status === 'failed').length,
      processingCount: jobs.filter(j => j.status === 'processing').length
    }
  }
}
