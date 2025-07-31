import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

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
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isStaff = computed(() => user.value?.role === 'STAFF')
  const isFinance = computed(() => user.value?.role === 'FINANCE')

  // Role-based access control helpers
  const canCreateDomain = computed(() => isAdmin.value || isStaff.value)
  const canCreateHosting = computed(() => isAdmin.value || isStaff.value)
  const canCreateVPS = computed(() => isAdmin.value || isStaff.value)
  const canCreateWebsite = computed(() => isAdmin.value || isStaff.value)
  const canAccessSettings = computed(() => isAdmin.value)
  const canAccessUsers = computed(() => isAdmin.value || isStaff.value)
  const canAccessDomainManagement = computed(() => isAdmin.value || isStaff.value)
  const canViewDomainManagement = computed(() => isAdmin.value || isStaff.value || isFinance.value)

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    
    let retries = 3
    while (retries > 0) {
      try {
        // Attempting login using apiService
        const responseData = await apiService.login(credentials)
        
        if (responseData.status === 'success' && responseData.data) {
          const { user: userData, token: userToken } = responseData.data
          
          if (userData && userToken) {
            // Login successful, user loaded
            // Token received
            user.value = userData
            token.value = userToken
            
            // Save token to localStorage
            // Token saved to localStorage
            localStorage.setItem('auth_token', userToken)
            
            return { status: 'success', user: userData }
          } else {
            // Missing user or token in response
            error.value = 'Invalid response format from server'
            return { status: 'error', message: error.value }
          }
        } else {
          // Login failed: No success status
          error.value = responseData.error?.message || 'Invalid login response from server'
          return { status: 'error', message: error.value }
        }
      } catch (err: any) {
        // Login error
        if (err.message === 'Network Error' && retries > 1) {
          retries--
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        
        error.value = err.message || 'Login failed'
        return { status: 'error', message: error.value, error: err }
      }
    }
    
    error.value = 'Service temporarily unavailable. Please try again later.'
    return { status: 'error', message: error.value }
  }

  async function logout() {
    try {
      // Clear auth state
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
      const responseData = await apiService.getProfile()
      
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

  async function initialize() {
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      token.value = storedToken
      
      try {
        // Fetch user data from API
        const userData = await fetchUserProfile()
        if (userData) {
          user.value = userData
        } else {
          // Token is invalid, clear it
          await logout()
        }
      } catch (err) {
        // Token is invalid, clear it
        await logout()
      }
    }
  }

  function clearAuth() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_remember')
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
    initialize,
    clearAuth
  }
}) 