<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Access Control - Only show for non-admin users -->
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
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <p class="mt-2 text-gray-600">Manage your application settings and preferences</p>
        </div>

      <!-- Settings Tabs -->
      <div class="bg-white shadow rounded-lg">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Application Settings Tab -->
          <div v-if="activeTab === 'app'" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Application Settings</h2>
            
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- General Settings -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Application Name</label>
                    <input
                      v-model="appSettings.appName"
                      type="text"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Default Language</label>
                    <select
                      v-model="appSettings.language"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="en">English</option>
                      <option value="id">Indonesian</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      v-model="appSettings.timezone"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Notification Settings -->
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p class="text-sm text-gray-500">Receive email notifications for important events</p>
                    </div>
                    <button
                      @click="appSettings.emailNotifications = !appSettings.emailNotifications"
                      :class="[
                        appSettings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      ]"
                    >
                      <span
                        :class="[
                          appSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        ]"
                      />
                    </button>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Domain Expiry Alerts</label>
                      <p class="text-sm text-gray-500">Get notified before domains expire</p>
                    </div>
                    <button
                      @click="appSettings.domainExpiryAlerts = !appSettings.domainExpiryAlerts"
                      :class="[
                        appSettings.domainExpiryAlerts ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      ]"
                    >
                      <span
                        :class="[
                          appSettings.domainExpiryAlerts ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        ]"
                      />
                    </button>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">Hosting Expiry Alerts</label>
                      <p class="text-sm text-gray-500">Get notified before hosting expires</p>
                    </div>
                    <button
                      @click="appSettings.hostingExpiryAlerts = !appSettings.hostingExpiryAlerts"
                      :class="[
                        appSettings.hostingExpiryAlerts ? 'bg-primary-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                      ]"
                    >
                      <span
                        :class="[
                          appSettings.hostingExpiryAlerts ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        ]"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button
                @click="saveAppSettings"
                :disabled="isSavingAppSettings"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isSavingAppSettings" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSavingAppSettings ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </div>

          <!-- Security Settings Tab -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900">Security Settings</h2>
            
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                  <input
                    v-model.number="securitySettings.minPasswordLength"
                    type="number"
                    min="6"
                    max="20"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="securitySettings.requireUppercase"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Require uppercase letters</label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="securitySettings.requireNumbers"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Require numbers</label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="securitySettings.requireSpecialChars"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Require special characters</label>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                  <input
                    v-model.number="securitySettings.sessionTimeout"
                    type="number"
                    min="15"
                    max="480"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="securitySettings.forceLogoutOnPasswordChange"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Force logout on password change</label>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
              <button
                @click="saveSecuritySettings"
                :disabled="isSavingSecuritySettings"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isSavingSecuritySettings" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSavingSecuritySettings ? 'Saving...' : 'Save Security Settings' }}
              </button>
            </div>
          </div>

          <!-- WhatsApp Settings Tab -->
          <div v-if="activeTab === 'whatsapp'" class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">WhatsApp Notifications</h2>
                <p class="mt-1 text-sm text-gray-600">Configure WhatsApp notifications for domain, hosting, and VPS alerts</p>
              </div>
              <div class="flex items-center">
                <span class="text-sm text-gray-500 mr-3">Enable WhatsApp</span>
                <button
                  @click="whatsappSettings.enabled = !whatsappSettings.enabled"
                  :class="[
                    whatsappSettings.enabled ? 'bg-green-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                  ]"
                >
                  <span
                    :class="[
                      whatsappSettings.enabled ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    ]"
                  />
                </button>
              </div>
            </div>

            <div v-if="whatsappSettings.enabled" class="space-y-6">
              <!-- API Configuration -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  API Configuration
                </h3>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">API Token</label>
                    <input
                      v-model="whatsappSettings.apiToken"
                      type="password"
                      placeholder="Enter your Fonnte API token"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    <p class="mt-1 text-xs text-gray-500">Get your API token from <a href="https://fonnte.com" target="_blank" class="text-green-600 hover:text-green-500">Fonnte.com</a></p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Country Code</label>
                    <input
                      v-model="whatsappSettings.defaultCountryCode"
                      type="text"
                      placeholder="62"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    <p class="mt-1 text-xs text-gray-500">Default country code for phone numbers</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Recipient Phone Number</label>
                    <div class="flex">
                      <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +{{ whatsappSettings.defaultCountryCode }}
                      </span>
                      <input
                        v-model="whatsappSettings.recipientPhoneNumber"
                        type="text"
                        placeholder="82227097005"
                        class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-green-500 focus:border-green-500 text-sm border border-gray-300"
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500">Phone number that will receive notifications (without country code)</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Alert Days Before Expiry</label>
                    <input
                      v-model.number="whatsappSettings.alertDaysBeforeExpiry"
                      type="number"
                      min="1"
                      max="30"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                    <p class="mt-1 text-xs text-gray-500">Send notification X days before expiry (default: 7 days)</p>
                  </div>
                </div>
                
                <!-- Save Button - Moved here for better accessibility -->
                <div class="flex justify-end mt-6">
                  <button
                    @click="saveWhatsAppSettings"
                    :disabled="isSavingWhatsAppSettings"
                    class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isSavingWhatsAppSettings" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSavingWhatsAppSettings ? 'Saving...' : 'Save Settings' }}
                  </button>
                </div>
              </div>

              <!-- Notification Types -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM20 4v6h2V4h-2zM4 4v6h2V4H4z"></path>
                  </svg>
                  Notification Types
                </h3>
                <div class="space-y-3">
                  <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      v-model="whatsappSettings.notifications.domainExpiry"
                      type="checkbox"
                      class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div class="ml-3">
                      <label class="text-sm font-medium text-gray-900">Domain Expiry</label>
                      <p class="text-xs text-gray-500">Get notified before domain expires</p>
                    </div>
                  </div>
                  <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      v-model="whatsappSettings.notifications.hostingExpiry"
                      type="checkbox"
                      class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div class="ml-3">
                      <label class="text-sm font-medium text-gray-900">Hosting Expiry</label>
                      <p class="text-xs text-gray-500">Get notified before hosting expires</p>
                    </div>
                  </div>
                  <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      v-model="whatsappSettings.notifications.vpsExpiry"
                      type="checkbox"
                      class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div class="ml-3">
                      <label class="text-sm font-medium text-gray-900">VPS Expiry</label>
                      <p class="text-xs text-gray-500">Get notified before VPS expires</p>
                    </div>
                  </div>
                  <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      v-model="whatsappSettings.notifications.systemAlerts"
                      type="checkbox"
                      class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div class="ml-3">
                      <label class="text-sm font-medium text-gray-900">System Alerts</label>
                      <p class="text-xs text-gray-500">Receive system notifications</p>
                    </div>
                  </div>
                </div>
                
                <!-- Save Button for Notification Types -->
                <div class="flex justify-end mt-6">
                  <button
                    @click="saveNotificationTypes"
                    :disabled="isSavingNotificationTypes"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isSavingNotificationTypes" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSavingNotificationTypes ? 'Saving...' : 'Save Notification Types' }}
                  </button>
                </div>
              </div>

              <!-- Message Templates -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  Message Templates
                </h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Domain Expiry Message</label>
                    <textarea
                      v-model="whatsappSettings.templates.domainExpiry"
                      rows="2"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="⚠️ Domain {domain} akan berakhir pada {expiryDate}"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Hosting Expiry Message</label>
                    <textarea
                      v-model="whatsappSettings.templates.hostingExpiry"
                      rows="2"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="⚠️ Hosting {hosting} akan berakhir pada {expiryDate}"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">VPS Expiry Message</label>
                    <textarea
                      v-model="whatsappSettings.templates.vpsExpiry"
                      rows="2"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="⚠️ VPS {vps} akan berakhir pada {expiryDate}"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">System Alert Message</label>
                    <textarea
                      v-model="whatsappSettings.templates.systemAlert"
                      rows="2"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="🚨 Alert System: {message}"
                    ></textarea>
                  </div>
                  <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p class="text-sm text-blue-800">
                      <strong>Available variables:</strong> {domain}, {hosting}, {vps}, {expiryDate}, {daysLeft}, {message}, {timestamp}
                    </p>
                  </div>
                </div>
                
                <!-- Save Button for Message Templates -->
                <div class="flex justify-end mt-6">
                  <button
                    @click="saveMessageTemplates"
                    :disabled="isSavingMessageTemplates"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isSavingMessageTemplates" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isSavingMessageTemplates ? 'Saving...' : 'Save Message Templates' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Disabled State -->
            <div v-else class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">WhatsApp notifications disabled</h3>
              <p class="mt-1 text-sm text-gray-500">Enable WhatsApp notifications to configure settings</p>
            </div>

            <!-- WhatsApp Test Configuration Section -->
            <div class="mt-8 bg-white shadow rounded-lg">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900 flex items-center">
                  <svg class="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  WhatsApp Test Configuration
                </h2>
                <p class="mt-1 text-sm text-gray-600">Test your WhatsApp configuration by sending a test message</p>
              </div>
              
              <div class="p-6">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">Send Test Message</h3>
                      <p class="text-sm text-gray-600">Verify your WhatsApp API configuration is working correctly</p>
                    </div>
                    <div class="flex items-center space-x-3">
                      <span class="text-sm text-gray-500 mr-3">Configuration Status</span>
                      <div class="flex items-center">
                        <div v-if="whatsappSettings.enabled && whatsappSettings.apiToken" class="flex items-center text-green-600">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-sm font-medium">Ready</span>
                        </div>
                        <div v-else class="flex items-center text-red-600">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                          </svg>
                          <span class="text-sm font-medium">Not Configured</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <!-- Test Phone Number Input -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Test Phone Number</label>
                      <div class="flex">
                        <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          +{{ whatsappSettings.defaultCountryCode }}
                        </span>
                        <input
                          v-model="testPhoneNumber"
                          type="text"
                          placeholder="82227097005"
                          class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-green-500 focus:border-green-500 text-sm border border-gray-300"
                        />
                      </div>
                      <p class="mt-1 text-xs text-gray-500">Enter phone number without country code (e.g., 82227097005)</p>
                    </div>

                    <!-- Test Message Preview -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Test Message Preview</label>
                      <div class="bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-700">
                        <div class="flex items-start space-x-2">
                          <div class="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.72C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-900">Test message from Lagiah</p>
                            <p class="text-xs text-gray-500">This is a test message to verify your WhatsApp configuration.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Test Buttons -->
                  <div class="flex justify-end space-x-3 mt-6">
                    <button
                      @click="testWhatsApp"
                      :disabled="isTestingWhatsApp || !whatsappSettings.enabled || !whatsappSettings.apiToken"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isTestingWhatsApp" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isTestingWhatsApp ? 'Sending...' : 'Send Test Message' }}
                    </button>
                    
                    <button
                      @click="triggerNotifications"
                      :disabled="isTriggeringNotifications || !whatsappSettings.enabled || !whatsappSettings.apiToken"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isTriggeringNotifications" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isTriggeringNotifications ? 'Triggering...' : 'Trigger Notifications' }}
                    </button>
                  </div>

                  <!-- Test Results -->
                  <div v-if="testResult" class="mt-4 p-4 rounded-md" :class="testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
                    <div class="flex items-start">
                      <div v-if="testResult.success" class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div v-else class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h4 class="text-sm font-medium" :class="testResult.success ? 'text-green-800' : 'text-red-800'">
                          {{ testResult.success ? 'Test Message Sent Successfully!' : 'Test Message Failed' }}
                        </h4>
                        <p class="mt-1 text-sm" :class="testResult.success ? 'text-green-700' : 'text-red-700'">
                          {{ testResult.message }}
                        </p>
                        <p v-if="testResult.timestamp" class="mt-1 text-xs text-gray-500">
                          Sent at {{ new Date(testResult.timestamp).toLocaleString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Account Section (Below the line) -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">User Account</h2>
        <div class="bg-white shadow rounded-lg p-6">
          <div class="space-y-6">
            <!-- Profile Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    v-model="userProfile.name"
                    type="text"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="userProfile.email"
                    type="email"
                    disabled
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                  />
                </div>
              </div>
              <div class="flex justify-end mt-4">
                <button
                  @click="updateProfile"
                  :disabled="isUpdatingProfile"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isUpdatingProfile" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isUpdatingProfile ? 'Saving...' : 'Save Profile' }}
                </button>
              </div>
            </div>

            <!-- Change Password -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    v-model="passwordChange.currentPassword"
                    type="password"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    v-model="passwordChange.newPassword"
                    type="password"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    v-model="passwordChange.confirmPassword"
                    type="password"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div class="flex justify-end">
                  <button
                    @click="changePassword"
                    :disabled="isChangingPassword"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isChangingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { settingsService, type AppSettings as ApiAppSettings, type SecuritySettings as ApiSecuritySettings } from '@/services/settings'
import { authService } from '@/services/auth'
import { apiService } from '@/services/api'
import { useTitle } from '@/composables/useTitle'

// Types for frontend (camelCase)
interface AppSettings {
  appName: string
  language: string
  timezone: string
  emailNotifications: boolean
  domainExpiryAlerts: boolean
  hostingExpiryAlerts: boolean
}

interface SecuritySettings {
  minPasswordLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  sessionTimeout: number
  forceLogoutOnPasswordChange: boolean
}

interface WhatsAppSettings {
  enabled: boolean
  apiToken: string
  apiUrl: string
  defaultCountryCode: string
  defaultDelay: number
  defaultSchedule: number
  recipientPhoneNumber: string
  alertDaysBeforeExpiry: number
  notifications: {
    domainExpiry: boolean
    hostingExpiry: boolean
    vpsExpiry: boolean
    systemAlerts: boolean
  }
  templates: {
    domainExpiry: string
    hostingExpiry: string
    vpsExpiry: string
    systemAlert: string
  }
}

interface UserProfile {
  name: string
  email: string
}

interface PasswordChange {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface TestResult {
  success: boolean
  message: string
  timestamp?: string
}

// Store
const authStore = useAuthStore()
const { updateTitle } = useTitle()

// Reactive data
const activeTab = ref('app')
const currentUser = computed(() => authStore.user)

// Loading states
const isSavingAppSettings = ref(false)
const isSavingSecuritySettings = ref(false)
const isSavingWhatsAppSettings = ref(false)
const isSavingNotificationTypes = ref(false)
const isSavingMessageTemplates = ref(false)
const isUpdatingProfile = ref(false)
const isChangingPassword = ref(false)
const isLoadingSettings = ref(false)
const isTestingWhatsApp = ref(false)
const isTriggeringNotifications = ref(false)
const testPhoneNumber = ref('')
const testResult = ref<TestResult | null>(null)

const appSettings = ref<AppSettings>({
  appName: 'Lagiah',
  language: 'en',
  timezone: 'Asia/Jakarta',
  emailNotifications: true,
  domainExpiryAlerts: true,
  hostingExpiryAlerts: true
})

const securitySettings = ref<SecuritySettings>({
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  sessionTimeout: 120,
  forceLogoutOnPasswordChange: true
})

const whatsappSettings = ref<WhatsAppSettings>({
  enabled: false,
  apiToken: '',
  apiUrl: 'https://api.fonnte.com/send',
  defaultCountryCode: '62',
  defaultDelay: 2,
  defaultSchedule: 0,
  recipientPhoneNumber: '',
  alertDaysBeforeExpiry: 7,
  notifications: {
    domainExpiry: true,
    hostingExpiry: true,
    vpsExpiry: true,
    systemAlerts: false
  },
  templates: {
    domainExpiry: '⚠️ Domain {domain} akan berakhir pada {expiryDate}. Silakan perpanjang domain Anda.',
    hostingExpiry: '⚠️ Hosting {hosting} akan berakhir pada {expiryDate}. Silakan perpanjang hosting Anda.',
    vpsExpiry: '⚠️ VPS {vps} akan berakhir pada {expiryDate}. Silakan perpanjang VPS Anda.',
    systemAlert: '🚨 Alert System: {message}'
  }
})

const userProfile = ref<UserProfile>({
  name: '',
  email: ''
})

const passwordChange = ref<PasswordChange>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Tabs
const tabs = [
  { id: 'app', name: 'Application Settings' },
  { id: 'security', name: 'Security Settings' },
  { id: 'whatsapp', name: 'WhatsApp Settings' }
]

// Methods

const loadSettingsFromAPI = async () => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    // User is not admin, skipping settings load
    return
  }

  try {
    // Load app settings
    const appResponse = await settingsService.getAppSettings()
    if (appResponse && appResponse.data) {
      appSettings.value = { ...defaultAppSettings, ...appResponse.data }
    }

    // Load security settings
    const securityResponse = await settingsService.getSecuritySettings()
    if (securityResponse && securityResponse.data) {
      securitySettings.value = { ...defaultSecuritySettings, ...securityResponse.data }
    }

    // Load WhatsApp settings
    // Loading WhatsApp settings from API
    const whatsappResponse = await settingsService.getWhatsAppSettings()
    // WhatsApp API response received
    
    if (whatsappResponse && whatsappResponse.data) {
      const whatsappData = whatsappResponse.data
      // WhatsApp data from API received
      
      // Parse notifications
      try {
        if (whatsappData.notifications) {
          whatsappSettings.value.notifications = {
            ...defaultWhatsAppSettings.notifications,
            ...JSON.parse(whatsappData.notifications)
          }
        }
      } catch (error) {
        // Error parsing notifications, using defaults
        whatsappSettings.value.notifications = { ...defaultWhatsAppSettings.notifications }
      }

      // Parse templates
      try {
        if (whatsappData.templates) {
          whatsappSettings.value.templates = {
            ...defaultWhatsAppSettings.templates,
            ...JSON.parse(whatsappData.templates)
          }
        }
      } catch (error) {
        // Error parsing templates, using defaults
        whatsappSettings.value.templates = { ...defaultWhatsAppSettings.templates }
      }

      // WhatsApp settings loaded successfully
    } else {
      // No WhatsApp settings found in API response
      whatsappSettings.value = { ...defaultWhatsAppSettings }
    }

    // Load other settings
    const otherResponse = await settingsService.getOtherSettings()
    if (otherResponse && otherResponse.data) {
      otherSettings.value = { ...defaultOtherSettings, ...otherResponse.data }
    }

  } catch (error) {
    // Error loading WhatsApp settings from API
    // Using default WhatsApp settings
    whatsappSettings.value = { ...defaultWhatsAppSettings }
    
    // Settings loaded from API with error
  }
}

// Load settings from localStorage
const loadSettingsFromLocalStorage = () => {
  try {
    const savedAppSettings = localStorage.getItem('lagiah_app_settings')
    if (savedAppSettings) {
      appSettings.value = { ...defaultAppSettings, ...JSON.parse(savedAppSettings) }
    }

    const savedSecuritySettings = localStorage.getItem('lagiah_security_settings')
    if (savedSecuritySettings) {
      securitySettings.value = { ...defaultSecuritySettings, ...JSON.parse(savedSecuritySettings) }
    }

    const savedWhatsAppSettings = localStorage.getItem('lagiah_whatsapp_settings')
    if (savedWhatsAppSettings) {
      whatsappSettings.value = { ...defaultWhatsAppSettings, ...JSON.parse(savedWhatsAppSettings) }
    }

    const savedOtherSettings = localStorage.getItem('lagiah_other_settings')
    if (savedOtherSettings) {
      otherSettings.value = { ...defaultOtherSettings, ...JSON.parse(savedOtherSettings) }
    }
  } catch (error) {
    // Error loading settings from localStorage
  }
}

// Save settings to localStorage
const saveSettingsToLocalStorage = () => {
  try {
    localStorage.setItem('lagiah_app_settings', JSON.stringify(appSettings.value))
    localStorage.setItem('lagiah_security_settings', JSON.stringify(securitySettings.value))
    localStorage.setItem('lagiah_whatsapp_settings', JSON.stringify(whatsappSettings.value))
    localStorage.setItem('lagiah_other_settings', JSON.stringify(otherSettings.value))
  } catch (error) {
    // Error saving app settings
  }
}

// Save security settings
const saveSecuritySettings = async () => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    alert('Only administrators can save security settings.')
    return
  }

  try {
    await settingsService.updateSecuritySettings(securitySettings.value)
    saveSettingsToLocalStorage()
    alert('Security settings saved successfully!')
  } catch (error) {
    // Error saving security settings
    alert('Error saving security settings. Please try again.')
  }
}

// Update user profile
const updateProfile = async () => {
  isProfileLoading.value = true
  try {
    const response = await apiService.put('/auth/profile', {
      name: userProfile.value.name,
      email: userProfile.value.email
    })

    // Profile update response received
    
    if (response.data?.status === 'success') {
      authStore.user = response.data.data
      alert('Profile updated successfully!')
    } else {
      alert('Failed to update profile. Please try again.')
    }
  } catch (error) {
    // Error updating profile
    alert('Error updating profile. Please try again.')
  } finally {
    isProfileLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    alert('New password must be at least 6 characters long')
    return
  }

  isPasswordLoading.value = true
  try {
    const response = await apiService.post('/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    // Password change response received
    
    if (response.data?.status === 'success') {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      alert('Password changed successfully!')
    } else {
      alert('Failed to change password. Please try again.')
    }
  } catch (error) {
    // Error changing password
    alert('Error changing password. Please try again.')
  } finally {
    isPasswordLoading.value = false
  }
}

// Save WhatsApp settings
const saveWhatsAppSettings = async () => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    alert('Only administrators can save WhatsApp settings.')
    return
  }

  try {
    // Starting WhatsApp settings save
    // Current WhatsApp settings
    
    // Prepare data for API
    const apiWhatsAppSettings = {
      enabled: whatsappSettings.value.enabled,
      apiUrl: whatsappSettings.value.apiUrl,
      apiKey: whatsappSettings.value.apiKey,
      notifications: JSON.stringify(whatsappSettings.value.notifications),
      templates: JSON.stringify(whatsappSettings.value.templates)
    }

    // Sending WhatsApp settings to API
    
    // Save to API
    const saveResponse = await settingsService.updateWhatsAppSettings(apiWhatsAppSettings)
    
    // Save response received
    
    // Save to localStorage
    saveSettingsToLocalStorage()
    // Saved to localStorage
    
    // Reload from API to ensure consistency
    // Reloading settings from API
    await loadSettingsFromAPI()
    // Settings reloaded
    
    alert('WhatsApp settings saved successfully!')
  } catch (error) {
    // Error saving WhatsApp settings
    alert('Error saving WhatsApp settings. Please try again.')
  }
}

// Save notification types
const saveNotificationTypes = async () => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    alert('Only administrators can save notification settings.')
    return
  }

  try {
    const saveResponse = await settingsService.updateNotificationTypes(whatsappSettings.value.notifications)
    // Notification types saved response
    alert('Notification types saved successfully!')
  } catch (error) {
    // Error saving notification types
    alert('Error saving notification types. Please try again.')
  }
}

// Save message templates
const saveMessageTemplates = async () => {
  if (!authStore.user || authStore.user.role !== 'ADMIN') {
    alert('Only administrators can save message templates.')
    return
  }

  try {
    const saveResponse = await settingsService.updateMessageTemplates(whatsappSettings.value.templates)
    // Message templates saved response
    alert('Message templates saved successfully!')
  } catch (error) {
    // Error saving message templates
    alert('Error saving message templates. Please try again.')
  }
}

// Test WhatsApp connection
const testWhatsAppConnection = async () => {
  if (!whatsappSettings.value.apiUrl || !whatsappSettings.value.apiKey) {
    testResult.value = 'Please configure WhatsApp API URL and Key first.'
    return
  }

  testResult.value = 'Testing connection...'
  isTesting.value = true

  try {
    const response = await settingsService.testWhatsAppConnection({
      apiUrl: whatsappSettings.value.apiUrl,
      apiKey: whatsappSettings.value.apiKey
    })

    // Full response data
    // Response status
    // Response data field
    // Response error field
    
    if (response.data?.status === 'success') {
      // Success case - setting testResult
      testResult.value = '✅ Connection successful! WhatsApp API is working correctly.'
    } else if (response.data?.data?.status === 'success') {
      // Fallback success case - setting testResult
      testResult.value = '✅ Connection successful! WhatsApp API is working correctly.'
    } else {
      // Error case - setting testResult
      testResult.value = `❌ Connection failed: ${response.data?.error?.message || 'Unknown error'}`
    }
  } catch (error) {
    // Error testing WhatsApp
    testResult.value = '❌ Connection failed: Network error or invalid configuration.'
  } finally {
    isTesting.value = false
  }
}

// Trigger test notifications
const triggerTestNotifications = async () => {
  if (!whatsappSettings.value.enabled) {
    alert('Please enable WhatsApp notifications first.')
    return
  }

  try {
    const response = await settingsService.triggerTestNotifications()
    // Trigger notifications response
    alert('Test notifications sent successfully!')
  } catch (error) {
    // Error triggering notifications
    alert('Error sending test notifications. Please try again.')
  }
}

// Watch for user profile changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    // User profile updated from watcher
    userProfile.value = {
      name: newUser.name || '',
      email: newUser.email || ''
    }
  }
}, { immediate: true })

// Initialize component
onMounted(async () => {
  try {
    // Ensure auth store is initialized
    await authStore.initialize()
    
    if (authStore.user && authStore.user.role === 'ADMIN') {
      // User is admin, loading settings
      await loadSettingsFromAPI()
    } else {
      // User profile loaded
      if (authStore.user) {
        userProfile.value = {
          name: authStore.user.name || '',
          email: authStore.user.email || ''
        }
      }
      
      // User is not admin, skipping settings load
      loadSettingsFromLocalStorage()
    }
  } catch (error) {
    // Error in onMounted
  }
})
</script> 