import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
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
  const lastProfileFetch = ref<number>(0)
  const profileCacheDuration = 30 * 60 * 1000 // 30 minutes cache (lebih lama)
  const isInitialized = ref<boolean>(false)

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
    
    try {
      // Use fetch directly to bypass any axios interceptor issues
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004'
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 'success' && responseData.data) {
        const { user: userData, token: userToken } = responseData.data
        
        if (userData && userToken) {
          // Login successful, user loaded
          user.value = userData
          token.value = userToken
          isInitialized.value = true
          lastProfileFetch.value = Date.now()
          
          // Save token to localStorage
          localStorage.setItem('auth_token', userToken)
          
          console.log('Login successful, auth store initialized')
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
      console.error('Login error:', err)
      error.value = err.message || 'Login failed'
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
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
      return null
    }
    
    // Check cache first - lebih agresif
    const now = Date.now()
    if (user.value && (now - lastProfileFetch.value) < profileCacheDuration) {
      console.log('Using cached user profile')
      return user.value
    }
    
    // Prevent multiple simultaneous requests
    if (loading.value) {
      console.log('Profile fetch already in progress, waiting...')
      // Wait for current request to complete
      return new Promise((resolve) => {
        const checkComplete = () => {
          if (!loading.value) {
            resolve(user.value)
          } else {
            setTimeout(checkComplete, 100)
          }
        }
        checkComplete()
      })
    }
    
    loading.value = true
    
    try {
      console.log('Fetching user profile from API...')
      // Use apiService instead of hardcoded URL
      const response = await apiService.getProfile()
      
      if (response && response.status === 'success' && response.data) {
        // Backend returns { user: {...}, recentActivity: [...] }
        // We need to extract the user object
        const userData = response.data.user || response.data
        
        if (userData && userData.id) {
          // User profile loaded successfully
          user.value = userData
          lastProfileFetch.value = now
          console.log('User profile cached successfully')
          return userData
        } else {
          // Invalid user data
          return null
        }
      } else {
        // Invalid profile response format
        return null
      }
    } catch (err: any) {
      // Failed to fetch user profile
      
      // Check if it's a 401 error (unauthorized)
      if (err.response?.status === 401) {
        clearAuth()
        return null
      }
      
      // For other errors, don't return fallback user object
      // This prevents API calls with invalid token
      return null
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    // Prevent multiple initializations
    if (isInitialized.value) {
      console.log('Auth store already initialized')
      return
    }
    
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      token.value = storedToken
      
      try {
        // Fetch user data from API
        const userData = await fetchUserProfile()
        if (userData) {
          user.value = userData
          isInitialized.value = true
          console.log('Auth store initialized successfully')
        }
      } catch (err) {
        // Don't logout immediately, just keep the token
        // This might be a temporary network issue
        console.warn('Failed to initialize auth store:', err)
      }
    }
  }

  function clearAuth() {
    user.value = null
    token.value = null
    error.value = null
    isInitialized.value = false
    lastProfileFetch.value = 0
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_remember')
    console.log('Auth cleared, reset initialization state')
  }
  
  // Return store
  return {
    // State
    user,
    token,
    loading,
    error,
    isInitialized,
    
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