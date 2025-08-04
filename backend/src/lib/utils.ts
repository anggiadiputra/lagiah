import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { getTokenFromHeader, verifyJwtToken } from '@/lib/auth/jwt'
import { User } from '@/generated/prisma'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type ApiResponse<T> = {
  status: 'success' | 'error'
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    version: string
  }
}

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
    },
  }

  const res = NextResponse.json(response, { status })
  
  // Add custom headers if provided
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      res.headers.set(key, value)
    })
  }

  return res
}

/**
 * Create an error API response
 */
export function errorResponse(
  message: string,
  code = 'INTERNAL_SERVER_ERROR',
  status = 500,
  details?: unknown,
  headers?: Record<string, string>
): NextResponse {
  const response: ApiResponse<null> = {
    status: 'error',
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
    },
  }

  const res = NextResponse.json(response, { status })
  
  // Add custom headers if provided
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      res.headers.set(key, value)
    })
  }

  return res
}

/**
 * Handle validation errors from Zod
 */
export function handleZodError(error: ZodError): NextResponse {
  return errorResponse(
    'Validation error',
    'VALIDATION_ERROR',
    400,
    error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
  )
}

/**
 * Get user info from request headers (set by middleware)
 */
export function getUserFromHeaders(headers: Headers) {
  return {
    id: headers.get('x-user-id') || '',
    role: headers.get('x-user-role') || '',
    email: headers.get('x-user-email') || '',
  }
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`
  }
  return String(error)
} 

/**
 * Check if hosting is expired
 * @param expiresAt - ISO date string or null
 * @returns boolean indicating if hosting is expired
 */
export function isHostingExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const now = new Date();
  const expiryDate = new Date(expiresAt);
  return expiryDate < now;
}

/**
 * Clean up domain assignments from expired hosting
 * This function should be called periodically or when creating new hosting
 */
export async function cleanupExpiredHostingAssignments() {
  try {
    const expiredHosting = await prisma.hosting.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        domains: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    for (const hosting of expiredHosting) {
      if (hosting.domains.length > 0) {
        // Unassign all domains from expired hosting
        await prisma.domain.updateMany({
          where: {
            hostingId: hosting.id
          },
          data: {
            hostingId: null,
            domainHosting: null
          }
        });

        // Unassigned domains from expired hosting
      }
    }

    return expiredHosting.length;
  } catch (error) {
    console.error('Error cleaning up expired hosting assignments:', error);
    throw error;
  }
} 

/**
 * Log user activity to the database
 */
export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  description,
  metadata = {},
  ipAddress,
  userAgent,
  domainId,
  hostingId,
  vpsId,
  websiteId
}: {
  userId: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT'
  entity: 'USER' | 'DOMAIN' | 'HOSTING' | 'VPS' | 'WEBSITE' | 'SETTING'
  entityId: string
  description: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
  domainId?: string
  hostingId?: string
  vpsId?: string
  websiteId?: string
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description,
        metadata,
        ipAddress,
        userAgent,
        domainId,
        hostingId,
        vpsId,
        websiteId
      }
    })
  } catch (error) {
    // Don't throw error for activity logging failures
    console.error('Failed to log activity:', error)
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return undefined
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(req: Request): string | undefined {
  return req.headers.get('user-agent') || undefined
} 