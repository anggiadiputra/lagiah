## Overview
This document outlines the requirements for a headless web application that will be deployed on Shared Hosting/VPS and utilize MySQL/MariaDB as its database.

**Initial Target Scale:** 100 concurrent users (scalable to 10,000+)

## MVP Implementation Roadmap (100 Users)

### Week 1-2: Foundation Setup
- [ ] Setup VPS with Ubuntu/Debian
- [ ] Install Nginx, MySQL/MariaDB, Redis, Node.js
- [ ] Initialize Next.js and Vue 3 projects
- [ ] Setup basic authentication with NextAuth.js
- [ ] Create database schema with Prisma

### Week 3-4: Core Features
- [ ] Implement Domain Management CRUD
- [ ] Implement Hosting Management CRUD
- [ ] Basic dashboard with statistics
- [ ] User profile management
- [ ] Simple caching with Redis

### Week 5-6: Integration & Testing
- [ ] Integrate Whois API
- [ ] Add basic monitoring
- [ ] Setup PM2 for process management
- [ ] Basic load testing with K6
- [ ] Deploy to production VPS

### Post-MVP: Enhancements
- [ ] Add VPS management
- [ ] Implement notification system
- [ ] Add more detailed analytics
- [ ] Improve UI/UX based on feedback
- [ ] Prepare for scaling to 500+ users

## Architecture Overview

### Phase 1: Simple Architecture (100 Users)
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Users     │────▶│    Nginx     │────▶│   Next.js   │
│ (Browser)   │     │ (Web Server) │     │   Backend   │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                          ┌─────┴─────┐
                                          ▼           ▼
                                    ┌──────────┐ ┌──────────┐
                                    │  MySQL/  │ │  Redis   │
                                    │ MariaDB  │ │  Cache   │
                                    └──────────┘ └──────────┘
```

### Future Architecture (1,000-10,000+ Users)
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   CDN       │────▶│ Load Balancer│────▶│ Web Servers │
│ (Cloudflare)│     │   (Nginx)    │     │ (Multiple)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
                                                ▼
                            ┌─────────────────────────────┐
                            │      API Gateway            │
                            │    (Rate Limiting)          │
                            └─────────────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
            ┌──────────────┐                      ┌──────────────┐
            │   Next.js    │                      │    Redis     │
            │   Backend    │◀────────────────────▶│    Cache     │
            └──────────────┘                      └──────────────┘
                    │                                       │
                    ▼                                       ▼
            ┌──────────────┐                      ┌──────────────┐
            │MySQL/MariaDB │                      │  Queue System │
            │  (Primary)   │                      │ (Bull/Redis) │
            └──────────────┘                      └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │MySQL/MariaDB │
            │  (Replica)   │
            └──────────────┘
```

## Features
### 1. Dashboard
- Display statistics for active domains and hosting, including expiration dates.
- Show the number of websites based on CMS and real-time user or staff activity.
- **Performance Requirements (Phase 1 - 100 Users):**
  - Simple caching for dashboard data (5 minutes)
  - Standard pagination for lists
- **Future Performance Requirements (1000+ Users):**
  - Real-time updates via WebSocket/Server-Sent Events
  - Lazy loading for large datasets
  - Virtual scrolling for lists > 100 items

### 2. Domain Management
- **CRUD Operations:**
  - Create, Read, Update, Delete domains using the Whois API https://get.indexof.id/api/whois?domain={domain} .
- **Relationships:**
  - Connect domains with relevant hosting or VPS.
- **Performance Optimizations:**
  - Whois API results cached for 24 hours
  - Background job for domain expiry checks
  - Pagination with limit 50 items per page

### 3. Hosting Management
- **CRUD Operations:**
  - Create, Read, Update, Delete hosting accounts.
- **Relationships:**
  - Connect hosting accounts with domains.
- **Performance Features:**
  - Batch operations for multiple hosting accounts
  - Async processing for resource-intensive operations

### 4. VPS Management
- **CRUD Operations:**
  - Create, Read, Update, Delete VPS data.
- **Relationships:**
  - Connect VPS accounts with domains.
- **Performance Features:**
  - Resource monitoring with 1-minute cache
  - Historical data aggregation for reports

### 5. Website Management
- **CRUD Operations:**
  - Create, Read, Update, Delete website data.
- **Additional Features:**
  - Website health monitoring
  - Uptime tracking with 99.9% SLA
  - SSL certificate expiry monitoring

### 6. Staff Management
- **CRUD Operations:**
  - Create, Read, Update, Delete staff members with different roles.
- **Role-Based Access Control (RBAC):**
  - Super Admin: Full system access
  - Admin: Management features
  - Staff: Limited operational access
  - Viewer: Read-only access

### 7. Settings
- Manage API token and notification retention settings.
- System configuration management
- Feature flags for gradual rollouts
- Maintenance mode controls

### 8. User Profile Management
- Options to change user details.
- Two-factor authentication (2FA)
- Session management
- Activity logs

### 9. Notification System
- Email notifications via queue
- In-app notifications
- Push notifications (optional)
- Notification preferences per user

## Technical Specifications

### Phase 1: MVP for 100 Users

#### Frontend
- **Framework:** Vue 3 with Composition API
- **State Management:** Pinia (lightweight)
- **UI Library:** Tailwind CSS + Headless UI
- **Build Tool:** Vite
- **HTTP Client:** Axios

#### Backend
- **Framework:** Next.js 14+ (App Router)
- **API:** RESTful
- **Authentication:** NextAuth.js with JWT
- **ORM:** Prisma
- **Validation:** Zod
- **API Documentation:** Swagger/OpenAPI

#### Infrastructure
- **Deployment:** Single VPS (4 vCPU, 8GB RAM)
- **Web Server:** Nginx
- **Process Manager:** PM2
- **Database:** MySQL/MariaDB (single instance)
- **Caching:** Redis (single instance)
- **File Storage:** Local storage

### Phase 2: Scale to 1,000+ Users

#### Additional Components
- **UI Library:** Upgrade to Vuetify 3 or PrimeVue
- **Real-time:** Add Socket.io for live updates
- **API:** Add GraphQL support (optional)
- **Database:** Add read replica
- **Queue System:** Bull (Redis-based)
- **CDN:** Cloudflare for static assets
- **Load Balancer:** Nginx load balancing
- **Monitoring:** Add APM tools

### Performance Optimization

#### Phase 1: Basic Optimization (100 Users)
```sql
-- Essential indexes only
CREATE INDEX idx_domains_expiry ON domains(expiry_date);
CREATE INDEX idx_domains_user ON domains(user_id);
CREATE INDEX idx_hosting_domain ON hosting(domain_id);
```

##### Simple Caching Strategy
- Session storage in Redis (24 hours TTL)
- Basic API response caching (5-30 minutes)
- Browser caching headers

#### Phase 2: Advanced Optimization (1000+ Users)
```sql
-- Additional performance indexes
CREATE INDEX idx_domains_user_status ON domains(user_id, status);
CREATE INDEX idx_websites_status ON websites(status, updated_at);

-- Table partitioning for logs
ALTER TABLE activity_logs 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);
```

##### Advanced Caching Strategy
- Multi-layer Redis caching
- Database query result caching
- CDN for static assets
- Edge caching with Cloudflare

#### API Rate Limiting

##### Phase 1: Basic Rate Limiting (100 Users)
```javascript
// Simple rate limit configuration
const rateLimits = {
  general: { window: '15m', max: 200 },      // 200 requests per 15 minutes
  auth: { window: '15m', max: 10 },          // 10 auth attempts per 15 minutes
  whois: { window: '1h', max: 50 }           // 50 whois queries per hour
};
```

##### Phase 2: Advanced Rate Limiting (1000+ Users)
```javascript
// Stricter rate limits with user tiers
const rateLimits = {
  general: { window: '15m', max: 100 },      // 100 requests per 15 minutes
  auth: { window: '15m', max: 5 },           // 5 auth attempts per 15 minutes
  api: { window: '1m', max: 60 },            // 60 API calls per minute
  whois: { window: '1h', max: 100 }          // 100 whois queries per hour
};
```

### Security Measures

#### Authentication & Authorization
- JWT tokens with refresh token rotation
- Session invalidation on security events
- IP-based access control for admin panel
- Brute force protection

#### Data Security
- Encryption at rest for sensitive data
- HTTPS/TLS 1.3 mandatory
- SQL injection prevention via parameterized queries
- XSS protection with Content Security Policy
- CORS configuration for API endpoints

#### Compliance
- GDPR compliance for user data
- Data retention policies
- Audit logging for all critical operations
- Regular security audits

### Monitoring & Logging

#### Application Monitoring
- **APM:** New Relic or DataDog
- **Error Tracking:** Sentry
- **Uptime Monitoring:** UptimeRobot or Pingdom
- **Log Management:** ELK Stack or Graylog

#### Metrics to Track
- Response time (target: < 200ms for API)
- Database query performance
- Cache hit ratio (target: > 80%)
- Queue processing time
- Error rate (target: < 0.1%)
- Concurrent user sessions

### Scalability Plan

#### Current Phase: MVP (0-100 users)
- Single VPS deployment
- Basic Redis caching
- Simple monitoring
- Manual deployment

#### Phase 1: Growth (100-500 users)
- Upgrade VPS resources
- Implement queue system
- Add basic monitoring
- Semi-automated deployment

#### Phase 2: Scale (500-1,000 users)
- Add load balancer
- Database read replica
- CDN integration
- Full CI/CD pipeline

#### Phase 3: Enterprise (1,000-10,000+ users)
- Multiple app servers with auto-scaling
- Database sharding
- Microservices architecture
- Full observability stack

### Deployment & DevOps

#### MVP Deployment (100 Users)
```bash
# Simple deployment script
#!/bin/bash
npm run build
pm2 stop app
pm2 start ecosystem.config.js
pm2 save
```

##### Basic Backup Strategy
- **Database:** Daily backups (7-day retention)
- **Files:** Weekly manual backups
- **Configuration:** Git repository

#### Future CI/CD Pipeline (100+ Users)
```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    steps:
      - Test
      - Build
      - Deploy to VPS
      - Health check
```

##### Advanced Backup Strategy
- **Database:** Automated hourly backups (30-day retention)
- **Files:** Daily incremental backups
- **Disaster Recovery:** RTO < 1 hour, RPO < 15 minutes

### API Design Guidelines

#### RESTful Endpoints
```
GET    /api/v1/domains?page=1&limit=50&sort=expiry_date
POST   /api/v1/domains
GET    /api/v1/domains/:id
PUT    /api/v1/domains/:id
DELETE /api/v1/domains/:id

GET    /api/v1/hosting?include=domains&filter[status]=active
POST   /api/v1/hosting
GET    /api/v1/hosting/:id
PUT    /api/v1/hosting/:id
DELETE /api/v1/hosting/:id
```

#### Response Format
```json
{
  "status": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "pages": 20
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Testing Strategy

#### MVP Testing (100 Users)
- **Unit Tests:** Core business logic (50% coverage)
- **Integration Tests:** Critical API endpoints
- **Manual Testing:** User acceptance testing
- **Basic Load Test:** Simulate 100 concurrent users

```javascript
// Simple K6 load test for MVP
export let options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp up to 50 users
    { duration: '5m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
  },
};
```

#### Future Testing Requirements (100+ Users)
- **Unit Tests:** 80% coverage minimum
- **Integration Tests:** All API endpoints
- **E2E Tests:** Cypress/Playwright
- **Performance Tests:** Regular load testing
- **Security Tests:** OWASP Top 10 compliance

## Design & UX Considerations
- Clean, modern, and intuitive interface.
- Responsive design for both desktop and mobile.
- Consistent visual design using a component library.
- Clear navigation for quick information access.
- **Performance UX:**
  - Skeleton screens during loading
  - Optimistic UI updates
  - Progressive Web App (PWA) capabilities
  - Offline functionality for critical features
  - Lazy loading for images and components

## Performance SLA

### MVP Target Metrics (100 Users)
- **Page Load Time:** < 3 seconds
- **API Response Time:** < 500ms average
- **Uptime:** 99.5% (3.6 hours downtime/month)
- **Concurrent Users:** 100
- **Database Queries:** < 100ms average
- **Monthly Budget:** < $100

### Resource Requirements

#### MVP Phase (100 Users)
- **Single VPS:** 4 vCPU, 8GB RAM
- **Database:** MySQL/MariaDB on same server
- **Redis:** 1GB allocated
- **Storage:** 80GB SSD
- **Bandwidth:** 1TB/month
- **Estimated Cost:** $40-60/month

#### Growth Phase (500 Users)
- **VPS Upgrade:** 8 vCPU, 16GB RAM
- **Database:** Dedicated instance (4 vCPU, 8GB RAM)
- **Redis:** Dedicated instance (2GB)
- **Storage:** 200GB SSD
- **Bandwidth:** 3TB/month
- **Estimated Cost:** $150-200/month

#### Scale Phase (1000+ Users)
- **App Servers:** 2 × (4 vCPU, 8GB RAM)
- **Database:** Primary + Replica (8 vCPU, 16GB RAM each)
- **Redis:** Dedicated cluster
- **Load Balancer:** Nginx
- **Storage:** 500GB SSD
- **Bandwidth:** 5TB/month
- **Estimated Cost:** $500-800/month 