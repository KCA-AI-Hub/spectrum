import { NextRequest, NextResponse } from 'next/server'
import { videoJobManager } from '@/lib/video/job-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json(
        { error: 'action is required (cancel, retry)' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'cancel':
        result = await videoJobManager.cancelJob(id)
        return NextResponse.json({
          success: true,
          message: 'Video generation cancelled',
          data: result
        })

      case 'retry':
        result = await videoJobManager.retryJob(id)
        return NextResponse.json({
          success: true,
          message: 'Video generation retried',
          data: result
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "cancel" or "retry"' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error managing video job:', error)
    return NextResponse.json(
      {
        error: 'Failed to manage video job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
