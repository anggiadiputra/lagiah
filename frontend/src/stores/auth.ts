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
      console.log('🔐 Attempting login...')
      
      // Use fetch directly to bypass any axios interceptor issues
      const response = await fetch('http://localhost:3004/api/v1/auth/login', {
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
      console.log('📨 Login response:', responseData)
      
      if (responseData.status === 'success' && responseData.data) {
        const { user: userData, token: userToken } = responseData.data
        
        if (userData && userToken) {
          // Login successful, user loaded
          console.log('✅ Login successful, setting user data')
          user.value = userData
          token.value = userToken
          
          // Save token to localStorage
          console.log('💾 Saving token to localStorage')
          localStorage.setItem('auth_token', userToken)
          
          console.log('👤 User state updated:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          })
          
          return { status: 'success', user: userData }
        } else {
          // Missing user or token in response
          console.error('❌ Invalid response format - missing user or token')
          error.value = 'Invalid response format from server'
          return { status: 'error', message: error.value }
        }
      } else {
        // Login failed: No success status
        console.error('❌ Login failed:', responseData.error?.message)
        error.value = responseData.error?.message || 'Invalid login response from server'
        return { status: 'error', message: error.value }
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
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
      console.log('❌ No stored token found, cannot fetch user profile')
      return null
    }
    
    try {
      console.log('📞 Fetching user profile from API...')
      // Use apiService instead of hardcoded URL
      const response = await apiService.getProfile()
      
      console.log('📨 Profile response:', response)
      console.log('📄 Response.data:', response?.data)
      console.log('📄 Response.status:', response?.status)
      
      if (response && response.status === 'success' && response.data) {
        // Backend returns { user: {...}, recentActivity: [...] }
        // We need to extract the user object
        const userData = response.data.user || response.data
        
        console.log('👤 Extracted user data:', userData)
        
        if (userData && userData.id) {
          // User profile loaded successfully
          console.log('✅ User profile loaded successfully:', userData)
          user.value = userData
          return userData
        } else {
          // Invalid user data
          console.warn('❌ Invalid user data in response - missing id')
          console.warn('❌ User data:', userData)
          return null
        }
      } else {
        // Invalid profile response format
        console.warn('❌ Invalid profile response format')
        console.warn('❌ Response:', response)
        console.warn('❌ Response.data:', response?.data)
        console.warn('❌ Response.status:', response?.status)
        return null
      }
    } catch (err: any) {
      // Failed to fetch user profile
      console.warn('❌ Failed to fetch user profile:', err.message)
      
      // Check if it's a 401 error (unauthorized)
      if (err.response?.status === 401) {
        console.warn('🔒 Token is invalid, clearing auth')
        clearAuth()
        return null
      }
      
      // For other errors, don't return fallback user object
      // This prevents API calls with invalid token
      return null
    }
  }

  async function initialize() {
    console.log('🔄 Initializing auth store...')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      console.log('🔑 Found stored token, setting token value')
      token.value = storedToken
      
      try {
        console.log('👤 Fetching user profile...')
        // Fetch user data from API
        const userData = await fetchUserProfile()
        if (userData) {
          console.log('✅ User profile loaded successfully')
          user.value = userData
        } else {
          // Don't logout immediately, just keep the token
          // User might still be authenticated
          console.warn('⚠️ Could not fetch user profile, but keeping token')
        }
      } catch (err) {
        // Don't logout immediately, just keep the token
        // This might be a temporary network issue
        console.warn('⚠️ Error during auth initialization:', err)
      }
    } else {
      console.log('❌ No stored token found')
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