import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api-adapter'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isStaff = computed(() => user.value?.role === 'STAFF' || user.value?.role === 'ADMIN')
  const isFinance = computed(() => user.value?.role === 'FINANCE')
  
  // Role-based access control helpers
  const canCreateDomain = computed(() => isAdmin.value || isStaff.value)
  const canCreateHosting = computed(() => isAdmin.value || isStaff.value)
  const canCreateVPS = computed(() => isAdmin.value || isStaff.value)
  const canCreateWebsite = computed(() => isAdmin.value || isStaff.value)
  const canAccessSettings = computed(() => isAdmin.value)
  const canAccessUsers = computed(() => isAdmin.value)
  
  // Domain management access - for viewing modal (ADMIN, STAFF, FINANCE can view)
  const canAccessDomainManagement = computed(() => isAdmin.value || isStaff.value)
  
  // Domain management view access - for viewing modal content (ADMIN, STAFF, FINANCE can view)
  const canViewDomainManagement = computed(() => isAdmin.value || isStaff.value || isFinance.value)
  
  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    
    let retries = 3
    while (retries > 0) {
      try {
        // Attempting login
        const response = await api.post('/auth/login', credentials)
        
        if (response.status === 503 && retries > 1) {
          // Connection error, retrying
          retries--
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        // Login response received
        
        // Handle both response formats
        const responseData = response.data ? response.data : response
        // Response data structure
        // ResponseData.data
        // ResponseData.data.token
        // ResponseData.token
        
        if (responseData.status === 'success' && responseData.user && responseData.token) {
          // Login successful, user loaded
          // Token received
          user.value = responseData.user
          token.value = responseData.token
          
          // Save token to localStorage
          // Token saved to localStorage
          localStorage.setItem('auth_token', responseData.token)
          
          return { status: 'success', user: responseData.user }
        } else {
          // Token is null, cannot save to localStorage
          // Login failed: No token received
          error.value = 'Invalid login response from server'
          return { status: 'error', message: error.value }
        }
      } catch (err: any) {
        // Login error
        if (err.response?.status === 503 && retries > 1) {
          retries--
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        error.value = err.response?.data?.message || err.message || 'Login failed'
        return { status: 'error', message: error.value, error: err }
      }
    }
    
    error.value = 'Service temporarily unavailable. Please try again later.'
    return { status: 'error', message: error.value }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
      clearAuth()
      return { status: 'success' }
    } catch (err: any) {
      // Logout error
      clearAuth()
      return { status: 'error', message: err.message, error: err }
    }
  }

  async function fetchUserProfile() {
    const storedToken = localStorage.getItem('auth_token')
    
    if (!storedToken) {
      // No stored token found, user is not logged in
      return null
    }
    
    try {
      // Fetching user profile with stored token
      const response = await api.get('/auth/me')
      // Profile response received
      
      // Handle both response formats
      const responseData = response.data ? response.data : response
      // Profile response data structure
      
      if (responseData.status === 'success' && responseData.data) {
        // User profile loaded successfully
        user.value = responseData.data
        return responseData.data
      } else {
        // Invalid profile response format
        return null
      }
    } catch (err: any) {
      // Failed to fetch user profile
      return null
    }
  }
  
  // Return store
  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isStaff,
    isFinance,
    
    // Role-based access control helpers
    canCreateDomain,
    canCreateHosting,
    canCreateVPS,
    canCreateWebsite,
    canAccessSettings,
    canAccessUsers,
    canAccessDomainManagement,
    canViewDomainManagement,
    
    // Actions
    login,
    logout,
    initialize
  }
}) 