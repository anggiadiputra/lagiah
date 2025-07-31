<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white shadow-sm rounded-lg">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Website Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage your websites and track their status</p>
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
                  aria-label="Search websites"
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
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              
              <!-- Type Filter -->
              <select 
                v-model="typeFilter" 
                @change="handleFilterChange"
                class="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="BLOG">Blog</option>
                <option value="E_COMMERCE">E-Commerce</option>
                <option value="PORTFOLIO">Portfolio</option>
                <option value="CORPORATE">Corporate</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button 
                v-if="authStore.canCreateWebsite"
                @click="openAddWebsiteModal()"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Website
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
              Search Results: {{ filteredWebsites.length }} websites found
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
            
            <span v-if="typeFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Type: {{ typeFilter }}
              <button @click="typeFilter = ''; handleFilterChange()" class="ml-1 text-purple-600 hover:text-purple-800">
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

    <!-- Websites Table -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Loading State -->
      <div v-if="websiteStore.loading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading websites...
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="websiteStore.error" class="p-8 text-center">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 0v4m0-4h4m-4 0H8m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">Error loading websites</h3>
          <p class="mt-1">{{ websiteStore.error }}</p>
          <p class="mt-2 text-sm text-gray-500">
            {{ websiteStore.websites.length > 0 ? 'Showing fallback data. Some features may be limited.' : 'Unable to load any website data.' }}
          </p>
        </div>
        <div class="flex flex-col space-y-4 items-center">
          <button 
            @click="websiteStore.fetchWebsites()"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          
          <a 
            href="/token-updater.html" 
            target="_blank"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Check Token
          </a>
        </div>
      </div>

      <!-- Content Area -->
      <div v-else-if="!websiteStore.loading && !websiteStore.error && filteredWebsites.length > 0">
        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CMS
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
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
              <tr v-for="website in filteredWebsites" :key="website.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div
                        v-if="website.url"
                        @click="openWebsiteInNewTab(website.url)"
                        class="text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer transition-colors duration-200 flex items-center"
                      >
                        {{ website.name }}
                        <svg class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <div
                        v-else
                        class="text-sm font-medium text-gray-600 cursor-default"
                      >
                        {{ website.name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ website.domain?.name || 'No domain' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ website.status }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ website.cms || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ website.username || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="website.password" class="flex items-center space-x-2">
                    <span class="text-sm text-gray-900">••••••••</span>
                    <button
                      @click="copyToClipboard(website.id)"
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(website.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="() => viewWebsiteDetails(website)"
                      class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      title="View website details"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      v-if="authStore.canCreateWebsite"
                      @click="() => openAddWebsiteModal(website)"
                      class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                      title="Edit website"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      v-if="authStore.canCreateWebsite"
                      @click="() => confirmDelete(website.id)"
                      class="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete website"
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

        <!-- Mobile Card View -->
        <div class="lg:hidden">
          <div class="space-y-4 p-4">
            <div v-for="website in filteredWebsites" :key="website.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div
                      v-if="website.url"
                      @click="openWebsiteInNewTab(website.url)"
                      class="text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer transition-colors duration-200 flex items-center"
                    >
                      {{ website.name }}
                      <svg class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div
                      v-else
                      class="text-sm font-medium text-gray-600 cursor-default"
                    >
                      {{ website.name }}
                    </div>
                    <p class="text-sm text-gray-500 truncate">{{ website.domain?.name || 'No domain' }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="() => viewWebsiteDetails(website)"
                    class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    title="View website details"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-if="authStore.canCreateWebsite"
                    @click="() => openAddWebsiteModal(website)"
                    class="text-primary-600 hover:text-primary-900 transition-colors duration-200"
                    title="Edit website"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="authStore.canCreateWebsite"
                    @click="() => confirmDelete(website.id)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                    title="Delete website"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="mt-3 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Website:</span>
                  <span class="text-gray-900">{{ website.name }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Domain:</span>
                  <span class="text-gray-900">{{ website.domain?.name || 'No domain' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Status:</span>
                  <span class="text-gray-900">{{ website.status }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">CMS:</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    {{ website.cms || 'N/A' }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Username:</span>
                  <span class="text-gray-900">{{ website.username || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Password:</span>
                  <div v-if="website.password" class="flex items-center space-x-2">
                    <span class="text-gray-900">••••••••</span>
                    <button
                      @click="copyToClipboard(website.id)"
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
                  <span class="text-gray-500">Created:</span>
                  <span class="text-gray-900">{{ formatDate(website.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!websiteStore.loading && !websiteStore.error && filteredWebsites.length === 0" class="p-8 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
          </svg>
          <h3 class="text-lg font-medium">No websites found</h3>
          <p class="mt-1">Get started by creating your first website.</p>
          <div class="mt-6">
            <button
              @click="openAddWebsiteModal()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Website
            </button>
          </div>
        </div>
      </div>
    </div>

    <AddEditWebsiteModal 
      v-if="isModalOpen" 
      :is-open="isModalOpen"
      :website="selectedWebsite" 
      :domains="domainStore.allDomains as any"
      :hosting-accounts="hostingStore.hostings"
      :vps-accounts="vpsStore.vpsList"
      :cms-options="cmsOptions"
      :view-only="isViewOnly"
      @close="closeModal" 
      @website-created="handleWebsiteCreated"
      @website-updated="handleWebsiteUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWebsiteStore } from '@/stores/website'
import { useDomainStore } from '@/stores/domains'
import { useHostingStore } from '@/stores/hosting'
import { useVPSStore } from '@/stores/vps'
import { useAuthStore } from '@/stores/auth'
import AddEditWebsiteModal from '@/components/modals/AddEditWebsiteModal.vue'
import type { Website } from '@/types'
import { formatDate } from '@/utils'

// CMS Options
const cmsOptions = [
  'WordPress',
  'Joomla',
  'Drupal',
  'Magento',
  'Shopify',
  'WooCommerce',
  'Custom',
  'Other'
]

const websiteStore = useWebsiteStore()
const domainStore = useDomainStore()
const hostingStore = useHostingStore()
const vpsStore = useVPSStore()
const authStore = useAuthStore()

const isModalOpen = ref(false)
const selectedWebsite = ref<Website | null>(null)
const isViewOnly = ref(false)
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const modalError = ref<string | null>(null)

// Search placeholder
const searchPlaceholder = computed(() => {
  return 'Search website names and URLs...'
})

// Client-side filtered websites
const filteredWebsites = computed(() => {
  let websites = websiteStore.websites

  // Apply search filter
  if (search.value && search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim()
    websites = websites.filter(website => 
      website.name.toLowerCase().includes(searchTerm) ||
      (website.url && website.url.toLowerCase().includes(searchTerm))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    websites = websites.filter(website => website.status === statusFilter.value)
  }

  // Apply CMS filter
  if (typeFilter.value) {
    websites = websites.filter(website => website.cms === typeFilter.value)
  }

  return websites
})

// Clear search
const clearSearch = () => {
  search.value = ''
}

// Clear all filters
const clearAllFilters = () => {
  search.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
}

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return search.value || statusFilter.value || typeFilter.value
})

// Handle filter changes
const handleFilterChange = () => {
  // No API call needed for client-side filtering
      // Filter changed
}

onMounted(async () => {
  await Promise.all([
    websiteStore.fetchWebsites(),
    domainStore.fetchDomains({ limit: 500 }), // Fetch all domains for modal
    hostingStore.fetchHostings(),
    vpsStore.fetchVPSList()
  ])
})

const openAddWebsiteModal = async (website: Website | null = null) => {
  // Ensure domains are loaded for the modal
  if (domainStore.allDomains.length === 0) {
    // Fetching domains for website modal
    await domainStore.fetchDomains({ limit: 500 })
  }
  
  selectedWebsite.value = website
  isViewOnly.value = false
  modalError.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedWebsite.value = null
  isViewOnly.value = false
  modalError.value = null
}

const handleWebsiteCreated = (website: Website) => {
  // Website created
  closeModal()
}

const handleWebsiteUpdated = (website: Website) => {
  // Website updated
  closeModal()
}

const copyToClipboard = async (websiteId: string) => {
  try {
    // Get the actual password from the API
    const password = await websiteStore.getWebsitePassword(websiteId)
    
    if (password) {
      await navigator.clipboard.writeText(password)
      alert('Password copied to clipboard!')
      // Copied to clipboard
    } else {
      alert('No password available for this website')
    }
  } catch (err) {
    // Failed to copy to clipboard
    alert('Failed to copy password to clipboard')
  }
}

const confirmDelete = async (id: string) => {
  const website = websiteStore.websites.find(w => w.id === id)
  
  if (!website) {
    alert('Website not found')
    return
  }
  
  if (window.confirm(`Are you sure you want to delete the website "${website.name}"? This cannot be undone.`)) {
    try {
      const result = await websiteStore.deleteWebsite(id)
      
      if (result && result.status === 'error') {
        alert(`Failed to delete website: ${result.message}`)
        return
      }
      
      // Website deleted successfully
      alert(`Website "${website.name}" has been deleted successfully.`)
    } catch (error: any) {
      // Error deleting website
      alert(`Error deleting website: ${error.message || 'An unexpected error occurred'}`)
    }
  }
}

const openWebsiteInNewTab = (url: string) => {
  window.open(url, '_blank')
}

const viewWebsiteDetails = (website: Website) => {
  selectedWebsite.value = website
  isViewOnly.value = true
  modalError.value = null
  isModalOpen.value = true
}
</script> 