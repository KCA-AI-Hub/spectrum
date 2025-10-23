import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export interface AudioFileMetadata {
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  duration?: number
  createdAt: Date
}

export class AudioFileManager {
  private static instance: AudioFileManager
  private baseDir: string

  private constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'audio')
    this.ensureDirectories()
  }

  static getInstance(): AudioFileManager {
    if (!AudioFileManager.instance) {
      AudioFileManager.instance = new AudioFileManager()
    }
    return AudioFileManager.instance
  }

  private async ensureDirectories() {
    try {
      if (!existsSync(this.baseDir)) {
        await fs.mkdir(this.baseDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating audio directories:', error)
    }
  }

  async saveAudioFile(audioId: string, buffer: Buffer, extension = 'mp3'): Promise<AudioFileMetadata> {
    const fileName = `${audioId}.${extension}`
    const filePath = path.join(this.baseDir, fileName)
    const publicPath = `/audio/${fileName}`

    await fs.writeFile(filePath, buffer)

    const stats = await fs.stat(filePath)

    return {
      fileName,
      filePath: publicPath,
      fileSize: stats.size,
      mimeType: this.getMimeType(extension),
      createdAt: new Date()
    }
  }

  async deleteAudioFile(audioId: string, extension = 'mp3'): Promise<boolean> {
    try {
      const fileName = `${audioId}.${extension}`
      const filePath = path.join(this.baseDir, fileName)

      if (existsSync(filePath)) {
        await fs.unlink(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting audio file:', error)
      return false
    }
  }

  async getAudioFilePath(audioId: string, extension = 'mp3'): Promise<string | null> {
    const fileName = `${audioId}.${extension}`
    const filePath = path.join(this.baseDir, fileName)

    if (existsSync(filePath)) {
      return `/audio/${fileName}`
    }
    return null
  }

  async getFileSize(audioId: string, extension = 'mp3'): Promise<number | null> {
    try {
      const fileName = `${audioId}.${extension}`
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

  async downloadAudioFromUrl(audioUrl: string, audioId: string, extension = 'mp3'): Promise<AudioFileMetadata> {
    try {
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.statusText}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      return await this.saveAudioFile(audioId, buffer, extension)
    } catch (error) {
      console.error('Error downloading audio:', error)
      throw error
    }
  }

  async listAudioFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.baseDir)
      return files.filter(file =>
        file.endsWith('.mp3') ||
        file.endsWith('.wav') ||
        file.endsWith('.ogg') ||
        file.endsWith('.m4a')
      )
    } catch (error) {
      console.error('Error listing audio files:', error)
      return []
    }
  }

  async getStorageInfo() {
    try {
      const audioFiles = await this.listAudioFiles()
      let totalSize = 0

      for (const file of audioFiles) {
        const filePath = path.join(this.baseDir, file)
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }

      return {
        totalAudioFiles: audioFiles.length,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        baseDir: this.baseDir
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return {
        totalAudioFiles: 0,
        totalSize: 0,
        totalSizeMB: '0',
        baseDir: this.baseDir
      }
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac'
    }
    return mimeTypes[extension.toLowerCase()] || 'audio/mpeg'
  }
}

export const audioFileManager = AudioFileManager.getInstance()
