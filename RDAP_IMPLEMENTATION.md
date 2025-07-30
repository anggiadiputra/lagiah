# RDAP Implementation Guide

## 📋 **Overview**

Implementasi RDAP (Registration Data Access Protocol) untuk menggantikan atau melengkapi WHOIS API. RDAP adalah protokol modern yang menggantikan WHOIS tradisional dan menyediakan data dalam format JSON yang terstruktur.

## 🔧 **Konfigurasi**

### **Environment Variables**

Tambahkan variabel berikut ke file `.env`:

```env
# WHOIS API Configuration
WHOIS_API_URL="https://get.indexof.id/api/whois"
USE_RDAP="true"  # Set to "true" to use Verisign RDAP
```

### **Switch Between WHOIS and RDAP**

- **USE_RDAP="false"**: Menggunakan WHOIS API (indexof.id)
- **USE_RDAP="true"**: Menggunakan Verisign RDAP

## 🏗️ **Arsitektur**

### **File Structure**
```
backend/src/lib/services/whois.ts
├── fetchWhoisData()          # Main function (switches between WHOIS/RDAP)
├── fetchRdapData()           # RDAP implementation
├── fetchWhoisApiData()       # Original WHOIS API implementation
├── parseRdapResponse()       # Parse RDAP JSON response
├── parseWhoisResponse()      # Parse WHOIS API response
└── parseRdapStatus()         # Map RDAP status to DomainStatus enum
```

### **Data Flow**
```
Domain Request → fetchWhoisData() → Check USE_RDAP → 
├── true → fetchRdapData() → parseRdapResponse()
└── false → fetchWhoisApiData() → parseWhoisResponse()
```

## 📊 **Response Format Comparison**

### **WHOIS API (indexof.id)**
```json
{
  "success": true,
  "data": {
    "Registrar Name": "GoDaddy.com, LLC",
    "Created On": "1997-09-15 04:00:00",
    "Expiration Date": "2028-09-14 04:00:00",
    "Nameserver 1": "ns1.google.com",
    "Status": "clientTransferProhibited"
  }
}
```

### **Verisign RDAP**
```json
{
  "ldhName": "google.com",
  "entities": [
    {
      "roles": ["registrar"],
      "vcardArray": [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "MarkMonitor Inc."]
        ]
      ]
    }
  ],
  "events": [
    {
      "eventAction": "registration",
      "eventDate": "1997-09-15T04:00:00Z"
    },
    {
      "eventAction": "expiration", 
      "eventDate": "2028-09-14T04:00:00Z"
    }
  ],
  "nameservers": [
    {
      "ldhName": "ns1.google.com"
    }
  ],
  "status": ["client transfer prohibited"]
}
```

## 🔄 **Status Mapping**

### **RDAP Status → DomainStatus**
```typescript
// RDAP Status → DomainStatus
"expired" → "EXPIRED"
"suspended" → "SUSPENDED" 
"transferred" → "TRANSFERRED"
"deleted" → "DELETED"
"pending" → "ACTIVE"  // Mapped to ACTIVE since PENDING not in enum
"active" → "ACTIVE"
```

## 🧪 **Testing**

### **Test RDAP Implementation**
```bash
cd backend
node test-rdap.js
```

### **Test Domains**
- `google.com` - Should work with Verisign RDAP
- `microsoft.com` - Should work with Verisign RDAP  
- `github.com` - Should work with Verisign RDAP

## ⚠️ **Limitations**

### **RDAP Limitations**
1. **Domain TLD Support**: Verisign RDAP hanya mendukung `.com` dan `.net`
2. **Rate Limiting**: Mungkin ada rate limiting dari Verisign
3. **Data Availability**: Tidak semua domain mungkin memiliki data RDAP lengkap

### **WHOIS API Limitations**
1. **Data Simplification**: Status disederhanakan menjadi "ACTIVE"
2. **Third-party Dependency**: Bergantung pada indexof.id
3. **Response Format**: Format response yang tidak standar

## 🚀 **Usage Examples**

### **Enable RDAP**
```env
USE_RDAP="true"
```

### **Disable RDAP (Use WHOIS API)**
```env
USE_RDAP="false"
```

### **Custom WHOIS API URL**
```env
WHOIS_API_URL="https://your-custom-whois-api.com/api/whois"
USE_RDAP="false"
```

## 📈 **Benefits**

### **RDAP Benefits**
1. **Standard Protocol**: Protokol standar yang dikembangkan oleh IETF
2. **Structured Data**: Data dalam format JSON yang terstruktur
3. **Better Status Information**: Status yang lebih detail dan akurat
4. **Future-Proof**: Protokol yang akan menggantikan WHOIS

### **WHOIS API Benefits**
1. **Wide TLD Support**: Mendukung berbagai TLD
2. **Simplified Response**: Response yang sudah diproses
3. **Familiar Format**: Format yang familiar untuk developer

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. RDAP Not Working for Non-.com Domains**
```
Error: RDAP failed with status 404
```
**Solution**: RDAP hanya mendukung `.com` dan `.net`. Gunakan WHOIS API untuk domain lain.

#### **2. Rate Limiting**
```
Error: RDAP request timed out
```
**Solution**: Implement rate limiting atau fallback ke WHOIS API.

#### **3. Parsing Errors**
```
Error: Failed to parse RDAP response
```
**Solution**: Check RDAP response format and update parsing logic.

## 📝 **Migration Guide**

### **From WHOIS API to RDAP**

1. **Update Environment**
   ```env
   USE_RDAP="true"
   ```

2. **Test Implementation**
   ```bash
   node test-rdap.js
   ```

3. **Monitor Logs**
   - Check for parsing errors
   - Verify data accuracy
   - Monitor performance

4. **Fallback Strategy**
   - Keep WHOIS API as fallback
   - Implement automatic fallback for unsupported TLDs

## 🎯 **Future Enhancements**

### **Planned Improvements**
1. **Multiple RDAP Servers**: Support for different RDAP servers per TLD
2. **Automatic Fallback**: Automatic fallback between RDAP and WHOIS
3. **Caching**: Implement caching for RDAP responses
4. **Rate Limiting**: Implement proper rate limiting
5. **Error Handling**: Better error handling and retry logic 