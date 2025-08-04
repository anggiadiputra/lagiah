#!/bin/bash

# Lagiah Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="lagiah"
DEPLOY_PATH="/var/www/lagiah"
BACKUP_PATH="/var/backups/lagiah"
LOG_PATH="/var/log/lagiah"

# Environment
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}🚀 Starting Lagiah deployment...${NC}"
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# Create necessary directories
log "Creating directories..."
sudo mkdir -p ${DEPLOY_PATH}
sudo mkdir -p ${BACKUP_PATH}
sudo mkdir -p ${LOG_PATH}
sudo chown -R $USER:$USER ${DEPLOY_PATH}
sudo chown -R $USER:$USER ${BACKUP_PATH}
sudo chown -R $USER:$USER ${LOG_PATH}

# Backup current deployment
if [ -d "${DEPLOY_PATH}/backend" ]; then
    log "Creating backup of current deployment..."
    tar -czf "${BACKUP_PATH}/backup_${TIMESTAMP}.tar.gz" -C ${DEPLOY_PATH} .
fi

# Stop services
log "Stopping services..."
pm2 stop ${APP_NAME}-backend 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Deploy backend
log "Deploying backend..."
cd ${DEPLOY_PATH}

# Copy backend files
cp -r ../../backend .
cd backend

# Install dependencies
log "Installing backend dependencies..."
npm ci --only=production

# Build application
log "Building backend..."
npm run build

# Run database migrations
log "Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Deploy frontend
log "Deploying frontend..."
cd ${DEPLOY_PATH}
cp -r ../../frontend .
cd frontend

# Install dependencies
log "Installing frontend dependencies..."
npm ci --only=production

# Build frontend
log "Building frontend..."
npm run build

# Copy configuration files
log "Copying configuration files..."
cd ${DEPLOY_PATH}
cp ../../deployment/nginx.conf .
cp ../../deployment/ecosystem.config.js .

# Start services
log "Starting services..."
pm2 start ecosystem.config.js --env ${ENVIRONMENT}

# Configure nginx
log "Configuring nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/${APP_NAME}
sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Set up SSL certificate (if not exists)
if [ ! -f "/etc/letsencrypt/live/yourdomain.com/fullchain.pem" ]; then
    log "Setting up SSL certificate..."
    sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos --email your-email@example.com
fi

# Health check
log "Performing health check..."
sleep 5
if curl -f http://localhost:3004/health > /dev/null 2>&1; then
    log "✅ Backend health check passed"
else
    error "❌ Backend health check failed"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Frontend health check passed"
else
    error "❌ Frontend health check failed"
fi

# Cleanup old backups (keep last 5)
log "Cleaning up old backups..."
cd ${BACKUP_PATH}
ls -t | tail -n +6 | xargs -r rm

log "🎉 Deployment completed successfully!"
log "📊 Monitoring: pm2 monit"
log "📝 Logs: pm2 logs ${APP_NAME}-backend"
log "🌐 URL: https://yourdomain.com"

# Show status
pm2 status
sudo systemctl status nginx --no-pager -l 