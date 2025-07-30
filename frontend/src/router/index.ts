import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Views
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    // Dashboard routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // Domain routes
    {
      path: '/domains',
      name: 'domains',
      component: () => import('@/views/domains/DomainsView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // Hosting routes
    {
      path: '/hosting',
      name: 'hosting',
      component: () => import('@/views/hosting/HostingView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // VPS routes
    {
      path: '/vps',
      name: 'vps',
      component: () => import('@/views/VPSView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // Website routes
    {
      path: '/websites',
      name: 'websites',
      component: () => import('@/views/websites/WebsitesView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // Settings routes (Admin only)
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/SettingsView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], layout: DashboardLayout }
    },
    // User Management routes (Admin only)
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/users/UsersView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'], layout: DashboardLayout }
    },
    // User Account routes
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/profile/UserAccountView.vue'),
      meta: { requiresAuth: true, layout: DashboardLayout }
    },
    // Error routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false, title: 'Page Not Found' }
    }
  ]
})

// Navigation guard for auth and role-based access
router.beforeEach(async (to, from, next) => {
  // Check if route requires auth
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const allowedRoles = to.matched.find(record => record.meta.allowedRoles)?.meta.allowedRoles
  
  // Get auth store (we can't use it at the top level because it might not be initialized yet)
  const authStore = useAuthStore()
  
  // If route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } 
  // If route requires admin and user is not admin
  else if (requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard with access denied message
    next({ 
      path: '/dashboard',
      query: { error: 'access_denied' }
    })
  }
  // If route has specific role requirements and user doesn't have access
  else if (allowedRoles && Array.isArray(allowedRoles) && authStore.user && !allowedRoles.includes(authStore.user.role)) {
    // Redirect to dashboard with access denied message
    next({ 
      path: '/dashboard',
      query: { error: 'access_denied' }
    })
  }
  // If route is login and user is already authenticated
  else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to dashboard
    next({ path: '/dashboard' })
  }
  // Otherwise proceed
  else {
    next()
  }
})

export default router
