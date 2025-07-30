import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api-adapter'
import type { Website } from '@/types'

export const useWebsiteStore = defineStore('website', () => {
  const websites = ref<Website[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedWebsite = ref<Website | null>(null)

  // Fetch all websites with optional filtering
  async function fetchWebsites(params?: any) {
    loading.value = true
    error.value = null
    try {
      const response = await api.getWebsites(params)
      console.log('[WebsiteStore] Raw API response:', response)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        console.log('[WebsiteStore] Setting websites to:', responseData.data?.items)
        websites.value = responseData.data?.items || []
        console.log('[WebsiteStore] Websites after setting:', websites.value)
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to fetch websites.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching websites.'
      console.error('[WebsiteStore] Error fetching websites:', err)
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Fetch a single website by ID
  async function fetchWebsiteById(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.getWebsiteById(id)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        selectedWebsite.value = responseData.data
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to fetch website details.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching website details.'
      console.error('[WebsiteStore] Error fetching website details:', err)
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Create a new website
  async function createWebsite(websiteData: Partial<Website>) {
    loading.value = true
    error.value = null
    try {
      // Validate data before sending
      if (!websiteData || typeof websiteData !== 'object') {
        throw new Error('Invalid website data: data must be an object');
      }
      
      if (!websiteData.name) {
        throw new Error('Website name is required');
      }
      
      // URL validation removed since we no longer use URL field
      // if (!websiteData.url) {
      //   throw new Error('Website URL is required');
      // }
      
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(websiteData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      console.log('[WebsiteStore] Creating website with data:', cleanData);
      
      const response = await api.createWebsite(cleanData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchWebsites() // Refresh the list
        return responseData
      } else {
        // Handle error response
        const errorMessage = responseData?.error?.message || 
                            (responseData?.error?.issues && responseData.error.issues.length > 0 
                              ? responseData.error.issues.map((i: any) => i.message).join(', ') 
                              : 'Failed to create website.');
        
        error.value = errorMessage;
        console.error('[WebsiteStore] Error from API:', responseData);
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
      console.error('[WebsiteStore] Error creating website:', err);
      return { status: 'error', message: errorMessage, error: err }
    } finally {
      loading.value = false
    }
  }

  // Update an existing website
  async function updateWebsite(id: string, websiteData: Partial<Website>) {
    loading.value = true
    error.value = null
    try {
      // Convert any undefined values to null for proper JSON serialization
      const cleanData = Object.fromEntries(
        Object.entries(websiteData).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      console.log(`[WebsiteStore] Updating website ${id} with data:`, cleanData);
      
      const response = await api.updateWebsite(id, cleanData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchWebsites() // Refresh the list
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to update website.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during update.'
      console.error('[WebsiteStore] Error updating website:', err)
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Delete a website
  async function deleteWebsite(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.deleteWebsite(id)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      
      if (responseData && responseData.status === 'success') {
        await fetchWebsites() // Refresh the list
        return responseData
      } else {
        throw new Error(responseData?.message || 'Failed to delete website.')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during deletion.'
      console.error('[WebsiteStore] Error deleting website:', err)
      return { status: 'error', message: error.value, error: err }
    } finally {
      loading.value = false
    }
  }

  // Alias for fetchWebsiteList to maintain consistent naming
  const fetchWebsiteAccounts = fetchWebsites

  // Get website password (unmasked)
  async function getWebsitePassword(id: string) {
    try {
      const response = await api.getWebsitePassword(id);
      // response sudah berupa { status, data: { password }, ... }
      if (response && response.status === 'success') {
        return response.data?.password;
      } else {
        throw new Error(response?.message || 'Failed to get website password.');
      }
    } catch (err) {
      throw err;
    }
  }

  return {
    websites,
    loading,
    error,
    selectedWebsite,
    fetchWebsites,
    fetchWebsiteById,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    getWebsitePassword
  }
}) 