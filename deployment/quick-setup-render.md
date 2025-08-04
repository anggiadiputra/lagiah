# Quick Setup: Deploy Backend ke Render

## 🚀 **Step-by-Step Guide**

### 1. **Persiapkan Repository**
```bash
# Pastikan kode sudah di GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. **Setup di Render Dashboard**

#### A. Buat Account
1. Kunjungi https://render.com
2. Sign up dengan GitHub account
3. Verifikasi email

#### B. Buat Web Service
1. Klik **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Pilih repository Lagiah

#### C. Konfigurasi Service
```
Name: lagiah-backend
Environment: Node
Region: Singapore (atau terdekat)
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 3. **Environment Variables**
Di Render dashboard, tambahkan environment variables:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-backend.onrender.com
```

### 4. **Database Setup**

#### A. Buat PostgreSQL Database
1. Di Render dashboard, klik **"New +"** → **"PostgreSQL"**
2. Pilih plan (Free tier cukup untuk testing)
3. Catat connection string

#### B. Update Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 5. **Deploy**
1. Klik **"Create Web Service"**
2. Render akan otomatis deploy
3. Tunggu build selesai (5-10 menit)

### 6. **Test Deployment**
```bash
# Test health endpoint
curl https://your-backend.onrender.com/api/v1/health

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
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_APP_NAME=Lagiah
VITE_APP_VERSION=1.0.0
```

### Build dan Deploy Frontend
```bash
cd frontend
npm run build
# Upload dist/ ke LiteSpeed hosting
```

## 📊 **Render Free Tier Limits**

- **Web Services**: 750 hours/month
- **PostgreSQL**: 90 days trial
- **Bandwidth**: 100 GB/month
- **Sleep**: Services sleep after 15 minutes inactivity

## 🔍 **Troubleshooting**

### Build Errors
```bash
# Check build logs di Render dashboard
# Common issues:
# - Missing dependencies
# - TypeScript errors
# - Environment variables
```

### Database Connection
```bash
# Test database connection
psql "postgresql://username:password@host:5432/database"

# Run migrations
npx prisma migrate deploy
```

### Cold Start Issues
- Free tier services sleep after 15 minutes
- First request after sleep takes 30-60 seconds
- Consider paid plan for production

## 💰 **Pricing**

### Free Tier
- ✅ 750 hours/month
- ✅ 100 GB bandwidth
- ✅ PostgreSQL (90 days)
- ❌ Sleep after 15 minutes

### Paid Plans
- **Starter**: $7/month
- **Standard**: $25/month
- **Pro**: $50/month

## 🔄 **Auto-Deploy**

Render otomatis deploy setiap kali push ke GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render akan auto-deploy
```

## 📈 **Monitoring**

### Logs
- Real-time logs di Render dashboard
- Error tracking
- Performance metrics

### Health Checks
```bash
# Setup health check URL
https://your-backend.onrender.com/api/v1/health
```

## 🎯 **Best Practices**

1. **Environment Variables**: Jangan commit secrets
2. **Database**: Backup regularly
3. **Logs**: Monitor error logs
4. **Performance**: Optimize for cold starts
5. **Security**: Use HTTPS, secure headers

## 🔗 **Useful Links**

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL on Render](https://render.com/docs/deploy-postgresql-database)
- [Environment Variables](https://render.com/docs/environment-variables) 