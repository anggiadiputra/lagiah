<template>
  <div class="space-y-8 p-6">
    <!-- Welcome Section with Quick Actions -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg">
      <div class="px-8 py-10 sm:px-10">
        <div class="flex items-center justify-between">
          <div>
                        <h1 class="text-2xl font-bold text-white">Welcome back!</h1>
            <p class="text-primary-100 mt-2">Here's what's happening with your infrastructure today.</p>
            
            <!-- Quick Actions -->
            <div class="mt-6 flex flex-wrap gap-3">
              <router-link 
                to="/domains" 
                class="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Manage Domains
              </router-link>
              <router-link 
                to="/hosting" 
                class="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                View Hosting
              </router-link>
              <router-link 
                to="/vps" 
                class="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Manage VPS
              </router-link>
            </div>
          </div>
          <div class="hidden sm:block">
            <svg class="h-16 w-16 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>



    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex justify-center items-center py-12">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-600">Loading dashboard data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <svg class="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-medium text-red-800">Unable to load dashboard data</h3>
          <p class="mt-1 text-red-700">{{ dashboardStore.error }}</p>
        </div>
      </div>
      <div class="mt-4 flex space-x-3">
        <button 
          @click="refreshDashboard"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <button 
          @click="goToLogin"
          class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Go to Login
        </button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats cards -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <!-- Domains stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Domains</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ dashboardStore.totalDomains || 0 }}</dd>
                </dl>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div class="flex flex-col items-center">
                <span class="text-green-600 font-medium text-lg">{{ dashboardStore.activeDomains || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Active</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-yellow-600 font-medium text-lg">{{ dashboardStore.expiringDomainsCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expiring</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-red-600 font-medium text-lg">{{ dashboardStore.expiredDomainsCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expired</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Hosting stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Hosting Accounts</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ dashboardStore.totalHosting || 0 }}</dd>
                </dl>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div class="flex flex-col items-center">
                <span class="text-green-600 font-medium text-lg">{{ dashboardStore.activeHosting || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Active</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-yellow-600 font-medium text-lg">{{ dashboardStore.expiringHostingCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expiring</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-red-600 font-medium text-lg">{{ dashboardStore.expiredHostingCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expired</span>
              </div>
            </div>
          </div>
        </div>

        <!-- VPS stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">VPS Servers</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ dashboardStore.totalVPS || 0 }}</dd>
                </dl>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div class="flex flex-col items-center">
                <span class="text-green-600 font-medium text-lg">{{ dashboardStore.activeVPS || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Active</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-yellow-600 font-medium text-lg">{{ dashboardStore.expiringVPSCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expiring</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-red-600 font-medium text-lg">{{ dashboardStore.expiredVPSCount || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Expired</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Websites stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Websites</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ dashboardStore.totalWebsites || 0 }}</dd>
                </dl>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div class="flex flex-col items-center">
                <span class="text-green-600 font-medium text-lg">{{ dashboardStore.activeWebsites || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Active</span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-gray-600 font-medium text-lg">{{ dashboardStore.inactiveWebsites || 0 }}</span>
                <span class="text-gray-500 text-xs mt-1">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Summary -->
      <!-- Dihapus seluruh blok grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 -->


      <!-- Recent Activity -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">Last 5 activities</span>
                <button 
                  @click="refreshDashboard"
                  class="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          <!-- Desktop Activity View -->
          <div class="hidden lg:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="activity in dashboardStore.recentActivity" :key="activity.id" class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-700">{{ activity.userName?.charAt(0)?.toUpperCase() || 'U' }}</span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ activity.userName || 'Unknown User' }}</div>
                        <div class="text-xs text-gray-500">{{ activity.ipAddress || 'No IP' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="{
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': activity.action === 'CREATE',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800': activity.action === 'READ',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': activity.action === 'UPDATE',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': activity.action === 'DELETE',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800': activity.action === 'LOGIN',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800': activity.action === 'LOGOUT',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800': activity.action === 'EXPORT',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800': activity.action === 'IMPORT'
                    }">
                      {{ activity.action }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <!-- Entity Type Icon -->
                      <svg v-if="activity.entityType === 'DOMAIN'" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <svg v-else-if="activity.entityType === 'HOSTING'" class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      <svg v-else-if="activity.entityType === 'VPS'" class="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <svg v-else-if="activity.entityType === 'WEBSITE'" class="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <svg v-else-if="activity.entityType === 'USER'" class="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <svg v-else-if="activity.entityType === 'SETTING'" class="h-5 w-5 text-orange-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-900">{{ activity.entityType }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs" :title="activity.details">
                      <div class="truncate">{{ activity.details || 'No description' }}</div>
                      <div v-if="activity.entityName && activity.entityName !== activity.details" class="text-xs text-gray-500 mt-1 truncate">
                        {{ activity.entityName }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex flex-col">
                      <span>{{ formatTimeAgo(activity.createdAt) }}</span>
                      <span class="text-xs text-gray-400">{{ formatDate(activity.createdAt) }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="dashboardStore.recentActivity.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center">
                    <div class="text-gray-500">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <h3 class="mt-3 text-sm font-medium text-gray-900">No recent activity</h3>
                      <p class="mt-2 text-sm text-gray-500">Activity logs will appear here as users interact with the system.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Activity View -->
          <div class="lg:hidden">
            <div class="p-6 space-y-4">
              <div v-for="activity in dashboardStore.recentActivity" :key="activity.id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">{{ activity.userName?.charAt(0)?.toUpperCase() || 'U' }}</span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-900">{{ activity.userName || 'Unknown User' }}</span>
                        <span :class="{
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': activity.action === 'CREATE',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800': activity.action === 'READ',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': activity.action === 'UPDATE',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': activity.action === 'DELETE',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800': activity.action === 'LOGIN',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800': activity.action === 'LOGOUT',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800': activity.action === 'EXPORT',
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800': activity.action === 'IMPORT'
                        }">
                          {{ activity.action }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2 mt-1">
                        <!-- Entity Type Icon -->
                        <svg v-if="activity.entityType === 'DOMAIN'" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <svg v-else-if="activity.entityType === 'HOSTING'" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <svg v-else-if="activity.entityType === 'VPS'" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <svg v-else-if="activity.entityType === 'WEBSITE'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <svg v-else-if="activity.entityType === 'USER'" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <svg v-else-if="activity.entityType === 'SETTING'" class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ activity.entityType }}</span>
                      </div>
                      <div class="text-sm text-gray-900 mt-1" :title="activity.details">
                        <div class="truncate">{{ activity.details || 'No description' }}</div>
                        <div v-if="activity.entityName && activity.entityName !== activity.details" class="text-xs text-gray-500 mt-1 truncate">
                          {{ activity.entityName }}
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 mt-1">{{ activity.ipAddress || 'No IP' }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-gray-500">
                      {{ formatTimeAgo(activity.createdAt) }}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                      {{ formatDate(activity.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Empty state for mobile -->
              <div v-if="dashboardStore.recentActivity.length === 0" class="text-center py-8">
                <div class="text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 class="mt-3 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p class="mt-2 text-sm text-gray-500">Activity logs will appear here as users interact with the system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <!-- Dihapus seluruh blok Quick Stats -->
      </div>
    </div>
  </div>

  <!-- WHOIS Modal -->
  <DomainWhoisModal
    v-if="selectedDomain"
    :is-open="isWhoisModalOpen"
    :domain="selectedDomain"
    @close="closeWhoisModal"
  />
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import DomainWhoisModal from '@/components/modals/DomainWhoisModal.vue'
import type { Domain } from '@/types'
import { useRouter } from 'vue-router'

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const router = useRouter()

// WHOIS Modal state
const isWhoisModalOpen = ref(false)
const selectedDomain = ref<Domain | null>(null)

// Open WHOIS modal
const openWhoisModal = (domain: Domain) => {
  selectedDomain.value = domain
  isWhoisModalOpen.value = true
}

// Close WHOIS modal
const closeWhoisModal = () => {
  isWhoisModalOpen.value = false
  selectedDomain.value = null
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format time ago helper function
const formatTimeAgo = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}



// Refresh dashboard data
const refreshDashboard = () => {
  dashboardStore.fetchDashboardData()
}

// Go to login page
const goToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  try {
    // Ensure auth store is initialized first
    await authStore.initialize()
    
    // Wait a bit for auth to settle, then load dashboard data if authenticated
    setTimeout(async () => {
      try {
        // Check if user is properly authenticated
        if (authStore.isAuthenticated && authStore.user && authStore.user.id !== 'unknown') {
          await dashboardStore.fetchDashboardData()
        } else {
          // Redirect to login if not authenticated
          router.push({
            path: '/login',
            query: { redirect: '/dashboard' }
          })
        }
      } catch (error) {
        console.warn('Failed to load dashboard data:', error)
        // Don't crash the app, just show error state
      }
    }, 500) // 500ms delay
  } catch (error) {
    console.error('Error during dashboard initialization:', error)
    // Don't crash the app, just show error state
  }
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated && authStore.user && authStore.user.id !== 'unknown') {
    // Add delay to ensure auth is fully settled
    setTimeout(async () => {
      try {
        await dashboardStore.fetchDashboardData()
      } catch (error) {
        console.warn('Failed to load dashboard data after auth change:', error)
        // Don't crash the app, just show error state
      }
    }, 300) // 300ms delay
  }
})
</script> 