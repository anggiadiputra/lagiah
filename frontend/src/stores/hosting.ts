import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api-adapter'
import type { Hosting, Pagination } from '@/types'

export const useHostingStore = defineStore('hosting', () => {
  const hostings = ref<Hosting[]>([])
  const currentHosting = ref<Hosting | null>(null)
  const pagination = ref<Pagination | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchHostings = async (params: Record<string, any> = {}) => {
    loading.value = true
    error.value = null
    try {
      // Fetching hostings with params
      const response = await api.getHostings(params)
              // Raw API response received
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        // Setting hostings data
        hostings.value = response.data?.items || []
        pagination.value = response.data?.pagination || null
        // Hostings loaded successfully
      } else {
        // Response not successful
        throw new Error(response?.message || 'Failed to fetch hostings.')
      }
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred.'
      // Error fetching hostings
    } finally {
      loading.value = false
    }
  }

  // Alias for fetchHostingList to maintain consistent naming
  const fetchHostingAccounts = fetchHostings

  // Get hosting password (unmasked)
  async function getHostingPassword(id: string) {
    try {
      const response = await api.getHostingPassword(id);
      // response sudah berupa { status, data: { password }, ... }
      if (response && response.status === 'success') {
        return response.data?.password;
      } else {
        throw new Error(response?.message || 'Failed to get hosting password.');
      }
    } catch (err) {
      throw err;
    }
  }

  const fetchHostingById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.getHostingById(id)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        currentHosting.value = response.data
        return response.data
      } else {
        throw new Error(response?.message || `Failed to fetch hosting ${id}.`)
      }
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred.'
      // Error fetching hosting
      return null
    } finally {
      loading.value = false
    }
  }
  
  const createHosting = async (hostingData: Partial<Hosting>) => {
    loading.value = true
    error.value = null
    try {
      // Validate data before sending
      if (!hostingData || typeof hostingData !== 'object') {
        throw new Error('Invalid hosting data: data must be an object');
      }
      
      if (!hostingData.provider) {
        throw new Error('Provider name is required');
      }
      
      // Ensure name is set if not provided
      if (!hostingData.name) {
        hostingData.name = hostingData.provider;
      }
      
      // Ensure we have the required fields for Zod validation
      // Note: type field is not in Hosting interface, removing this check
      
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(hostingData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      // Creating hosting with data
      
      const response = await api.createHosting(cleanData)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        await fetchHostings() // Refresh the list
        return response
      } else {
        // Handle error response
        const errorMessage = response?.error?.message || 
                            (response?.error?.issues && response.error.issues.length > 0 
                              ? response.error.issues.map((i: any) => i.message).join(', ') 
                              : 'Failed to create hosting.');
        
        error.value = errorMessage;
        // Error from API
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      // Format error message
      let errorMessage = err.message || 'An error occurred during creation.';
      
      // Check if there are validation issues
      if (err.error && err.error.issues) {
        errorMessage = err.error.issues.map((i: any) => i.message).join(', ');
      }
      
      error.value = errorMessage;
      // Error creating hosting
      return { status: 'error', message: errorMessage, error: err }
    } finally {
      loading.value = false
    }
  }

  const updateHosting = async (id: string, hostingData: Partial<Hosting>) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.updateHosting(id, hostingData)
      
      // ✅ IMPROVED: API service already returns response.data
      if (response && response.status === 'success') {
        await fetchHostings() // Refresh the list
        return response
      } else {
        // More specific error handling
        const errorMessage = response?.error?.message || response?.message || 'Failed to update hosting.'
        error.value = errorMessage
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = 'An error occurred during update.'
      
      if (err.response && err.response.data) {
        // API returned an error response
        const apiError = err.response.data
        if (apiError.error && apiError.error.message) {
          errorMessage = apiError.error.message
        } else if (apiError.message) {
          errorMessage = apiError.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      // Error updating hosting
      return { status: 'error', message: errorMessage, error: err }
    } finally {
      loading.value = false
    }
  }

  const deleteHosting = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.deleteHosting(id)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        hostings.value = hostings.value.filter(h => h.id !== id)
        return responseData
      } else {
        // More specific error handling
        const errorMessage = responseData?.error?.message || responseData?.message || 'Failed to delete hosting.'
        error.value = errorMessage
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      // Extract error message from API response
      let errorMessage = 'An error occurred during deletion.'
      
      if (err.response && err.response.data) {
        // API returned an error response
        const apiError = err.response.data
        if (apiError.error && apiError.error.message) {
          errorMessage = apiError.error.message
        } else if (apiError.message) {
          errorMessage = apiError.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      // Error deleting hosting
      return { status: 'error', message: errorMessage, error: err }
    } finally {
      loading.value = false
    }
  }

  // Computed property to access hostings as hostingAccounts for compatibility
  const hostingAccounts = computed(() => hostings.value)

  return {
    hostings,
    hostingAccounts, // Add this computed property
    currentHosting,
    pagination,
    loading,
    error,
    fetchHostings,
    fetchHostingAccounts, // Add this alias
    fetchHostingById,
    createHosting,
    updateHosting,
    deleteHosting,
    getHostingPassword
  }
}) 