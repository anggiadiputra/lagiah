/**
 * Mock API Service
 * Use this when backend is unavailable or for development
 */

import { v4 as uuidv4 } from 'uuid'

// Mock data storage
const mockData = {
  domains: [
    {
      id: '1',
      name: 'example.com',
      registrar: null, // Will be populated from WHOIS data
      status: 'ACTIVE',
      registeredAt: '2023-01-15T00:00:00.000Z',
      expiresAt: '2024-01-15T00:00:00.000Z',

      nameservers: ['ns1.example.com', 'ns2.example.com'],
      notes: 'Company main website',
  
      createdAt: '2023-01-10T00:00:00.000Z',
      updatedAt: '2023-06-20T00:00:00.000Z',
      createdBy: '1',
      hostingId: '1',
      whoisData: {
        domain_name: 'example.com',
        registrar: null, // Will be populated from WHOIS lookup
        whois_server: 'whois.example.com',
        referral_url: 'http://www.example.com',
        updated_date: '2023-06-20T00:00:00.000Z',
        creation_date: '2023-01-15T00:00:00.000Z',
        expiration_date: '2024-01-15T00:00:00.000Z',
        name_servers: ['ns1.example.com', 'ns2.example.com'],
        status: ['clientDeleteProhibited', 'clientRenewProhibited', 'clientTransferProhibited', 'clientUpdateProhibited'],
        fetchedAt: '2023-06-20T00:00:00.000Z',
        source: 'mock-data'
      }
    },
    {
      id: '2',
      name: 'testdomain.org',
      registrar: null, // Will be populated from WHOIS data
      status: 'EXPIRING_SOON',
      registeredAt: '2022-07-10T00:00:00.000Z',
      expiresAt: '2023-08-10T00:00:00.000Z',

      nameservers: ['dns1.namecheaphosting.com', 'dns2.namecheaphosting.com'],
      notes: 'Test website',
  
      createdAt: '2022-07-05T00:00:00.000Z',
      updatedAt: '2023-05-15T00:00:00.000Z',
      createdBy: '1',
      hostingId: '2',
      whoisData: null
    }
  ],
  hosting: [
    {
      id: '1',
      name: 'Main Hosting',
      provider: 'Hostinger',
      type: 'SHARED',
      status: 'ACTIVE',
      expiresAt: '2024-03-15T00:00:00.000Z',
  
      notes: 'Main hosting account',
      createdAt: '2023-01-05T00:00:00.000Z',
      updatedAt: '2023-01-05T00:00:00.000Z',
      createdBy: '1'
    },
    {
      id: '2',
      name: 'Secondary Hosting',
      provider: 'SiteGround',
      type: 'SHARED',
      status: 'ACTIVE',
      expiresAt: '2024-05-20T00:00:00.000Z',
  
      notes: 'For client projects',
      createdAt: '2023-02-10T00:00:00.000Z',
      updatedAt: '2023-02-10T00:00:00.000Z',
      createdBy: '1'
    }
  ],
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@lagiah.com',
      role: 'ADMIN'
    }
  ]
}

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API service
export const mockApiService = {
  // Domains
  async getDomains(params: any = {}) {
    await delay()
    const { page = 1, limit = 10, status } = params
    
    let filteredDomains = [...mockData.domains]
    
    if (status) {
      filteredDomains = filteredDomains.filter(domain => domain.status === status)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDomains = filteredDomains.slice(startIndex, endIndex)
    
    return {
      status: 'success',
      data: {
        items: paginatedDomains,
        pagination: {
          total: filteredDomains.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(filteredDomains.length / limit)
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async getDomain(id: string) {
    await delay()
    const domain = mockData.domains.find(d => d.id === id)
    
    if (!domain) {
      return {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Domain not found'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    }
    
    return {
      status: 'success',
      data: domain,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async createDomain(domainData: any) {
    await delay(800) // Longer delay to simulate processing
    
    // Generate mock Whois data - registrar will be populated from actual WHOIS lookup
    const whoisData = {
      domain_name: domainData.name,
      registrar: domainData.registrar || null, // Will be populated from WHOIS lookup
      whois_server: 'whois.example.com',
      referral_url: 'http://www.example.com',
      updated_date: new Date().toISOString(),
      creation_date: domainData.registeredAt || new Date().toISOString(),
      expiration_date: domainData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      name_servers: domainData.nameservers || ['ns1.example.com', 'ns2.example.com'],
      status: ['clientTransferProhibited'],
      fetchedAt: new Date().toISOString(),
      source: 'mock-data'
    }
    
    const newDomain = {
      id: uuidv4(),
      ...domainData,
      status: domainData.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1', // Assuming current user
      whoisData: domainData.fetchWhois ? whoisData : null
    }
    
    mockData.domains.push(newDomain)
    
    return {
      status: 'success',
      data: newDomain,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async updateDomain(id: string, domainData: any) {
    await delay()
    const index = mockData.domains.findIndex(d => d.id === id)
    
    if (index === -1) {
      return {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Domain not found'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    }
    
    const updatedDomain = {
      ...mockData.domains[index],
      ...domainData,
      updatedAt: new Date().toISOString()
    }
    
    mockData.domains[index] = updatedDomain
    
    return {
      status: 'success',
      data: updatedDomain,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async deleteDomain(id: string) {
    await delay()
    const index = mockData.domains.findIndex(d => d.id === id)
    
    if (index === -1) {
      return {
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: 'Domain not found'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    }
    
    mockData.domains.splice(index, 1)
    
    return {
      status: 'success',
      data: { message: 'Domain deleted successfully' },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async lookupWhois(domain: string) {
    await delay(1200) // Longer delay to simulate external API call
    
    // Simulate real WHOIS data without hardcoded registrar names
    // In real implementation, this would come from actual WHOIS API
    const mockRegistrar = domain.includes('.id') ? 'PT. Daftar Nama Domain Indonesia (DND-ID)' : 
                         domain.includes('.com') ? 'GoDaddy.com, LLC' :
                         domain.includes('.org') ? 'Public Interest Registry' :
                         domain.includes('.net') ? 'VeriSign Global Registry Services' : null
    
    return {
      status: 'success',
      data: {
        domain_name: domain,
        registrar: mockRegistrar,
        whois_server: `whois.${domain.split('.').pop()}.com`,
        referral_url: mockRegistrar ? `http://www.${mockRegistrar.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null,
        updated_date: new Date().toISOString(),
        creation_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        name_servers: [`ns1.${domain.split('.').pop()}.com`, `ns2.${domain.split('.').pop()}.com`],
        status: ['clientTransferProhibited'],
        emails: mockRegistrar ? [`abuse@${domain.split('.').pop()}.com`, `support@${domain.split('.').pop()}.com`] : [],
        dnssec: 'unsigned',
        fetchedAt: new Date().toISOString(),
        source: 'mock-whois-api'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  // Hosting
  async getHostingAccounts(params: any = {}) {
    await delay()
    const { page = 1, limit = 10, status } = params
    
    let filteredHosting = [...mockData.hosting]
    
    if (status) {
      filteredHosting = filteredHosting.filter(hosting => hosting.status === status)
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedHosting = filteredHosting.slice(startIndex, endIndex)
    
    return {
      status: 'success',
      data: {
        items: paginatedHosting,
        pagination: {
          total: filteredHosting.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(filteredHosting.length / limit)
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  // Auth
  async login(credentials: { email: string, password: string }) {
    await delay(800)
    
    if (credentials.email === 'admin@lagiah.com' && credentials.password === 'admin123') {
      return {
        status: 'success',
        data: {
          user: {
            id: '1',
            name: 'Admin User',
            email: 'admin@lagiah.com',
            role: 'ADMIN'
          },
          token: 'mock-jwt-token-for-development-only'
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    }
    
    return {
      status: 'error',
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  },
  
  async getProfile() {
    await delay()
    
    return {
      status: 'success',
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@lagiah.com',
          role: 'ADMIN',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }
}

export default mockApiService 