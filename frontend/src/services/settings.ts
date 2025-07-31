import apiService from './api'

export interface AppSettings {
  app_name: string
  default_language: string
  timezone: string
  email_notifications: boolean
  domain_expiry_alerts: boolean
  hosting_expiry_alerts: boolean
}

export interface SecuritySettings {
  min_password_length: number
  require_uppercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  session_timeout: number
  force_logout_on_password_change: boolean
}

export interface SettingsResponse {
  status: string
  data: {
    settings: Record<string, any>
    raw: any[]
  }
  meta: {
    timestamp: string
    version: string
  }
}

// Interface for the actual response data (after interceptor)
export interface SettingsData {
  settings: Record<string, any>
  raw: any[]
}

export interface UpdateSettingsRequest {
  settings: Array<{
    key: string
    value: string
    type?: 'string' | 'number' | 'boolean' | 'json'
    category?: string
  }>
}

export interface UpdateSettingsResponse {
  status: string
  data: {
    message: string
    updatedCount: number
    settings: any[]
  }
  meta: {
    timestamp: string
    version: string
  }
}

class SettingsService {
  // Get all settings
  async getSettings(category?: string): Promise<SettingsData> {
    try {
      const params = category ? `?category=${category}` : ''
      const response = await apiService.get(`/settings${params}`)
      
      // Handle response structure from API interceptor
      const responseData = response.data ? response.data : response
      
      if (responseData.status === 'success' && responseData.data) {
        return responseData.data
      } else {
        throw new Error('Invalid response structure from settings API')
      }
    } catch (error) {
      throw error
    }
  }

  // Get application settings
  async getAppSettings(): Promise<AppSettings> {
    try {
      const response = await this.getSettings('application')
      
      // Handle response structure
      if (response && response.settings) {
        return response.settings as AppSettings
      } else {
        throw new Error('Invalid response structure from settings API')
      }
    } catch (error) {
      throw error
    }
  }

  // Get security settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await this.getSettings('security')
      
      // Response interceptor returns response.data directly
      // So response is already the API response data
      if (response && response.settings) {
        return response.settings as SecuritySettings
      } else {
        throw new Error('Invalid response structure from settings API')
      }
    } catch (error) {
      throw error
    }
  }

  // Update settings
  async updateSettings(settings: UpdateSettingsRequest['settings']): Promise<UpdateSettingsResponse> {
    try {
      const response = await apiService.put('/settings', { settings })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Update application settings
  async updateAppSettings(appSettings: Partial<AppSettings>): Promise<UpdateSettingsResponse> {
    try {
      const settings = Object.entries(appSettings).map(([key, value]) => ({
        key,
        value: String(value),
        type: (typeof value === 'boolean' ? 'boolean' : 'string') as 'string' | 'boolean',
        category: 'application'
      }))

      return await this.updateSettings(settings)
    } catch (error) {
      throw error
    }
  }

  // Update security settings
  async updateSecuritySettings(securitySettings: Partial<SecuritySettings>): Promise<UpdateSettingsResponse> {
    try {
      const settings = Object.entries(securitySettings).map(([key, value]) => ({
        key,
        value: String(value),
        type: (typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string') as 'string' | 'number' | 'boolean',
        category: 'security'
      }))

      return await this.updateSettings(settings)
    } catch (error) {
      throw error
    }
  }
}

export const settingsService = new SettingsService()
export default settingsService 