<template>
  <div class="max-w-4xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">User Account</h1>
      <p class="mt-2 text-gray-600">Manage your account settings and profile information</p>
    </div>

    <!-- Profile Information Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
        <p class="text-sm text-gray-600 mt-1">Update your personal information and contact details</p>
      </div>
      
      <div class="p-6">
        <div class="flex items-center space-x-6 mb-6">
          <!-- Avatar -->
          <div class="relative">
            <img
              :src="userAvatar"
              alt="Profile"
              class="h-20 w-20 rounded-full border-4 border-gray-200"
            />
            <button
              @click="changeAvatar"
              class="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-1 hover:bg-primary-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <!-- User Info -->
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900">{{ authStore.user?.name || 'User Name' }}</h3>
            <p class="text-gray-600">{{ authStore.user?.email || 'user@example.com' }}</p>
            <div class="flex items-center mt-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': authStore.user?.role === 'ADMIN',
                  'bg-blue-100 text-blue-800': authStore.user?.role === 'STAFF',
                  'bg-gray-100 text-gray-800': authStore.user?.role === 'VIEWER'
                }"
              >
                {{ authStore.user?.role || 'USER' }}
              </span>
              <span class="ml-2 text-xs text-gray-500">Member since {{ formatDate(authStore.user?.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
          

          
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isProfileLoading"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isProfileLoading">Updating...</span>
              <span v-else>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Security Settings Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Security Settings</h2>
        <p class="text-sm text-gray-600 mt-1">Manage your password and security preferences</p>
      </div>
      
      <div class="p-6">
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isPasswordLoading"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isPasswordLoading">Changing...</span>
              <span v-else>Change Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Statistics, Recent Activity, and Danger Zone sections removed -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import authService from '@/services/auth'

const authStore = useAuthStore()
const router = useRouter()

// Reactive data
const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)

// Profile form
const profileForm = reactive({
  name: '',
  email: ''
})

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Stats object removed

// Computed
const userAvatar = computed(() => {
  if (authStore.user?.name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user.name)}&background=3b82f6&color=ffffff&size=80`
  }
  return 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=ffffff&size=80'
})

// Methods
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const changeAvatar = () => {
  // TODO: Implement avatar change functionality
  // Change avatar clicked
}

const updateProfile = async () => {
  isProfileLoading.value = true
  try {
    // Updating profile
    
    const response = await authService.updateProfile({
      name: profileForm.name,
      email: profileForm.email
    })

    // Profile update response received
    
    // Handle response structure from auth service
    if (response.status === 'success') {
      // For profile update, response.data contains the updated user
      if (response.data && response.data.user) {
        authStore.user = response.data.user
        // Profile updated successfully
        alert('Profile updated successfully!')
      } else {
        // Profile update response processed
        alert('Profile updated successfully!')
      }
    } else {
      // Failed to update profile
      alert('Failed to update profile. Please try again.')
    }
  } catch (error) {
    // Error updating profile
    alert('Error updating profile. Please try again.')
  } finally {
    isProfileLoading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('New passwords do not match')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    alert('New password must be at least 6 characters long')
    return
  }
  
  isPasswordLoading.value = true
  try {
    // Changing password
    
    const response = await authService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    // Password change response received
    
    // Handle response structure from auth service
    
    if (response.status === 'success') {
      // Clear form
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      
      // Password changed successfully
      alert('Password changed successfully! You can now use your new password to login.')
    } else {
      // Failed to change password
      alert('Failed to change password. Please try again.')
    }
  } catch (error) {
    // Error changing password
    alert('Error changing password. Please try again.')
  } finally {
    isPasswordLoading.value = false
  }
}

// Functions for terminateAllSessions and deleteAccount removed

// Function to update form data
const updateFormData = () => {
  if (authStore.user) {
    profileForm.name = authStore.user.name || ''
    profileForm.email = authStore.user.email || ''
    // Form data updated
  }
}

// Watch for changes in authStore.user
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    updateFormData()
  }
}, { immediate: true })

// Initialize form data
onMounted(async () => {
  // Ensure auth store is initialized
  await authStore.initialize()
  
  // Update form data
  updateFormData()
})
</script> 