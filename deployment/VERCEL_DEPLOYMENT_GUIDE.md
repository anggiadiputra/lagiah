# 🚀 Panduan Lengkap Deployment ke Vercel

## 📋 **Prerequisites**
- ✅ GitHub repository: `anggiadiputra/lagiah`
- ✅ Vercel account (sign up di https://vercel.com)
- ✅ Database external (Neon/Supabase/Railway)

## 🎯 **Step 1: Setup Vercel Account**

### 1.1 Sign Up Vercel
1. Kunjungi https://vercel.com
2. Klik **"Sign Up"**
3. Pilih **"Continue with GitHub"**
4. Authorize Vercel untuk akses GitHub
5. Verifikasi email

### 1.2 Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

## 🎯 **Step 2: Deploy Backend ke Vercel**

### 2.1 Create New Project
1. Di Vercel dashboard, klik **"New Project"**
2. Pilih **"Import Git Repository"**
3. Pilih repository: `anggiadiputra/lagiah`
4. Klik **"Import"**

### 2.2 Configure Project Settings
```
Project Name: lagiah-backend
Framework Preset: Next.js
Root Directory: backend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.3 Environment Variables
Klik **"Environment Variables"** dan tambahkan:

#### **Required Variables:**
```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication (Required)
JWT_SECRET=your-super-secret-jwt-key-32-characters-minimum
NEXTAUTH_SECRET=your-nextauth-secret-32-characters-minimum
NEXTAUTH_URL=https://your-backend.vercel.app

# CORS (Required)
CORS_ORIGIN=https://yourdomain.com

# App Settings (Required)
NODE_ENV=production
```

#### **Optional Variables:**
```env
# WhatsApp (Optional)
WHATSAPP_API_URL=https://your-whatsapp-api.com
WHATSAPP_API_TOKEN=your-whatsapp-token

# Redis (Optional)
REDIS_URL=redis://username:password@host:6379
```

### 2.4 Deploy
1. Klik **"Deploy"**
2. Tunggu build selesai (2-5 menit)
3. Catat URL: `https://your-backend.vercel.app`

## 🎯 **Step 3: Setup Database**

### 3.1 Option A: Neon (Recommended)
1. Kunjungi https://neon.tech
2. Sign up dengan GitHub
3. Create project baru
4. Copy connection string
5. Update `DATABASE_URL` di Vercel

### 3.2 Option B: Supabase
1. Kunjungi https://supabase.com
2. Create project baru
3. Copy connection string
4. Update `DATABASE_URL` di Vercel

### 3.3 Option C: Railway
1. Kunjungi https://railway.app
2. Create PostgreSQL database
3. Copy connection string
4. Update `DATABASE_URL` di Vercel

## 🎯 **Step 4: Test Backend Deployment**

### 4.1 Health Check
```bash
curl https://your-backend.vercel.app/api/v1/health
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Lagiah API is running",
    "timestamp": "2025-08-05T...",
    "version": "1.0.0"
  }
}
```

### 4.2 Test Login API
```bash
curl -X POST https://your-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lagiah.com","password":"admin123"}'
```

## 🎯 **Step 5: Deploy Frontend**

### 5.1 Option A: Vercel Static Site
1. Di Vercel dashboard, klik **"New Project"**
2. Import repository: `anggiadiputra/lagiah`
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. Environment Variable:
   ```env
   VITE_API_BASE_URL=https://your-backend.vercel.app
   ```
5. Deploy

### 5.2 Option B: Shared Hosting
1. Extract `lagiah-frontend-shared-*.tar.gz`
2. Upload ke `public_html/` directory
3. Buat file `.env`:
   ```env
   VITE_API_BASE_URL=https://your-backend.vercel.app
   ```

## 🎯 **Step 6: Configure Domain**

### 6.1 Custom Domain (Optional)
1. Di Vercel dashboard, buka project backend
2. Klik **"Settings"** → **"Domains"**
3. Add custom domain: `api.yourdomain.com`
4. Update DNS records

### 6.2 Frontend Domain
1. Point domain ke shared hosting
2. Configure SSL certificate
3. Update `CORS_ORIGIN` di Vercel

## 🎯 **Step 7: Final Testing**

### 7.1 Test Complete Flow
1. Buka frontend URL
2. Login dengan: admin@lagiah.com / admin123
3. Test semua fitur: domains, hosting, VPS, etc.

### 7.2 Monitor Logs
1. Di Vercel dashboard, buka **"Functions"**
2. Monitor API calls dan errors
3. Check database connectivity

## 🔧 **Troubleshooting**

### **Build Errors:**
- ✅ **Prisma Error**: Sudah di-fix dengan `prisma generate`
- ✅ **TypeScript Errors**: Sudah di-bypass dengan config
- ✅ **CORS Errors**: Sudah di-configure di vercel.json

### **Runtime Errors:**
- **Database Connection**: Check `DATABASE_URL`
- **Authentication**: Check `JWT_SECRET` dan `NEXTAUTH_SECRET`
- **CORS**: Check `CORS_ORIGIN` setting

### **Common Issues:**
1. **Cold Start**: Normal untuk free tier
2. **Function Timeout**: Max 30 seconds
3. **Memory Limit**: 1024 MB untuk free tier

## 📊 **Vercel Free Tier Limits**

- **Projects**: Unlimited
- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Build Time**: 6000 minutes/month
- **Edge Functions**: 500,000 invocations/month

## 🔗 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/nodejs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/custom-domains)

## 🎉 **Success Indicators**

✅ **Backend**: `https://your-backend.vercel.app/api/v1/health` returns success
✅ **Frontend**: Login berhasil dan redirect ke dashboard
✅ **Database**: Data tersimpan dan ter-load dengan benar
✅ **CORS**: Frontend bisa akses backend API
✅ **Authentication**: Login/logout berfungsi normal

## 💰 **Cost Breakdown**

- **Backend (Vercel)**: $0/month (free tier)
- **Database (Neon)**: $0/month (free tier)
- **Frontend (Shared Hosting)**: $2-5/month
- **Total**: **$2-5/month** 🎉 