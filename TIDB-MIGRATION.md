# 🌐 TiDB Cloud Migration Guide

Panduan step-by-step setup TiDB Cloud untuk production database GoClean.

---

## 📊 Tentang TiDB Cloud

**TiDB Cloud** adalah MySQL-compatible distributed SQL database dengan fitur:
- ✅ **Free Tier:** 5GB storage gratis selamanya
- ✅ **MySQL Compatible:** 100% compatible dengan MySQL protocol
- ✅ **Scalable:** Auto-scaling horizontal
- ✅ **Serverless:** Pay-as-you-go (free tier tidak bayar!)
- ✅ **Fast:** Distributed SQL dengan low latency
- ✅ **Managed:** No maintenance, auto backups

Perfect untuk Vercel deployment! 🚀

---

## 🚀 Quick Setup (5-10 Menit)

### Step 1: Sign Up TiDB Cloud

1. **Buka:** https://tidbcloud.com
2. **Sign up:** Pilih **GitHub** atau **Google**
3. **Verify email:** Check inbox & klik link
4. **Complete profile:** Isi info dasar
5. **Skip credit card:** Free tier tidak perlu!

✅ Account ready!

### Step 2: Create Cluster

1. **Dashboard:** Klik "Create Cluster"

2. **Choose Plan:**
   - Pilih **"Serverless Tier"** ⭐
   - **FREE 5GB storage**
   - Best untuk small-medium apps

3. **Configure:**
   ```
   Cluster Name:  goclean-production
   Cloud Provider: AWS
   Region:        ap-southeast-1 (Singapore) 🇸🇬
                  atau ap-northeast-1 (Tokyo) 🇯🇵
   ```
   
   **Tip:** Pilih region terdekat untuk latency rendah

4. **Create:**
   - Klik "Create"
   - Tunggu ~2-3 menit
   - Status akan berubah ke "Available" 🟢

✅ Cluster created!

### Step 3: Get Connection String

1. **Connect Button:**
   - Klik cluster "goclean-production"
   - Klik tombol **"Connect"**

2. **Choose Connection Type:**
   - Pilih **"General"**
   - Select **"MySQL"** (bukan TiDB!)

3. **Copy Connection String:**
   ```
   mysql://4vKxxxxx.root:YourPassword@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test
   ```

4. **Create Database:**
   
   TiDB Cloud default database adalah `test`, kita perlu create `goclean`:
   
   **Option A: Via SQL Console (Web)**
   - Di dashboard cluster, klik "SQL Editor"
   - Run:
     ```sql
     CREATE DATABASE goclean;
     USE goclean;
     ```
   
   **Option B: Via MySQL Workbench**
   - Connect ke TiDB (lihat Step 4)
   - Run query di atas

5. **Update Connection String:**
   
   Ganti `/test` dengan `/goclean`:
   ```
   mysql://4vKxxxxx.root:YourPassword@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/goclean
   ```

✅ Connection string ready!

### Step 4: Configure Access

1. **Whitelist IP (Development):**
   - Security tab → "IP Access List"
   - Add: `0.0.0.0/0` (allow all) untuk development
   - Name: "Development Access"
   - Save

   **Production:** Tambah Vercel IP ranges (optional)

2. **Test Connection:**
   
   Using MySQL Workbench (install if needed):
   ```
   Host:     gateway01.ap-southeast-1.prod.aws.tidbcloud.com
   Port:     4000
   Username: 4vKxxxxx.root
   Password: YourPassword
   Database: goclean
   SSL:      Require (default)
   ```
   
   Click "Test Connection" → Success! ✅

### Step 5: Migrate Schema

1. **Switch to MySQL Schema:**
   ```bash
   .\switch-database.ps1 -Provider mysql
   ```

2. **Update .env Temporarily:**
   ```env
   DATABASE_URL="mysql://4vKxxxxx.root:Password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/goclean?ssl={\"rejectUnauthorized\":true}"
   ```

3. **Push Schema:**
   ```bash
   npm run db:push
   ```
   
   Output:
   ```
   ✔ All tables created successfully!
   - User
   - TPSProfile
   - PickupRequest
   - WasteItem
   - Transaction
   - Notification
   - TPSLocation
   - Kategori
   - Kecamatan
   - ObjekPoint
   - Jalan
   - Area
   - DriverLocation
   ```

4. **Verify:**
   
   Check di SQL Console atau MySQL Workbench:
   ```sql
   SHOW TABLES;
   ```

5. **Restore Local Schema:**
   ```bash
   .\switch-database.ps1 -Provider sqlserver
   ```
   
   Update .env back to SQL Server connection.

✅ Schema migrated!

### Step 6: Seed Data (Optional)

**Option 1: Seed Script**
```bash
# With MySQL schema active & TiDB connection
npm run db:seed
```

**Option 2: Manual Data Entry**
- Use Prisma Studio dengan TiDB connection
- Import dari SSMS export

**Option 3: Sync from Local**
```bash
.\sync-to-tidb.ps1
```
(Follow instructions in the script)

✅ Data ready!

---

## 🎯 Production Deployment

### Setup Vercel Environment Variables

Salin dari `ENV-PRODUCTION-TEMPLATE.txt`:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | TiDB connection string | `mysql://4vK...` |
| `NEXTAUTH_SECRET` | Random 32+ chars | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Vercel app URL | `https://goclean.vercel.app` |
| `ADMIN_SECRET_CODE` | Admin code | `GOCLEAN2025` |

**Di Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Add each variable
3. Apply to: **Production**, **Preview**, **Development**
4. Save

### Deploy

```bash
git push origin main
```

Vercel akan auto:
1. Run `npm run build`
2. Execute `scripts/prepare-production.js` (switch to MySQL)
3. Run `prisma generate`
4. Build Next.js app
5. Deploy! 🚀

---

## 🔧 Management & Monitoring

### TiDB Cloud Dashboard

**Access:** https://tidbcloud.com

**Features:**
- **SQL Console:** Query editor di browser
- **Monitoring:** CPU, memory, storage usage
- **Slow Queries:** Identify performance issues
- **Backups:** Auto backup every 6 hours
- **Scaling:** Upgrade plan jika perlu

### Metrics to Monitor

1. **Storage Usage:**
   - Free tier: 5GB
   - Check: Dashboard → Cluster → Storage
   
2. **Request Units (RU):**
   - Free tier: 50M RUs/month
   - Usually more than enough untuk small apps

3. **Connection Pool:**
   - Prisma default: 10 connections
   - Vercel serverless: each function = new connection
   - Monitor di "Connections" tab

### Backup & Restore

**Automatic Backups:**
- Every 6 hours
- Retained for 7 days (free tier)
- Access: Dashboard → Backups

**Manual Backup:**
```bash
# Via MySQL Workbench
Server → Data Export → Select goclean → Export
```

**Restore:**
```bash
# Import .sql file via MySQL Workbench
Server → Data Import → Select file → Import
```

---

## 💡 Tips & Best Practices

### Connection String

**Add SSL:**
```
?ssl={"rejectUnauthorized":true}
```

**Connection Pooling:**
```
?connection_limit=10&pool_timeout=20
```

**Full Example:**
```
mysql://user:pass@host:4000/goclean?ssl={"rejectUnauthorized":true}&connection_limit=10&pool_timeout=20
```

### Performance

1. **Indexes:**
   - Schema sudah include indexes di relations
   - Check `prisma/schema-mysql.prisma`

2. **Query Optimization:**
   - Use Prisma `select` untuk limit fields
   - Use `include` dengan bijak (avoid deep nesting)

3. **Caching:**
   - Implement Redis untuk frequently accessed data
   - Use Vercel Edge caching

### Cost Management

**Free Tier Limits:**
- 5GB storage
- 50M Request Units/month
- 10 concurrent connections

**Monitor Usage:**
```
Dashboard → Usage → Current Period
```

**Alerts:**
- Set up email alerts untuk 80% usage
- Settings → Notifications

---

## 🆘 Troubleshooting

### Can't Connect

**Check:**
1. ✅ Cluster status = "Available"
2. ✅ IP whitelisted (or allow all)
3. ✅ Correct username format: `{cluster-id}.root`
4. ✅ Password correct
5. ✅ Port 4000 (bukan 3306!)
6. ✅ SSL enabled

**Test:**
```bash
# Via MySQL CLI (if installed)
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u 4vKxxxxx.root -p goclean --ssl-mode=REQUIRED
```

### "Database does not exist"

```sql
-- Login tanpa database
mysql -h ... -P 4000 -u ... -p

-- Create database
CREATE DATABASE goclean;
USE goclean;
```

### Schema Migration Errors

**Error: "Table already exists"**
```bash
npm run db:push --force-reset
```
⚠️ WARNING: This drops all tables!

**Error: "Unknown column"**
- Check schema differences
- Run `npx prisma db pull` untuk sync

### Vercel Build Errors

**Error: "Can't reach database"**
- Verify DATABASE_URL in Vercel env
- Check connection string format
- Ensure cluster is Available

**Error: "Prisma schema invalid"**
- Check `scripts/prepare-production.js` exists
- Verify build command in package.json
- Look at Vercel build logs

### Performance Issues

**Slow Queries:**
1. Check Dashboard → Slow Queries
2. Add indexes if needed
3. Optimize Prisma queries

**Connection Errors:**
- Increase connection pool limit
- Use connection pooling (PgBouncer alternative: ProxySQL)

---

## 📚 Additional Resources

- **TiDB Docs:** https://docs.pingcap.com/tidbcloud/
- **MySQL Workbench:** https://dev.mysql.com/downloads/workbench/
- **Prisma Docs:** https://www.prisma.io/docs
- **Vercel Docs:** https://vercel.com/docs

### Related Guides

- [DUAL-DATABASE-SETUP.md](./DUAL-DATABASE-SETUP.md) - Main setup guide
- [DATA-SYNC-GUIDE.md](./DATA-SYNC-GUIDE.md) - Data synchronization
- [MYSQL-WORKBENCH-SETUP.md](./MYSQL-WORKBENCH-SETUP.md) - Database management
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Deployment guide

---

## ✅ Checklist

Setup TiDB Cloud:
- [ ] Create account di tidbcloud.com
- [ ] Create Serverless Tier cluster
- [ ] Get connection string
- [ ] Create `goclean` database
- [ ] Whitelist IP addresses
- [ ] Test connection dengan MySQL Workbench

Migration:
- [ ] Switch to MySQL schema
- [ ] Run `npm run db:push`
- [ ] Verify tables created
- [ ] Seed data (optional)
- [ ] Switch back to SQL Server schema

Vercel Deployment:
- [ ] Set DATABASE_URL in Vercel
- [ ] Set NEXTAUTH_SECRET
- [ ] Set NEXTAUTH_URL
- [ ] Set ADMIN_SECRET_CODE
- [ ] Deploy and test

---

**🎉 TiDB Cloud setup complete! Your production database is ready!**
