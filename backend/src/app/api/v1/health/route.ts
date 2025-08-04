import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/utils'
import { withApiMiddleware } from '@/middleware/api-middleware'

/**
 * GET /api/v1/health
 * Health check endpoint for the API
 */
async function healthCheck(req: NextRequest) {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is running'
  })
}

// Export handler with middleware
export const GET = withApiMiddleware(healthCheck) 