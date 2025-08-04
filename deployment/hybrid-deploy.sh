#!/bin/bash

# Lagiah Hybrid Deployment Script
# Backend: Vercel
# Frontend: Shared Hosting (LiteSpeed)
# Usage: ./hybrid-deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="lagiah"
FRONTEND_BUILD_DIR="frontend/dist"
BACKEND_BUILD_DIR="backend/.next"

# Environment
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}🚀 Starting Lagiah Hybrid Deployment...${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Timestamp: ${TIMESTAMP}${NC}"
echo -e "${BLUE}Backend: Vercel${NC}"
echo -e "${BLUE}Frontend: Shared Hosting${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if required files exist
if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
    error "Frontend build directory not found. Run 'npm run build' in frontend directory first."
fi

if [ ! -d "$BACKEND_BUILD_DIR" ]; then
    error "Backend build directory not found. Run 'npm run build' in backend directory first."
fi

# Create deployment packages
log "Creating deployment packages..."

# 1. Backend package for Vercel
log "Creating backend package for Vercel..."
BACKEND_DIR="lagiah-backend-vercel-${TIMESTAMP}"
mkdir -p $BACKEND_DIR

# Copy backend files
cp -r backend/* $BACKEND_DIR/
rm -rf $BACKEND_DIR/node_modules 2>/dev/null || true

# Create backend package
tar -czf "${BACKEND_DIR}.tar.gz" $BACKEND_DIR
rm -rf $BACKEND_DIR

# 2. Frontend package for Shared Hosting
log "Creating frontend package for Shared Hosting..."
FRONTEND_DIR="lagiah-frontend-shared-${TIMESTAMP}"
mkdir -p $FRONTEND_DIR

# Copy frontend files
cp -r $FRONTEND_BUILD_DIR/* $FRONTEND_DIR/

# Copy .htaccess for LiteSpeed
cp deployment/litespeed-htaccess-frontend $FRONTEND_DIR/.htaccess

# Create frontend package
tar -czf "${FRONTEND_DIR}.tar.gz" $FRONTEND_DIR
rm -rf $FRONTEND_DIR

# Create deployment instructions
log "Creating deployment instructions..."
cat > "HYBRID_DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
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
EOF

log "🎉 Hybrid deployment packages created successfully!"
log ""
log "📦 Backend Package (Vercel): ${BACKEND_DIR}.tar.gz"
log "📦 Frontend Package (Shared Hosting): ${FRONTEND_DIR}.tar.gz"
log ""
log "📋 Deployment Steps:"
log "1. Deploy backend to Vercel"
log "2. Setup external database (Neon/Supabase)"
log "3. Upload frontend to shared hosting"
log "4. Configure domain and SSL"
log "5. Test both applications"
log ""
log "🌐 Expected URLs:"
log "- Backend: https://your-backend.vercel.app"
log "- Frontend: https://yourdomain.com"
log "- Health Check: https://your-backend.vercel.app/api/v1/health"
log ""
log "📖 See HYBRID_DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
log ""
log "💡 Advantages of Hybrid Deployment:"
log "- Backend: Vercel's excellent Next.js support"
log "- Frontend: Cost-effective shared hosting"
log "- Best of both worlds!" 