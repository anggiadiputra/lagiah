import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { logActivity, getClientIP, getUserAgent } from '@/lib/utils'

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/v1/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and role
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Missing token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authUser = verifyJwtToken(token)
    
    if (!authUser) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Invalid token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }
    
    if (!['ADMIN'].includes(authUser.role)) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'FORBIDDEN',
            message: 'Forbidden: Only administrators can access user details'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 403 }
      )
    }
    
    const userId = params.id
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password for security
      }
    })
    
    if (!user) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      status: 'success',
      data: { user },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error fetching user
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'FETCH_USER_ERROR',
          message: 'Failed to fetch user',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      },
      { status: 500 }
    )
  }
}

// PUT /api/v1/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and role
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Missing token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authUser = verifyJwtToken(token)
    
    if (!authUser) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Invalid token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }
    
    if (!['ADMIN'].includes(authUser.role)) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'FORBIDDEN',
            message: 'Forbidden: Only administrators can update users'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 403 }
      )
    }
    
    // Starting update process
    
    const userId = params.id
    
    const body = await request.json()
    
    // Validate request body
    const validatedBody = updateUserSchema.parse(body)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!existingUser) {
      // User not found
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 404 }
      )
    }
    
    // User found
    
    // Check if email is being changed and if it already exists
    if (validatedBody.email && validatedBody.email !== existingUser.email) {
      // Checking email uniqueness
      const emailExists = await prisma.user.findFirst({
        where: { 
          email: validatedBody.email,
          NOT: {
            id: userId
          }
        }
      })
      
      if (emailExists) {
        // Email already exists
        return NextResponse.json(
          {
            status: 'error',
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already exists'
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0'
            }
          },
          { status: 400 }
        )
      }
      // Email is unique
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (validatedBody.name !== undefined) updateData.name = validatedBody.name
    if (validatedBody.email !== undefined) updateData.email = validatedBody.email
    if (validatedBody.role !== undefined) updateData.role = validatedBody.role
    if (validatedBody.isActive !== undefined) updateData.isActive = validatedBody.isActive
    
    // Hash password if provided
    if (validatedBody.password) {
      updateData.password = await bcrypt.hash(validatedBody.password, 12)
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password for security
      }
    })
    
    // User updated successfully
    
    // Log activity
    // Logging activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'UPDATE',
          entity: 'USER',
          entityId: user.id,
          description: `Updated user: ${user.name} (${user.email})`,
          userId: existingUser.id, // Use existing user ID instead of 'system'
          metadata: {
            userRole: user.role,
            userEmail: user.email
          }
        }
      })
      // Activity logged successfully
    } catch (activityError) {
              // Activity logging failed
      // Continue without activity logging
    }
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'User updated successfully',
        user
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error updating user
    
    if (error instanceof z.ZodError) {
              // Validation error
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.issues
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'UPDATE_USER_ERROR',
          message: 'Failed to update user',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and role
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Missing token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const authUser = verifyJwtToken(token)
    
    if (!authUser) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized: Invalid token'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 401 }
      )
    }
    
    if (!['ADMIN'].includes(authUser.role)) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'FORBIDDEN',
            message: 'Forbidden: Only administrators can delete users'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 403 }
      )
    }
    
    const userId = params.id
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 404 }
      )
    }
    
    // Check if user has related data
    const relatedData = await prisma.$transaction([
      prisma.domain.count({ where: { createdBy: userId } }),
      prisma.hosting.count({ where: { createdBy: userId } }),
      prisma.vPS.count({ where: { createdBy: userId } }),
      prisma.website.count({ where: { createdBy: userId } }),
      prisma.activityLog.count({ where: { userId: userId } })
    ])
    
    const [domainsCount, hostingCount, vpsCount, websitesCount, activitiesCount] = relatedData
    
    if (domainsCount > 0 || hostingCount > 0 || vpsCount > 0 || websitesCount > 0) {
      return NextResponse.json(
        {
          status: 'error',
          error: {
            code: 'USER_HAS_RELATED_DATA',
            message: 'Cannot delete user with related data',
            details: {
              domains: domainsCount,
              hosting: hostingCount,
              vps: vpsCount,
              websites: websitesCount
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 400 }
      )
    }
    
    // Delete user and related activities in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user's activity logs first
      await tx.activityLog.deleteMany({
        where: { userId: userId }
      })
      
      // Delete user
      await tx.user.delete({
        where: { id: userId }
      })
    })
    
    // Log activity
    await logActivity({
      userId: authUser.id,
      action: 'DELETE',
      entity: 'USER',
      entityId: userId,
      description: `Deleted user: ${existingUser.name} (${existingUser.email})`,
      metadata: {
        userName: existingUser.name,
        userEmail: existingUser.email,
        userRole: existingUser.role
      },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'User deleted successfully'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error deleting user
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'DELETE_USER_ERROR',
          message: 'Failed to delete user',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      },
      { status: 500 }
    )
  }
} 