<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white shadow-sm rounded-lg">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Domain Management</h1>
            <p class="mt-1 text-sm text-gray-500">Manage your domain portfolio and track expiration dates</p>
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
                  aria-label="Search domains"
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
                <option value="EXPIRED">Expired</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              
              <!-- Registrar Filter -->
              <select 
                v-model="registrarFilter" 
                @change="handleFilterChange"
                class="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">All Registrars</option>
                <option v-for="registrar in uniqueRegistrars" :key="registrar" :value="registrar">
                  {{ registrar }}
                </option>
              </select>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button 
                @click="domainsStore.fetchDomains()"
                :disabled="domainsStore.loading"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
                title="Refresh domains"
              >
                <svg :class="domainsStore.loading ? 'animate-spin' : ''" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                v-if="authStore.canCreateDomain"
                @click="openAddDomainModal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Domain
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
              Search Results: {{ filteredDomains.length }} domains found
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
              Status: {{ statusFilter.replace('_', ' ') }}
              <button @click="statusFilter = ''; handleFilterChange()" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            
            <span v-if="registrarFilter" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Registrar: {{ registrarFilter }}
              <button @click="registrarFilter = ''; handleFilterChange()" class="ml-1 text-purple-600 hover:text-purple-800">
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


    <!-- Domains Table -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <!-- Loading State -->
      <div v-if="domainsStore.loading" class="p-8 text-center">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading domains...
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="domainsStore.error" class="p-8 text-center">
        <div class="text-red-600 mb-4">
          <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 0v4m0-4h4m-4 0H8m9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium">Error loading domains</h3>
          <p class="mt-1">{{ domainsStore.error }}</p>
          <p class="mt-2 text-sm text-gray-500">
            {{ domainsStore.domains.length > 0 ? 'Showing fallback data. Some features may be limited.' : 'Unable to load any domain data.' }}
          </p>
        </div>
        <div class="flex flex-col space-y-4 items-center">
          <button 
            @click="domainsStore.fetchDomains()"
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
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Update Authentication Token
          </a>
          
          <button
            @click="loginAgain"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login Again
          </button>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrar
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain Hosting
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="domain in filteredDomains" :key="domain.id" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <button 
                      @click="openDomainModal(domain)"
                      class="text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer transition-colors duration-200"
                    >
                      {{ domain.name }}
                    </button>
                    <div class="text-sm text-gray-500">
                      <span v-if="domain.whoisData" class="inline-flex items-center text-xs text-green-600">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Whois Data
                      </span>
                      <span v-else class="inline-flex items-center text-xs text-gray-400">
                        No Whois Data
                      </span>
                    </div>
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
                    <div class="text-sm font-medium text-gray-900">{{ domain.registrar || 'Unknown' }}</div>
                    <div class="text-sm text-gray-500">Registrar</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap status-column">
                <div class="flex items-center space-x-2 status-indicators">
                  <!-- Status Badge -->
                  <div class="relative group">
                    <span :class="getEnhancedStatusClass(domain.status, domain.expiresAt)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium status-badge">
                      <svg :class="getStatusIconClass(domain.status, domain.expiresAt)" class="mr-1.5 h-2 w-2 status-icon" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3"/>
                      </svg>
                      {{ getEnhancedStatusText(domain.status, domain.expiresAt) }}
                    </span>
                    
                    <!-- Tooltip -->
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 tooltip">
                      <div class="flex flex-col space-y-1">
                        <div class="font-medium">{{ getStatusTooltipTitle(domain.status, domain.expiresAt) }}</div>
                        <div v-if="domain.expiresAt" class="text-gray-300">
                          {{ getStatusTooltipDetails(domain.expiresAt) }}
                        </div>
                        <div v-if="domain.whoisData" class="text-blue-400 text-xs">
                          ℹ Whois data available
                        </div>
                        
                      </div>
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>



                  <!-- Whois data indicator -->
                  <div v-if="domain.whoisData" class="flex items-center" title="Whois data available">
                    <svg class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>


                </div>

                <!-- Progress Bar for Expiration -->
                <div v-if="domain.expiresAt" class="mt-2">
                  <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Expiration Progress</span>
                    <span>{{ getExpirationProgressText(domain.expiresAt) }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5 progress-bar">
                    <div 
                      :class="getProgressBarClass(domain.status, domain.expiresAt)"
                      :style="{ width: getExpirationProgressPercentage(domain.expiresAt) + '%' }"
                      class="h-1.5 rounded-full transition-all duration-300"
                    ></div>
                  </div>
                </div>



                <!-- Status indicators row -->
                <div class="mt-1 flex items-center space-x-2">
                  <span v-if="domain.isMainDomain" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Main
                  </span>
                  <span v-else-if="domain.hostingId || domain.vpsId" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Assigned
                  </span>
                  <span v-else class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    Available
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div v-if="domain.domainHosting" class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ domain.domainHosting }}</div>
                      <div class="text-sm text-gray-500">
                        <span v-if="domain.isMainDomain" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Main Domain
                        </span>
                        <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Addon Domain
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-500">Not Assigned</div>
                      <div class="text-sm text-gray-400">Available for assignment</div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div class="font-medium">{{ formatDate(domain.expiresAt) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                  <svg class="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <div>
                    <div class="font-medium text-gray-900">{{ formatDate(domain.createdAt) }}</div>
                    <div class="text-xs text-gray-500">Created</div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredDomains.length === 0 && !domainsStore.loading">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="space-y-3">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                  </svg>
                  <div>
                    <h3 class="text-sm font-medium text-gray-900">No domains found</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ search ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by adding your first domain.' }}
                    </p>
                  </div>
                  <div>
                    <button 
                      @click="openAddDomainModal"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Add Domain
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="lg:hidden">
        <div class="space-y-4">
          <div v-for="domain in filteredDomains" :key="domain.id" class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <!-- Domain Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center flex-1 min-w-0">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                  </div>
                </div>
                <div class="ml-3 flex-1 min-w-0">
                  <button 
                    @click="openDomainModal(domain)"
                    class="text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer transition-colors duration-200 truncate block"
                  >
                    {{ domain.name }}
                  </button>
                  <div class="text-sm text-gray-500 flex items-center mt-1">
                    <span class="truncate">{{ domain.registrar || 'Unknown' }}</span>
                    <span v-if="domain.whoisData" class="ml-2 inline-flex items-center text-xs text-green-600">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      Whois
                    </span>
                  </div>
                </div>
              </div>
              <!-- Status Badge -->
              <div class="flex-shrink-0 ml-2">
                <span :class="getEnhancedStatusClass(domain.status, domain.expiresAt)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                  <svg :class="getStatusIconClass(domain.status, domain.expiresAt)" class="mr-1 h-2 w-2" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3"/>
                  </svg>
                  {{ getEnhancedStatusText(domain.status, domain.expiresAt) }}
                </span>
              </div>
            </div>

            <!-- Domain Details -->
            <div class="space-y-2 text-sm">
              <!-- Domain Hosting -->
              <div v-if="domain.domainHosting" class="flex items-center justify-between">
                <span class="text-gray-500">Hosting:</span>
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-6 w-6">
                    <div class="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg class="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <span class="ml-2 text-gray-900 font-medium">{{ domain.domainHosting }}</span>
                  <span v-if="domain.isMainDomain" class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Main
                  </span>
                </div>
              </div>

              <!-- Expires -->
              <div v-if="domain.expiresAt" class="flex items-center justify-between">
                <span class="text-gray-500">Expires:</span>
                <div class="text-right">
                  <div class="text-gray-900 font-medium">{{ formatDate(domain.expiresAt) }}</div>
                  <div class="text-xs text-gray-500">
                    <span v-if="getDaysUntilExpiry(domain.expiresAt) > 0">
                      {{ getDaysUntilExpiry(domain.expiresAt) }} days remaining
                    </span>
                    <span v-else-if="getDaysUntilExpiry(domain.expiresAt) < 0">
                      {{ Math.abs(getDaysUntilExpiry(domain.expiresAt)) }} days expired
                    </span>
                    <span v-else>
                      Expires today
                    </span>
                  </div>
                </div>
              </div>

              <!-- Created -->
              <div v-if="domain.createdAt" class="flex items-center justify-between">
                <span class="text-gray-500">Created:</span>
                <span class="text-gray-900">{{ formatDate(domain.createdAt) }}</span>
              </div>

              <!-- Status Indicators -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center space-x-2">
                  <span v-if="domain.isMainDomain" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    Main
                  </span>
                  <span v-else-if="domain.hostingId || domain.vpsId" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Assigned
                  </span>
                  <span v-else class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    Available
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <div v-if="domain.whoisData" class="flex items-center" title="Whois data available">
                    <svg class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div v-if="domain.renewalPrice" class="flex items-center" title="Renewal price: {{ formatRupiah(domain.renewalPrice) }}">
                    <svg class="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Mobile -->
          <div v-if="filteredDomains.length === 0 && !domainsStore.loading" class="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div class="space-y-3">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-gray-900">No domains found</h3>
                <p class="mt-1 text-sm text-gray-500">
                  {{ search ? 'Try adjusting your search to find what you\'re looking for.' : 'Get started by adding your first domain.' }}
                </p>
              </div>
              <div v-if="authStore.canCreateDomain">
                <button 
                  @click="openAddDomainModal"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="domainsStore.domains.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="domainsStore.pagination.page <= 1"
              :class="[
                domainsStore.pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
                'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white'
              ]"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="domainsStore.pagination.page >= domainsStore.pagination.pages"
              :class="[
                domainsStore.pagination.page >= domainsStore.pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
                'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white'
              ]"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ startItem }}</span> to <span class="font-medium">{{ endItem }}</span> of 
                <span class="font-medium">{{ domainsStore.pagination.total }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="prevPage"
                  :disabled="domainsStore.pagination.page <= 1"
                  :class="[
                    domainsStore.pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
                    'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500'
                  ]"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === domainsStore.pagination.page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="domainsStore.pagination.page >= domainsStore.pagination.pages"
                  :class="[
                    domainsStore.pagination.page >= domainsStore.pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
                    'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500'
                  ]"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Domain Whois Modal -->
    <DomainWhoisModal
      :is-open="modalState.isOpen"
      :domain="modalState.selectedDomain"
      @close="closeModal"
      @refresh="handleModalRefresh"
      @edit-domain="handleEditDomain"
      @domain-deleted="handleDomainDeleted"
    />

    <!-- Edit Domain Modal -->
    <EditDomainModal
      :is-open="editModalState.isOpen"
      :domain="editModalState.selectedDomain"
      @close="closeEditModal"
      @success="handleEditDomainSuccess"
    />

    <!-- Add Domain Modal -->
    <AddDomainModal
      :is-open="addDomainModalState.isOpen"
      @close="closeAddDomainModal"
      @success="handleAddDomainSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useDomainStore } from '@/stores/domains'
import { useAuthStore } from '@/stores/auth'
import AddDomainModal from '@/components/modals/AddDomainModal.vue'
import DomainWhoisModal from '@/components/modals/DomainWhoisModal.vue'
import EditDomainModal from '@/components/modals/EditDomainModal.vue'
import type { Domain } from '@/types'
import { getComprehensiveStatusClass, formatDate, getExpirationMessage } from '@/utils'
import { formatRupiah } from '@/utils/currency'

// Stores
const domainsStore = useDomainStore()
const authStore = useAuthStore()

// Enhanced Status Functions
const getEnhancedStatusClass = (status: string, expiresAt: string | null | undefined) => {
  return getComprehensiveStatusClass(status, expiresAt)
}

const getStatusIconClass = (status: string, expiresAt: string | null | undefined) => {
  if (!expiresAt) return 'text-gray-400'
  
  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-500'
  if (diffDays <= 30) return 'text-yellow-500'
  return 'text-green-500'
}

const getEnhancedStatusText = (status: string, expiresAt: string | null | undefined) => {
  if (!expiresAt) return status
  
  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Expired'
  }
  if (diffDays <= 30) {
    return 'Expiring Soon'
  }
  return 'Active'
}

const getStatusTooltipTitle = (status: string, expiresAt: string | null | undefined) => {
  if (!expiresAt) return status
  
  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Domain Expired'
  if (diffDays <= 30) return 'Domain Expiring Soon'
  return 'Domain Active'
}

const getStatusTooltipDetails = (expiresAt: string) => {
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`
  }
  if (diffDays === 0) {
    return 'Expires today'
  }
  if (diffDays === 1) {
    return 'Expires tomorrow'
  }
  return `Expires in ${diffDays} days`
}

const getDaysUntilExpiry = (expiresAt: string | null | undefined): number => {
  if (!expiresAt) return 0
  
  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const diffTime = expiryDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getExpirationProgressText = (expiresAt: string | null | undefined): string => {
  if (!expiresAt) return 'No expiry date'
  
  const daysUntil = getDaysUntilExpiry(expiresAt)
  
  if (daysUntil < 0) {
    return `${Math.abs(daysUntil)} days overdue`
  }
  if (daysUntil === 0) {
    return 'Expires today'
  }
  if (daysUntil <= 30) {
    return `${daysUntil} days left`
  }
  return `${daysUntil} days remaining`
}

const getExpirationProgressPercentage = (expiresAt: string | null | undefined): number => {
  if (!expiresAt) return 0
  
  const daysUntil = getDaysUntilExpiry(expiresAt)
  
  // Calculate percentage based on a 365-day period
  const totalPeriod = 365
  const remainingDays = Math.max(0, daysUntil)
  
  // If expired, show 100%
  if (daysUntil < 0) return 100
  
  // Calculate percentage (inverse: more days = lower percentage)
  const percentage = Math.max(0, Math.min(100, ((totalPeriod - remainingDays) / totalPeriod) * 100))
  
  return Math.round(percentage)
}

const getProgressBarClass = (status: string, expiresAt: string | null | undefined): string => {
  if (!expiresAt) return 'bg-gray-300'
  
  const daysUntil = getDaysUntilExpiry(expiresAt)
  
  if (daysUntil < 0) return 'bg-red-500'
  if (daysUntil <= 30) return 'bg-yellow-500'
  if (daysUntil <= 90) return 'bg-orange-400'
  return 'bg-green-500'
}



// Search functionality - simplified
const search = ref('')
const statusFilter = ref('')
const registrarFilter = ref('')
const debounceTimer = ref<NodeJS.Timeout | null>(null)

// Unique registrars for filter dropdown
const uniqueRegistrars = computed(() => {
  return [...new Set(domainsStore.domains.map(d => d.registrar).filter((r): r is string => r !== null))].sort()
})

// Search placeholder
const searchPlaceholder = computed(() => {
  return 'Search domain names...'
})

// Client-side filtered domains - simplified
const filteredDomains = computed(() => {
  let domains = domainsStore.domains

  // Apply search filter
  if (search.value && search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim()
    domains = domains.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm) ||
      (domain.registrar && domain.registrar.toLowerCase().includes(searchTerm))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    domains = domains.filter(domain => domain.status === statusFilter.value)
  }

  // Apply registrar filter
  if (registrarFilter.value) {
    domains = domains.filter(domain => domain.registrar === registrarFilter.value)
  }

  return domains
})

// Clear search
const clearSearch = () => {
  search.value = ''
}

// Clear all filters
const clearAllFilters = () => {
  search.value = ''
  statusFilter.value = ''
  registrarFilter.value = ''
}

// Check if there are any active filters
const hasActiveFilters = computed(() => {
  return search.value || statusFilter.value || registrarFilter.value
})

// Handle search with debouncing - client-side only
const handleSearch = () => {
  if (search.value.trim()) {
    // Perform client-side search
    const searchTerm = search.value.toLowerCase()
    const filtered = domainsStore.domains.filter(domain => 
      domain.name.toLowerCase().includes(searchTerm) ||
      domain.registrar?.toLowerCase().includes(searchTerm)
    )
    // Update the store with filtered results
    domainsStore.domains = filtered
  } else {
    // Reset to original data
    fetchDomains()
  }
}

// Handle filter changes - client-side only
const handleFilterChange = () => {
  const filtered = domainsStore.domains.filter(domain => {
    const statusMatch = !statusFilter.value || domain.status === statusFilter.value
    const registrarMatch = !registrarFilter.value || domain.registrar === registrarFilter.value
    return statusMatch && registrarMatch
  })
  // Update the store with filtered results
  domainsStore.domains = filtered
}

// Computed properties for pagination
const startItem = computed(() => {
  return (domainsStore.pagination.page - 1) * domainsStore.pagination.limit + 1
})

const endItem = computed(() => {
  const end = domainsStore.pagination.page * domainsStore.pagination.limit
  return end > domainsStore.pagination.total ? domainsStore.pagination.total : end
})

const displayedPages = computed(() => {
  const total = domainsStore.pagination.pages
  const current = domainsStore.pagination.page
  const pages = []
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i)
      }
    }
  }
  
  return pages
})

// Fetch domains
const fetchDomains = async () => {
  try {
    await domainsStore.fetchDomains({
      page: domainsStore.pagination.page,
      limit: domainsStore.pagination.limit,
      search: search.value,
      status: statusFilter.value,
      registrar: registrarFilter.value
    })
  } catch (error) {
    // Handle error
  }
}

// Watch for search changes
watch(search, (newValue) => {
  if (newValue.trim()) {
    handleSearch()
  } else {
    fetchDomains()
  }
})

// Watch for filter changes
watch([statusFilter, registrarFilter], () => {
  handleFilterChange()
})

// Initialize search on mount
onMounted(() => {
  fetchDomains()
})

// Pagination methods
const goToPage = async (page: number) => {
  domainsStore.setFilters({ page })
  await fetchDomains()
}

const prevPage = async () => {
  if (domainsStore.pagination.page > 1) {
    await goToPage(domainsStore.pagination.page - 1)
  }
}

const nextPage = async () => {
  if (domainsStore.pagination.page < domainsStore.pagination.pages) {
    await goToPage(domainsStore.pagination.page + 1)
  }
}

// Modal state
const modalState = ref({
  isOpen: false,
  selectedDomain: null as Domain | null
})

// Edit Domain Modal state
const editModalState = ref({
  isOpen: false,
  selectedDomain: null as Domain | null
})

// Add Domain Modal state
const addDomainModalState = ref({
  isOpen: false
})

// Open domain modal
const openDomainModal = (domain: Domain) => {
  modalState.value.selectedDomain = domain
  modalState.value.isOpen = true
}

// Close modal
const closeModal = () => {
  modalState.value.isOpen = false
  modalState.value.selectedDomain = null
}

// Handle modal refresh
const handleModalRefresh = async () => {
  // Refresh the domains list after Whois data is updated
  await fetchDomains()
}

// Handle domain deleted
const handleDomainDeleted = async (domainId: string) => {
  // Refresh the domains list after domain is deleted
  await fetchDomains()
  console.log('Domain deleted successfully:', domainId)
}

// Open Edit Domain modal
const openEditDomainModal = (domain: Domain) => {
  editModalState.value.selectedDomain = domain
  editModalState.value.isOpen = true
}

// Close Edit Domain modal
const closeEditModal = () => {
  editModalState.value.isOpen = false
  editModalState.value.selectedDomain = null
}

// Handle Edit Domain success
const handleEditDomainSuccess = async () => {
  // Refresh the domains list to show the new domain
  await fetchDomains()
  console.log('Domain edited successfully')
  closeEditModal()
}

// Open Add Domain modal
const openAddDomainModal = () => {
  addDomainModalState.value.isOpen = true
}

// Close Add Domain modal
const closeAddDomainModal = () => {
  addDomainModalState.value.isOpen = false
}

// Handle Add Domain success
const handleAddDomainSuccess = async (newDomain: Domain) => {
  // Refresh the domains list to show the new domain
  await fetchDomains()
  console.log('Domain added successfully:', newDomain.name)
}

// Show domain actions (placeholder for dropdown menu)
const showDomainActions = (domain: Domain) => {
  console.log('Show actions for domain:', domain.name)
  // TODO: Implement dropdown menu or modal for domain actions
}

// Redirect to login page
const loginAgain = () => {
  localStorage.removeItem('auth_token')
  window.location.href = '/login'
}

// Handle edit domain
const handleEditDomain = (domain: Domain) => {
  openEditDomainModal(domain)
}


onMounted(async () => {
  await fetchDomains()
})
</script> 

<style scoped>
/* Enhanced Status Column Styles */
.status-column {
  min-width: 200px;
}

.status-badge {
  transition: all 0.2s ease-in-out;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  transition: width 0.5s ease-in-out;
}

.tooltip {
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .status-column {
    min-width: 150px;
  }
  
  .status-indicators {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

/* Animation for status icons */
.status-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Hover effects for interactive elements */
.status-badge:hover .status-icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -3px, 0);
  }
  70% {
    transform: translate3d(0, -1.5px, 0);
  }
  90% {
    transform: translate3d(0, -0.5px, 0);
  }
}
</style> 