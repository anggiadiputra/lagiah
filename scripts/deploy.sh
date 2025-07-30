#!/bin/bash

# Production Deployment Script for Lagiah
# Usage: ./scripts/deploy.sh [staging|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
check_environment() {
    if [ ! -f ".env.production" ]; then
        log_error "Production environment file (.env.production) not found!"
        log_info "Please copy env.production.example to .env.production and configure it."
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p $BACKUP_DIR
    mkdir -p $LOG_DIR
    mkdir -p nginx/ssl
}

# Database backup
backup_database() {
    log_info "Creating database backup..."
    if docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > "$BACKUP_DIR/backup_$TIMESTAMP.sql"; then
        log_success "Database backup created: backup_$TIMESTAMP.sql"
    else
        log_warning "Database backup failed, continuing with deployment..."
    fi
}

# Pull latest changes
pull_changes() {
    log_info "Pulling latest changes from git..."
    git pull origin main
}

# Build and deploy
deploy() {
    log_info "Starting deployment to $ENVIRONMENT..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Build new images
    log_info "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
    
    # Health check
    log_info "Performing health checks..."
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
    
    if curl -f http://localhost:3004/api/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
}

# Cleanup old backups
cleanup_backups() {
    log_info "Cleaning up old backups (keeping last 10)..."
    ls -t $BACKUP_DIR/backup_*.sql | tail -n +11 | xargs -r rm
}

# Main deployment process
main() {
    log_info "Starting Lagiah deployment to $ENVIRONMENT environment..."
    
    # Check environment
    check_environment
    
    # Create directories
    create_directories
    
    # Backup database
    backup_database
    
    # Pull changes
    pull_changes
    
    # Deploy
    deploy
    
    # Cleanup
    cleanup_backups
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    log_info "Frontend: http://localhost"
    log_info "Backend API: http://localhost:3004"
    log_info "Backup location: $BACKUP_DIR"
}

# Run main function
main "$@" 