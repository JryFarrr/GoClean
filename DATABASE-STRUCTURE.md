# 📊 Sistematika Database GoClean - SQL Server 2025

## 🗄️ Database Overview

**Database Name:** `goclean`  
**Provider:** SQL Server 2025 Enterprise Developer Edition  
**Instance:** MSSQLSERVER01  
**Connection:** Windows Authentication  

---

## 📋 Database Tables (8 Tables)

### 1️⃣ **User** - Tabel Pengguna Utama
Menyimpan semua user (Admin, TPS, User biasa)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key (CUID) |
| `email` | nvarchar(1000) | NO | Email (unique) |
| `password` | nvarchar(1000) | NO | Hashed password |
| `name` | nvarchar(1000) | NO | Nama lengkap |
| `phone` | nvarchar(1000) | YES | Nomor telepon |
| `address` | nvarchar(1000) | YES | Alamat lengkap |
| `gopayNumber` | nvarchar(1000) | YES | **NEW**: Nomor Gopay untuk payment |
| `whatsappNumber` | nvarchar(1000) | YES | **NEW**: Nomor WhatsApp |
| `role` | nvarchar(1000) | NO | USER / TPS / ADMIN |
| `avatar` | nvarchar(1000) | YES | URL avatar |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

**Relationships:**
- 1 User → Many PickupRequest (sebagai User)
- 1 User → Many PickupRequest (sebagai TPS)
- 1 User → 1 TPSProfile
- 1 User → Many Transaction
- 1 User → Many Notification

---

### 2️⃣ **TPSProfile** - Profil TPS
Detail informasi Tempat Pembuangan Sampah

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `userId` | nvarchar(30) | NO | FK → User.id (unique) |
| `tpsName` | nvarchar(1000) | NO | Nama TPS |
| `latitude` | float(53) | YES | Koordinat lokasi |
| `longitude` | float(53) | YES | Koordinat lokasi |
| `address` | nvarchar(1000) | NO | Alamat TPS |
| `phone` | nvarchar(1000) | YES | Telepon TPS |
| `gopayNumber` | nvarchar(1000) | YES | Gopay TPS |
| `whatsappNumber` | nvarchar(1000) | YES | WhatsApp TPS |
| `operatingHours` | nvarchar(1000) | YES | Jam operasional |
| `capacity` | int | YES | Kapasitas (kg) |
| `description` | nvarchar(1000) | YES | Deskripsi |
| `isActive` | bit | NO | Status aktif (default: 1) |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

**Relationships:**
- 1 TPSProfile → Many WastePrice

---

### 3️⃣ **WastePrice** - Harga Sampah per TPS
Harga pembelian sampah per kilogram untuk tiap jenis

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `tpsProfileId` | nvarchar(30) | NO | FK → TPSProfile.id |
| `wasteType` | nvarchar(1000) | NO | Jenis sampah |
| `pricePerKg` | float(53) | NO | Harga per kg |
| `description` | nvarchar(1000) | YES | Keterangan |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

**Unique Constraint:** (tpsProfileId, wasteType)

**Waste Types:**
- ORGANIC (Organik)
- PLASTIC (Plastik)
- PAPER (Kertas)
- METAL (Logam)
- GLASS (Kaca)
- ELECTRONIC (Elektronik)
- OTHER (Lainnya)

---

### 4️⃣ **PickupRequest** - Permintaan Penjemputan
Request pickup sampah dari user

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `userId` | nvarchar(30) | NO | FK → User.id (pembuat request) |
| `tpsId` | nvarchar(30) | YES | FK → User.id (TPS yang ambil) |
| `latitude` | float(53) | NO | Koordinat pickup |
| `longitude` | float(53) | NO | Koordinat pickup |
| `address` | nvarchar(1000) | NO | Alamat pickup |
| `description` | nvarchar(1000) | YES | Deskripsi tambahan |
| `status` | nvarchar(1000) | NO | Status request |
| `scheduledAt` | datetime2 | YES | Jadwal penjemputan |
| `pickedUpAt` | datetime2 | YES | Waktu diambil |
| `photos` | nvarchar(1000) | NO | JSON array foto URLs |
| `videos` | nvarchar(1000) | NO | JSON array video URLs |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

**Status Values:**
- PENDING (Menunggu)
- ACCEPTED (Diterima TPS)
- ON_THE_WAY (TPS dalam perjalanan)
- PICKED_UP (Sudah diambil)
- COMPLETED (Selesai + dibayar)
- CANCELLED (Dibatalkan)

**Relationships:**
- 1 PickupRequest → Many WasteItem
- 1 PickupRequest → 1 Transaction

---

### 5️⃣ **WasteItem** - Detail Item Sampah
Detail jenis dan berat sampah per request

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `pickupRequestId` | nvarchar(30) | NO | FK → PickupRequest.id |
| `wasteType` | nvarchar(1000) | NO | Jenis sampah |
| `estimatedWeight` | float(53) | YES | Estimasi berat (kg) |
| `actualWeight` | float(53) | YES | Berat aktual (diisi TPS) |
| `price` | float(53) | YES | Harga calculated |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

---

### 6️⃣ **Transaction** - Transaksi Pembayaran
**FLOW BARU**: TPS bayar ke User (bukan User bayar ke TPS)

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `pickupRequestId` | nvarchar(30) | NO | FK → PickupRequest.id (unique) |
| `userId` | nvarchar(30) | NO | FK → User.id (penerima) |
| `totalWeight` | float(53) | NO | Total berat (kg) |
| `totalPrice` | float(53) | NO | Total harga |
| `isPaid` | bit | NO | Status bayar (default: 0) |
| `paidAt` | datetime2 | YES | Waktu dibayar |
| `createdAt` | datetime2 | NO | Tanggal dibuat |
| `updatedAt` | datetime2 | NO | Tanggal update |

**Payment Flow:**
1. TPS buat Transaction setelah timbang
2. TPS transfer Gopay ke User
3. User verifikasi pembayaran
4. Status → COMPLETED

---

### 7️⃣ **Notification** - Notifikasi User
Push notification untuk user

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | nvarchar(30) | NO | Primary Key |
| `userId` | nvarchar(30) | NO | FK → User.id |
| `title` | nvarchar(1000) | NO | Judul notif |
| `message` | nvarchar(1000) | NO | Isi pesan |
| `isRead` | bit | NO | Status baca (default: 0) |
| `type` | nvarchar(1000) | NO | Tipe notifikasi |
| `createdAt` | datetime2 | NO | Tanggal dibuat |

**Notification Types:**
- pickup_accepted
- pickup_on_the_way
- pickup_completed
- payment_received
- etc.

---

### 8️⃣ **_prisma_migrations** - Prisma Internal
Tracking migration history (internal)

---

## 🔗 Entity Relationship Diagram

```
┌─────────────┐
│    User     │──────┐
│ (id, email) │      │
└─────────────┘      │
       │             │
       │ 1:1         │ 1:N
       ▼             ▼
┌─────────────┐  ┌──────────────────┐
│ TPSProfile  │  │ PickupRequest    │
│             │  │ (userId, tpsId)  │
└─────────────┘  └──────────────────┘
       │                  │
       │ 1:N              │ 1:N
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ WastePrice  │    │ WasteItem   │
└─────────────┘    └─────────────┘
                          │
            ┌─────────────┘
            │ 1:1
            ▼
     ┌─────────────┐
     │ Transaction │
     └─────────────┘
```

---

## 📊 Data Statistics

Query untuk lihat jumlah data:

```sql
-- Total Users
SELECT COUNT(*) AS TotalUsers FROM [User];

-- Total Pickup Requests
SELECT COUNT(*) AS TotalPickups FROM PickupRequest;

-- Total Transactions
SELECT COUNT(*) AS TotalTransactions FROM [Transaction];

-- Pickup by Status
SELECT status, COUNT(*) AS Total 
FROM PickupRequest 
GROUP BY status;
```

---

## 🛠️ Useful SQL Queries

### 1. Lihat Semua User dengan Role
```sql
SELECT id, name, email, role, createdAt 
FROM [User] 
ORDER BY createdAt DESC;
```

### 2. Lihat Pickup Aktif
```sql
SELECT 
    pr.id,
    u.name AS UserName,
    pr.address,
    pr.status,
    pr.createdAt
FROM PickupRequest pr
INNER JOIN [User] u ON pr.userId = u.id
WHERE pr.status IN ('PENDING', 'ACCEPTED', 'ON_THE_WAY')
ORDER BY pr.createdAt DESC;
```

### 3. Lihat Transaksi dengan Detail
```sql
SELECT 
    t.id,
    u.name AS UserName,
    t.totalWeight,
    t.totalPrice,
    t.isPaid,
    t.createdAt
FROM [Transaction] t
INNER JOIN [User] u ON t.userId = u.id
ORDER BY t.createdAt DESC;
```

### 4. Lihat TPS dengan Profil Lengkap
```sql
SELECT 
    u.name AS TPSName,
    tp.tpsName,
    tp.address,
    tp.phone,
    tp.gopayNumber,
    tp.isActive
FROM [User] u
INNER JOIN TPSProfile tp ON u.id = tp.userId
WHERE u.role = 'TPS';
```

---

## 🌐 Access Database Interaktif

### Option 1: **Prisma Studio** ✨ (ALREADY RUNNING!)
```
URL: http://localhost:5555
```
**Features:**
- ✅ Visual browser
- ✅ Edit data langsung
- ✅ Filter & search
- ✅ See relationships
- ✅ No installation needed

### Option 2: **SQL Server Management Studio (SSMS)**
```
Download: https://aka.ms/ssmsfullsetup
Connection:
- Server: localhost atau localhost\MSSQLSERVER01
- Authentication: Windows Authentication
- Database: goclean
```

### Option 3: **Azure Data Studio** (Modern UI)
```
Download: https://aka.ms/azuredatastudio
Same connection as SSMS
```

### Option 4: **VS Code Extension**
```
Install: "SQL Server (mssql)" extension
Connection: Same as above
```

---

## 🔐 Demo Data

Setelah seeding, database berisi:

| Email | Password | Role |
|-------|----------|------|
| admin@goclean.id | admin123 | ADMIN |
| tps1@goclean.id | tps123 | TPS |
| tps2@goclean.id | tps123 | TPS |
| user1@goclean.id | user123 | USER |
| user2@goclean.id | user123 | USER |

Plus 2 sample pickup requests dengan waste items!

---

**🎯 Rekomendasi: Buka http://localhost:5555 sekarang untuk explore database secara visual!**
