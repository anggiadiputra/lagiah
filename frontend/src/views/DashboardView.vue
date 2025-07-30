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
          <h3 class="text-lg font-medium text-red-800">Error loading dashboard</h3>
          <p class="mt-1 text-red-700">{{ dashboardStore.error }}</p>
        </div>
      </div>
      <div class="mt-4">
        <button 
          @click="refreshDashboard"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
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
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg class="h-7 w-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 flex-1">
                <div class="flex items-baseline">
                  <p class="text-2xl font-semibold text-gray-900">{{ dashboardStore.totalDomains }}</p>
                  <p class="ml-3 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ dashboardStore.activeDomains }}
                  </p>
                </div>
                <p class="text-sm font-medium text-gray-500 mt-1">Total Domains</p>
                <div v-if="dashboardStore.expiringDomainsCount > 0" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {{ dashboardStore.expiringDomainsCount }} expiring soon
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-8 py-4">
            <div class="text-sm">
              <router-link to="/domains" class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                View all domains →
              </router-link>
            </div>
          </div>
        </div>

        <!-- Hosting stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg class="h-7 w-7 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 flex-1">
                <div class="flex items-baseline">
                  <p class="text-2xl font-semibold text-gray-900">{{ dashboardStore.totalHosting }}</p>
                  <p class="ml-3 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    {{ dashboardStore.activeHosting }}
                  </p>
                </div>
                <p class="text-sm font-medium text-gray-500 mt-1">Hosting Accounts</p>
                <div v-if="dashboardStore.expiringHostingCount > 0" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {{ dashboardStore.expiringHostingCount }} expiring soon
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-8 py-4">
            <div class="text-sm">
              <router-link to="/hosting" class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                View all hosting →
              </router-link>
            </div>
          </div>
        </div>

        <!-- VPS stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg class="h-7 w-7 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 flex-1">
                <div class="flex items-baseline">
                  <p class="text-2xl font-semibold text-gray-900">{{ dashboardStore.totalVPS }}</p>
                  <p class="ml-3 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    {{ dashboardStore.activeVPS }}
                  </p>
                </div>
                <p class="text-sm font-medium text-gray-500 mt-1">VPS Servers</p>
                <div v-if="dashboardStore.expiringVPSCount > 0" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {{ dashboardStore.expiringVPSCount }} expiring soon
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-8 py-4">
            <div class="text-sm">
              <router-link to="/vps" class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                View all VPS →
              </router-link>
            </div>
          </div>
        </div>

        <!-- Websites stats -->
        <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div class="p-8">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg class="h-7 w-7 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 flex-1">
                <div class="flex items-baseline">
                  <p class="text-2xl font-semibold text-gray-900">{{ dashboardStore.totalWebsites }}</p>
                  <p class="ml-3 flex items-baseline text-sm font-semibold text-green-600">
                    <svg class="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    {{ dashboardStore.activeWebsites }}
                  </p>
                </div>
                <p class="text-sm font-medium text-gray-500 mt-1">Websites</p>
                <div v-if="dashboardStore.totalWebsites > 0" class="mt-1 text-xs text-gray-400">
                  {{ dashboardStore.totalWebsites }} total • {{ dashboardStore.activeWebsites }} active
                </div>
                <div v-if="dashboardStore.inactiveWebsites > 0" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ dashboardStore.inactiveWebsites }} inactive
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-8 py-4">
            <div class="text-sm">
              <router-link to="/websites" class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                View all websites →
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500">Total Items</p>
              <p class="text-lg font-semibold text-gray-900">{{ dashboardStore.totalDomains + dashboardStore.totalHosting + dashboardStore.totalVPS + dashboardStore.totalWebsites }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500">Active</p>
              <p class="text-lg font-semibold text-gray-900">{{ dashboardStore.activeDomains + dashboardStore.activeHosting + dashboardStore.activeVPS + dashboardStore.activeWebsites }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p class="text-lg font-semibold text-gray-900">{{ dashboardStore.expiringDomainsCount + dashboardStore.expiringHostingCount + dashboardStore.expiringVPSCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-500">Expired</p>
              <p class="text-lg font-semibold text-gray-900">{{ dashboardStore.expiredDomainsCount + dashboardStore.expiredHostingCount + dashboardStore.expiredVPSCount }}</p>
            </div>
          </div>
        </div>
        

      </div>





      <!-- Main content grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Expiring items -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow-lg rounded-xl overflow-hidden">
            <div class="px-8 py-6 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Items Expiring Soon</h3>
            </div>
            
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" class="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" class="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th scope="col" class="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th scope="col" class="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in dashboardStore.allExpiringItems" :key="`${item.type}-${item.id}`" class="hover:bg-gray-50 transition-colors duration-150">
                    <td class="px-8 py-5 whitespace-nowrap">
                      <div class="flex items-center">
                        <!-- Domain Icon -->
                        <svg v-if="item.type === 'DOMAIN'" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <!-- Hosting Icon -->
                        <svg v-else-if="item.type === 'HOSTING'" class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                        <!-- VPS Icon -->
                        <svg v-else-if="item.type === 'VPS'" class="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span class="text-sm font-medium text-gray-900">{{ item.typeLabel }}</span>
                      </div>
                    </td>
                    <td class="px-8 py-5 whitespace-nowrap">
                      <div 
                        v-if="item.type === 'DOMAIN'"
                        class="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors duration-200"
                        @click="openWhoisModal(item)"
                        title="Click to view WHOIS information"
                      >
                        {{ item.name }}
                      </div>
                      <div v-else class="text-sm font-medium text-gray-900">
                        {{ item.name }}
                      </div>
                    </td>
                    <td class="px-8 py-5 whitespace-nowrap text-sm text-gray-500">{{ item.provider }}</td>
                    <td class="px-8 py-5 whitespace-nowrap text-sm text-gray-900">
                      <div :class="{
                        'text-red-600 font-medium': item.daysUntilExpiry <= 7,
                        'text-orange-600 font-medium': item.daysUntilExpiry > 7 && item.daysUntilExpiry <= 30,
                        'text-gray-900': item.daysUntilExpiry > 30
                      }">
                        {{ item.expiryDate }} 
                        <span class="text-xs">
                          ({{ item.daysUntilExpiry }} days)
                        </span>
                      </div>
                    </td>
                    <td class="px-8 py-5 whitespace-nowrap">
                      <span :class="{
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': item.status === 'ACTIVE',
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': item.status === 'EXPIRED',
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': item.status === 'EXPIRING',
                      }">
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="dashboardStore.allExpiringItems.length === 0">
                    <td colspan="5" class="px-8 py-12 text-center">
                      <div class="text-gray-500">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <h3 class="mt-3 text-sm font-medium text-gray-900">No items expiring soon</h3>
                        <p class="mt-2 text-sm text-gray-500">All your items are up to date.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card View -->
            <div class="lg:hidden">
              <div class="p-6 space-y-4">
                <div v-for="item in dashboardStore.allExpiringItems" :key="`${item.type}-${item.id}`" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                      <!-- Domain Icon -->
                      <svg v-if="item.type === 'DOMAIN'" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <!-- Hosting Icon -->
                      <svg v-else-if="item.type === 'HOSTING'" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      <!-- VPS Icon -->
                      <svg v-else-if="item.type === 'VPS'" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <div>
                        <div class="flex items-center space-x-2">
                          <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ item.typeLabel }}</span>
                          <span :class="{
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800': item.status === 'ACTIVE',
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800': item.status === 'EXPIRED',
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800': item.status === 'EXPIRING',
                          }">
                            {{ item.status }}
                          </span>
                        </div>
                        <div 
                          v-if="item.type === 'DOMAIN'"
                          class="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors duration-200 mt-1"
                          @click="openWhoisModal(item)"
                          title="Click to view WHOIS information"
                        >
                          {{ item.name }}
                        </div>
                        <div v-else class="text-sm font-medium text-gray-900 mt-1">
                          {{ item.name }}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">{{ item.provider }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div :class="{
                        'text-red-600 font-medium': item.daysUntilExpiry <= 7,
                        'text-orange-600 font-medium': item.daysUntilExpiry > 7 && item.daysUntilExpiry <= 30,
                        'text-gray-900': item.daysUntilExpiry > 30
                      }" class="text-sm">
                        {{ item.expiryDate }}
                      </div>
                      <div :class="{
                        'text-red-600': item.daysUntilExpiry <= 7,
                        'text-orange-600': item.daysUntilExpiry > 7 && item.daysUntilExpiry <= 30,
                        'text-gray-500': item.daysUntilExpiry > 30
                      }" class="text-xs mt-1">
                        {{ item.daysUntilExpiry }} days
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Empty state for mobile -->
                <div v-if="dashboardStore.allExpiringItems.length === 0" class="text-center py-8">
                  <div class="text-gray-500">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3 class="mt-3 text-sm font-medium text-gray-900">No items expiring soon</h3>
                    <p class="mt-2 text-sm text-gray-500">All your items are up to date.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow-lg rounded-xl overflow-hidden">
            <div class="px-8 py-6 border-b border-gray-200">
              <h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div class="flow-root p-6 max-h-96 overflow-y-auto">
              <ul role="list" class="-mb-8">
                <li v-for="(activity, activityIdx) in dashboardStore.recentActivity" :key="activity.id">
                  <div class="relative pb-8">
                    <span v-if="activityIdx !== dashboardStore.recentActivity.length - 1" class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div class="relative flex items-start space-x-4">
                      <div class="relative">
                        <div class="h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white" :class="{
                          'bg-blue-500': activity.entityType === 'DOMAIN',
                          'bg-green-500': activity.entityType === 'HOSTING',
                          'bg-purple-500': activity.entityType === 'VPS',
                          'bg-indigo-500': activity.entityType === 'WEBSITE',
                          'bg-gray-500': activity.entityType === 'USER'
                        }">
                          <!-- Domain Icon -->
                          <svg v-if="activity.entityType === 'DOMAIN'" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <!-- Hosting Icon -->
                          <svg v-else-if="activity.entityType === 'HOSTING'" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                          <!-- VPS Icon -->
                          <svg v-else-if="activity.entityType === 'VPS'" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <!-- Website Icon -->
                          <svg v-else-if="activity.entityType === 'WEBSITE'" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <!-- User Icon -->
                          <svg v-else class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div>
                          <div class="text-sm">
                            <span class="font-medium text-gray-900">{{ activity.userName }}</span>
                            <span class="text-gray-500 ml-1">•</span>
                            <span class="text-gray-500">{{ formatDate(activity.createdAt) }}</span>
                          </div>
                          <p class="mt-1 text-sm text-gray-700">
                            <span class="font-medium">{{ activity.action }}</span>
                            <span class="text-gray-600">{{ activity.entityName }}</span>
                          </p>
                          <div v-if="activity.details" class="mt-1 text-xs text-gray-500">
                            {{ activity.details }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <div v-if="dashboardStore.recentActivity.length === 0" class="py-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="mt-3 text-sm font-medium text-gray-900">No recent activity</h3>
                <p class="mt-2 text-sm text-gray-500">Activity will appear here when actions are performed.</p>
              </div>
            </div>
          </div>
        </div>
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
import { onMounted, computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import DomainWhoisModal from '@/components/modals/DomainWhoisModal.vue'
import type { Domain } from '@/types'

const dashboardStore = useDashboardStore()

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
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Alerts system
const criticalAlerts = computed(() => {
  const alerts = []
  
  // Check for domains expiring in 7 days or less
  const criticalDomains = dashboardStore.expiringDomains.filter(domain => domain.daysUntilExpiry <= 7)
  if (criticalDomains.length > 0) {
    alerts.push({
      id: 'critical-domains',
      message: `${criticalDomains.length} domain${criticalDomains.length > 1 ? 's' : ''} expiring in 7 days or less`
    })
  }
  
  // Check for expired domains
  if (dashboardStore.expiredDomainsCount > 0) {
    alerts.push({
      id: 'expired-domains',
      message: `${dashboardStore.expiredDomainsCount} domain${dashboardStore.expiredDomainsCount > 1 ? 's' : ''} already expired`
    })
  }
  
  return alerts
})

const warningAlerts = computed(() => {
  const alerts = []
  
  // Check for domains expiring in 30 days
  const warningDomains = dashboardStore.expiringDomains.filter(domain => domain.daysUntilExpiry > 7 && domain.daysUntilExpiry <= 30)
  if (warningDomains.length > 0) {
    alerts.push({
      id: 'warning-domains',
      message: `${warningDomains.length} domain${warningDomains.length > 1 ? 's' : ''} expiring in 30 days`
    })
  }
  
  // Check for hosting expiring soon
  if (dashboardStore.expiringHostingCount > 0) {
    alerts.push({
      id: 'hosting-expiring',
      message: `${dashboardStore.expiringHostingCount} hosting account${dashboardStore.expiringHostingCount > 1 ? 's' : ''} expiring soon`
    })
  }
  
  // Check for VPS expiring soon
  if (dashboardStore.expiringVPSCount > 0) {
    alerts.push({
      id: 'vps-expiring',
      message: `${dashboardStore.expiringVPSCount} VPS server${dashboardStore.expiringVPSCount > 1 ? 's' : ''} expiring soon`
    })
  }
  
  return alerts
})

const hasAlerts = computed(() => criticalAlerts.value.length > 0 || warningAlerts.value.length > 0)

// System health score
const systemHealthScore = computed(() => {
  const totalItems = dashboardStore.totalDomains + dashboardStore.totalHosting + dashboardStore.totalVPS + dashboardStore.totalWebsites
  const activeItems = dashboardStore.activeDomains + dashboardStore.activeHosting + dashboardStore.activeVPS + dashboardStore.activeWebsites
  
  if (totalItems === 0) return 100
  return Math.round((activeItems / totalItems) * 100)
})

const healthStatus = computed(() => {
  if (systemHealthScore.value >= 90) return { color: 'green', text: 'Excellent' }
  if (systemHealthScore.value >= 75) return { color: 'yellow', text: 'Good' }
  if (systemHealthScore.value >= 50) return { color: 'orange', text: 'Fair' }
  return { color: 'red', text: 'Poor' }
})

// Refresh dashboard data
const refreshDashboard = () => {
  dashboardStore.fetchDashboardData()
}

onMounted(() => {
  // Initial load
  dashboardStore.fetchDashboardData()
})
</script> 