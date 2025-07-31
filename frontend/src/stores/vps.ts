import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api-adapter'
import type { VPS } from '@/types'

export const useVPSStore = defineStore('vps', () => {
  const vpsList = ref<VPS[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedVPS = ref<VPS | null>(null)

  // Alias for fetchVPSList to maintain consistent naming
  const fetchVPSAccounts = fetchVPSList

  // Get VPS password (unmasked)
  async function getVpsPassword(id: string) {
    try {
      const response = await api.getVpsPassword(id);
      // response sudah berupa { status, data: { password }, ... }
      if (response && response.status === 'success') {
        return response.data?.password;
      } else {
        throw new Error(response?.message || 'Failed to get VPS password.');
      }
    } catch (err) {
      throw err;
    }
  }

  // Fetch all VPS accounts with optional filtering
  async function fetchVPSList(params?: any) {
    loading.value = true
    error.value = null
    try {
      const response = await api.getVPSList(params)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        vpsList.value = responseData.data?.items || []
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to fetch VPS accounts.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching VPS accounts.'
      // Error fetching VPS accounts
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Fetch a single VPS by ID
  async function fetchVPSById(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.getVPSById(id)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        selectedVPS.value = responseData.data
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to fetch VPS details.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching VPS details.'
      // Error fetching VPS details
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Create a new VPS
  async function createVPS(vpsData: Partial<VPS>) {
    loading.value = true
    error.value = null
    try {
      // Validate data before sending
      if (!vpsData || typeof vpsData !== 'object') {
        throw new Error('Invalid VPS data: data must be an object');
      }
      
      if (!vpsData.provider) {
        throw new Error('Provider name is required');
      }
      
      if (!vpsData.name) {
        throw new Error('VPS name is required');
      }
      
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(vpsData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      // Creating VPS with data
      
      const response = await api.createVPS(cleanData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchVPSList() // Refresh the list
        return responseData
      } else {
        // Handle error response
        const errorMessage = responseData?.error?.message || 
                            (responseData?.error?.issues && responseData.error.issues.length > 0 
                              ? responseData.error.issues.map((i: any) => i.message).join(', ') 
                              : 'Failed to create VPS.');
        
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
      // Error creating VPS
      return { status: 'error', message: errorMessage, error: err }
    } finally {
      loading.value = false
    }
  }

  // Update an existing VPS
  async function updateVPS(id: string, vpsData: Partial<VPS>) {
    loading.value = true
    error.value = null
    try {
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(vpsData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      // Updating VPS with data
      
      const response = await api.updateVPS(id, cleanData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchVPSList() // Refresh the list
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to update VPS.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during update.'
      // Error updating VPS
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Delete a VPS
  async function deleteVPS(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.deleteVPS(id)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchVPSList() // Refresh the list
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to delete VPS.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during deletion.'
      // Error deleting VPS
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  return {
    vpsList,
    loading,
    error,
    selectedVPS,
    fetchVPSList,
    fetchVPSAccounts, // Alias for consistency with other stores
    fetchVPSById,
    createVPS,
    updateVPS,
    deleteVPS,
    getVpsPassword
  }
}) 