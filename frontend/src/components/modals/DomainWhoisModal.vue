<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md sm:max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
              <!-- Header -->
              <div class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                <DialogTitle as="h3" class="text-sm sm:text-base font-semibold text-gray-900">
                  Domain Information
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div v-if="domain" class="px-3 sm:px-4 py-2 sm:py-3">
                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center py-6">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span class="ml-2 text-sm text-gray-600">Updating WHOIS data...</span>
                </div>
                
                <!-- Content when not loading -->
                <div v-else class="space-y-2">
                  <!-- Domain ID -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Domain ID:</span>
                    <span class="text-gray-700 font-mono text-xs">{{ getDomainId() }}</span>
                  </div>
                  
                  <!-- Domain Name -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Domain Name:</span>
                    <span class="text-gray-700 text-sm">{{ domain.name }}</span>
                  </div>
                  
                  <!-- Created On -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Created On:</span>
                    <span class="text-gray-700 text-sm">{{ formatDateSimple(domain.registeredAt) }}</span>
                  </div>
                  
                  <!-- Last Update On -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Last Update On:</span>
                    <span class="text-gray-700 text-sm">{{ formatDateSimple(domain.updatedAt) }}</span>
                  </div>
                  
                  <!-- Expiration Date -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Expiration Date:</span>
                    <span class="text-gray-700 text-sm">{{ formatDateSimple(domain.expiresAt) }}</span>
                  </div>
                  
                  <!-- Status -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Status:</span>
                    <span class="text-gray-700 text-sm">{{ getDomainStatus() }}</span>
                  </div>
                  
                  <!-- Nameservers -->
                  <div v-if="getNameservers().length > 0" class="space-y-1">
                    <div 
                      v-for="(ns, index) in getNameservers()" 
                      :key="index"
                      class="flex justify-between items-center py-1.5 border-b border-gray-100"
                    >
                      <span class="font-medium text-gray-900 text-sm">Nameserver {{ index + 1 }}:</span>
                      <span class="text-gray-700 font-mono text-xs">{{ ns }}</span>
                    </div>
                  </div>
                  
                  <!-- Registrar Name -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">Registrar Name:</span>
                    <div class="text-right">
                      <span class="text-gray-700 text-sm">{{ getRegistrarName() }}</span>
                      <div class="text-xs text-gray-500 mt-1">From WHOIS data</div>
                    </div>
                  </div>
                  
                  <!-- DNSSEC -->
                  <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span class="font-medium text-gray-900 text-sm">DNSSEC:</span>
                    <span class="text-gray-700 text-sm">{{ getDnssecStatus() }}</span>
                  </div>
                  
                  <!-- Hosting/VPS Info -->
                  <div class="flex justify-between items-center py-1.5">
                    <span class="font-medium text-gray-900 text-sm">Hosting/VPS Info:</span>
                    <span class="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">{{ getHostingVpsInfo() }}</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 bg-gray-50">
                <div class="flex space-x-2">
                  <button
                    @click="refreshWhoisData"
                    :disabled="loading"
                    class="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading ? 'Updating...' : 'Update WHOIS' }}
                  </button>
                  <!-- Delete button for Admin and Staff -->
                  <button
                    v-if="canDeleteDomain"
                    @click="deleteDomain"
                    :disabled="loading"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Domain
                  </button>
                </div>
                <button
                  @click="closeModal"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
import { ref, onMounted, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useDomainStore } from '@/stores/domains'
import type { Domain } from '@/types'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
  domain: Domain | null
}>()

const emit = defineEmits(['close', 'refresh', 'domain-deleted', 'edit-domain'])

const domainsStore = useDomainStore()
const authStore = useAuthStore()

const whoisInfo = computed(() => {
  // Use WHOIS data from database (domain.whoisData) instead of fetching from API
  if (props.domain?.whoisData) {
    return props.domain.whoisData
  }
  return null
})

// Check if user can delete domain (Admin and Staff only)
const canDeleteDomain = computed(() => {
  return authStore.user && (authStore.user.role === 'ADMIN' || authStore.user.role === 'STAFF')
})

const loading = ref(false)

const closeModal = () => {
  emit('close')
}

const refreshWhoisData = async () => {
  if (!props.domain) return
  loading.value = true
  try {
    // Fetch fresh WHOIS data and update database
    await domainsStore.refreshWhoisData(props.domain.id)
    // Emit refresh to update parent component
    emit('refresh')
  } catch (err) {
    console.error('Failed to refresh Whois data:', err)
  } finally {
    loading.value = false
  }
}

const deleteDomain = async () => {
  if (!props.domain) return
  
  // Show confirmation dialog
  if (!confirm(`Are you sure you want to delete domain "${props.domain.name}"? This action cannot be undone.`)) {
    return
  }
  
  loading.value = true
  try {
    await domainsStore.deleteDomain(props.domain.id)
    // Emit domain deleted event
    emit('domain-deleted', props.domain.id)
    // Close modal immediately after successful delete
    emit('close')
  } catch (err) {
    console.error('Failed to delete domain:', err)
    alert('Failed to delete domain. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.isOpen && props.domain?.name) {
    console.log('Modal opened for domain:', props.domain.name)
    // No need to fetch WHOIS data - use data from database
    console.log('Using WHOIS data from database:', props.domain.whoisData)
  }
})

// Watch for modal opening - no need to fetch data
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.domain?.name) {

  }
})

// Watch for domain changes - no need to fetch data
watch(() => props.domain, (newDomain) => {
  if (props.isOpen && newDomain?.name) {
    // Domain changed, data already available
  }
})

// Simple date formatting function
const formatDateSimple = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // Format: YYYY-MM-DD
  } catch {
    return 'N/A'
  }
}

// Get domain ID from WHOIS data
const getDomainId = (): string => {
  if (whoisInfo.value?.data?.['Domain ID']) {
    return whoisInfo.value.data['Domain ID']
  }
  return 'N/A'
}

// Get domain status
const getDomainStatus = (): string => {
  if (whoisInfo.value?.data?.Status) {
    return whoisInfo.value.data.Status
  }
  if (whoisInfo.value?.status && Array.isArray(whoisInfo.value.status)) {
    return whoisInfo.value.status.join(', ')
  }
  if (whoisInfo.value?.status && typeof whoisInfo.value.status === 'string') {
    return whoisInfo.value.status
  }
  return props.domain?.status || 'N/A'
}

// Get DNSSEC status
const getDnssecStatus = (): string => {
  if (whoisInfo.value?.data?.DNSSEC) {
    return whoisInfo.value.data.DNSSEC
  }
  if (whoisInfo.value?.dnssec) {
    return whoisInfo.value.dnssec
  }
  return 'N/A'
}

// Get hosting/VPS info
const getHostingVpsInfo = (): string => {
  if (props.domain?.hosting) {
    return `Hosting: ${props.domain.hosting.name} (${props.domain.hosting.provider})`
  }
  if (props.domain?.vps) {
    return `VPS: ${props.domain.vps.name} (${props.domain.vps.provider})`
  }
  return 'N/A'
}

// Get registrar name from WHOIS data
const getRegistrarName = (): string => {
  if (whoisInfo.value?.data?.['Registrar Name']) {
    return whoisInfo.value.data['Registrar Name']
  }
  if (whoisInfo.value?.registrar) {
    return whoisInfo.value.registrar
  }
  if (props.domain?.registrar) {
    return props.domain.registrar
  }
  return 'Not available - refresh WHOIS data'
}

// Get nameservers from WHOIS data
const getNameservers = (): string[] => {
  if (whoisInfo.value?.data) {
    const nameservers = []
    for (let i = 1; i <= 10; i++) {
      const nsKey = `Nameserver ${i}`
      if (whoisInfo.value.data[nsKey]) {
        nameservers.push(whoisInfo.value.data[nsKey])
      }
    }
    if (nameservers.length > 0) {
      return nameservers
    }
  }
  if (whoisInfo.value?.name_servers && Array.isArray(whoisInfo.value.name_servers)) {
    return whoisInfo.value.name_servers
  }
  return props.domain?.nameservers || []
}
</script> 