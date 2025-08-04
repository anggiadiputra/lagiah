import { PrismaClient } from '../generated/prisma'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Database connection test
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    // Database connected successfully
    
    // Test query
    const userCount = await prisma.user.count()
    // Total users in database
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect()
  // Database disconnected
} 