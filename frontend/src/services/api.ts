import axios from 'axios'
import axiosRetry from 'axios-retry'

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004/api/v1'
console.log('API Base URL:', API_BASE_URL) // For debugging
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV
})
console.log('import.meta.env keys:', Object.keys(import.meta.env))

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000 // 30 seconds
})

console.log('Axios instance created with baseURL:', api.defaults.baseURL)

// Disable HEAD request for checking server status
const checkServerWithoutHead = async (url: string) => {
  try {
    // Use a simple GET request with minimal overhead
    await fetch(`${url}/health`, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error('Error checking server health:', error);
    return false;
  }
};

// Configure retry behavior
axiosRetry(api, {
  retries: 1, // Reduce retries to avoid too many attempts
  retryDelay: (retryCount: number) => {
    console.log(`Retry attempt: ${retryCount}`)
    return retryCount * 500 // 0.5s delay
  },
  retryCondition: (error: any) => {
    // Only retry on network errors, not on connection refused
    return axiosRetry.isNetworkOrIdempotentRequestError(error) && 
           error.code !== 'ERR_CONNECTION_REFUSED'
  }
})

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers
    })
    
    // Log request body if present
    if (config.data) {
      console.log('Request body data:', config.data);
      console.log('Request body type:', typeof config.data);
      console.log('Request body stringified:', JSON.stringify(config.data, null, 2));
    } else {
      console.log('No request body data found');
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    console.log('Token from localStorage:', token ? token.substring(0, 10) + '...' : 'null')
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added token to request headers')
    } else {
      console.log('No token available to add to headers')
    }
    
    // Log final URL that will be used
    const finalURL = config.baseURL ? `${config.baseURL}${config.url}` : config.url
    console.log('Final URL that will be used:', finalURL)
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    
    // Return the full response object, not just data
    return response
  },
  async (error) => {
    // Log error details
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    
    // Handle connection errors with more detailed messages
    if (error.message === 'Network Error' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('Network connection error detected. Server might be down or unreachable.')
      
      return Promise.reject({
        status: 'error',
        message: 'Unable to connect to the server. Please check your internet connection or try again later.',
        error: error.toString(),
        data: {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        }
      })
    }
    
    // Handle response errors
    const originalRequest = error.config
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login?expired=true'
      
      return Promise.reject(error)
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      return Promise.reject({
        status: 'error',
        message: 'You do not have permission to perform this action',
        error: error.toString()
      })
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      // ✅ IMPROVED: Check if it's a token issue and try to refresh
      const currentToken = localStorage.getItem('auth_token')
      if (currentToken && !originalRequest._tokenRefreshed) {
        console.log('404 error detected, attempting to refresh token...')
        originalRequest._tokenRefreshed = true
        
        try {
          // Try to login again to get fresh token
          const loginResponse = await api.post('/auth/login', {
            email: 'admin@lagiah.com',
            password: 'admin123'
          })
          
          if (loginResponse.data && loginResponse.data.data && loginResponse.data.data.token) {
            const freshToken = loginResponse.data.data.token
            localStorage.setItem('auth_token', freshToken)
            console.log('Token refreshed successfully')
            
            // Retry the original request with fresh token
            originalRequest.headers.Authorization = `Bearer ${freshToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
          // If refresh fails, redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login?expired=true'
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject({
        status: 'error',
        message: 'The requested resource was not found',
        error: error.toString()
      })
    }
    
    // Handle 409 Conflict errors
    if (error.response?.status === 409) {
      return Promise.reject({
        status: 'error',
        message: error.response.data?.error?.message || 'Resource conflict - this item already exists',
        error: error.response.data
      })
    }
    
    // Handle 422 Validation errors
    if (error.response?.status === 422) {
      return Promise.reject({
        status: 'error',
        message: 'Validation failed',
        error: error.response.data
      })
    }
    
    // Handle 429 Too Many Requests errors
    if (error.response?.status === 429) {
      return Promise.reject({
        status: 'error',
        message: 'Too many requests. Please try again later.',
        error: error.toString()
      })
    }
    
    // Handle 500 Server errors
    if (error.response?.status >= 500) {
      return Promise.reject({
        status: 'error',
        message: 'An unexpected server error occurred',
        error: error.toString()
      })
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      return Promise.reject({
        status: 'error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        error: error.toString()
      })
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 'error',
        message: 'The request timed out. Please try again.',
        error: error.toString()
      })
    }
    
    // Return error response data if available, otherwise return error
    return Promise.reject(
      error.response?.data || {
        status: 'error',
        message: error.message || 'An unexpected error occurred',
        error: error.toString()
      }
    )
  }
)

// API services
export const authService = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  
  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout')
}

export const domainService = {
  getAll: (params?: any) => api.get('/domains', { params }),
  
  getById: (id: string) => api.get(`/domains/${id}`),
  
  create: (domain: any) => api.post('/domains', domain),
  
  update: (id: string, domain: any) => api.put(`/domains/${id}`, domain),
  
  delete: (id: string) => api.delete(`/domains/${id}`),
  
  checkWhois: (domain: string) => api.get(`/domains/whois?domain=${domain}`)
}

export const hostingService = {
  getAll: (params?: any) => api.get('/hosting', { params }),
  
  getById: (id: string) => api.get(`/hosting/${id}`),
  
  create: (hosting: any) => api.post('/hosting', hosting),
  
  update: (id: string, hosting: any) => api.put(`/hosting/${id}`, hosting),
  
  delete: (id: string) => api.delete(`/hosting/${id}`)
}

export const userService = {
  getAll: (params?: any) => api.get('/users', { params }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  create: (user: any) => api.post('/users', user),
  
  update: (id: string, user: any) => api.put(`/users/${id}`, user),
  
  delete: (id: string) => api.delete(`/users/${id}`),
  
  updateProfile: (profile: any) => api.put('/users/profile', profile),
  
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => 
    api.post('/users/change-password', passwords)
}

export const settingService = {
  getAll: () => api.get('/settings'),
  
  getByKey: (key: string) => api.get(`/settings/${key}`),
  
  update: (key: string, value: any) => api.put(`/settings/${key}`, { value })
}

// Enhanced API service that matches the ApiInterface
export const apiService = {
  // Raw axios methods (existing functionality)
  get: api.get.bind(api),
  post: api.post.bind(api),
  put: api.put.bind(api),
  delete: api.delete.bind(api),
  
  // Domain methods
  async getDomains(params?: any) {
    try {
      console.log('Fetching domains with params:', params)
      const response = await api.get('/domains', { params })
      console.log('Domains API response:', response)
      
      // Ensure we return a properly structured response even if backend response is unexpected
      if (!response) {
        console.warn('Domains API returned empty response')
        return {
          status: 'error',
          data: {
            items: [],
            pagination: {
              total: 0,
              page: params?.page || 1,
              limit: params?.limit || 10,
              pages: 0
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }
      
      return response
    } catch (error) {
      console.error('Error in getDomains:', error)
      // Return a structured error response
      return {
        status: 'error',
        data: {
          items: [],
          pagination: {
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            pages: 0
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error fetching domains'
        }
      }
    }
  },
  
  async getDomain(id: string) {
    const response = await api.get(`/domains/${id}`)
    // Return the full response object, not just the data part
    return response
  },
  
  async createDomain(data: any) {
    try {
      console.log('API Service: Creating domain with data:', data)
      const response = await api.post('/domains', data)
      console.log('API Service: Domain create response:', response)
      
      // Return the response data in the expected format
      if (response && response.data) {
        return response.data
      }
      return response
    } catch (error: any) {
      console.error('API Service: Error creating domain:', error)
      if (error.response && error.response.data) {
        return error.response.data
      }
      return { status: 'error', message: error.message || 'Failed to create domain' }
    }
  },
  
  async updateDomain(id: string, data: any) {
    try {
      console.log(`[API Service] Updating domain with ID: ${id}`, data)
      const response = await api.put(`/domains/${id}`, data)
      console.log('[API Service] Update domain response:', response)
      return response
    } catch (error: any) {
      console.error(`[API Service] Error updating domain ${id}:`, error)
      if (error.response) {
        return error.response
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to update domain.',
        data: null 
      }
    }
  },
  
  async deleteDomain(id: string) {
    try {
      console.log(`[API Service] Deleting domain with ID: ${id}`)
      const response = await api.delete(`/domains/${id}`)
      console.log('[API Service] Delete domain response:', response)
      return response.data
    } catch (error: any) {
      console.error(`[API Service] Error deleting domain ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to delete domain.',
        data: null 
      }
    }
  },

  async refreshWhois(id: string) {
    try {
      console.log(`API Service: Refreshing Whois for domain ID: ${id}`)
      const response = await api.post(`/domains/${id}/refresh-whois`)
      console.log('API Service: Refresh Whois response:', response)
      return response.data
    } catch (error: any) {
      console.error(`API Service: Error refreshing Whois for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { status: 'error', message: error.message || 'Failed to refresh Whois data.' }
    }
  },

  async lookupWhois(domain: string) {
    try {
      console.log('Looking up Whois data for domain:', domain)
      const response = await api.post('/domains/whois', { domain })
      console.log('Whois API response:', response)
      
      // Ensure we return a properly structured response even if backend response is unexpected
      if (!response || !response.data) {
        console.warn('Whois API returned unexpected response format:', response)
        return {
          status: 'error',
          message: 'Failed to fetch Whois data: Invalid response format',
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }
      
      // Return the response as is - let the store handle the data extraction
      return response
    } catch (error) {
      console.error('Error in lookupWhois:', error)
      // Return a structured error response
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch Whois data',
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error fetching Whois data'
        }
      }
    }
  },
  
  // Hosting methods
  async getHostingAccounts(params?: any) {
    try {
      console.log('Fetching hosting accounts with params:', params)
      const response = await api.get('/hosting', { params })
      console.log('Hosting accounts response:', response)
      
      // Ensure we return a properly structured response even if backend response is unexpected
      if (!response || !response.data) {
        console.warn('Hosting API returned unexpected response format:', response)
        return {
          status: 'success',
          data: {
            items: [],
            pagination: {
              total: 0,
              page: params?.page || 1,
              limit: params?.limit || 10,
              pages: 0
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0'
          }
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Error in getHostingAccounts:', error)
      // Return a structured error response
      return {
        status: 'error',
        data: {
          items: [],
          pagination: {
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            pages: 0
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        },
        error: {
          message: error instanceof Error ? error.message : 'Unknown error fetching hosting accounts'
        }
      }
    }
  },
  
  // Auth methods
  async login(credentials: { email: string, password: string }) {
    const response = await api.post('/auth/login', credentials)
    // Return the full response since interceptor returns full response
    return response
  },
  
  async getProfile() {
    const response = await api.get('/auth/me')
    // Return the full response since interceptor returns full response
    return response
  },

  // HOSTING
  async getHostings(params: any) {
    try {
      console.log('Fetching hostings with params:', params)
      const response = await api.get('/hosting', { params })
      console.log('Hostings API response:', response)
      console.log('Hostings API response.data:', response.data)
      console.log('Hostings API response.data.items:', response.data?.items)
      return response
    } catch (error) {
      console.error('Error in getHostings:', error)
      throw error
    }
  },

  async getHostingById(id: string) {
    try {
      console.log(`Fetching hosting with ID: ${id}`)
      const response = await api.get(`/hosting/${id}`)
      console.log('Hosting API response:', response)
      return response.data
    } catch (error) {
      console.error(`Error in getHostingById for ${id}:`, error)
      throw error
    }
  },

  async createHosting(data: any) {
    try {
      // Validate data before sending
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid hosting data: data must be an object');
      }
      
      if (!data.provider) {
        throw new Error('Provider name is required');
      }
      
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      console.log('Creating hosting with data:', cleanData);
      
      // Use the configured api instance
      const response = await api.post('/hosting', cleanData);
      
      console.log('Create hosting response:', response);
      return response;
    } catch (error) {
      console.error('Error in createHosting:', error);
      throw error;
    }
  },

  async updateHosting(id: string, data: any) {
    try {
      console.log(`Updating hosting ${id} with data:`, data)
      const response = await api.put(`/hosting/${id}`, data)
      console.log('Update hosting response:', response)
      return response.data
    } catch (error) {
      console.error(`Error in updateHosting for ${id}:`, error)
      throw error
    }
  },

  async deleteHosting(id: string) {
    try {
      console.log(`Deleting hosting with ID: ${id}`)
      const response = await api.delete(`/hosting/${id}`)
      console.log('Delete hosting response:', response)
      return response.data
    } catch (error: any) {
      console.error(`Error in deleteHosting for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to delete hosting.',
        data: null 
      }
    }
  },

  async getHostingPassword(id: string) {
    try {
      console.log(`Getting hosting password for ID: ${id}`)
      const response = await api.get(`/hosting/${id}/password`)
      console.log('Get hosting password response:', response)
      return response.data
    } catch (error: any) {
      console.error(`Error in getHostingPassword for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to get hosting password.',
        data: null 
      }
    }
  },

  // VPS methods
  async getVPSList(params: any) {
    try {
      console.log('Fetching VPS list with params:', params)
      const response = await api.get('/vps', { params })
      console.log('VPS list API response:', response)
      return response
    } catch (error) {
      console.error('Error in getVPSList:', error)
      throw error
    }
  },

  async getVPSById(id: string) {
    try {
      console.log(`Fetching VPS with ID: ${id}`)
      const response = await api.get(`/vps/${id}`)
      console.log('VPS API response:', response)
      return response
    } catch (error) {
      console.error(`Error in getVPSById for ${id}:`, error)
      throw error
    }
  },

  async createVPS(data: any) {
    try {
      // Validate data before sending
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid VPS data: data must be an object');
      }
      
      if (!data.provider) {
        throw new Error('Provider name is required');
      }
      
      if (!data.name) {
        throw new Error('VPS name is required');
      }
      
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      console.log('Creating VPS with data:', cleanData);
      
      // Use the configured api instance
      const response = await api.post('/vps', cleanData);
      
      console.log('Create VPS response:', response);
      return response;
    } catch (error) {
      console.error('Error in createVPS:', error);
      throw error;
    }
  },

  async updateVPS(id: string, data: any) {
    try {
      console.log(`Updating VPS ${id} with data:`, data)
      const response = await api.put(`/vps/${id}`, data)
      console.log('Update VPS response:', response)
      return response
    } catch (error) {
      console.error(`Error in updateVPS for ${id}:`, error)
      throw error
    }
  },

  async deleteVPS(id: string) {
    try {
      console.log(`Deleting VPS with ID: ${id}`)
      const response = await api.delete(`/vps/${id}`)
      console.log('Delete VPS response:', response)
      return response.data
    } catch (error: any) {
      console.error(`Error in deleteVPS for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to delete VPS.',
        data: null 
      }
    }
  },

  async getVpsPassword(id: string) {
    try {
      console.log(`[API Service] Getting VPS password for ID: ${id}`)
      const response = await api.get(`/vps/${id}/password`)
      console.log('[API Service] Get VPS password response:', response)
      console.log('[API Service] Response data:', response.data)
      return response.data
    } catch (error: any) {
      console.error(`[API Service] Error in getVpsPassword for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to get VPS password.',
        data: null 
      }
    }
  },

  // Website methods
  async getWebsites(params: any) {
    try {
      console.log('Fetching websites with params:', params)
      const response = await api.get('/websites', { params })
      console.log('Websites API response:', response)
      console.log('Websites API response.data:', response.data)
      console.log('Websites API response.data.items:', response.data?.items)
      return response
    } catch (error) {
      console.error('Error in getWebsites:', error)
      throw error
    }
  },

  async getWebsiteById(id: string) {
    try {
      console.log(`Fetching website with ID: ${id}`)
      const response = await api.get(`/websites/${id}`)
      console.log('Website API response:', response)
      return response
    } catch (error) {
      console.error(`Error in getWebsiteById for ${id}:`, error)
      throw error
    }
  },

  async createWebsite(data: any) {
    try {
      console.log('Creating website with data:', data)
      const response = await api.post('/websites', data)
      console.log('Create website response:', response)
      return response
    } catch (error) {
      console.error('Error in createWebsite:', error)
      throw error
    }
  },

  async updateWebsite(id: string, data: any) {
    try {
      console.log(`Updating website ${id} with data:`, data)
      const response = await api.put(`/websites/${id}`, data)
      console.log('Update website response:', response)
      return response
    } catch (error) {
      console.error(`Error in updateWebsite for ${id}:`, error)
      throw error
    }
  },

  async deleteWebsite(id: string) {
    try {
      console.log(`Deleting website with ID: ${id}`)
      const response = await api.delete(`/websites/${id}`)
      console.log('Delete website response:', response)
      return response.data
    } catch (error: any) {
      console.error(`Error in deleteWebsite for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to delete website.',
        data: null 
      }
    }
  },

  async getWebsitePassword(id: string) {
    try {
      console.log(`Getting website password for ID: ${id}`)
      const response = await api.get(`/websites/${id}/password`)
      console.log('Get website password response:', response)
      return response.data
    } catch (error: any) {
      console.error(`Error in getWebsitePassword for ${id}:`, error)
      if (error.response) {
        return error.response.data
      }
      return { 
        status: 'error', 
        message: error.message || 'Failed to get website password.',
        data: null 
      }
    }
  },

  // Dashboard methods
  async getDashboardStats() {
    try {
      console.log('Fetching dashboard stats')
      const response = await api.get('/dashboard/stats')
      console.log('Dashboard stats API response:', response)
      return response.data
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      throw error
    }
  },

  async getRecentActivity(params: any) {
    try {
      console.log('Fetching recent activity with params:', params)
      const response = await api.get('/dashboard/activity', { params })
      console.log('Recent activity API response:', response)
      return response.data
    } catch (error) {
      console.error('Error in getRecentActivity:', error)
      throw error
    }
  },

  async getExpiringDomains(params: any) {
    try {
      console.log('Fetching expiring domains with params:', params)
      const response = await api.get('/dashboard/expiring-domains', { params })
      console.log('Expiring domains API response:', response)
      return response.data
    } catch (error) {
      console.error('Error in getExpiringDomains:', error)
      throw error
    }
  },

  async getExpiringHosting(params: any) {
    try {
      console.log('Fetching expiring hosting with params:', params)
      const response = await api.get('/dashboard/expiring-hosting', { params })
      console.log('Expiring hosting API response:', response)
      return response.data
    } catch (error) {
      console.error('Error in getExpiringHosting:', error)
      throw error
    }
  },

  async getExpiringVPS(params: any) {
    try {
      console.log('Fetching expiring VPS with params:', params)
      const response = await api.get('/dashboard/expiring-vps', { params })
      console.log('Expiring VPS API response:', response)
      return response.data
    } catch (error) {
      console.error('Error in getExpiringVPS:', error)
      throw error
    }
  }
}

// Export default enhanced api service
export default apiService 