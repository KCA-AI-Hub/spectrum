// Text-to-Video API 인터페이스 및 클라이언트

export interface VideoGenerationOptions {
  prompt: string
  duration: number // seconds
  format: 'vertical' | 'horizontal' | 'square'
  style?: string
  colorPalette?: string
  resolution?: string
  model?: string // API provider 모델
}

export interface VideoGenerationResult {
  videoUrl: string
  thumbnailUrl?: string
  duration: number
  fileSize?: number
  metadata?: Record<string, any>
}

export interface TextToVideoProvider {
  name: string
  generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult>
  getStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'>
  cancelJob(jobId: string): Promise<boolean>
}

// Mock Text-to-Video Provider (실제 API 연동 전까지 사용)
export class MockTextToVideoProvider implements TextToVideoProvider {
  name = 'Mock Provider'
  private jobs = new Map<string, any>()

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    // 시뮬레이션: 5초 대기
    await new Promise(resolve => setTimeout(resolve, 5000))

    const videoUrl = `/videos/mock-${Date.now()}.mp4`
    const thumbnailUrl = `/videos/thumbnails/mock-${Date.now()}.jpg`

    return {
      videoUrl,
      thumbnailUrl,
      duration: options.duration,
      fileSize: Math.floor(Math.random() * 10000000) + 1000000,
      metadata: {
        prompt: options.prompt,
        format: options.format,
        style: options.style,
        provider: this.name
      }
    }
  }

  async getStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
    const job = this.jobs.get(jobId)
    return job?.status || 'pending'
  }

  async cancelJob(jobId: string): Promise<boolean> {
    this.jobs.delete(jobId)
    return true
  }
}

// RunwayML API Provider (실제 구현 예시)
export class RunwayMLProvider implements TextToVideoProvider {
  name = 'RunwayML'
  private apiKey: string
  private apiUrl = 'https://api.runwayml.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    // TODO: 실제 RunwayML API 호출
    // const response = await fetch(`${this.apiUrl}/gen3/text-to-video`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     text_prompt: options.prompt,
    //     duration: options.duration,
    //     aspect_ratio: this.getAspectRatio(options.format),
    //     model: options.model || 'gen3'
    //   })
    // })
    //
    // const data = await response.json()
    // return {
    //   videoUrl: data.video_url,
    //   thumbnailUrl: data.thumbnail_url,
    //   duration: data.duration,
    //   fileSize: data.file_size,
    //   metadata: data
    // }

    throw new Error('RunwayML API not implemented yet')
  }

  async getStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
    // TODO: 실제 API 상태 확인
    throw new Error('RunwayML API not implemented yet')
  }

  async cancelJob(jobId: string): Promise<boolean> {
    // TODO: 실제 API 작업 취소
    throw new Error('RunwayML API not implemented yet')
  }

  private getAspectRatio(format: string): string {
    const ratios: Record<string, string> = {
      vertical: '9:16',
      horizontal: '16:9',
      square: '1:1'
    }
    return ratios[format] || '16:9'
  }
}

// Pika Labs API Provider (실제 구현 예시)
export class PikaLabsProvider implements TextToVideoProvider {
  name = 'Pika Labs'
  private apiKey: string
  private apiUrl = 'https://api.pika.art/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    // TODO: 실제 Pika Labs API 호출
    throw new Error('Pika Labs API not implemented yet')
  }

  async getStatus(jobId: string): Promise<'pending' | 'processing' | 'completed' | 'failed'> {
    throw new Error('Pika Labs API not implemented yet')
  }

  async cancelJob(jobId: string): Promise<boolean> {
    throw new Error('Pika Labs API not implemented yet')
  }
}

// Text-to-Video API Client (통합 클라이언트)
export class TextToVideoClient {
  private provider: TextToVideoProvider
  private static instance: TextToVideoClient

  private constructor(provider?: TextToVideoProvider) {
    // 기본값으로 Mock Provider 사용
    this.provider = provider || new MockTextToVideoProvider()
  }

  static getInstance(provider?: TextToVideoProvider): TextToVideoClient {
    if (!TextToVideoClient.instance) {
      TextToVideoClient.instance = new TextToVideoClient(provider)
    }
    return TextToVideoClient.instance
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    console.log(`Generating video with ${this.provider.name}...`)
    return this.provider.generateVideo(options)
  }

  async getStatus(jobId: string) {
    return this.provider.getStatus(jobId)
  }

  async cancelJob(jobId: string) {
    return this.provider.cancelJob(jobId)
  }

  setProvider(provider: TextToVideoProvider) {
    this.provider = provider
  }

  getProvider(): TextToVideoProvider {
    return this.provider
  }
}

// 환경변수에서 API 키 가져오기 및 클라이언트 초기화
export function initializeTextToVideoClient(): TextToVideoClient {
  const provider = process.env.TEXT_TO_VIDEO_PROVIDER || 'mock'
  const apiKey = process.env.TEXT_TO_VIDEO_API_KEY

  let providerInstance: TextToVideoProvider

  switch (provider.toLowerCase()) {
    case 'runwayml':
      if (!apiKey) {
        console.warn('TEXT_TO_VIDEO_API_KEY not set, using Mock provider')
        providerInstance = new MockTextToVideoProvider()
      } else {
        providerInstance = new RunwayMLProvider(apiKey)
      }
      break

    case 'pikalabs':
      if (!apiKey) {
        console.warn('TEXT_TO_VIDEO_API_KEY not set, using Mock provider')
        providerInstance = new MockTextToVideoProvider()
      } else {
        providerInstance = new PikaLabsProvider(apiKey)
      }
      break

    case 'mock':
    default:
      providerInstance = new MockTextToVideoProvider()
      break
  }

  return TextToVideoClient.getInstance(providerInstance)
}

// 기본 클라이언트 export
export const textToVideoClient = initializeTextToVideoClient()
