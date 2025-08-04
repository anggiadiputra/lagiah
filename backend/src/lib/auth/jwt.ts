import jwt from 'jsonwebtoken'
import { UserRole } from '@/generated/prisma'

// JWT payload type
type JwtPayload = {
  id: string
  email: string
  role: UserRole
  isActive: boolean
}

/**
 * Sign a JWT token with the given payload (synchronous)
 */
export function signJwtToken(payload: JwtPayload): string {
  const secret = process.env.NEXTAUTH_SECRET
  
  if (!secret) {
    // JWT_SECRET is not defined in environment variables
    throw new Error('JWT secret is not configured.')
  }
  
  try {
    return jwt.sign(payload, secret, {
      expiresIn: '30d', // 30 days
    })
  } catch (error) {
    if (error instanceof Error) {
      // Error signing JWT token
    } else {
      // An unknown error occurred while signing JWT token
    }
    throw new Error('Failed to sign JWT token.')
  }
}

/**
 * Verify and decode a JWT token (synchronous)
 */
export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET
    
    if (!secret) {
      // JWT_SECRET is not defined in environment variables
      throw new Error('JWT secret is not configured.')
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (error) {
    if (error instanceof Error) {
      // We expect errors here if the token is invalid or expired
      // JWT verification failed
    } else {
      // An unknown JWT verification error occurred
    }
    return null
  }
}

/**
 * Get JWT token from Authorization header
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.split(' ')[1]
} 