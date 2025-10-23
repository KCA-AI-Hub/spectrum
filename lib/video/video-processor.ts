import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'

export interface VideoMetadata {
  duration: number
  width: number
  height: number
  format: string
  bitrate: number
  fps: number
  codec: string
  audioCodec?: string
  fileSize: number
}

export interface CompressionOptions {
  targetBitrate?: string // e.g., '1000k'
  crf?: number // Constant Rate Factor (0-51, lower = better quality)
  preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  maxSize?: number // Maximum file size in bytes
}

export interface ThumbnailOptions {
  count?: number // Number of thumbnails to generate
  timestamps?: string[] // Specific timestamps (e.g., ['00:00:01', '00:00:05'])
  size?: string // Size (e.g., '320x240' or '50%')
  folder?: string
}

export interface WatermarkOptions {
  imagePath: string
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright' | 'center'
  opacity?: number // 0-1
  scale?: number // Scale factor (e.g., 0.2 = 20% of video width)
}

export interface ConversionOptions {
  format: 'mp4' | 'webm' | 'gif'
  quality?: 'low' | 'medium' | 'high'
  fps?: number
  scale?: string // e.g., '640:-1' or '50%'
}

export class VideoProcessor {
  private static instance: VideoProcessor
  private baseDir: string
  private tempDir: string

  private constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'videos')
    this.tempDir = path.join(process.cwd(), 'temp', 'videos')
    this.ensureDirectories()
  }

  static getInstance(): VideoProcessor {
    if (!VideoProcessor.instance) {
      VideoProcessor.instance = new VideoProcessor()
    }
    return VideoProcessor.instance
  }

  private async ensureDirectories() {
    try {
      if (!existsSync(this.tempDir)) {
        await fs.mkdir(this.tempDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating directories:', error)
    }
  }

  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio')

        if (!videoStream) {
          reject(new Error('No video stream found'))
          return
        }

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || '',
          bitrate: parseInt(metadata.format.bit_rate || '0'),
          fps: this.extractFps(videoStream.r_frame_rate || ''),
          codec: videoStream.codec_name || '',
          audioCodec: audioStream?.codec_name,
          fileSize: parseInt(metadata.format.size || '0')
        })
      })
    })
  }

  private extractFps(frameRate: string): number {
    if (!frameRate) return 0
    const parts = frameRate.split('/')
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1])
    }
    return parseFloat(frameRate)
  }

  async compressVideo(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions = {}
  ): Promise<void> {
    const {
      targetBitrate = '1000k',
      crf = 23,
      preset = 'medium'
    } = options

    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .outputOptions([
          `-c:v libx264`,
          `-crf ${crf}`,
          `-preset ${preset}`,
          `-b:v ${targetBitrate}`,
          `-c:a aac`,
          `-b:a 128k`,
          `-movflags +faststart` // Optimize for streaming
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))

      command.run()
    })
  }

  async generateThumbnails(
    videoPath: string,
    options: ThumbnailOptions = {}
  ): Promise<string[]> {
    const {
      count = 1,
      timestamps,
      size = '320x?',
      folder = path.join(this.baseDir, 'thumbnails')
    } = options

    // Ensure thumbnail folder exists
    if (!existsSync(folder)) {
      await fs.mkdir(folder, { recursive: true })
    }

    const filename = path.basename(videoPath, path.extname(videoPath))
    const thumbnailPaths: string[] = []

    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoPath)

      if (timestamps && timestamps.length > 0) {
        // Generate thumbnails at specific timestamps
        let completed = 0

        timestamps.forEach((timestamp, index) => {
          const outputPath = path.join(folder, `${filename}-${index + 1}.jpg`)

          ffmpeg(videoPath)
            .seekInput(timestamp)
            .frames(1)
            .size(size)
            .output(outputPath)
            .on('end', () => {
              thumbnailPaths.push(outputPath)
              completed++
              if (completed === timestamps.length) {
                resolve(thumbnailPaths)
              }
            })
            .on('error', reject)
            .run()
        })
      } else {
        // Generate thumbnails at regular intervals
        const outputPattern = path.join(folder, `${filename}-%i.jpg`)

        command
          .screenshots({
            count,
            folder,
            filename: `${filename}-%i.jpg`,
            size
          })
          .on('end', () => {
            for (let i = 1; i <= count; i++) {
              thumbnailPaths.push(path.join(folder, `${filename}-${i}.jpg`))
            }
            resolve(thumbnailPaths)
          })
          .on('error', reject)
      }
    })
  }

  async convertFormat(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions
  ): Promise<void> {
    const { format, quality = 'medium', fps, scale } = options

    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)

      // Apply format-specific settings
      switch (format) {
        case 'mp4':
          command.outputOptions([
            '-c:v libx264',
            `-crf ${quality === 'high' ? 18 : quality === 'medium' ? 23 : 28}`,
            '-preset medium',
            '-c:a aac',
            '-b:a 128k',
            '-movflags +faststart'
          ])
          break

        case 'webm':
          command.outputOptions([
            '-c:v libvpx-vp9',
            `-crf ${quality === 'high' ? 15 : quality === 'medium' ? 31 : 45}`,
            '-b:v 0',
            '-c:a libopus',
            '-b:a 128k'
          ])
          break

        case 'gif':
          command.outputOptions([
            '-vf',
            `fps=${fps || 10},scale=${scale || '320:-1'}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`
          ])
          break
      }

      if (scale && format !== 'gif') {
        command.size(scale)
      }

      if (fps && format !== 'gif') {
        command.fps(fps)
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }

  async addWatermark(
    inputPath: string,
    outputPath: string,
    options: WatermarkOptions
  ): Promise<void> {
    const {
      imagePath,
      position = 'bottomright',
      opacity = 0.5,
      scale = 0.2
    } = options

    if (!existsSync(imagePath)) {
      throw new Error(`Watermark image not found: ${imagePath}`)
    }

    return new Promise((resolve, reject) => {
      // Get video dimensions first
      this.getVideoMetadata(inputPath)
        .then(metadata => {
          const videoWidth = metadata.width
          const videoHeight = metadata.height
          const watermarkWidth = Math.floor(videoWidth * scale)

          // Calculate position
          let overlayPosition = ''
          switch (position) {
            case 'topleft':
              overlayPosition = '10:10'
              break
            case 'topright':
              overlayPosition = `main_w-overlay_w-10:10`
              break
            case 'bottomleft':
              overlayPosition = `10:main_h-overlay_h-10`
              break
            case 'bottomright':
              overlayPosition = `main_w-overlay_w-10:main_h-overlay_h-10`
              break
            case 'center':
              overlayPosition = `(main_w-overlay_w)/2:(main_h-overlay_h)/2`
              break
          }

          const filterComplex = `[1:v]scale=${watermarkWidth}:-1,format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${overlayPosition}`

          ffmpeg(inputPath)
            .input(imagePath)
            .complexFilter(filterComplex)
            .outputOptions([
              '-c:v libx264',
              '-preset medium',
              '-c:a copy'
            ])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run()
        })
        .catch(reject)
    })
  }

  async validateVideo(videoPath: string): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    metadata?: VideoMetadata
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check if file exists
      if (!existsSync(videoPath)) {
        errors.push('Video file does not exist')
        return { isValid: false, errors, warnings }
      }

      // Get metadata
      const metadata = await this.getVideoMetadata(videoPath)

      // Validate duration
      if (metadata.duration === 0) {
        errors.push('Video has zero duration')
      } else if (metadata.duration < 1) {
        warnings.push('Video is very short (< 1 second)')
      }

      // Validate dimensions
      if (metadata.width === 0 || metadata.height === 0) {
        errors.push('Invalid video dimensions')
      } else if (metadata.width < 640 || metadata.height < 360) {
        warnings.push('Video resolution is low (< 640x360)')
      }

      // Validate bitrate
      if (metadata.bitrate === 0) {
        warnings.push('Could not determine video bitrate')
      } else if (metadata.bitrate < 500000) {
        warnings.push('Video bitrate is very low (< 500kbps)')
      }

      // Validate codec
      const supportedCodecs = ['h264', 'vp8', 'vp9', 'av1']
      if (!supportedCodecs.includes(metadata.codec)) {
        warnings.push(`Video codec '${metadata.codec}' may not be widely supported`)
      }

      // Validate file size
      const maxFileSize = 100 * 1024 * 1024 // 100MB
      if (metadata.fileSize > maxFileSize) {
        warnings.push(`Video file is large (${(metadata.fileSize / 1024 / 1024).toFixed(2)}MB)`)
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error during validation')
      return { isValid: false, errors, warnings }
    }
  }

  async optimizeVideo(
    inputPath: string,
    outputPath: string,
    targetFormat: 'vertical' | 'horizontal' | 'square' = 'vertical'
  ): Promise<void> {
    const resolutions = {
      vertical: '1080:1920',
      horizontal: '1920:1080',
      square: '1080:1080'
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-crf 23',
          '-preset medium',
          `-vf scale=${resolutions[targetFormat]}:force_original_aspect_ratio=decrease,pad=${resolutions[targetFormat]}:(ow-iw)/2:(oh-ih)/2`,
          '-c:a aac',
          '-b:a 128k',
          '-ar 44100',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }
}

export const videoProcessor = VideoProcessor.getInstance()
