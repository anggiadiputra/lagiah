# Port Configuration - Lagiah Project

## Fixed Port Setup

Proyek ini telah dikonfigurasi untuk menggunakan port tetap agar tidak berubah-ubah saat development.

### Port Assignments

- **Backend API**: http://localhost:3004
- **Frontend**: http://localhost:5178

### Scripts yang Tersedia

#### Main Project (Root)
```bash
# Menjalankan dengan port tetap
npm run dev:fixed

# Menjalankan backend saja dengan port tetap
npm run dev:backend:fixed

# Menjalankan frontend saja dengan port tetap  
npm run dev:frontend:fixed
```

#### Backend Scripts
```bash
cd backend

# Port tetap 3004
npm run dev:fixed
npm run start:3004

# Port default (mungkin berubah)
npm run dev
```

#### Frontend Scripts
```bash
cd frontend

# Port tetap 5178
npm run dev:fixed

# Port default (mungkin berubah)
npm run dev
```

### Konfigurasi Files

#### Backend
- `backend/package.json`: Script dengan `--port 3004`
- `backend/next.config.ts`: Port configuration
- `backend/start-server.js`: Custom startup script

#### Frontend
- `frontend/package.json`: Script dengan `--port 5178`
- `frontend/vite.config.ts`: Server configuration dengan `strictPort: true`

### API Configuration

Frontend dikonfigurasi untuk menggunakan backend di:
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = 'http://localhost:3004/api/v1'
```

### CORS Configuration

Backend dikonfigurasi untuk menerima request dari frontend:
```typescript
// backend/src/middleware.ts
const allowedOrigins = [
  'http://localhost:5178',
  // ... other ports
]
```

### Troubleshooting

#### Jika Port Sudah Digunakan

1. **Backend (Port 3004)**:
   ```bash
   lsof -ti:3004 | xargs kill -9
   ```

2. **Frontend (Port 5178)**:
   ```bash
   lsof -ti:5178 | xargs kill -9
   ```

#### Menggunakan Port Alternatif

Jika perlu menggunakan port lain, update file berikut:

1. **Backend**: 
   - `backend/package.json`
   - `backend/next.config.ts` 
   - `backend/start-server.js`

2. **Frontend**:
   - `frontend/package.json`
   - `frontend/vite.config.ts`
   - `frontend/src/services/api.ts` (API_BASE_URL)

3. **CORS**:
   - `backend/src/middleware.ts` (allowedOrigins)

### Environment Variables

Buat file `.env.local` di backend untuk konfigurasi tambahan:
```bash
PORT=3004
HOSTNAME=localhost
DATABASE_URL="mysql://root@localhost:3306/lagiah"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3004"
```

### Recommended Usage

Untuk development yang konsisten, selalu gunakan:
```bash
npm run dev:fixed
```

Script ini akan memastikan:
- Backend selalu di port 3004
- Frontend selalu di port 5178
- CORS dikonfigurasi dengan benar
- API communication berjalan lancar 