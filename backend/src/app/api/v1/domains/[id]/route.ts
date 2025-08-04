import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { updateDomainSchema, idSchema } from '@/lib/validation/schemas'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/v1/domains/[id]
 * Get a specific domain by ID
 */
async function getDomain(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid domain ID', 'VALIDATION_ERROR', 400)
  }

  // Get user from headers
  const user = getUserFromHeaders(req.headers)

  // Build query based on user role
  const where = {
    id,
    ...(user.role !== 'ADMIN' && { createdBy: user.id }),
  }

  // Get domain with related data
  const domain = await prisma.domain.findFirst({
    where,
    include: {
      hosting: {
        select: {
          id: true,
          name: true,
          provider: true,
          status: true,
        },
      },
      websites: {
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!domain) {
    return errorResponse('Domain not found', 'DOMAIN_NOT_FOUND', 404)
  }

  // Log activity for viewing domain
  await logActivity({
    userId: user.id,
    action: 'READ',
    entity: 'DOMAIN',
    entityId: domain.id,
    description: `Viewed domain: ${domain.name}`,
    metadata: {
      domainName: domain.name,
      domainId: domain.id
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req),
    domainId: domain.id
  })

  return successResponse(domain)
}

/**
 * PUT /api/v1/domains/[id]
 * Update a specific domain
 */
async function updateDomain(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid domain ID', 'VALIDATION_ERROR', 400)
  }

  const body = await req.json()
  
  // Validate request body
  const result = updateDomainSchema.safeParse(body)
  if (!result.success) {
    return errorResponse('Invalid domain data', 'VALIDATION_ERROR', 400, result.error.issues)
  }

  // Get user from headers
  const user = getUserFromHeaders(req.headers)

  // Check if domain exists and user has permission
      const existingDomain = await prisma.domain.findFirst({
      where: {
        id,
        // Removed role-based filtering - all users can access all domains
      },
    })

  if (!existingDomain) {
    return errorResponse('Domain not found', 'DOMAIN_NOT_FOUND', 404)
  }

  // If domain is being assigned to hosting or VPS, check if it should be main domain
  if (result.data.hostingId || result.data.vpsId) {
    // ✅ IMPROVED: Check if this is the first domain being assigned to this entity
    // Count domains that are already assigned to this entity (excluding current domain)
    const existingDomainsCount = await prisma.domain.count({
      where: {
        OR: [
          { hostingId: result.data.hostingId },
          { vpsId: result.data.vpsId }
        ],
        id: { not: id } // Exclude current domain
      }
    })

    // Domain assignment logic

    // ✅ IMPROVED: If this is the first domain, make it main domain
    if (existingDomainsCount === 0) {
      result.data.isMainDomain = true
      // Setting domain as main domain
    } else {
      // ✅ IMPROVED: If not the first domain, ensure it's not main domain
      result.data.isMainDomain = false
      // Setting domain as addon domain
    }
    
    // Ensure domain is only assigned to one entity (either hosting or VPS)
    if (result.data.hostingId) {
      result.data.vpsId = null
    } else if (result.data.vpsId) {
      result.data.hostingId = null
    }
  }

  // If setting this domain as main domain, ensure no other domain is main domain for the same entity
  if (result.data.isMainDomain === true) {
    // Check if this domain is being assigned to hosting
    if (result.data.hostingId) {
      // Remove main domain status from other domains in the same hosting
      await prisma.domain.updateMany({
        where: {
          hostingId: result.data.hostingId,
          id: { not: id }, // Exclude current domain
          isMainDomain: true
        },
        data: {
          isMainDomain: false
        }
      })
    }
    
    // Check if this domain is being assigned to VPS
    if (result.data.vpsId) {
      // Remove main domain status from other domains in the same VPS
      await prisma.domain.updateMany({
        where: {
          vpsId: result.data.vpsId,
          id: { not: id }, // Exclude current domain
          isMainDomain: true
        },
        data: {
          isMainDomain: false
        }
      })
    }
  }

  // Update domain
  const domain = await prisma.domain.update({
    where: { id },
    data: {
      ...result.data,
      updatedAt: new Date(),
    },
    include: {
      hosting: {
        select: {
          id: true,
          name: true,
          provider: true,
        },
      },
    },
  })

  // Log activity
  await logActivity({
    userId: user.id,
    action: 'UPDATE',
    entity: 'DOMAIN',
    entityId: domain.id,
    description: `Updated domain: ${domain.name}`,
    metadata: {
      domainName: domain.name,
      changes: result.data,
      previousData: existingDomain
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req),
    domainId: domain.id
  })

  return successResponse(domain)
}

/**
 * DELETE /api/v1/domains/[id]
 * Delete a domain
 */
async function deleteDomain(req: NextRequest, { params }: RouteContext) {
  const { id } = await params
      // Attempting to delete domain

  try {
    // We must check if the domain exists before deleting to provide a good error message.
    const existingDomain = await prisma.domain.findUnique({ where: { id } })
    if (!existingDomain) {
      return errorResponse('Domain not found', 'NOT_FOUND', 404)
    }
    
    // Get user from headers for activity logging
    const user = getUserFromHeaders(req.headers)
    
    await prisma.domain.delete({ where: { id } })
    
    // Log activity
    await logActivity({
      userId: user.id,
      action: 'DELETE',
      entity: 'DOMAIN',
      entityId: id,
      description: `Deleted domain: ${existingDomain.name}`,
      metadata: {
        domainName: existingDomain.name,
        domainId: id
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    })
    
    // Successfully deleted domain
    return successResponse({
      message: `Domain ${existingDomain.name} deleted successfully`,
      deletedId: id,
    })
  } catch (error: any) {
    console.error(`[DeleteDomain] Error deleting domain ${id}:`, error)
    if (error.code === 'P2025') { // Record to delete does not exist
      return errorResponse('Domain not found', 'NOT_FOUND', 404)
    }
    return errorResponse('An internal server error occurred', 'INTERNAL_SERVER_ERROR', 500)
  }
}

// Export handlers with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getDomain)
  )
)

export const PUT = withApiMiddleware(
  withMethods(['PUT'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], updateDomain)
  )
)

export const DELETE = withApiMiddleware(
  withMethods(['DELETE'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], deleteDomain)
  )
) 