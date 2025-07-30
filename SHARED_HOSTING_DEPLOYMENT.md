# 🚀 Panduan Deploy Lagiah ke Shared Hosting (Node.js Support)

## 📋 Prerequisites
- Shared hosting dengan Node.js support
- SSH access atau File Manager access
- Database MySQL/MariaDB
- Domain name
- Minimal 512MB RAM, 1GB storage

---

## 🔍 Step 1: Verifikasi Shared Hosting Support

### 1.1 Check Node.js Support
```bash
# Login ke SSH atau cPanel Terminal
ssh username@your-domain.com

# Check Node.js version
node --version
npm --version

# Check available Node.js versions
node --help
```

### 1.2 Check Database Support
```bash
# Check MySQL/MariaDB
mysql --version

# Check database access
mysql -u username -p database_name
```

### 1.3 Check Port Availability
```bash
# Check available ports
netstat -tulpn

# Common shared hosting ports
# - 3000-3999 (Node.js apps)
# - 8080-8099 (Alternative ports)
```

---

## 📁 Step 2: Prepare Project for Shared Hosting

### 2.1 Optimize for Shared Hosting
```bash
# Clone project locally
git clone https://github.com/your-username/lagiah.git
cd lagiah

# Create shared hosting optimized version
mkdir lagiah-shared
cd lagiah-shared
```

### 2.2 Create Shared Hosting Structure
```bash
# Create directory structure
mkdir -p {backend,frontend,public_html,logs,backups}
```

### 2.3 Backend Configuration
```bash
# Copy backend files
cp -r ../backend/* backend/

# Create shared hosting specific config
cat > backend/ecosystem.config.js << 'EOF'
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
        PORT: process.env.PORT || 3004
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true
    }
  ]
};
EOF
```

### 2.4 Frontend Configuration
```bash
# Copy frontend files
cp -r ../frontend/* frontend/

# Build frontend for production
cd frontend
npm install
npm run build:prod

# Move build files to public_html
cp -r dist/* ../public_html/
cd ..
```

---

## 🗄️ Step 3: Database Setup

### 3.1 Create Database
```sql
-- Via phpMyAdmin atau MySQL command line
CREATE DATABASE lagiah_db;
CREATE USER 'lagiah_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lagiah_db.* TO 'lagiah_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 Database Configuration
```bash
# Create database config
cat > backend/.env.production << EOF
# Database Configuration
DATABASE_URL="mysql://lagiah_user:your_secure_password@localhost:3306/lagiah_db"

# NextAuth Configuration
NEXTAUTH_SECRET=your_very_long_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Redis Configuration (if available, otherwise use file-based cache)
REDIS_URL=redis://localhost:6379
# Alternative: Use file-based cache
# CACHE_TYPE=file

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

# Shared Hosting Specific
PORT=3004
HOST=0.0.0.0
EOF
```

---

## 📤 Step 4: Upload to Shared Hosting

### 4.1 Upload Files
```bash
# Method 1: Using SCP
scp -r lagiah-shared/* username@your-domain.com:~/lagiah/

# Method 2: Using FTP/SFTP
# Upload via FileZilla or similar FTP client

# Method 3: Using cPanel File Manager
# Upload via web interface
```

### 4.2 Set Permissions
```bash
# SSH into shared hosting
ssh username@your-domain.com

# Navigate to project directory
cd lagiah

# Set permissions
chmod 755 backend/
chmod 755 frontend/
chmod 755 public_html/
chmod 644 backend/.env.production
chmod 755 logs/
chmod 755 backups/
```

---

## ⚙️ Step 5: Install Dependencies & Setup

### 5.1 Install Backend Dependencies
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run db:seed
```

### 5.2 Build Backend
```bash
# Build for production
npm run build:prod

# Test the build
npm run start:prod
```

---

## 🌐 Step 6: Configure Web Server

### 6.1 Apache Configuration (.htaccess)
```apache
# Create .htaccess in public_html
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
```

### 6.2 Nginx Configuration (if available)
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /home/username/lagiah/public_html;
    index index.html;

    # Frontend (Vue.js)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (Node.js)
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
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

---

## 🚀 Step 7: Start Application

### 7.1 Using PM2 (if available)
```bash
# Install PM2 globally (if allowed)
npm install -g pm2

# Start application
cd ~/lagiah
pm2 start backend/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (if supported)
pm2 startup
```

### 7.2 Using Forever (alternative)
```bash
# Install Forever
npm install -g forever

# Start application
cd ~/lagiah/backend
forever start -a -l ../logs/forever.log -o ../logs/out.log -e ../logs/error.log npm start:prod
```

### 7.3 Using Screen (fallback)
```bash
# Install Screen (if available)
sudo apt-get install screen

# Start application in screen session
cd ~/lagiah/backend
screen -S lagiah-backend
npm start:prod

# Detach from screen: Ctrl+A, then D
# Reattach: screen -r lagiah-backend
```

### 7.4 Using nohup (simple fallback)
```bash
# Start application in background
cd ~/lagiah/backend
nohup npm start:prod > ../logs/app.log 2>&1 &

# Check if running
ps aux | grep node
```

---

## 🔒 Step 8: SSL/HTTPS Setup

### 8.1 Using Let's Encrypt (if supported)
```bash
# Install Certbot (if available)
sudo apt-get install certbot

# Get SSL certificate
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 8.2 Using cPanel SSL
1. Login to cPanel
2. Go to "SSL/TLS"
3. Install SSL certificate
4. Force HTTPS redirect

### 8.3 Manual SSL Configuration
```apache
# .htaccess SSL redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 📊 Step 9: Monitoring & Maintenance

### 9.1 Log Monitoring
```bash
# Check application logs
tail -f ~/lagiah/logs/backend-error.log
tail -f ~/lagiah/logs/backend-out.log

# Check system logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

### 9.2 Backup Strategy
```bash
# Create backup script
cat > ~/lagiah/backup.sh << 'EOF'
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

chmod +x ~/lagiah/backup.sh

# Setup auto backup (if cron is available)
crontab -e
# Add: 0 2 * * * ~/lagiah/backup.sh
```

### 9.3 Health Check
```bash
# Create health check script
cat > ~/lagiah/health-check.sh << 'EOF'
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

chmod +x ~/lagiah/health-check.sh

# Setup health check cron
crontab -e
# Add: */5 * * * * ~/lagiah/health-check.sh
```

---

## 🔧 Step 10: Troubleshooting

### 10.1 Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3004

# Kill process if needed
kill -9 <PID>

# Use different port
export PORT=3005
npm start:prod
```

#### Database Connection Failed
```bash
# Test database connection
mysql -u lagiah_user -p lagiah_db -e "SELECT 1;"

# Check database credentials
cat backend/.env.production | grep DATABASE_URL

# Check MySQL status
sudo systemctl status mysql
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=256"

# Use PM2 with memory limit
pm2 start ecosystem.config.js --max-memory-restart 256M
```

#### Permission Issues
```bash
# Fix file permissions
chmod 755 ~/lagiah/
chmod 644 ~/lagiah/backend/.env.production
chmod 755 ~/lagiah/logs/
chmod 755 ~/lagiah/backups/
```

### 10.2 Performance Optimization

#### Enable Compression
```apache
# .htaccess compression
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
```

#### Optimize Database
```sql
-- Optimize MySQL for shared hosting
SET GLOBAL innodb_buffer_pool_size = 128M;
SET GLOBAL max_connections = 50;
SET GLOBAL query_cache_size = 32M;
```

---

## 🎯 Step 11: Access Application

### 11.1 URLs
- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/api/health`

### 11.2 Default Credentials
```
Email: admin@lagiah.com
Password: admin123
```

### 11.3 Test Application
```bash
# Test frontend
curl -I https://your-domain.com

# Test backend API
curl https://your-domain.com/api/health

# Test database connection
curl https://your-domain.com/api/v1/auth/me
```

---

## 📞 Support

### Useful Commands
```bash
# Check application status
ps aux | grep node

# Check logs
tail -f ~/lagiah/logs/backend-error.log

# Restart application
cd ~/lagiah/backend
npm start:prod

# Check disk space
df -h

# Check memory usage
free -h
```

### Contact Support
Jika mengalami masalah:
1. Check application logs
2. Check system logs
3. Verify environment variables
4. Test database connection
5. Contact hosting provider support

---

## 🎉 Success!

Setelah mengikuti panduan ini, aplikasi Lagiah akan berjalan di shared hosting Anda dengan:
- ✅ Full-stack application (Frontend + Backend)
- ✅ MySQL database
- ✅ SSL/HTTPS security
- ✅ Auto backup
- ✅ Health monitoring
- ✅ Performance optimization
- ✅ Shared hosting compatible 