# Lagiah Production Deployment Guide

## 🚀 Overview

This guide covers the complete production deployment setup for the Lagiah application, including CI/CD pipeline, Docker containers, and monitoring.

## 📋 Prerequisites

- Docker & Docker Compose installed
- Git repository access
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Server with minimum 2GB RAM, 2 CPU cores

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Frontend      │    │   Backend API   │
│   (Port 80/443) │    │   (Vue.js)      │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   MySQL DB      │    │   Redis Cache   │
                    │   (Port 3306)   │    │   (Port 6379)   │
                    └─────────────────┘    └─────────────────┘
```

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/lagiah.git
cd lagiah
```

### 2. Configure Environment Variables
```bash
# Copy production environment template
cp env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 3. Required Environment Variables
```bash
# Database
MYSQL_ROOT_PASSWORD=your-secure-password
MYSQL_DATABASE=lagiah_prod
DATABASE_URL=mysql://user:password@mysql:3306/lagiah_prod

# Authentication
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Redis
REDIS_URL=redis://redis:6379

# API Keys
WHOIS_API_KEY=your-whois-api-key
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-char-encryption-key
```

## 🐳 Docker Deployment

### 1. Build and Start Services
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 2. Run Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
```

### 3. Health Checks
```bash
# Check frontend
curl http://localhost/health

# Check backend
curl http://localhost:3004/api/health

# Check database
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically runs on:
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Testing and validation

### Pipeline Stages

1. **Backend Testing**
   - Lint code
   - Type checking
   - Build verification
   - Database migration testing

2. **Frontend Testing**
   - Lint code
   - Type checking
   - Build verification

3. **Integration Testing**
   - API endpoint testing
   - Frontend-backend integration
   - Health checks

4. **Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Database backup before deployment
   - Health checks after deployment

## 📊 Monitoring & Logging

### 1. Application Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 2. Database Monitoring
```bash
# Check database size
docker-compose -f docker-compose.prod.yml exec mysql mysql -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'lagiah_prod';"

# Check slow queries
docker-compose -f docker-compose.prod.yml exec mysql mysql -e "SHOW VARIABLES LIKE 'slow_query_log';"
```

### 3. Performance Monitoring
```bash
# Check container resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup
```bash
# Generate SSL certificates (Let's Encrypt)
certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### 2. Firewall Configuration
```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. Database Security
```bash
# Create dedicated database user
docker-compose -f docker-compose.prod.yml exec mysql mysql -e "
CREATE USER 'lagiah_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON lagiah_prod.* TO 'lagiah_user'@'%';
FLUSH PRIVILEGES;
"
```

## 💾 Backup Strategy

### 1. Automated Backups
```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p lagiah_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup (cron job)
0 2 * * * cd /path/to/lagiah && ./scripts/backup.sh
```

### 2. Backup Script
```bash
#!/bin/bash
# scripts/backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD lagiah_prod > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 30 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +31 | xargs -r rm
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3004
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping
   
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs mysql
   ```

3. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart services
   docker-compose -f docker-compose.prod.yml restart
   ```

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_domains_expires_at ON domains(expiresAt);
   CREATE INDEX idx_hosting_expires_at ON hosting(expiresAt);
   CREATE INDEX idx_vps_expires_at ON vps(expiresAt);
   ```

2. **Redis Caching**
   ```bash
   # Check Redis memory usage
   docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory
   
   # Clear cache if needed
   docker-compose -f docker-compose.prod.yml exec redis redis-cli flushall
   ```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balancer configuration
# Add nginx load balancer configuration
```

### Vertical Scaling
```bash
# Increase container resources
# Edit docker-compose.prod.yml to add resource limits
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## 🔄 Updates & Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Deploy with zero downtime
./scripts/deploy.sh production
```

### 2. Database Updates
```bash
# Create migration
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate dev --name update_name

# Deploy migration
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 3. Security Updates
```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with security updates
docker-compose -f docker-compose.prod.yml build --no-cache
```

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment variables
3. Check health endpoints
4. Review this documentation

## 📝 Maintenance Checklist

- [ ] Daily: Check application logs
- [ ] Weekly: Review backup integrity
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Annually: Performance review 