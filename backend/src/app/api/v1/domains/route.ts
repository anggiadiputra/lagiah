import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { createDomainSchema, paginationSchema, sortSchema } from '@/lib/validation/schemas'
import { DomainStatus } from '@/generated/prisma'
import { fetchWhoisData, getDomainExpirationStatus } from '@/lib/services/whois'
import { Prisma } from '@/generated/prisma'

/**
 * GET /api/v1/domains
 * Get all domains with pagination and filtering
 */
async function getDomains(req: NextRequest) {
  const startTime = Date.now()
  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get('page') || '1')
    const limit = Number(url.searchParams.get('limit') || '10')
    const sortParam = url.searchParams.get('sort') || 'createdAt'
    const orderParam = url.searchParams.get('order') || 'desc'
    const statusParam = url.searchParams.get('status')
    const registrarParam = url.searchParams.get('registrar')
    const search = url.searchParams.get('search')
    

    
    // Parse sort parameter - handle both "field:order" format and separate parameters
    let sort = sortParam
    let order = orderParam
    
    if (sortParam.includes(':')) {
      const [sortField, sortOrder] = sortParam.split(':')
      sort = sortField
      order = sortOrder
    }
    
    // Parsed sorting
    
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
    
    // User from headers
    
    // Convert status string to enum if provided
    const status = statusParam as DomainStatus | undefined
    
    // Build query - simplified approach without search for now
    const where: any = {}
    
    // Add status filter if provided
    if (status) {
      where.status = status
    }
    
    // Add registrar filter if provided
    if (registrarParam) {
      where.registrar = registrarParam
    }
    
    // Enable search with optimization
    if (search && search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive'
      }
    }
    

    
    // Search and where clause
    
    // Query where clause
    
    // Get total count
    const countStartTime = Date.now()
    const total = await prisma.domain.count({ where })
    const countTime = Date.now() - countStartTime
    
    // Log activity for domain listing
    await logActivity({
      userId: user.id,
      action: 'READ',
      entity: 'DOMAIN',
      entityId: 'list',
      description: `Listed domains (page: ${page}, limit: ${limit})`,
      metadata: {
        page,
        limit,
        total,
        filters: { status: statusParam, registrar: registrarParam, search },
        sort: `${sort}:${order}`
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    })

    
    // Get domains with error handling and optimized query
    let domains: any[] = []
    try {
      // Add query timeout and optimize the query
      domains = await prisma.$transaction(async (tx) => {
        return await tx.domain.findMany({
          where,
          orderBy: {
            [sort]: order,
          },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            registrar: true,
            status: true,
            registeredAt: true,
            expiresAt: true,
            nameservers: true,
            whoisData: true,
            notes: true,

            isMainDomain: true,
            domainHosting: true,
            createdAt: true,
            updatedAt: true,
            createdBy: true,
            hostingId: true,
            vpsId: true,
            hosting: {
              select: {
                id: true,
                name: true,
                provider: true,
              },
            },
            vps: {
              select: {
                id: true,
                name: true,
                provider: true,
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
          },
        })
      }, {
        timeout: 25000 // 25 second timeout for the transaction
      })
    } catch (dbError) {
      // Check if it's a timeout error
      if (dbError instanceof Error && dbError.message.includes('timeout')) {
        return errorResponse(
          'Database query timed out. Please try again.',
          'TIMEOUT_ERROR',
          408
        )
      }
      
      // Return empty result instead of throwing
      domains = []
    }
    

    
    return successResponse({
      items: domains,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return errorResponse(
      'An error occurred while fetching domains',
      'INTERNAL_SERVER_ERROR',
      500
    )
  }
}

/**
 * POST /api/v1/domains
 * Create a new domain, with intelligent Whois data integration.
 */
async function createDomain(req: NextRequest) {
      // CreateDomain request received
  try {
    const body = await req.json();
    // Request body parsed

    const result = createDomainSchema.safeParse(body);
    if (!result.success) {
      // Validation failed
      return errorResponse('Invalid data', 'VALIDATION_ERROR', 400, result.error.flatten());
    }
    // Validation successful
    const { name, hostingId, ...domainInput } = result.data;
    // Data parsed


    const user = getUserFromHeaders(req.headers);
    // User authenticated

    // Checking for existing domain
    const existingDomain = await prisma.domain.findUnique({ where: { name } });
    if (existingDomain) {
      // Domain already exists
      return errorResponse('Domain already exists', 'CONFLICT', 409);
    }

    // Fetching Whois data
    const whoisResult = await fetchWhoisData(name);
    const whoisData = whoisResult.data;
    // Whois fetch completed

    // Determine domain status based on Whois data
    let domainStatus = 'ACTIVE';
    
    if (!whoisData || !whoisData.registrar || whoisData.registrar === 'N/A') {
      // Domain doesn't have valid registrar info, likely available for order
      domainStatus = 'AVAILABLE_TO_ORDER';
    } else {
      // Check if domain status indicates it's available
      const statusString = String(whoisData.status || '').toLowerCase();
      const whoisStatus = String(whoisData.whoisData?.Status || '').toLowerCase();
      const whoisDataStatus = String(whoisData.whoisData?.data?.Status || '').toLowerCase();
      
      if (statusString === 'available' || whoisStatus === 'available' || whoisDataStatus === 'available') {
        domainStatus = 'AVAILABLE_TO_ORDER';
      }
    }

    const dataToCreate: Prisma.DomainCreateInput = {
      name: name,
      user: {
        connect: { id: user.id }
      },
      status: domainInput.status || domainStatus,
    };

    if (domainInput.registrar || whoisData?.registrar) {
      dataToCreate.registrar = domainInput.registrar || whoisData?.registrar;
    }

    if (domainInput.notes) {
      dataToCreate.notes = domainInput.notes;
    }

    if (domainInput.registeredAt) {
      dataToCreate.registeredAt = new Date(domainInput.registeredAt);
    } else if (whoisData?.registeredAt) {
      dataToCreate.registeredAt = new Date(whoisData.registeredAt);
    }
    if (domainInput.expiresAt) {
      dataToCreate.expiresAt = new Date(domainInput.expiresAt);
    } else if (whoisData?.expiresAt) {
      dataToCreate.expiresAt = new Date(whoisData.expiresAt);
    }
    if (domainInput.nameservers) {
      dataToCreate.nameservers = domainInput.nameservers;
    } else if (whoisData?.nameservers) {
      dataToCreate.nameservers = whoisData.nameservers;
    }
    if (whoisData?.whoisData) {
      dataToCreate.whoisData = { ...whoisData.whoisData, fetchedAt: new Date().toISOString() };
    }
    if (hostingId) {
      dataToCreate.hosting = { connect: { id: hostingId } };
    }
    
    // Attempting to create domain in DB

    try {
      const newDomain = await prisma.domain.create({
        data: dataToCreate,
        include: { hosting: { select: { id: true, name: true } } },
      });
      // DB creation successful
      
      // Log activity
      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entity: 'DOMAIN',
        entityId: newDomain.id,
        description: `Created domain: ${newDomain.name}`,
        metadata: {
          domainName: newDomain.name,
          registrar: newDomain.registrar,
          status: newDomain.status,
          whoisIntegrated: !!whoisData
        },
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        domainId: newDomain.id
      })
      
      return successResponse({ ...newDomain, whoisIntegrated: !!whoisData }, 201);
    } catch (dbError: any) {
      return errorResponse(`Database Error: ${dbError.code || 'Unknown'}`, 'DATABASE_ERROR', 500, {
        message: dbError.message,
        meta: dbError.meta,
      });
    }
  } catch (error: any) {
    console.error('[CreateDomain] UNHANDLED ERROR:', error);
    return errorResponse('An unexpected server error occurred.', 'INTERNAL_SERVER_ERROR', 500);
  }
}

// Export handler with middleware
export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getDomains)
  )
)

export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF'], createDomain)
  )
) 