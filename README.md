# 🌿 GoClean - Aplikasi Manajemen Sampah Berbasis Web

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.0-2D3748?style=flat-square&logo=prisma)
![SQL Server](https://img.shields.io/badge/SQL_Server-2025-CC2927?style=flat-square&logo=microsoft-sql-server)
![Version](https://img.shields.io/badge/version-2.0.0-green?style=flat-square)
![Last Updated](https://img.shields.io/badge/updated-Dec_2025-blue?style=flat-square)

GoClean adalah aplikasi web modern untuk manajemen pengumpulan sampah yang menghubungkan masyarakat dengan Tempat Pembuangan Sampah (TPS) di Surabaya. Aplikasi ini memungkinkan pengguna untuk menjadwalkan pickup sampah, melacak transaksi, dan TPS dapat mengelola harga sampah berdasarkan jenis.

---

## 🆕 Update Terbaru (Desember 2025)

### ✨ Fitur Admin - Manajemen Lokasi TPS
- ➕ **Tambah Lokasi TPS** - Form interaktif dengan peta Leaflet untuk menambah TPS baru
- 📤 **Import dari Excel** - Upload file .xlsx/.xls untuk import data TPS secara massal (format baru dengan panduan)
- 📥 **Download Template Excel** - Template Excel profesional dengan 2 sheet (Data + Panduan lengkap)
- 🗑️ **Hapus Lokasi TPS** - Fitur hapus dengan modal konfirmasi keamanan
- 📋 **Daftar TPS Lengkap** - View 51+ TPS dengan status aktif/nonaktif
- 🗺️ **Integrasi Google Maps** - Link langsung ke Google Maps untuk setiap lokasi

### 👥 Fitur Admin - Manajemen User
- 📤 **Import User/TPS/Admin** - Import akun massal dari Excel dengan validasi lengkap
- 🏪 **Daftar TPS Tersedia** - Modal import menampilkan daftar TPS dengan fitur click-to-copy
- ✅ **Validasi Real-time** - Cek duplikat email, TPS tidak ditemukan, format data
- 📊 **Report Import Detail** - Tampilkan success/error untuk setiap baris
- 🗑️ **Reset Akun** - Hapus akun berdasarkan role (USER/TPS/ADMIN/ALL) dengan proteksi
- 🛡️ **Proteksi Admin** - Admin yang melakukan reset tidak akan terhapus

### 🗺️ Peningkatan Peta & Lokasi
- 📍 **31 Kecamatan Surabaya** - Dropdown filter berdasarkan kecamatan
- 🎯 **TPSLocationPicker** - Komponen peta interaktif untuk admin
- ✖️ **Hapus Marker** - User dapat membatalkan pilihan lokasi dengan mudah
- 📊 **Database TPSLocation** - Data TPS sekarang tersimpan di database (tidak hardcoded)

### 🗄️ Database & Import
- **TPSLocation Table** - Tabel baru untuk master data lokasi TPS
- **GIS Layers** - Tabel opsional: Kategori, Kecamatan, ObjekPoint, Jalan, Area
- **Migration Files** - `add_tps_locations.sql` & `add_gis_layers.sql`
- **Smart Import** - Auto-link TPS account dengan TPSLocation data saat import user
- **Cascade Delete** - Data terkait otomatis terhapus saat reset akun

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
- 🗑️ **Hapus Lokasi Pickup** - Batalkan lokasi yang sudah dipilih dengan mudah
- 📍 **Pilih Berdasarkan Kecamatan** - Filter dan pilih TPS berdasarkan 31 kecamatan Surabaya

### 🏭 Untuk TPS (Tempat Pembuangan Sampah)
- 📥 **Manage Pickup Request** - Terima dan proses permintaan penjemputan
- 💵 **Set Harga Sampah** - Tentukan harga per kg untuk 7 jenis sampah
- 📍 **Profil Lokasi** - Atur lokasi, jam operasional, dan kapasitas
- 🗺️ **Map Integration** - Tampilkan lokasi TPS di peta
- 📊 **Transaksi & Pembayaran** - Kelola pembayaran ke user

### 👨‍💼 Untuk Admin
- 🔐 **Login Khusus** - Halaman login terpisah untuk keamanan admin (`/admin/login`)
- 📝 **Registrasi Admin** - Daftar admin baru dengan kode rahasia (`/admin/register`)
- 📊 **Dashboard Statistik** - Overview sistem dan aktivitas
- 👥 **User Management** - Kelola semua pengguna dan role
- 📈 **Monitoring** - Pantau pickup request dan transaksi
- 🛡️ **Security** - Verifikasi kode admin untuk pendaftaran

**Manajemen TPS Locations:**
- 🏪 **Kelola Lokasi TPS** - CRUD lengkap untuk master data TPS di Surabaya
- ➕ **Tambah Lokasi TPS** - Form dengan peta interaktif (drag marker/search)
- 📤 **Import Excel TPS** - Import massal dengan template Excel profesional
- 📥 **Download Template** - Template dengan panduan lengkap & contoh data
- 🗑️ **Hapus Lokasi TPS** - Modal konfirmasi dengan detail lokasi

**Manajemen User Accounts:**
- 📤 **Import User/TPS/Admin** - Import akun massal dari Excel
- 🏪 **Daftar TPS Live** - Lihat & copy nama TPS langsung di modal import
- ✅ **Validasi Lengkap** - Check email duplikat, TPS exists, format data
- 📊 **Report Detail** - Success/error per row dengan pesan jelas
- 🗑️ **Reset Akun** - Hapus semua akun berdasarkan role:
  - 👤 Hapus semua USER
  - 🏪 Hapus semua TPS
  - 👨‍💼 Hapus semua ADMIN (kecuali yang login)
  - 🗑️ Reset SEMUA AKUN (kecuali admin yang login)
- 🛡️ **Proteksi Admin** - Admin yang melakukan reset TIDAK akan terhapus
- ⚠️ **Konfirmasi Keamanan** - Ketik "RESET" untuk confirm + modal warning

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
- **Excel Processing:** xlsx 0.18.5 (untuk import TPS)

### Development Tools
- **Language:** TypeScript 5.x
- **Linting:** ESLint 9
- **File Upload:** React Dropzone 14.3.8
- **Password Hashing:** bcryptjs 3.0.3
- **Date Handling:** date-fns 4.1.0

---

## 📁 Arsitektur Folder

```
goclean-update-update21despunyairvan/
├── 📂 src/                                    # Source code utama
│   ├── 📂 app/                                # Next.js App Router (v16)
│   │   │
│   │   ├── 📂 admin/                          # 🔐 Admin Dashboard & Management
│   │   │   ├── page.tsx                       # Admin dashboard utama (statistik)
│   │   │   ├── 📂 login/                      # Login khusus admin (terpisah)
│   │   │   │   └── page.tsx                   # Form login admin dengan validasi role
│   │   │   ├── 📂 register/                   # Registrasi admin baru
│   │   │   │   └── page.tsx                   # Form daftar admin dengan secret code
│   │   │   ├── 📂 tps/                        # ✨ Manajemen Lokasi TPS
│   │   │   │   └── page.tsx                   # CRUD TPS: Tambah, Import Excel, Hapus
│   │   │   ├── 📂 users/                      # Manajemen user
│   │   │   │   └── page.tsx                   # List user, edit role, hapus user
│   │   │   ├── 📂 notifications/              # Notifikasi admin
│   │   │   │   └── page.tsx                   
│   │   │   ├── 📂 pickups/                    # Monitoring semua pickup
│   │   │   │   └── page.tsx                   
│   │   │   ├── 📂 profile/                    # Profil admin
│   │   │   │   └── page.tsx                   
│   │   │   └── 📂 settings/                   # Pengaturan sistem
│   │   │       └── page.tsx                   
│   │   │
│   │   ├── 📂 api/                            # 🔌 Backend API Routes (RESTful)
│   │   │   ├── 📂 auth/                       # Authentication endpoints
│   │   │   │   ├── 📂 [...nextauth]/          # NextAuth.js handlers
│   │   │   │   │   └── route.ts               # Login, logout, session, callbacks
│   │   │   │   └── 📂 register/               # User registration
│   │   │   │       └── route.ts               # POST: Register user/TPS baru
│   │   │   │
│   │   │   ├── 📂 admin/                      # Admin-only endpoints
│   │   │   │   ├── 📂 register/               # Admin registration
│   │   │   │   │   └── route.ts               # POST: Daftar admin dengan secret code
│   │   │   │   ├── 📂 stats/                  # System statistics
│   │   │   │   │   └── route.ts               # GET: Total user, TPS, pickup, transaksi
│   │   │   │   ├── 📂 users/                  # User management API
│   │   │   │   │   └── route.ts               # GET, PUT, DELETE: CRUD users
│   │   │   │   └── 📂 tps-locations/          # ✨ TPS Location Management
│   │   │   │       ├── route.ts               # GET (list), POST (create), DELETE
│   │   │   │       └── 📂 import/             # Import Excel endpoint
│   │   │   │           └── route.ts           # POST: Upload .xlsx, validasi, insert DB
│   │   │   │
│   │   │   ├── 📂 pickups/                    # Pickup request CRUD
│   │   │   │   ├── route.ts                   # GET (list), POST (create)
│   │   │   │   └── 📂 [id]/                   # Dynamic route untuk pickup ID
│   │   │   │       └── route.ts               # GET, PUT, DELETE: Detail & update pickup
│   │   │   │
│   │   │   ├── 📂 tps/                        # TPS-specific endpoints
│   │   │   │   ├── route.ts                   # GET: List TPS
│   │   │   │   ├── 📂 profile/                # TPS profile management
│   │   │   │   │   └── route.ts               # GET, PUT: Profil TPS
│   │   │   │   └── 📂 prices/                 # Waste price management
│   │   │   │       └── route.ts               # GET, POST: Harga sampah per kg
│   │   │   │
│   │   │   ├── 📂 tps-locations/              # Public TPS locations API
│   │   │   │   └── route.ts                   # GET: List lokasi TPS (untuk peta user)
│   │   │   │
│   │   │   ├── 📂 transactions/               # Transaction management
│   │   │   │   └── route.ts                   # GET, POST: Transaksi pembayaran
│   │   │   │
│   │   │   ├── 📂 notifications/              # Notification system
│   │   │   │   └── route.ts                   # GET, PUT: Notifikasi & mark as read
│   │   │   │
│   │   │   └── 📂 user/                       # User endpoints
│   │   │       └── 📂 profile/                # User profile
│   │   │           └── route.ts               # GET, PUT: Update profil, GoPay, WhatsApp
│   │   │
│   │   ├── 📂 dashboard/                      # User/TPS Dashboard
│   │   │   └── page.tsx                       # Dashboard dengan role-based content
│   │   │
│   │   ├── 📂 login/                          # Public Login
│   │   │   └── page.tsx                       # Form login untuk User & TPS
│   │   │
│   │   ├── 📂 register/                       # Public Registration
│   │   │   └── page.tsx                       # Form daftar (pilih role USER/TPS)
│   │   │
│   │   ├── 📂 pickup/                         # 📦 Pickup Request Pages
│   │   │   ├── 📂 new/                        # Create pickup baru
│   │   │   │   └── page.tsx                   # ✨ Form + peta kecamatan + upload media
│   │   │   ├── 📂 history/                    # Riwayat pickup user
│   │   │   │   └── page.tsx                   # List pickup dengan filter status
│   │   │   └── 📂 [id]/                       # Detail pickup
│   │   │       └── page.tsx                   # Info lengkap, status tracking, chat
│   │   │
│   │   ├── 📂 tps/                            # 🏭 TPS-Specific Pages
│   │   │   ├── 📂 map/                        # Peta TPS
│   │   │   │   └── page.tsx                   # Map viewer dengan 51+ TPS markers
│   │   │   ├── 📂 prices/                     # Set harga sampah
│   │   │   │   └── page.tsx                   # Form harga per kg (7 jenis sampah)
│   │   │   ├── 📂 profile/                    # Profil TPS
│   │   │   │   └── page.tsx                   # Edit info TPS, lokasi, jam operasional
│   │   │   ├── 📂 requests/                   # Incoming requests
│   │   │   │   └── page.tsx                   # List pickup request dari user
│   │   │   ├── 📂 transactions/               # TPS transactions
│   │   │   │   └── page.tsx                   # History pembayaran ke user
│   │   │   ├── 📂 pickup/                     # TPS pickup detail
│   │   │   │   └── 📂 [id]/                   
│   │   │   │       └── page.tsx               # Process pickup, input berat, bayar
│   │   │   └── 📂 transaction/                # Transaction detail
│   │   │       └── page.tsx                   
│   │   │
│   │   ├── 📂 transactions/                   # User Transactions
│   │   │   └── page.tsx                       # Riwayat transaksi & pendapatan
│   │   │
│   │   ├── 📂 notifications/                  # Notification Center
│   │   │   └── page.tsx                       # List notifikasi dengan badge
│   │   │
│   │   ├── 📂 profile/                        # User Profile
│   │   │   └── page.tsx                       # Edit profil, GoPay, WhatsApp, avatar
│   │   │
│   │   ├── layout.tsx                         # Root layout (Navbar, Providers)
│   │   ├── page.tsx                           # Landing page (Hero, Features, CTA)
│   │   └── globals.css                        # Global Tailwind v4 styles
│   │
│   ├── 📂 components/                         # ⚛️ Reusable React Components
│   │   ├── MapComponent.tsx                   # Peta Leaflet interaktif (view TPS)
│   │   ├── MediaUploader.tsx                  # Drag & drop upload foto/video
│   │   ├── Navbar.tsx                         # Navigation bar dengan role-based menu
│   │   ├── providers.tsx                      # Context Providers (NextAuth, Toast)
│   │   ├── TPSLocationPicker.tsx              # ✨ Map picker untuk admin (drag marker)
│   │   └── WasteItemSelector.tsx              # Form pilih jenis & berat sampah
│   │
│   ├── 📂 lib/                                # 🛠️ Utility Libraries & Helpers
│   │   ├── auth.ts                            # NextAuth config & role-based access
│   │   ├── prisma.ts                          # Prisma client singleton
│   │   ├── store.ts                           # Zustand global state management
│   │   ├── surabayaKecamatan.ts               # ✨ Array 31 kecamatan Surabaya
│   │   ├── tpsLocations.ts                    # (Deprecated - data sekarang di DB)
│   │   ├── excelTemplate.ts                   # Helper generate template Excel
│   │   └── utils.ts                           # Helper functions (format, validation)
│   │
│   └── 📂 types/                              # 📝 TypeScript Type Definitions
│       └── next-auth.d.ts                     # Extend NextAuth types (role, etc)
│
├── 📂 prisma/                                 # 🗄️ Database Layer (Prisma ORM)
│   ├── schema.prisma                          # Database schema (13 tables)
│   │                                          # - 8 Core: User, TPSProfile, PickupRequest, 
│   │                                          #   WasteItem, Transaction, Notification, WastePrice
│   │                                          # - 1 Master: TPSLocation ✨
│   │                                          # - 5 GIS: Kategori, Kecamatan, ObjekPoint, Jalan, Area
│   ├── seed.ts                                # Database seeder (dummy data)
│   └── 📂 migrations/                         # SQL migrations
│       ├── migration_lock.toml                # Lock file untuk SQL Server
│       ├── add_tps_locations.sql              # ✨ Migration tabel TPSLocation
│       ├── add_gis_layers.sql                 # ✨ Migration GIS layers (opsional)
│       └── 📂 20251210062937_init_sqlserver/  # Initial migration
│           └── migration.sql                  # Create 8 core tables
│
├── 📂 public/                                 # Static Assets
│   ├── 📂 templates/                          # ✨ Template Excel untuk import
│   │   └── template_import_tps.xlsx          # Format import TPS dengan contoh
│   └── 📂 uploads/                            # User-uploaded media (foto/video)
│
├── 📂 my-app/                                 # Legacy folder (deprecated)
│
├── 📄 package.json                            # Dependencies & scripts
├── 📄 package-lock.json                       # Lock file dependencies
├── 📄 tsconfig.json                           # TypeScript compiler config
├── 📄 next.config.ts                          # Next.js configuration
├── 📄 next-env.d.ts                           # Next.js TypeScript declarations
├── 📄 postcss.config.mjs                      # PostCSS & Tailwind v4 config
├── 📄 eslint.config.mjs                       # ESLint v9 config
├── 📄 prisma.config.ts                        # Prisma additional config
├── 📄 vercel.json                             # Vercel deployment config
├── 📄 .env                                    # Environment variables (local)
├── 📄 .gitignore                              # Git ignore rules
│
├── 📄 README.md                               # 📖 This file - Project overview
│
├── 📂 Documentation Files/                    # 📚 Comprehensive Documentation
│   ├── DATABASE-STRUCTURE.md                  # Detail 13 tabel database
│   ├── DATABASE-GIS-STRUCTURE.md              # Struktur GIS layers (Point/Line/Polygon)
│   ├── DEPLOYMENT.md                          # Panduan deploy ke Vercel/Railway
│   ├── DEPLOY-CHECKLIST.md                    # Checklist sebelum production
│   ├── VERCEL-DEPLOY.md                       # Spesifik deployment Vercel
│   ├── SQLSERVER-SETUP.md                     # Install & setup SQL Server 2025
│   ├── SSMS-GUIDE.md                          # Panduan SQL Server Management Studio
│   ├── ENABLE-TCPIP-GUIDE.md                  # Enable TCP/IP di SQL Server
│   ├── SETUP-DATABASE-GIS.md                  # ✨ Setup GIS layers (opsional)
│   ├── FITUR-TAMBAH-LOKASI-TPS.md             # ✨ Panduan tambah TPS (manual/import)
│   ├── FITUR-HAPUS-LOKASI.md                  # ✨ Panduan hapus lokasi pickup
│   ├── FITUR-PICKUP-KECAMATAN.md              # Fitur pickup berdasarkan kecamatan
│   ├── PANDUAN-IMPORT-TPS.md                  # ✨ Import TPS dari Excel (detail)
│   ├── PANDUAN-IMPORT-USERS.md                # Import user massal dari Excel
│   ├── PANDUAN-PICKUP-USER.md                 # User guide untuk fitur pickup
│   ├── DOWNLOAD-DAFTAR-TPS.md                 # Download daftar TPS ke Excel/PDF
│   ├── TROUBLESHOOT-IMPORT-TPS.md             # Troubleshooting import errors
│   ├── migrate-to-postgres.ps1                # PowerShell script migrasi PostgreSQL
│   ├── migrate-to-sqlserver.ps1               # PowerShell script setup SQL Server
│   └── test-sqlserver-connection.ps1          # Test koneksi database
```

---

## 🏗️ Penjelasan Detail Arsitektur

### **1. Frontend Layer - Next.js App Router**

#### **Pages Structure (`src/app/`)**
GoClean menggunakan Next.js 16 App Router dengan file-system routing:
- **Route Mapping:** Setiap folder dengan `page.tsx` menjadi URL route
- **Layout System:** `layout.tsx` untuk shared UI (Navbar, Footer)
- **Dynamic Routes:** Folder `[id]` untuk parameter dinamis
- **Route Groups:** `(auth)`, `(dashboard)` untuk organisasi tanpa URL impact

**Role-Based Routing:**
- `/admin/*` → Hanya Admin (protected dengan middleware)
- `/tps/*` → Hanya TPS role (profile, prices, requests)
- `/pickup/*`, `/profile/*` → User & TPS
- `/login`, `/register` → Public access

#### **Component Architecture**
```typescript
// Hierarki Komponen
└── RootLayout (layout.tsx)
    ├── Providers (NextAuth, Toast, Zustand)
    ├── Navbar (role-based menu)
    └── Page Content
        ├── MapComponent (Leaflet integration)
        ├── MediaUploader (Dropzone)
        ├── WasteItemSelector (Form)
        └── TPSLocationPicker (Admin map)
```

---

### **2. Backend Layer - API Routes**

#### **RESTful API Design**
```
GET    /api/pickups              → List semua pickup
POST   /api/pickups              → Buat pickup baru
GET    /api/pickups/[id]         → Detail pickup
PUT    /api/pickups/[id]         → Update status pickup
DELETE /api/pickups/[id]         → Hapus pickup
```

#### **Authentication Flow**
1. NextAuth.js handles login/logout
2. JWT session stored in cookies
3. Middleware checks role untuk protected routes
4. API endpoints validate session

#### **Admin-Only Endpoints**
```
POST   /api/admin/register       → Daftar admin (requires secret code)
GET    /api/admin/stats          → Dashboard statistics
GET    /api/admin/tps-locations  → List TPS (with pagination)
POST   /api/admin/tps-locations  → Tambah TPS baru
DELETE /api/admin/tps-locations  → Hapus TPS by ID
POST   /api/admin/tps-locations/import → Import Excel
```

---

### **3. Database Layer - Prisma ORM**

#### **Schema Organization**
```prisma
// 8 Core Tables (Business Logic)
- User              → Akun (Admin/TPS/User)
- TPSProfile        → Detail TPS (jam, lokasi, kapasitas)
- WastePrice        → Harga sampah per jenis
- PickupRequest     → Request penjemputan
- WasteItem         → Item sampah dalam pickup
- Transaction       → Transaksi pembayaran
- Notification      → Real-time notifications

// 1 Master Data Table
- TPSLocation ✨    → Master lokasi 51+ TPS Surabaya

// 5 GIS Tables (Optional)
- Kategori          → Kategori objek point
- Kecamatan         → 31 kecamatan Surabaya
- ObjekPoint        → Layer point (fasilitas)
- Jalan             → Layer line (jalan/rute)
- Area              → Layer polygon (batas wilayah)
```

#### **Relational Design**
```
User ─┬─ 1:N ─ PickupRequest (sebagai user)
      ├─ 1:N ─ PickupRequest (sebagai TPS)
      ├─ 1:1 ─ TPSProfile
      ├─ 1:N ─ Transaction
      └─ 1:N ─ Notification

PickupRequest ─┬─ 1:N ─ WasteItem
               └─ 1:1 ─ Transaction

TPSProfile ─── 1:N ─ WastePrice
```

---

### **4. State Management**

#### **Zustand Store (`lib/store.ts`)**
```typescript
interface Store {
  user: User | null;
  tpsList: TPSLocation[];
  notifications: Notification[];
  setUser: (user: User) => void;
  // ... global state
}
```

#### **Server State (React Query Alternative)**
- Menggunakan native React 19 `use()` hook
- Server Components untuk data fetching
- Revalidation dengan `revalidatePath()`

---

### **5. File Upload System**

#### **Media Upload Flow**
1. User drag & drop di `MediaUploader.tsx`
2. File validated (type, size)
3. Upload ke `/public/uploads/`
4. Filename di-hash untuk keamanan
5. URL disimpan di database (JSON array)

#### **Supported Formats**
- **Images:** JPG, PNG, WebP, AVIF
- **Videos:** MP4, WebM, MOV
- **Max Size:** 10MB per file

---

### **6. Map Integration**

#### **Leaflet Configuration**
```typescript
// MapComponent.tsx
- Provider: OpenStreetMap
- Markers: Custom icons untuk TPS
- Clustering: 51+ markers grouped
- Click events: Select TPS/location
- Search: Geocoding dengan Nominatim
```

#### **TPSLocationPicker (Admin)**
- Draggable marker
- Location search
- Click-to-place marker
- Coordinate display
- Kecamatan auto-detect

---

### **7. Excel Import/Export**

#### **Import Pipeline (`xlsx` library)**
1. Upload file .xlsx/.xls
2. Parse dengan `XLSX.read()`
3. Validate struktur (headers, data types)
4. Check duplikat koordinat
5. Verify kecamatan (31 valid values)
6. Bulk insert ke database
7. Return summary (success/errors)

#### **Template Structure**
| Nama TPS | Kecamatan | Alamat | Latitude | Longitude | Jam Operasional | No. Telepon |
|----------|-----------|--------|----------|-----------|-----------------|-------------|

---

### **8. Security Features**

#### **Authentication**
- Password hashing dengan bcrypt (10 rounds)
- JWT session tokens
- CSRF protection (NextAuth built-in)
- Secure cookies (httpOnly, sameSite)

#### **Authorization**
- Role-based access control (RBAC)
- Middleware untuk protected routes
- API endpoint validation
- Admin secret code verification

#### **Input Validation**
- Server-side validation semua inputs
- SQL injection prevention (Prisma parameterized queries)
- XSS protection (React automatic escaping)
- File type/size validation

---

### **9. Performance Optimization**

#### **Frontend**
- Code splitting (automatic dengan Next.js)
- Image optimization (`next/image`)
- Font optimization (local fonts)
- CSS optimization (Tailwind v4 JIT)
- React 19 compiler (Babel plugin)

#### **Backend**
- Database indexing (unique constraints)
- Connection pooling (Prisma)
- API route caching (revalidate)
- Lazy loading components

---

### **10. Development Workflow**

#### **Local Development**
```bash
1. Install dependencies     → npm install
2. Setup environment        → Create .env
3. Start database           → SQL Server running
4. Push schema              → npm run db:push
5. Seed data (optional)     → npm run db:seed
6. Start dev server         → npm run dev
```

#### **Database Workflow**
```bash
# Development
npm run db:push          # Sync schema tanpa migration
npm run db:studio        # Open Prisma Studio GUI

# Production
npm run db:migrate       # Create & run migrations
npm run db:generate      # Generate Prisma Client
```

#### **Build & Deploy**
```bash
npm run build            # Production build
npm run start            # Start production server
```

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
# Database Configuration
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Admin Secret Code (untuk registrasi admin)
ADMIN_SECRET_CODE="GOCLEAN2025"

# Optional: Upload Directory
UPLOAD_DIR="./public/uploads"
```

**Konfigurasi Database:**
- Sesuaikan `localhost:1433` dengan server SQL Server Anda
- Ganti `YourPassword` dengan password SQL Server
- Database `goclean` akan dibuat otomatis saat `db:push`

**NextAuth Secret:**
- Generate secret key dengan: `openssl rand -base64 32`
- Atau gunakan: https://generate-secret.vercel.app/32

**Admin Code:**
- Ganti dengan kode rahasia Anda
- Code ini diperlukan saat registrasi admin di `/admin/register`

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
- **User:** user@goclean.com / user123 → Login di `/login`
- **TPS:** tps@goclean.com / tps123 → Login di `/login`
- **Admin:** admin@goclean.com / admin123 → Login di `/admin/login` (khusus)

**Note:** Admin memiliki halaman login terpisah untuk keamanan tambahan.

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
8. **TPSLocation** - Master data lokasi 31 TPS di Surabaya (✨ Tabel Baru)

### Tabel GIS (Opsional - Untuk Fitur Peta Lanjutan)
9. **Kategori** - Kategori objek point
10. **Kecamatan** - Data 31 kecamatan Surabaya
11. **ObjekPoint** - Layer point untuk lokasi fasilitas
12. **Jalan** - Layer line untuk jalan/rute
13. **Area** - Layer polygon untuk batas wilayah

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
1. **Register Admin** → Daftar dengan kode admin khusus di `/admin/register`
2. **Login Admin** → Login melalui halaman khusus `/admin/login`
3. **Dashboard** → Monitor statistik sistem
4. **User Management** → Kelola user, ubah role, hapus user
5. **TPS Management** → Kelola lokasi TPS:
   - ➕ **Tambah TPS** - Input manual dengan peta interaktif
   - 📤 **Import Excel** - Upload file Excel untuk import massal
   - 🗑️ **Hapus TPS** - Hapus lokasi TPS dengan konfirmasi
   - 📋 **Lihat Daftar** - Monitor 51+ TPS di Surabaya
6. **View Reports** → Lihat semua pickup & transaksi

---

## 🏪 Panduan Manajemen TPS (Admin)

### Menambah Lokasi TPS Baru

#### Cara 1: Tambah Manual
1. Login sebagai admin ke `/admin/login`
2. Navigasi ke halaman **TPS** di menu admin
3. Klik tombol **"Tambah Lokasi TPS"** (hijau)
4. Isi form:
   - Nama TPS (wajib)
   - Kecamatan - pilih dari 31 kecamatan (wajib)
   - Alamat Lengkap (wajib)
   - **Pilih lokasi di peta** - klik atau search lokasi (wajib)
   - Jam Operasional (opsional, default: 06:00 - 18:00)
   - No. Telepon (opsional)
5. Klik **"Tambah Lokasi TPS"**
6. TPS baru langsung tersedia untuk user

#### Cara 2: Import dari Excel
1. Di halaman TPS, klik tombol **"Import Excel"** (biru)
2. Klik **"Download Template Excel"** untuk mendapatkan format
3. Isi template dengan data TPS:
   - Kolom wajib: Nama TPS, Kecamatan, Alamat, Latitude, Longitude
   - Kolom opsional: Jam Operasional, No. Telepon
4. Upload file Excel yang sudah diisi
5. Sistem akan validasi dan import data:
   - ✅ Data valid akan ditambahkan
   - ❌ Data error akan ditampilkan untuk diperbaiki
   - ⚠️ Data duplikat akan dilewati
6. Lihat hasil import di notifikasi

**Format Koordinat GPS:**
- Gunakan format desimal (bukan derajat/menit/detik)
- Contoh: `-7.257472, 112.752090`
- Cara dapat koordinat: Klik kanan di Google Maps → copy koordinat

**Kecamatan Valid:**
31 kecamatan di Surabaya: Asemrowo, Benowo, Bubutan, Bulak, Dukuh Pakis, Gayungan, Genteng, Gubeng, Gunung Anyar, Jambangan, Karang Pilang, Kenjeran, Krembangan, Lakarsantri, Mulyorejo, Pabean Cantian, Pakal, Rungkut, Sambikerep, Sawahan, Semampir, Simokerto, Sukolilo, Sukomanunggal, Tambaksari, Tandes, Tegalsari, Tenggilis Mejoyo, Wiyung, Wonocolo, Wonokromo

### Menghapus Lokasi TPS
1. Di daftar TPS, klik tombol **"Hapus"** (merah) di TPS yang ingin dihapus
2. Modal konfirmasi akan muncul dengan detail TPS
3. Baca informasi dengan teliti
4. Klik **"Ya, Hapus"** untuk konfirmasi atau **"Batal"** untuk membatalkan
5. TPS yang dihapus akan hilang dari:
   - Daftar TPS di admin
   - Pilihan lokasi pickup user
   - Peta TPS

**⚠️ Perhatian:** Data yang dihapus tidak dapat dikembalikan!

---

## 🚀 Roadmap & Fitur Mendatang

### 🔜 Coming Soon
- [ ] Export data TPS ke Excel/CSV
- [ ] Edit lokasi TPS yang sudah ada
- [ ] Bulk edit/delete TPS locations
- [ ] Advanced filtering & search di daftar TPS
- [ ] Upload foto TPS
- [ ] Rating & review sistem untuk TPS
- [ ] Real-time tracking GPS untuk TPS saat pickup
- [ ] Push notifications (PWA)
- [ ] Mobile app (React Native)

### 💡 Under Consideration
- [ ] Integration dengan payment gateway (Midtrans/Xendit)
- [ ] Gamification & rewards system
- [ ] AI untuk prediksi harga sampah
- [ ] Analytics dashboard dengan chart.js
- [ ] Multi-language support (ID/EN)

Lihat [GitHub Issues](#) untuk request fitur atau laporkan bug.

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
- `POST /api/admin/register` - Register admin dengan secret code
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users` - Update user role
- `DELETE /api/admin/users` - Delete user
- `POST /api/admin/users/reset` - ✨ Reset akun berdasarkan role (USER/TPS/ADMIN/ALL)
- `POST /api/admin/users/import` - ✨ Import user/TPS/admin dari Excel
- `GET /api/admin/users/import` - ✨ Get daftar TPS tersedia untuk import
- `GET /api/admin/tps-locations` - ✨ List semua lokasi TPS
- `POST /api/admin/tps-locations` - ✨ Tambah lokasi TPS baru
- `DELETE /api/admin/tps-locations?id=xxx` - ✨ Hapus lokasi TPS
- `POST /api/admin/tps-locations/import` - ✨ Import TPS locations dari Excel

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
| [FITUR-TAMBAH-LOKASI-TPS.md](FITUR-TAMBAH-LOKASI-TPS.md) | ✨ Panduan tambah lokasi TPS (Admin) |
| [PANDUAN-IMPORT-TPS.md](PANDUAN-IMPORT-TPS.md) | ✨ Panduan import TPS dari Excel |
| [PANDUAN-IMPORT-USERS.md](PANDUAN-IMPORT-USERS.md) | ✨ Panduan import user/TPS/admin dari Excel |
| [PANDUAN-PICKUP-USER.md](PANDUAN-PICKUP-USER.md) | Panduan lengkap pickup untuk user |
| [TROUBLESHOOT-IMPORT-TPS.md](TROUBLESHOOT-IMPORT-TPS.md) | ✨ Troubleshooting import TPS errors |
| [SETUP-DATABASE-GIS.md](SETUP-DATABASE-GIS.md) | ✨ Setup GIS layers (Point, Line, Polygon) |
| [SQLSERVER-SETUP.md](SQLSERVER-SETUP.md) | Setup SQL Server 2025 |
| [SSMS-GUIDE.md](SSMS-GUIDE.md) | Panduan SQL Server Management Studio |
| [ENABLE-TCPIP-GUIDE.md](ENABLE-TCPIP-GUIDE.md) | Enable TCP/IP di SQL Server |
| [DOWNLOAD-DAFTAR-TPS.md](DOWNLOAD-DAFTAR-TPS.md) | Download daftar TPS ke Excel/CSV |

---

## 🎯 Fitur Unggulan

### 🗺️ Integrasi Peta Interaktif
- **51+ TPS** di seluruh 31 kecamatan Surabaya (data dari database)
- Click-to-select lokasi pickup dengan marker merah
- Real-time TPS markers di peta
- Distance calculation
- Pilihan berdasarkan kecamatan (dropdown 31 kecamatan)
- ✨ **Hapus marker** - Batalkan lokasi yang dipilih dengan tombol X
- ✨ **Admin map picker** - Peta interaktif untuk menambah TPS baru

### 📸 Media Upload
- Drag & drop foto/video
- Preview before upload
- Multiple file support
- Size validation

### 💳 Payment Integration
- GoPay integration ready
- WhatsApp notification support
- Transaction tracking

### 🔐 Admin Security
- Halaman login terpisah (`/admin/login`)
- Registrasi admin dengan kode rahasia
- Role verification setelah login
- Protected routes dengan NextAuth

### 🏪 Manajemen TPS (Admin)
- ➕ **Tambah Lokasi TPS** - Form dengan peta interaktif (drag marker atau search)
- 📤 **Import Excel TPS** - Upload file .xlsx untuk import massal dengan template profesional
- 📥 **Download Template** - Template Excel dengan 2 sheet (Data + Panduan lengkap)
- 🗑️ **Hapus TPS** - Modal konfirmasi sebelum menghapus
- 📋 **Daftar TPS** - View semua TPS dengan status aktif/nonaktif
- 🗺️ **Link Google Maps** - Tombol "Lihat di Peta" untuk setiap TPS
- ✅ **Validasi Data** - Cek duplikat, format koordinat, kecamatan valid

### 👥 Manajemen User (Admin)
- 📤 **Import User/TPS/Admin** - Upload Excel untuk buat akun massal
- 🏪 **Daftar TPS Live** - Modal import menampilkan daftar TPS dengan click-to-copy
- ✅ **Validasi Real-time** - Check email duplikat, TPS exists, format data
- 📊 **Report Detail** - Success/error untuk setiap row dengan pesan jelas
- 🗑️ **Reset Akun** - Hapus akun berdasarkan role dengan 4 pilihan:
  - 👤 Hapus semua USER
  - 🏪 Hapus semua TPS
  - 👨‍💼 Hapus semua ADMIN (kecuali yang login)
  - 🗑️ Reset SEMUA AKUN (kecuali admin yang login)
- 🛡️ **Proteksi Admin** - Admin yang melakukan reset TIDAK akan terhapus
- ⚠️ **Konfirmasi Keamanan** - Ketik "RESET" untuk confirm + warning modal
- 📊 **Statistik Live** - Tampilan jumlah akun yang akan dihapus

### 🔔 Real-time Notifications
- Status update otomatis
- In-app notifications
- Badge counter

---

## 📊 Statistik Proyek

- 📁 **13 Database Tables** (8 core + 5 GIS)
- 🗺️ **51+ TPS Locations** di 31 kecamatan Surabaya
- 🔌 **35+ API Endpoints** (REST) - termasuk import, reset, & management
- 🎨 **20+ Components** (React)
- 📄 **30+ Pages** (Next.js App Router)
- 👥 **3 User Roles** (Admin, TPS, User)
- 🗑️ **7 Waste Types** (Organik, Plastik, Kertas, Logam, Kaca, Elektronik, Lainnya)
- 📝 **18+ Documentation Files** (.md)
- 📤 **2 Import Systems** (TPS Locations & User Accounts)
- 🛡️ **1 Reset System** (Multi-role account management)

---

## 🤝 Kontributor

Project ini dikembangkan untuk tugas kuliah **Matematika ITS** sebagai aplikasi manajemen sampah berbasis web dengan integrasi GIS (Geographic Information System).

### Tech Stack Highlights
- ✅ Next.js 16 App Router dengan React 19
- ✅ TypeScript untuk type safety
- ✅ Tailwind CSS v4 untuk styling modern
- ✅ Prisma ORM dengan SQL Server
- ✅ NextAuth untuk authentication & authorization
- ✅ Leaflet untuk interactive maps
- ✅ Role-based access control (RBAC)

### Fitur Unggulan
- 🗺️ Peta interaktif dengan 51+ lokasi TPS
- 📤 Import/Export Excel untuk manajemen data
- 🔐 Multi-level authentication (User/TPS/Admin)
- 📊 Dashboard analytics & statistics
- 🗄️ Database dengan GIS layers

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

## ❓ FAQ (Frequently Asked Questions)

### Umum

**Q: Apa perbedaan antara User dan TPS?**
A: User adalah masyarakat yang ingin menjual sampahnya, TPS adalah tempat pembuangan sampah yang membeli sampah dari user.

**Q: Bagaimana cara mendapatkan akun Admin?**
A: Daftar di `/admin/register` dengan kode admin khusus (`ADMIN_SECRET_CODE` di file `.env`).

### Admin - Manajemen TPS

**Q: Bagaimana cara menambah lokasi TPS baru?**
A: Ada 2 cara:
1. Manual: Klik "Tambah Lokasi TPS" dan isi form dengan peta interaktif
2. Import Excel: Upload file .xlsx dengan format template

**Q: Format koordinat GPS yang benar?**
A: Gunakan format desimal, contoh: `-7.257472, 112.752090` (bukan format derajat/menit/detik)

**Q: Apa yang terjadi jika TPS dihapus?**
A: TPS akan hilang dari daftar, peta, dan tidak bisa dipilih user untuk pickup. Data tidak bisa dikembalikan.

**Q: Bagaimana cara mendapatkan koordinat GPS suatu lokasi?**
A: Klik kanan di Google Maps pada lokasi → koordinat akan muncul dan bisa di-copy.

**Q: Apakah bisa import TPS lebih dari 100 sekaligus?**
A: Ya, tidak ada batasan jumlah. Sistem akan validasi semua data dan memberikan laporan error jika ada.

### Database

**Q: Apakah bisa menggunakan PostgreSQL?**
A: Ya, lihat panduan di [DEPLOYMENT.md](DEPLOYMENT.md) untuk migrasi ke PostgreSQL.

**Q: Bagaimana cara reset database?**
A: Jalankan `npm run db:push` untuk reset schema, lalu `npm run db:seed` untuk isi data dummy.

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