import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { logActivity, getClientIP, getUserAgent } from '@/lib/utils'

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER']),
})

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/v1/users - Get all users
export async function GET(request: NextRequest) {
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
            message: 'Forbidden: Only administrators can access user management'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    // Log activity for user listing
    await logActivity({
      userId: authUser.id,
      action: 'READ',
      entity: 'USER',
      entityId: 'list',
      description: `Listed users (page: ${page}, limit: ${limit})`,
      metadata: {
        page,
        limit,
        total,
        filters: { search, role },
        totalPages
      },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      status: 'success',
      data: {
        items: users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    })
    
  } catch (error) {
    // Error fetching users
    return NextResponse.json(
      {
        status: 'error',
        error: {
          code: 'FETCH_USERS_ERROR',
          message: 'Failed to fetch users'
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

// POST /api/v1/users - Create new user
export async function POST(request: NextRequest) {
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
            message: 'Forbidden: Only administrators can create users'
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate request body
    const validatedBody = createUserSchema.parse(body)
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedBody.email }
    })
    
    if (existingUser) {
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
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedBody.password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedBody.name,
        email: validatedBody.email,
        password: hashedPassword,
        role: validatedBody.role,
        isActive: true,
      },
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
    
    // Log activity
    await logActivity({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'USER',
      entityId: user.id,
      description: `Created user: ${user.name} (${user.email})`,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role
      },
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request)
    })
    
    return NextResponse.json({
      status: 'success',
      data: {
        message: 'User created successfully',
        user
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    }, { status: 201 })
    
  } catch (error) {
    // Error creating user
    
    if (error instanceof z.ZodError) {
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
          code: 'CREATE_USER_ERROR',
          message: 'Failed to create user'
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