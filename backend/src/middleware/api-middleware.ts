import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/utils'
import { verifyJwtToken } from '@/lib/auth/jwt'
import { UserRole } from '@/generated/prisma'

export const withApiMiddleware = (handler: Function) => {
  return async (req: NextRequest, context: any) => {
    try {
      return await handler(req, context)
    } catch (error: any) {
      // API Middleware Error
      return errorResponse(
        'An internal server error occurred',
        'INTERNAL_SERVER_ERROR',
        500
      )
    }
  }
}

export const withMethods = (allowedMethods: string[], handler: Function) => {
  return async (req: NextRequest, context: any) => {
    if (!allowedMethods.includes(req.method!)) {
      return errorResponse(`Method ${req.method} Not Allowed`, 'METHOD_NOT_ALLOWED', 405)
    }
    return handler(req, context)
  }
}

export const withRoles = (allowedRoles: UserRole[], handler: Function) => {
  return async (req: NextRequest, context: any) => {
    try {
      // Check if req.headers exists
      if (!req || !req.headers) {
        // Request or headers is undefined
        return errorResponse('Invalid request', 'BAD_REQUEST', 400)
      }

      const authHeader = req.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse('Unauthorized: Missing token', 'UNAUTHORIZED', 401)
      }

      const token = authHeader.substring(7)
      const user = verifyJwtToken(token)
      if (!user || !allowedRoles.includes(user.role)) {
        return errorResponse('Forbidden', 'FORBIDDEN', 403)
      }

      // Clone the request and add user headers
      const newReq = req.clone()
      newReq.headers.set('x-user-id', user.id)
      newReq.headers.set('x-user-role', user.role)
      newReq.headers.set('x-user-email', user.email)
      
      return handler(newReq, context)
    } catch (error) {
      // withRoles Error
      return errorResponse('Unauthorized: Invalid token', 'UNAUTHORIZED', 401)
    }
  }
} 