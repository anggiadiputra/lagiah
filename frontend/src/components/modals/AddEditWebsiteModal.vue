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
            <DialogPanel class="relative transform overflow-hidden rounded-xl bg-white px-4 pt-4 pb-3 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:px-6 sm:pt-5 sm:pb-4">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4 sm:pb-4 sm:mb-6">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    </div>
                    <div>
                    <DialogTitle as="h3" class="text-2xl font-semibold text-gray-900">
                      {{ props.viewOnly ? 'Website Details' : (isEditing ? 'Edit Website' : 'Add New Website') }}
                    </DialogTitle>
                    <p class="text-sm text-gray-500 mt-1">{{ props.viewOnly ? 'View website information' : 'Configure your website settings' }}</p>
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

              <!-- Loading State -->
              <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span class="ml-3 text-gray-600">{{ isEditing ? 'Updating website...' : 'Creating website...' }}</span>
                    </div>

              <!-- Form -->
              <form v-else @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Website Name -->
                    <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Website Name *
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    :disabled="props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                    placeholder="Enter website name"
                  >
                    </div>

                <!-- Domain Selection -->
                    <div>
                                <label for="domain" class="block text-sm font-medium text-gray-700 mb-2">
                Domain * 
                <span class="text-xs text-gray-500 ml-1">
                  ({{ availableDomains.length }} available)
                </span>
              </label>
                  <select
                    id="domain"
                    v-model="form.domainId"
                    required
                    @change="handleDomainChange"
                    :disabled="availableDomains.length === 0 || props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                  >
                        <option value="">{{ availableDomains.length === 0 ? 'No domains available' : 'Select a domain' }}</option>
                    <option 
                      v-for="domain in availableDomains" 
                      :key="domain.id" 
                      :value="domain.id"
                    >
                          {{ domain.name }}
                        </option>
                      </select>
                      
                      <!-- Info message when no domains available -->
                      <div v-if="availableDomains.length === 0" class="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                        <div class="flex items-center">
                          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          All domains are already assigned to other websites. Please create a new domain first.
                        </div>
                      </div>
                    </div>

                <!-- Hosting Assignment (Auto-filled based on domain) -->
                    <div>
                  <label for="hosting" class="block text-sm font-medium text-gray-700 mb-2">
                    Hosting Assignment
                  </label>
                  <div class="relative">
                    <input
                      id="hosting"
                      :value="currentHosting?.name || 'No hosting assigned'"
                      type="text"
                      readonly
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 text-sm"
                    >
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg v-if="currentHosting" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <p v-if="currentHosting" class="mt-1 text-xs text-green-600">
                    Automatically assigned based on domain selection
                  </p>
                </div>

                <!-- VPS Assignment (Auto-filled based on domain) -->
                    <div>
                  <label for="vps" class="block text-sm font-medium text-gray-700 mb-2">
                    VPS Assignment
                  </label>
                  <div class="relative">
                    <input
                      id="vps"
                      :value="currentVps?.name || 'No VPS assigned'"
                      type="text"
                      readonly
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 text-sm"
                    >
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg v-if="currentVps" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <p v-if="currentVps" class="mt-1 text-xs text-blue-600">
                    Automatically assigned based on domain selection
                  </p>
                  <p v-else class="mt-1 text-xs text-gray-500">
                    No VPS assigned to this domain
                  </p>
                    </div>

                <!-- CMS -->
                    <div>
                  <label for="cms" class="block text-sm font-medium text-gray-700 mb-2">
                    CMS (Optional)
                  </label>
                  <select
                    id="cms"
                    v-model="form.cms"
                    :disabled="props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                  >
                    <option value="">Select CMS (Optional)</option>
                    <option 
                      v-for="cms in cmsOptions" 
                      :key="cms" 
                      :value="cms"
                    >
                      {{ cms }}
                    </option>
                      </select>
                    </div>

                <!-- Username -->
                    <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                    Username (Optional)
                  </label>
                  <input
                    id="username"
                    v-model="form.username"
                    type="text"
                    :disabled="props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                    placeholder="Website access username"
                  >
                    </div>

                <!-- Password -->
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    Password (Optional)
                  </label>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    :disabled="props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                    placeholder="Website access password"
                  >
                    </div>

                <!-- Notes -->
                <div>
                  <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    v-model="form.notes"
                    rows="3"
                    :disabled="props.viewOnly"
                    :class="[
                      'block w-full px-3 py-2 border rounded-md shadow-sm text-sm',
                      props.viewOnly 
                        ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed' 
                        : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                    ]"
                    placeholder="Additional notes about this website"
                  ></textarea>
                </div>

                <!-- Footer -->
                <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="authStore.canCreateWebsite && !props.viewOnly"
                    type="submit"
                    :disabled="loading"
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isEditing ? 'Update Website' : 'Create Website' }}
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useWebsiteStore } from '@/stores/website'
import type { Website, Domain, Hosting, VPS } from '@/types'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
  website: Website | null
  domains: Domain[]
  hostingAccounts: Hosting[]
  vpsAccounts: VPS[]
  cmsOptions?: string[]
  viewOnly?: boolean
}>()

const emit = defineEmits(['close', 'website-created', 'website-updated'])

const websiteStore = useWebsiteStore()
const authStore = useAuthStore()

// CMS Options
const defaultCmsOptions = [
  'WordPress',
  'Joomla',
  'Drupal',
  'Magento',
  'Shopify',
  'WooCommerce',
  'Laravel',
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'Nuxt.js',
  'Custom PHP',
  'Custom Node.js',
  'Static HTML',
  'Other'
]

const cmsOptions = computed(() => props.cmsOptions || defaultCmsOptions)

// Reactive data
const loading = ref(false)
const form = ref({
  name: '',
  domainId: '',
  cms: '',
  notes: '',
  username: '',
  password: ''
})

// Computed properties
const isEditing = computed(() => !!props.website)
  // Computed property for available domains
  const availableDomains = computed(() => {
    if (!props.domains || props.domains.length === 0) {
      return []
    }

    return props.domains.filter(domain => {
      // If domain is not assigned to any website, it's available
      if (!domain.websites || domain.websites.length === 0) {
        return true
      }
      
      // If domain is assigned to current website (when editing), it's available
      if (isEditing.value && props.website && domain.websites.some(w => w.id === props.website!.id)) {
        return true
      }
      
      // Domain is assigned to other website, not available
      return false
    })
  })

  // Computed property for assigned hosting
  const assignedHosting = computed(() => {
    if (!form.value.domainId) return null
    
    const selectedDomain = props.domains?.find(d => d.id === form.value.domainId)
    if (!selectedDomain) return null
    
    return selectedDomain.hosting
  })

  // Computed property for assigned VPS
  const assignedVps = computed(() => {
    if (!form.value.domainId) return null
    
    const selectedDomain = props.domains?.find(d => d.id === form.value.domainId)
    if (!selectedDomain) return null
    
    return selectedDomain.vps
  })

  // Display current hosting/VPS assignment
const currentHosting = computed(() => {
  // If no domain is selected, don't show any hosting
  if (!form.value.domainId) {
    return null
  }
  
  // If we're editing and website has hosting, show it
  if (props.website?.hosting) {
    return props.website.hosting
  }
  
  // Show auto-assigned hosting based on domain
  return assignedHosting.value
})

const currentVps = computed(() => {
  // If no domain is selected, don't show any VPS
  if (!form.value.domainId) {
    return null
  }
  
  // If we're editing and website has VPS, show it
  if (props.website?.vps) {
    return props.website.vps
  }
  
  // Show auto-assigned VPS based on domain
  return assignedVps.value
})

// Methods
const closeModal = () => {
  if (!loading.value) {
    emit('close')
  }
}



const handleSubmit = async () => {
  if (!form.value.domainId) {
    alert('Please select a domain')
    return
  }
  
  loading.value = true
  try {
    // Get the selected domain to generate URL
    const selectedDomain = props.domains.find(d => d.id === form.value.domainId)
    const websiteUrl = selectedDomain ? `https://${selectedDomain.name}` : undefined

    // For editing, use existing hosting/VPS if available, otherwise use auto-assigned
    const existingHostingId = props.website?.hostingId || props.website?.hosting?.id
    const existingVpsId = props.website?.vpsId || props.website?.vps?.id
    
    const websiteData = {
      ...form.value,
      url: websiteUrl,
      hostingId: existingHostingId || assignedHosting.value?.id || undefined,
      vpsId: existingVpsId || assignedVps.value?.id || undefined
    }
    
    console.log('Website data being sent:', {
      ...websiteData,
      password: websiteData.password ? '[MASKED]' : 'undefined'
    })

    if (isEditing.value && props.website) {
      await websiteStore.updateWebsite(props.website.id, websiteData)
      emit('website-updated')
    } else {
      await websiteStore.createWebsite(websiteData)
      emit('website-created')
    }
  } catch (error) {
    console.error('Error saving website:', error)
    alert('Error saving website. Please try again.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
    form.value = { 
      name: '',
    domainId: '',
      cms: '',
      notes: '',
    username: '',
    password: ''
  }
}

const handleDomainChange = () => {
  console.log('Domain changed to:', form.value.domainId)
  console.log('Current hosting:', currentHosting.value)
  console.log('Current VPS:', currentVps.value)
  
  // Reset hosting/VPS assignment when domain is cleared
  if (!form.value.domainId) {
    console.log('Domain cleared, resetting hosting/VPS assignment')
  }
}

const populateForm = (website: Website) => {
  console.log('Populating form with website:', website)
  console.log('Website domain:', website.domain)
  console.log('Website CMS:', website.cms)
  console.log('Website notes:', website.notes)
  console.log('Website username:', website.username)
  console.log('Website password:', website.password ? '[MASKED]' : 'undefined')
  console.log('Website hosting:', website.hosting)
  console.log('Website VPS:', website.vps)
  
  // Reset form first
  form.value = {
    name: '',
    domainId: '',
    cms: '',
    notes: '',
    username: '',
    password: ''
  }
  
  // Then populate with website data
  form.value = {
    name: website.name || '',
    domainId: website.domain?.id || website.domainId || '',
    cms: website.cms || '',
    notes: website.notes || '',
    username: website.username || '',
    password: website.password || ''
  }
  
  console.log('Form populated with:', {
    ...form.value,
    password: form.value.password ? '[MASKED]' : 'undefined'
  })
  
  // Force reactivity update
  nextTick(() => {
    console.log('Form after nextTick:', {
      ...form.value,
      password: form.value.password ? '[MASKED]' : 'undefined'
    })
  })
}

// Watch for modal open/close and website changes
watch(() => props.isOpen, async (isOpen) => {
  console.log('Modal isOpen changed to:', isOpen)
  console.log('Current website prop:', props.website)
  
  if (isOpen) {
    await nextTick()
    if (props.website) {
      console.log('Populating form for editing')
      populateForm(props.website)
    } else {
      console.log('Resetting form for new website')
      resetForm()
    }
  }
})

watch(() => props.website, async (website) => {
  console.log('Website prop changed:', website)
  if (website && props.isOpen) {
    await nextTick()
    console.log('Populating form due to website prop change')
    populateForm(website)
  }
})

// Watch for domains to ensure they're loaded
watch(() => props.domains, (domains) => {
  console.log('Domains prop changed:', domains?.length)
  if (domains && domains.length > 0 && props.website && props.isOpen) {
    console.log('Domains loaded, repopulating form')
    nextTick(() => {
      populateForm(props.website!)
    })
  }
})

// Watch for domain changes to update hosting/VPS assignment
watch(() => form.value.domainId, (newDomainId) => {
  console.log('Domain changed to:', newDomainId)
  console.log('Assigned hosting:', assignedHosting.value)
  console.log('Assigned VPS:', assignedVps.value)
})

// Debug mounted
onMounted(() => {
  console.log('AddEditWebsiteModal mounted')
  console.log('Initial props:', {
    isOpen: props.isOpen,
    website: props.website,
    domains: props.domains?.length,
    hostingAccounts: props.hostingAccounts?.length,
    vpsAccounts: props.vpsAccounts?.length
  })
  
  // If modal is already open and we have a website, populate form
  if (props.isOpen && props.website) {
    console.log('Modal already open with website, populating form')
    nextTick(() => {
      populateForm(props.website!)
    })
  }
})


</script> 