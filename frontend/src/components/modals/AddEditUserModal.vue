<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ isEditing ? 'Edit User' : 'Add New User' }}
              </h3>
              <div class="mt-4">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <!-- Name -->
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Enter full name"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      :disabled="isEditing"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                      :class="{ 'bg-gray-50': isEditing }"
                      placeholder="Enter email address"
                    />
                  </div>

                  <!-- Role -->
                  <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      id="role"
                      v-model="form.role"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Select a role</option>
                      <option value="ADMIN">Admin</option>
                      <option value="STAFF">Staff</option>
                      <option value="FINANCE">Finance</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </div>

                  <!-- Password (only for new users) -->
                  <div v-if="!isEditing">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      id="password"
                      v-model="form.password"
                      type="password"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Enter password"
                    />
                  </div>

                  <!-- Confirm Password (only for new users) -->
                  <div v-if="!isEditing">
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      type="password"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="Confirm password"
                    />
                  </div>

                  <!-- Error message -->
                  <div v-if="error" class="text-red-600 text-sm">
                    {{ error }}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="loading"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            :disabled="loading"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import usersService, { type User } from '@/services/users'

// Props
interface Props {
  isOpen: boolean
  user?: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER'
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null
})

// Emits
const emit = defineEmits<{
  close: []
  userCreated: [user: any]
  userUpdated: [user: any]
}>()

// Reactive data
const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: ''
})

// Computed
const isEditing = computed(() => !!props.user)

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  }
  error.value = null
}

const populateForm = () => {
  console.log('Populate form called with user:', props.user)
  if (props.user) {
    form.value = {
      name: props.user.name || '',
      email: props.user.email || '',
      role: props.user.role || '',
      password: '',
      confirmPassword: ''
    }
    console.log('Form populated:', form.value)
  } else {
    console.log('No user data to populate')
  }
}

const closeModal = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const validateForm = (): boolean => {
  error.value = null

  if (!form.value.name.trim()) {
    error.value = 'Name is required'
    return false
  }

  if (!form.value.email.trim()) {
    error.value = 'Email is required'
    return false
  }

  if (!form.value.role) {
    error.value = 'Role is required'
    return false
  }

  if (!isEditing.value) {
    if (!form.value.password) {
      error.value = 'Password is required'
      return false
    }

    if (form.value.password.length < 6) {
      error.value = 'Password must be at least 6 characters'
      return false
    }

    if (form.value.password !== form.value.confirmPassword) {
      error.value = 'Passwords do not match'
      return false
    }
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = null

  try {
    if (isEditing.value && props.user) {
      // Update existing user
      const userData = {
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        role: form.value.role as 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER',
        ...(form.value.password ? { password: form.value.password } : {})
      }

      console.log('Updating user with data:', userData)
      const response = await usersService.updateUser(props.user.id, userData)
      console.log('Update response:', response)
      
      // The response from usersService.updateUser() is response.data from API
      // So the structure is: { message: "...", user: {...} }
      if (response && response.user) {
        emit('userUpdated', response.user)
      } else {
        console.error('Invalid response structure:', response)
        error.value = 'Invalid response from server'
        return
      }
    } else {
      // Create new user
      const userData = {
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        password: form.value.password,
        role: form.value.role as 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER'
      }

      console.log('Creating user with data:', userData)
      const response = await usersService.createUser(userData)
      console.log('Create response:', response)
      
      // The response from usersService.createUser() is response.data from API
      // So the structure is: { message: "...", user: {...} }
      console.log('Create user response in modal:', response)
      if (response && response.user) {
        emit('userCreated', response.user)
      } else {
        console.error('Invalid response structure:', response)
        error.value = 'Invalid response from server'
        return
      }
    }

    closeModal()
  } catch (err: any) {
    console.error('Error saving user:', err)
    if (err.response?.data?.error?.message) {
      error.value = err.response.data.error.message
    } else {
      error.value = 'Failed to save user. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.isOpen, (newValue) => {
  console.log('Modal isOpen changed:', newValue)
  if (newValue) {
    nextTick(() => {
      populateForm()
    })
  }
})

watch(() => props.user, (newUser) => {
  console.log('User prop changed:', newUser)
  if (props.isOpen && newUser) {
    nextTick(() => {
      populateForm()
    })
  }
}, { immediate: true })
</script> 