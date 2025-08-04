const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function updateExpiredStatus() {
  try {
    console.log('🔄 Starting expired status update...')
    
    const today = new Date()
    
    // Update expired domains
    const expiredDomains = await prisma.domain.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expired hosting
    const expiredHosting = await prisma.hosting.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expired VPS
    const expiredVPS = await prisma.vPS.updateMany({
      where: {
        expiresAt: {
          lt: today
        },
        status: {
          not: 'EXPIRED'
        }
      },
      data: {
        status: 'EXPIRED',
        updatedAt: new Date()
      }
    })

    // Update expiring soon hosting (within 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const expiringSoonHosting = await prisma.hosting.updateMany({
      where: {
        expiresAt: {
          lte: sevenDaysFromNow,
          gt: today
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'EXPIRING_SOON',
        updatedAt: new Date()
      }
    })

    console.log('✅ Expired status update completed:')
    console.log(`   - Domains updated: ${expiredDomains.count}`)
    console.log(`   - Hosting expired: ${expiredHosting.count}`)
    console.log(`   - Hosting expiring soon: ${expiringSoonHosting.count}`)
    console.log(`   - VPS updated: ${expiredVPS.count}`)

    // Show current stats
    const domainStats = await prisma.domain.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const hostingStats = await prisma.hosting.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('\n📊 Current Domain Status:')
    domainStats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count.status}`)
    })

    console.log('\n📊 Current Hosting Status:')
    hostingStats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count.status}`)
    })

  } catch (error) {
    console.error('❌ Error updating expired status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExpiredStatus() 