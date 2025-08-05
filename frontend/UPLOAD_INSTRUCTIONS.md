# 🚀 Upload Instructions - dash.indexof.id

## 📋 **Quick Setup Guide**

### **Target URLs:**
- **Frontend**: https://dash.indexof.id
- **Backend**: https://api.indexof.id
- **Test Login**: admin@lagiah.com / admin123

## 🔧 **Step 1: Setup Subdomain**

### **A. cPanel Setup:**
1. Login ke cPanel hosting Anda
2. Buka **Subdomains**
3. Buat subdomain baru:
   - **Subdomain**: `dash`
   - **Domain**: `indexof.id`
   - **Document Root**: `public_html/dash`

### **B. DNS Configuration:**
Pastikan DNS record sudah benar:
```
Type: A
Name: dash.indexof.id
Value: [IP Address hosting Anda]
TTL: 300
```

## 📁 **Step 2: Upload Files**

### **A. Extract ZIP File:**
1. Extract `lagiah-frontend-dash.indexof.id.zip`
2. Upload semua file ke `public_html/dash/`

### **B. File Structure:**
```
public_html/dash/
├── .htaccess                    # ⚙️ Apache configuration
├── index.html                   # 🏠 Main HTML file
├── favicon.ico                  # 🎨 Favicon
├── logo.svg                     # 🎨 Logo
├── assets/                      # 📦 Static assets
│   ├── *.css                    # 🎨 Stylesheets
│   ├── *.js                     # ⚡ JavaScript files
│   └── [other assets...]
└── UPLOAD_INSTRUCTIONS.md       # 📖 This file
```

### **C. Upload Methods:**
1. **File Manager**: Upload via cPanel File Manager
2. **FTP**: Upload via FTP client (FileZilla, etc.)
3. **SSH**: Upload via SCP/SFTP

## ⚙️ **Step 3: Configure Backend**

### **Update Vercel Environment Variables:**
1. Buka https://vercel.com/dashboard
2. Pilih project `api.indexof.id`
3. Settings → Environment Variables
4. Update `CORS_ORIGIN` menjadi `https://dash.indexof.id`
5. Redeploy backend

### **Environment Variables:**
```env
DATABASE_URL=postgresql://semar3789_sumopod:jlxQHEE93_-_qBpO@103.94.238.99:65433/semar3789_domains
JWT_SECRET=2bac9bc1bff82fcfa64097b563415e3568c4b1097271cc0db3b869e8df2f458f
NEXTAUTH_SECRET=d0d5232b03b823def194bcee354038776f3d5415525c1e791ebe380ad5bd97e6
NEXTAUTH_URL=https://api.indexof.id
CORS_ORIGIN=https://dash.indexof.id
NODE_ENV=production
```

## 🧪 **Step 4: Testing**

### **A. Test Backend:**
```bash
# Test health endpoint
curl https://api.indexof.id/api/v1/health

# Test login
curl -X POST https://api.indexof.id/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lagiah.com","password":"admin123"}'
```

### **B. Test Frontend:**
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

## 🔍 **Step 5: Troubleshooting**

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
- Cek browser console untuk error details

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
- ✅ **Frontend**: https://dash.indexof.id
- ✅ **Backend**: https://api.indexof.id
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

## 📦 **Files Included:**

- ✅ **Frontend Build**: Optimized for production
- ✅ **Apache Config**: `.htaccess` for SPA routing
- ✅ **CORS Headers**: Configured for API calls
- ✅ **Security Headers**: XSS protection, etc.
- ✅ **Caching**: Optimized for performance
- ✅ **Gzip Compression**: Enabled for faster loading 