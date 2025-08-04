import { getServerSession } from "next-auth"
import { authOptions } from "./auth-options"

/**
 * Get the current user's session on the server side
 * @returns The current session or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user on the server side
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

/**
 * Check if the current user has a specific role
 * @param role The role to check
 * @returns True if the user has the role, false otherwise
 */
export async function hasRole(role: string | string[]) {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }
  
  if (Array.isArray(role)) {
    return role.includes(user.role)
  }
  
  return user.role === role
}

/**
 * Check if the current user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
} 