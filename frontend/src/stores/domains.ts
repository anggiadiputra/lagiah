import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api-adapter'

export interface Domain {
  id: string
  name: string
  registrar: string | null
  status: string
  registeredAt: string | null
  expiresAt: string | null
  nameservers: string[]
  notes: string | null

  createdAt: string
  updatedAt: string
  createdBy: string
  hostingId: string | null
  vpsId: string | null
  domainHosting: string | null
  isMainDomain: boolean
  whoisData?: any
  // Add relational fields that are included in API responses
  hosting?: { id: string; name: string; provider: string } | null
  vps?: { id: string; name: string; provider: string } | null
  websites?: { id: string; url: string }[]
}

export interface WhoisData {
  domain_name: string
  registrar: string
  whois_server: string
  referral_url: string
  updated_date: string
  creation_date: string
  expiration_date: string
  name_servers: string[]
  status: string[]
  emails?: string[]
  dnssec?: string
  fetchedAt: string
  source: string
  // Add support for nested data structure from API
  data?: {
    'Domain ID'?: string
    'Domain Name'?: string
    'Created On'?: string
    'Last Update On'?: string
    'Expiration Date'?: string
    'Status'?: string
    'Registrar Name'?: string
    'DNSSEC'?: string
    [key: string]: any // For nameserver fields like "Nameserver 1", "Nameserver 2", etc.
  }
}

export interface DomainFilter {
  status?: string
  registrar?: string
  search?: string
  page: number
  limit: number
  sort?: string
}

export const useDomainStore = defineStore('domains', () => {
  // State
  const domains = ref<Domain[]>([])
  const currentDomain = ref<Domain | null>(null)
  const whoisData = ref<WhoisData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const allDomains = ref<Domain[]>([]) // For selectors
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })
  const filters = ref<DomainFilter>({
    page: 1,
    limit: 10
  })

  // Actions
  async function fetchDomains(params: Record<string, any> = {}) {
    loading.value = true
    error.value = null
    
    try {
      // Merge params with current filters
      const queryParams = { ...filters.value, ...params }
      
      const response = await api.getDomains(queryParams)
      
      // Handle error responses
      if (response && typeof response === 'object' && 'status' in response && response.status === 'error') {
        console.error('API returned error:', response)
        error.value = (response as any).message || 'Server error'
        domains.value = []
        pagination.value = { total: 0, page: 1, limit: 10, pages: 0 }
        return
      }
      
      // Handle successful responses
      if (response && response.status === 'success' && response.data && response.data.items) {
        if (queryParams.limit && queryParams.limit > 100) { // Assuming a large limit means fetching all
          allDomains.value = response.data.items
          
        } else {
          domains.value = response.data.items
          // Update pagination from API response
          if (response.data.pagination) {
            pagination.value = {
              total: response.data.pagination.total || 0,
              page: response.data.pagination.page || 1,
              limit: response.data.pagination.limit || 10,
              pages: response.data.pagination.pages || 1
            }
          } else {
            // Fallback pagination calculation
            pagination.value = {
              total: domains.value.length,
              page: queryParams.page || 1,
              limit: queryParams.limit || 10,
              pages: Math.ceil(domains.value.length / (queryParams.limit || 10))
            }
          }
          
          // Update filters with current query params
          filters.value = { ...filters.value, ...queryParams }
          
          // Pagination and filters updated successfully
        }
      } else {
        console.error('Invalid API response format:', response)
        error.value = 'Invalid response format from server'
        domains.value = []
        pagination.value = { total: 0, page: 1, limit: 10, pages: 0 }
      }
    } catch (err: any) {
      console.error('Error fetching domains:', err)
      
      // Handle different types of errors
      if (err.status === 'error' && err.message) {
        error.value = err.message
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch domains'
      }
      
      // Check if it's a timeout error
      if (err.message && err.message.includes('timeout')) {
        error.value = 'Request timed out. Please try again.'
        console.warn('⚠️ Using fallback data due to timeout')
        // Use fallback data for timeout errors
        domains.value = getFallbackDomains()
        pagination.value = { total: domains.value.length, page: 1, limit: 10, pages: 1 }
      } else {
        // Set empty data on other errors
        domains.value = []
        pagination.value = { total: 0, page: 1, limit: 10, pages: 0 }
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchDomain(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getDomain(id)
      currentDomain.value = response.data
      return response
    } catch (err: any) {
      console.error('Error fetching domain:', err)
      error.value = err.message || 'Failed to fetch domain'
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  async function createDomain(domainData: Partial<Domain>) {
    loading.value = true
    error.value = null
    
    try {
      // Ensure status is set to ACTIVE if not provided
      if (!domainData.status) {
        domainData.status = 'ACTIVE';
      }
      
      const response = await api.createDomain(domainData)
  
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        domains.value.unshift(response.data)
    
        return response
      } else {
        console.warn('[DomainStore] Unexpected response format:', response)
        const errorMessage = response?.message || 'Failed to create domain'
        error.value = errorMessage
        return { status: 'error', message: errorMessage, data: null }
      }
    } catch (err: any) {
      console.error('Error creating domain:', err)
      error.value = err.message || 'Failed to create domain'
      return { status: 'error', message: error.value, error: err, data: null }
    } finally {
      loading.value = false
    }
  }

  async function updateDomain(id: string, domainData: Partial<Domain>) {
    loading.value = true
    error.value = null
    
    try {
  
      const response = await api.updateDomain(id, domainData)
  
      
      // Check if response is valid
      if (response && response.status === 'success' && response.data) {
        // Update the domain in the list if successful
        const index = domains.value.findIndex(d => d.id === id)
        if (index !== -1) {
          domains.value[index] = { ...domains.value[index], ...response.data }
        }
        
        // Update current domain if it's the one being edited
        if (currentDomain.value && currentDomain.value.id === id) {
          currentDomain.value = { ...currentDomain.value, ...response.data }
        }
        
        // Also update in allDomains if it exists there
        const allIndex = allDomains.value.findIndex(d => d.id === id)
        if (allIndex !== -1) {
          allDomains.value[allIndex] = { ...allDomains.value[allIndex], ...response.data }
        }
        
        return response
      } else {
        const errorMessage = response?.message || 'Failed to update domain'
        console.error('[DomainStore] Update failed:', response)
        error.value = errorMessage
        return { status: 'error', message: errorMessage, data: null }
      }
    } catch (err: any) {
      console.error('[DomainStore] Error updating domain:', err)
      error.value = err.message || 'Failed to update domain'
      return { status: 'error', message: error.value, error: err, data: null }
    } finally {
      loading.value = false
    }
  }

  async function deleteDomain(id: string) {
    loading.value = true
    error.value = null

    
    try {
      const response = await api.deleteDomain(id)
  
      
      if (response && response.status === 'success') {
        // Remove the domain from the local state directly
        const initialCount = domains.value.length
        domains.value = domains.value.filter(d => d.id !== id)
    
        
        // Also clear currentDomain if it was the one deleted
        if (currentDomain.value && currentDomain.value.id === id) {
          currentDomain.value = null
        }
        return response
      } else {
        const errorMessage = 'Failed to delete domain.'
        console.error(`[DomainStore] Delete failed:`, response) // Log the whole response
        error.value = errorMessage
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      console.error('[DomainStore] CATCH block - Error deleting domain:', err)
      error.value = err.message || 'An unexpected error occurred.'
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  async function fetchWhoisData(domain: string) {
    loading.value = true
    error.value = null
    whoisData.value = null
    
    try {
  
      const response = await api.lookupWhois(domain)
  
      
      // Check if response is valid and has the expected format
      if (response && response.status === 'success' && response.data) {
        // The Whois data is in response.data.data (nested structure)
        if (response.data.data) {
          whoisData.value = response.data.data
        } else {
          whoisData.value = response.data
        }
        return response
      } else if (response && response.data && response.data.data) {
        // Alternative format where data is nested
        whoisData.value = response.data.data
        return response
      } else {
        console.error('Domain store: Invalid Whois response format', response)
        error.value = 'Failed to fetch Whois data'
        return response
      }
    } catch (err: any) {
      console.error('Error fetching Whois data:', err)
      error.value = err.message || 'Failed to fetch Whois data'
      return { status: 'error', message: error.value, error: err, data: null }
    } finally {
      loading.value = false
    }
  }

  async function refreshWhoisData(id: string) {
    loading.value = true
    error.value = null

    
    try {
      const response = await api.refreshWhois(id)
  

      if (response && response.status === 'success' && response.data) {
        // Update the domain in the main list
        const index = domains.value.findIndex(d => d.id === id)
        if (index !== -1) {
          domains.value[index] = response.data
      
        }
        
        // Update the current domain if it's the one being viewed
        if (currentDomain.value && currentDomain.value.id === id) {
          currentDomain.value = response.data
      
        }
        
        return response
      } else {
        const errorMessage = response?.message || 'Failed to refresh Whois data.'
        console.error(`[DomainStore] Refresh failed:`, errorMessage)
        error.value = errorMessage
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      console.error('[DomainStore] CATCH block - Error refreshing Whois:', err)
      error.value = err.message || 'An unexpected error occurred.'
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
  
    }
  }

  function setFilters(newFilters: Partial<DomainFilter>) {
    // Update filters
    filters.value = { ...filters.value, ...newFilters }
    
    // Reset page to 1 when filters change (except when explicitly setting page)
    if (newFilters.status !== undefined || newFilters.search !== undefined || newFilters.sort !== undefined) {
      filters.value.page = 1
    }
    

  }

  function clearCurrentDomain() {
    currentDomain.value = null
  }

  // Fallback domains for when API is unavailable
  function getFallbackDomains(): Domain[] {
    return [
      {
        id: '1',
        name: 'example.com',
        registrar: 'GoDaddy',
        status: 'ACTIVE',
        registeredAt: '2023-01-15T00:00:00.000Z',
        expiresAt: '2025-01-15T00:00:00.000Z',
        nameservers: ['ns1.example.com', 'ns2.example.com'],
        notes: 'Sample domain (fallback data)',
    
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-01-15T00:00:00.000Z',
        createdBy: 'system',
        hostingId: null,
        vpsId: null,
        domainHosting: null,
        isMainDomain: false,
        whoisData: null
      },
      {
        id: '2',
        name: 'google.com',
        registrar: 'MarkMonitor Inc.',
        status: 'ACTIVE',
        registeredAt: '1997-09-15T04:00:00.000Z',
        expiresAt: '2028-09-14T04:00:00.000Z',
        nameservers: ['ns1.google.com', 'ns2.google.com', 'ns3.google.com', 'ns4.google.com'],
        notes: 'Sample domain (fallback data)',
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-01-15T00:00:00.000Z',
        createdBy: 'system',
        hostingId: null,
        vpsId: null,
        domainHosting: null,
        isMainDomain: false,
        whoisData: { source: 'fallback' }
      },
      {
        id: '3',
        name: 'github.com',
        registrar: 'MarkMonitor Inc.',
        status: 'ACTIVE',
        registeredAt: '2007-10-09T00:00:00.000Z',
        expiresAt: '2026-10-09T00:00:00.000Z',
        nameservers: ['dns1.p08.nsone.net', 'dns2.p08.nsone.net'],
        notes: 'Sample domain (fallback data)',
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-01-15T00:00:00.000Z',
        createdBy: 'system',
        hostingId: null,
        vpsId: null,
        domainHosting: null,
        isMainDomain: false,
        whoisData: { source: 'fallback' }
      }
    ]
  }

  return {
    // State
    domains,
    allDomains,
    currentDomain,
    whoisData,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    fetchDomains,
    fetchDomain,
    createDomain,
    updateDomain,
    deleteDomain,
    fetchWhoisData,
    refreshWhoisData,
    setFilters,
    clearCurrentDomain
  }
}) 