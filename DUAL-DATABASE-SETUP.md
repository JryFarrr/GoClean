# 🔄 Dual Database Setup Guide

Panduan lengkap untuk menjalankan **SQL Server lokal** untuk development dan **TiDB Cloud (MySQL)** untuk production deployment.

---

## 📋 Overview

### Konsep Dual Database

```
🏠 LOCAL DEVELOPMENT          ☁️ PRODUCTION
┌─────────────────┐          ┌──────────────────┐
│  SQL Server     │          │   TiDB Cloud     │
│  (SSMS)         │  ←sync→  │   (MySQL)        │
│  Development    │          │   Vercel Deploy  │
└─────────────────┘          └──────────────────┘
```

**Keuntungan:**
- ✅ Development tetap cepat dengan SQL Server lokal
- ✅ Production mendapat benefit TiDB Cloud (free, scalable)
- ✅ Bisa test production data di lokal
- ✅ Tetap pakai SSMS yang sudah familiar

---

## 🚀 Quick Start

### 1. Setup Awal (Sudah Siap!)

File yang sudah dibuat:
- ✅ `prisma/schema.prisma` - SQL Server (untuk lokal)
- ✅ `prisma/schema-mysql.prisma` - MySQL (untuk production)
- ✅ `switch-database.ps1` - Switch schema
- ✅ `sync-to-tidb.ps1` - Sync ke cloud
- ✅ `sync-from-tidb.ps1` - Pull dari cloud
- ✅ `ENV-PRODUCTION-TEMPLATE.txt` - Config template

### 2. Development Workflow (Lokal)

```bash
# Normal development - tidak ada perubahan!
npm run dev

# Database management
npm run db:push
npm run db:studio
```

**Tetap pakai SQL Server dan SSMS seperti biasa!** 🎉

### 3. Deploy ke Production

#### A. Setup TiDB Cloud (Sekali Saja)

1. **Sign up di TiDB Cloud:**
   - Buka https://tidbcloud.com
   - Sign up dengan GitHub/Google (GRATIS!)
   
2. **Create Cluster:**
   - Klik "Create Cluster"
   - Pilih **"Serverless Tier"** (FREE 5GB forever)
   - Pilih region: **Singapore** atau **Tokyo** (terdekat)
   - Cluster name: `goclean-production`
   - Klik "Create"
   - Tunggu 2-3 menit

3. **Get Connection String:**
   - Klik cluster yang baru dibuat
   - Klik "Connect"
   - Copy **Connection String** (format MySQL)
   - Contoh:
     ```
     mysql://4vKxxxxx.root:YourPassword@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/goclean
     ```

4. **Whitelist IP (Optional):**
   - Security → IP Access
   - Add `0.0.0.0/0` untuk development (allow all)
   - Atau add IP specific untuk production

#### B. Initial Data Sync

**Option 1: Menggunakan Seed Script (Recommended)**

```bash
# 1. Switch ke MySQL schema
.\switch-database.ps1 -Provider mysql

# 2. Update .env temporarily (atau create .env.cloud)
# DATABASE_URL="mysql://[your-tidb-connection-string]"

# 3. Push schema ke TiDB Cloud
npm run db:push

# 4. Seed initial data
npm run db:seed

# 5. Switch back to SQL Server
.\switch-database.ps1 -Provider sqlserver
```

**Option 2: Manual Sync dengan Tools**

Lihat [DATA-SYNC-GUIDE.md](./DATA-SYNC-GUIDE.md) untuk detail.

#### C. Deploy ke Vercel

1. **Push code ke GitHub:**
   ```bash
   git add .
   git commit -m "Add dual database support"
   git push origin main
   ```

2. **Create Vercel Project:**
   - Buka https://vercel.com
   - Klik "New Project"
   - Import repository GoClean
   
3. **Set Environment Variables di Vercel:**
   
   Salin dari `ENV-PRODUCTION-TEMPLATE.txt`:
   
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | `mysql://[your-tidb-connection]` |
   | `NEXTAUTH_SECRET` | `[generate-with-openssl]` |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` |
   | `ADMIN_SECRET_CODE` | `GOCLEAN2025` |

4. **Deploy:**
   - Klik "Deploy"
   - Tunggu ~2 menit
   - Vercel akan otomatis menjalankan `npm run build`
   - Build script akan switch ke MySQL schema otomatis!

5. **Update NEXTAUTH_URL:**
   - Setelah deploy, copy production URL
   - Update `NEXTAUTH_URL` di Vercel Environment Variables
   - Redeploy (Settings → Redeploy)

---

## 🔧 Daily Workflow

### Development (Lokal)

```bash
# 1. Normal development
npm run dev

# 2. Database changes
npm run db:push          # Push schema changes
npm run db:studio        # Visual database editor

# 3. Seeding data
npm run db:seed
```

**Database:** SQL Server lokal  
**Tools:** SSMS, Prisma Studio  
**No changes needed!**

### Deploy ke Production

```bash
# 1. Test build locally (optional)
npm run build:local      # Build tanpa schema switch
npm run build            # Build dengan schema switch (test)

# 2. Push ke GitHub
git add .
git commit -m "Your changes"
git push origin main

# 3. Vercel akan auto-deploy!
```

**Database:** TiDB Cloud (MySQL)  
**Auto schema switch:** ✅

### Sync Production Data ke Lokal

```bash
# Untuk testing dengan production data
.\sync-from-tidb.ps1
```

---

## 🎯 Common Tasks

### Test Production Database Locally

```bash
# 1. Switch to MySQL schema
.\switch-database.ps1 -Provider mysql

# 2. Update .env temporarily
# DATABASE_URL="mysql://[tidb-connection]"

# 3. Test your app
npm run dev

# 4. Switch back
.\switch-database.ps1 -Provider sqlserver
# DATABASE_URL="sqlserver://localhost:1433;..."
```

### Manual Schema Switch

```bash
# Switch to MySQL
npm run schema:switch-mysql

# Switch back to SQL Server
npm run schema:restore-sqlserver
```

### View TiDB Cloud Data

**Option 1: MySQL Workbench**
- Download: https://dev.mysql.com/downloads/workbench/
- Connect dengan TiDB connection string
- Query dan manage data

**Option 2: DBeaver (Universal)**
- Download: https://dbeaver.io/
- Support SQL Server DAN MySQL
- Bisa sync data antar database!

**Option 3: TiDB Cloud Console**
- Built-in di dashboard TiDB Cloud
- SQL editor di browser
- Basic query dan view data

---

## ⚠️ Important Notes

### Schema Differences

| Feature | SQL Server | MySQL/TiDB |
|---------|-----------|------------|
| String | `NVARCHAR` | `VARCHAR` |
| Text | `NVARCHAR(MAX)` | `TEXT` |
| Boolean | `BIT` | `BOOLEAN` |
| DateTime | `DATETIME2` | `DATETIME(3)` |

Prisma akan handle conversion otomatis! ✅

### Build Process

```
npm run build
  ↓
scripts/prepare-production.js
  ↓
Backup schema.prisma → schema-sqlserver.backup.prisma
  ↓
Copy schema-mysql.prisma → schema.prisma
  ↓
prisma generate (dengan MySQL)
  ↓
next build
  ↓
Deploy ke Vercel ✅
```

Setelah deploy, restore lokal:
```bash
npm run schema:restore-sqlserver
```

---

## 🆘 Troubleshooting

### Error: "Can't reach database"

**Lokal:**
- Cek SQL Server running
- Verify .env `DATABASE_URL`
- Test connection di SSMS

**Production:**
- Cek TiDB cluster status
- Verify connection string
- Check IP whitelist

### Error: "Prisma schema invalid"

```bash
# Verify current schema
cat prisma/schema.prisma | grep provider

# If wrong, switch manually
.\switch-database.ps1 -Provider sqlserver  # atau mysql
```

### Build Error di Vercel

1. Check Vercel build logs
2. Verify environment variables set
3. Ensure `scripts/prepare-production.js` exists
4. Check DATABASE_URL format (must be MySQL)

### Data Sync Issues

Lihat [DATA-SYNC-GUIDE.md](./DATA-SYNC-GUIDE.md)

---

## 📚 Related Documentation

- [TIDB-MIGRATION.md](./TIDB-MIGRATION.md) - Setup TiDB Cloud detail
- [DATA-SYNC-GUIDE.md](./DATA-SYNC-GUIDE.md) - Sync data strategies
- [MYSQL-WORKBENCH-SETUP.md](./MYSQL-WORKBENCH-SETUP.md) - Alternative to SSMS
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Deployment guide

---

## ✅ Quick Reference

### File Locations

```
goclean/
├── prisma/
│   ├── schema.prisma          # 👈 SQL Server (auto-managed)
│   ├── schema-mysql.prisma    # 👈 MySQL template
│   └── schema-sqlserver.prisma # (backup, auto-created)
├── scripts/
│   ├── prepare-production.js  # Build script
│   └── restore-dev-schema.js  # Restore script
├── switch-database.ps1        # Manual switch
├── sync-to-tidb.ps1          # Sync to cloud
├── sync-from-tidb.ps1        # Pull from cloud
└── ENV-PRODUCTION-TEMPLATE.txt # Config template
```

### Commands Cheat Sheet

```bash
# Development
npm run dev                        # Start dev server
npm run db:push                    # Update database
npm run db:studio                  # Open Prisma Studio

# Database Switch
.\switch-database.ps1 -Provider mysql       # Test MySQL locally
.\switch-database.ps1 -Provider sqlserver   # Back to normal

# Deployment
git push origin main              # Auto-deploy to Vercel
npm run build                     # Test production build

# Data Sync
.\sync-to-tidb.ps1               # Push data to cloud
.\sync-from-tidb.ps1             # Pull data from cloud
```

---

**🎉 Happy coding! Development tetap pakai SQL Server + SSMS, production otomatis ke TiDB Cloud!**
