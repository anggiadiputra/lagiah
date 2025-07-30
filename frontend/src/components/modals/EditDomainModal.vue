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
                    <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-2xl font-semibold text-gray-900">
                      Edit Domain
                    </DialogTitle>
                    <p class="text-sm text-gray-500 mt-1">Update domain information and settings</p>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Domain Name (Read-only) -->
                <div>
                  <label for="domain" class="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name
                  </label>
                  <input
                    id="domain"
                    :value="form.domain"
                    type="text"
                    disabled
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                  >
                  <p class="mt-1 text-sm text-gray-500">
                    Domain name cannot be changed
                  </p>
                </div>

                <!-- Registrar Field -->
                <div>
                  <label for="registrar" class="block text-sm font-medium text-gray-700 mb-2">
                    Registrar
                  </label>
                  <input
                    id="registrar"
                    v-model="form.registrar"
                    type="text"
                    :disabled="isLoading"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Domain registrar name"
                  >
                </div>

                <!-- Status Field -->
                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    v-model="form.status"
                    :disabled="isLoading"
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TRANSFERRED">Transferred</option>
                    <option value="DELETED">Deleted</option>
                  </select>
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
                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm resize-none"
                    placeholder="Any additional notes about this domain..."
                  ></textarea>
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
                    :disabled="isLoading"
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isLoading ? 'Updating...' : 'Update Domain' }}
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
import type { Domain } from '@/types'

// Props
interface Props {
  isOpen: boolean
  domain: Domain | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  success: [domain: Domain]
}>()

// Stores
const domainStore = useDomainStore()
const hostingStore = useHostingStore()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  domain: '',
  registrar: '',
  status: 'ACTIVE',
  notes: ''
})

const resetForm = () => {
  form.value = {
    domain: '',
    registrar: '',
    status: 'ACTIVE',
    notes: ''
  }
  error.value = null
}

const closeModal = () => {
  resetForm()
  emit('close')
}



// Update form when domain prop changes
watch(() => props.domain, (newDomain) => {
  if (newDomain) {
    form.value = {
      domain: newDomain.name,
      registrar: newDomain.registrar || '',
      status: newDomain.status,
      notes: newDomain.notes || ''
    }
  }
}, { immediate: true })

// Handle form submission
const handleSubmit = async () => {
  if (!props.domain) return

  isLoading.value = true
  error.value = null

  try {
    const domainData = {
      registrar: form.value.registrar || undefined,
      status: form.value.status,

      notes: form.value.notes || undefined,
    }

    console.log('[EditDomainModal] Submitting with data:', domainData)
    
    const response = await domainStore.updateDomain(props.domain.id, domainData)

    if (response && typeof response === 'object' && 'status' in response && response.status === 'success') {
      console.log('[EditDomainModal] Domain updated successfully:', response)
      const updatedDomain = (response as any).data || props.domain
      emit('success', updatedDomain)
      closeModal()
    } else {
      console.error('[EditDomainModal] Failed to update domain:', response)
      error.value = (response as any)?.message || (response as any)?.error?.message || 'An unknown error occurred.'
    }

  } catch (err: any) {
    console.error('[EditDomainModal] Exception during submission:', err)
    error.value = err.message || 'An unexpected client-side error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script> 