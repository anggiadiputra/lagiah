# Lagiah Hybrid Deployment Instructions

## 🚀 **Deployment Strategy**
- **Backend**: Vercel (Next.js API)
- **Frontend**: Shared Hosting (LiteSpeed)

## 📦 **Backend Deployment (Vercel)**

### 1. Setup Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Verify email

### 2. Deploy Backend
1. Click "New Project"
2. Connect GitHub repository: lagiah
3. Configure:
   ```
   Framework Preset: Next.js
   Root Directory: backend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 3. Environment Variables (Vercel)
Add these in Vercel dashboard:
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-backend.vercel.app
CORS_ORIGIN=https://yourdomain.com
```

### 4. Database Setup
**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string
4. Update DATABASE_URL in Vercel

**Option B: Supabase**
1. Go to https://supabase.com
2. Create new project
3. Copy connection string
4. Update DATABASE_URL in Vercel

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)

### 6. Test Backend
```bash
curl https://your-backend.vercel.app/api/v1/health
```

## 🌐 **Frontend Deployment (Shared Hosting)**

### 1. Upload Files
1. Extract `lagiah-frontend-shared-*.tar.gz`
2. Upload all files to `public_html/` directory
3. Ensure `.htaccess` is uploaded

### 2. Environment Configuration
Create `.env` file in `public_html/`:
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

### 3. Domain Configuration
1. Point domain to shared hosting
2. Configure SSL certificate
3. Test website access

### 4. Test Frontend
1. Visit your domain
2. Check if API calls work
3. Test login functionality

## 🔧 **Configuration Files**

### Backend (Vercel)
- `backend/next.config.js` - Next.js configuration
- `backend/prisma/schema.prisma` - Database schema
- `backend/package.json` - Dependencies

### Frontend (Shared Hosting)
- `.htaccess` - LiteSpeed configuration
- `index.html` - Main entry point
- `assets/` - Static files

## 🌐 **Expected URLs**
- **Backend**: https://your-backend.vercel.app
- **Frontend**: https://yourdomain.com
- **API Health**: https://your-backend.vercel.app/api/v1/health

## 🔍 **Testing Checklist**

### Backend (Vercel)
- [ ] Health check endpoint works
- [ ] Database connection successful
- [ ] Authentication endpoints work
- [ ] CORS headers configured
- [ ] Environment variables set

### Frontend (Shared Hosting)
- [ ] Website loads correctly
- [ ] API calls to Vercel work
- [ ] Login/logout functionality
- [ ] Static assets load
- [ ] SPA routing works

## 💰 **Cost Comparison**

### Vercel Backend
- **Free Tier**: $0/month
- **Pro Plan**: $20/month (if needed)

### Shared Hosting Frontend
- **Basic Plan**: $2-5/month
- **Premium Plan**: $10-20/month

### Total Cost
- **Free Tier**: $2-5/month (frontend only)
- **Pro Tier**: $22-25/month (both)

## 🔧 **Troubleshooting**

### Backend Issues
- Check Vercel function logs
- Verify environment variables
- Test database connectivity
- Review CORS configuration

### Frontend Issues
- Check browser console errors
- Verify API URL configuration
- Test .htaccess configuration
- Check SSL certificate

### CORS Issues
- Ensure CORS_ORIGIN is set correctly
- Check if domain is allowed
- Verify API calls include credentials

## 📞 **Support**
- **Vercel**: https://vercel.com/support
- **Neon**: https://neon.tech/docs
- **Shared Hosting**: Contact your hosting provider
