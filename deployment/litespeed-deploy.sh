#!/bin/bash

# Lagiah LiteSpeed Shared Hosting Deployment Script
# Usage: ./litespeed-deploy.sh [production|staging]

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
BACKEND_SERVER_FILE="litespeed-server.js"

# Environment
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}🚀 Starting Lagiah LiteSpeed deployment...${NC}"
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
DEPLOY_DIR="lagiah-litespeed-${TIMESTAMP}"
mkdir -p $DEPLOY_DIR

# Copy frontend files
log "Copying frontend files..."
cp -r $FRONTEND_BUILD_DIR/* $DEPLOY_DIR/

# Copy backend files
log "Copying backend files..."
mkdir -p $DEPLOY_DIR/api
cp -r $BACKEND_BUILD_DIR $DEPLOY_DIR/api/.next
cp -r backend/node_modules $DEPLOY_DIR/api/
cp -r backend/prisma $DEPLOY_DIR/api/
cp backend/package.json $DEPLOY_DIR/api/
cp deployment/litespeed-server.js $DEPLOY_DIR/api/server.js
cp deployment/litespeed-package.json $DEPLOY_DIR/api/package.json

# Copy configuration files
log "Copying configuration files..."
cp deployment/litespeed-htaccess-frontend $DEPLOY_DIR/.htaccess
cp deployment/litespeed-htaccess-backend $DEPLOY_DIR/api/.htaccess
cp deployment/env.example $DEPLOY_DIR/.env.example

# Create deployment instructions
log "Creating deployment instructions..."
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Lagiah LiteSpeed Deployment Instructions

## Quick Setup

### 1. Upload Files
- Upload all files to your shared hosting
- Frontend files go to `public_html/`
- Backend files go to `api/` subfolder or subdomain

### 2. Database Setup
- Create PostgreSQL database in cPanel
- Update `.env` file with database credentials
- Run database migrations

### 3. Environment Configuration
- Copy `.env.example` to `.env`
- Update with your actual values:
  - Database URL
  - JWT secrets
  - Domain URLs

### 4. Start Backend
```bash
cd api/
npm install
node server.js
```

### 5. Test Application
- Frontend: https://yourdomain.com
- Backend: https://yourdomain.com/api/health

## File Structure
```
public_html/          # Frontend files
├── index.html
├── assets/
└── .htaccess

api/                  # Backend files
├── .next/
├── node_modules/
├── prisma/
├── server.js
├── package.json
└── .htaccess
```

## Troubleshooting
- Check file permissions (755 for folders, 644 for files)
- Verify Node.js version (16+)
- Check database connectivity
- Review error logs in hosting panel
EOF

# Create package
log "Creating deployment package..."
tar -czf "${DEPLOY_DIR}.tar.gz" $DEPLOY_DIR

# Cleanup
rm -rf $DEPLOY_DIR

log "🎉 LiteSpeed deployment package created successfully!"
log ""
log "📦 Package: ${DEPLOY_DIR}.tar.gz"
log ""
log "📋 Next steps:"
log "1. Upload ${DEPLOY_DIR}.tar.gz to your shared hosting"
log "2. Extract files to appropriate directories"
log "3. Follow DEPLOYMENT_INSTRUCTIONS.md"
log "4. Configure environment variables"
log "5. Start the backend server"
log ""
log "🌐 Expected URLs:"
log "- Frontend: https://yourdomain.com"
log "- Backend: https://yourdomain.com/api"
log "- Health Check: https://yourdomain.com/api/health" 