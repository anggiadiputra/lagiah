import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { withRoles, withApiMiddleware, withMethods } from '@/middleware/api-middleware'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { updateWebsiteSchema } from '@/lib/validation/schemas'
import { verifyJwtToken } from '@/lib/auth/jwt'

/**
 * PUT /api/v1/websites/[id]
 * Update a website by ID
 */
async function updateWebsite(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const websiteId = String(id)
    
    // Get user from JWT token since middleware is not working
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    const user = verifyJwtToken(token)
    if (!user) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }
    
    // Updating website

    const body = await req.json()
    
    // Validate input
    const validatedData = updateWebsiteSchema.parse(body)

    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        domain: true,
        hosting: true,
        vps: true
      }
    })

    if (!existingWebsite) {
      return errorResponse('Website not found', 'WEBSITE_NOT_FOUND', 404)
    }

    // All users can update any website

    // Prepare update data
    const updateData: any = {}
    
    // Add fields that are provided
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.url !== undefined) updateData.url = validatedData.url
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.cms !== undefined) updateData.cms = validatedData.cms
    if (validatedData.cmsVersion !== undefined) updateData.cmsVersion = validatedData.cmsVersion
    if (validatedData.phpVersion !== undefined) updateData.phpVersion = validatedData.phpVersion
    if (validatedData.sslStatus !== undefined) updateData.sslStatus = validatedData.sslStatus
    if (validatedData.sslExpiry !== undefined) updateData.sslExpiry = validatedData.sslExpiry
    if (validatedData.backupStatus !== undefined) updateData.backupStatus = validatedData.backupStatus
    if (validatedData.lastBackup !== undefined) updateData.lastBackup = validatedData.lastBackup
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.username !== undefined) updateData.username = validatedData.username
    if (validatedData.password !== undefined) updateData.password = validatedData.password
    
    // Handle domain change and auto-assignment
    if (validatedData.domainId !== undefined) {
      updateData.domainId = validatedData.domainId
      
      // Auto-assign hosting/VPS based on domain
      const domain = await prisma.domain.findUnique({
        where: { id: validatedData.domainId },
        select: { hostingId: true, vpsId: true }
      })
      
      if (domain) {
        // Auto-assign hosting if domain has hosting and no manual hosting specified
        if (domain.hostingId && validatedData.hostingId === undefined) {
          updateData.hostingId = domain.hostingId
        } else if (!domain.hostingId) {
          // Clear hosting if domain doesn't have hosting
          updateData.hostingId = null
        }
        
        // Auto-assign VPS if domain has VPS and no manual VPS specified
        if (domain.vpsId && validatedData.vpsId === undefined) {
          updateData.vpsId = domain.vpsId
          // Auto-assigned VPS
        } else if (!domain.vpsId) {
          // Clear VPS if domain doesn't have VPS
          updateData.vpsId = null
        }
      }
    }
    
    // Manual assignments (override auto-assignment)
    if (validatedData.hostingId !== undefined) updateData.hostingId = validatedData.hostingId
    if (validatedData.vpsId !== undefined) updateData.vpsId = validatedData.vpsId

    // Update data prepared

    // Update the website
    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: updateData,
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

    // Website updated successfully

    return successResponse(updatedWebsite)

  } catch (error) {
    // Error updating website
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/websites/[id]
 * Delete a website by ID
 */
async function deleteWebsite(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const websiteId = String(id)

    // Get user from JWT token since middleware is not working
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    const user = verifyJwtToken(token)
    if (!user) {
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }
    // User authenticated

    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId }
    })

    if (!existingWebsite) {
      return errorResponse('Website not found', 'WEBSITE_NOT_FOUND', 404)
    }

    // Website found

    // All users can delete any website

    // Delete the website
    await prisma.website.delete({
      where: { id: websiteId }
    })

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'DELETE',
      entity: 'WEBSITE',
      entityId: websiteId,
      description: `Deleted website: ${existingWebsite.name}`,
      metadata: {
        websiteName: existingWebsite.name,
        websiteUrl: existingWebsite.url
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    })

    // Website deleted successfully

    return successResponse({
      message: 'Website deleted successfully',
      deletedWebsite: {
        id: existingWebsite.id,
        name: existingWebsite.name
      }
    })

  } catch (error: any) {
    // Error deleting website
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export const PUT = withApiMiddleware(
  withMethods(['PUT'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], updateWebsite)
  )
)

export const DELETE = withApiMiddleware(
  withMethods(['DELETE'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], deleteWebsite)
  )
) 