# Lagiah - Deployment Guide

## Overview
Aplikasi Lagiah terdiri dari:
- **Backend**: Next.js API server
- **Frontend**: Vue.js SPA
- **Database**: PostgreSQL dengan Prisma ORM

## Deployment Options

### 1. VPS Deployment (Recommended)
- Full control
- Custom domain support
- SSL certificate
- Database management

### 2. Shared Hosting Deployment
- Limited control
- Basic domain support
- Shared database

### 3. Cloud Platform Deployment
- Heroku, Vercel, Railway
- Easy deployment
- Managed services

## Prerequisites

### For VPS:
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (for process management)
- SSL certificate (Let's Encrypt)

### For Shared Hosting:
- Node.js support
- PostgreSQL database
- File upload capability

## Environment Variables

### Backend (.env.production)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lagiah_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# WhatsApp API (optional)
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_API_KEY="your-whatsapp-api-key"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# App Settings
NODE_ENV="production"
PORT=3004
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL="https://yourdomain.com/api/v1"
VITE_APP_NAME="Lagiah"
VITE_APP_VERSION="1.0.0"
```

## Quick Deployment Steps

### 1. Prepare Files
```bash
# Build backend
cd backend
npm install
npm run build

# Build frontend
cd ../frontend
npm install
npm run build
```

### 2. Upload to Server
```bash
# Upload files to your hosting
scp -r deployment/ user@your-server:/var/www/lagiah/
```

### 3. Setup Database
```bash
# Run migrations
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Start Services
```bash
# Start backend
pm2 start ecosystem.config.js

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/lagiah
sudo ln -s /etc/nginx/sites-available/lagiah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## File Structure for Deployment

```
deployment/
├── backend/
│   ├── .next/           # Built Next.js files
│   ├── node_modules/    # Dependencies
│   ├── prisma/         # Database schema
│   ├── package.json
│   └── ecosystem.config.js
├── frontend/
│   ├── dist/           # Built Vue.js files
│   └── nginx.conf      # Frontend nginx config
├── nginx.conf          # Main nginx config
├── docker-compose.yml  # Docker deployment (optional)
└── scripts/
    ├── deploy.sh       # Deployment script
    └── setup.sh        # Initial setup script
```

## SSL Certificate Setup

### Using Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Monitoring & Maintenance

### PM2 Commands:
```bash
# View logs
pm2 logs lagiah-backend

# Restart services
pm2 restart lagiah-backend

# Monitor processes
pm2 monit
```

### Database Backup:
```bash
# Create backup
pg_dump lagiah_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql lagiah_db < backup_file.sql
```

## Troubleshooting

### Common Issues:
1. **Port already in use**: Check if another service is using port 3004
2. **Database connection failed**: Verify DATABASE_URL and PostgreSQL service
3. **Build errors**: Check Node.js version and dependencies
4. **SSL issues**: Verify certificate installation and nginx configuration

### Log Locations:
- Backend logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Support
For deployment issues, check:
1. Server requirements
2. Environment variables
3. Database connectivity
4. Network configuration
5. SSL certificate status 