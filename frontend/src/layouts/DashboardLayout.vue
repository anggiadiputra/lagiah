<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile sidebar backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
    ></div>
    
    <!-- Sidebar -->
    <div 
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0'
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center justify-center border-b border-gray-200">
          <img
            class="h-8 w-auto"
            src="../assets/logo.svg"
            alt="Domain Management System"
          />
        </div>
        
        <!-- Navigation Menu -->
        <nav class="flex-1 space-y-1 px-2 py-4">
          <router-link
            v-for="item in (Array.isArray(navigation) ? navigation : [])"
            :key="item.name"
            :to="item.href"
            :class="[
              isActive(item.href)
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
            ]"
          >
            <svg
              v-if="item.icon === 'DashboardIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <svg
              v-else-if="item.icon === 'GlobeIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <svg
              v-else-if="item.icon === 'ServerIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <svg
              v-else-if="item.icon === 'DatabaseIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <svg
              v-else-if="item.icon === 'FolderIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <svg
              v-else-if="item.icon === 'UsersIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <svg
              v-else-if="item.icon === 'SettingsIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065c.426-1.756 2.924-1.756 3.35 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg
              v-else-if="item.icon === 'UserIcon'"
              :class="[
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500',
                'mr-3 h-5 w-5'
              ]"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {{ item.name }}
          </router-link>
        </nav>
        
        <!-- User Profile Section -->
        <div class="border-t border-gray-200 p-4">
          <router-link 
            to="/profile" 
            class="flex items-center hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors cursor-pointer"
          >
            <img
              class="h-8 w-8 rounded-full"
              :src="userAvatar"
              alt=""
            />
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-700">{{ authStore.user?.name || 'User' }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.email || 'user@example.com' }}</p>
            </div>
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
          <div class="mt-3 space-y-1">
            <button
              @click="logout"
              class="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <svg class="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="bg-white shadow-sm">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center">
            <!-- Mobile menu button -->
            <button
              @click="isSidebarOpen = true"
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              <span class="sr-only">Open sidebar</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <!-- Page title -->
            <h1 class="ml-2 text-2xl font-semibold text-gray-900 lg:ml-0">{{ pageTitle }}</h1>
          </div>
          
          <!-- Right side items -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button
              type="button"
              class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span class="sr-only">View notifications</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Main content -->
      <main class="flex-1 overflow-y-auto bg-gray-100 p-6">
        <!-- Alert for notifications -->
        <div 
          v-if="alert" 
          class="mb-6 rounded-md p-4"
          :class="{
            'bg-red-50': alert.type === 'error',
            'bg-green-50': alert.type === 'success',
            'bg-blue-50': alert.type === 'info',
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
        
        <!-- Content area -->
        <div class="bg-white rounded-lg shadow">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, withDefaults, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
})

// Use auth store
const authStore = useAuthStore()

// Navigation items with icons
const navigation = computed(() => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'DashboardIcon' },
    { name: 'Domains', href: '/domains', icon: 'GlobeIcon' },
    { name: 'Hosting', href: '/hosting', icon: 'ServerIcon' },
    { name: 'VPS', href: '/vps', icon: 'DatabaseIcon' },
    { name: 'Websites', href: '/websites', icon: 'FolderIcon' },
    { name: 'Profile', href: '/profile', icon: 'UserIcon' },
  ]

  // Add admin-only items if user can access them
  if (authStore.canAccessUsers) {
    baseNavigation.push({ name: 'Users', href: '/users', icon: 'UsersIcon' })
  }
  
  if (authStore.canAccessSettings) {
    baseNavigation.push({ name: 'Settings', href: '/settings', icon: 'SettingsIcon' })
  }

  return baseNavigation
})

// State for dropdowns and sidebar
const isProfileOpen = ref(false)
const isSidebarOpen = ref(false)

// Get route for active link detection
const route = useRoute()
const router = useRouter()

// Check if a link is active
const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(`${href}/`)
}

// Get page title based on current route
const pageTitle = computed(() => {
  const navItems = navigation.value
  if (!Array.isArray(navItems)) {
    return 'Dashboard'
  }
  const currentNav = navItems.find(item => isActive(item.href))
  return currentNav?.name || 'Dashboard'
})

// User avatar - generate from name or use default
const userAvatar = computed(() => {
  if (authStore.user?.name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user.name)}&background=3b82f6&color=ffffff`
  }
  return 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=ffffff'
})



// Alert state
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

// Logout function
const logout = async () => {
  try {
    console.log('Logging out...')
    const result = await authStore.logout()
    
    if (result.success) {
      console.log('Logout successful')
      router.push('/login')
    } else {
      console.error('Logout failed:', result.error)
      showAlert({
        type: 'error',
        title: 'Logout failed',
        message: result.error || 'Please try again',
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
    showAlert({
      type: 'error',
      title: 'Logout failed',
      message: 'Please try again',
    })
  }
}

// Expose methods to parent components
defineExpose({
  showAlert,
  clearAlert
})
</script> 