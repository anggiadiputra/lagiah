import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    
    console.log('🔍 [AUTH] Starting login process with credentials:', credentials)
    
    try {
      console.log('🔍 [AUTH] Using fetch directly to bypass axios issues')
      
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
      
      console.log('🔍 [AUTH] Fetch response status:', response.status);
      console.log('🔍 [AUTH] Fetch response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      console.log('🔍 [AUTH] Response data:', responseData);
      
      if (responseData.status === 'success' && responseData.data) {
        console.log('🔍 [AUTH] Success status and data found')
        
        const { user: userData, token: userToken } = responseData.data
        
        console.log('🔍 [AUTH] Extracted user data:', userData)
        console.log('🔍 [AUTH] Extracted token:', userToken ? 'Token exists' : 'No token')
        
        if (userData && userToken) {
          console.log('🔍 [AUTH] Both user and token found, setting values')
          
          // Login successful, user loaded
          // Token received
          user.value = userData
          token.value = userToken
          
          // Save token to localStorage
          // Token saved to localStorage
          localStorage.setItem('auth_token', userToken)
          
          console.log('🔍 [AUTH] Login successful, returning success')
          return { status: 'success', user: userData }
        } else {
          console.log('🔍 [AUTH] Missing user or token in response')
          // Missing user or token in response
          error.value = 'Invalid response format from server'
          return { status: 'error', message: error.value }
        }
      } else {
        console.log('🔍 [AUTH] No success status or data, error:', responseData.error)
        // Login failed: No success status
        error.value = responseData.error?.message || 'Invalid login response from server'
        return { status: 'error', message: error.value }
      }
    } catch (err: any) {
      console.log('🔍 [AUTH] Login error caught:', err)
      console.log('🔍 [AUTH] Error message:', err.message)
      
      error.value = err.message || 'Login failed'
      console.log('🔍 [AUTH] Setting error value:', error.value)
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
      // No stored token found, user is not logged in
      return null
    }
    
    try {
      // Fetching user profile with stored token
      const response = await fetch('http://localhost:3004/api/v1/auth/me', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        return null
      }
      
      const responseData = await response.json();
      
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