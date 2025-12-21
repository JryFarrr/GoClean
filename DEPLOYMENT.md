# 🚀 Panduan Deploy GoClean ke Vercel

## ⚠️ Persiapan Penting

Project ini menggunakan **SQLite** yang **TIDAK COMPATIBLE** dengan Vercel (serverless). Anda harus migrate ke **PostgreSQL** terlebih dahulu.

---

## 📋 Step-by-Step Deployment

### 1️⃣ Setup Database PostgreSQL

Pilih salah satu provider PostgreSQL gratis:

#### Option A: Neon (Recommended - Free Tier)
1. Buka https://neon.tech
2. Sign up dengan GitHub
3. Buat project baru
4. Copy **Connection String** (format: `postgresql://user:pass@host/db`)

#### Option B: Supabase
1. Buka https://supabase.com
2. Sign up dan buat project baru
3. Di Settings > Database, copy **Connection String** (Transaction Mode)

#### Option C: Railway
1. Buka https://railway.app
2. Sign up dan buat project PostgreSQL
3. Copy **DATABASE_URL**

---

### 2️⃣ Update Prisma Schema

Edit file `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Ganti dari "sqlite"
  url      = env("DATABASE_URL")
}
```

**Hapus baris ini jika ada:**
```prisma
relationMode = "prisma"
```

---

### 3️⃣ Update package.json Scripts

Tambahkan script build untuk Vercel:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

---

### 4️⃣ Setup Environment Variables Lokal

1. Buat file `.env` di root folder:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"
NEXTAUTH_SECRET="generate-dengan-command-di-bawah"
NEXTAUTH_URL="http://localhost:3000"
```

2. Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Atau di PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### 5️⃣ Migrate Database

Jalankan command berikut di terminal:

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npx prisma migrate dev --name init

# Seed database (optional)
npm run db:seed
```

---

### 6️⃣ Test Build Lokal

```bash
npm run build
npm start
```

Pastikan tidak ada error!

---

### 7️⃣ Push ke GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

### 8️⃣ Deploy ke Vercel

#### Via Vercel Dashboard (Recommended):

1. Buka https://vercel.com
2. Sign up/Login dengan GitHub
3. Klik **"Add New Project"**
4. Import repository **GoClean**
5. Configure Project:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

6. **Environment Variables** - Tambahkan:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-app-name.vercel.app
```

7. Klik **Deploy**

#### Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

---

### 9️⃣ Setup Migrations di Vercel

Setelah deploy pertama:

1. Install Vercel CLI
2. Run migration:

```bash
vercel env pull .env.production
DATABASE_URL="..." npx prisma migrate deploy
```

Atau via Vercel Dashboard > Settings > Environment Variables.

---

### 🔟 Post-Deployment

1. **Seed Database** (jika perlu):
```bash
# Set env variable di terminal
$env:DATABASE_URL="your-production-db-url"
npm run db:seed
```

2. **Test aplikasi**:
   - Login sebagai User: `user1@goclean.id` / `user123`
   - Login sebagai TPS: `tps1@goclean.id` / `tps123`

3. **Update NEXTAUTH_URL**:
   - Di Vercel Environment Variables
   - Ganti ke URL production: `https://your-app.vercel.app`
   - Redeploy

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
- Cek DATABASE_URL sudah benar
- Pastikan IP Vercel di-whitelist (jika pakai firewall)
- Gunakan connection pooling: `?pgbouncer=true`

### Error: "Prisma Client not generated"
- Tambahkan `postinstall` script: `"postinstall": "prisma generate"`
- Atau ubah build command: `prisma generate && next build`

### Error: "NEXTAUTH_SECRET is not set"
- Tambahkan di Vercel Environment Variables
- Generate baru dengan `openssl rand -base64 32`

### Upload file tidak work
- Vercel ada limit 4.5MB untuk body request
- Pertimbangkan pakai cloud storage (Cloudinary, AWS S3, dll)

### Database connection timeout
- Gunakan connection pooling
- Tambahkan di DATABASE_URL: `?connection_limit=5&pool_timeout=20`

---

## 📝 Catatan Penting

1. **SQLite tidak support di Vercel** - HARUS pakai PostgreSQL/MySQL
2. **File upload** akan hilang saat redeploy (gunakan cloud storage untuk production)
3. **Environment variables** harus di-set di Vercel Dashboard
4. **Build time** limit 45 detik (Hobby plan)
5. **Function execution** limit 10 detik (Hobby plan)

---

## 🔗 Resources

- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Neon (PostgreSQL): https://neon.tech
- Next.js Deployment: https://nextjs.org/docs/deployment

---

## ✅ Checklist Deploy

- [ ] Database PostgreSQL sudah ready
- [ ] Prisma schema updated ke PostgreSQL
- [ ] Environment variables di-setup
- [ ] Migration sudah jalan
- [ ] Build lokal berhasil
- [ ] Code di-push ke GitHub
- [ ] Project di-import ke Vercel
- [ ] Environment variables di Vercel sudah di-set
- [ ] Deploy berhasil
- [ ] Test login dan fitur utama
- [ ] Database di-seed (optional)

---

🎉 **Selamat! Aplikasi GoClean sudah live di Vercel!**
