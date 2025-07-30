<template>
  <AuthLayout title="Reset your password" subtitle="Enter your email to receive a password reset link">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Email input -->
      <div>
        <label for="email" class="form-label">Email address</label>
        <div class="mt-1">
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="form-input"
            :disabled="isSubmitting"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': error }"
          />
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Submit button -->
      <div>
        <button
          type="submit"
          class="btn-primary w-full flex justify-center py-2 px-4"
          :disabled="isSubmitting"
        >
          <svg
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Sending...' : 'Send reset link' }}
        </button>
      </div>
    </form>

    <template #footer>
      <p class="text-sm text-gray-600">
        Remember your password?
        <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
          Back to login
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Form state
const email = ref('')
const isSubmitting = ref(false)
const error = ref('')

// Get router for navigation
const router = useRouter()

// Get layout component ref for alerts
const authLayout = ref<InstanceType<typeof AuthLayout> | null>(null)

// Handle form submission
const handleSubmit = async () => {
  // Clear previous errors
  error.value = ''

  // Basic validation
  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  // Set loading state
  isSubmitting.value = true

  try {
    // In a real app, call your API
    // Example: await authService.forgotPassword(email.value)
    
    // For demo purposes, we'll simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    if (authLayout.value) {
      authLayout.value.showAlert({
        type: 'success',
        title: 'Reset link sent',
        message: 'Check your email for password reset instructions.'
      })
    }
    
    // Clear form
    email.value = ''
  } catch (err) {
    // Handle API error
    error.value = 'Failed to send reset link. Please try again.'
    console.error('Forgot password error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script> 