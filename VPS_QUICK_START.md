# 🚀 VPS Quick Start Guide - Lagiah

## ⚡ One-Click Deployment

### Prerequisites
- VPS dengan Ubuntu 20.04+ atau Debian 11+
- SSH access
- Minimal 1GB RAM, 20GB storage

### Quick Deploy (5 minutes)

```bash
# 1. Login ke VPS
ssh root@your-vps-ip

# 2. Clone project
git clone https://github.com/your-username/lagiah.git
cd lagiah

# 3. Run automated deployment
./scripts/vps-deploy.sh

# 4. Update API keys (IMPORTANT!)
nano .env.production
# Edit WHOIS_API_KEY dan WHATSAPP_API_KEY

# 5. Restart dengan config baru
docker-compose -f docker-compose.prod.yml restart
```

## 🎯 Access Your Application

### URLs
- **Frontend**: `http://your-vps-ip`
- **Backend API**: `http://your-vps-ip/api`
- **Health Check**: `http://your-vps-ip/api/health`

### Login Credentials
```
Email: admin@lagiah.com
Password: admin123
```

## 🔧 Essential Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:prod
```

### Backup
```bash
# Manual backup
./backup.sh

# View backup files
ls -la /var/backups/lagiah/
```

## 🔒 Security Checklist

- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Setup SSH key authentication
- [ ] Update API keys in `.env.production`
- [ ] Change default admin password
- [ ] Setup domain and SSL (optional)

## 🌐 Domain Setup (Optional)

### 1. Point Domain to VPS
```
A Record: your-domain.com → your-vps-ip
A Record: www.your-domain.com → your-vps-ip
```

### 2. Update Environment
```bash
# Edit .env.production
NEXTAUTH_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### 3. Install SSL
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📊 Monitoring

### Check System Resources
```bash
# Disk usage
df -h

# Memory usage
free -h

# Running containers
docker stats
```

### Check Application Status
```bash
# Health check
curl http://localhost/api/health

# Container status
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 Troubleshooting

### Common Issues

#### Port 80/443 already in use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process if needed
sudo kill -9 <PID>
```

#### Database connection failed
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs mysql

# Restart database
docker-compose -f docker-compose.prod.yml restart mysql
```

#### Frontend not loading
```bash
# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend
```

## 📞 Support

### Logs Location
- **Application logs**: `docker-compose -f docker-compose.prod.yml logs`
- **System logs**: `/var/log/`
- **Backup logs**: `/var/backups/lagiah/`

### Important Files
- **Environment**: `.env.production`
- **Docker Compose**: `docker-compose.prod.yml`
- **Backup Script**: `backup.sh`
- **Deployment Script**: `scripts/vps-deploy.sh`

### Get Help
1. Check logs first
2. Verify environment variables
3. Check firewall settings
4. Ensure all ports are accessible
5. Refer to `VPS_DEPLOYMENT_GUIDE.md` for detailed instructions

---

## 🎉 Success!

Your Lagiah application is now running on VPS with:
- ✅ Full-stack application
- ✅ MySQL database
- ✅ Redis caching
- ✅ Auto backup
- ✅ Monitoring & logging
- ✅ Production-ready deployment 