import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse } from '@/lib/utils'
import { verifyJwtToken, getTokenFromHeader } from '@/lib/auth/jwt'
import bcrypt from 'bcryptjs'

// POST /api/v1/auth/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)
    
    if (!token) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    
    // Verify and decode JWT token
    const decoded = verifyJwtToken(token)
    
    if (!decoded || !decoded.id) {
      return errorResponse('Invalid token', 'INVALID_TOKEN', 401)
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 'VALIDATION_ERROR', 400)
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters long', 'VALIDATION_ERROR', 400)
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        password: true,
        email: true
      }
    })

    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404)
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return errorResponse('Current password is incorrect', 'INVALID_PASSWORD', 400)
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return successResponse({ message: 'Password changed successfully' }, 200)
  } catch (error) {
    console.error('Error changing password:', error)
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR', 500)
  }
} 