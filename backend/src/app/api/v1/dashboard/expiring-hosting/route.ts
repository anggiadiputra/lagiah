import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * GET /api/v1/dashboard/expiring-hosting
 * Get hosting accounts expiring within specified days
 */
async function getExpiringHosting(req: NextRequest) {
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
    const total = await prisma.hosting.count({ where: whereClause })
    
    // Get expiring hosting accounts
    const hosting = await prisma.hosting.findMany({
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

        planName: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Calculate days until expiry for each hosting account
    const hostingWithDays = hosting.map(account => {
      const daysUntilExpiry = Math.ceil(
        (new Date(account.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return {
        ...account,
        daysUntilExpiry,
        expiryDate: account.expiresAt?.toISOString().split('T')[0]
      }
    })
    
    return successResponse({
      items: hostingWithDays,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expiring hosting:', error)
    return errorResponse('Failed to fetch expiring hosting', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getExpiringHosting)
  )
) 