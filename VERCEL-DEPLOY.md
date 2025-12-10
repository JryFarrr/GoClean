[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JryFarrr/GoClean)

# 🚀 Deploy GoClean ke Vercel

## ⚡ Quick Start (5 Menit)

### 1. Setup Database PostgreSQL (Gratis)

**Pilih Neon (Recommended):**
1. Buka https://neon.tech
2. Sign up dengan GitHub
3. Create New Project → Copy **Connection String**

**Atau Supabase:**
1. Buka https://supabase.com  
2. New Project → Settings → Database → Copy **Connection String** (Transaction Mode)

---

### 2. Clone & Setup Project

```bash
# Clone repository
git clone https://github.com/JryFarrr/GoClean.git
cd GoClean/goclean

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

---

### 3. Migrate Database

**Option A: Auto Script (PowerShell)**
```powershell
.\migrate-to-postgres.ps1
```

**Option B: Manual**
```bash
# Update prisma/schema.prisma
# Change: provider = "sqlite" → provider = "postgresql"

# Run migration
npm run db:generate
npx prisma migrate dev --name init
npm run db:seed
```

---

### 4. Test Lokal

```bash
npm run build
npm start
# Buka http://localhost:3000
```

---

### 5. Deploy ke Vercel

#### Via Dashboard (Mudah):

1. Push code ke GitHub:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. Buka https://vercel.com → **New Project**

3. Import repository **GoClean**

4. **Configure Environment Variables:**
   - `DATABASE_URL`: `postgresql://...` (dari Neon/Supabase)
   - `NEXTAUTH_SECRET`: (generate dengan `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: `https://your-app.vercel.app` (ganti setelah deploy)

5. **Deploy** → Tunggu ~2 menit

6. Buka app → Copy URL → Update `NEXTAUTH_URL` di Vercel → **Redeploy**

#### Via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 🔑 Default Login

Setelah deploy & seed database:

**User:**
- Email: `user1@goclean.id`
- Password: `user123`

**TPS:**
- Email: `tps1@goclean.id`  
- Password: `tps123`

---

## 📋 Environment Variables

Wajib di-set di Vercel Dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Auth secret key | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://goclean.vercel.app` |

---

## 🐛 Troubleshooting

### Build Error: "Can't reach database"
```bash
# Cek DATABASE_URL sudah benar
# Pastikan format: postgresql://user:pass@host:5432/db?sslmode=require
```

### Error: "Prisma Client not generated"
```bash
# Add postinstall script di package.json:
"postinstall": "prisma generate"
```

### Upload File Tidak Work
```
Vercel limit: 4.5MB body size
Solusi: Gunakan Cloudinary/AWS S3 untuk production
```

### Database Connection Timeout
```env
# Tambahkan di DATABASE_URL:
?connection_limit=5&pool_timeout=20&sslmode=require
```

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Panduan lengkap
- [Deploy Checklist](./DEPLOY-CHECKLIST.md) - Quick checklist
- [Vercel Docs](https://vercel.com/docs)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## ⚠️ Important Notes

1. **SQLite tidak work di Vercel** - Harus pakai PostgreSQL
2. **File uploads** di Vercel ephemeral - Gunakan cloud storage
3. **Connection pooling** recommended untuk database
4. **NEXTAUTH_URL** harus update setelah deploy pertama
5. **Build time** max 45s, **function execution** max 10s (Hobby plan)

---

## ✅ Production Checklist

- [ ] PostgreSQL database ready (Neon/Supabase)
- [ ] `.env` configured dengan DATABASE_URL
- [ ] Prisma schema updated ke PostgreSQL
- [ ] Migration berhasil (`npx prisma migrate dev`)
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Code pushed ke GitHub
- [ ] Environment variables set di Vercel
- [ ] Deploy berhasil
- [ ] NEXTAUTH_URL updated ke production URL
- [ ] Test login & core features
- [ ] Database seeded (optional)

---

🎉 **Done! GoClean sudah live di Vercel!**

Demo: https://goclean.vercel.app (ganti dengan URL Anda)
