<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white shadow-sm rounded-lg">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
          </div>
          
          <!-- Search and Actions Row -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <!-- Simple Search Bar -->
            <div class="w-full sm:w-80 lg:w-96">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input 
                  id="search" 
                  v-model="search" 
                  type="text" 
                  class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm" 
                  :placeholder="searchPlaceholder" 
                  aria-label="Search users"
                >
                <!-- Clear Search Button -->
                <div v-if="search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    @click="clearSearch"
                    class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    title="Clear search"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Search Help Text -->
              <div class="mt-1 text-xs text-gray-500">
                <span>Search names and emails</span>
              </div>
            </div>
            
            <!-- Search Filters -->
            <div class="flex items-center space-x-2">
              <!-- Role Filter -->
              <select 
                v-model="roleFilter" 
                @change="handleFilterChange"
                class="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
                <option value="FINANCE">Finance</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button 
                @click="fetchUsers()"
                :disabled="loading"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
                title="Refresh users"
              >
                <svg :class="loading ? 'animate-spin' : ''" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                v-if="authStore.canAccessUsers"
                @click="openAddUserModal()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results Summary -->
    <div v-if="hasActiveFilters" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="text-sm font-medium text-blue-900">
              Search Results: {{ filteredUsers.length }} users found
            </span>
          </div>
          
          <!-- Active Filters -->
          <div class="flex flex-wrap items-center space-x-2">
            <span v-if="search" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{{ search }}"
              <button @click="clearSearch" class="ml-1 text-blue-600 hover:text-blue-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            
            <span v-if="roleFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Role: {{ roleFilter }}
              <button @click="roleFilter = ''; handleFilterChange()" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
        
        <!-- Clear All Filters -->
        <button 
          @click="clearAllFilters"
          class="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading users...
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8 text-center">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">Error loading users</h3>
          <p class="mt-1">{{ error }}</p>
        </div>
        <button 
          @click="fetchUsers()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>

      <!-- Content Area -->
      <div v-else-if="!loading && !error && filteredUsers.length > 0">
        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-600">
                          {{ user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': user.role === 'ADMIN',
                      'bg-blue-100 text-blue-800': user.role === 'STAFF',
                      'bg-purple-100 text-purple-800': user.role === 'FINANCE',
                      'bg-gray-100 text-gray-800': user.role === 'VIEWER'
                    }"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="openEditUserModal(user)"
                      class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                      title="Edit user"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete user"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden">
          <div class="space-y-4 p-4">
            <div 
              v-for="user in filteredUsers" 
              :key="user.id" 
              class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary-600">
                      {{ user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                    <div class="flex items-center space-x-2 mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': user.role === 'ADMIN',
                          'bg-blue-100 text-blue-800': user.role === 'STAFF',
                          'bg-purple-100 text-purple-800': user.role === 'FINANCE',
                          'bg-gray-100 text-gray-800': user.role === 'VIEWER'
                        }"
                      >
                        {{ user.role }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditUserModal(user)"
                    class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                    title="Edit user"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteUser(user)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                    title="Delete user"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="filteredUsers.length === 0 && !loading" class="p-8 text-center">
        <div class="text-gray-500 mb-4">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 class="text-lg font-medium">No users found</h3>
          <p class="mt-1 text-sm">
            {{ hasActiveFilters ? 'Try adjusting your search or filters.' : 'Get started by adding your first user.' }}
          </p>
        </div>
        <div class="flex flex-col space-y-4 items-center">
          <button 
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
          <button 
            v-else
            @click="openAddUserModal()"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Add Your First User
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddEditUserModal 
      v-if="isModalOpen" 
      :is-open="isModalOpen"
      :user="selectedUser" 
      @close="closeModal" 
      @userCreated="handleUserCreated" 
      @userUpdated="handleUserUpdated"
      :error="modalError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AddEditUserModal from '@/components/modals/AddEditUserModal.vue'
import { usersService } from '@/services/users'
import type { User } from '@/types'

// Store
const authStore = useAuthStore()

// Reactive data
const users = ref<User[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isModalOpen = ref(false)
const selectedUser = ref<User | null>(null)
const modalError = ref<string | null>(null)

// Search and filter
const search = ref('')
const roleFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

// Search placeholder
const searchPlaceholder = computed(() => {
  return 'Search names and emails...'
})

// Client-side filtered users
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (search.value && search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    )
  }

  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

// Clear search
const clearSearch = () => {
  search.value = ''
}

// Clear all filters
const clearAllFilters = () => {
  search.value = ''
  roleFilter.value = ''
}

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return search.value || roleFilter.value
})

// Handle filter changes
const handleFilterChange = () => {
  // No API call needed for client-side filtering
  console.log('Filter changed - Role:', roleFilter.value)
}

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await usersService.getUsers({
      page: currentPage.value,
      limit: itemsPerPage.value
    })
    
    console.log('Users response:', response)
    
    if (response && response.items) {
      users.value = response.items
      totalItems.value = response.pagination.total
      totalPages.value = response.pagination.totalPages
      currentPage.value = response.pagination.page
    } else {
      console.error('Unexpected response structure:', response)
      error.value = 'Invalid response format from server'
    }
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const openAddUserModal = () => {
  selectedUser.value = null
  isModalOpen.value = true
}

const openEditUserModal = (user: User) => {
  selectedUser.value = user
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
  modalError.value = null
}

const handleUserCreated = (user: User) => {
  console.log('User created:', user)
  // Add new user to the list
  users.value.unshift(user)
  closeModal()
  // Show success message
  alert('User created successfully!')
}

const handleUserUpdated = (user: User) => {
  console.log('User updated:', user)
  // Update existing user in the list
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index] = user
  }
  closeModal()
  // Show success message
  alert('User updated successfully!')
}

const confirmDeleteUser = (user: User) => {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    deleteUser(user.id)
  }
}

const deleteUser = async (userId: string) => {
  try {
    console.log('Deleting user:', userId)
    
    // Call the API to delete user
    const response = await usersService.deleteUser(userId)
    console.log('Delete response:', response)
    
    // Check if the response indicates success
    if (response && response.status === 'success') {
      // Remove from local state
      users.value = users.value.filter(user => user.id !== userId)
      
      // Show success message
      alert('User deleted successfully!')
      
      // Refresh the user list to ensure data is in sync
      await fetchUsers()
    } else {
      console.error('Unexpected response format:', response)
      throw new Error('Failed to delete user - unexpected response format')
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    error.value = 'Failed to delete user. Please try again.'
    alert('Failed to delete user. Please try again.')
  }
}

// Pagination helper
const getVisiblePages = (): (number | string)[] => {
  const pages: (number | string)[] = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Show current page and surrounding pages
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...' as string)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < totalPages.value) {
      if (end < totalPages.value - 1) pages.push('...' as string)
      pages.push(totalPages.value)
    }
  }
  
  return pages
}

// Watchers for pagination and search
// watch([search, roleFilter], () => {
//   currentPage.value = 1 // Reset to first page when filtering
//   fetchUsers()
// })

// watch([currentPage, itemsPerPage], () => {
//   fetchUsers()
// })

// Lifecycle
// onMounted(() => {
//   fetchUsers()
// })
</script> 