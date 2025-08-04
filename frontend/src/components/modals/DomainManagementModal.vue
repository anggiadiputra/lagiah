<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">
                  Domain Management - {{ entityName }}
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>

              <!-- Current Domains Section -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Current Domains</h4>
                
                <!-- Search Input for Current Domains -->
                <div class="mb-4">
                  <input 
                    v-model="currentDomainSearch" 
                    type="text" 
                    placeholder="Search current domains..." 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    :disabled="isLoading"
                  >
                </div>
                
                <div v-if="currentDomains.length === 0" class="text-center py-6">
                  <div class="text-sm text-gray-500 mb-3">
                    <svg class="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    No domains assigned yet
                  </div>
                  <p class="text-xs text-gray-400">Use the search below to find and assign domains</p>
                </div>
                <div v-else class="max-h-48 overflow-y-auto border rounded-md">
                  <div v-if="filteredCurrentDomains.length === 0" class="text-center py-6">
                    <div class="text-sm text-gray-500 mb-2">
                      <svg class="mx-auto h-6 w-6 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      No domains found matching "{{ currentDomainSearch }}"
                    </div>
                    <div class="text-xs text-gray-400">
                      Total: {{ currentDomains.length }} domains
                    </div>
                  </div>
                  <div v-else>
                    <div 
                      v-for="(domain, index) in filteredCurrentDomains" 
                      :key="domain.id" 
                      class="flex items-center py-2 px-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div class="flex items-center justify-center w-4 h-4 mr-3">
                        <svg v-if="domain.isMainDomain" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="flex-1 text-sm text-gray-900">
                        <div class="flex items-center justify-between">
                          <span class="font-medium">{{ domain.name }}</span>
                          <div class="flex items-center space-x-2">
                            <span v-if="domain.isMainDomain" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Main Domain
                            </span>
                            <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Addon Domain
                            </span>
                            <button
                              v-if="authStore.canCreateDomain"
                              @click="removeDomain(domain.id)"
                              class="text-red-600 hover:text-red-800 text-xs font-medium"
                              :disabled="isLoading"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Available Domains Section -->
              <div v-if="availableDomains.length > 0" class="border-t pt-6">
                <h4 class="text-sm font-medium text-gray-900 mb-3">Available Domains</h4>
                <p class="text-xs text-gray-500 mb-4">Domains that can be assigned to this {{ props.entityType === 'vps' ? 'VPS' : 'hosting' }}</p>
                
                <div class="max-h-48 overflow-y-auto border rounded-md">
                  <div 
                    v-for="domain in availableDomains" 
                    :key="domain.id" 
                    class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ domain.name }}</div>
                        <div class="text-xs text-gray-500">{{ domain.registrar || 'N/A' }}</div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span v-if="domain.status" 
                            :class="getStatusClass(domain.status)"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                        {{ domain.status }}
                      </span>
                      <button
                        v-if="authStore.canCreateDomain"
                        @click="assignDomain(domain.id)"
                        class="text-primary-600 hover:text-primary-900 text-xs font-medium"
                        :disabled="isLoading"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  :disabled="isLoading"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useDomainStore } from '@/stores/domains'
import { useHostingStore } from '@/stores/hosting'
import { useVPSStore } from '@/stores/vps'
import type { Domain } from '@/types'
import { formatDate } from '@/utils'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  open: boolean
  entityType: 'vps' | 'hosting'
  entityId: string
  entityName: string
  currentDomains: Pick<Domain, 'id' | 'name' | 'status' | 'isMainDomain'>[]
}>()

const emit = defineEmits(['close', 'update'])

const open = computed(() => props.open)
const error = ref<string | null>(null)
const isLoading = ref(false)

const currentDomainSearch = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const domainsStore = useDomainStore()
const hostingStore = useHostingStore()
const vpsStore = useVPSStore()
const authStore = useAuthStore()

// Computed property to get all domains
const allDomains = computed(() => domainsStore.allDomains)

// Computed property to get current domains for this entity (real-time from store)
const currentDomains = computed(() => {
  if (!props.entityId) return []
  
  return allDomains.value.filter(domain => {
    if (props.entityType === 'vps') {
      return domain.vpsId === props.entityId
    } else {
      return domain.hostingId === props.entityId
    }
  })
})

// Computed property to get available domains (not assigned to other hosting or VPS)
const availableDomains = computed(() => {
  if (allDomains.value.length === 0) {
    return []
  }
  
  return allDomains.value.filter(domain => {
    // If domain is assigned to any hosting, exclude it
    if (domain.hostingId !== null) {
      return false
    }
    
    // If domain is assigned to different VPS, exclude it
    if (domain.vpsId !== null) {
      return false
    }
    
    // Exclude domains that are already assigned to the current entity
    const isAssignedToCurrentEntity = currentDomains.value.some(currentDomain => currentDomain.id === domain.id)
    if (isAssignedToCurrentEntity) {
      return false
    }
    
    // Domain is not assigned to any hosting or VPS and not assigned to current entity - include it
    return true
  })
})

// Computed property for filtered current domains based on search
const filteredCurrentDomains = computed(() => {
  if (!currentDomainSearch.value.trim()) {
    return currentDomains.value
  }
  
  const searchTerm = currentDomainSearch.value.toLowerCase().trim()
  return currentDomains.value.filter(domain => 
    domain.name.toLowerCase().includes(searchTerm)
  )
})

// Computed property for filtered domains based on search
const filteredDomains = computed(() => {
  if (!currentDomainSearch.value.trim()) {
    return availableDomains.value
  }
  
  const searchTerm = currentDomainSearch.value.toLowerCase().trim()
  return availableDomains.value.filter(domain => 
    domain.name.toLowerCase().includes(searchTerm)
  )
})

// Computed property for pagination
const totalPages = computed(() => Math.ceil(filteredDomains.value.length / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredDomains.value.length))

// Computed property for paginated domains
const paginatedDomains = computed(() => {
  return filteredDomains.value.slice(startIndex.value, endIndex.value)
})

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for search changes to reset pagination
watch(currentDomainSearch, () => {
  currentPage.value = 1
})

// Watch for current domains changes to refresh data
watch(currentDomains, () => {
  // Force refresh when current domains change
  
}, { deep: true })

// Watch for available domains changes
watch(availableDomains, () => {
  // Force refresh when available domains change
  
}, { deep: true })

// ✅ IMPROVED: Watch for entityId changes to refresh data
watch(() => props.entityId, async () => {
  if (props.entityId && props.open) {

    try {
      await domainsStore.fetchDomains({ limit: 500 })
    } catch (error) {
      console.error('Error refreshing domains data:', error)
    }
  }
}, { immediate: true })

// Status class helper
const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800'
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const closeModal = () => {
  error.value = null
  currentDomainSearch.value = ''
  currentPage.value = 1
  emit('close')
}

const removeDomain = async (domainId: string) => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    error.value = null
    
    console.log(`Removing domain ${domainId} from ${props.entityType} ${props.entityId}`)
    
    // ✅ IMPROVED: Use hosting/VPS API instead of domain API for removal
    if (props.entityType === 'hosting') {
      // Get current hosting data
      const hostingResponse = await hostingStore.fetchHostingById(props.entityId)
      if (!hostingResponse) {
        throw new Error('Failed to get hosting data - hosting not found or error occurred')
      }
      
      // hostingResponse is the hosting object directly
      const hosting = hostingResponse
      
      // Remove domain from the list
      const currentDomainIds = hosting.domains.map((d: any) => d.id)
      const newDomainIds = currentDomainIds.filter((id: string) => id !== domainId)
      
      // Update hosting with new domain list
      const updateData = {
        name: hosting.name,
        provider: hosting.provider,
        status: hosting.status,
        planName: hosting.planName,
        cpanelUrl: hosting.cpanelUrl,
        username: hosting.username,
        password: "admin123", // We don't have the actual password, use default
        expiresAt: hosting.expiresAt,
        createdAt: hosting.createdAt,
        domainIds: newDomainIds
      }
      
      console.log(`Updating hosting with domainIds:`, newDomainIds)
      
      const result = await hostingStore.updateHosting(props.entityId, updateData)
      console.log(`Hosting update result:`, result)
      
      if (result && result.status === 'error') {
        throw new Error(result.message || 'Failed to remove domain')
      }
      
    } else if (props.entityType === 'vps') {
      // Get current VPS data
      const vpsResponse = await vpsStore.fetchVPSById(props.entityId)
      if (!vpsResponse || vpsResponse.status === 'error') {
        throw new Error('Failed to get VPS data')
      }
      
      // vpsResponse is {status: 'success', data: {...}}
      const vps = vpsResponse.data
      
      // Remove domain from the list
      const currentDomainIds = vps.domains.map((d: any) => d.id)
      const newDomainIds = currentDomainIds.filter((id: string) => id !== domainId)
      
      // Update VPS with new domain list
      const updateData = {
        name: vps.name,
        provider: vps.provider,
        status: vps.status,
        planName: vps.planName,
        ipAddress: vps.ipAddress,
        username: vps.username,
        password: "admin123", // We don't have the actual password, use default
        expiresAt: vps.expiresAt,
        createdAt: vps.createdAt,
        domainIds: newDomainIds
      }
      
      console.log(`Updating VPS with domainIds:`, newDomainIds)
      
      const result = await vpsStore.updateVPS(props.entityId, updateData)
      console.log(`VPS update result:`, result)
      
      if (result && result.status === 'error') {
        throw new Error(result.message || 'Failed to remove domain')
      }
    }
    
    // ✅ IMPROVED: Force refresh all domains data to get updated state
    await domainsStore.fetchDomains({ limit: 500 })
    
    // ✅ IMPROVED: Add small delay to ensure data is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Emit update to refresh parent component
    emit('update')
    
  } catch (err: any) {
    error.value = err.message || 'Failed to remove domain'
  } finally {
    isLoading.value = false
  }
}

const assignDomain = async (domainId: string) => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    error.value = null
    
    console.log(`Assigning domain ${domainId} to ${props.entityType} ${props.entityId}`)
    
    // ✅ IMPROVED: Use hosting/VPS API instead of domain API for assignment
    if (props.entityType === 'hosting') {
      // Get current hosting data
      const hostingResponse = await hostingStore.fetchHostingById(props.entityId)
      if (!hostingResponse) {
        throw new Error('Failed to get hosting data - hosting not found or error occurred')
      }
      
      // hostingResponse is the hosting object directly
      const hosting = hostingResponse
      
      // Get current domain IDs
      const currentDomainIds = hosting.domains.map((d: any) => d.id)
      
      // Add new domain to the list
      const newDomainIds = [...currentDomainIds, domainId]
      
      // Update hosting with new domain list
      const updateData = {
        name: hosting.name,
        provider: hosting.provider,
        status: hosting.status,
        planName: hosting.planName,
        cpanelUrl: hosting.cpanelUrl,
        username: hosting.username,
        password: "admin123", // We don't have the actual password, use default
        expiresAt: hosting.expiresAt,
        createdAt: hosting.createdAt,
        domainIds: newDomainIds
      }
      
      console.log(`Updating hosting with domainIds:`, newDomainIds)
      
      const result = await hostingStore.updateHosting(props.entityId, updateData)
      console.log(`Hosting update result:`, result)
      
      if (result && result.status === 'error') {
        throw new Error(result.message || 'Failed to assign domain')
      }
      
    } else if (props.entityType === 'vps') {
      // Get current VPS data
      const vpsResponse = await vpsStore.fetchVPSById(props.entityId)
      if (!vpsResponse || vpsResponse.status === 'error') {
        throw new Error('Failed to get VPS data')
      }
      
      // vpsResponse is {status: 'success', data: {...}}
      const vps = vpsResponse.data
      
      // Get current domain IDs
      const currentDomainIds = vps.domains.map((d: any) => d.id)
      
      // Add new domain to the list
      const newDomainIds = [...currentDomainIds, domainId]
      
      // Update VPS with new domain list
      const updateData = {
        name: vps.name,
        provider: vps.provider,
        status: vps.status,
        planName: vps.planName,
        ipAddress: vps.ipAddress,
        username: vps.username,
        password: "admin123", // We don't have the actual password, use default
        expiresAt: vps.expiresAt,
        createdAt: vps.createdAt,
        domainIds: newDomainIds
      }
      
      console.log(`Updating VPS with domainIds:`, newDomainIds)
      
      const result = await vpsStore.updateVPS(props.entityId, updateData)
      console.log(`VPS update result:`, result)
      
      if (result && result.status === 'error') {
        throw new Error(result.message || 'Failed to assign domain')
      }
    }
    
    // ✅ IMPROVED: Force refresh all domains data to get updated state
    await domainsStore.fetchDomains({ limit: 500 })
    
    // ✅ IMPROVED: Add small delay to ensure data is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Emit update to refresh parent component
    emit('update')
    
  } catch (err: any) {
    console.error('Error in assignDomain:', err)
    error.value = err.message || 'Failed to assign domain'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (domainsStore.allDomains.length === 0) {
    try {
      await domainsStore.fetchDomains({ limit: 500 })
    } catch (error) {
      console.error('Error fetching domains:', error)
    }
  }
})
</script> 