# 🚀 Deploy GoClean ke Vercel dengan TiDB Cloud

Panduan lengkap untuk deploy aplikasi GoClean ke Vercel menggunakan TiDB Cloud sebagai production database dengan akses real-time.

---

## 📋 Prerequisites Checklist

Pastikan sudah complete sebelum deploy:

- [x] **TiDB Cloud Setup:**
  - Cluster sudah dibuat di https://tidbcloud.com
  - Database `goclean` sudah dibuat
  - Connection string sudah dicopy
  - IP sudah di-whitelist (0.0.0.0/0 untuk testing)
  
- [ ] **Code Ready:**
  - Code sudah di-push ke GitHub repository
  - Build local berhasil (`npm run build`)

- [ ] **Environment Variables:**
  - DATABASE_URL dari TiDB Cloud
  - NEXTAUTH_SECRET generated
  - ADMIN_SECRET_CODE (optional)

---

## 🎯 Langkah 1: Generate Environment Variables

### A. NEXTAUTH_SECRET

Generate secret key untuk authentication:

**Windows (PowerShell):**
```powershell
# Method 1: Using openssl
openssl rand -base64 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Output example:**
```
vG8rK5mP2xN9qL3hW7dF1cY4tU6sR0aZ
```

Copy dan simpan untuk nanti!

### B. DATABASE_URL

Format connection string dari TiDB Cloud:

```
mysql://[username].[root]:[password]@[host]:4000/goclean?ssl={"rejectUnauthorized":true}
```

**Example:**
```
mysql://4vK5x89y.root:MyS3cr3tP@ss@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/goclean?ssl={"rejectUnauthorized":true}
```

**Important:** Pastikan:
- Port adalah **4000** (bukan 3306!)
- Database name adalah **goclean** (bukan test!)
- SSL parameter sudah ada

### C. NEXTAUTH_URL

Untuk deploy pertama, gunakan placeholder:
```
https://your-app.vercel.app
```

**Akan diupdate setelah deploy pertama!**

### D. ADMIN_SECRET_CODE (Optional)

Code untuk register sebagai admin:
```
GOCLEAN2025
```

Atau buat custom code sendiri.

---

## 🎯 Langkah 2: Push Code ke GitHub

Jika belum push code:

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Ready for Vercel deployment with TiDB Cloud"

# Push to main branch
git push origin main
```

Verifikasi di GitHub web - pastikan semua file sudah terupload.

---

## 🎯 Langkah 3: Buat Project di Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Login ke Vercel:**
   - Buka https://vercel.com
   - Click **"Sign Up"** atau **"Login"**
   - Pilih **"Continue with GitHub"**

2. **Import Repository:**
   - Click **"Add New..."** → **"Project"**
   - Pilih repository **GoClean**
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   
   ✅ No changes needed - configuration sudah benar!

4. **Environment Variables:**
   
   Click **"Environment Variables"** section, lalu add:
   
   | **Name** | **Value** | **Environment** |
   |----------|-----------|-----------------|
   | `DATABASE_URL` | `mysql://...tidbcloud.com:4000/goclean?ssl={...}` | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | `vG8rK5mP2xN9qL3h...` | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
   | `ADMIN_SECRET_CODE` | `GOCLEAN2025` | Production, Preview, Development |

   **Pro tip:** Click **"Add"** untuk menambahkan variable baru, lalu check semua environment boxes.

5. **Deploy:**
   - Click **"Deploy"**
   - Tunggu ~2-3 menit
   - Build process akan:
     ```
     → Installing dependencies
     → Building application
     → Running prepare-production script (switch to MySQL)
     → Generating Prisma Client
     → Building Next.js
     → Deploying to Edge Network
     ```

6. **Success! 🎉**
   - Copy production URL: `https://goclean-xxx.vercel.app`

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? → No
# - Project name? → goclean
# - Add environment variables? → Yes

# Add environment variables manually
vercel env add DATABASE_URL production
# Paste TiDB connection string

vercel env add NEXTAUTH_SECRET production
# Paste generated secret

vercel env add NEXTAUTH_URL production  
# Paste Vercel URL after first deploy

vercel env add ADMIN_SECRET_CODE production
# Enter admin code
```

---

## 🎯 Langkah 4: Update NEXTAUTH_URL

**CRITICAL:** Setelah deploy pertama, update `NEXTAUTH_URL`:

1. Copy production URL: `https://goclean-xxx.vercel.app`

2. **Update di Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Find `NEXTAUTH_URL`
   - Click **"Edit"**
   - Update value ke production URL
   - Click **"Save"**

3. **Redeploy:**
   - Deployments tab → Latest deployment → **"..."** menu → **"Redeploy"**
   - Atau push dummy commit ke GitHub:
     ```bash
     git commit --allow-empty -m "Update NEXTAUTH_URL"
     git push origin main
     ```

---

## 🎯 Langkah 5: Test Real-time Database Access

### A. Test Authentication

1. **Open Production URL:**
   ```
   https://goclean-xxx.vercel.app
   ```

2. **Test Login:**
   - Click "Login"
   - Use credentials dari seeded data:
     ```
     Email: user1@goclean.id
     Password: user123
     ```

3. **Verify:**
   - Login berhasil → Database connection OK!
   - Dashboard terbuka → Authentication OK!

### B. Test Database Write

1. **Create Pickup Request:**
   - Login sebagai user
   - Navigate ke "New Pickup"
   - Fill form dan submit

2. **Verify di TiDB Cloud:**
   - Login ke https://tidbcloud.com
   - Cluster → SQL Console
   - Run query:
     ```sql
     SELECT * FROM PickupRequest ORDER BY createdAt DESC LIMIT 5;
     ```
   - Data baru harus muncul! ✅

### C. Test Real-time Monitoring

1. **TiDB Cloud Dashboard:**
   - Monitoring tab → Connections
   - Lihat active connections dari Vercel
   - Monitoring tab → Queries
   - Lihat recent queries real-time

2. **Vercel Logs:**
   - Project → Functions
   - Click any API function
   - Lihat database query logs

---

## 📊 Database Real-time Access Details

### Connection Architecture

```
User Request 
  → Vercel Serverless Function (Edge Network)
    → TiDB Cloud Cluster (AWS Singapore/Tokyo)
      → MySQL Database "goclean"
```

**Latency:**
- Vercel Edge → TiDB Cloud: ~50-100ms (Asia region)
- Query execution: ~10-50ms (simple queries)
- Total response: ~100-200ms

**Connection Pooling:**
- Prisma Client manages connection pool
- Default: 10 connections
- Vercel serverless: new connection per function invocation
- TiDB handles connection lifecycle automatically

### Real-time Capabilities

✅ **Instant Read Access:**
- Semua API routes langsung baca dari TiDB
- Data always fresh (no caching by default)

✅ **Immediate Write Access:**
- Create/Update/Delete langsung ke TiDB
- Changes visible immediately

✅ **Live Monitoring:**
- TiDB dashboard: real-time query monitoring
- Vercel logs: per-request logging

⚠️ **Limitations:**
- Vercel function timeout: 10s (Hobby plan)
- TiDB free tier: 50M RU/month
- Connection pool: 10 concurrent (free tier)

---

## 🔧 Post-Deployment Tasks

### Seed Production Data

**Option 1: Manual via Prisma Studio**
```bash
# Connect to TiDB Cloud directly
DATABASE_URL="mysql://..." npx prisma studio
```

**Option 2: Run Seed Script**
```bash
# Temporarily update .env to TiDB
DATABASE_URL="mysql://..." npm run db:seed
```

**Option 3: Import from Local**
```powershell
# Use sync script
.\sync-to-tidb.ps1
```

### Monitor Performance

1. **TiDB Cloud Dashboard:**
   - Storage: < 5GB (free tier limit)
   - RU Usage: < 50M/month
   - Slow Queries: optimize if needed

2. **Vercel Analytics:**
   - Project → Analytics
   - Monitor function execution time
   - Check error rates

### Setup Custom Domain (Optional)

1. **Vercel Dashboard:**
   - Project Settings → Domains
   - Add custom domain: `goclean.yourdomain.com`

2. **Update DNS:**
   - Add CNAME record pointing to Vercel

3. **Update NEXTAUTH_URL:**
   - Change to custom domain
   - Redeploy

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Can't reach database server"**
```
Solution:
1. Check DATABASE_URL in Vercel env vars
2. Verify TiDB cluster is "Available"
3. Test connection string locally first
4. Check firewall/IP whitelist
```

**Error: "Prisma schema invalid"**
```
Solution:
1. Verify scripts/prepare-production.js exists
2. Check package.json build command
3. View full build logs in Vercel
```

### Authentication Not Working

**Error: "NEXTAUTH_URL mismatch"**
```
Solution:
1. Update NEXTAUTH_URL to actual Vercel URL
2. Redeploy project
3. Clear browser cookies
4. Try again
```

### Database Connection Issues

**Error: "Connection timeout"**
```
Solution:
1. Add connection pooling parameters:
   ?connection_limit=10&pool_timeout=20
2. Check TiDB cluster status
3. Verify SSL parameter in connection string
```

**Error: "Too many connections"**
```
Solution:
1. Free tier limit: 10 concurrent connections
2. Reduce Prisma connection pool size
3. Consider upgrading TiDB plan
```

### Slow Performance

**Latency > 500ms:**
```
Solutions:
1. Check TiDB and Vercel regions match (both Asia)
2. Add database indexes for frequent queries
3. Optimize Prisma queries (use select/include wisely)
4. Implement caching for static data
```

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs
- **TiDB Cloud Docs:** https://docs.pingcap.com/tidbcloud
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **Next.js Deployment:** https://nextjs.org/docs/deployment

### Related Documentation

- [TIDB-MIGRATION.md](./TIDB-MIGRATION.md) - TiDB setup guide
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - General Vercel guide
- [DUAL-DATABASE-SETUP.md](./DUAL-DATABASE-SETUP.md) - Local + production setup

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] TiDB Cloud cluster created & available
- [ ] Database `goclean` created in TiDB
- [ ] Schema pushed to TiDB (`npm run db:push`)
- [ ] Test data seeded (optional)
- [ ] Code pushed to GitHub
- [ ] Environment variables prepared

### Deployment
- [ ] Vercel project created
- [ ] Environment variables set (all 4)
- [ ] Initial deployment successful
- [ ] NEXTAUTH_URL updated to production URL
- [ ] Redeployed after NEXTAUTH_URL update

### Testing
- [ ] Homepage loads successfully
- [ ] Login works with test credentials
- [ ] Can create pickup request (database write)
- [ ] Data appears in TiDB Cloud (verify)
- [ ] Admin dashboard accessible
- [ ] All features tested

### Monitoring
- [ ] TiDB Cloud dashboard reviewed
- [ ] Vercel function logs checked
- [ ] Performance acceptable (< 500ms response)
- [ ] No errors in production logs

---

## 🎉 Success!

Your GoClean app is now live on Vercel with real-time TiDB Cloud database access!

**Production URL:** `https://goclean-xxx.vercel.app`

**Next Steps:**
1. Share app dengan users
2. Monitor performance dan usage
3. Add custom domain if needed
4. Set up monitoring alerts
5. Plan for scaling when needed

**Real-time Database Access:**
- ✅ All data stored in TiDB Cloud
- ✅ Instant read/write dari Vercel functions
- ✅ Live monitoring via TiDB dashboard
- ✅ Scalable architecture ready for growth

