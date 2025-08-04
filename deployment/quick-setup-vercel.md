# Quick Setup: Deploy Backend ke Vercel

## 🚀 **Step-by-Step Guide**

### 1. **Persiapkan Repository**
```bash
# Pastikan kode sudah di GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. **Setup di Vercel Dashboard**

#### A. Buat Account
1. Kunjungi https://vercel.com
2. Sign up dengan GitHub account
3. Verifikasi email

#### B. Import Project
1. Klik **"New Project"**
2. Connect GitHub repository
3. Pilih repository Lagiah

#### C. Konfigurasi Project
```
Framework Preset: Next.js
Root Directory: backend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3. **Environment Variables**
Di Vercel dashboard, tambahkan environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-backend.vercel.app
```

### 4. **Database Setup**

#### A. External Database Options
Vercel tidak menyediakan database, jadi gunakan:

1. **Neon** (Recommended)
   - https://neon.tech
   - PostgreSQL serverless
   - Free tier available

2. **Supabase**
   - https://supabase.com
   - PostgreSQL + Auth
   - Free tier available

3. **Railway PostgreSQL**
   - https://railway.app
   - Easy setup
   - Pay-as-you-go

#### B. Setup Neon Database
```bash
# 1. Sign up di neon.tech
# 2. Buat project baru
# 3. Copy connection string
# 4. Update DATABASE_URL di Vercel
```

### 5. **Deploy**
1. Klik **"Deploy"**
2. Vercel akan otomatis deploy
3. Tunggu build selesai (2-5 menit)

### 6. **Test Deployment**
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/v1/health

# Expected response:
{
  "status": "success",
  "data": {
    "message": "Lagiah API is running",
    "timestamp": "2025-08-05T...",
    "version": "1.0.0"
  }
}
```

## 🔧 **Konfigurasi Frontend**

### Update Frontend Environment
```env
# frontend/.env.production
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
VITE_APP_NAME=Lagiah
VITE_APP_VERSION=1.0.0
```

### Build dan Deploy Frontend
```bash
cd frontend
npm run build
# Upload dist/ ke LiteSpeed hosting
```

## 📊 **Vercel Free Tier Limits**

- **Projects**: Unlimited
- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Build Time**: 6000 minutes/month
- **Edge Functions**: 500,000 invocations/month

## 🔍 **Troubleshooting**

### Build Errors
```bash
# Check build logs di Vercel dashboard
# Common issues:
# - Missing dependencies
# - TypeScript errors
# - Environment variables
# - Database connection
```

### Database Connection
```bash
# Test database connection
psql "postgresql://username:password@host:5432/database"

# Run migrations
npx prisma migrate deploy
```

### Function Timeout
- Vercel functions timeout after 10 seconds (free tier)
- 60 seconds (pro plan)
- Optimize database queries

## 💰 **Pricing**

### Free Tier
- ✅ Unlimited projects
- ✅ 100 GB bandwidth
- ✅ 6000 build minutes
- ❌ 10s function timeout
- ❌ No custom domains

### Paid Plans
- **Pro**: $20/month
- **Enterprise**: Custom pricing

## 🔄 **Auto-Deploy**

Vercel otomatis deploy setiap kali push ke GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Vercel akan auto-deploy
```

## 📈 **Monitoring**

### Logs
- Real-time logs di Vercel dashboard
- Function logs
- Build logs
- Error tracking

### Analytics
- Page views
- Function invocations
- Performance metrics

## 🎯 **Best Practices**

1. **Environment Variables**: Jangan commit secrets
2. **Database**: Use connection pooling
3. **Functions**: Keep them lightweight
4. **Caching**: Use Vercel's edge caching
5. **Security**: Use HTTPS, secure headers

## 🔗 **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Database Integration](https://vercel.com/docs/storage/vercel-postgres)

## 🆚 **Vercel vs Railway vs Render**

| Feature | Vercel | Railway | Render |
|---------|--------|---------|--------|
| Free Tier | ✅ | ✅ | ✅ |
| Database | ❌ | ✅ | ✅ |
| Next.js Support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Pricing | $20/month | $5/month | $7/month |

## 💡 **Tips untuk Vercel**

1. **Use Edge Functions** untuk performa maksimal
2. **Optimize Images** dengan Vercel Image Optimization
3. **Use Caching** untuk mengurangi database calls
4. **Monitor Function Duration** untuk optimasi
5. **Use Environment Variables** untuk konfigurasi 