import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "../generated/prisma"

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string
      role: UserRole
      isActive: boolean
    } & DefaultSession["user"]
  }

  /**
   * Extend the built-in user types
   */
  interface User extends DefaultUser {
    id: string
    role: UserRole
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the JWT payload
   */
  interface JWT {
    id: string
    role: UserRole
    isActive: boolean
  }
} 