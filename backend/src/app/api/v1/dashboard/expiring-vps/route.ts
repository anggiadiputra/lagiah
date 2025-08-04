import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * GET /api/v1/dashboard/expiring-vps
 * Get VPS servers expiring within specified days
 */
async function getExpiringVPS(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '10')
    const days = Number(url.searchParams.get('days') || '30')
    const user = getUserFromHeaders(req.headers)
    
    // Calculate date range
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)
    
    // Build where clause
    const whereClause = {
      expiresAt: {
        gte: now,
        lte: futureDate
      }
    }
    
    // Get total count
    const total = await prisma.vPS.count({ where: whereClause })
    
    // Get expiring VPS servers
    const vps = await prisma.vPS.findMany({
      where: whereClause,
      orderBy: {
        expiresAt: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        provider: true,
        status: true,
        expiresAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Calculate days until expiry for each VPS server
    const vpsWithDays = vps.map(server => {
      const daysUntilExpiry = Math.ceil(
        (new Date(server.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return {
        ...server,
        daysUntilExpiry,
        expiryDate: server.expiresAt?.toISOString().split('T')[0]
      }
    })
    
    return successResponse({
      items: vpsWithDays,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expiring VPS:', error)
    return errorResponse('Failed to fetch expiring VPS', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getExpiringVPS)
  )
) 