#!/bin/bash

# 🚀 Lagiah VPS Deployment Script
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
        apt-transport-https ca-certificates gnupg lsb-release ufw
}

# Install Docker
install_docker() {
    log "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        log "Docker is already installed"
        return
    fi
    
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    log "Docker installation completed"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js..."
    
    if command -v node &> /dev/null; then
        log "Node.js is already installed"
        return
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    log "Node.js installation completed"
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

# Generate secure passwords
generate_passwords() {
    log "Generating secure passwords..."
    
    # Generate random passwords
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    MYSQL_PASSWORD=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 64)
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 24)
    
    # Save passwords to file
    cat > .env.production << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=lagiah
MYSQL_USER=lagiah_user
MYSQL_PASSWORD=$MYSQL_PASSWORD
DATABASE_URL=mysql://lagiah_user:$MYSQL_PASSWORD@mysql:3306/lagiah

# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://localhost

# Redis Configuration
REDIS_URL=redis://redis:6379

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

# SSL Configuration (Update when you have a domain)
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
EOF
    
    log "Environment file created with secure passwords"
    log "IMPORTANT: Update API keys in .env.production before deployment"
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

# Load environment variables
source .env.production

# Backup database
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD lagiah > $BACKUP_DIR/database_$DATE.sql

# Backup uploads (if exists)
if [ -d "uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/
fi

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x backup.sh
    log "Backup script created"
}

# Deploy application
deploy_application() {
    log "Deploying Lagiah application..."
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate:prod
    
    # Seed database
    log "Seeding database..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run db:seed
    
    log "Application deployment completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Some containers are not running"
    fi
    
    # Test health endpoint
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
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

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create log rotation
    sudo tee /etc/logrotate.d/docker-logs > /dev/null << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
    
    # Setup auto backup
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./backup.sh") | crontab -
    
    log "Monitoring setup completed"
}

# Display final information
display_info() {
    log "🎉 Deployment completed successfully!"
    echo
    echo -e "${BLUE}=== LAGIAH DEPLOYMENT INFO ===${NC}"
    echo
    echo -e "${GREEN}Application URLs:${NC}"
    echo "  Frontend: http://$(curl -s ifconfig.me)"
    echo "  Backend API: http://$(curl -s ifconfig.me)/api"
    echo "  Health Check: http://$(curl -s ifconfig.me)/api/health"
    echo
    echo -e "${GREEN}Default Login Credentials:${NC}"
    echo "  Email: admin@lagiah.com"
    echo "  Password: admin123"
    echo
    echo -e "${GREEN}Important Files:${NC}"
    echo "  Environment: $(pwd)/.env.production"
    echo "  Backup Script: $(pwd)/backup.sh"
    echo "  Docker Compose: $(pwd)/docker-compose.prod.yml"
    echo
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "  Update: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
    echo "  Backup: ./backup.sh"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Update API keys in .env.production"
    echo "  2. Setup domain and SSL (optional)"
    echo "  3. Change default passwords"
    echo "  4. Configure monitoring"
    echo
    echo -e "${BLUE}For support, check the logs or refer to VPS_DEPLOYMENT_GUIDE.md${NC}"
}

# Main deployment function
main() {
    log "Starting Lagiah VPS deployment..."
    
    check_root
    check_system
    update_system
    install_docker
    install_nodejs
    setup_firewall
    generate_passwords
    create_backup_script
    deploy_application
    verify_deployment
    setup_monitoring
    display_info
    
    log "Deployment script completed successfully!"
}

# Run main function
main "$@" 