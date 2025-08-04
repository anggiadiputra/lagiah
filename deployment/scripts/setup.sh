#!/bin/bash

# Lagiah Server Setup Script
# This script sets up a fresh Ubuntu/Debian server for Lagiah deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up Lagiah server...${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18
log "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
log "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
log "Installing Nginx..."
apt install -y nginx

# Install PM2
log "Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
log "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install Redis (optional)
log "Installing Redis..."
apt install -y redis-server

# Configure PostgreSQL
log "Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE lagiah_db;"
sudo -u postgres psql -c "CREATE USER lagiah_user WITH ENCRYPTED PASSWORD 'lagiah_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lagiah_db TO lagiah_user;"
sudo -u postgres psql -c "ALTER USER lagiah_user CREATEDB;"

# Configure Redis
log "Configuring Redis..."
sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl start redis-server

# Configure Nginx
log "Configuring Nginx..."
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx
systemctl start nginx

# Create application user
log "Creating application user..."
useradd -m -s /bin/bash lagiah || true
usermod -aG sudo lagiah

# Create application directories
log "Creating application directories..."
mkdir -p /var/www/lagiah
mkdir -p /var/backups/lagiah
mkdir -p /var/log/lagiah
chown -R lagiah:lagiah /var/www/lagiah
chown -R lagiah:lagiah /var/backups/lagiah
chown -R lagiah:lagiah /var/log/lagiah

# Configure firewall
log "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3004
ufw --force enable

# Set up log rotation
log "Setting up log rotation..."
cat > /etc/logrotate.d/lagiah << EOF
/var/log/lagiah/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 lagiah lagiah
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create environment file template
log "Creating environment file template..."
cat > /var/www/lagiah/.env.production << EOF
# Database
DATABASE_URL="postgresql://lagiah_user:lagiah_password@localhost:5432/lagiah_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
NEXTAUTH_URL="https://yourdomain.com"

# WhatsApp API (optional)
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_API_KEY="your-whatsapp-api-key"

# Redis
REDIS_URL="redis://localhost:6379"

# App Settings
NODE_ENV="production"
PORT=3004
EOF

chown lagiah:lagiah /var/www/lagiah/.env.production

# Set up PM2 startup script
log "Setting up PM2 startup script..."
pm2 startup
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u lagiah --hp /home/lagiah

# Create systemd service for automatic restart
log "Creating systemd service..."
cat > /etc/systemd/system/lagiah.service << EOF
[Unit]
Description=Lagiah Application
After=network.target postgresql.service redis-server.service

[Service]
Type=forking
User=lagiah
WorkingDirectory=/var/www/lagiah
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable lagiah.service

# Set up monitoring
log "Setting up monitoring..."
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Create backup script
log "Creating backup script..."
cat > /usr/local/bin/lagiah-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/lagiah"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lagiah_backup_${TIMESTAMP}.sql"

# Database backup
sudo -u postgres pg_dump lagiah_db > "${BACKUP_DIR}/${BACKUP_FILE}"

# Application backup
tar -czf "${BACKUP_DIR}/app_backup_${TIMESTAMP}.tar.gz" -C /var/www/lagiah .

# Cleanup old backups (keep last 7 days)
find ${BACKUP_DIR} -name "*.sql" -mtime +7 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}"
EOF

chmod +x /usr/local/bin/lagiah-backup

# Set up cron job for automatic backups
log "Setting up automatic backups..."
echo "0 2 * * * /usr/local/bin/lagiah-backup" | crontab -u lagiah -

# Create health check script
log "Creating health check script..."
cat > /usr/local/bin/lagiah-health << 'EOF'
#!/bin/bash
# Health check for Lagiah services

# Check if backend is running
if ! curl -f http://localhost:3004/health > /dev/null 2>&1; then
    echo "Backend health check failed"
    exit 1
fi

# Check if frontend is accessible
if ! curl -f http://localhost > /dev/null 2>&1; then
    echo "Frontend health check failed"
    exit 1
fi

# Check if database is accessible
if ! sudo -u postgres psql -d lagiah_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "Database health check failed"
    exit 1
fi

echo "All services are healthy"
EOF

chmod +x /usr/local/bin/lagiah-health

log "🎉 Server setup completed successfully!"
log ""
log "📋 Next steps:"
log "1. Update /var/www/lagiah/.env.production with your actual values"
log "2. Upload your application files to /var/www/lagiah/"
log "3. Run the deployment script: ./deploy.sh"
log "4. Set up SSL certificate: certbot --nginx -d yourdomain.com"
log ""
log "📊 Useful commands:"
log "- Check status: pm2 status"
log "- View logs: pm2 logs"
log "- Monitor: pm2 monit"
log "- Health check: /usr/local/bin/lagiah-health"
log "- Manual backup: /usr/local/bin/lagiah-backup"
log ""
log "🔒 Security notes:"
log "- Change default passwords in .env.production"
log "- Configure firewall rules as needed"
log "- Set up regular security updates" 