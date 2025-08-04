import { apiService } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER'
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  role?: 'ADMIN' | 'STAFF' | 'FINANCE' | 'VIEWER'
  isActive?: boolean
}

export interface UsersResponse {
  items: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// For direct response from API
export interface UsersApiResponse {
  items: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CreateUserResponse {
  message: string
  user: User
}

class UsersService {
  // Get all users with pagination and filters
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }): Promise<UsersResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.role) queryParams.append('role', params.role)
      
      const response = await apiService.getUsers(params)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        return response.data
      } else {
        throw new Error(response?.message || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiService.createUser(userData)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        return response.data
      } else {
        throw new Error(response?.message || 'Failed to create user')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }

  // Update user
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiService.updateUser(userId, userData)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        return response.data
      } else {
        throw new Error(response?.message || 'Failed to update user')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ status: string; data: { message: string } }> {
    try {
      const response = await apiService.deleteUser(userId)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        return response
      } else {
        throw new Error(response?.message || 'Failed to delete user')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ status: string; data: { user: User } }> {
    try {
      const response = await apiService.getUser(userId)
      
      // Handle response format from API
      if (response && response.status === 'success' && response.data) {
        return response
      } else {
        throw new Error(response?.message || 'Failed to fetch user')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }
}

export const usersService = new UsersService()
export default usersService 