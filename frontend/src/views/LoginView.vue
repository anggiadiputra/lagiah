<template>
  <AuthLayout ref="authLayout" title="Sign in to your account" subtitle="Manage your domains and hosting">
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
            :disabled="authStore.loading"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
        </div>
      </div>

      <!-- Password input -->
      <div>
        <label for="password" class="form-label">Password</label>
        <div class="mt-1 relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            required
            class="form-input pr-10"
            :disabled="authStore.loading"
            :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          >
            <svg
              v-if="showPassword"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          </button>
          <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
        </div>
      </div>

      <!-- Remember me & Forgot password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="rememberMe"
            name="remember-me"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <router-link to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
            Forgot your password?
          </router-link>
        </div>
      </div>

      <!-- Submit button -->
      <div>
        <button
          type="submit"
          class="btn-primary w-full flex justify-center py-2 px-4"
          :disabled="authStore.loading"
        >
          <svg
            v-if="authStore.loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </div>
    </form>

    <template #footer>
      <p class="text-sm text-gray-600">
        Don't have an account?
        <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
          Contact your administrator
        </a>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

// Get auth store
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const errors = reactive({
  email: '',
  password: '',
})

// Get router for navigation
const router = useRouter()

// Get layout component ref for alerts
const authLayout = ref<InstanceType<typeof AuthLayout> | null>(null)

// Handle form submission
const handleSubmit = async () => {
  // Clear previous errors
  errors.email = ''
  errors.password = ''

  // Basic validation
  if (!email.value) {
    errors.email = 'Email is required'
    return
  }

  if (!password.value) {
    errors.password = 'Password is required'
    return
  }

  try {
    // Call login from auth store
    const result = await authStore.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value
    })
    
    if (result.status === 'success') {
      // Get redirect path from query or default to dashboard
      const redirectPath = router.currentRoute.value.query.redirect as string
      const targetPath = redirectPath && redirectPath !== 'logout' ? redirectPath : '/dashboard'
      console.log('Login successful, redirecting to:', targetPath)
      router.push(targetPath)
    } else if (authLayout.value) {
      // Show error in alert
      authLayout.value.showAlert({
        type: 'error',
        title: 'Login failed',
        message: result.message || 'Please check your email and password and try again.'
      })
    }
  } catch (error) {
    // This should be caught by the auth store, but just in case
    console.error('Login error:', error)
    if (authLayout.value) {
      authLayout.value.showAlert({
        type: 'error',
        title: 'Login failed',
        message: 'An unexpected error occurred. Please try again.'
      })
    }
  }
}

// Check for redirect params (e.g., after logout)
onMounted(() => {
  // Initialize auth store
  authStore.initialize()
  
  const { query } = router.currentRoute.value
  
  if (query.redirect === 'logout') {
    if (authLayout.value) {
      authLayout.value.showAlert({
        type: 'success',
        title: 'Logged out successfully',
        message: 'You have been logged out of your account.'
      })
    }
  }
  
  if (query.expired === 'true') {
    if (authLayout.value) {
      authLayout.value.showAlert({
        type: 'info',
        title: 'Session expired',
        message: 'Your session has expired. Please sign in again.'
      })
    }
  }
})
</script> 