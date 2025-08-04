#!/bin/bash

# Lagiah Render Deployment Script
# Usage: ./render-deploy.sh [production|staging]

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

echo -e "${GREEN}🚀 Starting Lagiah Render deployment...${NC}"
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
DEPLOY_DIR="lagiah-render-${TIMESTAMP}"
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
cat > $DEPLOY_DIR/RENDER_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Lagiah Render Deployment Instructions

## Quick Setup

### 1. Setup Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Verify email

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select repository: lagiah

### 3. Configure Service
```
Name: lagiah-backend
Environment: Node
Region: Singapore (or nearest)
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 4. Environment Variables
Add these in Render dashboard:
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-backend.onrender.com
```

### 5. Create PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Choose plan (Free tier for testing)
3. Copy connection string to DATABASE_URL

### 6. Deploy
1. Click "Create Web Service"
2. Wait for build to complete (5-10 minutes)

### 7. Test Deployment
```bash
curl https://your-backend.onrender.com/api/v1/health
```

## Frontend Deployment

### Option 1: Static Site (Recommended)
1. In Render dashboard, click "New +" → "Static Site"
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

### Option 2: LiteSpeed Shared Hosting
1. Upload frontend files to shared hosting
2. Update API URL in environment
3. Configure .htaccess for SPA routing

## File Structure
```
lagiah-render-YYYYMMDD_HHMMSS/
├── index.html              # Frontend files
├── assets/
├── api/                    # Backend files
│   ├── .next/
│   ├── prisma/
│   ├── package.json
│   └── next.config.js
├── .env.example
└── RENDER_DEPLOYMENT_INSTRUCTIONS.md
```

## Troubleshooting
- Check build logs in Render dashboard
- Verify environment variables
- Test database connectivity
- Review error logs

## URLs
- Backend: https://your-backend.onrender.com
- Frontend: https://your-frontend.onrender.com
- Health Check: https://your-backend.onrender.com/api/v1/health
EOF

# Create package
log "Creating deployment package..."
tar -czf "${DEPLOY_DIR}.tar.gz" $DEPLOY_DIR

# Cleanup
rm -rf $DEPLOY_DIR

log "🎉 Render deployment package created successfully!"
log ""
log "📦 Package: ${DEPLOY_DIR}.tar.gz"
log ""
log "📋 Next steps:"
log "1. Go to https://render.com"
log "2. Create new Web Service"
log "3. Connect GitHub repository"
log "4. Configure environment variables"
log "5. Deploy backend"
log "6. Deploy frontend as Static Site"
log ""
log "🌐 Expected URLs:"
log "- Backend: https://your-backend.onrender.com"
log "- Frontend: https://your-frontend.onrender.com"
log "- Health Check: https://your-backend.onrender.com/api/v1/health"
log ""
log "📖 See RENDER_DEPLOYMENT_INSTRUCTIONS.md for detailed steps" 