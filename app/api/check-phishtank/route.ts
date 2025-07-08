import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

interface PhishTankResponse {
  url: string
  in_database: boolean
  phish_id: string
  phish_detail_page: string
  verified: string
  verified_at: string
  valid: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Make the request to PhishTank API from the server side
    const response = await axios.get(`https://phishtankapi.circl.lu/checkurl?url=${encodeURIComponent(url)}`)
    const data = response.data as PhishTankResponse

    return NextResponse.json(data)
  } catch (error) {
    console.error('PhishTank API error:', error)
    return NextResponse.json(
      { error: 'Failed to check URL with PhishTank' },
      { status: 500 }
    )
  }
} 