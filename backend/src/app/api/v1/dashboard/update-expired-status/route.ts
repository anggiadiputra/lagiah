import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * POST /api/v1/dashboard/update-expired-status
 * Update status of expired domains, hosting, and VPS
 */
async function updateExpiredStatus(req: NextRequest) {
  try {
    const today = new Date()
    
    // Update expired domains
    const expiredDomains = await prisma.domain.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expired hosting
    const expiredHosting = await prisma.hosting.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expired VPS
    const expiredVPS = await prisma.vPS.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expiring soon hosting (within 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const expiringSoonHosting = await prisma.hosting.updateMany({
      where: {
        expiresAt: {
          lte: sevenDaysFromNow,
          gt: today
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'EXPIRING_SOON',
        updatedAt: new Date()
      }
    })

    const result = {
      domains: {
        updated: expiredDomains.count
      },
      hosting: {
        expired: expiredHosting.count,
        expiringSoon: expiringSoonHosting.count
      },
      vps: {
        updated: expiredVPS.count
      }
    }

    console.log(`[UpdateExpiredStatus] Updated ${expiredDomains.count} domains, ${expiredHosting.count} hosting, ${expiredVPS.count} VPS to EXPIRED status`)
    
    return successResponse(result)
  } catch (error) {
    console.error('Error updating expired status:', error)
    return errorResponse('Failed to update expired status', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF'], updateExpiredStatus)
  )
) 