# 🚀 Panduan Deploy Lagiah ke VPS

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
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.2 Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Install Node.js (untuk build process)
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Setup Firewall
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

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/your-username/lagiah.git
cd lagiah

# Atau upload project via SCP/SFTP
```

### 2.2 Setup Environment Variables
```bash
# Copy environment template
cp env.production.example .env.production

# Edit environment variables
nano .env.production
```

### 2.3 Environment Variables yang Perlu Diisi:
```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_password_here
MYSQL_DATABASE=lagiah
MYSQL_USER=lagiah_user
MYSQL_PASSWORD=your_secure_password_here
DATABASE_URL=mysql://lagiah_user:your_secure_password_here@mysql:3306/lagiah

# NextAuth Configuration
NEXTAUTH_SECRET=your_very_long_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Redis Configuration
REDIS_URL=redis://redis:6379

# API Keys (ganti dengan API keys Anda)
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

# SSL Configuration (opsional)
SSL_CERT_PATH=/etc/letsencrypt/live/your-domain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/your-domain.com/privkey.pem
```

---

## 🐳 Step 3: Deploy dengan Docker

### 3.1 Build & Start Services
```bash
# Build dan start semua services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3.2 Run Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:prod

# Seed database (opsional)
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

### 3.3 Verify Deployment
```bash
# Check if services are running
docker ps

# Test health endpoint
curl http://localhost/api/health

# Test frontend
curl http://localhost
```

---

## 🌐 Step 4: Setup Domain & SSL (Opsional)

### 4.1 Install Nginx (jika tidak menggunakan Docker Nginx)
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/lagiah
```

### 4.2 Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.3 Enable Site & Install SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lagiah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install Certbot untuk SSL
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 Step 5: Monitoring & Maintenance

### 5.1 Setup Logs
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Setup log rotation
sudo nano /etc/logrotate.d/docker-logs
```

### 5.2 Backup Strategy
```bash
# Create backup script
nano /var/www/lagiah/backup.sh
chmod +x /var/www/lagiah/backup.sh
```

### 5.3 Backup Script Content:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/lagiah"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /var/www/lagiah/docker-compose.prod.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD lagiah > $BACKUP_DIR/database_$DATE.sql

# Backup uploads (jika ada)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/lagiah/uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 5.4 Setup Auto Backup
```bash
# Add to crontab
crontab -e

# Add line untuk backup harian jam 2 pagi
0 2 * * * /var/www/lagiah/backup.sh
```

---

## 🚀 Step 6: Update & Maintenance

### 6.1 Update Application
```bash
# Pull latest changes
cd /var/www/lagiah
git pull origin main

# Rebuild dan restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:prod
```

### 6.2 Monitor Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running containers
docker stats

# Check logs
docker-compose -f docker-compose.prod.yml logs --tail=100
```

---

## 🔧 Step 7: Troubleshooting

### 7.1 Common Issues

#### Issue: Port already in use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process if needed
sudo kill -9 <PID>
```

#### Issue: Database connection failed
```bash
# Check database container
docker-compose -f docker-compose.prod.yml logs mysql

# Restart database
docker-compose -f docker-compose.prod.yml restart mysql
```

#### Issue: Frontend not loading
```bash
# Check frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Rebuild frontend
docker-compose -f docker-compose.prod.yml build frontend
```

### 7.2 Performance Optimization
```bash
# Enable swap (jika RAM < 2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Add to /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 📊 Step 8: Security Checklist

### 8.1 Basic Security
- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Setup SSH key authentication
- [ ] Configure firewall (UFW)
- [ ] Regular system updates
- [ ] Strong passwords for all services

### 8.2 Application Security
- [ ] Use HTTPS/SSL
- [ ] Secure environment variables
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update dependencies regularly

---

## 🎯 Step 9: Access Application

### 9.1 Default Credentials
```
Email: admin@lagiah.com
Password: admin123
```

### 9.2 URLs
- **Frontend**: http://your-vps-ip atau https://your-domain.com
- **Backend API**: http://your-vps-ip/api atau https://your-domain.com/api
- **Health Check**: http://your-vps-ip/api/health

---

## 📞 Support

Jika mengalami masalah:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check firewall settings
4. Ensure all ports are accessible

---

## 🎉 Success!

Setelah mengikuti panduan ini, aplikasi Lagiah akan berjalan di VPS Anda dengan:
- ✅ Full-stack application (Frontend + Backend)
- ✅ MySQL database
- ✅ Redis caching
- ✅ SSL/HTTPS (jika setup domain)
- ✅ Auto backup
- ✅ Monitoring & logging
- ✅ Production-ready deployment 