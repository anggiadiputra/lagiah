<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="closeModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form @submit.prevent="submitForm">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">{{ isEditing ? 'Edit' : 'Add' }} Hosting Account</DialogTitle>
                  
                  <!-- Error message -->
                  <div v-if="error" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p class="text-sm text-red-600">{{ error }}</p>
                  </div>
                  
                  <div class="mt-2 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div class="sm:col-span-2">
                      <label for="provider" class="block text-sm font-medium text-gray-700">Provider Name</label>
                      <input v-model="form.provider" type="text" id="provider" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div class="sm:col-span-2">
                      <label for="planName" class="block text-sm font-medium text-gray-700">Package Name</label>
                      <input v-model="form.planName" type="text" id="planName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div class="sm:col-span-2">
                      <label for="cpanelUrl" class="block text-sm font-medium text-gray-700">Control Panel URL</label>
                      <input v-model="form.cpanelUrl" type="url" id="cpanelUrl" placeholder="https://cpanel.example.com" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div>
                      <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                      <input v-model="form.username" type="text" id="username" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                      <input v-model="form.password" type="password" id="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div>
                      <label for="createdAt" class="block text-sm font-medium text-gray-700">Date Created</label>
                      <input v-model="form.createdAtDate" type="date" id="createdAt" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>
                    <div>
                      <label for="expiresAt" class="block text-sm font-medium text-gray-700">Date Renewal</label>
                      <input v-model="form.expiresAtDate" type="date" id="expiresAt" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    </div>


                    <div>
                      <label class="block text-sm font-medium text-gray-700">Status</label>
                      <p class="text-xs text-gray-500">Status will be determined automatically based on dates</p>
                      <div class="mt-1 px-3 py-2 bg-gray-100 rounded-md text-sm">
                        {{ calculateStatus() }}
                      </div>
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-sm font-medium text-gray-700">Assigned Domains</label>
                      <p class="text-xs text-gray-500 mb-1">First selected domain will be the main domain, others will be addon domains.</p>
                      
                      <!-- Domain Search and Selection -->
                      <div class="border rounded-md p-3">
                        <!-- Search Input -->
                        <div class="mb-3">
                          <input 
                            v-model="domainSearch" 
                            type="text" 
                            placeholder="Search domains..." 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                        </div>
                        
                        <!-- Domain List -->
                        <div class="max-h-48 overflow-y-auto border rounded-md">
                          <div v-if="domainsStore.allDomains.length === 0" class="text-sm text-gray-500 p-3 text-center">
                            Loading domains...
                          </div>
                          <div v-else-if="filteredDomains.length === 0" class="text-sm text-gray-500 p-3 text-center">
                            <div v-if="domainSearch">No domains found matching "{{ domainSearch }}"</div>
                            <div v-else>No available domains for assignment</div>
                            <div class="text-xs mt-1 text-gray-400">
                              Total: {{ domainsStore.allDomains.length }} | 
                              Available: {{ availableDomains.length }} | 
                              Assigned: {{ domainsStore.allDomains.length - availableDomains.length }}
                            </div>
                          </div>
                          <div v-else>
                            <!-- Domain Items -->
                            <div 
                              v-for="(domain, index) in paginatedDomains" 
                              :key="domain.id" 
                              class="flex items-center py-2 px-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <input 
                                :id="`domain-${domain.id}`" 
                                type="checkbox"
                                :value="domain.id"
                                v-model="form.domainIds"
                                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              >
                              <label :for="`domain-${domain.id}`" class="ml-2 flex-1 text-sm text-gray-900 cursor-pointer">
                                <div class="flex items-center justify-between">
                                  <span class="font-medium">{{ domain.name }}</span>
                                  <div class="flex items-center space-x-2">
                                    <span v-if="form.domainIds.indexOf(domain.id) === 0 && form.domainIds.length > 0" 
                                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Main Domain
                                    </span>
                                    <span v-else-if="form.domainIds.indexOf(domain.id) > 0" 
                                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Addon Domain
                                    </span>
                                    <span v-if="domain.expiresAt" 
                                          class="text-xs text-gray-500">
                                      Expires: {{ formatDate(domain.expiresAt) }}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            </div>
                            
                            <!-- Pagination -->
                            <div v-if="totalPages > 1" class="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
                              <div class="text-xs text-gray-500">
                                Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredDomains.length }}
                              </div>
                              <div class="flex items-center space-x-1">
                                <button 
                                  @click="prevPage" 
                                  :disabled="currentPage === 1"
                                  :class="[
                                    'px-2 py-1 text-xs rounded border',
                                    currentPage === 1 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-white text-gray-700 hover:bg-gray-50'
                                  ]"
                                >
                                  ←
                                </button>
                                <span class="text-xs text-gray-600 px-2">
                                  {{ currentPage }} / {{ totalPages }}
                                </span>
                                <button 
                                  @click="nextPage" 
                                  :disabled="currentPage === totalPages"
                                  :class="[
                                    'px-2 py-1 text-xs rounded border',
                                    currentPage === totalPages 
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                      : 'bg-white text-gray-700 hover:bg-gray-50'
                                  ]"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Selected Domains Summary -->
                        <div v-if="form.domainIds.length > 0" class="mt-3 p-2 bg-blue-50 rounded-md">
                          <div class="text-xs font-medium text-blue-800 mb-1">
                            Selected Domains ({{ form.domainIds.length }}):
                          </div>
                          <div class="flex flex-wrap gap-1">
                            <span 
                              v-for="(domainId, index) in form.domainIds" 
                              :key="domainId"
                              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                              :class="index === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'"
                            >
                              {{ getDomainName(domainId) }}
                              <span class="ml-1 text-xs">
                                {{ index === 0 ? '(Main)' : '(Addon)' }}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="sm:col-span-2">
                      <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea v-model="form.notes" id="notes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="submit" class="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm" @click="closeModal">Cancel</button>
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
import { ref, computed, watch, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useHostingStore } from '@/stores/hosting'
import { useDomainStore } from '@/stores/domains'
import type { Hosting } from '@/types'
import { formatDate } from '@/utils'
import { formatRupiah, parseRupiah } from '@/utils/currency'
import type { HostingFormData } from '@/types'

const props = defineProps<{
  hosting: Hosting | null;
  error?: string | null;
}>()

const emit = defineEmits(['close', 'save'])

const domainsStore = useDomainStore()
const hostingStore = useHostingStore()
const open = ref(true)
const error = ref<string | null>(null)
const isLoading = ref(false)

const form = ref<HostingFormData>({
  provider: '',
  planName: '',
  cpanelUrl: '',
  username: '',
  password: '',
  status: 'ACTIVE',
  domainIds: [],
  notes: '',
  createdAtDate: '',
  expiresAtDate: '',
})



// Computed property to safely access domainIds
const domainIds = computed(() => form.value.domainIds || [])

const isEditing = computed(() => !!props.hosting)

// Computed property for available domains (not assigned to other hosting or VPS)
const availableDomains = computed(() => {
  if (!domainsStore.allDomains || domainsStore.allDomains.length === 0) {
    return []
  }

  return domainsStore.allDomains.filter(domain => {
    // If editing and this domain is already assigned to current hosting, include it
    if (isEditing.value && props.hosting && domain.hosting?.id === props.hosting.id) {
      return true
    }
    
    // If domain is assigned to different hosting, exclude it
    if (domain.hosting && domain.hosting.id !== (props.hosting?.id || null)) {
      return false
    }
    
    // If domain is assigned to VPS, exclude it
    if (domain.vpsId) {
      return false
    }
    
    // Domain is not assigned to any hosting or VPS
    return true
  })
})

// Search and pagination variables
const domainSearch = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Computed property for filtered domains based on search
const filteredDomains = computed(() => {
  if (!domainSearch.value.trim()) {
    return availableDomains.value
  }
  
  const searchTerm = domainSearch.value.toLowerCase().trim()
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

// Method to get domain name by ID
const getDomainName = (domainId: string) => {
  const domain = domainsStore.allDomains.find(d => d.id === domainId)
  return domain ? domain.name : 'Unknown Domain'
}

// Watch for search changes to reset pagination
watch(domainSearch, () => {
  currentPage.value = 1
})

// Function to check if a domain is already assigned to another hosting
const isDomainAssignedElsewhere = (domain: any) => {
  // Skip check for domains already assigned to current hosting
  if (isEditing.value && props.hosting?.domains?.some(d => d.id === domain.id)) {
    return false;
  }
  // Check if domain is already assigned to any hosting (one-to-many relationship)
  const isAssigned = domain.hosting !== null;
  return isAssigned;
}

// Function to calculate status based on dates
const calculateStatus = () => {
  const now = new Date();
  const expiresAt = form.value.expiresAtDate ? new Date(form.value.expiresAtDate) : null;
  
  if (!expiresAt) {
    return 'ACTIVE';
  }
  
  if (expiresAt < now) {
    return 'EXPIRED';
  }
  
  // If expiration is within 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  if (expiresAt < thirtyDaysFromNow) {
    return 'EXPIRING_SOON';
  }
  
  return 'ACTIVE';
}

watch(() => props.hosting, (newVal) => {
  if (newVal) {
    // Format dates for date inputs
    const createdAtDate = newVal.createdAt ? new Date(newVal.createdAt).toISOString().split('T')[0] : ''
    const expiresAtDate = newVal.expiresAt ? new Date(newVal.expiresAt).toISOString().split('T')[0] : ''
    
    form.value = { 
      ...newVal,
      domainIds: newVal.domains?.map(d => d.id) || [],
      createdAtDate,
      expiresAtDate,
    }
  } else {
    // Reset for new entry
    form.value = { 
      provider: '', 
      planName: '',
      cpanelUrl: '',
      username: '',
      password: '',
      status: 'ACTIVE', 

      domainIds: [],
      notes: '',
      createdAtDate: '',
      expiresAtDate: '',
    }
    error.value = null
  }
}, { immediate: true })

// Watch for modal open state to ensure domains are loaded
watch(() => open.value, async (isOpen) => {
  if (isOpen && domainsStore.allDomains.length === 0) {
    try {
      await domainsStore.fetchDomains({ limit: 500 });
    } catch (error) {
      console.error('Error loading domains after modal opened:', error);
    }
  }
}, { immediate: true })

// Use error from props if available
watch(() => props.error, (newError) => {
  if (newError) {
    error.value = newError;
  }
}, { immediate: true })

onMounted(async () => {
  try {
    await domainsStore.fetchDomains({ limit: 500 })
  } catch (error) {
    // Handle error
  }
})

const closeModal = () => {
  open.value = false
  setTimeout(() => emit('close'), 300)
}

const submitForm = () => {
  error.value = null
  
  // Validate required fields
  if (!form.value.provider) {
    error.value = 'Provider name is required'
    return
  }
  
  // Convert date strings to ISO format for API
  const formData: any = { ...form.value }
  
  // Handle dates
  if (formData.createdAtDate) {
    formData.createdAt = new Date(formData.createdAtDate).toISOString()
    delete formData.createdAtDate
  }
  
  if (formData.expiresAtDate) {
    formData.expiresAt = new Date(formData.expiresAtDate).toISOString()
    delete formData.expiresAtDate
  }
  

  
  // Filter out system fields that shouldn't be sent to the API
  const allowedFields = [
    'name', 'provider', 'status', 'planName', 'resources', 
    'cpanelUrl', 'username', 'password', 'createdAt', 'expiresAt', 
    'notes', 'domainIds'
  ]
  
  const filteredData = Object.keys(formData)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      // Only include non-empty values
      if ((formData as any)[key] !== undefined && (formData as any)[key] !== null && (formData as any)[key] !== '') {
        obj[key] = (formData as any)[key]
      }
      return obj
    }, {} as any)
  
  // Ensure domainIds is always an array
  if (filteredData.domainIds && !Array.isArray(filteredData.domainIds)) {
    filteredData.domainIds = [filteredData.domainIds]
  }
  
  // Log the filtered data being sent to API for debugging
  
  
  emit('save', filteredData)
}
</script>