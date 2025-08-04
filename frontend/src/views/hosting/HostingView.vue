<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white shadow-sm rounded-lg">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Hosting Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage your hosting accounts and linked domains</p>
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
                  aria-label="Search hosting"
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
              

            </div>
            
            <!-- Search Filters -->
            <div class="flex items-center space-x-2">
              <!-- Status Filter -->
              <select 
                v-model="statusFilter" 
                @change="handleFilterChange"
                class="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
              </select>
              
              <!-- Provider Filter -->
              <select 
                v-model="providerFilter" 
                @change="handleFilterChange"
                class="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Providers</option>
                <option v-for="provider in uniqueProviders" :key="provider" :value="provider">
                  {{ provider }}
                </option>
              </select>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button 
                @click="hostingStore.fetchHostings()"
                :disabled="hostingStore.loading"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
                title="Refresh hosting accounts"
              >
                <svg :class="hostingStore.loading ? 'animate-spin' : ''" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                v-if="authStore.canCreateHosting"
                @click="openAddEditModal()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Hosting
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
              Search Results: {{ filteredHostings.length }} hosting accounts found
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
            
            <span v-if="statusFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {{ statusFilter }}
              <button @click="statusFilter = ''; handleFilterChange()" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            
            <span v-if="providerFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Provider: {{ providerFilter }}
              <button @click="providerFilter = ''; handleFilterChange()" class="ml-1 text-purple-600 hover:text-purple-800">
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

    <!-- Hosting Table -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Loading State -->
      <div v-if="hostingStore.loading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading hosting accounts...
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="hostingStore.error" class="p-8 text-center">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 0v4m0-4h4m-4 0H8m9 0a9 9 0 11-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <h3 class="text-lg font-medium">Error loading hosting accounts</h3>
          <p class="mt-1">{{ hostingStore.error }}</p>
        </div>
        <button 
          @click="hostingStore.fetchHostings()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>

      <!-- Content Area -->
      <div v-else-if="!hostingStore.loading && !hostingStore.error && filteredHostings.length > 0">
        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hosting
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domains
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
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
              <tr v-for="hosting in filteredHostings" :key="hosting.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <button 
                        @click="openAddEditModal(hosting)"
                        class="text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer transition-colors duration-200"
                      >
                        {{ hosting.name }}
                      </button>
                      <div class="text-sm text-gray-500">{{ hosting.planName || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ hosting.provider || 'Unknown' }}</div>
                      <div class="text-sm text-gray-500">Provider</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap status-column">
                  <div class="flex items-center space-x-2 status-indicators">
                    <!-- Status Badge -->
                    <div class="relative group">
                      <span :class="getComprehensiveStatusClass(hosting.status, hosting.expiresAt, 7, false, true)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-badge">
                        <svg :class="getStatusIconClass(hosting.status, hosting.expiresAt)" class="mr-1.5 h-2 w-2 status-icon" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3"/>
                        </svg>
                        {{ hosting.status }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div v-if="hosting.domains && hosting.domains.length > 0" class="space-y-1">
                    <!-- Show main domain -->
                    <div class="flex items-center">
                      <span 
                        :class="authStore.canViewDomainManagement ? 'cursor-pointer hover:text-primary-600' : 'cursor-default'"
                        class="text-sm font-medium"
                        @click="authStore.canViewDomainManagement ? openDomainModal(hosting) : null"
                        :title="authStore.canViewDomainManagement ? 'Click to view domain management' : 'Domain management not available'"
                      >
                        {{ getMainDomain(hosting.domains).name }}
                      </span>
                      <span class="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Main
                        <svg class="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    </div>
                    <!-- Show addon domain count if any -->
                    <div v-if="hosting.domains.length > 1" class="text-xs text-gray-500">
                      +{{ hosting.domains.length - 1 }} addon domain{{ hosting.domains.length - 1 > 1 ? 's' : '' }}
                    </div>
                  </div>
                  <span v-else class="text-gray-500 text-sm">No domains</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ hosting.username || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="hosting.password" class="flex items-center space-x-2">
                    <span class="text-sm text-gray-900">••••••••</span>
                    <button
                      @click="copyToClipboard(hosting.id)"
                      class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                      title="Copy password"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div v-else class="text-sm text-gray-500">
                    N/A
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="space-y-1">
                    <div class="font-medium">{{ formatDate(hosting.expiresAt) }}</div>
                    <div v-if="hosting.expiresAt" class="text-xs text-gray-500">
                      {{ getExpirationMessage(hosting.expiresAt, 7, false, true) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center">
                    <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <div>
                      <div class="font-medium text-gray-900">{{ formatDate(hosting.createdAt) }}</div>
                      <div class="text-xs text-gray-500">Created</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    v-if="authStore.canCreateHosting"
                    @click="openAddEditModal(hosting)" 
                    class="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    v-if="authStore.canCreateHosting"
                    @click="confirmDelete(hosting.id)" 
                    :disabled="hosting.domains && hosting.domains.length > 0"
                    :title="hosting.domains && hosting.domains.length > 0 ? 'Cannot delete hosting with associated domains' : 'Delete hosting account'"
                    :class="[
                      hosting.domains && hosting.domains.length > 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-900'
                    ]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="lg:hidden">
          <div class="space-y-4 p-4">
            <div 
              v-for="hosting in filteredHostings"
              :key="hosting.id"
              class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium text-gray-900 truncate">{{ hosting.provider }}</h3>
                    <p class="text-sm text-gray-500 truncate">{{ hosting.name }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getComprehensiveStatusClass(hosting.status, hosting.expiresAt, 7, false, true)">
                    {{ getExpirationMessage(hosting.expiresAt, 7, false, true) }}
                  </span>
                </div>
              </div>
              
              <div class="mt-3 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Package:</span>
                  <span class="text-gray-900 font-medium">{{ hosting.planName || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">IP Address:</span>
                  <span class="text-gray-900 font-medium">{{ hosting.ipAddress || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Domains:</span>
                  <span class="text-gray-900 font-medium">
                    <span v-if="hosting.domains && hosting.domains.length > 0">
                      {{ hosting.domains.length }} domain(s)
                    </span>
                    <span v-else class="text-gray-500">No domains</span>
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Username:</span>
                  <span class="text-gray-900">{{ hosting.username || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Password:</span>
                  <div v-if="hosting.password" class="flex items-center space-x-2">
                    <span class="text-gray-900">••••••••</span>
                    <button
                      @click="copyToClipboard(hosting.id)"
                      class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                      title="Copy password"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <span v-else class="text-gray-500">N/A</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Expires:</span>
                  <span class="text-gray-900">{{ formatDate(hosting.expiresAt) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Price:</span>
                  
                </div>
              </div>

              <!-- Domain List (if any) -->
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Domains</span>
                  <button
                    v-if="authStore.canAccessDomainManagement"
                    @click="openDomainModal(hosting)"
                    class="text-xs text-primary-600 hover:text-primary-900 font-medium"
                  >
                    Manage
                  </button>
                </div>
                <div v-if="hosting.domains && hosting.domains.length > 0" class="space-y-1">
                  <!-- Show main domain -->
                  <div class="flex items-center justify-between text-xs">
                    <span 
                      :class="authStore.canViewDomainManagement ? 'cursor-pointer hover:text-primary-600' : 'cursor-default'"
                      class="text-gray-600 font-medium"
                      @click="authStore.canViewDomainManagement ? openDomainModal(hosting) : null"
                      :title="authStore.canViewDomainManagement ? 'Click to view domain management' : 'Domain management not available'"
                    >
                      {{ getMainDomain(hosting.domains).name }}
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Main
                      <svg class="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                  <!-- Show addon domain count if any -->
                  <div v-if="hosting.domains.length > 1" class="text-xs text-gray-500">
                    +{{ hosting.domains.length - 1 }} addon domain{{ hosting.domains.length - 1 > 1 ? 's' : '' }}
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500 italic">
                  No domains assigned
                </div>
              </div>
              
              <div class="mt-4 flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  v-if="authStore.canCreateHosting"
                  @click="openAddEditModal(hosting)"
                  class="text-sm text-primary-600 hover:text-primary-900 font-medium"
                >
                  Edit
                </button>
                <button
                  v-if="authStore.canCreateHosting"
                  @click="confirmDelete(hosting.id)"
                  :disabled="hosting.domains && hosting.domains.length > 0"
                  :class="[
                    hosting.domains && hosting.domains.length > 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:text-red-900',
                    'text-sm font-medium'
                  ]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="filteredHostings.length === 0 && !hostingStore.loading" class="p-8 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium">No hosting accounts found</h3>
          <p class="mt-1 text-sm">
            {{ hasActiveFilters ? 'Try adjusting your search or filters.' : 'No hosting accounts have been added yet.' }}
          </p>
          <div class="mt-4">
            <button 
              v-if="hasActiveFilters"
              @click="clearAllFilters"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Clear All Filters
            </button>
            <button 
              v-else-if="authStore.canCreateHosting"
              @click="openAddEditModal()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Your First Hosting Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <AddEditHostingModal 
      v-if="isModalOpen" 
      :hosting="selectedHosting" 
      @close="closeModal" 
      @save="handleSave" 
      :error="modalError"
    />

    <DomainManagementModal
      v-if="isDomainModalOpen"
      :open="isDomainModalOpen"
      entity-type="hosting"
      :entity-id="selectedHostingForDomain?.id || ''"
      :entity-name="selectedHostingForDomain?.name || ''"
      :current-domains="selectedHostingForDomain?.domains || []"
      @close="closeDomainModal"
      @update="handleDomainUpdate"
    />

    <DomainWhoisModal
      v-if="selectedDomainForWhois"
      :is-open="isWhoisModalOpen"
      :domain="selectedDomainForWhois"
      @close="closeWhoisModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHostingStore } from '@/stores/hosting'
import { useAuthStore } from '@/stores/auth'
import AddEditHostingModal from '@/components/modals/AddEditHostingModal.vue'
import DomainManagementModal from '@/components/modals/DomainManagementModal.vue'
import DomainWhoisModal from '@/components/modals/DomainWhoisModal.vue'
import type { Hosting } from '@/types'
import type { Domain } from '@/types'
import { debounce } from 'lodash'
import { getComprehensiveStatusClass, formatDate, getExpirationMessage } from '@/utils'

// Status icon class function
const getStatusIconClass = (status: string, expiresAt: string | null | undefined) => {
  if (!expiresAt) return 'text-gray-400'
  
  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'text-red-400'
  if (daysUntilExpiry <= 30) return 'text-yellow-400'
  if (daysUntilExpiry <= 90) return 'text-orange-400'
  return 'text-green-400'
}

// Format Rupiah function
const formatRupiah = (amount: number | null | undefined): string => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const hostingStore = useHostingStore()
const authStore = useAuthStore()
const isModalOpen = ref(false)
const selectedHosting = ref<Hosting | null>(null)
const isDomainModalOpen = ref(false)
const selectedHostingForDomain = ref<Hosting | null>(null)
const search = ref('')
const statusFilter = ref('')
const providerFilter = ref('')
const modalError = ref<string | null>(null)

// WHOIS Modal state
const isWhoisModalOpen = ref(false)
const selectedDomainForWhois = ref<Domain | null>(null)

// Unique providers for filter dropdown
const uniqueProviders = computed(() => {
  return [...new Set(hostingStore.hostings.map(h => h.provider).filter((p): p is string => p !== null))].sort()
})

// Search placeholder
const searchPlaceholder = computed(() => {
  return 'Search hosting names and providers...'
})

// Client-side filtered hostings
const filteredHostings = computed(() => {
  let hostings = hostingStore.hostings

  // Apply search filter
  if (search.value && search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim()
    hostings = hostings.filter(hosting => 
      hosting.name.toLowerCase().includes(searchTerm) ||
      (hosting.provider && hosting.provider.toLowerCase().includes(searchTerm))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    hostings = hostings.filter(hosting => hosting.status === statusFilter.value)
  }

  // Apply provider filter
  if (providerFilter.value) {
    hostings = hostings.filter(hosting => hosting.provider === providerFilter.value)
  }

  return hostings
})

// Clear search
const clearSearch = () => {
  search.value = ''
}

// Clear all filters
const clearAllFilters = () => {
  search.value = ''
  statusFilter.value = ''
  providerFilter.value = ''
}

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return search.value || statusFilter.value || providerFilter.value
})

// Get main domain from domains array
const getMainDomain = (domains: any[]) => {
  // Find domain with isMainDomain: true
  const mainDomain = domains.find(domain => domain.isMainDomain === true)
  if (mainDomain) {
    return mainDomain
  }
  // Fallback to first domain if no main domain is set
  return domains[0]
}

// Handle filter changes
const handleFilterChange = () => {
  // No API call needed for client-side filtering
      // Filter changed
}

onMounted(() => {
  hostingStore.fetchHostings()
})

const openAddEditModal = (hosting: Hosting | null = null) => {
  selectedHosting.value = hosting
  modalError.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedHosting.value = null
  modalError.value = null
}

const handleSave = async (hostingData: Partial<Hosting>) => {
  try {
    if (selectedHosting.value) {
      const result = await hostingStore.updateHosting(selectedHosting.value.id, hostingData)
      if (result && result.status === 'error') {
        // Error updating hosting
        modalError.value = result.message;
        return;
      }
    } else {
      const response = await hostingStore.createHosting(hostingData)
      if (response && response.status === 'error') {
        // Error creating hosting
        modalError.value = response.message;
        return;
      }
    }
    closeModal()
  } catch (error: any) {
    // Error in handleSave
    modalError.value = error.message || 'An unexpected error occurred';
  }
}

const confirmDelete = async (id: string) => {
  // Find the hosting account to check for associated domains
  const hosting = hostingStore.hostings.find(h => h.id === id)
  
  if (!hosting) {
    alert('Hosting account not found')
    return
  }
  
  // Check if hosting has associated domains
  if (hosting.domains && hosting.domains.length > 0) {
    const domainNames = hosting.domains.map(d => d.name).join(', ')
    alert(`Cannot delete hosting account "${hosting.provider}" because it has associated domains: ${domainNames}\n\nPlease remove or reassign these domains first.`)
    return
  }
  
  // Confirm deletion for hosting without domains
  if (window.confirm(`Are you sure you want to delete the hosting account "${hosting.provider}"? This cannot be undone.`)) {
    try {
      const result = await hostingStore.deleteHosting(id)
      
      // Check if the result indicates an error
      if (result && result.status === 'error') {
        // Show error message to user
        alert(`Failed to delete hosting: ${result.message}`)
        return
      }
      
      // Success - hosting was deleted
      // Hosting deleted successfully
      // Show success message
      alert(`Hosting account "${hosting.provider}" has been deleted successfully.`)
    } catch (error: any) {
      // Handle any unexpected errors
      // Error deleting hosting
      alert(`Error deleting hosting: ${error.message || 'An unexpected error occurred'}`)
    }
  }
}

// Domain modal functions
const openDomainModal = (hosting: Hosting) => {
  selectedHostingForDomain.value = hosting
  isDomainModalOpen.value = true
}

const closeDomainModal = () => {
  isDomainModalOpen.value = false
  selectedHostingForDomain.value = null
}

const handleDomainUpdate = async () => {
  // Refresh hosting list to get updated domain information
  await hostingStore.fetchHostings()
}

const copyToClipboard = async (hostingId: string) => {
  try {
    // Get the actual password from the API
    const password = await hostingStore.getHostingPassword(hostingId)
    
    if (password) {
      await navigator.clipboard.writeText(password)
      alert('Password copied to clipboard!')
      // Copied to clipboard
    } else {
      alert('No password available for this hosting')
    }
  } catch (err) {
          // Failed to copy to clipboard
    alert('Failed to copy password to clipboard')
  }
}

// Whois modal functions
const openWhoisModal = (domain: any) => {
  selectedDomainForWhois.value = domain
  isWhoisModalOpen.value = true
}

const closeWhoisModal = () => {
  isWhoisModalOpen.value = false
  selectedDomainForWhois.value = null
}
</script> 