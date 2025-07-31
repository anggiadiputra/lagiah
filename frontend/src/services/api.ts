import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// Retry function
async function retryRequest(fn: () => Promise<any>, retryCount = 0): Promise<any> {
  try {
    return await fn()
  } catch (error) {
    if (retryCount < MAX_RETRIES && axios.isAxiosError(error) && error.response?.status && error.response.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
      return retryRequest(fn, retryCount + 1)
    }
    throw error
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config as any
    
    // Handle 401 Unauthorized - try to refresh token
    if (axios.isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Clear invalid token
        localStorage.removeItem('auth_token')
        
        // Redirect to login
        window.location.href = '/login?expired=true'
        return Promise.reject(error)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// API Service
export const apiService = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    return await retryRequest(() => api.post('/auth/login', credentials))
  },

  getProfile: async () => {
    return await retryRequest(() => api.get('/auth/me'))
  },

  // Domains
  getDomains: async (params?: any) => {
    return await retryRequest(() => api.get('/domains', { params }))
  },

  getDomain: async (id: string) => {
    return await retryRequest(() => api.get(`/domains/${id}`))
  },

  createDomain: async (data: any) => {
    return await retryRequest(() => api.post('/domains', data))
  },

  updateDomain: async (id: string, data: any) => {
    return await retryRequest(() => api.put(`/domains/${id}`, data))
  },

  deleteDomain: async (id: string) => {
    return await retryRequest(() => api.delete(`/domains/${id}`))
  },

  refreshWhois: async (id: string) => {
    return await retryRequest(() => api.post(`/domains/${id}/refresh-whois`))
  },

  lookupWhois: async (domain: string) => {
    return await retryRequest(() => api.get(`/domains/whois?domain=${encodeURIComponent(domain)}`))
  },

  // Hosting
  getHostings: async (params?: any) => {
    return await retryRequest(() => api.get('/hosting', { params }))
  },

  getHosting: async (id: string) => {
    return await retryRequest(() => api.get(`/hosting/${id}`))
  },

  createHosting: async (data: any) => {
    return await retryRequest(() => api.post('/hosting', data))
  },

  updateHosting: async (id: string, data: any) => {
    return await retryRequest(() => api.put(`/hosting/${id}`, data))
  },

  deleteHosting: async (id: string) => {
    return await retryRequest(() => api.delete(`/hosting/${id}`))
  },

  getHostingPassword: async (id: string) => {
    return await retryRequest(() => api.get(`/hosting/${id}/password`))
  },

  // VPS
  getVPS: async (params?: any) => {
    return await retryRequest(() => api.get('/vps', { params }))
  },

  getVPSById: async (id: string) => {
    return await retryRequest(() => api.get(`/vps/${id}`))
  },

  createVPS: async (data: any) => {
    return await retryRequest(() => api.post('/vps', data))
  },

  updateVPS: async (id: string, data: any) => {
    return await retryRequest(() => api.put(`/vps/${id}`, data))
  },

  deleteVPS: async (id: string) => {
    return await retryRequest(() => api.delete(`/vps/${id}`))
  },

  getVPSPassword: async (id: string) => {
    return await retryRequest(() => api.get(`/vps/${id}/password`))
  },

  // Websites
  getWebsites: async (params?: any) => {
    return await retryRequest(() => api.get('/websites', { params }))
  },

  getWebsite: async (id: string) => {
    return await retryRequest(() => api.get(`/websites/${id}`))
  },

  createWebsite: async (data: any) => {
    return await retryRequest(() => api.post('/websites', data))
  },

  updateWebsite: async (id: string, data: any) => {
    return await retryRequest(() => api.put(`/websites/${id}`, data))
  },

  deleteWebsite: async (id: string) => {
    return await retryRequest(() => api.delete(`/websites/${id}`))
  },

  getWebsitePassword: async (id: string) => {
    return await retryRequest(() => api.get(`/websites/${id}/password`))
  },

  // Dashboard
  getDashboardStats: async () => {
    return await retryRequest(() => api.get('/dashboard/stats'))
  },

  getRecentActivity: async (params?: any) => {
    return await retryRequest(() => api.get('/dashboard/activity', { params }))
  },

  getExpiringDomains: async (params?: any) => {
    return await retryRequest(() => api.get('/dashboard/expiring-domains', { params }))
  },

  getExpiringHosting: async (params?: any) => {
    return await retryRequest(() => api.get('/dashboard/expiring-hosting', { params }))
  },

  getExpiringVPS: async (params?: any) => {
    return await retryRequest(() => api.get('/dashboard/expiring-vps', { params }))
  },

  // Users
  getUsers: async (params?: any) => {
    return await retryRequest(() => api.get('/users', { params }))
  },

  getUser: async (id: string) => {
    return await retryRequest(() => api.get(`/users/${id}`))
  },

  createUser: async (data: any) => {
    return await retryRequest(() => api.post('/users', data))
  },

  updateUser: async (id: string, data: any) => {
    return await retryRequest(() => api.put(`/users/${id}`, data))
  },

  deleteUser: async (id: string) => {
    return await retryRequest(() => api.delete(`/users/${id}`))
  },

  // Settings
  getSettings: async (category?: string) => {
    return await retryRequest(() => api.get('/settings', { params: { category } }))
  },

  updateSettings: async (data: any) => {
    return await retryRequest(() => api.put('/settings', data))
  },

  // WhatsApp
  testWhatsApp: async (data: any) => {
    return await retryRequest(() => api.post('/whatsapp/test', data))
  },
}

export default api 