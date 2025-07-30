# 🚀 Lagiah - Domain Management System

A comprehensive full-stack web application for managing domains, hosting, VPS, and websites with advanced features including Whois integration, WhatsApp notifications, and role-based access control.

## 🌟 Features

### 🔐 Authentication & Authorization
- **NextAuth.js** with JWT tokens
- **Role-based access control** (Admin, Staff, Viewer, Finance)
- **Secure password management** with bcrypt
- **Session management** with HTTP-only cookies

### 🏠 Domain Management
- **Whois API integration** for real-time domain information
- **Expiration tracking** with visual indicators
- **Domain status monitoring** (Active, Expired, Pending)
- **Bulk domain operations**
- **Domain assignment** to hosting/VPS

### 🖥️ Hosting Management
- **Hosting provider management**
- **Plan and resource tracking**
- **cPanel URL management**
- **Credential encryption**
- **Expiration monitoring**

### 💻 VPS Management
- **VPS provider tracking**
- **Resource allocation monitoring**
- **SSH credential management**
- **Performance metrics**
- **Cost tracking**

### 🌐 Website Management
- **CMS tracking** (WordPress, Joomla, etc.)
- **Website status monitoring**
- **Credential management**
- **Notes and documentation**

### 📊 Dashboard & Analytics
- **Real-time statistics**
- **Expiration alerts**
- **Activity logs**
- **Performance metrics**
- **Financial tracking**

### 🔔 Notifications
- **WhatsApp integration** for alerts
- **Email notifications**
- **Expiration reminders**
- **Status change alerts**

## 🛠️ Tech Stack

### Frontend
- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Vue Router** for navigation
- **Headless UI** for components
- **Axios** for API communication

### Backend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **MySQL/MariaDB** database
- **Redis** for caching
- **NextAuth.js** for authentication
- **Zod** for validation
- **JWT** for token management

### DevOps & Deployment
- **Docker** containerization
- **Docker Compose** for orchestration
- **GitHub Actions** for CI/CD
- **Nginx** reverse proxy
- **PM2** process management
- **SSL/HTTPS** support

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MySQL** 8.0+ or **MariaDB** 10.5+
- **Redis** (optional, for caching)
- **Git**

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/lagiah.git
cd lagiah
```

### 2. Setup Environment
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Setup Database
```bash
# Navigate to backend
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed
```

### 5. Start Development Servers
```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:5178
- **Backend API**: http://localhost:3004
- **Default Login**: admin@lagiah.com / admin123

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **domains** - Domain management and Whois data
- **hosting** - Hosting account management
- **vps** - VPS server management
- **websites** - Website tracking and management
- **activity_logs** - System activity tracking
- **settings** - Application configuration

### Relationships
- Users can manage multiple domains, hosting, VPS, and websites
- Domains can be assigned to hosting or VPS
- All activities are logged for audit trails

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/lagiah"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3004"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# API Keys
WHOIS_API_URL="https://api.whois.com/v1"
WHOIS_API_KEY="your-whois-api-key"
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_API_KEY="your-whatsapp-api-key"

# Security
JWT_SECRET="your-jwt-secret"
ENCRYPTION_KEY="your-32-char-encryption-key"
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL="http://localhost:3004/api"
VITE_API_VERSION="v1"
VITE_APP_NAME="Lagiah"
VITE_APP_ENVIRONMENT="development"
```

## 🚀 Deployment

### VPS Deployment
```bash
# Run automated deployment script
./scripts/vps-deploy.sh
```

### Shared Hosting (cPanel)
```bash
# Run shared hosting deployment script
./scripts/shared-hosting-deploy.sh
```

### Docker Deployment
```bash
# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

- [VPS Deployment Guide](VPS_DEPLOYMENT_GUIDE.md)
- [Shared Hosting Deployment](SHARED_HOSTING_DEPLOYMENT.md)
- [cPanel Node.js Deployment](CPANEL_NODEJS_DEPLOYMENT.md)
- [Docker Deployment](DEPLOYMENT.md)

## 🔒 Security Features

- **JWT token authentication**
- **Role-based access control**
- **Password encryption** with bcrypt
- **API rate limiting**
- **CORS protection**
- **SQL injection prevention**
- **XSS protection**
- **CSRF protection**

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout

### Domains
- `GET /api/v1/domains` - List domains
- `POST /api/v1/domains` - Create domain
- `GET /api/v1/domains/:id` - Get domain details
- `PUT /api/v1/domains/:id` - Update domain
- `DELETE /api/v1/domains/:id` - Delete domain
- `POST /api/v1/domains/whois` - Whois lookup

### Hosting
- `GET /api/v1/hosting` - List hosting accounts
- `POST /api/v1/hosting` - Create hosting account
- `GET /api/v1/hosting/:id` - Get hosting details
- `PUT /api/v1/hosting/:id` - Update hosting
- `DELETE /api/v1/hosting/:id` - Delete hosting

### VPS
- `GET /api/v1/vps` - List VPS servers
- `POST /api/v1/vps` - Create VPS
- `GET /api/v1/vps/:id` - Get VPS details
- `PUT /api/v1/vps/:id` - Update VPS
- `DELETE /api/v1/vps/:id` - Delete VPS

### Websites
- `GET /api/v1/websites` - List websites
- `POST /api/v1/websites` - Create website
- `GET /api/v1/websites/:id` - Get website details
- `PUT /api/v1/websites/:id` - Update website
- `DELETE /api/v1/websites/:id` - Delete website

### Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/activity` - Get recent activity
- `GET /api/v1/dashboard/expiring-domains` - Get expiring domains
- `GET /api/v1/dashboard/expiring-hosting` - Get expiring hosting
- `GET /api/v1/dashboard/expiring-vps` - Get expiring VPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/your-username/lagiah/issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- **NextAuth.js** for authentication
- **Prisma** for database operations
- **Tailwind CSS** for styling
- **Vue.js** for frontend framework
- **Next.js** for backend framework

---

**Made with ❤️ by the Lagiah Team** 