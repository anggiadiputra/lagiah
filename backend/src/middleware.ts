import { NextRequest, NextResponse } from 'next/server'

const allowedOrigins = [
  'http://localhost:5178',
  'http://localhost:5173',
  'https://apps.indexof.id',
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
].filter(Boolean)

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  
  // Determine if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin) || allowedOrigins.some(allowed => allowed === origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflightHeaders = new Headers()
    if (isAllowedOrigin) {
      preflightHeaders.set('Access-Control-Allow-Origin', origin)
    }
    preflightHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    preflightHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    preflightHeaders.set('Access-Control-Max-Age', '86400')
    
    return new NextResponse(null, { status: 204, headers: preflightHeaders })
  }

  // Handle actual requests
  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
} 