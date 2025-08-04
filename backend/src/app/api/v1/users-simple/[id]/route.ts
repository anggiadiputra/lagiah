import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /users-simple/[id] called')
    const { id } = params
    console.log('User ID:', id)
    
    return NextResponse.json({
      status: 'success',
      data: { 
        user: {
          id: id,
          name: 'Test User',
          email: 'test@example.com'
        }
      }
    })
  } catch (error) {
    console.error('❌ GET error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'GET failed'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PUT /users-simple/[id] called')
    const { id } = params
    console.log('User ID:', id)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'User updated successfully',
        user: {
          id: id,
          name: body.name || 'Updated User',
          email: body.email || 'updated@example.com'
        }
      }
    })
  } catch (error) {
    console.error('❌ PUT error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'PUT failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 