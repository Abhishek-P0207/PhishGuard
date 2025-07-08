import { NextRequest, NextResponse } from 'next/server'
import { DetectionService } from '@/services/detection-service'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const detectionService = new DetectionService()
    
    // Create a stage update callback that logs progress
    const onStageUpdate = (stage: number) => {
      console.log(`Analysis stage: ${stage}`)
    }

    const results = await detectionService.analyzeURL(url, onStageUpdate)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
} 