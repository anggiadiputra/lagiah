import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse, getUserFromHeaders } from '@/lib/utils'
import { z } from 'zod'
import { signJwtToken } from '@/lib/auth/jwt'
import bcrypt from 'bcryptjs'

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 */
async function login(req: NextRequest) {
  // Create basic headers for CORS
  const origin = req.headers.get('origin') || '*'
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    const body = await req.json()
    
    // Validate request body
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(
        'Invalid credentials', 
        'VALIDATION_ERROR', 
        400, 
        result.error.issues,
        corsHeaders
      )
    }
    
    const { email, password } = result.data
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return errorResponse(
        'Invalid email or password', 
        'INVALID_CREDENTIALS', 
        401,
        null,
        corsHeaders
      )
    }
    
    // Check if user is active
    if (!user.isActive) {
      return errorResponse(
        'Your account has been deactivated', 
        'ACCOUNT_INACTIVE', 
        403,
        null,
        corsHeaders
      )
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return errorResponse(
        'Invalid email or password', 
        'INVALID_CREDENTIALS', 
        401,
        null,
        corsHeaders
      )
    }
    
    // Generate JWT token
    const token = signJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })
    
    // Token generated successfully
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        description: `User logged in: ${user.email}`,
        userId: user.id,
        metadata: {
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
        }
      },
    })
    
    // Create response data
    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token
    }
    
    // Return user info and token with CORS headers
    return successResponse(responseData, 200, corsHeaders)
    
  } catch (error) {
    // Login error occurred
    return errorResponse(
      'An unexpected error occurred', 
      'SERVER_ERROR', 
      500,
      null,
      corsHeaders
    )
  }
}

// Export handler directly
export const POST = login
export const OPTIONS = login 