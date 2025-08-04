import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * GET /api/v1/dashboard/expiring-domains
 * Get domains expiring within specified days
 */
async function getExpiringDomains(req: NextRequest) {
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
    
    // Build where clause based on user role
    const whereClause = {
      // Removed role-based filtering - all users can see all expiring domains
      expiresAt: {
        gte: now,
        lte: futureDate
      }
    }
    
    // Get total count
    const total = await prisma.domain.count({ where: whereClause })
    
    // Get expiring domains
    const domains = await prisma.domain.findMany({
      where: whereClause,
      orderBy: {
        expiresAt: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        registrar: true,
        status: true,
        expiresAt: true,

        hosting: {
          select: {
            id: true,
            name: true,
            provider: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Calculate days until expiry for each domain
    const domainsWithDays = domains.map(domain => {
      const daysUntilExpiry = Math.ceil(
        (new Date(domain.expiresAt!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      return {
        ...domain,
        daysUntilExpiry,
        expiryDate: domain.expiresAt?.toISOString().split('T')[0]
      }
    })
    
    return successResponse({
      items: domainsWithDays,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expiring domains:', error)
    return errorResponse('Failed to fetch expiring domains', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getExpiringDomains)
  )
) 