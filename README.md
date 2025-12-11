# GoClean 🌿

Aplikasi pengelolaan sampah berbasis web yang menghubungkan pengguna dengan TPS (Tempat Pembuangan Sampah) untuk penjemputan sampah.

## 📋 Fitur Utama

- **User**: Membuat permintaan penjemputan sampah, memilih lokasi, upload foto/video, memilih TPS
- **TPS**: Menerima dan mengelola permintaan penjemputan, mengatur harga sampah
- **Admin**: Mengelola pengguna dan monitoring sistem
- **Peta Interaktif**: Memilih lokasi penjemputan dengan map
- **Sistem Harga Dinamis**: Harga berdasarkan jarak TPS dari lokasi user

## 🔧 Teknologi

- **Framework**: Next.js 14 (App Router)
- **Database**: SQL Server (Local atau Azure)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Map**: Leaflet + OpenStreetMap

---

## 🚀 Cara Menjalankan (Local Development)

### Prasyarat

1. **Node.js** v18 atau lebih baru - [Download](https://nodejs.org/)
2. **SQL Server** (pilih salah satu):
   - SQL Server Express (Gratis) - [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
   - SQL Server Developer Edition (Gratis untuk development)
3. **SQL Server Management Studio (SSMS)** - [Download](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (Opsional, untuk mengelola database)

### Setup Otomatis (Recommended)

```powershell
# Clone repository
git clone https://github.com/JryFarrr/GoClean.git
cd GoClean

# Jalankan script setup (PowerShell sebagai Administrator)
.\setup-local.ps1
```

### Setup Manual

#### 1. Clone dan Install Dependencies

```bash
git clone https://github.com/JryFarrr/GoClean.git
cd GoClean
npm install
```

#### 2. Buat Database di SQL Server

Buka SSMS atau sqlcmd, lalu jalankan:
```sql
CREATE DATABASE goclean;
```

#### 3. Konfigurasi Environment

Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi SQL Server Anda:

**Opsi 1: Windows Authentication**
```env
DATABASE_URL="sqlserver://localhost;database=goclean;integratedSecurity=true;trustServerCertificate=true"
```

**Opsi 2: SQL Server Express dengan Windows Auth**
```env
DATABASE_URL="sqlserver://localhost\\SQLEXPRESS;database=goclean;integratedSecurity=true;trustServerCertificate=true"
```

**Opsi 3: SQL Authentication (Username & Password)**
```env
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPassword123;trustServerCertificate=true"
```

#### 4. Setup Database dengan Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Opsional) Isi data awal
npx prisma db seed
```

#### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 👤 Default Login (setelah seed)

| Role  | Email              | Password |
|-------|-------------------|----------|
| Admin | admin@goclean.com | admin123 |
| TPS   | tps@goclean.com   | tps123   |
| User  | user@goclean.com  | user123  |

---

## 🔧 Troubleshooting

### SQL Server tidak bisa diakses

1. Pastikan service SQL Server berjalan:
   ```powershell
   Get-Service -Name "MSSQLSERVER"
   # atau untuk SQL Express
   Get-Service -Name "MSSQL$SQLEXPRESS"
   ```

2. Pastikan TCP/IP enabled di SQL Server Configuration Manager

3. Jika menggunakan SQL Authentication, pastikan:
   - SQL Server authentication mode = "Mixed Mode"
   - User `sa` sudah di-enable dan password sudah diset

### Prisma error

```bash
# Reset Prisma client
npx prisma generate

# Jika ada error migration
npx prisma db push --force-reset
```

### Port 3000 sudah digunakan

```bash
# Jalankan di port lain
npm run dev -- -p 3001
```

---

## 📁 Struktur Project

```
goclean/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard pages
│   │   ├── pickup/      # Pickup request pages
│   │   └── tps/         # TPS management pages
│   ├── components/      # React components
│   └── lib/             # Utilities & configurations
├── public/              # Static files
├── .env.example         # Environment template
└── setup-local.ps1      # Setup script
```

---

## 📝 License

MIT License - Silakan gunakan untuk pembelajaran dan pengembangan.

