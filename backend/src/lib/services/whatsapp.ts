interface WhatsAppConfig {
  apiToken: string
  apiUrl: string
  defaultCountryCode: string
  defaultDelay: number
  defaultSchedule: number
}

interface WhatsAppMessage {
  target: string
  message: string
  url?: string
  filename?: string
  schedule?: number
  delay?: number
  countryCode?: string
  buttonJSON?: string
  templateJSON?: string
  listJSON?: string
}

interface WhatsAppResponse {
  status: boolean
  message: string
  data?: any
}

class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  async sendMessage(messageData: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      const data = new FormData()
      
      // Required fields
      data.append("target", messageData.target)
      data.append("message", messageData.message)
      
      // Optional fields
      if (messageData.url) data.append("url", messageData.url)
      if (messageData.filename) data.append("filename", messageData.filename)
      if (messageData.schedule !== undefined) data.append("schedule", String(messageData.schedule))
      if (messageData.delay !== undefined) data.append("delay", String(messageData.delay))
      if (messageData.countryCode) data.append("countryCode", messageData.countryCode)
      if (messageData.buttonJSON) data.append("buttonJSON", messageData.buttonJSON)
      if (messageData.templateJSON) data.append("templateJSON", messageData.templateJSON)
      if (messageData.listJSON) data.append("listJSON", messageData.listJSON)

      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        mode: "cors",
        headers: new Headers({
          Authorization: this.config.apiToken,
        }),
        body: data,
      })

      const result = await response.json()
      
      if (result.status === true) {
        return {
          status: true,
          message: 'Message sent successfully',
          data: result
        }
      } else {
        return {
          status: false,
          message: result.message || 'Failed to send message',
          data: result
        }
      }
    } catch (error) {
      console.error('WhatsApp service error:', error)
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        data: error
      }
    }
  }

  async sendDomainExpiryAlert(phoneNumber: string, domainName: string, expiryDate: string, daysLeft: number): Promise<WhatsAppResponse> {
    const message = `⚠️ Domain Expiry Alert

Domain: ${domainName}
Expiry Date: ${expiryDate}
Days Left: ${daysLeft} days

Silakan perpanjang domain Anda sebelum berakhir.

Best regards,
Lagiah System`

    return this.sendMessage({
      target: phoneNumber,
      message,
      countryCode: this.config.defaultCountryCode,
      delay: this.config.defaultDelay,
      schedule: this.config.defaultSchedule
    })
  }

  async sendHostingExpiryAlert(phoneNumber: string, hostingName: string, expiryDate: string, daysLeft: number): Promise<WhatsAppResponse> {
    const message = `⚠️ Hosting Expiry Alert

Hosting: ${hostingName}
Expiry Date: ${expiryDate}
Days Left: ${daysLeft} days

Silakan perpanjang hosting Anda sebelum berakhir.

Best regards,
Lagiah System`

    return this.sendMessage({
      target: phoneNumber,
      message,
      countryCode: this.config.defaultCountryCode,
      delay: this.config.defaultDelay,
      schedule: this.config.defaultSchedule
    })
  }

  async sendVPSExpiryAlert(phoneNumber: string, vpsName: string, expiryDate: string, daysLeft: number): Promise<WhatsAppResponse> {
    const message = `⚠️ VPS Expiry Alert

VPS: ${vpsName}
Expiry Date: ${expiryDate}
Days Left: ${daysLeft} days

Silakan perpanjang VPS Anda sebelum berakhir.

Best regards,
Lagiah System`

    return this.sendMessage({
      target: phoneNumber,
      message,
      countryCode: this.config.defaultCountryCode,
      delay: this.config.defaultDelay,
      schedule: this.config.defaultSchedule
    })
  }

  async sendSystemAlert(phoneNumber: string, alertMessage: string): Promise<WhatsAppResponse> {
    const message = `🚨 System Alert

${alertMessage}

Timestamp: ${new Date().toLocaleString('id-ID')}

Best regards,
Lagiah System`

    return this.sendMessage({
      target: phoneNumber,
      message,
      countryCode: this.config.defaultCountryCode,
      delay: this.config.defaultDelay,
      schedule: this.config.defaultSchedule
    })
  }

  async sendTestMessage(phoneNumber: string): Promise<WhatsAppResponse> {
    const message = `🧪 Test Message dari Lagiah System

Ini adalah pesan test untuk memverifikasi konfigurasi WhatsApp Anda.

📱 Phone: +${this.config.defaultCountryCode}${phoneNumber}
🔧 API URL: ${this.config.apiUrl}
⏰ Timestamp: ${new Date().toLocaleString('id-ID')}

✅ Jika Anda menerima pesan ini, konfigurasi WhatsApp berhasil!`

    return this.sendMessage({
      target: phoneNumber,
      message,
      countryCode: this.config.defaultCountryCode,
      delay: this.config.defaultDelay,
      schedule: this.config.defaultSchedule
    })
  }
}

export { WhatsAppService, type WhatsAppConfig, type WhatsAppMessage, type WhatsAppResponse } 