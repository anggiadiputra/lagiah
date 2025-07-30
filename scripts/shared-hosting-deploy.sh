#!/bin/bash

# 🚀 Lagiah Shared Hosting Deployment Script
# Author: Lagiah Team
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Configuration
PROJECT_NAME="lagiah"
BACKEND_PORT="3004"
FRONTEND_BUILD_DIR="dist"
PUBLIC_HTML_DIR="public_html"
LOGS_DIR="logs"
BACKUPS_DIR="backups"

# Check if running in shared hosting environment
check_environment() {
    log "Checking shared hosting environment..."
    
    # Check if we're in a shared hosting environment
    if [[ -z "$HOME" ]]; then
        error "HOME environment variable not set"
    fi
    
    # Check Node.js availability
    if ! command -v node &> /dev/null; then
        error "Node.js is not available. Please contact your hosting provider."
    fi
    
    # Check npm availability
    if ! command -v npm &> /dev/null; then
        error "npm is not available. Please contact your hosting provider."
    fi
    
    # Check MySQL availability
    if ! command -v mysql &> /dev/null; then
        warn "MySQL client not found. Database operations may need to be done via phpMyAdmin."
    fi
    
    log "Environment check completed"
}

# Create directory structure
create_directories() {
    log "Creating directory structure..."
    
    # Create main project directory
    mkdir -p ~/$PROJECT_NAME
    cd ~/$PROJECT_NAME
    
    # Create subdirectories
    mkdir -p {backend,frontend,$PUBLIC_HTML_DIR,$LOGS_DIR,$BACKUPS_DIR}
    
    log "Directory structure created"
}

# Setup backend
setup_backend() {
    log "Setting up backend..."
    
    cd ~/$PROJECT_NAME/backend
    
    # Copy backend files (assuming they're in the current directory)
    if [[ -d "src" ]]; then
        log "Backend files found, copying..."
    else
        warn "Backend files not found in current directory"
        log "Please copy backend files to ~/$PROJECT_NAME/backend/"
    fi
    
    # Create ecosystem config for shared hosting
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'lagiah-backend',
      script: 'npm',
      args: 'start:prod',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || $BACKEND_PORT
      },
      error_file: '../$LOGS_DIR/backend-error.log',
      out_file: '../$LOGS_DIR/backend-out.log',
      log_file: '../$LOGS_DIR/backend-combined.log',
      time: true
    }
  ]
};
EOF
    
    log "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    log "Setting up frontend..."
    
    cd ~/$PROJECT_NAME/frontend
    
    # Copy frontend files (assuming they're in the current directory)
    if [[ -d "src" ]]; then
        log "Frontend files found, copying..."
    else
        warn "Frontend files not found in current directory"
        log "Please copy frontend files to ~/$PROJECT_NAME/frontend/"
    fi
    
    log "Frontend setup completed"
}

# Generate environment files
generate_env_files() {
    log "Generating environment files..."
    
    cd ~/$PROJECT_NAME
    
    # Generate secure secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 24)
    
    # Get domain from environment or prompt
    DOMAIN=${DOMAIN:-"your-domain.com"}
    
    # Backend environment
    cat > backend/.env.production << EOF
# Database Configuration
DATABASE_URL="mysql://lagiah_user:your_secure_password@localhost:3306/lagiah_db"

# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://$DOMAIN

# Redis Configuration (if available, otherwise use file-based cache)
REDIS_URL=redis://localhost:6379
# Alternative: Use file-based cache
# CACHE_TYPE=file

# API Keys (Update these with your actual API keys)
WHOIS_API_URL=https://api.whois.com/v1
WHOIS_API_KEY=your_whois_api_key_here
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_KEY=your_whatsapp_api_key_here

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Application Settings
LOG_LEVEL=info
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://$DOMAIN,http://localhost:3000

# Shared Hosting Specific
PORT=$BACKEND_PORT
HOST=0.0.0.0
EOF
    
    # Frontend environment
    cat > frontend/.env.production << EOF
# Frontend Environment
VITE_API_BASE_URL=https://$DOMAIN/api
VITE_API_VERSION=v1
VITE_APP_NAME=Lagiah
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_WHATSAPP_NOTIFICATIONS=true
VITE_ENABLE_WHOIS_INTEGRATION=true
EOF
    
    log "Environment files created"
    log "IMPORTANT: Update API keys in backend/.env.production before deployment"
}

# Create web server configuration
create_web_config() {
    log "Creating web server configuration..."
    
    cd ~/$PROJECT_NAME
    
    # Create .htaccess for Apache
    cat > $PUBLIC_HTML_DIR/.htaccess << 'EOF'
RewriteEngine On

# Serve frontend files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Proxy API requests to Node.js backend
RewriteRule ^api/(.*)$ http://localhost:3004/api/$1 [P,L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer-when-downgrade"

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# SSL redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
EOF
    
    log "Web server configuration created"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    cd ~/$PROJECT_NAME/backend
    
    # Install backend dependencies
    if [[ -f "package.json" ]]; then
        npm install --production
        log "Backend dependencies installed"
    else
        warn "package.json not found in backend directory"
    fi
    
    cd ../frontend
    
    # Install frontend dependencies
    if [[ -f "package.json" ]]; then
        npm install --production
        log "Frontend dependencies installed"
    else
        warn "package.json not found in frontend directory"
    fi
    
    cd ..
}

# Build applications
build_applications() {
    log "Building applications..."
    
    cd ~/$PROJECT_NAME/backend
    
    # Build backend
    if [[ -f "package.json" ]]; then
        npm run build:prod
        log "Backend built successfully"
    else
        warn "Cannot build backend - package.json not found"
    fi
    
    cd ../frontend
    
    # Build frontend
    if [[ -f "package.json" ]]; then
        npm run build:prod
        log "Frontend built successfully"
        
        # Copy build files to public_html
        if [[ -d "$FRONTEND_BUILD_DIR" ]]; then
            cp -r $FRONTEND_BUILD_DIR/* ../$PUBLIC_HTML_DIR/
            log "Frontend files copied to public_html"
        fi
    else
        warn "Cannot build frontend - package.json not found"
    fi
    
    cd ..
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    cd ~/$PROJECT_NAME/backend
    
    # Generate Prisma client
    if command -v npx &> /dev/null && [[ -f "prisma/schema.prisma" ]]; then
        npx prisma generate
        log "Prisma client generated"
        
        # Run migrations
        npx prisma migrate deploy
        log "Database migrations applied"
        
        # Seed database
        npm run db:seed
        log "Database seeded"
    else
        warn "Prisma not found or schema not available"
        log "Please run database setup manually"
    fi
    
    cd ..
}

# Create management scripts
create_management_scripts() {
    log "Creating management scripts..."
    
    cd ~/$PROJECT_NAME
    
    # Backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="~/lagiah/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u lagiah_user -p lagiah_db > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/lagiah/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    # Health check script
    cat > health-check.sh << 'EOF'
#!/bin/bash
# Check if application is running
if curl -f http://localhost:3004/api/health > /dev/null 2>&1; then
    echo "Application is healthy"
else
    echo "Application is down, restarting..."
    cd ~/lagiah/backend
    npm start:prod > ../logs/restart.log 2>&1 &
fi
EOF
    
    # Start script
    cat > start.sh << 'EOF'
#!/bin/bash
cd ~/lagiah/backend

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js
    pm2 save
    echo "Application started with PM2"
elif command -v forever &> /dev/null; then
    forever start -a -l ../logs/forever.log -o ../logs/out.log -e ../logs/error.log npm start:prod
    echo "Application started with Forever"
else
    nohup npm start:prod > ../logs/app.log 2>&1 &
    echo "Application started with nohup"
fi
EOF
    
    # Stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
cd ~/lagiah/backend

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    pm2 stop lagiah-backend
    echo "Application stopped with PM2"
elif command -v forever &> /dev/null; then
    forever stopall
    echo "Application stopped with Forever"
else
    pkill -f "npm start:prod"
    echo "Application stopped"
fi
EOF
    
    # Restart script
    cat > restart.sh << 'EOF'
#!/bin/bash
cd ~/lagiah

# Stop application
./stop.sh

# Wait a moment
sleep 2

# Start application
./start.sh

echo "Application restarted"
EOF
    
    # Make scripts executable
    chmod +x {backup.sh,health-check.sh,start.sh,stop.sh,restart.sh}
    
    log "Management scripts created"
}

# Setup process management
setup_process_management() {
    log "Setting up process management..."
    
    cd ~/$PROJECT_NAME
    
    # Try to install PM2 globally
    if command -v npm &> /dev/null; then
        npm install -g pm2 2>/dev/null || warn "Could not install PM2 globally"
    fi
    
    # Try to install Forever as alternative
    if command -v npm &> /dev/null; then
        npm install -g forever 2>/dev/null || warn "Could not install Forever globally"
    fi
    
    log "Process management setup completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    cd ~/$PROJECT_NAME
    
    # Check if files exist
    if [[ -f "backend/package.json" ]]; then
        log "Backend files found"
    else
        warn "Backend files not found"
    fi
    
    if [[ -f "frontend/package.json" ]]; then
        log "Frontend files found"
    else
        warn "Frontend files not found"
    fi
    
    if [[ -f "$PUBLIC_HTML_DIR/index.html" ]]; then
        log "Frontend build found in public_html"
    else
        warn "Frontend build not found in public_html"
    fi
    
    if [[ -f "backend/.env.production" ]]; then
        log "Backend environment file found"
    else
        warn "Backend environment file not found"
    fi
    
    log "Deployment verification completed"
}

# Display final information
display_info() {
    log "🎉 Shared hosting deployment completed!"
    echo
    echo -e "${BLUE}=== LAGIAH SHARED HOSTING DEPLOYMENT INFO ===${NC}"
    echo
    echo -e "${GREEN}Project Structure:${NC}"
    echo "  ~/$PROJECT_NAME/"
    echo "  ├── backend/          (Node.js backend)"
    echo "  ├── frontend/         (Vue.js frontend)"
    echo "  ├── $PUBLIC_HTML_DIR/     (Web root)"
    echo "  ├── $LOGS_DIR/            (Application logs)"
    echo "  └── $BACKUPS_DIR/         (Backup files)"
    echo
    echo -e "${GREEN}Management Scripts:${NC}"
    echo "  ./start.sh           (Start application)"
    echo "  ./stop.sh            (Stop application)"
    echo "  ./restart.sh         (Restart application)"
    echo "  ./backup.sh          (Create backup)"
    echo "  ./health-check.sh    (Check application health)"
    echo
    echo -e "${GREEN}Next Steps:${NC}"
    echo "  1. Update API keys in backend/.env.production"
    echo "  2. Setup database via phpMyAdmin"
    echo "  3. Run: ./start.sh"
    echo "  4. Test application at your domain"
    echo
    echo -e "${GREEN}Default Login:${NC}"
    echo "  Email: admin@lagiah.com"
    echo "  Password: admin123"
    echo
    echo -e "${YELLOW}Important Notes:${NC}"
    echo "  - Application will run on port $BACKEND_PORT"
    echo "  - Frontend files are in $PUBLIC_HTML_DIR/"
    echo "  - Logs are in $LOGS_DIR/"
    echo "  - Backups are in $BACKUPS_DIR/"
    echo
    echo -e "${BLUE}For support, check the logs or refer to SHARED_HOSTING_DEPLOYMENT.md${NC}"
}

# Main deployment function
main() {
    log "Starting Lagiah shared hosting deployment..."
    
    check_environment
    create_directories
    setup_backend
    setup_frontend
    generate_env_files
    create_web_config
    install_dependencies
    build_applications
    setup_database
    create_management_scripts
    setup_process_management
    verify_deployment
    display_info
    
    log "Shared hosting deployment script completed successfully!"
}

# Run main function
main "$@" 