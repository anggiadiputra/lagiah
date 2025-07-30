<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTitle } from '@/composables/useTitle'

const route = useRoute()
const authStore = useAuthStore()
const { fetchAppName } = useTitle()

// Determine if the current route has a custom layout
const layout = computed(() => {
  return route.meta.layout || null
})

// Initialize auth state on app startup
onMounted(async () => {
  // Temporary: Clear local storage once to fix bad tokens
  const hasCleared = localStorage.getItem('storage_cleared_v1')
  if (!hasCleared) {
    localStorage.clear()
    localStorage.setItem('storage_cleared_v1', 'true')
    console.warn('Local storage has been cleared to remove invalid tokens.')
  }
  
  // Initialize auth first
  await authStore.initialize()
  
  // Then fetch app name if user is authenticated
  if (authStore.isAuthenticated) {
    await fetchAppName()
  }
})

// Watch for authentication changes and fetch app name when user logs in
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await fetchAppName()
  }
})
</script>

<template>
  <!-- Use dynamic layout if specified in route meta -->
  <component v-if="layout" :is="layout">
    <RouterView />
  </component>
  
  <!-- Otherwise use default layout -->
  <RouterView v-else />
</template>

<style scoped>
/* Global styles can be added here if needed */
</style>
