import { NextRequest } from 'next/server'
import { prisma } from '@/lib/database'
import { successResponse, errorResponse } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { fetchWhoisData } from '@/lib/services/whois'

/**
 * POST /api/v1/domains/[id]/refresh-whois
 * Refreshes the Whois data for a specific domain and updates the database.
 */
async function refreshWhois(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log(`[RefreshWhois] Starting refresh for domain ID: ${id}`)

  try {
    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) {
      return errorResponse('Domain not found', 'NOT_FOUND', 404)
    }

    console.log(`[RefreshWhois] Found domain: ${domain.name}. Fetching new Whois data...`)
    const whoisResult = await fetchWhoisData(domain.name)
    
    if (whoisResult.error || !whoisResult.data) {
      console.warn(`[RefreshWhois] Failed to fetch Whois for ${domain.name}:`, whoisResult.error)
      
      // Check if it's an IP whitelist error
      if (whoisResult.error && whoisResult.error.includes('not whitelisted')) {
        return errorResponse('RDASH API requires IP whitelist. Please contact administrator.', 'IP_WHITELIST_ERROR', 403, {
          details: whoisResult.error,
          suggestion: 'IP address needs to be whitelisted in RDASH dashboard'
        })
      }
      
      return errorResponse('Failed to refresh Whois data', 'WHOIS_ERROR', 500, {
        details: whoisResult.error,
      })
    }
    
    const whoisData = whoisResult.data
    console.log(`[RefreshWhois] Successfully fetched Whois for ${domain.name}.`)

    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: {
        registrar: whoisData.registrar,
        registeredAt: whoisData.registeredAt,
        expiresAt: whoisData.expiresAt,
        nameservers: whoisData.nameservers,
        status: whoisData.status || domain.status,
        whoisData: { ...whoisData.whoisData, refreshedAt: new Date().toISOString() },
        updatedAt: new Date(),
      },
      include: {
        hosting: { select: { id: true, name: true } },
      },
    })
    
    console.log(`[RefreshWhois] Successfully updated domain ${id} in DB.`)
    return successResponse(updatedDomain)

  } catch (error: any) {
    console.error(`[RefreshWhois] Error refreshing Whois for domain ${id}:`, error)
    return errorResponse('An internal server error occurred', 'INTERNAL_SERVER_ERROR', 500)
  }
}

export const POST = withApiMiddleware(
  withMethods(['POST'], withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], refreshWhois))
) 