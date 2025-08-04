import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { idSchema } from '@/lib/validation/schemas'
import { decrypt } from '@/lib/crypto'

/**
 * GET /api/v1/vps/[id]/password
 * Get VPS password (unmasked) - Admin and Staff only
 */
async function getVpsPassword(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  // Validate ID
  const idResult = idSchema.safeParse({ id })
  if (!idResult.success) {
    return errorResponse('Invalid VPS ID', 'VALIDATION_ERROR', 400)
  }
  
  // Get user from headers
  const user = getUserFromHeaders(req.headers)
  
  // Get VPS password
  const vps = await prisma.vPS.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      password: true,
    },
  })
  
  if (!vps) {
    return errorResponse('VPS not found', 'NOT_FOUND', 404)
  }
  
  // Decrypt password if it exists
  const decryptedPassword = vps.password ? decrypt(vps.password) : null
  
  return successResponse({
    id: vps.id,
    name: vps.name,
    password: decryptedPassword,
  })
}

export const GET = withApiMiddleware(
  withMethods(['GET'], 
    withRoles(['ADMIN', 'STAFF'], getVpsPassword)
  )
) 