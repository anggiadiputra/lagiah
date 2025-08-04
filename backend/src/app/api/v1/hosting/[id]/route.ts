import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, cleanupExpiredHostingAssignments, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { updateHostingSchema, idSchema } from '@/lib/validation/schemas'
import { encrypt, decrypt } from '@/lib/crypto'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/v1/hosting/[id]
 * Get a specific hosting account by ID
 */
async function getHosting(req: NextRequest, { params }: RouteParams) {
  // Await params for Next.js 15 compatibility
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid hosting ID', 'VALIDATION_ERROR', 400)
  }

  // Get user from headers
  const user = getUserFromHeaders(req.headers)

  // Build query based on user role
  const where = {
    id,
    ...(user.role !== 'ADMIN' && { createdBy: user.id }),
  }

  // Get hosting with related data
  const hosting = await prisma.hosting.findFirst({
    where,
    include: {
      domains: {
        select: {
          id: true,
          name: true,
          status: true,
          expiresAt: true,
          isMainDomain: true,
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

  if (!hosting) {
    return errorResponse('Hosting account not found', 'HOSTING_NOT_FOUND', 404)
  }

  // Decrypt sensitive data for display (mask password)
  const hostingData = {
    ...hosting,
    password: hosting.password ? '***masked***' : null,
  }

  return successResponse(hostingData)
}

/**
 * PUT /api/v1/hosting/[id]
 * Update a specific hosting account
 */
async function updateHosting(req: NextRequest, { params }: RouteParams) {
  // Clean up expired hosting assignments first
  await cleanupExpiredHostingAssignments();
  
  // Await params for Next.js 15 compatibility
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid hosting ID', 'VALIDATION_ERROR', 400)
  }

  let body;
  try {
    body = await req.json();
    // Received hosting update request
  } catch (error) {
          // Error parsing request body
    return errorResponse('Invalid JSON in request body', 'INVALID_REQUEST', 400);
  }
  
  if (!body || typeof body !== 'object') {
    return errorResponse('Request body is empty or invalid', 'INVALID_REQUEST', 400);
  }
  
  // Validate request body
  const result = updateHostingSchema.safeParse(body)
  if (!result.success) {
    return errorResponse('Invalid hosting data', 'VALIDATION_ERROR', 400, result.error.issues)
  }

  // Get user from headers
  const user = getUserFromHeaders(req.headers)

  // Check if hosting exists and user has permission
  const existingHosting = await prisma.hosting.findFirst({
    where: {
      id,
      ...(user.role !== 'ADMIN' && { createdBy: user.id }),
    },
    include: {
      domains: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!existingHosting) {
    return errorResponse('Hosting account not found', 'HOSTING_NOT_FOUND', 404)
  }

  try {
    // Remove domainIds from the data to be updated
    const { domainIds, ...hostingDataForUpdate } = result.data;
    
    // Auto-set status based on expiry date if not provided
    if (hostingDataForUpdate.expiresAt) {
      const expiryDate = new Date(hostingDataForUpdate.expiresAt)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        hostingDataForUpdate.status = 'EXPIRED'
      } else {
        // Keep hosting as ACTIVE even if expiring soon
        // SUSPENDED status should be set manually when actually suspended by provider
        hostingDataForUpdate.status = 'ACTIVE'
      }
    } else if (!hostingDataForUpdate.status) {
      hostingDataForUpdate.status = 'ACTIVE' // Default status if no expiry date
    }
    
    // Update hosting account
    const hosting = await prisma.hosting.update({
      where: { id },
      data: {
        ...hostingDataForUpdate,
        updatedAt: new Date(),
      } as any,
      include: {
        domains: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
    
    // Handle domain assignments if provided
    if (domainIds) {
      // First, remove all current domain assignments for this hosting
      await prisma.domain.updateMany({
        where: { hostingId: id },
        data: { 
          hostingId: null,
          vpsId: null,
          isMainDomain: false,
          domainHosting: null,
        },
      })
      
      // Check if any of the new domains are already assigned to other hosting or VPS
      const domains = await prisma.domain.findMany({
        where: {
          id: { in: domainIds }
        },
        include: {
          hosting: {
            select: {
              id: true,
              name: true,
              provider: true
            }
          },
          vps: {
            select: {
              id: true,
              name: true,
              provider: true
            }
          }
        }
      });
      
      // Check if any domains are already assigned to other hosting accounts or VPS
      const assignedDomains = domains.filter(domain => 
        (domain.hosting !== null && domain.hosting.id !== id) || domain.vps !== null
      );
      
      // Also check if any domains have hostingId or vpsId in the database (excluding current hosting)
      const domainsWithAssignments = await prisma.domain.findMany({
        where: {
          id: { in: domainIds },
          OR: [
            { hostingId: { not: null } },
            { vpsId: { not: null } }
          ],
          NOT: {
            hostingId: id
          }
        },
        select: {
          id: true,
          name: true,
          hostingId: true,
          vpsId: true
        }
      });
      
      if (domainsWithAssignments.length > 0) {
        const domainNames = domainsWithAssignments.map(d => d.name).join(', ');
        return errorResponse(
          `The following domains are already assigned to other hosting accounts or VPS: ${domainNames}`, 
          'DOMAINS_ALREADY_ASSIGNED', 
          400
        );
      }
      
      if (assignedDomains.length > 0) {
        const domainNames = assignedDomains.map(d => d.name).join(', ');
        return errorResponse(
          `The following domains are already assigned to other hosting accounts or VPS: ${domainNames}`, 
          'DOMAINS_ALREADY_ASSIGNED', 
          400
        );
      }
      
      // Remove any existing assignments for the new domains
      await prisma.domain.updateMany({
        where: {
          id: { in: domainIds },
          createdBy: user.id, // Ensure user owns the domains
        },
        data: {
          hostingId: null,
          vpsId: null, // Remove from VPS if assigned
          isMainDomain: false, // Reset main domain flag
          domainHosting: null,
        },
      })
      
      // Assign domains to hosting with the first one as main domain
      for (let i = 0; i < domainIds.length; i++) {
        await prisma.domain.update({
          where: {
            id: domainIds[i],
            createdBy: user.id,
          },
          data: {
            hostingId: id,
            isMainDomain: i === 0, // First domain is main domain
            domainHosting: `Hosting: ${hosting.provider}`,
          },
        })
      }
    } else {
      // If no domains provided, remove all current assignments
      await prisma.domain.updateMany({
        where: { hostingId: id },
        data: { 
          hostingId: null,
          isMainDomain: false,
          domainHosting: null,
        },
      })
    }
    
    // Get updated hosting with domains
    const updatedHosting = await prisma.hosting.findUnique({
      where: { id },
      include: {
        domains: {
          select: {
            id: true,
            name: true,
            status: true,
            isMainDomain: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'HOSTING',
        entityId: hosting.id,
        description: `Hosting account updated: ${hosting.name}`,
        userId: user.id,
      },
    })

    // Return response with masked password
    const responseData = {
      ...updatedHosting,
      password: updatedHosting?.password ? '***masked***' : null,
    }

    return successResponse(responseData)
  } catch (error) {
    // Error updating hosting
    return errorResponse('Failed to update hosting account', 'DATABASE_ERROR', 500);
  }
}

/**
 * DELETE /api/v1/hosting/[id]
 * Delete a specific hosting account
 */
async function deleteHosting(req: NextRequest, { params }: RouteParams) {
  // Await params for Next.js 15 compatibility
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid hosting ID', 'VALIDATION_ERROR', 400)
  }

  // Get user from headers
  const user = getUserFromHeaders(req.headers)

  // Check if hosting exists and user has permission
  const existingHosting = await prisma.hosting.findFirst({
    where: {
      id,
      // Removed role-based filtering - all users can access all hosting
    },
    include: {
      domains: {
        select: { id: true, name: true },
      },
    },
  })

  if (!existingHosting) {
    return errorResponse('Hosting account not found', 'HOSTING_NOT_FOUND', 404)
  }

  // Check if hosting has associated domains
  if (existingHosting.domains.length > 0) {
    return errorResponse(
      'Cannot delete hosting account with associated domains. Please remove or reassign domains first.',
      'HOSTING_HAS_DOMAINS',
      400
    )
  }

  // Delete hosting
  await prisma.hosting.delete({
    where: { id },
  })

  // Log activity
  await logActivity({
    userId: user.id,
    action: 'DELETE',
    entity: 'HOSTING',
    entityId: id,
    description: `Deleted hosting account: ${existingHosting.name}`,
    metadata: {
      hostingName: existingHosting.name,
      provider: existingHosting.provider
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  })

  return successResponse({ message: 'Hosting account deleted successfully' })
}

// Export handlers with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getHosting)
  )
)

export const PUT = withApiMiddleware(
  withMethods(['PUT'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], updateHosting)
  )
)

export const DELETE = withApiMiddleware(
  withMethods(['DELETE'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], deleteHosting)
  )
) 