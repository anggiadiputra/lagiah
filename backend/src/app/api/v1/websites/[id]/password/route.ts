import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { idSchema } from '@/lib/validation/schemas'
import { decrypt } from '@/lib/crypto'

/**
 * GET /api/v1/websites/[id]/password
 * Get website password (unmasked) - Admin and Staff only
 */
async function getWebsitePassword(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid website ID', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Get website password
  const website = await prisma.website.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      password: true,
    },
  })
  
  if (!website) {
    return errorResponse('Website not found', 'NOT_FOUND', 404)
  }
  
  // Decrypt password if it exists
  const decryptedPassword = website.password ? decrypt(website.password) : null
  
  return successResponse({
    id: website.id,
    name: website.name,
    password: decryptedPassword,
  })
}

export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF'], getWebsitePassword)
  )
) 