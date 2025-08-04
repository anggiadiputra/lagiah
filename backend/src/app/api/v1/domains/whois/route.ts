import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils'
import { withApiMiddleware, withMethods, withRoles } from '@/middleware/api-middleware'
import { fetchWhoisData, getDomainExpirationStatus } from '@/lib/services/whois'
import { z } from 'zod'

// Validation schema for domain lookup
const whoisLookupSchema = z.object({
  domain: z.string().min(3, 'Domain name must be at least 3 characters'),
})

/**
 * Simple check if domain is available by attempting to fetch Whois data
 */
async function isDomainAvailable(domain: string): Promise<boolean> {
  try {
    const whoisResult = await fetchWhoisData(domain)
    
    // If no Whois data or data indicates domain is available, return true
    if (!whoisResult || !whoisResult.data) {
      return true
    }
    
    // Check if the domain status indicates it's available
    const whoisData = whoisResult.data
    const statusString = String(whoisData.status || '').toLowerCase()
    const whoisStatus = String(whoisData.whoisData?.Status || '').toLowerCase()
    const whoisDataStatus = String(whoisData.whoisData?.data?.Status || '').toLowerCase()
    
    if (statusString === 'available' || whoisStatus === 'available' || whoisDataStatus === 'available') {
      return true
    }
    
    // If domain has registrar info, it's likely registered
    if (whoisData.registrar && whoisData.registrar !== 'N/A') {
      return false
    }
    
    // If domain has registration/expiry dates, it's likely registered
    if (whoisData.registeredAt || whoisData.expiresAt) {
      return false
    }
    
    // Default to available if we can't determine
    return true
  } catch (error) {
    console.error(`Error checking domain availability for ${domain}:`, error)
    // If there's an error, assume domain is available
    return true
  }
}

/**
 * POST /api/v1/domains/whois
 * Fetch Whois data for a domain manually
 */
async function lookupWhoisData(req: NextRequest) {
  const body = await req.json()
  
  // Validate request body
  const result = whoisLookupSchema.safeParse(body)
  if (!result.success) {
    return errorResponse('Invalid domain name', 'VALIDATION_ERROR', 400, result.error.issues)
  }
  
  const { domain } = result.data
  
  // Manual Whois lookup requested
  
  try {
    // Fetch Whois data first
    const whoisResult = await fetchWhoisData(domain)
    
    // Check if domain is available
    const isAvailable = await isDomainAvailable(domain)
    
    if (isAvailable) {
      return successResponse({
        domain,
        isAvailable: true,
        message: 'Domain is available for registration',
        data: {
          status: 'AVAILABLE_TO_ORDER',
          registrar: null,
          registeredAt: null,
          expiresAt: null,
          nameservers: null,
          whoisInfo: null,
          fetchedAt: new Date().toISOString(),
          source: 'whois_lookup',
          'Domain Name': domain,
          'Status': 'Available to Order',
          'Registrar Name': 'N/A',
          'DNSSEC': 'N/A'
        }
      })
    }
    
    // Domain is registered, return detailed Whois data
    if (!whoisResult || !whoisResult.data) {
      return errorResponse(
        'Unable to fetch Whois data for this domain. The domain may not exist or the Whois service is unavailable.',
        'WHOIS_UNAVAILABLE',
        404
      )
    }
    
    const whoisData = whoisResult.data
    
    return successResponse({
      domain,
      isAvailable: false,
      message: 'Whois data retrieved successfully',
      data: {
        registrar: whoisData.registrar,
        registeredAt: whoisData.registeredAt,
        expiresAt: whoisData.expiresAt,
        nameservers: whoisData.nameservers,
        status: whoisData.status || 'ACTIVE',
        // Include sanitized version of full whois data
        whoisInfo: whoisData.whoisData ? {
          registrantName: whoisData.whoisData.registrantName,
          registrantOrganization: whoisData.whoisData.registrantOrganization,
          adminEmail: whoisData.whoisData.adminEmail,
          techEmail: whoisData.whoisData.techEmail,
          status: whoisData.whoisData.status,
        } : null,
        // Add frontend-expected properties
        fetchedAt: new Date().toISOString(),
        updated_date: whoisData.registeredAt?.toISOString(),
        dnssec: whoisData.whoisData?.DNSSEC || 'unsigned',
        source: 'indexof.id',
        // Include raw WHOIS data for frontend access
        'Domain ID': whoisData.whoisData?.data?.['Domain ID'] || whoisData.whoisData?.['Domain ID'] || 'N/A',
        'Domain Name': whoisData.whoisData?.data?.['Domain Name'] || whoisData.whoisData?.['Domain Name'] || domain,
        'Created On': whoisData.whoisData?.data?.['Created On'] || whoisData.whoisData?.['Created On'] || whoisData.registeredAt?.toISOString(),
        'Last Update On': whoisData.whoisData?.data?.['Last Update On'] || whoisData.whoisData?.['Last Update On'] || whoisData.registeredAt?.toISOString(),
        'Expiration Date': whoisData.whoisData?.data?.['Expiration Date'] || whoisData.whoisData?.['Expiration Date'] || whoisData.expiresAt?.toISOString(),
        'Status': whoisData.whoisData?.data?.Status || whoisData.whoisData?.Status || whoisData.status || 'ACTIVE',
        'Registrar Name': whoisData.whoisData?.data?.['Registrar Name'] || whoisData.whoisData?.['Registrar Name'] || whoisData.registrar,
        'DNSSEC': whoisData.whoisData?.data?.DNSSEC || whoisData.whoisData?.DNSSEC || 'unsigned',
        // Include nameservers in the expected format
        ...Object.fromEntries(
          Object.entries(whoisData.whoisData?.data || whoisData.whoisData || {})
            .filter(([key]) => key.startsWith('Nameserver '))
        )
      }
    })
    
  } catch (error) {
    console.error(`Error during Whois lookup for ${domain}:`, error)
    return errorResponse(
      'Failed to fetch Whois data. Please try again later.',
      'WHOIS_ERROR',
      500
    )
  }
}

// Export handler with middleware
export const POST = withApiMiddleware(
  withMethods(['POST'], 
    withRoles(['ADMIN', 'STAFF', 'FINANCE', 'VIEWER'], lookupWhoisData)
  )
) 