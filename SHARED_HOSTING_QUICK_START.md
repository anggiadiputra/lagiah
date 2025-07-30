# 🚀 Shared Hosting Quick Start Guide - Lagiah

## ⚡ One-Click Deployment

### Prerequisites
- Shared hosting dengan Node.js support
- SSH access atau cPanel Terminal
- Database MySQL/MariaDB
- Domain name

### Quick Deploy (15 minutes)

```bash
# 1. Login ke shared hosting
ssh username@your-domain.com

# 2. Clone project
git clone https://github.com/your-username/lagiah.git
cd lagiah

# 3. Run automated deployment
./scripts/shared-hosting-deploy.sh

# 4. Update API keys (IMPORTANT!)
nano backend/.env.production
# Edit WHOIS_API_KEY dan WHATSAPP_API_KEY

# 5. Setup database via phpMyAdmin
# Create database: lagiah_db
# Create user: lagiah_user

# 6. Start application
./start.sh
```

## 🎯 Access Your Application

### URLs
- **Frontend**: `https://your-domain.com`
- **Backend API**: `https://your-domain.com/api`
- **Health Check**: `https://your-domain.com/api/health`

### Login Credentials
```
Email: admin@lagiah.com
Password: admin123
```

## 🔧 Essential Commands

### Application Management
```bash
# Start application
./start.sh

# Stop application
./stop.sh

# Restart application
./restart.sh

# Check application health
./health-check.sh

# Create backup
./backup.sh
```

### Process Management
```bash
# Check if PM2 is available
pm2 status

# Check if Forever is available
forever list

# Check running processes
ps aux | grep node

# Check application logs
tail -f logs/backend-error.log
tail -f logs/backend-out.log
```

### Database Management
```bash
# Access MySQL (if available)
mysql -u lagiah_user -p lagiah_db

# Backup database
mysqldump -u lagiah_user -p lagiah_db > backup.sql

# Restore database
mysql -u lagiah_user -p lagiah_db < backup.sql
```

## 📁 Project Structure

```
~/lagiah/
├── backend/          # Node.js backend
├── frontend/         # Vue.js frontend
├── public_html/      # Web root (frontend build)
├── logs/             # Application logs
├── backups/          # Backup files
├── start.sh          # Start application
├── stop.sh           # Stop application
├── restart.sh        # Restart application
├── backup.sh         # Create backup
└── health-check.sh   # Health check
```

## 🔒 Security Checklist

### Basic Security
- [ ] Update API keys in backend/.env.production
- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS
- [ ] Regular backups
- [ ] Monitor logs

### Application Security
- [ ] Secure environment variables
- [ ] Update dependencies regularly
- [ ] Monitor application health
- [ ] Check for security updates

## 📊 Monitoring

### Application Monitoring
```bash
# Check application status
curl https://your-domain.com/api/health

# Check application logs
tail -f logs/backend-error.log

# Check system resources
df -h
free -h
```

### Health Check Setup
```bash
# Setup automatic health check (if cron available)
crontab -e
# Add: */5 * * * * cd ~/lagiah && ./health-check.sh
```

## 🔄 Backup & Recovery

### Manual Backup
```bash
# Run backup script
./backup.sh

# Check backup files
ls -la backups/
```

### Auto Backup Setup
```bash
# Setup automatic backup (if cron available)
crontab -e
# Add: 0 2 * * * cd ~/lagiah && ./backup.sh
```

### Recovery
```bash
# Restore database
mysql -u lagiah_user -p lagiah_db < backups/database_YYYYMMDD_HHMMSS.sql

# Restore application files
tar -xzf backups/app_YYYYMMDD_HHMMSS.tar.gz -C ~/
```

## 🚨 Troubleshooting

### Common Issues

#### Application not starting
```bash
# Check if port is available
netstat -tulpn | grep :3004

# Check Node.js version
node --version

# Check npm version
npm --version

# Check application logs
tail -f logs/backend-error.log
```

#### Database connection failed
```bash
# Test database connection
mysql -u lagiah_user -p lagiah_db -e "SELECT 1;"

# Check database credentials
cat backend/.env.production | grep DATABASE_URL

# Check database via phpMyAdmin
```

#### Frontend not loading
```bash
# Check if frontend files exist
ls -la public_html/

# Check .htaccess file
cat public_html/.htaccess

# Check web server logs
# (Contact hosting provider for access)
```

#### Memory issues
```bash
# Check memory usage
free -h

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=256"

# Restart application with memory limit
./restart.sh
```

### Performance Issues

#### Slow loading
```bash
# Check application logs
tail -f logs/backend-error.log

# Check database performance
mysql -u lagiah_user -p lagiah_db -e "SHOW PROCESSLIST;"

# Optimize database
mysql -u lagiah_user -p lagiah_db -e "OPTIMIZE TABLE users, domains, hosting, vps, websites;"
```

#### High memory usage
```bash
# Check memory usage
free -h

# Check Node.js processes
ps aux | grep node

# Restart application
./restart.sh
```

## 📈 Scaling

### Vertical Scaling (More Resources)
```bash
# Update PM2 configuration for more memory
nano backend/ecosystem.config.js
# Change max_memory_restart to '512M'

# Restart with new config
./restart.sh
```

### Horizontal Scaling (Multiple Instances)
```bash
# Update PM2 configuration for multiple instances
nano backend/ecosystem.config.js
# Change instances: 1 to instances: 2

# Restart with new config
./restart.sh
```

## 🔄 Maintenance

### Regular Maintenance Tasks
```bash
# Weekly
./backup.sh
npm audit fix

# Monthly
# Update dependencies
cd backend && npm update
cd ../frontend && npm update

# Quarterly
# Check for security updates
npm audit
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm run build:prod

# Update frontend
cd ../frontend
npm install
npm run build:prod
cp -r dist/* ../public_html/

# Restart application
cd ..
./restart.sh
```

## 📞 Support

### Log Locations
- **Application Logs**: `~/lagiah/logs/`
- **Backend Error Log**: `~/lagiah/logs/backend-error.log`
- **Backend Output Log**: `~/lagiah/logs/backend-out.log`
- **System Logs**: Contact hosting provider

### Useful Commands
```bash
# Check application status
ps aux | grep node

# Check logs
tail -f logs/backend-error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check network connections
netstat -tulpn
```

### Emergency Commands
```bash
# Emergency restart
./restart.sh

# Emergency stop
./stop.sh

# Emergency backup
./backup.sh

# Emergency health check
./health-check.sh
```

### Contact Support
Jika mengalami masalah:
1. Check application logs: `tail -f logs/backend-error.log`
2. Check application health: `./health-check.sh`
3. Verify environment variables: `cat backend/.env.production`
4. Test database connection: `mysql -u lagiah_user -p lagiah_db -e "SELECT 1;"`
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
- ✅ Easy management scripts 