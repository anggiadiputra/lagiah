import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { idSchema } from '@/lib/validation/schemas'
import { decrypt } from '@/lib/crypto'

/**
 * GET /api/v1/hosting/[id]/password
 * Get hosting password (unmasked) - Admin and Staff only
 */
async function getHostingPassword(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid hosting ID', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Get hosting password
  const hosting = await prisma.hosting.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      password: true,
    },
  })
  
  if (!hosting) {
    return errorResponse('Hosting not found', 'NOT_FOUND', 404)
  }
  
  // Decrypt password if it exists
  const decryptedPassword = hosting.password ? decrypt(hosting.password) : null
  
  return successResponse({
    id: hosting.id,
    name: hosting.name,
    password: decryptedPassword,
  })
}

export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF'], getHostingPassword)
  )
) 