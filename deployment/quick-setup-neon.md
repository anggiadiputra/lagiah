# Quick Setup: Neon Database untuk Vercel

## 🚀 **Step-by-Step Guide**

### 1. **Setup Neon Account**
1. Kunjungi https://neon.tech
2. Sign up dengan GitHub account
3. Verifikasi email

### 2. **Create Project**
1. Klik **"Create Project"**
2. Pilih **"Free Tier"**
3. Pilih region terdekat (Singapore/Asia)
4. Klik **"Create Project"**

### 3. **Get Connection String**
1. Di dashboard Neon, klik **"Connection Details"**
2. Copy **Connection String**
3. Format: `postgresql://username:password@host:5432/database`

### 4. **Setup Database Schema**
```bash
# Connect ke database Neon
psql "postgresql://username:password@host:5432/database"

# Atau gunakan Prisma untuk migration
cd backend
npx prisma db push
```

### 5. **Update Vercel Environment**
1. Di Vercel dashboard, buka project backend
2. Klik **"Settings"** → **"Environment Variables"**
3. Tambahkan:
   ```env
   DATABASE_URL=postgresql://username:password@host:5432/database
   ```

## 📊 **Neon Free Tier Limits**

- **Storage**: 3 GB
- **Compute**: 0.5 CPU
- **Bandwidth**: 10 GB/month
- **Connections**: 100 concurrent
- **Projects**: 1 project

## 🔧 **Konfigurasi Prisma**

### Update `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... rest of your schema
```

### Run Migration:
```bash
cd backend
npx prisma generate
npx prisma db push
```

## 🧪 **Test Database Connection**

### Via Prisma Studio:
```bash
cd backend
npx prisma studio
```

### Via Command Line:
```bash
# Test connection
psql "postgresql://username:password@host:5432/database"

# List tables
\dt

# Exit
\q
```

## 🔍 **Troubleshooting**

### Connection Issues:
```bash
# Check if database is accessible
ping host.neon.tech

# Test with curl
curl -I https://host.neon.tech
```

### Migration Issues:
```bash
# Reset database (careful!)
npx prisma migrate reset

# Push schema without migration
npx prisma db push --force-reset
```

## 💰 **Pricing**

### Free Tier:
- ✅ 3 GB storage
- ✅ 0.5 CPU
- ✅ 10 GB bandwidth
- ✅ 100 connections
- ❌ 1 project only

### Paid Plans:
- **Pro**: $10/month
- **Scale**: $50/month

## 🔗 **Useful Links**

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)
- [Connection Pooling](https://neon.tech/docs/guides/connection-pooling)
- [Branching](https://neon.tech/docs/guides/branching)

## 🎯 **Best Practices**

1. **Use Connection Pooling** untuk production
2. **Enable Branching** untuk development
3. **Monitor Usage** di dashboard
4. **Backup Regularly** (auto-backup included)
5. **Use Environment Variables** untuk secrets

## 🔄 **Migration from Other Databases**

### From SQLite:
```bash
# Export data
sqlite3 database.db .dump > dump.sql

# Import to Neon
psql "postgresql://username:password@host:5432/database" < dump.sql
```

### From MySQL:
```bash
# Export data
mysqldump -u username -p database > dump.sql

# Convert and import
# (Use tools like pgloader for conversion)
```

## 📈 **Monitoring**

### Neon Dashboard:
- Connection count
- Query performance
- Storage usage
- Bandwidth usage

### Vercel Integration:
- Function logs
- Database queries
- Error tracking 