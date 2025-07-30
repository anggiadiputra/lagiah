# RDASH API WHOIS Configuration Guide

## 🔧 Environment Variables Setup

Untuk menggunakan RDASH API **HANYA untuk WHOIS data** di aplikasi Lagiah, tambahkan variabel berikut ke file `.env`:

```env
# WHOIS Services Configuration
WHOIS_API_URL="https://get.indexof.id/api/whois"
USE_RDAP="false"
USE_RDASH="true"

# RDASH API Configuration (WHOIS-Only)
RDASH_API_URL="https://api.rdash.id/v1"
RDASH_RESELLER_ID="your_reseller_id"
RDASH_API_KEY="your_api_key"
```

## 🔑 Getting RDASH API Credentials

### 1. Register at RDASH.ID
- Kunjungi [https://rdash.id](https://rdash.id)
- Daftar sebagai reseller
- Verifikasi akun Anda

### 2. Generate API Key
- Login ke dashboard RDASH
- Navigasi ke **API Management**
- Generate API key baru
- Catat **Reseller ID** dan **API Key**

### 3. Configure Environment
```bash
# Set environment variables
export RDASH_RESELLER_ID="your_reseller_id"
export RDASH_API_KEY="your_api_key"
export USE_RDASH="true"

# Or add to .env file
echo "RDASH_RESELLER_ID=your_reseller_id" >> .env
echo "RDASH_API_KEY=your_api_key" >> .env
echo "USE_RDASH=true" >> .env
```

## 🧪 Testing Configuration

### 1. Test WHOIS Data
```bash
# Test WHOIS lookup di frontend
# Klik "Refresh Whois" pada domain
# Check console logs di backend
```

### 2. Expected Backend Logs
```
[WhoisService] Using RDASH API for WHOIS data: example.com
[WhoisService] Step 1: Searching domain example.com to get domain ID
[WhoisService] Found domain ID: 12345 for domain: example.com
[WhoisService] Step 2: Fetching WHOIS details for domain ID: 12345
[WhoisService] Successfully fetched WHOIS data for example.com.
```

### 3. Expected Frontend Response
```typescript
// WHOIS data akan include detailed contact information
{
  registrar: "GoDaddy.com, LLC",
  status: "ACTIVE",
  whoisInfo: {
    registrant: { name: "John Doe", email: "john@example.com" },
    admin: { name: "Admin Contact", email: "admin@example.com" },
    tech: { name: "Tech Contact", email: "tech@example.com" },
    source: "RDASH API (WHOIS-Only)"
  }
}
```

## 🔄 Service Priority

WHOIS service akan digunakan berdasarkan urutan prioritas:

1. **RDASH API** (jika `USE_RDASH=true`) - **WHOIS-Only**
2. **RDAP** (jika `USE_RDAP=true`)
3. **WHOIS API** (fallback default)

### Configuration Examples

#### Use RDASH API (WHOIS-Only)
```env
USE_RDASH="true"
USE_RDAP="false"
RDASH_RESELLER_ID="your_reseller_id"
RDASH_API_KEY="your_api_key"
```

#### Use RDAP (Alternative)
```env
USE_RDASH="false"
USE_RDAP="true"
```

#### Use WHOIS API (Fallback)
```env
USE_RDASH="false"
USE_RDAP="false"
WHOIS_API_URL="https://get.indexof.id/api/whois"
```

## 🚀 Integration with Application

### 1. Backend Integration
RDASH API sudah terintegrasi di `backend/src/lib/services/whois.ts`:

```typescript
export async function fetchWhoisData(domain: string): Promise<WhoisResult> {
  const useRdash = process.env.USE_RDASH === 'true'
  const useRdap = process.env.USE_RDAP === 'true'
  
  if (useRdash) {
    return await fetchRdashWhoisData(domain) // WHOIS-Only
  } else if (useRdap) {
    return await fetchRdapData(domain)
  } else {
    return await fetchWhoisApiData(domain)
  }
}
```

### 2. Frontend Usage
Frontend akan otomatis menggunakan RDASH WHOIS data jika dikonfigurasi:

```typescript
// WHOIS data akan include detailed contact information
const whoisData = await fetchWhoisData('example.com')
if (whoisData.data?.whoisInfo) {
  console.log('Registrant:', whoisData.data.whoisInfo.registrant)
  console.log('Admin:', whoisData.data.whoisInfo.admin)
  console.log('Tech:', whoisData.data.whoisInfo.tech)
}
```

## ⚠️ Security Considerations

### 1. API Key Security
- **Never commit API keys to version control**
- Use environment variables for sensitive data
- Rotate API keys regularly
- Monitor API usage for suspicious activity

### 2. Rate Limiting
- RDASH API memiliki rate limits
- Implement caching untuk mengurangi API calls
- Handle rate limit errors gracefully

### 3. Error Handling
```typescript
try {
  const result = await fetchRdashWhoisData(domain)
  return result
} catch (error) {
  // Fallback to other WHOIS services
  console.error('RDASH API error:', error)
  return await fetchWhoisApiData(domain)
}
```

## 📊 Benefits of RDASH WHOIS Integration

### 1. Enhanced WHOIS Data (Read-Only)
- **Complete Contact Information**: Registrant, Admin, Tech contacts
- **Detailed Address Information**: Full address, city, state, postal code, country
- **Phone Numbers**: Contact phone numbers
- **Organization Details**: Company information

### 2. WHOIS Information Only
- **Nameserver Information**: Complete nameserver details
- **Domain Status**: Real-time domain status
- **Expiration Tracking**: Accurate expiration dates
- **Registrar Information**: Complete registrar details

### 3. Focused Implementation
- **WHOIS-Only**: Tidak ada fitur domain management
- **Read-Only**: Hanya membaca data, tidak mengubah
- **Minimal Endpoints**: Hanya menggunakan 2 endpoint yang diperlukan
- **Clean Architecture**: Implementasi yang bersih dan fokus

## 🔍 Troubleshooting

### 1. Authentication Failed
```bash
❌ Authentication failed: 401 Unauthorized
```
**Solution**: Check your Reseller ID and API Key

### 2. Domain Not Found
```bash
ℹ️ Domain example.com not found in RDASH
```
**Solution**: Domain mungkin tidak terdaftar di RDASH atau menggunakan fallback service

### 3. Rate Limit Exceeded
```bash
❌ Rate limit exceeded
```
**Solution**: Implement caching atau reduce API calls

### 4. Network Timeout
```bash
❌ RDASH request timed out
```
**Solution**: Check network connection atau increase timeout

## 📈 WHOIS-Only Implementation

### Current Focus
```typescript
// Current: WHOIS data only
async function fetchRdashWhoisData(domain: string) {
  // Step 1: Search domain to get domain ID
  // Step 2: Get WHOIS details using domain ID
  // Returns: Enhanced WHOIS data only
}
```

### Implementation Details
- **Minimal Endpoints**: Hanya menggunakan 2 endpoint yang diperlukan
- **WHOIS Focus**: Fokus hanya pada data WHOIS
- **Read-Only**: Tidak ada operasi write/update
- **Clean Architecture**: Implementasi yang bersih dan terfokus

### No Future Enhancements
Implementasi ini **tidak akan dikembangkan** untuk fitur domain management lainnya karena fokus hanya pada WHOIS data.

## 🔗 Related Documentation

- [RDASH API WHOIS Integration](./RDASH_API_INTEGRATION.md)
- [RDAP Implementation](./RDAP_IMPLEMENTATION.md)
- [WHOIS Service Documentation](./WHOIS_SERVICE.md)
- [Final Fixes Documentation](./FINAL_FIXES.md)

---

**RDASH API WHOIS integration memberikan akses ke data WHOIS yang lebih lengkap dan akurat untuk aplikasi Lagiah!** 