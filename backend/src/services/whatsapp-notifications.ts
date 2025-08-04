import { prisma } from '@/lib/database'

interface WhatsAppSettings {
  enabled: boolean
  apiToken: string
  recipientPhoneNumber: string
  alertDaysBeforeExpiry: number
  notifications: {
    domainExpiry: boolean
    hostingExpiry: boolean
    vpsExpiry: boolean
    systemAlerts: boolean
  }
  templates: {
    domainExpiry: string
    hostingExpiry: string
    vpsExpiry: string
    systemAlert: string
  }
}

export class WhatsAppNotificationService {
  private async getWhatsAppSettings(): Promise<WhatsAppSettings | null> {
    try {
      // Get settings directly from database
      const settings = await prisma.setting.findMany({
        where: { category: 'whatsapp' }
      })
      
      if (!settings.length) return null

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>)

      return {
        enabled: settingsMap.whatsapp_enabled === 'true' || settingsMap.whatsapp_enabled === true,
        apiToken: settingsMap.whatsapp_api_token || '',
        recipientPhoneNumber: settingsMap.whatsapp_recipient_phone_number || '',
        alertDaysBeforeExpiry: parseInt(settingsMap.whatsapp_alert_days_before_expiry) || 7,
        notifications: typeof settingsMap.whatsapp_notifications === 'string' 
          ? JSON.parse(settingsMap.whatsapp_notifications)
          : settingsMap.whatsapp_notifications || {
              domainExpiry: true,
              hostingExpiry: true,
              vpsExpiry: true,
              systemAlerts: false
            },
        templates: typeof settingsMap.whatsapp_templates === 'string'
          ? JSON.parse(settingsMap.whatsapp_templates)
          : settingsMap.whatsapp_templates || {
              domainExpiry: '⚠️ Domain {domain} akan berakhir pada {expiryDate}. Silakan perpanjang domain Anda.',
              hostingExpiry: '⚠️ Hosting {hosting} akan berakhir pada {expiryDate}. Silakan perpanjang hosting Anda.',
              vpsExpiry: '⚠️ VPS {vps} akan berakhir pada {expiryDate}. Silakan perpanjang VPS Anda.',
              systemAlert: '🚨 Alert System: {message}'
            }
      }
    } catch (error) {
      console.error('Error getting WhatsApp settings:', error)
      return null
    }
  }

  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const settings = await this.getWhatsAppSettings()
      if (!settings?.enabled || !settings.apiToken) {
        return false
      }

      // Check if WhatsApp notifications are enabled
      if (!settings.apiToken) {
        return false
      }

      try {
        const response = await fetch(`${settings.apiToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiToken}`
          },
          body: JSON.stringify({
            phone: phoneNumber,
            message: message
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          return true
        } else {
          return false
        }
      } catch (error) {
        return false
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }

  private formatMessage(template: string, data: Record<string, any>): string {
    let message = template
    Object.entries(data).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value))
    })
    return message
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  private calculateDaysLeft(expiryDate: Date): number {
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  async checkAndSendDomainNotifications(): Promise<void> {
    try {
      const settings = await this.getWhatsAppSettings()
      if (!settings?.enabled || !settings.notifications.domainExpiry) {
        return
      }

      // Check for domains expiring in 7 days and 3 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      const expiringDomains = await prisma.domain.findMany({
        where: {
          expiresAt: {
            gte: new Date(),
            lte: sevenDaysFromNow
          }
        },
        include: {
          user: true
        }
      })

      for (const domain of expiringDomains) {
        if (!domain.expiresAt) continue
        
        const daysLeft = this.calculateDaysLeft(domain.expiresAt)
        
        // Send notification if exactly 7 days or 3 days left
        if (daysLeft === 7 || daysLeft === 3) {
          const message = this.formatMessage(settings.templates.domainExpiry, {
            domain: domain.name,
            expiryDate: this.formatDate(domain.expiresAt),
            daysLeft: daysLeft,
            timestamp: new Date().toLocaleString('id-ID')
          })

          const phoneNumber = `+${settings.recipientPhoneNumber}`
          await this.sendWhatsAppMessage(phoneNumber, message)
          
          console.log(`Domain expiry notification sent for ${domain.name} (${daysLeft} days left)`)
        }
      }
    } catch (error) {
      console.error('Error checking domain notifications:', error)
    }
  }

  async checkAndSendHostingNotifications(): Promise<void> {
    try {
      const settings = await this.getWhatsAppSettings()
      if (!settings?.enabled || !settings.notifications.hostingExpiry) {
        return
      }

      // Check for hosting expiring in 7 days and 3 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      const expiringHosting = await prisma.hosting.findMany({
        where: {
          expiresAt: {
            gte: new Date(),
            lte: sevenDaysFromNow
          }
        },
        include: {
          user: true
        }
      })

      for (const hosting of expiringHosting) {
        if (!hosting.expiresAt) continue
        
        const daysLeft = this.calculateDaysLeft(hosting.expiresAt)
        
        // Send notification if exactly 7 days or 3 days left
        if (daysLeft === 7 || daysLeft === 3) {
          const message = this.formatMessage(settings.templates.hostingExpiry, {
            hosting: hosting.name,
            expiryDate: this.formatDate(hosting.expiresAt),
            daysLeft: daysLeft,
            timestamp: new Date().toLocaleString('id-ID')
          })

          const phoneNumber = `+${settings.recipientPhoneNumber}`
          await this.sendWhatsAppMessage(phoneNumber, message)
          
          console.log(`Hosting expiry notification sent for ${hosting.name} (${daysLeft} days left)`)
        }
      }
    } catch (error) {
      console.error('Error checking hosting notifications:', error)
    }
  }

  async checkAndSendVPSNotifications(): Promise<void> {
    try {
      const settings = await this.getWhatsAppSettings()
      if (!settings?.enabled || !settings.notifications.vpsExpiry) {
        return
      }

      // Check for VPS expiring in 7 days and 3 days
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      const expiringVPS = await prisma.vPS.findMany({
        where: {
          expiresAt: {
            gte: new Date(),
            lte: sevenDaysFromNow
          }
        },
        include: {
          user: true
        }
      })

      for (const vps of expiringVPS) {
        if (!vps.expiresAt) continue
        
        const daysLeft = this.calculateDaysLeft(vps.expiresAt)
        
        // Send notification if exactly 7 days or 3 days left
        if (daysLeft === 7 || daysLeft === 3) {
          const message = this.formatMessage(settings.templates.vpsExpiry, {
            vps: vps.name,
            expiryDate: this.formatDate(vps.expiresAt),
            daysLeft: daysLeft,
            timestamp: new Date().toLocaleString('id-ID')
          })

          const phoneNumber = `+${settings.recipientPhoneNumber}`
          await this.sendWhatsAppMessage(phoneNumber, message)
          
          console.log(`VPS expiry notification sent for ${vps.name} (${daysLeft} days left)`)
        }
      }
    } catch (error) {
      console.error('Error checking VPS notifications:', error)
    }
  }

  async checkAllNotifications(): Promise<void> {
    console.log('🔄 Starting WhatsApp notification checks...')
    
    await this.checkAndSendDomainNotifications()
    await this.checkAndSendHostingNotifications()
    await this.checkAndSendVPSNotifications()
    
    console.log('✅ WhatsApp notification checks completed')
  }
}

export const whatsappNotificationService = new WhatsAppNotificationService() 