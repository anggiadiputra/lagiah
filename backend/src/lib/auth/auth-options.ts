import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "../database"
import { UserRole } from "@/generated/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    // 30 days
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          throw new Error("User not found")
        }

        if (!user.isActive) {
          throw new Error("User is inactive")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // Log login activity
        await prisma.activityLog.create({
          data: {
            action: "LOGIN",
            entity: "USER",
            entityId: user.id,
            description: `User logged in: ${user.email}`,
            userId: user.id,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role as UserRole
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role as UserRole
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      // Log logout activity
      if (token) {
        await prisma.activityLog.create({
          data: {
            action: "LOGOUT",
            entity: "USER",
            entityId: token.id as string,
            description: `User logged out: ${token.email}`,
            userId: token.id as string,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
        })
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} 