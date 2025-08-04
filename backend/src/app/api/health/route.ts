import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/database'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test database connection
    const dbConnected = await testDatabaseConnection()
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        type: 'MySQL'
      },
      performance: {
        responseTime: `${responseTime}ms`
      },
      services: {
        api: 'operational',
        database: dbConnected ? 'operational' : 'down'
      }
    }

    const statusCode = dbConnected ? 200 : 503

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
} 