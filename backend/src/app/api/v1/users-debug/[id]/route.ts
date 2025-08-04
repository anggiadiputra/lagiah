import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PUT /users-debug/[id] - Starting update process')
    
    const { id } = params
    const userId = id
    console.log('User ID:', userId)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    // Test import Prisma with correct path
    console.log('🔍 Testing Prisma import...')
    try {
      const { PrismaClient } = await import('@prisma/client')
      console.log('✅ PrismaClient imported successfully')
      
      const prisma = new PrismaClient()
      console.log('✅ PrismaClient instantiated successfully')
      
      // Test database connection
      const userCount = await prisma.user.count()
      console.log('✅ Database connection test successful, user count:', userCount)
      
      await prisma.$disconnect()
      console.log('✅ Prisma disconnected successfully')
      
    } catch (prismaError) {
      console.error('❌ Prisma error:', prismaError)
      return NextResponse.json({
        status: 'error',
        error: {
          code: 'PRISMA_ERROR',
          message: 'Database connection failed',
          details: prismaError instanceof Error ? prismaError.message : 'Unknown error'
        }
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Debug test successful',
        user: {
          id: userId,
          name: body.name || 'Debug User'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error)
    return NextResponse.json({
      status: 'error',
      error: {
        code: 'DEBUG_ERROR',
        message: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
} 