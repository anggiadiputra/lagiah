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

    <!-- Account Statistics Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Account Statistics</h2>
        <p class="text-sm text-gray-600 mt-1">Overview of your account activity and usage</p>
      </div>
      
      <div class="p-6">
        <!-- Main Statistics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.totalLogins || 0 }}</div>
            <div class="text-sm text-blue-700 font-medium">Total Logins</div>
            <div class="text-xs text-blue-600 mt-1">{{ stats.loginTrend || '+12% this month' }}</div>
          </div>
          
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-2xl font-bold text-green-600">{{ stats.lastLogin || 'Never' }}</div>
            <div class="text-sm text-green-700 font-medium">Last Login</div>
            <div class="text-xs text-green-600 mt-1">{{ stats.lastLoginIP || '192.168.1.1' }}</div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.accountAge || 0 }}</div>
            <div class="text-sm text-purple-700 font-medium">Days Active</div>
            <div class="text-xs text-purple-600 mt-1">Since {{ formatDate(authStore.user?.createdAt) }}</div>
          </div>
          
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
            <div class="flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-2xl font-bold text-orange-600">{{ stats.sessionCount || 1 }}</div>
            <div class="text-sm text-orange-700 font-medium">Active Sessions</div>
            <div class="text-xs text-orange-600 mt-1">{{ stats.deviceCount || '1 device' }}</div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-3">
            <div v-for="activity in stats.recentActivity" :key="activity.id" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="{
                    'bg-green-100': activity.type === 'login',
                    'bg-blue-100': activity.type === 'profile_update',
                    'bg-yellow-100': activity.type === 'password_change',
                    'bg-red-100': activity.type === 'failed_login'
                  }"
                >
                  <svg class="w-4 h-4" 
                    :class="{
                      'text-green-600': activity.type === 'login',
                      'text-blue-600': activity.type === 'profile_update',
                      'text-yellow-600': activity.type === 'password_change',
                      'text-red-600': activity.type === 'failed_login'
                    }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path v-if="activity.type === 'login'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    <path v-else-if="activity.type === 'profile_update'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    <path v-else-if="activity.type === 'password_change'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ activity.timestamp }} • {{ activity.ip }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger Zone Card -->
    <div class="bg-white rounded-lg shadow-sm border border-red-200">
      <div class="px-6 py-4 border-b border-red-200">
        <h2 class="text-lg font-semibold text-red-900">Danger Zone</h2>
        <p class="text-sm text-red-600 mt-1">Irreversible and destructive actions - proceed with caution</p>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Terminate All Sessions -->
        <div class="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 class="text-sm font-medium text-orange-900">Terminate All Sessions</h3>
            </div>
            <p class="text-sm text-orange-700">Sign out from all devices and invalidate all active sessions</p>
            <p class="text-xs text-orange-600 mt-1">You'll need to log in again on all devices</p>
          </div>
          <button
            @click="terminateAllSessions"
            :disabled="isTerminatingSessions"
            class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isTerminatingSessions">Terminating...</span>
            <span v-else>Terminate All</span>
          </button>
        </div>

        <!-- Delete Account -->
        <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 class="text-sm font-medium text-red-900">Delete Account</h3>
            </div>
            <p class="text-sm text-red-700">Permanently delete your account and all associated data</p>
            <p class="text-xs text-red-600 mt-1">This action cannot be undone</p>
          </div>
          <button
            @click="showDeleteConfirm = true"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete Account</h3>
        <p class="text-sm text-gray-600 mb-4">This action will permanently delete your account and all associated data. This cannot be undone.</p>
        <p class="text-sm text-gray-600 mb-4">To confirm, please type <strong>DELETE</strong> in the field below:</p>
        <input
          v-model="deleteConfirmText"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          placeholder="Type DELETE to confirm"
        />
        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            @click="deleteAccount"
            :disabled="deleteConfirmText !== 'DELETE'"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'

const authStore = useAuthStore()
const router = useRouter()

// Reactive data
const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const isTerminatingSessions = ref(false)

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

// Stats
const stats = reactive({
  totalLogins: 0,
  lastLogin: 'Never',
  accountAge: 0,
  loginTrend: '+12% this month',
  lastLoginIP: '192.168.1.1',
  sessionCount: 1,
  deviceCount: '1 device',

  recentActivity: [
    {
      id: 1,
      type: 'login',
      description: 'Successful login from Chrome on Windows',
      timestamp: '2 hours ago',
      ip: '192.168.1.1'
    },
    {
      id: 2,
      type: 'profile_update',
      description: 'Profile information updated',
      timestamp: '1 day ago',
      ip: '192.168.1.1'
    },
    {
      id: 3,
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: '3 days ago',
      ip: '192.168.1.1'
    },
    {
      id: 4,
      type: 'login',
      description: 'Successful login from Safari on iPhone',
      timestamp: '1 week ago',
      ip: '10.0.0.1'
    }
  ]
})

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
    
    const response = await apiService.put('/auth/profile', {
      name: profileForm.name,
      email: profileForm.email
    })

    // Profile update response received
    
    // Handle response structure from API interceptor
    const responseData = response.data ? response.data : response
    
    // Profile update response data processed
    
    if (responseData.status === 'success') {
      // For profile update, responseData.data contains the updated user
      if (responseData.data && responseData.data.id) {
        authStore.user = responseData.data
        // Profile updated successfully
        alert('Profile updated successfully!')
      } else {
        // Profile update response processed
        alert('Profile updated successfully!')
      }
    } else {
      // Failed to update profile
      alert(`Failed to update profile: ${responseData.error?.message}`)
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
    
    const response = await apiService.post('/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    // Password change response received
    
    // Handle response structure from API interceptor
    const responseData = response.data ? response.data : response
    
    // Password change response data processed
    
    if (responseData.status === 'success') {
      // Clear form
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      
      // Password changed successfully
      alert('Password changed successfully! You can now use your new password to login.')
    } else {
      // Failed to change password
      alert(`Failed to change password: ${responseData.error?.message}`)
    }
  } catch (error) {
    // Error changing password
    alert('Error changing password. Please try again.')
  } finally {
    isPasswordLoading.value = false
  }
}

const terminateAllSessions = async () => {
  if (!confirm('Are you sure you want to terminate all active sessions? You will be logged out from all devices.')) {
    return
  }
  
  isTerminatingSessions.value = true
  try {
    // Terminating all sessions
    
    // TODO: Implement API call to terminate all sessions
    const response = await apiService.post('/auth/terminate-sessions')
    
    if (response.data?.status === 'success') {
      alert('All sessions terminated successfully. You will be logged out.')
      await authStore.logout()
      router.push('/login')
    } else {
      alert('Failed to terminate sessions. Please try again.')
    }
  } catch (error) {
    // Error terminating sessions
    alert('Error terminating sessions. Please try again.')
  } finally {
    isTerminatingSessions.value = false
  }
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'DELETE') {
    alert('Please type DELETE to confirm')
    return
  }
  
  try {
    // TODO: Implement account deletion API call
    // Deleting account
    
    const response = await apiService.delete('/auth/account')
    
    if (response.data?.status === 'success') {
      alert('Account deleted successfully.')
      await authStore.logout()
      router.push('/login')
    } else {
      alert('Failed to delete account. Please try again.')
    }
  } catch (error) {
    // Error deleting account
    alert('Error deleting account. Please try again.')
  }
}

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
  
  // TODO: Load user stats from API
  stats.totalLogins = 42
  stats.lastLogin = '2 hours ago'
  stats.accountAge = 30
})
</script> 