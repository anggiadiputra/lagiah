#!/bin/bash

# Lagiah Quick Start Script for Production
# This script sets up the entire production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Generate secure passwords
generate_passwords() {
    log_info "Generating secure passwords..."
    
    # Generate random passwords
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
    MYSQL_USER_PASSWORD=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 24)
    
    log_success "Passwords generated successfully"
}

# Setup environment file
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ -f ".env.production" ]; then
        log_warning "Production environment file already exists. Backing up..."
        cp .env.production .env.production.backup
    fi
    
    # Create production environment file
    cat > .env.production << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=lagiah_prod
MYSQL_USER=lagiah_user
MYSQL_PASSWORD=$MYSQL_USER_PASSWORD
DATABASE_URL=mysql://lagiah_user:$MYSQL_USER_PASSWORD@mysql:3306/lagiah_prod

# NextAuth Configuration
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://yourdomain.com

# Redis Configuration
REDIS_URL=redis://redis:6379

# API Configuration
WHOIS_API_URL=https://api.whois.com
WHOIS_API_KEY=your-whois-api-key

# WhatsApp API (optional)
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_KEY=your-whatsapp-api-key

# Security
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Logging
LOG_LEVEL=info
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF
    
    log_success "Environment file created: .env.production"
    log_warning "Please update the domain names and API keys in .env.production"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p backups
    mkdir -p logs
    mkdir -p nginx/ssl
    
    log_success "Directories created successfully"
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."
    
    # Build services
    docker-compose -f docker-compose.prod.yml build
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for MySQL
    log_info "Waiting for MySQL..."
    timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost --silent; do sleep 2; done'
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    timeout 30 bash -c 'until docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping; do sleep 2; done'
    
    # Wait for backend
    log_info "Waiting for backend..."
    timeout 60 bash -c 'until curl -f http://localhost:3004/api/health; do sleep 5; done'
    
    log_success "All services are ready"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
    docker-compose -f docker-compose.prod.yml exec -T backend npx prisma generate
    
    log_success "Database migrations completed"
}

# Create initial admin user
create_admin_user() {
    log_info "Creating initial admin user..."
    
    # This would typically be done through the application
    # For now, we'll just show instructions
    log_info "Please create an admin user through the application interface"
    log_info "Default credentials: admin@lagiah.com / admin123"
}

# Display final information
show_final_info() {
    log_success "🎉 Lagiah production setup completed successfully!"
    echo
    echo "📋 Next Steps:"
    echo "1. Update domain names in .env.production"
    echo "2. Configure SSL certificates"
    echo "3. Set up monitoring and logging"
    echo "4. Create admin user through the application"
    echo
    echo "🌐 Access URLs:"
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:3004"
    echo "Health Check: http://localhost:3004/api/health"
    echo
    echo "📁 Important Files:"
    echo "Environment: .env.production"
    echo "Logs: ./logs/"
    echo "Backups: ./backups/"
    echo
    echo "🔧 Useful Commands:"
    echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "Stop services: docker-compose -f docker-compose.prod.yml down"
    echo
    log_warning "⚠️  Remember to secure your production environment!"
}

# Main execution
main() {
    echo "🚀 Lagiah Production Quick Start"
    echo "================================"
    echo
    
    check_docker
    generate_passwords
    setup_environment
    create_directories
    deploy_services
    wait_for_services
    run_migrations
    create_admin_user
    show_final_info
}

# Run main function
main "$@" 