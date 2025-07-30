// Test script untuk memverifikasi frontend dapat mengakses WhatsApp settings
// Jalankan di browser console

async function testWhatsAppSettings() {
  try {
    console.log('🧪 Testing WhatsApp Settings Frontend...')
    
    // Test API call
    const response = await fetch('http://localhost:3004/api/v1/settings?category=whatsapp', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('📊 API Response:', data)
    
    if (data.status === 'success' && data.data.settings) {
      const settings = data.data.settings
      console.log('✅ WhatsApp Settings found:')
      console.log('  - Enabled:', settings.whatsapp_enabled)
      console.log('  - API Token:', settings.whatsapp_api_token ? '***' + settings.whatsapp_api_token.slice(-4) : 'Not set')
      console.log('  - Country Code:', settings.whatsapp_country_code)
      console.log('  - API URL:', settings.whatsapp_api_url)
      console.log('  - Delay:', settings.whatsapp_delay)
      console.log('  - Schedule:', settings.whatsapp_schedule)
      console.log('  - Notifications:', settings.whatsapp_notifications)
      console.log('  - Templates:', settings.whatsapp_templates)
    } else {
      console.log('❌ No WhatsApp settings found')
    }
    
    // Test localStorage
    const localSettings = localStorage.getItem('whatsappSettings')
    if (localSettings) {
      console.log('💾 LocalStorage WhatsApp Settings:', JSON.parse(localSettings))
    } else {
      console.log('❌ No WhatsApp settings in localStorage')
    }
    
  } catch (error) {
    console.error('❌ Error testing frontend:', error)
  }
}

// Run test
testWhatsAppSettings() 