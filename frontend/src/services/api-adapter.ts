/**
 * API Adapter - Switches between real API and mock API
 */

import { apiService } from './api'
import mockApiService from './mock-api'

// Define interfaces for API responses and parameters
export interface ApiResponse<T> {
  status: string
  data: T
  meta: {
    timestamp: string
    version: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Define API interface to ensure both implementations match
export interface ApiInterface {
  // Domains
  getDomains(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getDomain(id: string): Promise<ApiResponse<any>>
  createDomain(data: any): Promise<ApiResponse<any>>
  updateDomain(id: string, data: any): Promise<ApiResponse<any>>
  deleteDomain(id: string): Promise<ApiResponse<any>>
  refreshWhois(id: string): Promise<ApiResponse<any>>
  lookupWhois(domain: string): Promise<ApiResponse<any>>
  
  // Hosting
  getHostingAccounts(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getHostings(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getHostingById(id: string): Promise<ApiResponse<any>>
  createHosting(data: any): Promise<ApiResponse<any>>
  updateHosting(id: string, data: any): Promise<ApiResponse<any>>
  deleteHosting(id: string): Promise<ApiResponse<any>>
  getHostingPassword(id: string): Promise<ApiResponse<any>>
  
  // VPS
  getVPSList(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getVPSById(id: string): Promise<ApiResponse<any>>
  createVPS(data: any): Promise<ApiResponse<any>>
  updateVPS(id: string, data: any): Promise<ApiResponse<any>>
  deleteVPS(id: string): Promise<ApiResponse<any>>
  getVpsPassword(id: string): Promise<ApiResponse<any>>
  
  // Website
  getWebsites(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getWebsiteById(id: string): Promise<ApiResponse<any>>
  createWebsite(data: any): Promise<ApiResponse<any>>
  updateWebsite(id: string, data: any): Promise<ApiResponse<any>>
  deleteWebsite(id: string): Promise<ApiResponse<any>>
  getWebsitePassword(id: string): Promise<ApiResponse<any>>
  
  // Dashboard
  getDashboardStats(): Promise<ApiResponse<any>>
  getRecentActivity(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getExpiringDomains(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getExpiringHosting(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  getExpiringVPS(params?: any): Promise<ApiResponse<PaginatedResponse<any>>>
  
  // Auth
  login(credentials: { email: string, password: string }): Promise<ApiResponse<any>>
  getProfile(): Promise<ApiResponse<any>>
}

// Configuration - Use environment variable or hardcoded value as fallback
// For development without backend, set USE_MOCK_API to true
const USE_MOCK_API = false // Use real backend API

// Export the selected API service based on configuration
const api = USE_MOCK_API ? mockApiService : apiService

// Log which API is being used
// console.log(`Using ${USE_MOCK_API ? 'MOCK' : 'REAL'} API`)

// Define API functions
const getDomains = (params?: any) => api.getDomains(params)
const getDomain = (id: string) => api.getDomain(id)
const createDomain = (data: any) => api.createDomain(data)
const updateDomain = (id: string, data: any) => api.updateDomain(id, data)
const deleteDomain = (id: string) => api.deleteDomain(id)
const refreshWhois = (id: string) => api.refreshWhois(id)
const lookupWhois = (domain: string) => api.lookupWhois(domain)

const getHostingAccounts = (params?: any) => api.getHostings(params)
const getHostings = (params?: any) => api.getHostings(params)
const getHostingById = (id: string) => api.getHosting(id)
const createHosting = (data: any) => api.createHosting(data)
const updateHosting = (id: string, data: any) => api.updateHosting(id, data)
const deleteHosting = (id: string) => api.deleteHosting(id)
const getHostingPassword = (id: string) => api.getHostingPassword(id)

const getVPSList = (params?: any) => api.getVPS(params)
const getVPSById = (id: string) => api.getVPSById(id)
const createVPS = (data: any) => api.createVPS(data)
const updateVPS = (id: string, data: any) => api.updateVPS(id, data)
const deleteVPS = (id: string) => api.deleteVPS(id)
const getVpsPassword = (id: string) => api.getVPSPassword(id)

const getWebsites = (params?: any) => api.getWebsites(params)
const getWebsiteById = (id: string) => api.getWebsite(id)
const createWebsite = (data: any) => api.createWebsite(data)
const updateWebsite = (id: string, data: any) => api.updateWebsite(id, data)
const deleteWebsite = (id: string) => api.deleteWebsite(id)
const getWebsitePassword = (id: string) => api.getWebsitePassword(id)

const getDashboardStats = () => api.getDashboardStats()
const getRecentActivity = (params?: any) => api.getRecentActivity(params)
const getExpiringDomains = (params?: any) => api.getExpiringDomains(params)
const getExpiringHosting = (params?: any) => api.getExpiringHosting(params)
const getExpiringVPS = (params?: any) => api.getExpiringVPS(params)

const login = (credentials: { email: string, password: string }) => api.login(credentials)
const getProfile = () => api.getProfile()

// Export default object
export default {
  getDomains,
  getDomain,
  createDomain,
  updateDomain,
  deleteDomain,
  refreshWhois, // Export refreshWhois
  lookupWhois,
  getHostingAccounts,
  login,
  getProfile,
  getHostings,
  getHostingById,
  createHosting,
  updateHosting,
  deleteHosting,
  getHostingPassword,
  getVPSList,
  getVPSById,
  createVPS,
  updateVPS,
  deleteVPS,
  getVpsPassword,
  getWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  getWebsitePassword,
  getDashboardStats,
  getRecentActivity,
  getExpiringDomains,
  getExpiringHosting,
  getExpiringVPS,
} 