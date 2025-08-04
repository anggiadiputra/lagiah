# Lagiah - LiteSpeed Shared Hosting Deployment Guide

## Overview
Panduan ini khusus untuk deployment Lagiah di **LiteSpeed Shared Hosting** yang memiliki keterbatasan berbeda dengan VPS.

## Prerequisites

### LiteSpeed Shared Hosting Requirements:
- ✅ **Node.js support** (versi 16+)
- ✅ **PostgreSQL database** (atau MySQL jika tidak ada PostgreSQL)
- ✅ **SSH access** (untuk deployment)
- ✅ **File manager** atau **FTP access**
- ❌ **No root access**
- ❌ **No custom nginx configuration**
- ❌ **Limited port access**

## Deployment Strategy

### Option 1: Full Stack di Shared Hosting
- Backend: Node.js API di subdomain atau subfolder
- Frontend: Static files di root domain
- Database: PostgreSQL/MySQL dari hosting provider

### Option 2: Hybrid Deployment
- Backend: Deploy di platform terpisah (Railway, Render, Vercel)
- Frontend: Static files di shared hosting
- Database: External database service

## Step-by-Step Deployment

### 1. Persiapan File

#### Build Backend (Lokal):
```bash
cd backend
npm install
npm run build
```

#### Build Frontend (Lokal):
```bash
cd frontend
npm install
npm run build
```

### 2. Upload ke Shared Hosting

#### Via File Manager:
1. **Upload backend files** ke folder `api/` atau `backend/`
2. **Upload frontend files** ke folder `public_html/` atau `www/`
3. **Upload konfigurasi** ke root folder

#### Via FTP/SSH:
```bash
# Upload backend
scp -r backend/dist/* user@yourhosting.com:~/api/

# Upload frontend
scp -r frontend/dist/* user@yourhosting.com:~/public_html/
```

### 3. Konfigurasi Database

#### PostgreSQL (Recommended):
```sql
-- Buat database baru di cPanel
CREATE DATABASE lagiah_db;

-- Import schema (jika ada)
-- Jalankan migration manual atau import SQL
```

#### MySQL (Alternative):
```sql
-- Buat database baru
CREATE DATABASE lagiah_db;
USE lagiah_db;

-- Import schema dari Prisma
-- Convert PostgreSQL schema ke MySQL
```

### 4. Environment Configuration

#### Backend (.env):
```env
# Database (sesuaikan dengan hosting)
DATABASE_URL="postgresql://username:password@localhost:5432/lagiah_db"
# atau untuk MySQL:
# DATABASE_URL="mysql://username:password@localhost:3306/lagiah_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# App Settings
NODE_ENV="production"
PORT=3000  # Sesuaikan dengan port yang diizinkan hosting
```

#### Frontend (.env):
```env
VITE_API_BASE_URL="https://yourdomain.com/api"
VITE_APP_NAME="Lagiah"
VITE_APP_VERSION="1.0.0"
```

### 5. LiteSpeed Configuration

#### .htaccess untuk Frontend (di public_html/):
```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# SPA Routing
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
```

#### .htaccess untuk Backend (di api/):
```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Proxy to Node.js (jika menggunakan subdomain)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
```

### 6. Node.js Application Setup

#### package.json untuk Production:
```json
{
  "name": "lagiah-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### server.js (Custom server untuk shared hosting):
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

### 7. Process Management

#### PM2 (jika tersedia):
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "lagiah-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Alternative: Screen atau Forever:
```bash
# Menggunakan screen
screen -S lagiah
node server.js
# Ctrl+A+D untuk detach

# Menggunakan forever
npm install -g forever
forever start server.js
```

### 8. Domain Configuration

#### Subdomain Setup (Recommended):
- **Frontend**: `yourdomain.com` (public_html/)
- **Backend**: `api.yourdomain.com` (api/ subdomain)

#### Subfolder Setup:
- **Frontend**: `yourdomain.com` (public_html/)
- **Backend**: `yourdomain.com/api/` (api/ folder)

## Troubleshooting

### Common Issues:

#### 1. Port Issues:
```bash
# Check available ports
netstat -tulpn | grep LISTEN

# Use different port
PORT=3001 node server.js
```

#### 2. Database Connection:
```bash
# Test database connection
psql -h localhost -U username -d lagiah_db
# atau
mysql -h localhost -u username -p lagiah_db
```

#### 3. File Permissions:
```bash
# Set correct permissions
chmod 755 public_html/
chmod 644 public_html/*
chmod 755 api/
chmod 644 api/*
```

#### 4. Memory Issues:
```bash
# Increase Node.js memory
node --max-old-space-size=2048 server.js
```

### Logs dan Monitoring:

#### Check Application Logs:
```bash
# PM2 logs
pm2 logs lagiah-backend

# Direct logs
tail -f ~/logs/application.log

# Error logs
tail -f ~/logs/error.log
```

#### Health Check:
```bash
# Test backend
curl https://api.yourdomain.com/health

# Test frontend
curl https://yourdomain.com
```

## Alternative: External Backend

Jika shared hosting tidak mendukung Node.js dengan baik:

### 1. Deploy Backend di Railway/Render:
```bash
# Railway
railway login
railway init
railway up

# Render
render deploy
```

### 2. Update Frontend API URL:
```env
VITE_API_BASE_URL="https://your-backend.railway.app/api/v1"
```

### 3. Database External:
- **Railway PostgreSQL**
- **PlanetScale MySQL**
- **Supabase PostgreSQL**

## Security Considerations

### 1. Environment Variables:
- Jangan commit `.env` ke repository
- Gunakan hosting environment variables
- Rotate secrets secara berkala

### 2. CORS Configuration:
```javascript
// Backend CORS
const corsOptions = {
  origin: ['https://yourdomain.com'],
  credentials: true
}
```

### 3. Rate Limiting:
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## Maintenance

### 1. Regular Backups:
```bash
# Database backup
pg_dump lagiah_db > backup_$(date +%Y%m%d).sql

# File backup
tar -czf files_backup_$(date +%Y%m%d).tar.gz public_html/ api/
```

### 2. Updates:
```bash
# Update dependencies
npm update

# Rebuild application
npm run build

# Restart application
pm2 restart lagiah-backend
```

### 3. Monitoring:
- Setup uptime monitoring
- Monitor database performance
- Check error logs regularly

## Support

Jika mengalami masalah:
1. Check hosting provider documentation
2. Verify Node.js version compatibility
3. Test database connectivity
4. Review application logs
5. Contact hosting support jika diperlukan 