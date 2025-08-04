import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * GET /api/v1/dashboard/stats
 * Get dashboard statistics
 */
async function getDashboardStats(req: NextRequest) {
  try {
    const user = getUserFromHeaders(req.headers)
    
    // Build where clause based on user role
    const whereClause = {} // All users can see all stats
    
    // Auto-update expired status for admin and staff
    if (user.role === 'ADMIN' || user.role === 'STAFF') {
      try {
        const today = new Date()
        
        // Update expired domains
        await prisma.domain.updateMany({
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
        await prisma.hosting.updateMany({
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
        await prisma.vPS.updateMany({
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
        
        await prisma.hosting.updateMany({
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
      } catch (error) {
        // Continue with stats calculation even if auto-update fails
      }
    }
    
    // Get domain stats
    const domainStats = await prisma.domain.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })
    
    // Get hosting stats
    const hostingStats = await prisma.hosting.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })
    
    // Get VPS stats
    const vpsStats = await prisma.vPS.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })
    
    // Get website stats
    const websiteStats = await prisma.website.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    })
    
    // Get user stats (all users can see)
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    })
    const userStats = { total: totalUsers, active: activeUsers }
    
    // Calculate expiring domains (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const expiringDomains = await prisma.domain.count({
      where: {
        ...whereClause,
        expiresAt: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }
    })
    
    // Calculate expiring hosting (within 30 days)
    const expiringHosting = await prisma.hosting.count({
      where: {
        ...whereClause,
        expiresAt: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }
    })
    
    // Calculate expiring VPS (within 30 days)
    const expiringVPS = await prisma.vPS.count({
      where: {
        ...whereClause,
        expiresAt: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        }
      }
    })
    
    // Process stats
    const processStats = (stats: any[], entityType: string) => {
      const result: any = { total: 0, active: 0, expiring: 0, expired: 0 }
      
      stats.forEach(stat => {
        result.total += stat._count.status
        if (stat.status === 'ACTIVE') {
          result.active += stat._count.status
        } else if (stat.status === 'EXPIRED') {
          result.expired += stat._count.status
        }
      })
      
      // Add expiring and expired count based on entity type
      if (entityType === 'domains') {
        result.expiring = expiringDomains
        result.expired = expiredDomains
      } else if (entityType === 'hosting') {
        result.expiring = expiringHosting
        result.expired = expiredHosting
      } else if (entityType === 'vps') {
        result.expiring = expiringVPS
        result.expired = expiredVPS
      }
      
      return result
    }

    // Calculate expired domains (expiresAt < today)
    const expiredDomains = await prisma.domain.count({
      where: {
        ...whereClause,
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // Calculate expired hosting (expiresAt < today)
    const expiredHosting = await prisma.hosting.count({
      where: {
        ...whereClause,
        expiresAt: {
          lt: new Date()
        }
      }
    })

    // Calculate expired VPS (expiresAt < today)
    const expiredVPS = await prisma.vPS.count({
      where: {
        ...whereClause,
        expiresAt: {
          lt: new Date()
        }
      }
    })
    
    const stats = {
      domains: processStats(domainStats, 'domains'),
      hosting: processStats(hostingStats, 'hosting'),
      vps: processStats(vpsStats, 'vps'),
      websites: {
        total: websiteStats.reduce((sum, stat) => sum + stat._count.status, 0),
        active: websiteStats.find(s => s.status === 'ACTIVE')?._count.status || 0,
        inactive: websiteStats.find(s => s.status === 'INACTIVE')?._count.status || 0
      },
      users: userStats
    }
    
    return successResponse(stats)
  } catch (error) {
    return errorResponse('Failed to fetch dashboard statistics', 'INTERNAL_ERROR', 500)
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getDashboardStats)
  )
) 