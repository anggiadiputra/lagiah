import { NextRequest } from 'next/server'
import { successResponse, errorResponse, getUserFromHeaders, logActivity, getClientIP, getUserAgent } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'

/**
 * POST /api/v1/auth/logout
 * Logout user and log activity
 */
async function logout(req: NextRequest) {
  try {
    // Get user from headers
    const user = getUserFromHeaders(req.headers)
    
    // Log activity before logout
    await logActivity({
      userId: user.id,
      action: 'LOGOUT',
      entity: 'USER',
      entityId: user.id,
      description: `User logged out: ${user.email}`,
      metadata: {
        userEmail: user.email,
        userName: user.name
      },
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req)
    })
    
    return successResponse({
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Error during logout:', error)
    return errorResponse('Failed to logout', 'LOGOUT_ERROR', 500)
  }
}

// Export handler with middleware
export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], logout)
  )
) 