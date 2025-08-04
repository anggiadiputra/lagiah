import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * GET /api/v1/dashboard/activity
 * Get recent activity logs
 */
async function getRecentActivity(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '10')
    const user = getUserFromHeaders(req.headers)
    
    // Build where clause based on user role
    const whereClause = {} // All users can see all activity
    
    // Get total count
    const total = await prisma.activityLog.count({ where: whereClause })
    
    // Get recent activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Format activity logs for frontend
    const formattedLogs = activityLogs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.name,
      action: log.action,
      entityType: log.entity,
      entityName: log.description,
      entityId: log.entityId,
      details: log.description,
      createdAt: log.createdAt.toISOString(),
      ipAddress: log.ipAddress
    }))
    
    return successResponse({
      items: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return errorResponse('Failed to fetch recent activity', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getRecentActivity)
  )
) 