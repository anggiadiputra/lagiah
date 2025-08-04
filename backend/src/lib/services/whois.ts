import { DomainStatus } from '@/generated/prisma'

/**
 * Map IANA Registrar ID to registrar name
 */
function getRegistrarNameFromId(id: string): string | null {
  const registrarMap: { [key: string]: string } = {
    '1478': 'PT. Daftar Nama Domain Indonesia (DND-ID)',
    '1479': 'PT. Media Antar Nusa',
    '1480': 'PT. Indosat',
    '1481': 'PT. Telkom Indonesia',
    '1482': 'PT. Cyberindo Aditama',
    '1483': 'PT. Master Web Network',
    '1484': 'PT. Artha Media Networks',
    '1485': 'PT. CBN',
    '1486': 'PT. Link Net',
    '1487': 'PT. First Media',
    '1488': 'PT. Biznet Networks',
    '1489': 'PT. MNC Play Media',
    '1490': 'PT. XL Axiata',
    '1491': 'PT. Hutchison CP Telecommunications',
    '1492': 'PT. Smartfren Telecom',
    '1493': 'PT. Sampoerna Telekomunikasi Indonesia',
    '1494': 'PT. Pasifik Satelit Nusantara',
    '1495': 'PT. Aplikanusa Lintasarta',
    '1496': 'PT. Sigma Cipta Caraka',
    '1497': 'PT. Infokom Elektrindo',
    '1498': 'PT. Mora Telematika Indonesia',
    '1499': 'PT. Mitra Integrasi Informatika',
    '1500': 'PT. Solusi Tunas Pratama',
    // Add more mappings as needed
  }
  
  return registrarMap[id] || null
}

export interface WhoisData {
  registrar?: string
  status?: DomainStatus
  registeredAt?: Date
  expiresAt?: Date
  nameservers?: string[]
  whoisData?: any
  whoisInfo?: {
    registrant?: any
    admin?: any
    tech?: any
    source?: string
  }
}

export interface WhoisResult {
  isAvailable: boolean
  data: WhoisData | null
  error?: string
}

/**
 * Fetch Whois data for a domain.
 * This function now returns an object indicating availability.
 */
export async function fetchWhoisData(domain: string): Promise<WhoisResult> {
  // Fetching Whois data
  
  // Check which service to use - RDAP is now primary
  const useRdap = process.env.USE_RDAP !== 'false' // Default to true unless explicitly disabled
  const useRdash = process.env.USE_RDASH === 'true'
  
  // Priority order: RDAP (primary) -> RDASH -> WHOIS API (fallback)
  if (useRdap) {
    // Using RDAP as primary API
    const rdapResult = await fetchRdapData(domain)
    
    // If RDAP fails or domain not found, try fallback
    if (rdapResult.error || rdapResult.isAvailable) {
      // RDAP failed or domain available, trying fallback
      if (useRdash) {
        return await fetchRdashWhoisData(domain)
      } else {
        return await fetchWhoisApiData(domain)
      }
    }
    
    return rdapResult
  } else if (useRdash) {
    return await fetchRdashWhoisData(domain)
  } else {
    return await fetchWhoisApiData(domain)
  }
}

/**
 * Fetch data using RDAP (Registration Data Access Protocol)
 * Supports multiple TLDs with different RDAP servers
 */
async function fetchRdapData(domain: string): Promise<WhoisResult> {
  // Using RDAP
  
  // Determine RDAP server based on TLD
  const tld = domain.split('.').pop()?.toLowerCase()
  let rdapUrl = ''
  
  switch (tld) {
    case 'com':
    case 'net':
      rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`
      break
    case 'org':
      rdapUrl = `https://rdap.pir.org/rdap/domain/${domain}`
      break
    case 'info':
      rdapUrl = `https://rdap.afilias.net/rdap/domain/${domain}`
      break
    case 'biz':
      rdapUrl = `https://rdap.neustar.biz/rdap/domain/${domain}`
      break
    case 'id':
      rdapUrl = `https://rdap.idnic.id/rdap/domain/${domain}`
      break
    case 'co':
    case 'co.id':
      rdapUrl = `https://rdap.idnic.id/rdap/domain/${domain}`
      break
    case 'cc':
      rdapUrl = `https://rdap.verisign.com/cc/v1/domain/${domain}`
      break
    default:
      // Try Verisign first for unknown TLDs
      rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`
  }
  
  // Using RDAP server
  
  try {
    const response = await fetch(rdapUrl, {
      method: 'GET',
      headers: { 
        'Accept': 'application/rdap+json',
        'User-Agent': 'Lagiah-Domain-Manager/1.0' 
      },
      signal: AbortSignal.timeout(10000), // 10 seconds
    })

    const responseBody = await response.text()

    if (!response.ok) {
      console.warn(`[WhoisService] RDAP for ${domain} returned status ${response.status}: ${responseBody}`)
      if (response.status === 404) {
        return { isAvailable: true, data: null, error: 'Domain not found, likely available.' }
      }
      
      // Try alternative RDAP servers for certain TLDs
      if (tld === 'id' || tld === 'co.id') {
        // Trying alternative RDAP server for .id domain
        const altRdapUrl = `https://rdap.verisign.com/com/v1/domain/${domain}`
        return await fetchAlternativeRdap(altRdapUrl, domain)
      }
      
      return { isAvailable: false, data: null, error: `RDAP failed with status ${response.status}` }
    }
    
    const data = JSON.parse(responseBody)
    // Raw RDAP response received

    if (!data || data.errorCode) {
      // Domain likely available for registration
      return { isAvailable: true, data: null }
    }
    
    const parsedData = parseRdapResponse(data, domain)
    
    if (!parsedData) {
      console.warn(`[WhoisService] Failed to parse RDAP data for ${domain}.`)
      return { isAvailable: false, data: null, error: 'Failed to parse RDAP response.' }
    }
    
    // Successfully fetched and parsed RDAP data
    return { isAvailable: false, data: parsedData }

  } catch (error: any) {
    console.error(`[WhoisService] Error during RDAP fetch for ${domain}:`, error)
    if (error.name === 'AbortError') {
      return { isAvailable: false, data: null, error: 'RDAP request timed out.' }
    }
    return { isAvailable: false, data: null, error: 'An unexpected error occurred while fetching RDAP data.' }
  }
}

/**
 * Fetch data using alternative RDAP server
 */
async function fetchAlternativeRdap(rdapUrl: string, domain: string): Promise<WhoisResult> {
  // Trying alternative RDAP server
  
  try {
    const response = await fetch(rdapUrl, {
      method: 'GET',
      headers: { 
        'Accept': 'application/rdap+json',
        'User-Agent': 'Lagiah-Domain-Manager/1.0' 
      },
      signal: AbortSignal.timeout(10000),
    })

    const responseBody = await response.text()

    if (!response.ok) {
      console.warn(`[WhoisService] Alternative RDAP for ${domain} returned status ${response.status}`)
      return { isAvailable: false, data: null, error: `Alternative RDAP failed with status ${response.status}` }
    }
    
    const data = JSON.parse(responseBody)
    
    if (!data || data.errorCode) {
      return { isAvailable: true, data: null }
    }
    
    const parsedData = parseRdapResponse(data, domain)
    
    if (!parsedData) {
      return { isAvailable: false, data: null, error: 'Failed to parse alternative RDAP response.' }
    }
    
    // Successfully fetched and parsed alternative RDAP data
    return { isAvailable: false, data: parsedData }

  } catch (error: any) {
    console.error(`[WhoisService] Error during alternative RDAP fetch for ${domain}:`, error)
    return { isAvailable: false, data: null, error: 'Alternative RDAP request failed.' }
  }
}

/**
 * Fetch data using WHOIS API (original implementation)
 */
async function fetchWhoisApiData(domain: string): Promise<WhoisResult> {
  // Using WHOIS API
  const whoisApiUrl = process.env.WHOIS_API_URL || 'https://get.indexof.id/api/whois'
  
  try {
    const response = await fetch(`${whoisApiUrl}?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'Lagiah-Domain-Manager/1.0' },
      signal: AbortSignal.timeout(10000), // 10 seconds
    })

    const responseBody = await response.text()

    if (!response.ok) {
      console.warn(`[WhoisService] API for ${domain} returned status ${response.status}: ${responseBody}`)
      if (response.status === 404) {
        return { isAvailable: true, data: null, error: 'Domain not found, likely available.' }
      }
      return { isAvailable: false, data: null, error: `Whois API failed with status ${response.status}` }
    }
    
    const data = JSON.parse(responseBody)
    // Raw API response received

    if (data.success === false || !data.data) {
      // Domain likely available for registration
      return { isAvailable: true, data: null }
    }
    
    const parsedData = parseWhoisResponse(data, domain)
    
    if (!parsedData) {
      console.warn(`[WhoisService] Failed to parse Whois data for ${domain}.`)
      return { isAvailable: false, data: null, error: 'Failed to parse Whois response.' }
    }
    
    // Successfully fetched and parsed Whois data
    return { isAvailable: false, data: parsedData }

  } catch (error: any) {
    console.error(`[WhoisService] Error during fetch for ${domain}:`, error)
    if (error.name === 'AbortError') {
      return { isAvailable: false, data: null, error: 'Whois API request timed out.' }
    }
    return { isAvailable: false, data: null, error: 'An unexpected error occurred while fetching Whois data.' }
  }
}

/**
 * Fetch WHOIS data using RDASH API (WHOIS-Only Implementation)
 * Note: RDASH API requires 2 endpoints for WHOIS data:
 * 1. /domains?domain={domain} - to get domain ID
 * 2. /domains/{domain_id} - to get WHOIS details
 * This is a technical requirement from RDASH API, not our choice.
 */
async function fetchRdashWhoisData(domain: string): Promise<WhoisResult> {
  // Using RDASH API for WHOIS data
  
  const rdashApiUrl = process.env.RDASH_API_URL || 'https://api.rdash.id/v1'
  const resellerId = process.env.RDASH_RESELLER_ID
  const apiKey = process.env.RDASH_API_KEY
  
  if (!resellerId || !apiKey) {
    console.error('[WhoisService] RDASH credentials not configured')
    return { isAvailable: false, data: null, error: 'RDASH API credentials not configured' }
  }
  
  try {
    // Step 1: Search domain to get domain ID (required by RDASH API)
    // Step 1: Searching domain to get domain ID
    const searchResponse = await fetch(`${rdashApiUrl}/domains?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${resellerId}:${apiKey}`).toString('base64')}`,
        'User-Agent': 'Lagiah-Domain-Manager/1.0'
      },
      signal: AbortSignal.timeout(15000), // 15 seconds
    })
    
    if (!searchResponse.ok) {
      console.warn(`[WhoisService] RDASH domain search failed for ${domain}: ${searchResponse.status}`)
      
      // Handle IP whitelist error
      if (searchResponse.status === 422) {
        const errorText = await searchResponse.text();
        if (errorText.includes('not whitelisted')) {
          console.warn(`[WhoisService] IP not whitelisted for RDASH API. Falling back to WHOIS API.`)
          // Fallback to WHOIS API when IP is not whitelisted
          return await fetchWhoisApiData(domain)
        }
      }
      
      if (searchResponse.status === 404) {
        // Domain not found in RDASH (404), falling back to WHOIS API
        // Fallback to WHOIS API when domain not found in RDASH
        const fallbackResult = await fetchWhoisApiData(domain)
        // Fallback result received
        return fallbackResult
      }
      return { isAvailable: false, data: null, error: `RDASH domain search failed: ${searchResponse.status}` }
    }
    
    const searchData = await searchResponse.json()
    
    if (!searchData.success || !searchData.data || searchData.data.length === 0) {
      // Domain not found in RDASH, falling back to WHOIS API
      // Fallback to WHOIS API when domain not found in RDASH
      const fallbackResult = await fetchWhoisApiData(domain)
      // Fallback result received
      return fallbackResult
    }
    
    // Get domain ID from search result
    const domainInfo = searchData.data[0]
    const domainId = domainInfo.id
    // Found domain ID
    
    // Step 2: Get WHOIS details using domain ID (required by RDASH API)
    // Step 2: Fetching WHOIS details for domain ID
    const whoisResponse = await fetch(`${rdashApiUrl}/domains/${domainId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${resellerId}:${apiKey}`).toString('base64')}`,
        'User-Agent': 'Lagiah-Domain-Manager/1.0'
      },
      signal: AbortSignal.timeout(15000),
    })
    
    if (!whoisResponse.ok) {
      console.warn(`[WhoisService] RDASH WHOIS fetch failed for ${domain}: ${whoisResponse.status}`)
      
      // Handle IP whitelist error
      if (whoisResponse.status === 422) {
        const errorText = await whoisResponse.text();
        if (errorText.includes('not whitelisted')) {
          console.warn(`[WhoisService] IP not whitelisted for RDASH API. Falling back to WHOIS API.`)
          // Fallback to WHOIS API when IP is not whitelisted
          return await fetchWhoisApiData(domain)
        }
      }
      
      return { isAvailable: false, data: null, error: `RDASH WHOIS fetch failed: ${whoisResponse.status}` }
    }
    
    const whoisData = await whoisResponse.json()
    
    if (!whoisData.success || !whoisData.data) {
      console.warn(`[WhoisService] Failed to get WHOIS data for ${domain}.`)
      return { isAvailable: false, data: null, error: 'Failed to parse RDASH WHOIS response.' }
    }
    
    // Parse WHOIS data only
    const parsedWhoisData = parseRdashWhoisResponse(whoisData.data, domain)
    
    if (!parsedWhoisData) {
      console.warn(`[WhoisService] Failed to parse WHOIS data for ${domain}.`)
      return { isAvailable: false, data: null, error: 'Failed to parse RDASH WHOIS data.' }
    }
    
    return { isAvailable: false, data: parsedWhoisData }
    
  } catch (error: any) {
    console.error(`[WhoisService] Error during RDASH WHOIS fetch for ${domain}:`, error)
    if (error.name === 'AbortError') {
      return { isAvailable: false, data: null, error: 'RDASH WHOIS request timed out.' }
    }
    return { isAvailable: false, data: null, error: 'An unexpected error occurred while fetching RDASH WHOIS data.' }
  }
}

/**
 * Parse Whois API response into our standard format
 */
function parseWhoisResponse(data: any, domain: string): WhoisData | null {
  try {
    if (!data || !data.success) {
      // No valid data returned for domain
      return null
    }
    
    const whoisInfo = data.data
    if (!whoisInfo) {
      // No whois info in response for domain
      return null
    }
    
    const result: WhoisData = {
      whoisData: data // Store the full response
    }
    
    // Parse registrar
    if (whoisInfo['Registrar Name']) {
      result.registrar = whoisInfo['Registrar Name']
    }
    
    // Parse creation date
    if (whoisInfo['Created On']) {
      result.registeredAt = parseDate(whoisInfo['Created On'])
    }
    
    // Parse expiration date
    if (whoisInfo['Expiration Date']) {
      result.expiresAt = parseDate(whoisInfo['Expiration Date'])
    }
    
    // Parse nameservers
    const nameservers: string[] = []
    for (let i = 1; i <= 10; i++) {
      const ns = whoisInfo[`Nameserver ${i}`]
      if (ns && typeof ns === 'string') {
        nameservers.push(ns)
      }
    }
    if (nameservers.length > 0) {
      result.nameservers = nameservers
    }
    
    // Parse status
    if (whoisInfo['Status']) {
      result.status = parseStatus(whoisInfo['Status'])
    }
    
    // Parsed Whois data successfully
    
    return result
    
  } catch (error) {
    console.error(`Error parsing Whois response for ${domain}:`, error)
    return null
  }
}

/**
 * Parse RDAP response into our standard format
 */
function parseRdapResponse(data: any, domain: string): WhoisData | null {
  try {
    if (!data || data.errorCode) {
      return null
    }
    
    const result: WhoisData = {
      whoisData: data // Store the full RDAP response
    }
    
    // Parse Domain ID (handle) from RDAP
    if (data.handle) {
      // Add Domain ID to the whoisData for display
      if (!result.whoisData.data) {
        result.whoisData.data = {}
      }
      result.whoisData.data['Domain ID'] = data.handle
    }
    
    // Parse registrar from entities
    if (data.entities && Array.isArray(data.entities)) {
      const registrarEntity = data.entities.find((entity: any) => 
        entity.roles && entity.roles.includes('registrar')
      )
      if (registrarEntity) {
        // Try to get registrar name from vcard
        if (registrarEntity.vcardArray) {
          const vcard = registrarEntity.vcardArray[1]
          if (vcard && vcard[3] && vcard[3][3]) {
            result.registrar = vcard[3][3]
          }
        }
        // Also try to get from publicIds
        if (!result.registrar && registrarEntity.publicIds) {
          const ianaId = registrarEntity.publicIds.find((pid: any) => pid.type === 'IANA Registrar ID')
          if (ianaId) {
            // Map IANA ID to registrar name for better user experience
            const registrarName = getRegistrarNameFromId(ianaId.identifier)
            result.registrar = registrarName || `Registrar ID: ${ianaId.identifier}`
          }
        }
      }
    }
    
    // Parse dates from events
    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((event: any) => {
        if (event.eventAction === 'registration') {
          result.registeredAt = parseDate(event.eventDate)
          // Add to whoisData for display
          if (!result.whoisData.data) {
            result.whoisData.data = {}
          }
          result.whoisData.data['Created On'] = event.eventDate
        } else if (event.eventAction === 'expiration') {
          result.expiresAt = parseDate(event.eventDate)
          // Add to whoisData for display
          if (!result.whoisData.data) {
            result.whoisData.data = {}
          }
          result.whoisData.data['Expiration Date'] = event.eventDate
        } else if (event.eventAction === 'last changed') {
          // Add to whoisData for display
          if (!result.whoisData.data) {
            result.whoisData.data = {}
          }
          result.whoisData.data['Last Update On'] = event.eventDate
        }
      })
    }
    
    // Parse nameservers
    if (data.nameservers && Array.isArray(data.nameservers)) {
      result.nameservers = data.nameservers.map((ns: any) => ns.ldhName).filter(Boolean)
      // Add to whoisData for display
      if (!result.whoisData.data) {
        result.whoisData.data = {}
      }
      data.nameservers.forEach((ns: any, index: number) => {
        if (ns.ldhName) {
          result.whoisData.data[`Nameserver ${index + 1}`] = ns.ldhName
        }
      })
    }
    
    // Parse status
    if (data.status && Array.isArray(data.status)) {
      result.status = parseRdapStatus(data.status)
      // Add to whoisData for display
      if (!result.whoisData.data) {
        result.whoisData.data = {}
      }
      result.whoisData.data['Status'] = data.status.join(', ')
    } else {
      result.status = 'ACTIVE'
    }
    
    // Add DNSSEC information
    if (data.secureDNS) {
      if (!result.whoisData.data) {
        result.whoisData.data = {}
      }
      result.whoisData.data['DNSSEC'] = data.secureDNS.delegationSigned ? 'signed' : 'unsigned'
    }
    
    // Parsed RDAP data successfully
    
    return result
    
  } catch (error) {
    console.error(`Error parsing RDAP response for ${domain}:`, error)
    return null
  }
}

/**
 * Parse RDASH WHOIS response into our standard format (WHOIS-Only)
 * Focuses only on WHOIS data, ignoring other domain management features
 */
function parseRdashWhoisResponse(data: any, domain: string): WhoisData | null {
  try {
    if (!data || !data.domain) {
      return null
    }
    
    const result: WhoisData = {
      whoisData: data // Store the full RDASH response
    }
    
    // Parse basic WHOIS information
    if (data.registrar) {
      result.registrar = data.registrar
    }
    
    // Parse WHOIS dates
    if (data.created_at) {
      result.registeredAt = parseDate(data.created_at)
    }
    if (data.expires_at) {
      result.expiresAt = parseDate(data.expires_at)
    }
    
    // Parse WHOIS nameservers (if available)
    if (data.dns && data.dns.nameservers && Array.isArray(data.dns.nameservers)) {
      result.nameservers = data.dns.nameservers
    }
    
    // Parse WHOIS status
    if (data.status) {
      result.status = parseRdashStatus(data.status)
    } else {
      result.status = 'ACTIVE'
    }
    
    // Parse detailed WHOIS contact information (main focus)
    if (data.whois) {
      result.whoisInfo = {
        registrant: data.whois.registrant,
        admin: data.whois.admin,
        tech: data.whois.tech,
        source: 'RDASH API (WHOIS-Only)'
      }
    }
    
    return result
    
  } catch (error) {
    console.error(`Error parsing RDASH WHOIS response for ${domain}:`, error)
    return null
  }
}

/**
 * Parse date string into Date object
 */
function parseDate(dateStr: string | Date): Date | undefined {
  if (!dateStr) return undefined
  
  if (dateStr instanceof Date) return dateStr
  
  try {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

/**
 * Parse domain status into our enum
 */
function parseStatus(status: string | string[]): DomainStatus {
  if (!status) return 'ACTIVE'
  
  const statusStr = Array.isArray(status) ? status[0] : status
  const lowerStatus = statusStr.toLowerCase()
  
  if (lowerStatus.includes('expired')) return 'EXPIRED'
  if (lowerStatus.includes('suspended')) return 'SUSPENDED'
  if (lowerStatus.includes('transferred')) return 'TRANSFERRED'
  if (lowerStatus.includes('deleted')) return 'DELETED'
  
  return 'ACTIVE'
}

/**
 * Parse RDAP status into our enum
 */
function parseRdapStatus(status: string[]): DomainStatus {
  if (!status || status.length === 0) return 'ACTIVE'
  
  const statusStr = status[0].toLowerCase()
  
  if (statusStr.includes('expired')) return 'EXPIRED'
  if (statusStr.includes('suspended')) return 'SUSPENDED'
  if (statusStr.includes('transferred')) return 'TRANSFERRED'
  if (statusStr.includes('deleted')) return 'DELETED'
  if (statusStr.includes('pending')) return 'ACTIVE' // Map pending to ACTIVE since PENDING is not in enum
  
  return 'ACTIVE'
}

/**
 * Parse RDASH status into our enum
 */
function parseRdashStatus(status: string): DomainStatus {
  if (!status) return 'ACTIVE'
  
  const statusStr = status.toLowerCase()
  
  if (statusStr.includes('expired') || statusStr === 'expired') return 'EXPIRED'
  if (statusStr.includes('suspended') || statusStr === 'suspended') return 'SUSPENDED'
  if (statusStr.includes('transferred') || statusStr === 'transferred') return 'TRANSFERRED'
  if (statusStr.includes('deleted') || statusStr === 'deleted') return 'DELETED'
  if (statusStr.includes('pending') || statusStr === 'pending') return 'ACTIVE' // Map pending to ACTIVE
  
  return 'ACTIVE'
}

/**
 * Get domain expiration status based on expiry date
 */
export function getDomainExpirationStatus(expiresAt: Date): {
  status: 'active' | 'expiring_soon' | 'expired'
  daysUntilExpiry: number
} {
  const now = new Date()
  const diffTime = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return { status: 'expired', daysUntilExpiry: diffDays }
  } else if (diffDays <= 30) {
    return { status: 'expiring_soon', daysUntilExpiry: diffDays }
  } else {
    return { status: 'active', daysUntilExpiry: diffDays }
  }
} 