import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api-adapter'
import { useAuthStore } from './auth'

export interface DashboardStats {
  domains: {
    total: number
    active: number
    expiring: number
    expired: number
  }
  hosting: {
    total: number
    active: number
    expiring: number
    expired: number
  }
  vps: {
    total: number
    active: number
    expiring: number
    expired: number
  }
  websites: {
    total: number
    active: number
    inactive: number
  }
  users: {
    total: number
    active: number
  }
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  entityType: 'DOMAIN' | 'HOSTING' | 'VPS' | 'WEBSITE' | 'USER'
  entityName: string
  entityId: string
  details?: string
  createdAt: string
  ipAddress?: string
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Initialize with default values to prevent empty UI
  const stats = ref<DashboardStats>({
    domains: { total: 0, active: 0, expiring: 0, expired: 0 },
    hosting: { total: 0, active: 0, expiring: 0, expired: 0 },
    vps: { total: 0, active: 0, expiring: 0, expired: 0 },
    websites: { total: 0, active: 0, inactive: 0 },
    users: { total: 0, active: 0 }
  })

  const recentActivity = ref<ActivityLog[]>([])
  const expiringDomains = ref<any[]>([])
  const expiringHosting = ref<any[]>([])
  const expiringVPS = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.getDashboardStats()
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        stats.value = response.data
        error.value = null
      } else {
        throw new Error('Unexpected response format from server')
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err)
      
      // Don't set error for 401 - let the auth system handle it
      if (err.response?.status !== 401) {
        error.value = err.message || 'An error occurred while fetching dashboard stats'
      }
    } finally {
      loading.value = false
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async (limit: number = 5) => {
    try {
      const response = await api.getRecentActivity({ limit })
      
      if (response && response.status === 'success' && response.data) {
        recentActivity.value = response.data?.items || response.data || []
      } else {
        recentActivity.value = []
      }
    } catch (err: any) {
      console.error('Error fetching recent activity:', err)
      
      // Don't set error for 401 - let the auth system handle it
      if (err.response?.status !== 401) {
        console.error('Error fetching recent activity:', err)
      }
      recentActivity.value = []
    }
  }

  // Fetch expiring domains
  const fetchExpiringDomains = async (days: number = 30) => {
    try {
      const response = await api.getExpiringDomains({ days })
      
      if (response && response.status === 'success' && response.data) {
        expiringDomains.value = response.data?.items || response.data || []
      } else {
        expiringDomains.value = []
      }
    } catch (err: any) {
      console.error('Error fetching expiring domains:', err)
      
      // Don't set error for 401 - let the auth system handle it
      if (err.response?.status !== 401) {
        console.error('Error fetching expiring domains:', err)
        expiringDomains.value = []
      }
    }
  }

  // Fetch expiring hosting
  const fetchExpiringHosting = async (days: number = 30) => {
    try {
      console.log('🏠 Fetching expiring hosting...')
      const response = await api.getExpiringHosting({ days })
      
      console.log('📄 Expiring hosting response:', response)
      
      if (response && response.status === 'success' && response.data) {
        expiringHosting.value = response.data?.items || response.data || []
        console.log('✅ Expiring hosting fetched successfully')
      } else {
        console.warn('⚠️ Unexpected response format:', response)
        expiringHosting.value = []
      }
    } catch (err: any) {
      console.error('❌ Error fetching expiring hosting:', err)
      console.error('📋 Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      })
      
      // Don't set error for 401 - let the auth system handle it
      if (err.response?.status !== 401) {
        console.error('Error fetching expiring hosting:', err)
        expiringHosting.value = []
      }
    }
  }

  // Fetch expiring VPS
  const fetchExpiringVPS = async (days: number = 30) => {
    try {
      const response = await api.getExpiringVPS({ days })
      
      if (response && response.status === 'success' && response.data) {
        expiringVPS.value = response.data?.items || response.data || []
      } else {
        expiringVPS.value = []
      }
    } catch (err: any) {
      console.error('Error fetching expiring VPS:', err)
      
      // Don't set error for 401 - let the auth system handle it
      if (err.response?.status !== 401) {
        console.error('Error fetching expiring VPS:', err)
        expiringVPS.value = []
      }
    }
  }

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        // Set error message for user
        error.value = 'Please login to view dashboard data'
        return
      }
      
      // Check if we have a valid user object
      const authStore = useAuthStore()
      
      if (!authStore.user || authStore.user.id === 'unknown') {
        // Try to initialize auth store first
        try {
          await authStore.initialize()
        } catch (error: any) {
          error.value = 'Authentication failed. Please login again.'
          return
        }
        
        // Check again after initialization
        if (!authStore.user || authStore.user.id === 'unknown') {
          error.value = 'User session expired. Please login again.'
          return
        }
      }
      
      // Add retry mechanism with better error handling
      let retryCount = 0
      const maxRetries = 2 // Reduced retries for stability
      
      while (retryCount < maxRetries) {
        try {
          // Use Promise.allSettled instead of Promise.all to prevent one failure from stopping all requests
          const results = await Promise.allSettled([
            fetchDashboardStats(),
            fetchRecentActivity(),
            fetchExpiringDomains(),
            fetchExpiringHosting(),
            fetchExpiringVPS()
          ])
          
          // Check if any requests failed
          const failedRequests = results.filter(result => result.status === 'rejected')
          if (failedRequests.length === 0) {
            // All requests succeeded
            error.value = null // Clear any errors
            break
          } else {
            console.warn(`⚠️ ${failedRequests.length} requests failed, retrying...`)
            retryCount++
            
            if (retryCount >= maxRetries) {
              console.error('❌ Max retries reached, some dashboard data may be incomplete')
              error.value = 'Some data could not be loaded. Please refresh the page.'
              break
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
          }
        } catch (error: any) {
          retryCount++
          console.warn(`❌ Dashboard data fetch attempt ${retryCount} failed:`, error)
          
          if (retryCount >= maxRetries) {
            console.error('❌ All dashboard data fetch attempts failed')
            error.value = 'Failed to load dashboard data. Please try again later.'
            break
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error)
      error.value = 'An unexpected error occurred. Please try again.'
    }
  }

  // Auto-refresh dashboard data
  const startAutoRefresh = (intervalMs: number = 30000) => {
    const interval = setInterval(() => {
      fetchDashboardData()
    }, intervalMs)

    // Return cleanup function
    return () => clearInterval(interval)
  }

  // Computed properties for quick access
  const totalDomains = computed(() => stats.value?.domains?.total || 0)
  const activeDomains = computed(() => stats.value?.domains?.active || 0)
  const expiringDomainsCount = computed(() => stats.value?.domains?.expiring || 0)
  const expiredDomainsCount = computed(() => stats.value?.domains?.expired || 0)

  const totalHosting = computed(() => stats.value?.hosting?.total || 0)
  const activeHosting = computed(() => stats.value?.hosting?.active || 0)
  const expiringHostingCount = computed(() => stats.value?.hosting?.expiring || 0)
  const expiredHostingCount = computed(() => stats.value?.hosting?.expired || 0)

  const totalVPS = computed(() => stats.value?.vps?.total || 0)
  const activeVPS = computed(() => stats.value?.vps?.active || 0)
  const expiringVPSCount = computed(() => stats.value?.vps?.expiring || 0)
  const expiredVPSCount = computed(() => stats.value?.vps?.expired || 0)

  const totalWebsites = computed(() => stats.value?.websites?.total || 0)
  const activeWebsites = computed(() => stats.value?.websites?.active || 0)
  const inactiveWebsites = computed(() => stats.value?.websites?.inactive || 0)

  const totalUsers = computed(() => stats.value?.users?.total || 0)
  const activeUsers = computed(() => stats.value?.users?.active || 0)

  // Combined expiring items for dashboard table
  const allExpiringItems = computed(() => {
    const items: any[] = []
    
    // Add domains with type
    expiringDomains.value.forEach(domain => {
      items.push({
        ...domain,
        type: 'DOMAIN',
        typeLabel: 'Domain',
        name: domain.name,
        provider: domain.registrar,
        expiresAt: domain.expiresAt,
        daysUntilExpiry: domain.daysUntilExpiry,
        status: domain.status,
        icon: '🌐' // Keep emoji for now, will be replaced with SVG
      })
    })
    
    // Add hosting with type
    expiringHosting.value.forEach(hosting => {
      items.push({
        ...hosting,
        type: 'HOSTING',
        typeLabel: 'Hosting',
        name: hosting.name,
        provider: hosting.provider,
        expiresAt: hosting.expiresAt,
        daysUntilExpiry: hosting.daysUntilExpiry,
        status: hosting.status,
        icon: '🏠' // Keep emoji for now, will be replaced with SVG
      })
    })
    
    // Add VPS with type
    expiringVPS.value.forEach(vps => {
      items.push({
        ...vps,
        type: 'VPS',
        typeLabel: 'VPS',
        name: vps.name,
        provider: vps.provider,
        expiresAt: vps.expiresAt,
        daysUntilExpiry: vps.daysUntilExpiry,
        status: vps.status,
        icon: '🖥️' // Keep emoji for now, will be replaced with SVG
      })
    })
    
    // Sort by days until expiry (ascending - most urgent first)
    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  })

  return {
    // State
    stats,
    recentActivity,
    expiringDomains,
    expiringHosting,
    expiringVPS,
    loading,
    error,

    // Actions
    fetchDashboardStats,
    fetchRecentActivity,
    fetchExpiringDomains,
    fetchExpiringHosting,
    fetchExpiringVPS,
    fetchDashboardData,
    startAutoRefresh,

    // Computed
    totalDomains,
    activeDomains,
    expiringDomainsCount,
    expiredDomainsCount,
    totalHosting,
    activeHosting,
    expiringHostingCount,
    expiredHostingCount,
    totalVPS,
    activeVPS,
    expiringVPSCount,
    expiredVPSCount,
    totalWebsites,
    activeWebsites,
    inactiveWebsites,
    totalUsers,
    activeUsers,
    allExpiringItems
  }
}) 