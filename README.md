# Domain & Hosting Management System

A comprehensive headless web application for managing domains, hosting accounts, and VPS infrastructure designed for digital agencies and hosting resellers.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL/MariaDB 10.6+
- Redis 7+
- npm 9+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lagiah-domain-hosting-management
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Setup environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend  
cp frontend/.env.example frontend/.env
```

4. **Setup database**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**
```bash
npm run dev
```

## 📁 Project Structure

```
lagiah/
├── backend/          # Next.js 14 API (TypeScript)
│   ├── src/
│   │   ├── app/      # App Router
│   │   ├── lib/      # Utilities & Config
│   │   └── types/    # TypeScript Definitions
│   ├── prisma/       # Database Schema & Migrations
│   └── package.json
├── frontend/         # Vue 3 Application (TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/   # Pinia State Management
│   │   └── types/
│   └── package.json
├── docs/            # Documentation
├── scripts/         # Build & Deployment Scripts
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL/MariaDB with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Caching**: Redis
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Styling**: Tailwind CSS + Headless UI
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Testing**: Vitest + Vue Testing Library

## 📊 Features

### MVP (100 Users)
- ✅ Authentication & Authorization (RBAC)
- ✅ Dashboard with expiration alerts
- ✅ Domain Management (CRUD + Whois API)
- ✅ Hosting Management (CRUD + credentials)
- ✅ User Profile Management
- ✅ Basic reporting & export

### Phase 1 (500 Users)
- 🔄 VPS Management
- 🔄 Website Management  
- 🔄 Notification System
- 🔄 Advanced Search & Filters
- 🔄 Bulk Operations

### Phase 2 (1000+ Users)
- 🔄 RESTful API for integrations
- 🔄 Automation workflows
- 🔄 Client Portal
- 🔄 Mobile responsiveness
- 🔄 Advanced analytics

## 🚦 Development Commands

```bash
# Development
npm run dev                 # Start both backend & frontend
npm run dev:backend        # Start backend only
npm run dev:frontend       # Start frontend only

# Building
npm run build              # Build both projects
npm run build:backend      # Build backend only
npm run build:frontend     # Build frontend only

# Testing
npm run test               # Run all tests
npm run lint               # Lint all projects

# Database
cd backend
npx prisma studio          # Database GUI
npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed database
```

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/lagiah"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
WHOIS_API_URL="https://get.indexof.id/api/whois"
```

### Frontend (.env)
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_APP_NAME="Domain Management System"
```

## 🏗️ Architecture

### MVP Architecture (100 Users)
```
Frontend (Vue 3) ←→ Backend (Next.js) ←→ Database (MySQL)
                          ↓
                     Cache (Redis)
```

### Scalable Architecture (1000+ Users)
```
CDN → Load Balancer → App Servers → Database Cluster
                         ↓
                    Redis Cluster
```

## 📈 Performance Targets

### MVP (100 Users)
- Page Load Time: < 3 seconds
- API Response: < 500ms average
- Uptime: 99.5%
- Budget: < $100/month

### Scale (1000+ Users)  
- Page Load Time: < 2 seconds
- API Response: < 200ms (95th percentile)
- Uptime: 99.9%
- Concurrent Users: 1000+

## 🔒 Security

- HTTPS/TLS 1.3 mandatory
- JWT with secure HTTP-only cookies
- Role-based access control (Admin/Staff/Viewer)
- Input validation with Zod
- API rate limiting
- Credential encryption
- Activity audit logs

## 📚 API Documentation

API documentation is available at `/api/docs` when running the development server.

### Authentication
```bash
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
```

### Domains
```bash
GET    /api/v1/domains?page=1&limit=50
POST   /api/v1/domains
GET    /api/v1/domains/:id
PUT    /api/v1/domains/:id
DELETE /api/v1/domains/:id
```

### Hosting
```bash
GET    /api/v1/hosting?page=1&limit=50
POST   /api/v1/hosting
GET    /api/v1/hosting/:id
PUT    /api/v1/hosting/:id
DELETE /api/v1/hosting/:id
```

## 🚀 Deployment

### Development
- Local development with hot reload
- MySQL/Redis on localhost
- Manual deployment scripts

### Production
- VPS deployment with PM2
- Nginx reverse proxy
- SSL certificates (Let's Encrypt)
- Daily automated backups

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@lagiah.com

---

**Status**: 🚧 In Development | **Version**: 1.0.0 MVP | **Target**: Q1 2025 