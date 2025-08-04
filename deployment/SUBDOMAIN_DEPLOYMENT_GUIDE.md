# 🚀 Subdomain Deployment Guide - dash.indexof.id

## 📋 **Deployment Overview**

### **Architecture:**
- **Backend**: `https://api.indexof.id` (Vercel)
- **Frontend**: `https://dash.indexof.id` (Shared Hosting)
- **Database**: PostgreSQL production

## 🔧 **Step 1: Update Vercel Environment Variables**

### **Login ke Vercel Dashboard:**
1. Buka https://vercel.com/dashboard
2. Pilih project `api.indexof.id`
3. Klik **Settings** → **Environment Variables**

### **Update Environment Variables:**
```env
DATABASE_URL=postgresql://semar3789_sumopod:jlxQHEE93_-_qBpO@103.94.238.99:65433/semar3789_domains
JWT_SECRET=2bac9bc1bff82fcfa64097b563415e3568c4b1097271cc0db3b869e8df2f458f
NEXTAUTH_SECRET=d0d5232b03b823def194bcee354038776f3d5415525c1e791ebe380ad5bd97e6
NEXTAUTH_URL=https://api.indexof.id
CORS_ORIGIN=https://dash.indexof.id
NODE_ENV=production
```

### **Redeploy Backend:**
1. Klik **Deployments**
2. Klik **Redeploy** pada deployment terbaru

## 🌐 **Step 2: Setup Subdomain di Hosting**

### **A. cPanel/Shared Hosting:**
1. Login ke cPanel
2. Buka **Subdomains**
3. Buat subdomain:
   - **Subdomain**: `dash`
   - **Domain**: `indexof.id`
   - **Document Root**: `public_html/dash` (atau sesuai kebutuhan)

### **B. DNS Configuration:**
Pastikan DNS record sudah benar:
```
Type: A
Name: dash.indexof.id
Value: [IP Address hosting Anda]
TTL: 300
```

## 📁 **Step 3: Upload Frontend Files**

### **File yang Perlu Diupload:**
```
frontend/dist/
├── index.html
├── assets/
│   ├── *.css
│   ├── *.js
│   └── favicon.ico
└── [file-file lainnya...]
```

### **Upload Method:**
1. **File Manager**: Upload via cPanel File Manager
2. **FTP**: Upload via FTP client
3. **SSH**: Upload via SCP/SFTP

### **Upload ke Directory:**
```
public_html/dash/
├── index.html
├── assets/
│   ├── DomainsView-DFgmjcx0.css
│   ├── index-BuqWB_AL.css
│   ├── auth-VABCqCch.js
│   ├── index-toLE9J9t.js
│   └── [file-file lainnya...]
└── favicon.ico
```

## ⚙️ **Step 4: Configure .htaccess (LiteSpeed)**

### **Buat file `.htaccess` di `public_html/dash/`:**
```apache
# Lagiah Frontend - Subdomain .htaccess
# Place this file in public_html/dash/ directory

# Enable CORS for API calls
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# SPA Routing - Handle Vue.js router
RewriteEngine On
RewriteBase /

# Handle static files first
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Handle SPA routes - redirect to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets for 1 year
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
    Header set Vary "Accept-Encoding"
</FilesMatch>

# Cache HTML files for 1 hour
<FilesMatch "\.(html|htm)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 hour"
    Header set Cache-Control "public, must-revalidate"
</FilesMatch>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Prevent access to sensitive files
<FilesMatch "\.(env|log|sql|md|gitignore|gitattributes|lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Prevent directory listing
Options -Indexes

# Custom error pages
ErrorDocument 404 /index.html
ErrorDocument 500 /index.html
```

## 🧪 **Step 5: Testing**

### **Test Backend:**
```bash
# Test health endpoint
curl https://api.indexof.id/api/v1/health

# Test login
curl -X POST https://api.indexof.id/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lagiah.com","password":"admin123"}'
```

### **Test Frontend:**
1. Buka https://dash.indexof.id
2. Coba login dengan:
   - **Email**: admin@lagiah.com
   - **Password**: admin123
3. Test semua fitur:
   - Dashboard
   - Domains
   - Hosting
   - VPS
   - Websites
   - Settings

## 🔍 **Step 6: Troubleshooting**

### **Common Issues:**

#### **1. CORS Error:**
```
Access to fetch at 'https://api.indexof.id/api/v1/auth/login' from origin 'https://dash.indexof.id' has been blocked by CORS policy
```
**Solution**: Pastikan `CORS_ORIGIN=https://dash.indexof.id` sudah diset di Vercel

#### **2. 404 Error:**
```
Page not found
```
**Solution**: Pastikan `.htaccess` sudah benar dan SPA routing berfungsi

#### **3. API Connection Error:**
```
Failed to fetch
```
**Solution**: 
- Cek apakah `https://api.indexof.id` bisa diakses
- Cek environment variable `VITE_API_BASE_URL`

#### **4. Subdomain Not Working:**
```
This site can't be reached
```
**Solution**:
- Cek DNS propagation
- Cek subdomain configuration di hosting
- Tunggu 5-10 menit untuk DNS propagation

## ✅ **Expected Result:**

Setelah deployment berhasil:
- ✅ **Backend**: `https://api.indexof.id` (Vercel)
- ✅ **Frontend**: `https://dash.indexof.id` (Shared Hosting)
- ✅ **Login**: Berfungsi dengan kredensial test
- ✅ **All Features**: Dashboard, domains, hosting, VPS, websites
- ✅ **CORS**: Tidak ada error cross-origin
- ✅ **SPA Routing**: Vue router berfungsi normal

## 📞 **Support:**

Jika ada masalah:
1. Cek browser console untuk error
2. Cek network tab untuk API calls
3. Cek Vercel logs untuk backend errors
4. Cek hosting error logs

## 🎯 **Final URLs:**

- **Dashboard**: https://dash.indexof.id
- **API**: https://api.indexof.id
- **Test Login**: admin@lagiah.com / admin123 