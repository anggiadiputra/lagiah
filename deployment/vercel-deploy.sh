#!/bin/bash

# Lagiah Vercel Deployment Script
# Usage: ./vercel-deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="lagiah"
FRONTEND_BUILD_DIR="frontend/dist"
BACKEND_BUILD_DIR="backend/.next"

# Environment
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}🚀 Starting Lagiah Vercel deployment...${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Timestamp: ${TIMESTAMP}${NC}"

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

# Create deployment package
log "Creating deployment package..."
DEPLOY_DIR="lagiah-vercel-${TIMESTAMP}"
mkdir -p $DEPLOY_DIR

# Copy frontend files
log "Copying frontend files..."
cp -r $FRONTEND_BUILD_DIR/* $DEPLOY_DIR/

# Copy backend files
log "Copying backend files..."
mkdir -p $DEPLOY_DIR/api
cp -r $BACKEND_BUILD_DIR $DEPLOY_DIR/api/.next
cp -r backend/prisma $DEPLOY_DIR/api/
cp backend/package.json $DEPLOY_DIR/api/
cp backend/next.config.js $DEPLOY_DIR/api/

# Copy configuration files
log "Copying configuration files..."
cp deployment/env.example $DEPLOY_DIR/.env.example

# Create deployment instructions
log "Creating deployment instructions..."
cat > $DEPLOY_DIR/VERCEL_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Lagiah Vercel Deployment Instructions

## Quick Setup

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

### 3. Environment Variables
Add these in Vercel dashboard:
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-backend.vercel.app
```

### 4. Database Setup (External)
Vercel tidak menyediakan database, jadi gunakan:

#### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string
4. Update DATABASE_URL in Vercel

#### Option B: Supabase
1. Go to https://supabase.com
2. Create new project
3. Copy connection string
4. Update DATABASE_URL in Vercel

#### Option C: Railway PostgreSQL
1. Go to https://railway.app
2. Create PostgreSQL database
3. Copy connection string
4. Update DATABASE_URL in Vercel

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)

### 6. Test Deployment
```bash
curl https://your-backend.vercel.app/api/v1/health
```

## Frontend Deployment

### Option 1: Vercel Static Site (Recommended)
1. In Vercel dashboard, click "New Project"
2. Connect GitHub repository: lagiah
3. Configure:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
4. Add environment variable:
   - `VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1`

### Option 2: LiteSpeed Shared Hosting
1. Upload frontend files to shared hosting
2. Update API URL in environment
3. Configure .htaccess for SPA routing

## File Structure
```
lagiah-vercel-YYYYMMDD_HHMMSS/
├── index.html              # Frontend files
├── assets/
├── api/                    # Backend files
│   ├── .next/
│   ├── prisma/
│   ├── package.json
│   └── next.config.js
├── .env.example
└── VERCEL_DEPLOYMENT_INSTRUCTIONS.md
```

## Vercel Free Tier Limits
- **Projects**: Unlimited
- **Bandwidth**: 100 GB/month
- **Function Execution**: 100 GB-hours/month
- **Build Time**: 6000 minutes/month
- **Edge Functions**: 500,000 invocations/month

## Troubleshooting
- Check build logs in Vercel dashboard
- Verify environment variables
- Test database connectivity
- Review function logs

## URLs
- Backend: https://your-backend.vercel.app
- Frontend: https://your-frontend.vercel.app
- Health Check: https://your-backend.vercel.app/api/v1/health

## Advantages of Vercel
✅ Excellent Next.js support
✅ Global CDN
✅ Automatic deployments
✅ Great performance
✅ Edge functions
✅ Free tier is generous
✅ No cold starts for paid plans
EOF

# Create package
log "Creating deployment package..."
tar -czf "${DEPLOY_DIR}.tar.gz" $DEPLOY_DIR

# Cleanup
rm -rf $DEPLOY_DIR

log "🎉 Vercel deployment package created successfully!"
log ""
log "📦 Package: ${DEPLOY_DIR}.tar.gz"
log ""
log "📋 Next steps:"
log "1. Go to https://vercel.com"
log "2. Create new project for backend"
log "3. Connect GitHub repository"
log "4. Configure environment variables"
log "5. Setup external database (Neon/Supabase/Railway)"
log "6. Deploy backend"
log "7. Deploy frontend as separate project"
log ""
log "🌐 Expected URLs:"
log "- Backend: https://your-backend.vercel.app"
log "- Frontend: https://your-frontend.vercel.app"
log "- Health Check: https://your-backend.vercel.app/api/v1/health"
log ""
log "📖 See VERCEL_DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
log ""
log "💡 Vercel Advantages:"
log "- Free tier lebih generos"
log "- Performa lebih cepat"
log "- Next.js support terbaik"
log "- Global CDN"
log "- Auto-deploy dari GitHub" 