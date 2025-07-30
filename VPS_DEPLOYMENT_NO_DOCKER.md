# 🚀 Panduan Deploy Lagiah ke VPS (Tanpa Docker)

## 📋 Prerequisites
- VPS dengan Ubuntu 20.04+ atau CentOS 8+
- SSH access ke VPS
- Domain name (opsional)
- Minimal 1GB RAM, 20GB storage

---

## 🔧 Step 1: Setup VPS Server

### 1.1 Update System
```bash
# Login ke VPS
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release nginx mysql-server redis-server
```

### 1.2 Install Node.js 18
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 for process management
sudo npm install -g pm2
```

### 1.3 Setup MySQL
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Di dalam MySQL prompt
CREATE DATABASE lagiah;
CREATE USER 'lagiah_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON lagiah.* TO 'lagiah_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.4 Setup Redis
```bash
# Redis sudah terinstall, hanya perlu konfigurasi
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test Redis
redis-cli ping
# Should return: PONG
```

### 1.5 Setup Firewall
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP & HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📁 Step 2: Clone & Setup Project

### 2.1 Clone Repository
```bash
# Buat directory untuk project
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/your-username/lagiah.git
cd lagiah

# Set permissions
sudo chown -R $USER:$USER /var/www/lagiah
```

### 2.2 Setup Backend
```bash
# Install backend dependencies
cd backend
npm install

# Build backend
npm run build:prod

# Create environment file
cp .env.example .env.production
nano .env.production
```

### 2.3 Backend Environment Variables
```bash
# Database Configuration
DATABASE_URL="mysql://lagiah_user:your_secure_password_here@localhost:3306/lagiah"

# NextAuth Configuration
NEXTAUTH_SECRET=your_very_long_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Keys
WHOIS_API_URL=https://api.whois.com/v1
WHOIS_API_KEY=your_whois_api_key
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_KEY=your_whatsapp_api_key

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# Application Settings
LOG_LEVEL=info
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000
```

### 2.4 Setup Frontend
```bash
# Install frontend dependencies
cd ../frontend
npm install

# Build frontend
npm run build:prod
```

### 2.5 Frontend Environment Variables
```bash
# Create environment file
cp .env.example .env.production
nano .env.production
```

```bash
# Frontend Environment
VITE_API_BASE_URL=https://your-domain.com/api
VITE_API_VERSION=v1
VITE_APP_NAME=Lagiah
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_WHATSAPP_NOTIFICATIONS=true
VITE_ENABLE_WHOIS_INTEGRATION=true
```

---

## 🗄️ Step 3: Setup Database

### 3.1 Run Migrations
```bash
# Go to backend directory
cd /var/www/lagiah/backend

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run db:seed
```

---

## ⚙️ Step 4: Setup Process Management

### 4.1 PM2 Configuration
```bash
# Create PM2 ecosystem file
cd /var/www/lagiah
nano ecosystem.config.js
```

```javascript
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
```

### 4.2 Start Services
```bash
# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## 🌐 Step 5: Setup Nginx

### 5.1 Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/lagiah
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
```

### 5.2 Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lagiah /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 6: Setup SSL (Optional)

### 6.1 Install Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 Step 7: Monitoring & Maintenance

### 7.1 Setup Logs
```bash
# View PM2 logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### 7.2 Backup Strategy
```bash
# Create backup script
nano /var/www/lagiah/backup.sh
```

```bash
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
```

```bash
# Make executable
chmod +x /var/www/lagiah/backup.sh

# Setup auto backup
crontab -e
# Add: 0 2 * * * /var/www/lagiah/backup.sh
```

---

## 🚀 Step 8: Update & Maintenance

### 8.1 Update Application
```bash
# Pull latest changes
cd /var/www/lagiah
git pull origin main

# Update backend
cd backend
npm install
npm run build:prod
pm2 restart lagiah-backend

# Update frontend
cd ../frontend
npm install
npm run build:prod

# Reload Nginx
sudo systemctl reload nginx
```

### 8.2 Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check PM2 status
pm2 status

# Check services
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status redis-server
```

---

## 🔧 Step 9: Troubleshooting

### 9.1 Common Issues

#### Issue: Port 3004 already in use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3004

# Kill process if needed
sudo kill -9 <PID>
```

#### Issue: Database connection failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Restart MySQL
sudo systemctl restart mysql
```

#### Issue: Frontend not loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

#### Issue: Backend not responding
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs lagiah-backend

# Restart backend
pm2 restart lagiah-backend
```

### 9.2 Performance Optimization
```bash
# Enable swap (if RAM < 2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Add to /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Add:
# innodb_buffer_pool_size = 256M
# max_connections = 100
```

---

## 📊 Step 10: Security Checklist

### 10.1 Basic Security
- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Setup SSH key authentication
- [ ] Configure firewall (UFW)
- [ ] Regular system updates
- [ ] Strong passwords for all services

### 10.2 Application Security
- [ ] Use HTTPS/SSL
- [ ] Secure environment variables
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update dependencies regularly

---

## 🎯 Step 11: Access Application

### 11.1 Default Credentials
```
Email: admin@lagiah.com
Password: admin123
```

### 11.2 URLs
- **Frontend**: http://your-vps-ip atau https://your-domain.com
- **Backend API**: http://your-vps-ip/api atau https://your-domain.com/api
- **Health Check**: http://your-vps-ip/health atau https://your-domain.com/health

---

## 📞 Support

Jika mengalami masalah:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`
4. Verify environment variables
5. Check firewall settings

---

## 🎉 Success!

Setelah mengikuti panduan ini, aplikasi Lagiah akan berjalan di VPS Anda dengan:
- ✅ Full-stack application (Frontend + Backend)
- ✅ MySQL database
- ✅ Redis caching
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS (jika setup domain)
- ✅ PM2 process management
- ✅ Auto backup
- ✅ Monitoring & logging
- ✅ Production-ready deployment 