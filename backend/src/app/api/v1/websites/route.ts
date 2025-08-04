import { NextRequest } from 'next/server'
import { withRoles } from '@/middleware/api-middleware'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { createWebsiteSchema } from '@/lib/validation/schemas'

/**
 * GET /api/v1/websites
 * List all websites for the authenticated user
 */
async function getWebsites(req: NextRequest) {
  const user = getUserFromHeaders(req.headers)
  const { searchParams } = new URL(req.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const sort = searchParams.get('sort') || 'createdAt:desc'
  
  try {
    // Parse sorting
    const [sortField, sortOrder] = sort.split(':')
    const orderBy = { [sortField]: sortOrder === 'desc' ? 'desc' : 'asc' }
    
    // Build where clause
    const where: any = {
      // Admin can see all websites, other users only see their own
      // Removed role-based filtering - all users can see all websites
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { url: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }
    
    // User authentication and query info
    
    // Get total count
    const total = await prisma.website.count({ where })
    
    // No activity logging for READ operations
    
    // Total websites count
    
    // Get websites with pagination
    const websites = await prisma.website.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        url: true,
        status: true,
        cms: true,
        cmsVersion: true,
        phpVersion: true,
        sslStatus: true,
        sslExpiry: true,
        backupStatus: true,
        lastBackup: true,
        notes: true,
        username: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        domainId: true,
        hostingId: true,
        vpsId: true,
        domain: {
          select: {
            id: true,
            name: true,
          },
        },
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
      },
    })
    
    const pages = Math.ceil(total / limit)
    
    return successResponse({
      items: websites,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    })
  } catch (error: any) {
    // Error fetching websites
    return errorResponse('Failed to fetch websites', 'FETCH_ERROR', 500)
  }
}

/**
 * POST /api/v1/websites
 * Create a new website
 */
async function createWebsite(req: NextRequest) {
  const user = getUserFromHeaders(req.headers)
  
      // Creating website for user
  
  try {
    const body = await req.json()
    // Request body received
    
    // Validate input
    const validatedData = createWebsiteSchema.parse(body)
    // Data validated
    
    // Check if website with same name already exists for this user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        name: validatedData.name,
        createdBy: user.id,
      },
    })
    
    if (existingWebsite) {
      return errorResponse(
        `Website with name "${validatedData.name}" already exists`,
        'WEBSITE_EXISTS',
        409
      )
    }
    
    // Prepare data for creation
    const websiteData: any = {
      name: validatedData.name,
      status: validatedData.status,
      sslStatus: validatedData.sslStatus || 'NONE',
      createdBy: user.id,
    }
    
    // Website data prepared
    
    // Add optional fields
    if (validatedData.url) websiteData.url = validatedData.url
    if (validatedData.cms) websiteData.cms = validatedData.cms
    if (validatedData.cmsVersion) websiteData.cmsVersion = validatedData.cmsVersion
    if (validatedData.phpVersion) websiteData.phpVersion = validatedData.phpVersion
    if (validatedData.sslExpiry) websiteData.sslExpiry = validatedData.sslExpiry
    if (validatedData.backupStatus) websiteData.backupStatus = validatedData.backupStatus
    if (validatedData.lastBackup) websiteData.lastBackup = validatedData.lastBackup
    if (validatedData.notes) websiteData.notes = validatedData.notes
    if (validatedData.username) websiteData.username = validatedData.username
    if (validatedData.password) websiteData.password = validatedData.password
    if (validatedData.domainId) {
      websiteData.domainId = validatedData.domainId
      
      // Auto-assign hosting/VPS based on domain
      const domain = await prisma.domain.findUnique({
        where: { id: validatedData.domainId },
        select: { hostingId: true, vpsId: true }
      })
      
      if (domain) {
        // Auto-assign hosting if domain has hosting
        if (domain.hostingId && !validatedData.hostingId) {
          websiteData.hostingId = domain.hostingId
          // Auto-assigned hosting
        }
        
        // Auto-assign VPS if domain has VPS
        if (domain.vpsId && !validatedData.vpsId) {
          websiteData.vpsId = domain.vpsId
          // Auto-assigned VPS
        }
      }
    }
    
    // Manual assignments (override auto-assignment)
    if (validatedData.hostingId) websiteData.hostingId = validatedData.hostingId
    if (validatedData.vpsId) websiteData.vpsId = validatedData.vpsId
    
    // Website data with optional fields
    
    // Create website
    
    try {
      const website = await prisma.website.create({
        data: websiteData,
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
          cms: true,
          cmsVersion: true,
          phpVersion: true,
          sslStatus: true,
          sslExpiry: true,
          backupStatus: true,
          lastBackup: true,
          notes: true,
          username: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          domainId: true,
          hostingId: true,
          vpsId: true,
          domain: {
            select: {
              id: true,
              name: true,
            },
          },
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
        },
      })
      
      // Website created successfully
      
      // Log activity
      await logActivity({
        userId: user.id,
        action: 'CREATE',
        entity: 'WEBSITE',
        entityId: website.id,
        description: `Created website: ${website.name}`,
        metadata: {
          websiteName: website.name,
          websiteUrl: website.url,
          cms: website.cms,
          domainId: website.domainId,
          hostingId: website.hostingId,
          vpsId: website.vpsId
        },
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        websiteId: website.id
      })
      
      return successResponse(website, 201)
    } catch (dbError: any) {
      // Database error occurred
      throw dbError
    }
  } catch (error: any) {
    // Error creating website
    if (error.name === 'ZodError') {
      return errorResponse('Invalid input data', 'VALIDATION_ERROR', 400, error.errors)
    }
    return errorResponse('Failed to create website', 'CREATE_ERROR', 500)
  }
}

// Export with role-based middleware
export const GET = withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], getWebsites)
export const POST = withRoles(['ADMIN', 'STAFF'], createWebsite) 