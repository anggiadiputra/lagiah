import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { idSchema, updateVpsSchema } from '@/lib/validation/schemas'
import { encrypt } from '@/lib/crypto'

/**
 * GET /api/v1/vps/[id]
 * Get a single VPS by ID
 */
async function getVpsById(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid VPS ID', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Get VPS with websites and domains
  const vps = await prisma.vPS.findFirst({
    where: {
      id,
      // Removed role-based filtering - all users can access all VPS
    },
    include: {
      websites: {
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
        },
      },
      domains: {
        select: {
          id: true,
          name: true,
          status: true,
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
  
  if (!vps) {
    return errorResponse('VPS not found', 'NOT_FOUND', 404)
  }
  
  // Mask sensitive data
  const responseData = {
    ...vps,
    password: vps.password ? '***masked***' : null,
    sshKey: vps.sshKey ? '***masked***' : null,
  }
  
  return successResponse(responseData)
}

/**
 * PUT /api/v1/vps/[id]
 * Update a VPS
 */
async function updateVps(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid VPS ID', 'VALIDATION_ERROR', 400)
  }

  // Validate update data
  const updateResult = updateVpsSchema.safeParse(body)
  if (!updateResult.success) {
    return errorResponse('Invalid update data', 'VALIDATION_ERROR', 400, updateResult.error.flatten())
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Check if VPS exists and user has access
  const existingVps = await prisma.vPS.findFirst({
    where: {
      id,
      // Removed role-based filtering - all users can access all VPS
    },
  })
  
  if (!existingVps) {
    return errorResponse('VPS not found', 'NOT_FOUND', 404)
  }
  
  // Prepare update data
  const updateData = { ...updateResult.data }
  
  // Extract domain IDs for assignment
  const domainIds = updateData.domainIds || []
  delete updateData.domainIds
  
  // Auto-set status based on expiry date if not provided
  if (updateData.expiresAt) {
    const expiryDate = new Date(updateData.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      updateData.status = 'EXPIRED'
    } else {
      // Keep VPS as ACTIVE even if expiring soon
      // SUSPENDED status should be set manually when actually suspended by provider
      updateData.status = 'ACTIVE'
    }
  } else if (!updateData.status) {
    updateData.status = 'ACTIVE' // Default status if no expiry date
  }
  
  // Encrypt sensitive data if provided
  if (updateData.password) {
    updateData.password = encrypt(updateData.password)
  }
  if (updateData.sshKey) {
    updateData.sshKey = encrypt(updateData.sshKey)
  }
  
  // Update VPS
  const vps = await prisma.vPS.update({
    where: { id },
    data: updateData,
    include: {
      websites: {
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
        },
      },
      domains: {
        select: {
          id: true,
          name: true,
          status: true,
          isMainDomain: true,
        },
      },
    },
  })
  
  // Handle domain assignment
  if (domainIds.length > 0) {
    // First, remove all current domain assignments for this VPS
    await prisma.domain.updateMany({
      where: { vpsId: id },
      data: { 
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
      (domain.vps !== null && domain.vps.id !== id) || domain.hosting !== null
    );
    
    // Also check if any domains have hostingId or vpsId in the database (excluding current VPS)
    const domainsWithAssignments = await prisma.domain.findMany({
      where: {
        id: { in: domainIds },
        OR: [
          { hostingId: { not: null } },
          { vpsId: { not: null } }
        ],
        NOT: {
          vpsId: id
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
        id: { in: domainIds }
      },
      data: {
        vpsId: null,
        hostingId: null, // Remove from hosting if assigned
        isMainDomain: false, // Reset main domain flag
        domainHosting: null,
      },
    })
    
    // Assign domains to VPS with the first one as main domain
    for (let i = 0; i < domainIds.length; i++) {
      await prisma.domain.update({
        where: {
          id: domainIds[i]
        },
        data: {
          vpsId: id,
          isMainDomain: i === 0, // First domain is main domain
          domainHosting: `VPS: ${vps.provider}`,
        },
      })
    }
  } else {
    // If no domains provided, remove all current assignments
    await prisma.domain.updateMany({
      where: { vpsId: id },
      data: { 
        vpsId: null,
        isMainDomain: false,
        domainHosting: null,
      },
    })
  }
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      action: 'UPDATE',
      entity: 'VPS',
      entityId: vps.id,
      description: `VPS server updated: ${vps.name}`,
      userId: user.id,
    },
  })
  
  // Refetch VPS with updated domain relationships
  const updatedVps = await prisma.vPS.findUnique({
    where: { id },
    include: {
      websites: {
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
        },
      },
      domains: {
        select: {
          id: true,
          name: true,
          status: true,
          isMainDomain: true,
        },
      },
    },
  })
  
  // Return response with masked passwords
  const responseData = {
    ...updatedVps,
    password: updatedVps?.password ? '***masked***' : null,
    sshKey: updatedVps?.sshKey ? '***masked***' : null,
  }
  
  return successResponse(responseData)
}

/**
 * DELETE /api/v1/vps/[id]
 * Delete a VPS
 */
async function deleteVps(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid VPS ID', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Check if VPS exists and user has access
  const existingVps = await prisma.vPS.findFirst({
    where: {
      id,
      // Removed role-based filtering - all users can access all VPS
    },
  })
  
  if (!existingVps) {
    return errorResponse('VPS not found', 'NOT_FOUND', 404)
  }
  
  // Delete VPS
  await prisma.vPS.delete({
    where: { id },
  })
  
  // Log activity
  await logActivity({
    userId: user.id,
    action: 'DELETE',
    entity: 'VPS',
    entityId: id,
    description: `Deleted VPS server: ${existingVps.name}`,
    metadata: {
      vpsName: existingVps.name,
      provider: existingVps.provider
    },
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req)
  })
  
  return successResponse({ message: 'VPS deleted successfully' })
}

// Export handlers with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getVpsById)
  )
)

export const PUT = withApiMiddleware(
  withMethods(['PUT'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], updateVps)
  )
)

export const DELETE = withApiMiddleware(
  withMethods(['DELETE'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], deleteVps)
  )
)