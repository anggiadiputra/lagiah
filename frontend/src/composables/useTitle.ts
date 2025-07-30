import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { settingsService } from '@/services/settings'
import { useAuthStore } from '@/stores/auth'

export function useTitle() {
  const route = useRoute()
  const authStore = useAuthStore()
  const appName = ref('Lagiah')
  const isLoading = ref(false)

  // Fetch app name from settings
  const fetchAppName = async () => {
    try {
      // Only fetch settings if user is authenticated
      if (!authStore.isAuthenticated) {
        console.log('User not authenticated, skipping app name fetch')
        return
      }
      
      isLoading.value = true
      const settings = await settingsService.getSettings('general')
      const appNameSetting = settings.settings?.app_name
      if (appNameSetting) {
        appName.value = appNameSetting
      }
    } catch (error) {
      console.error('Error fetching app name:', error)
      // Keep default app name if fetch fails
    } finally {
      isLoading.value = false
    }
  }

  // Update document title
  const updateTitle = (pageTitle?: string) => {
    const title = pageTitle || route.meta.title || 'Dashboard'
    document.title = `${title} | ${appName.value}`
  }

  // Watch for route changes and update title
  watch(() => route.meta.title, (newTitle) => {
    updateTitle(newTitle as string)
  }, { immediate: true })

  // Watch for app name changes and update title
  watch(appName, () => {
    updateTitle(route.meta.title as string)
  })

  return {
    appName,
    isLoading,
    fetchAppName,
    updateTitle
  }
} 