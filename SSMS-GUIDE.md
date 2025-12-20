# 🔧 Cara Menggunakan SQL Server Management Studio (SSMS)

## 📥 STEP 1: DOWNLOAD & INSTALL SSMS

### Download
1. **Download Link**: https://aka.ms/ssmsfullsetup
2. **File**: SSMS-Setup-ENU.exe (~600 MB)
3. **Version**: SSMS 20.x (Latest)

### Install
1. **Run** SSMS-Setup-ENU.exe
2. Click **Install**
3. Wait **5-10 minutes** for installation
4. Click **Close** when done
5. **Restart** computer jika diminta (optional tapi recommended)

---

## 🔌 STEP 2: CONNECT KE SQL SERVER

### Connection Details untuk GoClean Database:

| Setting | Value |
|---------|-------|
| **Server type** | Database Engine |
| **Server name** | `localhost` atau `localhost\MSSQLSERVER01` |
| **Authentication** | Windows Authentication |
| **Login** | (otomatis dari Windows user) |
| **Database** | goclean |

### Cara Connect:

1. **Buka SSMS** (SQL Server Management Studio)
   - Cari di Start Menu: "SQL Server Management Studio"
   - Atau icon SSMS di desktop

2. **Connect to Server Dialog** akan muncul otomatis
   ```
   Server type: Database Engine
   Server name: localhost
   Authentication: Windows Authentication
   ```

3. **Click "Connect"**

4. **Setelah connect**, di Object Explorer:
   ```
   localhost
   └── Databases
       └── goclean ← Database kita!
   ```

---

## 📊 STEP 3: EXPLORE DATABASE GOCLEAN

### A. Lihat Semua Tabel

1. **Expand** tree di Object Explorer:
   ```
   localhost
   └── Databases
       └── goclean
           └── Tables
               ├── dbo.Notification
               ├── dbo.PickupRequest
               ├── dbo.TPSProfile
               ├── dbo.Transaction
               ├── dbo.User
               ├── dbo.WasteItem
               └── dbo.WastePrice
   ```

2. **Right-click** pada tabel → **Select Top 1000 Rows**
   - Akan menampilkan data dalam tabel

### B. Lihat Struktur Tabel

**Right-click** pada tabel → **Design**
- Lihat kolom, tipe data, primary key, foreign key
- Visual designer untuk edit struktur

### C. Lihat Relationships

**Right-click** pada tabel → **View Dependencies**
- Lihat relasi dengan tabel lain
- FK constraints

Atau:

**Database Diagrams:**
1. Right-click **Database Diagrams** → **New Database Diagram**
2. Select tables: User, PickupRequest, Transaction, dll
3. Click **Add** → **OK**
4. Akan muncul **visual ER diagram**!

---

## 💻 STEP 4: RUNNING QUERIES

### Cara 1: Via Query Window

1. Click **New Query** button (atau Ctrl+N)
2. Pastikan database **goclean** selected (dropdown di toolbar)
3. Ketik query, contoh:

```sql
-- Lihat semua users
SELECT * FROM [User];

-- Lihat pickup requests dengan user name
SELECT 
    pr.id,
    u.name AS UserName,
    pr.address,
    pr.status,
    pr.createdAt
FROM PickupRequest pr
INNER JOIN [User] u ON pr.userId = u.id
ORDER BY pr.createdAt DESC;
```

4. **Execute** (F5 atau klik Execute button)
5. Hasil muncul di **Results** panel

### Cara 2: Via Table Context Menu

**Right-click** table → **Select Top 1000 Rows**
- Otomatis generate & run query

---

## 🔍 USEFUL QUERIES UNTUK GOCLEAN

### 1. Lihat Semua Users dengan Role
```sql
SELECT 
    id,
    name,
    email,
    role,
    phone,
    gopayNumber,
    createdAt
FROM [User]
ORDER BY role, createdAt DESC;
```

### 2. Lihat Pickup Requests Aktif
```sql
SELECT 
    pr.id,
    u.name AS UserName,
    u.phone AS UserPhone,
    pr.address,
    pr.status,
    pr.scheduledAt,
    pr.createdAt,
    (SELECT COUNT(*) FROM WasteItem WHERE pickupRequestId = pr.id) AS TotalItems
FROM PickupRequest pr
INNER JOIN [User] u ON pr.userId = u.id
WHERE pr.status IN ('PENDING', 'ACCEPTED', 'ON_THE_WAY')
ORDER BY pr.createdAt DESC;
```

### 3. Lihat Transaksi Lengkap
```sql
SELECT 
    t.id,
    u.name AS UserName,
    u.gopayNumber,
    t.totalWeight,
    t.totalPrice,
    CASE WHEN t.isPaid = 1 THEN 'PAID' ELSE 'UNPAID' END AS PaymentStatus,
    t.paidAt,
    t.createdAt
FROM [Transaction] t
INNER JOIN [User] u ON t.userId = u.id
ORDER BY t.createdAt DESC;
```

### 4. Lihat TPS dengan Profil
```sql
SELECT 
    u.name AS OwnerName,
    u.email,
    tp.tpsName,
    tp.address,
    tp.phone,
    tp.gopayNumber,
    tp.operatingHours,
    CASE WHEN tp.isActive = 1 THEN 'ACTIVE' ELSE 'INACTIVE' END AS Status
FROM [User] u
INNER JOIN TPSProfile tp ON u.id = tp.userId
WHERE u.role = 'TPS';
```

### 5. Summary Statistics
```sql
-- Database Overview
SELECT 
    'Total Users' AS Metric, COUNT(*) AS Count FROM [User]
UNION ALL
SELECT 'Total TPS', COUNT(*) FROM [User] WHERE role = 'TPS'
UNION ALL
SELECT 'Total Regular Users', COUNT(*) FROM [User] WHERE role = 'USER'
UNION ALL
SELECT 'Total Pickup Requests', COUNT(*) FROM PickupRequest
UNION ALL
SELECT 'Total Transactions', COUNT(*) FROM [Transaction]
UNION ALL
SELECT 'Total Paid Transactions', COUNT(*) FROM [Transaction] WHERE isPaid = 1;
```

### 6. Pickup Status Breakdown
```sql
SELECT 
    status,
    COUNT(*) AS Total,
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM PickupRequest) AS DECIMAL(5,2)) AS Percentage
FROM PickupRequest
GROUP BY status
ORDER BY Total DESC;
```

---

## 🎨 STEP 5: VISUAL TOOLS

### A. Database Diagram (ER Diagram)

1. **Expand** goclean database
2. **Right-click** "Database Diagrams" → "New Database Diagram"
3. **Add tables**: User, PickupRequest, Transaction, WasteItem, TPSProfile
4. **Click Add** → Visual diagram muncul!
5. **Arrange** tabel dengan drag & drop
6. **Save** diagram (Ctrl+S)

**Keuntungan:**
- Lihat relationships visual
- FK connections dengan garis
- Edit struktur dengan GUI

### B. Table Designer

**Right-click** table → **Design**

**Lihat:**
- Column names
- Data types
- Allow Nulls
- Default values
- Identity columns
- Indexes
- Constraints

### C. View Data

**Right-click** table → **Edit Top 200 Rows**
- Edit data langsung di grid
- Add new rows
- Delete rows

---

## 🛠️ ADVANCED FEATURES

### 1. Execution Plan
```sql
-- Enable execution plan
SET SHOWPLAN_TEXT ON;
GO

SELECT * FROM [User] WHERE email = 'user1@goclean.id';
```

Atau klik **Include Actual Execution Plan** (Ctrl+M) sebelum run query

### 2. Import/Export Data

**Right-click** database → **Tasks** → **Import Data**
- Import dari Excel, CSV, etc

**Right-click** database → **Tasks** → **Export Data**
- Export ke Excel, CSV, etc

### 3. Backup Database

```sql
BACKUP DATABASE goclean
TO DISK = 'C:\Backup\goclean_backup.bak'
WITH FORMAT, INIT, NAME = 'Full Backup of goclean';
```

Atau via GUI:
**Right-click** database → **Tasks** → **Back Up**

### 4. Restore Database

**Right-click** Databases → **Restore Database**
- Select backup file
- Click OK

---

## 📋 KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| **Ctrl+N** | New Query |
| **F5** atau **Ctrl+E** | Execute Query |
| **Ctrl+L** | Show Execution Plan |
| **Ctrl+R** | Toggle Results Pane |
| **Ctrl+Shift+R** | Refresh IntelliSense |
| **Ctrl+K, Ctrl+C** | Comment Selection |
| **Ctrl+K, Ctrl+U** | Uncomment Selection |
| **Alt+F1** | Show Object Definition |

---

## 🎯 QUICK START CHECKLIST

Setelah SSMS terinstall:

- [ ] Buka SSMS
- [ ] Connect ke `localhost` (Windows Authentication)
- [ ] Expand Databases → goclean
- [ ] Expand Tables → lihat 7 tabel
- [ ] Right-click User → Select Top 1000 Rows
- [ ] Click New Query → run query test
- [ ] Create Database Diagram untuk visualisasi
- [ ] Bookmark halaman ini untuk referensi queries

---

## 🐛 TROUBLESHOOTING

### Cannot connect to localhost
**Solutions:**
1. Cek SQL Server service running: `Get-Service MSSQLSERVER`
2. Try connect dengan: `localhost\MSSQLSERVER01`
3. Cek TCP/IP enabled di SQL Configuration Manager

### Database 'goclean' not found
**Solutions:**
1. Verify database exists:
   ```sql
   SELECT name FROM sys.databases;
   ```
2. Re-run migration jika perlu

### Permission denied
**Solutions:**
1. Pastikan Windows user Anda punya admin rights
2. Run SSMS as Administrator
3. Add user ke db_owner role

---

## 🔗 RESOURCES

- **SSMS Documentation**: https://docs.microsoft.com/en-us/sql/ssms/
- **SQL Server Tutorial**: https://www.sqlservertutorial.net/
- **T-SQL Reference**: https://docs.microsoft.com/en-us/sql/t-sql/

---

## ✅ SUMMARY

**Untuk explore database GoClean:**

1. **Install SSMS** (5-10 menit)
2. **Connect** ke `localhost`
3. **Expand** goclean → Tables
4. **Run queries** dari section "Useful Queries"
5. **Create diagram** untuk visual relationships

**Alternative:** Prisma Studio masih running di http://localhost:5555 (lebih simple untuk quick view!)

---

🎉 **Selamat exploring database dengan SSMS!**
