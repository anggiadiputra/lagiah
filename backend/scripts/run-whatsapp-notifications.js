const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function runWhatsAppNotifications() {
  try {
    console.log('🔄 Starting WhatsApp notification service...')
    
    // Import the service
    const { whatsappNotificationService } = require('../src/services/whatsapp-notifications')
    
    // Run all notification checks
    await whatsappNotificationService.checkAllNotifications()
    
    console.log('✅ WhatsApp notification service completed successfully')
    
  } catch (error) {
    console.error('❌ Error running WhatsApp notifications:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  runWhatsAppNotifications()
}

module.exports = { runWhatsAppNotifications } 