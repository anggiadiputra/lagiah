import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api-adapter'

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
    loading.value = true
    error.value = null
    try {
      const response = await api.getDashboardStats()
      
      if (response && response.status === 'success') {
        stats.value = response.data
      } else {
        throw new Error(response?.message || 'Failed to fetch dashboard stats')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching dashboard stats'
      console.error('[DashboardStore] Error fetching stats:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async (limit: number = 5) => {
    try {
      const response = await api.getRecentActivity({ limit })
      
      if (response && response.status === 'success') {
        recentActivity.value = response.data?.items || []
      } else {
        throw new Error(response?.message || 'Failed to fetch recent activity')
      }
    } catch (err: any) {
      console.error('[DashboardStore] Error fetching recent activity:', err)
    }
  }

  // Fetch expiring domains
  const fetchExpiringDomains = async (days: number = 30) => {
    try {
      const response = await api.getExpiringDomains({ days })
      
      if (response && response.status === 'success') {
        expiringDomains.value = response.data?.items || []
      } else {
        throw new Error(response?.message || 'Failed to fetch expiring domains')
      }
    } catch (err: any) {
      console.error('[DashboardStore] Error fetching expiring domains:', err)
      console.error('[DashboardStore] Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })
      // Set empty array to prevent UI errors
      expiringDomains.value = []
    }
  }

  // Fetch expiring hosting
  const fetchExpiringHosting = async (days: number = 30) => {
    try {
      const response = await api.getExpiringHosting({ days })
      
      if (response && response.status === 'success') {
        expiringHosting.value = response.data?.items || []
      } else {
        throw new Error(response?.message || 'Failed to fetch expiring hosting')
      }
    } catch (err: any) {
      console.error('[DashboardStore] Error fetching expiring hosting:', err)
    }
  }

  // Fetch expiring VPS
  const fetchExpiringVPS = async (days: number = 30) => {
    try {
      const response = await api.getExpiringVPS({ days })
      
      if (response && response.status === 'success') {
        expiringVPS.value = response.data?.items || []
      } else {
        throw new Error(response?.message || 'Failed to fetch expiring VPS')
      }
    } catch (err: any) {
      console.error('[DashboardStore] Error fetching expiring VPS:', err)
      console.error('[DashboardStore] Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })
      // Set empty array to prevent UI errors
      expiringVPS.value = []
    }
  }

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivity(),
      fetchExpiringDomains(),
      fetchExpiringHosting(),
      fetchExpiringVPS()
    ])
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
  const totalDomains = computed(() => stats.value.domains.total)
  const activeDomains = computed(() => stats.value.domains.active)
  const expiringDomainsCount = computed(() => stats.value.domains.expiring)
  const expiredDomainsCount = computed(() => stats.value.domains.expired)

  const totalHosting = computed(() => stats.value.hosting.total)
  const activeHosting = computed(() => stats.value.hosting.active)
  const expiringHostingCount = computed(() => stats.value.hosting.expiring)
  const expiredHostingCount = computed(() => stats.value.hosting.expired)

  const totalVPS = computed(() => stats.value.vps.total)
  const activeVPS = computed(() => stats.value.vps.active)
  const expiringVPSCount = computed(() => stats.value.vps.expiring)
  const expiredVPSCount = computed(() => stats.value.vps.expired)

  const totalWebsites = computed(() => stats.value.websites.total)
  const activeWebsites = computed(() => stats.value.websites.active)
  const inactiveWebsites = computed(() => stats.value.websites.inactive)

  const totalUsers = computed(() => stats.value.users.total)
  const activeUsers = computed(() => stats.value.users.active)

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