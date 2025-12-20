# 🌿 GoClean - Aplikasi Manajemen Sampah Berbasis Web

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748?style=flat-square&logo=prisma)
![SQL Server](https://img.shields.io/badge/SQL_Server-2025-CC2927?style=flat-square&logo=microsoft-sql-server)

GoClean adalah aplikasi web modern untuk manajemen pengumpulan sampah yang menghubungkan masyarakat dengan Tempat Pembuangan Sampah (TPS) di Surabaya. Aplikasi ini memungkinkan pengguna untuk menjadwalkan pickup sampah, melacak transaksi, dan TPS dapat mengelola harga sampah berdasarkan jenis.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Folder](#-arsitektur-folder)
- [Instalasi & Setup](#-instalasi--setup)
- [Database](#-database)
- [Penggunaan](#-penggunaan)
- [Role & Hak Akses](#-role--hak-akses)
- [API Routes](#-api-routes)
- [Deployment](#-deployment)
- [Dokumentasi Lengkap](#-dokumentasi-lengkap)
- [Kontributor](#-kontributor)

---

## ✨ Fitur Utama

### 👤 Untuk User (Masyarakat)
- 📍 **Pickup Request** - Jadwalkan penjemputan sampah dengan lokasi peta interaktif
- 🗺️ **Peta TPS** - Lihat lokasi TPS terdekat di 31 kecamatan Surabaya
- 📸 **Upload Media** - Unggah foto/video sampah untuk estimasi
- 💰 **Tracking Transaksi** - Pantau riwayat dan pendapatan dari sampah
- 🔔 **Notifikasi Real-time** - Update status pickup dan pembayaran
- 👤 **Profile Management** - Kelola data pribadi, GoPay, dan WhatsApp

### 🏭 Untuk TPS (Tempat Pembuangan Sampah)
- 📥 **Manage Pickup Request** - Terima dan proses permintaan penjemputan
- 💵 **Set Harga Sampah** - Tentukan harga per kg untuk 7 jenis sampah
- 📍 **Profil Lokasi** - Atur lokasi, jam operasional, dan kapasitas
- 🗺️ **Map Integration** - Tampilkan lokasi TPS di peta
- 📊 **Transaksi & Pembayaran** - Kelola pembayaran ke user

### 👨‍💼 Untuk Admin
- 📊 **Dashboard Statistik** - Overview sistem dan aktivitas
- 👥 **User Management** - Kelola semua pengguna dan role
- 📈 **Monitoring** - Pantau pickup request dan transaksi

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.0.7 (App Router)
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand 5.0.9
- **Maps:** React Leaflet 5.0.0
- **Notifications:** React Hot Toast 2.6.0
- **Icons:** Lucide React 0.555.0

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Authentication:** NextAuth.js 4.24.13
- **ORM:** Prisma 6.19.0
- **Database:** SQL Server 2025 Enterprise Developer Edition

### Development Tools
- **Language:** TypeScript 5.x
- **Linting:** ESLint 9
- **File Upload:** React Dropzone 14.3.8
- **Password Hashing:** bcryptjs 3.0.3
- **Date Handling:** date-fns 4.1.0

---

## 📁 Arsitektur Folder

```
GoClean-main/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 📂 admin/              # Dashboard admin & user management
│   │   │   ├── page.tsx           # Admin dashboard
│   │   │   └── users/page.tsx    # User management
│   │   ├── 📂 api/                # API Routes
│   │   │   ├── auth/              # Authentication (NextAuth, Register)
│   │   │   ├── pickups/           # Pickup CRUD endpoints
│   │   │   ├── tps/               # TPS profile & prices
│   │   │   ├── transactions/      # Transaction management
│   │   │   ├── notifications/     # Notification system
│   │   │   └── user/profile/      # User profile API
│   │   ├── 📂 dashboard/          # User/TPS dashboard
│   │   ├── 📂 login/              # Login page
│   │   ├── 📂 register/           # Registration page
│   │   ├── 📂 pickup/             # Pickup request pages
│   │   │   ├── new/               # Create pickup request
│   │   │   ├── history/           # Pickup history
│   │   │   └── [id]/              # Pickup detail
│   │   ├── 📂 tps/                # TPS-specific pages
│   │   │   ├── map/               # Peta lokasi TPS
│   │   │   ├── prices/            # Set harga sampah
│   │   │   ├── profile/           # TPS profile
│   │   │   ├── requests/          # Incoming pickup requests
│   │   │   └── transactions/      # TPS transactions
│   │   ├── 📂 transactions/       # User transactions
│   │   ├── 📂 notifications/      # Notification center
│   │   ├── 📂 profile/            # User profile
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   ├── 📂 components/             # Reusable components
│   │   ├── MapComponent.tsx       # Leaflet map integration
│   │   ├── MediaUploader.tsx      # Photo/video upload
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── providers.tsx          # Context providers
│   │   └── WasteItemSelector.tsx  # Waste type selector
│   ├── 📂 lib/                    # Utility libraries
│   │   ├── auth.ts                # NextAuth configuration
│   │   ├── prisma.ts              # Prisma client
│   │   ├── store.ts               # Zustand store
│   │   └── utils.ts               # Helper functions
│   └── 📂 types/                  # TypeScript definitions
│       └── next-auth.d.ts         # NextAuth type extensions
├── 📂 prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Database seeder
│   └── migrations/                # Database migrations
├── 📂 public/
│   └── uploads/                   # Uploaded media files
├── 📂 my-app/                     # Legacy folder (optional)
├── 📄 package.json                # Dependencies
├── 📄 tsconfig.json               # TypeScript config
├── 📄 next.config.ts              # Next.js config
├── 📄 tailwind.config.ts          # Tailwind config
├── 📄 .env                        # Environment variables
└── 📄 README.md                   # This file
```

### Penjelasan Struktur

#### **src/app/** - App Router Next.js
- Menggunakan file-system routing baru Next.js 13+
- Setiap folder dengan `page.tsx` menjadi route
- `layout.tsx` untuk shared layout
- Dynamic routes dengan `[id]` untuk parameter

#### **src/app/api/** - Backend API
- RESTful API endpoints untuk semua operasi
- Authentication dengan NextAuth.js
- CRUD untuk pickups, transactions, TPS

#### **src/components/** - Komponen Reusable
- `MapComponent.tsx` - Peta interaktif dengan Leaflet
- `MediaUploader.tsx` - Upload foto/video dengan preview
- `WasteItemSelector.tsx` - Form pilih jenis sampah

#### **src/lib/** - Business Logic
- `auth.ts` - Konfigurasi NextAuth & role-based access
- `prisma.ts` - Database client singleton
- `store.ts` - Global state management

#### **prisma/** - Database Layer
- `schema.prisma` - 8 tables (User, TPSProfile, PickupRequest, WasteItem, Transaction, Notification, WastePrice)
- Migrations untuk SQL Server

---

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js 18+ 
- SQL Server 2025 (atau PostgreSQL untuk production)
- npm/yarn/pnpm

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd GoClean-main
```

### 2️⃣ Install Dependencies
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3️⃣ Setup Environment Variables
Buat file `.env` di root folder:

```env
# Database
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4️⃣ Setup Database

#### Untuk SQL Server (Development):
```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# (Optional) Seed data dummy
npm run db:seed
```

#### Untuk PostgreSQL (Production):
Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan migrasi ke PostgreSQL.

### 5️⃣ Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 6️⃣ Login Default
Setelah seeding (jika dijalankan):
- **Admin:** admin@goclean.com / admin123
- **TPS:** tps@goclean.com / tps123
- **User:** user@goclean.com / user123

---

## 🗄️ Database

### Provider
- **Development:** SQL Server 2025
- **Production:** PostgreSQL (Neon/Supabase/Railway)

### 8 Tables
1. **User** - User utama (Admin, TPS, User)
2. **TPSProfile** - Profil detail TPS
3. **WastePrice** - Harga sampah per jenis & TPS
4. **PickupRequest** - Request penjemputan sampah
5. **WasteItem** - Detail item sampah per request
6. **Transaction** - Transaksi pembayaran
7. **Notification** - Notifikasi real-time
8. **Session** - NextAuth sessions

### Jenis Sampah (Waste Types)
- 🌿 **ORGANIC** - Sampah organik
- 🔵 **PLASTIC** - Plastik
- 📄 **PAPER** - Kertas
- ⚙️ **METAL** - Logam
- 🪟 **GLASS** - Kaca
- 🔌 **ELECTRONIC** - Elektronik
- 📦 **OTHER** - Lainnya

### Status Pickup Request
1. `PENDING` - Menunggu konfirmasi TPS
2. `ACCEPTED` - Diterima TPS
3. `ON_THE_WAY` - TPS menuju lokasi
4. `PICKED_UP` - Sampah telah diambil
5. `COMPLETED` - Selesai & dibayar
6. `CANCELLED` - Dibatalkan

Lihat dokumentasi lengkap: [DATABASE-STRUCTURE.md](DATABASE-STRUCTURE.md)

---

## 📖 Penggunaan

### User Flow
1. **Register** → Pilih role (USER/TPS)
2. **Login** → Dashboard sesuai role
3. **Create Pickup** → Pilih lokasi di peta, upload foto, pilih jenis sampah
4. **Wait TPS** → TPS menerima dan memproses
5. **Track Status** → Lihat status real-time
6. **Get Paid** → Terima pembayaran ke GoPay

### TPS Flow
1. **Setup Profile** → Isi data TPS, lokasi, jam operasional
2. **Set Prices** → Tentukan harga per kg untuk tiap jenis sampah
3. **View Requests** → Lihat incoming pickup requests
4. **Accept & Process** → Terima, jemput, timbang sampah
5. **Create Transaction** → Input berat aktual dan bayar user

### Admin Flow
1. **Dashboard** → Monitor statistik sistem
2. **User Management** → Kelola user, ubah role, hapus user
3. **View Reports** → Lihat semua pickup & transaksi

---

## 🔐 Role & Hak Akses

### USER (Masyarakat)
✅ Buat pickup request  
✅ Upload media  
✅ Lihat transaksi  
✅ Kelola profile  
✅ Terima notifikasi  
❌ Akses halaman TPS  
❌ Akses admin panel  

### TPS (Tempat Pembuangan Sampah)
✅ Terima pickup request  
✅ Set harga sampah  
✅ Kelola profil TPS  
✅ Proses transaksi  
✅ Lihat peta lokasi  
❌ Buat pickup request  
❌ Akses admin panel  

### ADMIN
✅ Full access  
✅ User management  
✅ View statistics  
✅ Monitor sistem  

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, logout, session)

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Pickup Requests
- `GET /api/pickups` - List pickups (filtered by role)
- `POST /api/pickups` - Create pickup request
- `GET /api/pickups/[id]` - Get pickup detail
- `PUT /api/pickups/[id]` - Update pickup status
- `DELETE /api/pickups/[id]` - Delete pickup

### TPS
- `GET /api/tps/profile` - Get TPS profile
- `PUT /api/tps/profile` - Update TPS profile
- `GET /api/tps/prices` - Get waste prices
- `POST /api/tps/prices` - Set waste price

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications` - Mark as read

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users` - Update user role
- `DELETE /api/admin/users` - Delete user

---

## 🌐 Deployment

### Development (Local)
```bash
npm run dev
```

### Production (Vercel)
1. **Migrate ke PostgreSQL** (lihat [DEPLOYMENT.md](DEPLOYMENT.md))
2. Push ke GitHub
3. Import project di Vercel
4. Set environment variables
5. Deploy!

Panduan lengkap: [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md)

### Database Migration Scripts
- `migrate-to-postgres.ps1` - Migrasi ke PostgreSQL
- `migrate-to-sqlserver.ps1` - Setup SQL Server

---

## 📚 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| [DATABASE-STRUCTURE.md](DATABASE-STRUCTURE.md) | Struktur database lengkap |
| [DATABASE-GIS-STRUCTURE.md](DATABASE-GIS-STRUCTURE.md) | Integrasi GIS & peta |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Panduan deploy ke Vercel |
| [VERCEL-DEPLOY.md](VERCEL-DEPLOY.md) | Checklist deployment |
| [FITUR-PICKUP-KECAMATAN.md](FITUR-PICKUP-KECAMATAN.md) | Fitur pickup dengan peta kecamatan |
| [FITUR-HAPUS-LOKASI.md](FITUR-HAPUS-LOKASI.md) | Fitur hapus lokasi pickup |
| [PANDUAN-PICKUP-USER.md](PANDUAN-PICKUP-USER.md) | Panduan lengkap pickup untuk user |
| [SQLSERVER-SETUP.md](SQLSERVER-SETUP.md) | Setup SQL Server 2025 |
| [SSMS-GUIDE.md](SSMS-GUIDE.md) | Panduan SQL Server Management Studio |
| [ENABLE-TCPIP-GUIDE.md](ENABLE-TCPIP-GUIDE.md) | Enable TCP/IP di SQL Server |

---

## 🎯 Fitur Unggulan

### 🗺️ Integrasi Peta Interaktif
- 31 TPS di seluruh kecamatan Surabaya
- Click-to-select lokasi pickup
- Real-time TPS markers
- Distance calculation

### 📸 Media Upload
- Drag & drop foto/video
- Preview before upload
- Multiple file support
- Size validation

### 💳 Payment Integration
- GoPay integration ready
- WhatsApp notification support
- Transaction tracking

### 🔔 Real-time Notifications
- Status update otomatis
- In-app notifications
- Badge counter

---

## 🤝 Kontributor

Project ini dikembangkan untuk tugas kuliah Matematika ITS.

---

## 📝 Scripts NPM

```json
{
  "dev": "next dev",                    // Run development server
  "build": "prisma generate && next build",  // Build production
  "start": "next start",                // Run production server
  "lint": "eslint",                     // Run linter
  "db:generate": "prisma generate",     // Generate Prisma client
  "db:push": "prisma db push",          // Push schema to DB
  "db:migrate": "prisma migrate dev",   // Run migrations
  "db:seed": "ts-node prisma/seed.ts",  // Seed database
  "db:studio": "prisma studio"          // Open Prisma Studio
}
```

---

## 🐛 Troubleshooting

### Database Connection Error
1. Cek SQL Server sudah running
2. Verify TCP/IP enabled (lihat [ENABLE-TCPIP-GUIDE.md](ENABLE-TCPIP-GUIDE.md))
3. Cek `DATABASE_URL` di `.env`

### Prisma Generate Error
```bash
npm run db:generate
```

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Atau gunakan port lain
PORT=3001 npm run dev
```

---

## 📄 License

MIT License - Gunakan bebas untuk keperluan edukasi.

---

## 🌟 Support

Jika ada pertanyaan atau bug:
1. Buka issue di repository
2. Email ke developer
3. Lihat dokumentasi di folder `/docs`

---

**GoClean** - Solusi Modern untuk Manajemen Sampah 🌿♻️
