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
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-2xl font-semibold text-gray-900">
                      Add New Domain
                    </DialogTitle>
                    <p class="text-sm text-gray-500 mt-1">Add a domain to your portfolio with automatic Whois lookup</p>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Domain Field -->
                <div>
                  <label for="domain" class="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name *
                  </label>
                  <div class="relative">
                    <input
                      id="domain"
                      v-model="form.domain"
                      type="text"
                      required
                      :disabled="isLoading || isWhoisLoading"
                      class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                      placeholder="example.com"
                    >
                    <div v-if="isWhoisLoading" class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <p v-if="form.domain && !isValidDomain" class="mt-1 text-sm text-red-600">
                    Please enter a valid domain name (e.g., example.com)
                  </p>
                  <p v-if="isWhoisLoading" class="mt-1 text-sm text-blue-600">
                    Fetching Whois data...
                  </p>
                  <p v-if="whoisData && !isWhoisLoading" class="mt-1 text-sm text-green-600">
                    ✓ Whois data fetched successfully
                  </p>
                </div>

                <!-- Hosting Account Field -->
                <div>
                  <label for="hosting" class="block text-sm font-medium text-gray-700 mb-2">
                    Hosting Account
                  </label>
                  <select
                    id="hosting"
                    v-model="form.hostingId"
                    :disabled="isLoading"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                  >
                    <option value="">Select hosting account (optional)</option>
                    <option v-for="account in hostingAccounts" :key="account.id" :value="account.id">
                      {{ account.name }} - {{ account.provider }}
                    </option>
                  </select>
                  <p class="mt-1 text-sm text-gray-500">
                    Associate this domain with a hosting account
                  </p>
                </div>



                <!-- Notes Field -->
                <div>
                  <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    v-model="form.notes"
                    rows="4"
                    :disabled="isLoading"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm resize-none"
                    placeholder="Any additional notes about this domain..."
                  ></textarea>
                </div>

                <!-- Whois Preview (if available) -->
                <div v-if="whoisData && !isWhoisLoading" class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-green-800 mb-3 flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Whois Data Preview
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div v-if="whoisData['Registrar Name']">
                      <span class="text-gray-600">Registrar:</span>
                      <span class="font-medium text-gray-900 ml-2">{{ whoisData['Registrar Name'] }}</span>
                    </div>
                    <div v-if="whoisData['Created On']">
                      <span class="text-gray-600">Created:</span>
                      <span class="font-medium text-gray-900 ml-2">{{ formatDate(whoisData['Created On']) }}</span>
                    </div>
                    <div v-if="whoisData['Expiration Date']">
                      <span class="text-gray-600">Expires:</span>
                      <span class="font-medium text-gray-900 ml-2">{{ formatDate(whoisData['Expiration Date']) }}</span>
                    </div>
                    <div v-if="whoisData['Status']">
                      <span class="text-gray-600">Status:</span>
                      <span class="font-medium text-gray-900 ml-2">{{ whoisData['Status'] }}</span>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800">Error</h3>
                      <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    :disabled="isLoading"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading || !form.domain || !isValidDomain"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading ? 'Adding Domain...' : 'Add Domain' }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useDomainStore } from '@/stores/domains'
import { useHostingStore } from '@/stores/hosting'
import { formatRupiah, parseRupiah } from '@/utils/currency'

// Props
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: [domain: any]
}>()

// Stores
const domainStore = useDomainStore()
const hostingStore = useHostingStore()

// State
const isLoading = ref(false)
const isWhoisLoading = ref(false)
const error = ref<string | null>(null)
const whoisData = ref<any>(null)

const form = ref({
  domain: '',
  hostingId: '',
  notes: ''
})

const resetForm = () => {
  form.value = {
    domain: '',
    hostingId: '',
    notes: ''
  }
  error.value = null
  whoisData.value = null
}

const closeModal = () => {
  resetForm()
  emit('close')
}



const isValidDomain = computed(() => {
  const domain = form.value.domain.trim()
  if (!domain) return false
  
  // More flexible domain validation regex
  // Allows domains like: example.com, sub.example.com, example.co.uk, etc.
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
})

const hostingAccounts = computed(() => hostingStore.hostingAccounts)

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Fix the lookupWhois function with proper type checking
const lookupWhois = async () => {
  
  
  if (!isValidDomain.value) {
    error.value = 'Please enter a valid domain name'
    return
  }
  
  const domain = form.value.domain
  isWhoisLoading.value = true
  error.value = null
  
  try {
    const whoisResponse = await domainStore.fetchWhoisData(domain.trim().toLowerCase())
    

    
    // Check if response is valid
    if (whoisResponse && typeof whoisResponse === 'object' && 'status' in whoisResponse && whoisResponse.status === 'success') {
      // Success case - clear any previous errors
      error.value = null
      
      // Check if response has data property
      if ('data' in whoisResponse && whoisResponse.data) {
        // Handle nested data structure
        if (whoisResponse.data.data) {
          whoisData.value = whoisResponse.data.data
        } else {
          whoisData.value = whoisResponse.data
        }
      }
    } else if (whoisResponse && typeof whoisResponse === 'object' && 'status' in whoisResponse && whoisResponse.status === 'error') {
      // Error case - but don't show error if it's just that domain is available
      const errorMessage = ('message' in whoisResponse && whoisResponse.message) ? whoisResponse.message : 'Failed to fetch Whois data'
      
      // Don't show error for domains that are available (not registered)
      if (errorMessage.includes('not found') || errorMessage.includes('available')) {
        error.value = null
        whoisData.value = null
  
      } else {
        error.value = errorMessage
      }
    } else {
      // Unknown response format
      console.warn('Unexpected Whois response format:', whoisResponse)
      error.value = null // Don't show error for unexpected formats
    }
  } catch (err: any) {
    console.error('Error in lookupWhois:', err)
    // Only show error for actual network/API errors, not for domain availability
    if (err.message && !err.message.includes('not found') && !err.message.includes('available')) {
      error.value = err.message || 'Failed to fetch Whois data'
    } else {
      error.value = null
    }
  } finally {
    isWhoisLoading.value = false
  }
}

// Update handleSubmit with proper type checking
const handleSubmit = async () => {
  if (!isValidDomain.value) {
    error.value = 'Please enter a valid, well-formatted domain name.'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const domainData = {
      name: form.value.domain.trim().toLowerCase(),
      // Ensure empty string becomes undefined to pass backend validation
      hostingId: form.value.hostingId || undefined,
      notes: form.value.notes || undefined,
    }


    
    const response = await domainStore.createDomain(domainData)


    // Handle response format from API
    if (response && response.status === 'success' && response.data) {
  
      emit('success', response.data)
      closeModal()
    } else {
      console.error('[AddDomainModal] Failed to create domain:', response)
      // Handle different error formats
      if (response && response.message) {
        error.value = response.message
      } else if (response && response.error && typeof response.error === 'string') {
        error.value = response.error
      } else if (response && response.error && response.error.message) {
        error.value = response.error.message
      } else {
        error.value = 'An unknown error occurred while creating the domain.'
      }
    }

  } catch (err: any) {
    console.error('[AddDomainModal] Exception during submission:', err)
    // Handle different error types
    if (err.response && err.response.status === 405) {
      error.value = 'Method not allowed. Please try again.'
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'An unexpected client-side error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}

// Extract the domain creation without Whois to a separate function
const createDomainWithoutWhois = async () => {
  try {
    // Create domain anyway without Whois data
    if (confirm('Could not fetch Whois data. Do you want to create the domain without Whois information?')) {
      const domainData = {
        name: form.value.domain.trim().toLowerCase(),
        hostingId: form.value.hostingId || undefined,
        notes: form.value.notes || undefined,

        status: 'ACTIVE'
      }
      

      
      // Validate domain data before sending to API
      if (!domainData.name) {
        error.value = 'Domain name is required'
        return
      }
      

      
      // Send request to create domain
      const response = await domainStore.createDomain(domainData)

      
      if (response && response.status === 'success' && response.data) {
  
        emit('success', response.data)
        closeModal()
      } else {
        if (response && response.message) {
          error.value = response.message
        } else if (response && response.error) {
          error.value = typeof response.error === 'string' 
            ? response.error 
            : (response.error.message || 'Unknown error')
        } else {
          error.value = 'Failed to add domain. Please try again later.'
        }
        console.error('Failed to create domain:', response)
      }
    }
  } catch (err) {
    console.error('Exception in createDomainWithoutWhois:', err)
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Fetch hosting accounts when modal opens
    hostingStore.fetchHostingAccounts()
  }
})

// Watch for domain changes to trigger Whois lookup
watch(() => form.value.domain, (newDomain) => {
  if (newDomain && isValidDomain.value && !isWhoisLoading.value) {
    // Debounce the Whois lookup
    const timeoutId = setTimeout(() => {
      lookupWhois()
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }
})
</script> 