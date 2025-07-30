# RDASH API WHOIS Integration Documentation

## 📋 Overview

RDASH.ID adalah **Domain Reseller Open API** yang menyediakan layanan komprehensif untuk manajemen domain, hosting, dan layanan terkait. **Implementasi ini FOKUS HANYA pada WHOIS data** untuk mendapatkan informasi domain yang lengkap dan akurat.

**⚠️ RESTRICTION**: Implementasi ini hanya menggunakan endpoint WHOIS domain, tidak menggunakan fitur domain management lainnya.

## 🔗 API Documentation

- **Base URL**: `https://api.rdash.id/v1`
- **Documentation**: [https://docs.rdash.id](https://docs.rdash.id)
- **Swagger**: [https://api.rdash.id/swagger/openapi.json](https://api.rdash.id/swagger/openapi.json)
- **Version**: 1.5.0

## 🔐 Authentication

RDASH API menggunakan **Basic Authentication**:

```typescript
const auth = {
  username: process.env.RDASH_RESELLER_ID,
  password: process.env.RDASH_API_KEY
}

// Authorization header
'Authorization': `Basic ${Buffer.from(`${resellerId}:${apiKey}`).toString('base64')}`
```

## 🌐 WHOIS Endpoints (Required for WHOIS Data)

**⚠️ NOTE**: RDASH API membutuhkan 2 endpoint untuk mendapatkan WHOIS data. Ini adalah **kebutuhan teknis** dari RDASH API, bukan pilihan kita.

### 1. Search Domains (Required Step)
```http
GET /v1/domains?domain={domain_name}
```
**Purpose**: Mencari domain untuk mendapatkan domain ID (diperlukan untuk step 2)

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "domain": "example.com",
      "status": "active",
      "registrar": "GoDaddy.com, LLC",
      "created_at": "2020-01-15T10:30:00Z",
      "expires_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Domain Details (WHOIS Data)
```http
GET /v1/domains/{domain_id}
```
**Purpose**: Mengambil data WHOIS lengkap menggunakan domain ID dari step 1

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "domain": "example.com",
    "status": "active",
    "registrar": "GoDaddy.com, LLC",
    "created_at": "2020-01-15T10:30:00Z",
    "expires_at": "2025-01-15T10:30:00Z",
    "whois": {
      "registrant": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-123-4567",
        "organization": "Example Corp",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "US"
      },
      "admin": {
        "name": "Admin Contact",
        "email": "admin@example.com",
        "phone": "+1-555-123-4567"
      },
      "tech": {
        "name": "Tech Contact",
        "email": "tech@example.com",
        "phone": "+1-555-123-4567"
      }
    },
    "dns": {
      "nameservers": ["ns1.example.com", "ns2.example.com"],
      "records": [
        {
          "type": "A",
          "name": "@",
          "value": "192.168.1.1",
          "ttl": 3600
        },
        {
          "type": "CNAME",
          "name": "www",
          "value": "@",
          "ttl": 3600
        }
      ]
    }
  }
}
```

### 3. WHOIS Data Focus

**Implementasi ini FOKUS HANYA pada membaca WHOIS data**, tidak menggunakan endpoint untuk:
- ❌ Update WHOIS information
- ❌ WHOIS protection management
- ❌ Domain registration
- ❌ Domain transfer
- ❌ SSL management
- ❌ DNS management

**✅ Hanya menggunakan endpoint untuk:**
- ✅ Search domain (untuk mendapatkan domain ID)
- ✅ Get WHOIS details (untuk membaca data WHOIS)

## ⚙️ Configuration

### Environment Variables

Tambahkan variabel berikut ke file `.env`:

```env
# RDASH API Configuration
USE_RDASH=true
RDASH_API_URL=https://api.rdash.id/v1
RDASH_RESELLER_ID=your_reseller_id
RDASH_API_KEY=your_api_key

# Fallback WHOIS Services
USE_RDAP=false
WHOIS_API_URL=https://get.indexof.id/api/whois
```

### Service Priority

WHOIS service akan digunakan berdasarkan urutan prioritas:

1. **RDASH API** (jika `USE_RDASH=true`)
2. **RDAP** (jika `USE_RDAP=true`)
3. **WHOIS API** (fallback default)

## 🔧 Implementation Details

### 1. Service Integration

RDASH API telah diintegrasikan ke dalam `backend/src/lib/services/whois.ts`:

```typescript
export async function fetchWhoisData(domain: string): Promise<WhoisResult> {
  const useRdash = process.env.USE_RDASH === 'true'
  const useRdap = process.env.USE_RDAP === 'true'
  
  if (useRdash) {
    return await fetchRdashWhoisData(domain)
  } else if (useRdap) {
    return await fetchRdapData(domain)
  } else {
    return await fetchWhoisApiData(domain)
  }
}
```

### 2. Data Parsing

RDASH response diparse ke format standar Lagiah:

```typescript
function parseRdashResponse(data: any, domain: string): WhoisData | null {
  const result: WhoisData = {
    registrar: data.registrar,
    status: parseRdashStatus(data.status),
    registeredAt: parseDate(data.created_at),
    expiresAt: parseDate(data.expires_at),
    nameservers: data.dns?.nameservers || [],
    whoisInfo: {
      registrant: data.whois?.registrant,
      admin: data.whois?.admin,
      tech: data.whois?.tech,
      source: 'RDASH API'
    },
    whoisData: data // Full response
  }
  
  return result
}
```

### 3. Error Handling

```typescript
try {
  const result = await fetchRdashWhoisData(domain)
  return result
} catch (error) {
  console.error(`[WhoisService] Error during RDASH fetch for ${domain}:`, error)
  return { 
    isAvailable: false, 
    data: null, 
    error: 'An unexpected error occurred while fetching RDASH data.' 
  }
}
```

## 📊 Data Structure Comparison

### Current WHOIS Data
```typescript
interface WhoisData {
  registrar?: string
  status?: DomainStatus
  registeredAt?: Date
  expiresAt?: Date
  nameservers?: string[]
  whoisData?: any
}
```

### Enhanced with RDASH
```typescript
interface WhoisData {
  registrar?: string
  status?: DomainStatus
  registeredAt?: Date
  expiresAt?: Date
  nameservers?: string[]
  whoisData?: any
  whoisInfo?: {
    registrant?: any
    admin?: any
    tech?: any
    source?: string
  }
}
```

## 🎯 Benefits of RDASH WHOIS Integration

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

## 🚀 Usage Examples

### 1. Enable RDASH WHOIS
```bash
# Set environment variables
export USE_RDASH=true
export RDASH_RESELLER_ID=your_reseller_id
export RDASH_API_KEY=your_api_key

# Restart the application
npm run dev
```

### 2. Test RDASH Integration
```typescript
// Test WHOIS lookup
const result = await fetchWhoisData('example.com')
console.log('RDASH WHOIS Result:', result)
```

### 3. Access Detailed WHOIS Info
```typescript
if (result.data?.whoisInfo) {
  console.log('Registrant:', result.data.whoisInfo.registrant)
  console.log('Admin Contact:', result.data.whoisInfo.admin)
  console.log('Tech Contact:', result.data.whoisInfo.tech)
}
```

## 🔍 Testing

### 1. Test RDASH API Connection
```bash
curl -X GET "https://api.rdash.id/v1/domains?domain=example.com" \
  -H "Authorization: Basic $(echo -n 'your_reseller_id:your_api_key' | base64)" \
  -H "Accept: application/json"
```

### 2. Test Domain Details
```bash
curl -X GET "https://api.rdash.id/v1/domains/12345" \
  -H "Authorization: Basic $(echo -n 'your_reseller_id:your_api_key' | base64)" \
  -H "Accept: application/json"
```

## ⚠️ Limitations & Considerations

### 1. Rate Limiting
- Monitor RDASH API rate limits
- Implement appropriate caching strategies
- Handle rate limit errors gracefully

### 2. Domain Coverage
- RDASH primarily covers Indonesian domains (.id)
- International domains may have limited data
- Fallback to other WHOIS services for global coverage

### 3. Authentication
- API credentials must be kept secure
- Use environment variables for configuration
- Implement proper error handling for auth failures

### 4. Data Consistency
- Ensure data format consistency across different services
- Handle missing or incomplete data gracefully
- Validate parsed data before storage

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

- [RDASH API Documentation](https://docs.rdash.id)
- [RDAP Implementation](./RDAP_IMPLEMENTATION.md)
- [WHOIS Service Documentation](./WHOIS_SERVICE.md)
- [Final Fixes Documentation](./FINAL_FIXES.md)

---

**RDASH API integration memberikan akses ke data WHOIS yang lebih lengkap dan akurat untuk manajemen domain di aplikasi Lagiah!** 