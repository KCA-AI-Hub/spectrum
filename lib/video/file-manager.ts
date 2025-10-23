import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export interface FileMetadata {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: Date
}

export class VideoFileManager {
  private static instance: VideoFileManager
  private baseDir: string
  private thumbnailDir: string

  private constructor() {
    // public 폴더 내에 videos 디렉토리 사용
    this.baseDir = path.join(process.cwd(), 'public', 'videos')
    this.thumbnailDir = path.join(this.baseDir, 'thumbnails')
    this.ensureDirectories()
  }

  static getInstance(): VideoFileManager {
    if (!VideoFileManager.instance) {
      VideoFileManager.instance = new VideoFileManager()
    }
    return VideoFileManager.instance
  }

  private async ensureDirectories() {
    try {
      if (!existsSync(this.baseDir)) {
        await fs.mkdir(this.baseDir, { recursive: true })
      }
      if (!existsSync(this.thumbnailDir)) {
        await fs.mkdir(this.thumbnailDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating directories:', error)
    }
  }

  async saveVideo(videoId: string, buffer: Buffer): Promise<FileMetadata> {
    const fileName = `${videoId}.mp4`
    const filePath = path.join(this.baseDir, fileName)
    const publicPath = `/videos/${fileName}`

    await fs.writeFile(filePath, buffer)

    const stats = await fs.stat(filePath)

    return {
      fileName,
      filePath: publicPath,
      fileSize: stats.size,
      mimeType: 'video/mp4',
      createdAt: new Date()
    }
  }

  async saveThumbnail(videoId: string, buffer: Buffer): Promise<FileMetadata> {
    const fileName = `${videoId}.jpg`
    const filePath = path.join(this.thumbnailDir, fileName)
    const publicPath = `/videos/thumbnails/${fileName}`

    await fs.writeFile(filePath, buffer)

    const stats = await fs.stat(filePath)

    return {
      fileName,
      filePath: publicPath,
      fileSize: stats.size,
      mimeType: 'image/jpeg',
      createdAt: new Date()
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const fileName = `${videoId}.mp4`
      const filePath = path.join(this.baseDir, fileName)

      if (existsSync(filePath)) {
        await fs.unlink(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting video:', error)
      return false
    }
  }

  async deleteThumbnail(videoId: string): Promise<boolean> {
    try {
      const fileName = `${videoId}.jpg`
      const filePath = path.join(this.thumbnailDir, fileName)

      if (existsSync(filePath)) {
        await fs.unlink(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting thumbnail:', error)
      return false
    }
  }

  async getVideoPath(videoId: string): Promise<string | null> {
    const fileName = `${videoId}.mp4`
    const filePath = path.join(this.baseDir, fileName)

    if (existsSync(filePath)) {
      return `/videos/${fileName}`
    }
    return null
  }

  async getThumbnailPath(videoId: string): Promise<string | null> {
    const fileName = `${videoId}.jpg`
    const filePath = path.join(this.thumbnailDir, fileName)

    if (existsSync(filePath)) {
      return `/videos/thumbnails/${fileName}`
    }
    return null
  }

  async getFileSize(videoId: string): Promise<number | null> {
    try {
      const fileName = `${videoId}.mp4`
      const filePath = path.join(this.baseDir, fileName)

      if (existsSync(filePath)) {
        const stats = await fs.stat(filePath)
        return stats.size
      }
      return null
    } catch (error) {
      console.error('Error getting file size:', error)
      return null
    }
  }

  async downloadVideoFromUrl(videoUrl: string, videoId: string): Promise<FileMetadata> {
    try {
      const response = await fetch(videoUrl)
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      return await this.saveVideo(videoId, buffer)
    } catch (error) {
      console.error('Error downloading video:', error)
      throw error
    }
  }

  async downloadThumbnailFromUrl(thumbnailUrl: string, videoId: string): Promise<FileMetadata> {
    try {
      const response = await fetch(thumbnailUrl)
      if (!response.ok) {
        throw new Error(`Failed to download thumbnail: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      return await this.saveThumbnail(videoId, buffer)
    } catch (error) {
      console.error('Error downloading thumbnail:', error)
      throw error
    }
  }

  async listVideos(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.baseDir)
      return files.filter(file => file.endsWith('.mp4'))
    } catch (error) {
      console.error('Error listing videos:', error)
      return []
    }
  }

  async getStorageInfo() {
    try {
      const videoFiles = await this.listVideos()
      let totalSize = 0

      for (const file of videoFiles) {
        const filePath = path.join(this.baseDir, file)
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }

      return {
        totalVideos: videoFiles.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        baseDir: this.baseDir,
        thumbnailDir: this.thumbnailDir
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return {
        totalVideos: 0,
        totalSize: 0,
        totalSizeMB: '0',
        baseDir: this.baseDir,
        thumbnailDir: this.thumbnailDir
      }
    }
  }
}

export const videoFileManager = VideoFileManager.getInstance()
