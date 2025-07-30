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
    
    try {
      // Call the real API through adapter
      console.log('Attempting login with:', credentials.email)
      
      // Add retry logic for network errors
      let retries = 3;
      let response;
      
      while (retries > 0) {
        try {
          response = await api.login(credentials);
          break; // If successful, exit the retry loop
        } catch (err: any) {
          if (err.message === 'Unable to connect to the server. Please check your internet connection.' && retries > 1) {
            console.log(`Connection error, retrying... (${retries-1} attempts left)`);
            retries--;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw err; // Re-throw if not a connection error or no retries left
          }
        }
      }
      
      console.log('Login response:', response)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      console.log('Response data structure:', responseData)
      console.log('ResponseData.data:', responseData.data)
      console.log('ResponseData.data.token:', responseData.data?.token)
      console.log('ResponseData.token:', responseData.token)
      
      // Check if response has token (backend success indicator)
      // API returns: { status: 'success', data: { user: {...}, token: '...' } }
      // But response interceptor already extracts data, so we get: { user: {...}, token: '...' }
      if (responseData && responseData.token) {
        // Set user and token from API response
        user.value = responseData.user
        token.value = responseData.token
        
        console.log('Login successful, user:', responseData.user)
        console.log('Token received:', responseData.token ? 'yes' : 'no')
        
        // Store token in localStorage
        if (token.value) {
          localStorage.setItem('auth_token', token.value)
          console.log('Token saved to localStorage')
        } else {
          console.error('Token is null, cannot save to localStorage')
        }
        
        return { success: true }
      } else {
        error.value = 'Login failed'
        console.error('Login failed: No token received')
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    
    try {
      // Clear state
      user.value = null
      token.value = null
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_remember')
      
      // No need to clear axios defaults since we're using API adapter
      
      return { success: true }
    } catch (err: any) {
      console.error('Logout error:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function initialize() {
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedToken) {
      token.value = storedToken
      
      try {
        // Fetch user data from API
        console.log('Fetching user profile with stored token')
        const response = await api.getProfile()
        console.log('Profile response:', response)
        
        // Handle both response formats (direct data or nested in response.data)
        const responseData = response.data ? response.data : response
        
        console.log('Profile response data structure:', responseData)
        
        // Check if we got user data
        // API returns: { status: 'success', data: { user: {...} } }
        // But response interceptor already extracts data, so we get: { user: {...} }
        if (responseData && responseData.user) {
          user.value = responseData.user
          console.log('User profile loaded successfully')
        } else {
          console.error('Invalid profile response format:', responseData)
          // Token is invalid, clear it
          await logout()
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        // Token is invalid, clear it
        await logout()
      }
    } else {
      console.log('No stored token found, user is not logged in')
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