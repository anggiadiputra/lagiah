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
      
      const response = await apiService.get(`/users?${queryParams.toString()}`)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      return responseData.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiService.post('/users', userData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      return responseData.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user')
    }
  }

  // Update user
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiService.put(`/users/${userId}`, userData)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      return responseData.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<{ status: string; data: { message: string } }> {
    try {
      const response = await apiService.delete(`/users/${userId}`)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      return responseData
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<{ status: string; data: { user: User } }> {
    try {
      const response = await apiService.get(`/users/${userId}`)
      
      // Handle both response formats (direct data or nested in response.data)
      const responseData = response.data ? response.data : response
      return responseData.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }
}

export const usersService = new UsersService()
export default usersService 