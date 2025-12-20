# SQL Server Setup Guide untuk GoClean

## 🎯 Pilihan Database SQL Server

### Option 1: Azure SQL Database (Recommended untuk Production)

#### Free Tier:
- **Azure SQL Database Free Offer**: 32 GB storage, 100 DTU
- **Serverless**: Pay per use, auto-pause saat idle

#### Setup Steps:

1. **Buat Azure Account** (Gratis $200 credit):
   - https://azure.microsoft.com/free

2. **Create SQL Database**:
   ```
   Portal → Create Resource → SQL Database
   - Database name: goclean
   - Server: Create new server
   - Region: Southeast Asia / East Asia (terdekat)
   - Compute + Storage: Basic (5 DTU) atau Serverless
   - Authentication: SQL authentication
   ```

3. **Configure Firewall**:
   ```
   SQL Server → Networking → Firewall rules
   - Add: "Allow Azure services" = ON
   - Add your IP address
   ```

4. **Get Connection String**:
   ```
   Database → Connection strings → ADO.NET
   ```

5. **Format untuk Prisma**:
   ```env
   DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=goclean;user=sqladmin;password=YourPass123!;encrypt=true"
   ```

---

### Option 2: Local SQL Server Express (Untuk Development)

#### Install SQL Server Express (Gratis):

1. **Download**:
   - https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - Pilih **Express Edition**

2. **Install**:
   - Basic Installation
   - Enable TCP/IP di SQL Server Configuration Manager
   - Set SA password

3. **Enable TCP/IP**:
   ```
   SQL Server Configuration Manager
   → SQL Server Network Configuration
   → Protocols for SQLEXPRESS
   → TCP/IP → Enable
   → Restart SQL Server service
   ```

4. **Create Database**:
   ```sql
   -- Buka SSMS (SQL Server Management Studio)
   -- Or use command line
   sqlcmd -S localhost\SQLEXPRESS -Q "CREATE DATABASE goclean"
   ```

5. **Connection String**:
   ```env
   # Named instance
   DATABASE_URL="sqlserver://localhost\SQLEXPRESS;database=goclean;user=sa;password=YourPass123!;encrypt=true;trustServerCertificate=true"
   
   # Default instance (port 1433)
   DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPass123!;encrypt=true;trustServerCertificate=true"
   ```

---

### Option 3: Docker SQL Server (Easiest untuk Dev)

```bash
# Pull SQL Server image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# Run container
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPass123!" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest

# Create database
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourPass123! -Q "CREATE DATABASE goclean"
```

**Connection String**:
```env
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPass123!;encrypt=true;trustServerCertificate=true"
```

---

## 🔧 Setup Project untuk SQL Server

### 1. Update .env

```env
# SQL Server Connection
DATABASE_URL="sqlserver://server:1433;database=goclean;user=admin;password=Pass123!;encrypt=true"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-from-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 3. Run Migration Script

```powershell
# Auto migration
.\migrate-to-sqlserver.ps1
```

Atau manual:
```bash
npm run db:generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Test

```bash
npm run dev
# Buka http://localhost:3000

# Or check database
npm run db:studio
```

---

## 📝 Connection String Format

### Local SQL Server:
```env
# Named instance (SQLEXPRESS)
DATABASE_URL="sqlserver://localhost\SQLEXPRESS;database=goclean;user=sa;password=Pass123!;encrypt=true;trustServerCertificate=true"

# Default instance
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=Pass123!;encrypt=true;trustServerCertificate=true"

# Windows Authentication (not recommended for Next.js)
DATABASE_URL="sqlserver://localhost;database=goclean;integratedSecurity=true;trustServerCertificate=true"
```

### Azure SQL Database:
```env
DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=goclean;user=sqladmin;password=Pass123!;encrypt=true"

# With connection pooling (production)
DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=goclean;user=sqladmin;password=Pass123!;encrypt=true;connectionLimit=5"
```

---

## 🚀 Deploy dengan SQL Server

### Vercel + Azure SQL:

1. **Setup Azure SQL** (lihat Option 1 di atas)

2. **Environment Variables di Vercel**:
   ```env
   DATABASE_URL=sqlserver://yourserver.database.windows.net:1433;database=goclean;user=admin;password=Pass!;encrypt=true
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Azure App Service + Azure SQL:

1. **Create App Service** (Node.js)
2. **Link to Azure SQL** (same region untuk latency rendah)
3. **Set App Settings** (sama seperti env vars)
4. **Deploy via GitHub Actions** atau Azure CLI

---

## 🔍 Troubleshooting

### Error: "Login failed for user"
```
- Cek username/password benar
- Cek SQL Server Authentication enabled (bukan Windows Auth only)
- Cek firewall rules (Azure SQL)
```

### Error: "Cannot connect to server"
```
- Cek SQL Server service running
- Cek TCP/IP enabled
- Cek port 1433 terbuka
- Cek connection string format benar
```

### Error: "Database does not exist"
```sql
-- Create database manually
sqlcmd -S server -U user -P pass -Q "CREATE DATABASE goclean"
```

### Error: "SSL/TLS connection failed"
```env
# Add trustServerCertificate for local dev
DATABASE_URL="...;trustServerCertificate=true"

# For Azure, ensure encrypt=true
DATABASE_URL="...;encrypt=true"
```

---

## ⚡ Performance Tips

### 1. Connection Pooling:
```env
DATABASE_URL="...;connectionLimit=10;connectTimeout=30"
```

### 2. Index Optimization (Prisma):
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  
  @@index([email])
}
```

### 3. Azure SQL Serverless:
- Auto-pause saat idle (hemat biaya)
- Auto-scale compute
- Perfect untuk development/staging

---

## 💰 Cost Comparison

| Option | Monthly Cost | Best For |
|--------|--------------|----------|
| Local Express | **FREE** | Development |
| Docker SQL Server | **FREE** | Development |
| Azure SQL Basic | **~$5** | Small apps |
| Azure SQL Serverless | **Pay per use** | Dev/Staging |
| Azure SQL Free | **FREE** | Testing (limited) |

---

## ✅ Checklist Migration ke SQL Server

- [ ] Install SQL Server atau setup Azure SQL
- [ ] Create database `goclean`
- [ ] Update `.env` dengan SQL Server connection string
- [ ] Update `prisma/schema.prisma` provider ke "sqlserver"
- [ ] Run `npm run db:generate`
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Seed database: `npm run db:seed`
- [ ] Test: `npm run dev`
- [ ] Check Prisma Studio: `npm run db:studio`
- [ ] Deploy (optional)

---

## 📚 Resources

- Prisma SQL Server Docs: https://www.prisma.io/docs/concepts/database-connectors/sql-server
- Azure SQL: https://azure.microsoft.com/en-us/products/azure-sql/database/
- SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
- Docker SQL Server: https://hub.docker.com/_/microsoft-mssql-server

---

Butuh bantuan setup? Tanya aja! 🚀
