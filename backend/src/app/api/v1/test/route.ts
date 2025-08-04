import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Test API working'
  })
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 Test PUT endpoint called')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    return NextResponse.json({
      status: 'success',
      message: 'Test PUT working',
      data: body
    })
  } catch (error) {
    console.error('❌ Test PUT error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Test PUT failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 