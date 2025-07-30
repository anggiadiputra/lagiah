# Settings Access Control Fix

## Problem Description
User dengan role STAFF mencoba mengakses halaman Settings dan mendapatkan error 403 (Forbidden). Masalah ini terjadi karena:

1. **Frontend tidak memiliki pengecekan role** untuk halaman Settings
2. **Backend sudah membatasi akses** hanya untuk ADMIN
3. **Menu Settings tetap terlihat** di sidebar untuk semua user
4. **Router tidak memiliki guard** untuk role-based access

## Root Cause Analysis

### Current RBAC Configuration
- **Backend:** Settings dan Users endpoints hanya dapat diakses oleh ADMIN
- **Frontend:** Tidak ada pengecekan role di komponen Settings
- **Router:** Tidak ada guard untuk role-based access
- **Navigation:** Menu Settings dan Users terlihat untuk semua user

### Error Flow
```
User STAFF → Navigate to /settings → Frontend loads → API call to /settings → Backend returns 403 → Frontend shows error
```

## Solution Implemented

### 1. Frontend Component Access Control
**File:** `frontend/src/views/settings/SettingsView.vue`

**Problem:** Tidak ada pengecekan role di komponen
**Solution:** Tambahkan conditional rendering berdasarkan role

```vue
<!-- Access Control -->
<div v-if="!authStore.isAdmin" class="mb-8">
  <div class="bg-red-50 border border-red-200 rounded-lg p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-lg font-medium text-red-800">Access Denied</h3>
        <p class="mt-1 text-red-700">
          You do not have permission to access the Settings page. Only administrators can manage application settings.
        </p>
        <div class="mt-4">
          <router-link
            to="/dashboard"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Settings Content (Only for Admin) -->
<div v-else>
  <!-- All settings content here -->
</div>
```

### 2. Router Guard Enhancement
**File:** `frontend/src/router/index.ts`

**Problem:** Router tidak memiliki pengecekan role
**Solution:** Tambahkan meta field dan navigation guard

```typescript
// Route definition
{
  path: '/settings',
  name: 'settings',
  component: () => import('@/views/settings/SettingsView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true, layout: DashboardLayout }
},
{
  path: '/users',
  name: 'users',
  component: () => import('@/views/users/UsersView.vue'),
  meta: { requiresAuth: true, requiresAdmin: true, layout: DashboardLayout }
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  const authStore = useAuthStore()
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } 
  else if (requiresAdmin && !authStore.isAdmin) {
    next({ path: '/dashboard', query: { error: 'access_denied' } })
  }
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next({ path: '/dashboard' })
  }
  else {
    next()
  }
})
```

### 3. Navigation Menu Filtering
**File:** `frontend/src/layouts/DashboardLayout.vue`

**Problem:** Menu Settings dan Users terlihat untuk semua user
**Solution:** Filter menu berdasarkan role

```typescript
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

  // Add admin-only items
  if (authStore.isAdmin) {
    baseNavigation.push(
      { name: 'Users', href: '/users', icon: 'UsersIcon' },
      { name: 'Settings', href: '/settings', icon: 'SettingsIcon' }
    )
  }

  return baseNavigation
})
```

### 4. API Call Prevention
**File:** `frontend/src/views/settings/SettingsView.vue`

**Problem:** API calls tetap dijalankan meskipun user bukan admin
**Solution:** Tambahkan pengecekan role sebelum API calls

```typescript
const loadSettingsFromAPI = async () => {
  // Only load settings if user is admin
  if (!authStore.isAdmin) {
    console.log('User is not admin, skipping settings load')
    return
  }

  try {
    isLoadingSettings.value = true
    // ... rest of the function
  } catch (error) {
    // ... error handling
  }
}
```

## Current Access Control Flow

### For Admin Users
```
Admin User → Navigate to /settings → Router allows access → Component loads → API calls succeed → Settings displayed
```

### For Non-Admin Users
```
Non-Admin User → Navigate to /settings → Router redirects to /dashboard → Access denied message shown
```

### Menu Visibility
```
Admin User: Dashboard, Domains, Hosting, VPS, Websites, Profile, Users, Settings
Non-Admin User: Dashboard, Domains, Hosting, VPS, Websites, Profile
```

## Testing

### Manual Testing
1. **Admin Access Test:**
   - Login sebagai admin@lagiah.com
   - Navigate ke /settings
   - Verify settings page loads correctly
   - Verify menu Settings dan Users terlihat

2. **Non-Admin Access Test:**
   - Login sebagai staff@lagiah.com atau finance@lagiah.com
   - Navigate ke /settings
   - Verify redirect ke dashboard dengan access denied message
   - Verify menu Settings dan Users tidak terlihat

3. **Direct URL Access Test:**
   - Login sebagai non-admin
   - Try to access /settings directly
   - Verify router guard prevents access

### Expected Behavior
- ✅ Admin dapat mengakses Settings dan Users
- ✅ Non-admin tidak dapat mengakses Settings dan Users
- ✅ Menu Settings dan Users hanya terlihat untuk admin
- ✅ Access denied message yang informatif
- ✅ No 403 errors untuk non-admin (redirected before API call)

## Impact

### Positive Changes
1. **Consistent RBAC:** Frontend dan backend memiliki RBAC yang konsisten
2. **Better UX:** User mendapat feedback yang jelas tentang akses yang ditolak
3. **Security:** Mencegah akses yang tidak sah ke halaman admin
4. **Performance:** Tidak ada API calls yang tidak perlu untuk non-admin

### Files Modified
- `frontend/src/views/settings/SettingsView.vue` - Added access control UI
- `frontend/src/router/index.ts` - Added role-based navigation guard
- `frontend/src/layouts/DashboardLayout.vue` - Filtered navigation menu

## Future Considerations

### Potential Improvements
1. **Toast Notifications:** Add toast notifications for access denied
2. **Audit Logging:** Log access attempts to admin pages
3. **Role-based Components:** Create reusable role-based components
4. **Permission System:** Implement more granular permissions

### Monitoring
1. **Access Attempts:** Monitor access attempts to admin pages
2. **Error Tracking:** Track 403 errors and access denied events
3. **User Behavior:** Monitor user navigation patterns

## Conclusion

Masalah akses kontrol untuk halaman Settings telah berhasil diperbaiki. Sekarang sistem memiliki RBAC yang konsisten di frontend dan backend, dengan user experience yang lebih baik untuk semua role.

### Key Fixes
- ✅ **Component Access Control:** Settings page shows access denied for non-admin
- ✅ **Router Guard:** Prevents direct access to admin-only routes
- ✅ **Menu Filtering:** Admin-only menu items hidden from non-admin
- ✅ **API Call Prevention:** No unnecessary API calls for non-admin users

### Security Improvements
- **Frontend Protection:** UI prevents access to admin features
- **Router Protection:** Navigation guard blocks unauthorized routes
- **Consistent RBAC:** Frontend and backend have matching access controls
- **User Feedback:** Clear messages when access is denied

Sistem sekarang memiliki multiple layers of protection untuk memastikan hanya admin yang dapat mengakses fitur-fitur administratif. 