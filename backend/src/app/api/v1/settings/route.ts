import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { errorResponse } from '@/lib/utils'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { z } from 'zod'

// Validation schemas
const getSettingsSchema = z.object({
  category: z.string().optional(),
})

const updateSettingsSchema = z.object({
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
    category: z.string().optional(),
  })),
})

// GET /api/v1/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  try {
    // Manual auth check
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    
    try {
      const user = verifyJwtToken(token)
      
      if (!user) {
        return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
      }
      
      // Only ADMIN can access settings
      if (!['ADMIN'].includes(user.role)) {
        return errorResponse('Forbidden: Only administrators can access settings', 'FORBIDDEN', 403)
      }
      
    } catch (authError) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Validate query params
    const validatedParams = getSettingsSchema.parse({ category: category || undefined })
    
    // Build where clause
    const where = category ? { category } : {}
    
    // Get settings from database
    const settings = await prisma.setting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })
    
    // Transform settings to key-value pairs
    const settingsMap = settings.reduce((acc, setting) => {
      let value: any = setting.value
      
      // Parse value based on type
      switch (setting.type) {
        case 'number':
          value = parseFloat(setting.value)
          break
        case 'boolean':
          value = setting.value === 'true'
          break
        case 'json':
          try {
            value = JSON.parse(setting.value)
          } catch {
            value = setting.value
          }
          break
        default:
          value = setting.value
      }
      
      acc[setting.key] = value
      return acc
    }, {} as Record<string, any>)
    
    return NextResponse.json({
      status: 'success',
      data: {
        settings: settingsMap,
        raw: settings
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error fetching settings
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'FETCH_SETTINGS_ERROR',
          message: 'Failed to fetch settings'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    // Manual auth check
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    
    try {
      const user = verifyJwtToken(token)
      
      if (!user) {
        return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
      }
      
      if (!['ADMIN'].includes(user.role)) {
        return errorResponse('Forbidden: Only administrators can update settings', 'FORBIDDEN', 403)
      }
      
    } catch (authError) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }
    
    const body = await request.json()
    
    // Validate request body
    const validatedBody = updateSettingsSchema.parse(body)
    
    const updatedSettings = []
    
    // Update each setting
    for (const settingData of validatedBody.settings) {
      const setting = await prisma.setting.upsert({
        where: { key: settingData.key },
        update: {
          value: settingData.value,
          type: settingData.type,
          category: settingData.category,
          updatedAt: new Date()
        },
        create: {
          key: settingData.key,
          value: settingData.value,
          type: settingData.type || 'string',
          category: settingData.category || 'general'
        }
      })
      
      updatedSettings.push(setting)
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'Settings updated successfully',
        updatedCount: updatedSettings.length,
        settings: updatedSettings
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error updating settings
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'UPDATE_SETTINGS_ERROR',
          message: 'Failed to update settings'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      },
      { status: 500 }
    )
  }
} 