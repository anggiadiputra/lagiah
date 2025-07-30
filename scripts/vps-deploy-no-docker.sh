#!/bin/bash

# 🚀 Lagiah VPS Deployment Script (No Docker)
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Check system requirements
check_system() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        error "Cannot determine OS version"
    fi
    
    source /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        warn "This script is tested on Ubuntu/Debian. Other distributions may require manual adjustments."
    fi
    
    # Check memory
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [[ $MEMORY -lt 1024 ]]; then
        warn "System has less than 1GB RAM. Performance may be affected."
    fi
    
    # Check disk space
    DISK_SPACE=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $DISK_SPACE -lt 20 ]]; then
        error "Insufficient disk space. Need at least 20GB free space."
    fi
    
    log "System requirements check passed"
}

# Update system
update_system() {
    log "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    log "Installing essential packages..."
    sudo apt install -y curl wget git unzip software-properties-common \
        apt-transport-https ca-certificates gnupg lsb-release nginx mysql-server redis-server ufw
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js..."
    
    if command -v node &> /dev/null; then
        log "Node.js is already installed"
    else
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    log "Node.js installation completed"
}

# Setup MySQL
setup_mysql() {
    log "Setting up MySQL..."
    
    # Start MySQL if not running
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # Create database and user
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    MYSQL_USER_PASSWORD=$(openssl rand -base64 32)
    
    # Create MySQL setup script
    cat > /tmp/mysql_setup.sql << EOF
CREATE DATABASE IF NOT EXISTS lagiah;
CREATE USER IF NOT EXISTS 'lagiah_user'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';
GRANT ALL PRIVILEGES ON lagiah.* TO 'lagiah_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    # Execute MySQL setup
    sudo mysql < /tmp/mysql_setup.sql
    rm /tmp/mysql_setup.sql
    
    log "MySQL setup completed"
    log "Database: lagiah"
    log "User: lagiah_user"
    log "Password: $MYSQL_USER_PASSWORD"
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Test Redis
    if redis-cli ping | grep -q "PONG"; then
        log "Redis is working correctly"
    else
        error "Redis is not responding"
    fi
}

# Setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable
    
    log "Firewall configured"
}

# Generate environment files
generate_env_files() {
    log "Generating environment files..."
    
    # Generate secure secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 24)
    
    # Backend environment
    cat > backend/.env.production << EOF
# Database Configuration
DATABASE_URL="mysql://lagiah_user:$MYSQL_USER_PASSWORD@localhost:3306/lagiah"

# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost

# Redis Configuration
REDIS_URL=redis://localhost:6379

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
ALLOWED_ORIGINS=http://localhost,http://localhost:3000
EOF
    
    # Frontend environment
    cat > frontend/.env.production << EOF
# Frontend Environment
VITE_API_BASE_URL=http://localhost/api
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

# Setup PM2 configuration
setup_pm2() {
    log "Setting up PM2 configuration..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'lagiah-backend',
      cwd: '/var/www/lagiah/backend',
      script: 'npm',
      args: 'start:prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3004
      }
    }
  ]
};
EOF
    
    log "PM2 configuration created"
}

# Setup Nginx configuration
setup_nginx() {
    log "Setting up Nginx configuration..."
    
    cat > /tmp/lagiah-nginx << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (Vue.js)
    location / {
        root /var/www/lagiah/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (Next.js)
    location /api {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3004/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    # Copy Nginx config
    sudo cp /tmp/lagiah-nginx /etc/nginx/sites-available/lagiah
    sudo ln -sf /etc/nginx/sites-available/lagiah /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    
    rm /tmp/lagiah-nginx
    log "Nginx configuration completed"
}

# Build and deploy application
deploy_application() {
    log "Building and deploying application..."
    
    # Build backend
    cd backend
    npm install
    npm run build:prod
    
    # Build frontend
    cd ../frontend
    npm install
    npm run build:prod
    
    # Setup database
    cd ../backend
    npx prisma generate
    npx prisma migrate deploy
    npm run db:seed
    
    # Start with PM2
    cd ..
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    log "Application deployment completed"
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/lagiah"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u lagiah_user -p lagiah > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/lagiah/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x backup.sh
    
    # Setup auto backup
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./backup.sh") | crontab -
    
    log "Backup script created"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check PM2 status
    if pm2 status | grep -q "online"; then
        log "PM2 processes are running"
    else
        warn "Some PM2 processes may not be running"
    fi
    
    # Check Nginx status
    if sudo systemctl is-active --quiet nginx; then
        log "Nginx is running"
    else
        error "Nginx is not running"
    fi
    
    # Check MySQL status
    if sudo systemctl is-active --quiet mysql; then
        log "MySQL is running"
    else
        error "MySQL is not running"
    fi
    
    # Check Redis status
    if sudo systemctl is-active --quiet redis-server; then
        log "Redis is running"
    else
        error "Redis is not running"
    fi
    
    # Test health endpoint
    sleep 5
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log "Health check passed"
    else
        warn "Health check failed, but deployment may still be successful"
    fi
    
    # Test frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        log "Frontend is accessible"
    else
        warn "Frontend check failed, but deployment may still be successful"
    fi
    
    log "Deployment verification completed"
}

# Display final information
display_info() {
    log "🎉 Deployment completed successfully!"
    echo
    echo -e "${BLUE}=== LAGIAH DEPLOYMENT INFO (NO DOCKER) ===${NC}"
    echo
    echo -e "${GREEN}Application URLs:${NC}"
    echo "  Frontend: http://$(curl -s ifconfig.me)"
    echo "  Backend API: http://$(curl -s ifconfig.me)/api"
    echo "  Health Check: http://$(curl -s ifconfig.me)/health"
    echo
    echo -e "${GREEN}Default Login Credentials:${NC}"
    echo "  Email: admin@lagiah.com"
    echo "  Password: admin123"
    echo
    echo -e "${GREEN}Database Info:${NC}"
    echo "  Database: lagiah"
    echo "  User: lagiah_user"
    echo "  Password: $MYSQL_USER_PASSWORD"
    echo
    echo -e "${GREEN}Important Files:${NC}"
    echo "  Backend Env: $(pwd)/backend/.env.production"
    echo "  Frontend Env: $(pwd)/frontend/.env.production"
    echo "  PM2 Config: $(pwd)/ecosystem.config.js"
    echo "  Backup Script: $(pwd)/backup.sh"
    echo "  Nginx Config: /etc/nginx/sites-available/lagiah"
    echo
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "  PM2 logs: pm2 logs"
    echo "  PM2 status: pm2 status"
    echo "  Restart backend: pm2 restart lagiah-backend"
    echo "  Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "  MySQL logs: sudo tail -f /var/log/mysql/error.log"
    echo "  Backup: ./backup.sh"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Update API keys in backend/.env.production"
    echo "  2. Setup domain and SSL (optional)"
    echo "  3. Change default passwords"
    echo "  4. Configure monitoring"
    echo
    echo -e "${BLUE}For support, check the logs or refer to VPS_DEPLOYMENT_NO_DOCKER.md${NC}"
}

# Main deployment function
main() {
    log "Starting Lagiah VPS deployment (No Docker)..."
    
    check_root
    check_system
    update_system
    install_nodejs
    setup_mysql
    setup_redis
    setup_firewall
    generate_env_files
    setup_pm2
    setup_nginx
    deploy_application
    create_backup_script
    verify_deployment
    display_info
    
    log "Deployment script completed successfully!"
}

# Run main function
main "$@" 