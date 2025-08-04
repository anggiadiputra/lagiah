import { apiService } from './api'

export interface UserProfile {
  name: string
  email?: string
}

export interface PasswordChange {
  currentPassword: string
  newPassword: string
}

export interface ProfileUpdateResponse {
  status: string
  data: {
    message: string
    user: {
      id: string
      name: string
      email: string
      role: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
  meta: {
    timestamp: string
    version: string
  }
}

export interface PasswordChangeResponse {
  status: string
  data: {
    message: string
    user: {
      id: string
      name: string
      email: string
      role: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
  meta: {
    timestamp: string
    version: string
  }
}

class AuthService {
  // Update user profile
  async updateProfile(profileData: UserProfile): Promise<ProfileUpdateResponse> {
    try {
      const response = await apiService.updateProfile(profileData)
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Change user password
  async changePassword(passwordData: PasswordChange): Promise<PasswordChangeResponse> {
    try {
      const response = await apiService.changePassword(passwordData)
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

export const authService = new AuthService()
export default authService 