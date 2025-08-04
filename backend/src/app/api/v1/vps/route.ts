import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { createVpsSchema, paginationSchema, sortSchema } from '@/lib/validation/schemas'
import { VPSStatus } from '@/generated/prisma'
import { encrypt } from '@/lib/crypto'

/**
 * GET /api/v1/vps
 * Get all VPS servers with pagination and filtering
 */
async function getVps(req: NextRequest) {
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') || '1')
  const limit = Number(url.searchParams.get('limit') || '10')
  const sort = url.searchParams.get('sort') || 'createdAt'
  const order = url.searchParams.get('order') || 'desc'
  const statusParam = url.searchParams.get('status')
  const provider = url.searchParams.get('provider')
  const search = url.searchParams.get('search')
  
  // Validate pagination and sorting
  const paginationResult = paginationSchema.safeParse({ page, limit })
  const sortResult = sortSchema.safeParse({ sort, order })
  
  if (!paginationResult.success) {
    return errorResponse('Invalid pagination parameters', 'VALIDATION_ERROR', 400)
  }
  
  if (!sortResult.success) {
    return errorResponse('Invalid sorting parameters', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Convert status string to enum if provided
  const status = statusParam as VPSStatus | undefined
  
  // Build query
  const where = {
    ...(status && { status }),
    ...(provider && { provider: { contains: provider, mode: 'insensitive' as const } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { provider: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    // Removed role-based filtering - all users can see all VPS
  }
  
  // Get total count
  const total = await prisma.vPS.count({ where })
  
  // Get VPS servers
  const vpsServers = await prisma.vPS.findMany({
    where,
    orderBy: {
      [sort]: order,
    },
    skip: (page - 1) * limit,
    take: limit,
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
  
  // Mask sensitive data in list view
  const maskedVpsServers = vpsServers.map((vps: any) => ({
    ...vps,
    password: vps.password ? '***masked***' : null,
    sshKey: vps.sshKey ? '***masked***' : null,
  }))
  
  return successResponse({
    items: maskedVpsServers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

/**
 * POST /api/v1/vps
 * Create a new VPS server
 */
async function createVps(req: NextRequest) {
  const body = await req.json()
  
  // Validate request body
  const result = createVpsSchema.safeParse(body)
  if (!result.success) {
    return errorResponse('Invalid VPS data', 'VALIDATION_ERROR', 400, result.error.issues)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Check if VPS with same name already exists for this user
  const existingVps = await prisma.vPS.findFirst({
    where: { 
      name: result.data.name,
      createdBy: user.id,
    },
  })
  
  if (existingVps) {
    return errorResponse('VPS with this name already exists', 'CONFLICT', 409)
  }
  
  // Prepare data with encrypted credentials
  const vpsData = {
    ...result.data,
    createdBy: user.id,
  } as any
  
  // Remove createdAt if present (should be set by Prisma)
  delete vpsData.createdAt
  
  // Auto-set status based on expiry date if not provided
  if (vpsData.expiresAt) {
    const expiryDate = new Date(vpsData.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      vpsData.status = 'EXPIRED'
    } else {
      // Keep VPS as ACTIVE even if expiring soon
      // SUSPENDED status should be set manually when actually suspended by provider
      vpsData.status = 'ACTIVE'
    }
  } else if (!vpsData.status) {
    vpsData.status = 'ACTIVE' // Default status if no expiry date
  }
  
  // Encrypt sensitive data if provided
  if (vpsData.password) {
    vpsData.password = encrypt(vpsData.password)
  }
  if (vpsData.sshKey) {
    vpsData.sshKey = encrypt(vpsData.sshKey)
  }
  
  // Extract domain IDs for assignment
  const domainIds = vpsData.domainIds || []
  delete vpsData.domainIds
  
  // Create VPS server
  const vps = await prisma.vPS.create({
    data: vpsData,
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
  
  // Assign domains to VPS if provided
  if (domainIds.length > 0) {
    // Check if any domains are already assigned to other hosting or VPS
    const domains = await prisma.domain.findMany({
      where: {
        id: { in: domainIds },
        createdBy: user.id, // Ensure user owns the domains
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
      domain.hosting !== null || domain.vps !== null
    );
    
    // Also check if any domains have hostingId or vpsId in the database
    const domainsWithAssignments = await prisma.domain.findMany({
      where: {
        id: { in: domainIds },
        OR: [
          { hostingId: { not: null } },
          { vpsId: { not: null } }
        ]
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
    
    // First, remove any existing assignments for these domains
    await prisma.domain.updateMany({
      where: {
        id: { in: domainIds },
        createdBy: user.id, // Ensure user owns the domains
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
          id: domainIds[i],
          createdBy: user.id,
        },
        data: {
          vpsId: vps.id,
          isMainDomain: i === 0, // First domain is main domain
          domainHosting: `VPS: ${vps.provider}`,
        },
      })
    }
  }
  
  // Log activity
  await prisma.activityLog.create({
    data: {
      action: 'CREATE',
      entity: 'VPS',
      entityId: vps.id,
      description: `VPS server created: ${vps.name}`,
      userId: user.id,
    },
  })
  
  // Refetch VPS with updated domain relationships
  const updatedVps = await prisma.vPS.findUnique({
    where: { id: vps.id },
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
  
  return successResponse(responseData, 201)
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getVps)
  )
)

export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF'], createVps)
  )
) 
