# 🚀 Panduan Deploy Lagiah ke cPanel dengan Node.js Support

## 📋 Prerequisites
- Shared hosting dengan cPanel
- Node.js support diaktifkan
- Database MySQL/MariaDB
- Domain name
- SSH access atau Terminal di cPanel

---

## 🔍 Step 1: Verifikasi cPanel Node.js Support

### 1.1 Check Node.js di cPanel
1. Login ke cPanel
2. Cari "Node.js" atau "Node.js Selector"
3. Klik "Node.js Selector"
4. Check versi Node.js yang tersedia (minimal v16+)

### 1.2 Check Database Support
1. Di cPanel, cari "MySQL Databases"
2. Buat database baru atau gunakan yang ada
3. Buat user database baru

### 1.3 Check SSH/Terminal Access
1. Di cPanel, cari "Terminal" atau "SSH Access"
2. Pastikan SSH access diaktifkan
3. Catat SSH credentials

---

## 📁 Step 2: Setup Project di cPanel

### 2.1 Upload Project Files
```bash
# Method 1: Via SSH
ssh username@your-domain.com
cd ~/public_html
git clone https://github.com/your-username/lagiah.git
cd lagiah

# Method 2: Via cPanel File Manager
# 1. Buka File Manager di cPanel
# 2. Navigate ke public_html
# 3. Upload project files via zip
# 4. Extract files
```

### 2.2 Create Directory Structure
```bash
# SSH ke server
ssh username@your-domain.com

# Buat struktur direktori
cd ~/public_html
mkdir -p lagiah/{backend,frontend,logs,backups}
cd lagiah
```

---

## 🗄️ Step 3: Setup Database di cPanel

### 3.1 Create Database via cPanel
1. Login ke cPanel
2. Klik "MySQL Databases"
3. Buat database baru:
   - Database name: `username_lagiah`
   - Database user: `username_lagiah_user`
   - Password: `your_secure_password`

### 3.2 Database Configuration
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah

# Buat file environment
cat > backend/.env.production << EOF
# Database Configuration
DATABASE_URL="mysql://username_lagiah_user:your_secure_password@localhost:3306/username_lagiah"

# NextAuth Configuration
NEXTAUTH_SECRET=your_very_long_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Redis Configuration (jika tidak ada, gunakan file cache)
# REDIS_URL=redis://localhost:6379
CACHE_TYPE=file

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
ALLOWED_ORIGINS=https://your-domain.com

# cPanel Specific
PORT=3004
HOST=0.0.0.0
EOF
```

---

## ⚙️ Step 4: Setup Node.js di cPanel

### 4.1 Configure Node.js App
1. Di cPanel, klik "Node.js Selector"
2. Klik "Create Application"
3. Isi form:
   - **Node.js version**: Pilih versi terbaru (18+)
   - **Application mode**: Production
   - **Application root**: `/home/username/public_html/lagiah/backend`
   - **Application URL**: `https://your-domain.com`
   - **Application startup file**: `server.js` atau `index.js`
   - **Passenger port**: `3004`
   - **Environment variables**: Tambahkan sesuai .env.production

### 4.2 Create Startup File
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah/backend

# Buat file startup untuk cPanel
cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3004;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
EOF
```

---

## 📦 Step 5: Install Dependencies & Build

### 5.1 Install Backend Dependencies
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah/backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

### 5.2 Build Backend
```bash
# Build untuk production
npm run build:prod

# Test startup file
node server.js
```

### 5.3 Setup Frontend
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah/frontend

# Install dependencies
npm install --production

# Build frontend
npm run build:prod

# Copy build files ke public_html
cp -r dist/* ../public_html/
```

---

## 🌐 Step 6: Configure Web Server

### 6.1 Create .htaccess untuk Frontend
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html

# Buat .htaccess untuk frontend
cat > .htaccess << 'EOF'
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
```

### 6.2 Configure Subdomain (Optional)
Jika ingin menggunakan subdomain untuk API:

1. Di cPanel, klik "Subdomains"
2. Buat subdomain: `api.your-domain.com`
3. Point ke: `/home/username/public_html/lagiah/backend`
4. Buat .htaccess di backend folder:

```apache
# /home/username/public_html/lagiah/backend/.htaccess
RewriteEngine On
RewriteRule ^(.*)$ server.js [QSA,L]
```

---

## 🚀 Step 7: Start Application

### 7.1 Start via cPanel Node.js Selector
1. Di cPanel, klik "Node.js Selector"
2. Klik "Restart" pada aplikasi yang sudah dibuat
3. Check status aplikasi

### 7.2 Start via SSH (Alternative)
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah/backend

# Start dengan PM2 (jika tersedia)
npm install -g pm2
pm2 start server.js --name "lagiah-backend"

# Atau start dengan nohup
nohup node server.js > ../logs/app.log 2>&1 &
```

### 7.3 Check Application Status
```bash
# Check if application is running
ps aux | grep node

# Check logs
tail -f ~/public_html/lagiah/logs/app.log

# Test API
curl https://your-domain.com/api/health
```

---

## 🔒 Step 8: SSL/HTTPS Setup

### 8.1 Enable SSL di cPanel
1. Di cPanel, klik "SSL/TLS"
2. Klik "Install SSL Certificate"
3. Pilih domain dan install certificate
4. Enable "Force HTTPS Redirect"

### 8.2 Update Environment Variables
```bash
# Update NEXTAUTH_URL
ssh username@your-domain.com
cd ~/public_html/lagiah/backend

# Edit .env.production
nano .env.production
# Update: NEXTAUTH_URL=https://your-domain.com
```

---

## 📊 Step 9: Monitoring & Maintenance

### 9.1 Create Management Scripts
```bash
# SSH ke server
ssh username@your-domain.com
cd ~/public_html/lagiah

# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="~/public_html/lagiah/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u username_lagiah_user -p username_lagiah > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/public_html/lagiah/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh
```

### 9.2 Health Check Script
```bash
# Health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
# Check if application is running
if curl -f https://your-domain.com/api/health > /dev/null 2>&1; then
    echo "Application is healthy"
else
    echo "Application is down, restarting..."
    cd ~/public_html/lagiah/backend
    nohup node server.js > ../logs/restart.log 2>&1 &
fi
EOF

chmod +x health-check.sh
```

### 9.3 Setup Cron Jobs
```bash
# Setup cron jobs via cPanel
# 1. Di cPanel, klik "Cron Jobs"
# 2. Add cron job untuk backup: 0 2 * * * ~/public_html/lagiah/backup.sh
# 3. Add cron job untuk health check: */5 * * * * ~/public_html/lagiah/health-check.sh
```

---

## 🔧 Step 10: Troubleshooting

### 10.1 Common Issues

#### Node.js App Not Starting
```bash
# Check Node.js version
node --version

# Check application logs
tail -f ~/public_html/lagiah/logs/app.log

# Check cPanel Node.js logs
# Di cPanel > Node.js Selector > View Logs
```

#### Database Connection Failed
```bash
# Test database connection
mysql -u username_lagiah_user -p username_lagiah -e "SELECT 1;"

# Check database credentials
cat ~/public_html/lagiah/backend/.env.production | grep DATABASE_URL
```

#### Frontend Not Loading
```bash
# Check if frontend files exist
ls -la ~/public_html/

# Check .htaccess file
cat ~/public_html/.htaccess

# Check web server logs via cPanel
```

#### Port Issues
```bash
# Check if port is available
netstat -tulpn | grep :3004

# Use different port if needed
# Update .env.production: PORT=3005
# Update cPanel Node.js configuration
```

### 10.2 Performance Optimization

#### Memory Issues
```bash
# Check memory usage
free -h

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=256"

# Update cPanel Node.js configuration
# Set memory limit in Node.js Selector
```

#### Database Optimization
```sql
-- Via phpMyAdmin di cPanel
OPTIMIZE TABLE users, domains, hosting, vps, websites;
ANALYZE TABLE users, domains, hosting, vps, websites;
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

### cPanel Specific Commands
```bash
# Check cPanel Node.js status
# Via cPanel > Node.js Selector > View Status

# Check application logs
# Via cPanel > Node.js Selector > View Logs

# Restart application
# Via cPanel > Node.js Selector > Restart
```

### Useful Commands
```bash
# Check application status
ps aux | grep node

# Check logs
tail -f ~/public_html/lagiah/logs/app.log

# Check disk space
df -h

# Check memory usage
free -h
```

### Contact Support
Jika mengalami masalah:
1. Check cPanel Node.js logs
2. Check application logs: `tail -f ~/public_html/lagiah/logs/app.log`
3. Verify environment variables: `cat ~/public_html/lagiah/backend/.env.production`
4. Test database connection via phpMyAdmin
5. Contact hosting provider support

---

## 🎉 Success!

Setelah mengikuti panduan ini, aplikasi Lagiah akan berjalan di cPanel dengan:
- ✅ Full-stack application (Frontend + Backend)
- ✅ MySQL database via cPanel
- ✅ Node.js support via cPanel
- ✅ SSL/HTTPS security
- ✅ Auto backup via cron
- ✅ Health monitoring
- ✅ Performance optimization
- ✅ cPanel compatible 