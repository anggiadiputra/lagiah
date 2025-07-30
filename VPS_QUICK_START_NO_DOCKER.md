# 🚀 VPS Quick Start Guide - Lagiah (No Docker)

## ⚡ One-Click Deployment

### Prerequisites
- VPS dengan Ubuntu 20.04+ atau Debian 11+
- SSH access
- Minimal 1GB RAM, 20GB storage

### Quick Deploy (10 minutes)

```bash
# 1. Login ke VPS
ssh root@your-vps-ip

# 2. Clone project
mkdir -p /var/www
cd /var/www
git clone https://github.com/your-username/lagiah.git
cd lagiah

# 3. Run automated deployment
./scripts/vps-deploy-no-docker.sh

# 4. Update API keys (IMPORTANT!)
nano backend/.env.production
# Edit WHOIS_API_KEY dan WHATSAPP_API_KEY

# 5. Restart dengan config baru
pm2 restart lagiah-backend
```

## 🎯 Access Your Application

### URLs
- **Frontend**: `http://your-vps-ip`
- **Backend API**: `http://your-vps-ip/api`
- **Health Check**: `http://your-vps-ip/health`

### Login Credentials
```
Email: admin@lagiah.com
Password: admin123
```

## 🔧 Essential Commands

### Process Management
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart backend
pm2 restart lagiah-backend

# Stop all processes
pm2 stop all

# Start all processes
pm2 start all
```

### Service Management
```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status redis-server

# Restart services
sudo systemctl restart nginx
sudo systemctl restart mysql
sudo systemctl restart redis-server

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mysql/error.log
sudo journalctl -u redis-server -f
```

### Database Management
```bash
# Access MySQL
mysql -u lagiah_user -p lagiah

# Backup database
mysqldump -u lagiah_user -p lagiah > backup.sql

# Restore database
mysql -u lagiah_user -p lagiah < backup.sql
```

### Application Updates
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

## 🔒 Security Checklist

### Basic Security
- [ ] Change default SSH port
- [ ] Disable root login
- [ ] Setup SSH key authentication
- [ ] Configure firewall (UFW)
- [ ] Regular system updates
- [ ] Strong passwords for all services

### Application Security
- [ ] Use HTTPS/SSL
- [ ] Secure environment variables
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Update dependencies regularly

## 📊 Monitoring

### Resource Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check network connections
netstat -tulpn
```

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check application health
curl http://localhost/health

# Check API status
curl http://localhost/api/health
```

## 🔄 Backup & Recovery

### Manual Backup
```bash
# Run backup script
cd /var/www/lagiah
./backup.sh
```

### Auto Backup
```bash
# Check cron jobs
crontab -l

# Manual backup location
ls -la /var/backups/lagiah/
```

### Recovery
```bash
# Restore database
mysql -u lagiah_user -p lagiah < /var/backups/lagiah/database_YYYYMMDD_HHMMSS.sql

# Restore application files
tar -xzf /var/backups/lagiah/app_YYYYMMDD_HHMMSS.tar.gz -C /
```

## 🚨 Troubleshooting

### Common Issues

#### Backend not responding
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs lagiah-backend

# Restart backend
pm2 restart lagiah-backend

# Check port usage
sudo netstat -tulpn | grep :3004
```

#### Frontend not loading
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

#### Database connection failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Restart MySQL
sudo systemctl restart mysql

# Test connection
mysql -u lagiah_user -p -e "SELECT 1;"
```

#### Redis not working
```bash
# Check Redis status
sudo systemctl status redis-server

# Test Redis
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
free -h

# Check PM2 memory usage
pm2 status

# Restart PM2 processes
pm2 restart all
```

#### High CPU Usage
```bash
# Check CPU usage
top

# Check process list
ps aux --sort=-%cpu | head -10

# Check PM2 processes
pm2 monit
```

#### Slow Database
```bash
# Check MySQL status
mysql -u lagiah_user -p -e "SHOW PROCESSLIST;"

# Check slow queries
sudo tail -f /var/log/mysql/slow.log

# Optimize MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

## 📈 Scaling

### Vertical Scaling (More Resources)
```bash
# Increase PM2 instances
pm2 scale lagiah-backend 2

# Update PM2 config
nano ecosystem.config.js
# Change instances: 1 to instances: 2
pm2 reload ecosystem.config.js
```

### Horizontal Scaling (Load Balancer)
```bash
# Setup load balancer with Nginx
sudo nano /etc/nginx/sites-available/lagiah

# Add upstream configuration
upstream backend {
    server 127.0.0.1:3004;
    server 127.0.0.1:3005;
    server 127.0.0.1:3006;
}

# Update proxy_pass
location /api {
    proxy_pass http://backend;
    # ... other configs
}
```

## 🔄 Maintenance

### Regular Maintenance Tasks
```bash
# Weekly
sudo apt update && sudo apt upgrade -y
pm2 restart all
./backup.sh

# Monthly
npm audit fix
sudo certbot renew
sudo logrotate -f /etc/logrotate.conf

# Quarterly
sudo apt autoremove -y
sudo apt autoclean
```

### Update Dependencies
```bash
# Update Node.js dependencies
cd backend && npm update
cd ../frontend && npm update

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update PM2
sudo npm update -g pm2
```

## 📞 Support

### Log Locations
- **PM2 Logs**: `pm2 logs`
- **Nginx Logs**: `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`
- **System Logs**: `journalctl -u service-name`

### Useful Commands
```bash
# Check all services
sudo systemctl status nginx mysql redis-server

# Check PM2 processes
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check network
netstat -tulpn

# Check firewall
sudo ufw status
```

### Emergency Commands
```bash
# Emergency restart
pm2 restart all
sudo systemctl restart nginx mysql redis-server

# Emergency stop
pm2 stop all
sudo systemctl stop nginx

# Emergency backup
./backup.sh
```

---

## 🎉 Success!

Setelah mengikuti panduan ini, aplikasi Lagiah akan berjalan di VPS Anda dengan:
- ✅ Full-stack application (Frontend + Backend)
- ✅ MySQL database
- ✅ Redis caching
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Auto backup
- ✅ Monitoring & logging
- ✅ Production-ready deployment
- ✅ No Docker required 