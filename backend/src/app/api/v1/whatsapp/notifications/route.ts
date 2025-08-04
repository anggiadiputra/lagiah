import { NextRequest, NextResponse } from 'next/server'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { whatsappNotificationService } from '@/services/whatsapp-notifications'
import { errorResponse } from '@/lib/utils'

// POST /api/v1/whatsapp/notifications - Manually trigger notifications
export async function POST(request: NextRequest) {
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
      
      if (!['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'].includes(user.role)) {
        return errorResponse('Forbidden', 'FORBIDDEN', 403)
      }
      
    } catch (authError) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }

    // Trigger all notifications
    await whatsappNotificationService.checkAllNotifications()

    return NextResponse.json({
      status: 'success',
      data: {
        message: 'WhatsApp notifications triggered successfully',
        timestamp: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })

  } catch (error) {
    console.error('Error triggering WhatsApp notifications:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'NOTIFICATION_ERROR',
          message: 'Failed to trigger WhatsApp notifications'
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

// GET /api/v1/whatsapp/notifications - Get notification status
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
      
      if (!['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'].includes(user.role)) {
        return errorResponse('Forbidden', 'FORBIDDEN', 403)
      }
      
    } catch (authError) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }

    // Get WhatsApp settings to check if notifications are enabled
    const settings = await whatsappNotificationService['getWhatsAppSettings']()

    return NextResponse.json({
      status: 'success',
      data: {
        notificationsEnabled: settings?.enabled || false,
        recipientPhoneNumber: settings?.recipientPhoneNumber || '',
        alertDaysBeforeExpiry: settings?.alertDaysBeforeExpiry || 7,
        notificationTypes: settings?.notifications || {},
        lastCheck: new Date().toISOString()
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })

  } catch (error) {
    console.error('Error getting notification status:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'STATUS_ERROR',
          message: 'Failed to get notification status'
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