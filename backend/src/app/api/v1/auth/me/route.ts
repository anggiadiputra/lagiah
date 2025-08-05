import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse } from '@/lib/utils'
import { verifyJwtToken, getTokenFromHeader } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization')
    // Auth header received
    const token = getTokenFromHeader(authHeader)
    // Token extracted
    
    if (!token) {
      // No token found in header
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    
    // Verify and decode JWT token (synchronous)
    const decoded = verifyJwtToken(token)
    // Token verification completed
    
    if (!decoded || !decoded.id) {
      // Invalid token or missing ID in token
      return errorResponse('Invalid token', 'INVALID_TOKEN', 401)
    }
    
    // Get user from database
    // Looking up user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    if (!user) {
      // User not found in database
      return errorResponse('User not found', 'USER_NOT_FOUND', 404)
    }
    
    // User found - return user data only (recent activity can be fetched separately)
    return successResponse({
      user,
    })
  } catch (error) {
    // Error fetching user profile
    return errorResponse('Failed to fetch user profile', 'PROFILE_ERROR', 500)
  }
} 