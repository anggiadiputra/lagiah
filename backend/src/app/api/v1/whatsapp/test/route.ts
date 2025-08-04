import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { errorResponse } from '@/lib/utils'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { WhatsAppService } from '@/lib/services/whatsapp'
import { z } from 'zod'

// Validation schema
const testWhatsAppSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
})

// POST /api/v1/whatsapp/test - Test WhatsApp configuration
export async function POST(request: NextRequest) {
  try {
    // Manual auth check
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    let user: any
    
    try {
      user = verifyJwtToken(token)
      
      if (!user) {
        return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
      }
      
    } catch (authError) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    
    // Validate request body
    const validatedBody = testWhatsAppSchema.parse(body)
    
    // Get WhatsApp settings from database
    const whatsappSettings = await prisma.setting.findMany({
      where: {
        category: 'whatsapp'
      }
    })
    
    if (!whatsappSettings || whatsappSettings.length === 0) {
      return errorResponse('WhatsApp settings not configured', 'WHATSAPP_NOT_CONFIGURED', 400)
    }
    
    // Convert settings to object
    const settingsObj: any = {}
    whatsappSettings.forEach(setting => {
      if (setting.type === 'boolean') {
        settingsObj[setting.key] = setting.value === 'true'
      } else if (setting.type === 'number') {
        settingsObj[setting.key] = parseInt(setting.value)
      } else if (setting.type === 'json') {
        try {
          settingsObj[setting.key] = JSON.parse(setting.value)
        } catch {
          settingsObj[setting.key] = setting.value
        }
      } else {
        settingsObj[setting.key] = setting.value
      }
    })
    
    // Check if WhatsApp is enabled
    if (!settingsObj.whatsapp_enabled) {
      return errorResponse('WhatsApp notifications are disabled', 'WHATSAPP_DISABLED', 400)
    }
    
    // Check if API token is configured
    if (!settingsObj.whatsapp_api_token) {
      return errorResponse('WhatsApp API token not configured', 'WHATSAPP_TOKEN_MISSING', 400)
    }
    
    // Initialize WhatsApp service
    const whatsappService = new WhatsAppService({
      apiToken: settingsObj.whatsapp_api_token,
      apiUrl: settingsObj.whatsapp_api_url || 'https://api.fonnte.com/send',
      defaultCountryCode: settingsObj.whatsapp_country_code || '62',
      defaultDelay: settingsObj.whatsapp_delay || 2,
      defaultSchedule: settingsObj.whatsapp_schedule || 0
    })
    
    // Send test message
    const result = await whatsappService.sendTestMessage(validatedBody.phoneNumber)
    
    if (result.status) {
      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'CREATE',
            entity: 'SETTING',
            entityId: 'whatsapp-test',
            description: `WhatsApp test message sent to +${settingsObj.whatsapp_country_code || '62'}${validatedBody.phoneNumber}`,
            userId: user.id,
            metadata: {
              phoneNumber: validatedBody.phoneNumber,
              result: result.message
            }
          }
        })
      } catch (activityError) {
        console.log('⚠️ Activity logging failed:', activityError)
      }
      
      return NextResponse.json({
        status: 'success',
        data: {
          message: 'Test message sent successfully',
          result: result
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      })
    } else {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'WHATSAPP_TEST_FAILED',
            message: result.message
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error testing WhatsApp:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.issues
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'WHATSAPP_TEST_ERROR',
          message: 'Failed to test WhatsApp configuration'
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