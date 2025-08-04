import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, cleanupExpiredHostingAssignments } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { createHostingSchema, paginationSchema, sortSchema } from '@/lib/validation/schemas'
import { HostingStatus } from '@/generated/prisma'
import { encrypt } from '@/lib/crypto'

/**
 * GET /api/v1/hosting
 * Get all hosting accounts with pagination and filtering
 */
async function getHosting(req: NextRequest) {
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') || '1')
  const limit = Number(url.searchParams.get('limit') || '10')
  const sort = url.searchParams.get('sort') || 'createdAt'
  const order = url.searchParams.get('order') || 'desc'
  const statusParam = url.searchParams.get('status')
  const provider = url.searchParams.get('provider')
  
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
  
      // User authentication info
  
  // Test simple query first
      const testCount = await prisma.hosting.count()
  
  // Convert status string to enum if provided
  const status = statusParam as HostingStatus | undefined
  
  // Build query - For ADMIN, show all hosting. For others, show only their own
  const where = {
    ...(status && { status }),
    ...(provider && { provider: { contains: provider, mode: 'insensitive' as const } }),
    // Removed role-based filtering - all users can see all hosting
  }
  
      // Query execution
  
  // Get total count
  const total = await prisma.hosting.count({ where })
  
      // Total hosting count
  
  // Get hosting accounts
  const hosting = await prisma.hosting.findMany({
    where,
    orderBy: {
      [sort]: order,
    },
    skip: (page - 1) * limit,
    take: limit,
    include: {
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
  
      // Hosting data fetched
  
  const response = successResponse({
    items: hosting,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
  
      // Response prepared
  return response
}

/**
 * POST /api/v1/hosting
 * Create a new hosting account
 */
async function createHosting(req: NextRequest) {
  try {
    // Clean up expired hosting assignments first
    await cleanupExpiredHostingAssignments();
    
    // Parse request body
    const body = await req.json();
    
    // Validate the parsed body
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid request body: must be a JSON object', 'INVALID_REQUEST', 400);
    }
    
    // Continue with validation and processing...
    const validationResult = createHostingSchema.safeParse(body);
    if (!validationResult.success) {
      // Validation failed
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        validationResult.error.issues
      );
    }
    
    const hostingData = validationResult.data;
    
    // Get user from headers
    const user = getUserFromHeaders(req.headers);
    
    // Set name to provider if not provided
    const hostingDataWithName = {
      ...hostingData,
      name: hostingData.name || hostingData.provider, // Use provider as name if not provided
      createdBy: user.id,
      // Process date fields
      createdAt: hostingData.createdAt ? new Date(hostingData.createdAt) : undefined,
      expiresAt: hostingData.expiresAt ? new Date(hostingData.expiresAt) : undefined,
    };
    
    // Auto-set status based on expiry date if not provided
    if (hostingDataWithName.expiresAt) {
      const expiryDate = new Date(hostingDataWithName.expiresAt)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry < 0) {
        hostingDataWithName.status = 'EXPIRED'
      } else {
        // Keep hosting as ACTIVE even if expiring soon
        // SUSPENDED status should be set manually when actually suspended by provider
        hostingDataWithName.status = 'ACTIVE'
      }
    } else if (!hostingDataWithName.status) {
      hostingDataWithName.status = 'ACTIVE' // Default status if no expiry date
    }
    
    // Remove domainIds from the data to be saved (it's used for relationships)
    const { domainIds, ...hostingDataForCreate } = hostingDataWithName;
    
    // Validate domain assignments if provided
    if (domainIds && domainIds.length > 0) {
      const domains = await prisma.domain.findMany({
        where: {
          id: {
            in: domainIds
          }
        },
        include: {
          hosting: {
            select: {
              id: true,
              name: true,
              provider: true,
              expiresAt: true
            }
          },
          vps: {
            select: {
              id: true,
              name: true,
              provider: true,
              expiresAt: true
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
    }
    
    // Create hosting account
    const hosting = await prisma.hosting.create({
      data: hostingDataForCreate,
      include: {
        domains: true
      }
    });
    
    // Assign domains if provided
    if (domainIds && domainIds.length > 0) {
      // ✅ IMPROVED: Set main domain logic - first domain in array becomes main domain
      for (let i = 0; i < domainIds.length; i++) {
        const domainId = domainIds[i];
        const isMainDomain = i === 0; // First domain becomes main domain
        
        await prisma.domain.update({
          where: { id: domainId },
          data: {
            hostingId: hosting.id,
            vpsId: null, // Remove from VPS if assigned
            domainHosting: `Hosting: ${hosting.provider}`,
            isMainDomain: isMainDomain
          }
        });
        
        // Domain assigned
      }
      
      // Get updated hosting with domains
      const updatedHosting = await prisma.hosting.findUnique({
        where: { id: hosting.id },
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
      
      // Log activity
      await prisma.activityLog.create({
        data: {
          action: 'CREATE',
          entity: 'HOSTING',
          entityId: hosting.id,
          description: `Created hosting account: ${hosting.provider} - ${hosting.planName}`,
          userId: user.id,
        },
      });
      
      return successResponse(updatedHosting, 201);
    }
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'HOSTING',
        entityId: hosting.id,
        description: `Created hosting account: ${hosting.provider} - ${hosting.planName}`,
        userId: user.id,
      },
    });
    
    return successResponse(hosting, 201);
    
  } catch (error) {
    // Error in createHosting
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR', 500);
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getHosting)
  )
)

export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF'], createHosting)
  )
) 