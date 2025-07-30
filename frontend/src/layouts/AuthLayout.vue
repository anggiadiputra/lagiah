<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img 
        class="mx-auto h-12 w-auto" 
        src="../assets/logo.svg" 
        alt="Domain Management System" 
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ title }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600" v-if="subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Main content slot -->
        <slot></slot>
      </div>
      
      <!-- Footer slot for links -->
      <div class="mt-6 text-center" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
    
    <!-- Alert for errors or notifications -->
    <div 
      v-if="alert" 
      class="fixed bottom-4 inset-x-0 flex items-center justify-center"
    >
      <div 
        class="bg-red-50 p-4 rounded-md border border-red-200 shadow-lg max-w-md"
        :class="{
          'bg-red-50 border-red-200': alert.type === 'error',
          'bg-green-50 border-green-200': alert.type === 'success',
          'bg-blue-50 border-blue-200': alert.type === 'info',
        }"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <!-- Error icon -->
            <svg 
              v-if="alert.type === 'error'"
              class="h-5 w-5 text-red-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <!-- Success icon -->
            <svg 
              v-else-if="alert.type === 'success'"
              class="h-5 w-5 text-green-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <!-- Info icon -->
            <svg 
              v-else
              class="h-5 w-5 text-blue-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 
              class="text-sm font-medium"
              :class="{
                'text-red-800': alert.type === 'error',
                'text-green-800': alert.type === 'success',
                'text-blue-800': alert.type === 'info',
              }"
            >
              {{ alert.title }}
            </h3>
            <div 
              v-if="alert.message"
              class="mt-2 text-sm"
              :class="{
                'text-red-700': alert.type === 'error',
                'text-green-700': alert.type === 'success',
                'text-blue-700': alert.type === 'info',
              }"
            >
              <p>{{ alert.message }}</p>
            </div>
          </div>
          <!-- Close button -->
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button 
                @click="clearAlert"
                class="inline-flex rounded-md p-1.5"
                :class="{
                  'bg-red-50 text-red-500 hover:bg-red-100': alert.type === 'error',
                  'bg-green-50 text-green-500 hover:bg-green-100': alert.type === 'success',
                  'bg-blue-50 text-blue-500 hover:bg-blue-100': alert.type === 'info',
                }"
              >
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Welcome back',
  subtitle: '',
})

interface Alert {
  type: 'error' | 'success' | 'info'
  title: string
  message?: string
}

const alert = ref<Alert | null>(null)

// Method to show an alert
const showAlert = (newAlert: Alert) => {
  alert.value = newAlert
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    clearAlert()
  }, 5000)
}

// Method to clear the alert
const clearAlert = () => {
  alert.value = null
}

// Expose methods to parent components
defineExpose({
  showAlert,
  clearAlert
})
</script> 