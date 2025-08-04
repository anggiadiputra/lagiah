import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse } from '@/lib/utils'
import { verifyJwtToken, getTokenFromHeader } from '@/lib/auth/jwt'

// GET /api/v1/auth/profile - Get user profile
export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404)
    }

    return successResponse(user, 200)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR', 500)
  }
}

// PUT /api/v1/auth/profile - Update user profile
export async function PUT(request: NextRequest) {
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
    const { name, email } = body

    // Validate input
    if (!name || !email) {
      return errorResponse('Name and email are required', 'VALIDATION_ERROR', 400)
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: decoded.id }
      }
    })

    if (existingUser) {
      return errorResponse('Email is already taken', 'EMAIL_EXISTS', 400)
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name,
        email,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse(updatedUser, 200)
  } catch (error) {
    console.error('Error updating profile:', error)
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR', 500)
  }
} 