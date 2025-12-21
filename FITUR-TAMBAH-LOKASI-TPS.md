# Panduan Menambahkan Fitur Lokasi TPS

## Langkah-langkah Setup

### 1. Jalankan Migration Database

Jalankan migration untuk membuat tabel TPSLocations:

```powershell
# Generate Prisma Client dengan schema terbaru
npx prisma generate

# Push schema ke database
npx prisma db push
```

Atau jika ingin menggunakan migration file SQL secara manual:
```powershell
# Jalankan SQL migration file
# Buka SQL Server Management Studio (SSMS)
# Connect ke database Anda
# Jalankan file: prisma/migrations/add_tps_locations.sql
```

### 2. Seed Data TPS (Opsional)

Untuk mengisi data TPS awal dari tpsLocations.ts ke database, buat file seed:

```typescript
// prisma/seed-tps-locations.ts
import { PrismaClient } from '@prisma/client'
import { tpsLocations } from '../src/lib/tpsLocations'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding TPS Locations...')
  
  for (const tps of tpsLocations) {
    await prisma.tPSLocation.create({
      data: {
        name: tps.name,
        kecamatan: tps.kecamatan,
        address: tps.address,
        latitude: tps.latitude,
        longitude: tps.longitude,
        operatingHours: tps.operatingHours || '06:00 - 18:00',
        phone: tps.phone || null
      }
    })
  }
  
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Jalankan seed:
```powershell
npx ts-node prisma/seed-tps-locations.ts
```

### 3. Restart Development Server

```powershell
npm run dev
```

## Fitur yang Ditambahkan

### 1. Admin - Tambah Lokasi TPS
- Halaman: `/admin/tps`
- Button "Tambah Lokasi TPS" di kanan atas
- Form modal untuk input:
  - Nama TPS *
  - Kecamatan *
  - Alamat Lengkap *
  - Latitude *
  - Longitude *
  - Jam Operasional
  - Nomor Telepon

### 2. Data Tersimpan di Database
- Model: `TPSLocation`
- Table: `TPSLocations`
- API Endpoint:
  - `GET /api/tps-locations` - Ambil semua lokasi TPS aktif (public)
  - `POST /api/admin/tps-locations` - Tambah lokasi TPS baru (admin only)
  - `GET /api/admin/tps-locations` - Ambil semua lokasi TPS termasuk yang tidak aktif (admin only)

### 3. Integrasi Otomatis
Lokasi TPS yang ditambahkan akan otomatis muncul di:
- ✅ Form registrasi akun TPS (dropdown pilih TPS)
- ✅ Form tambah user TPS di admin (dropdown pilih TPS)
- ✅ Pilihan penjemputan sampah oleh user (akan diupdate)
- ✅ Peta lokasi TPS (akan diupdate)

### 4. Update Dynamic
- Data TPS sekarang diambil dari database, bukan dari file static
- Admin dapat menambah lokasi TPS baru kapan saja
- Tidak perlu update kode atau restart server untuk menambah TPS baru
- Data langsung tersedia untuk semua fitur

## Testing

1. Login sebagai Admin
2. Buka halaman "Daftar TPS"
3. Klik button "Tambah Lokasi TPS"
4. Isi form dan submit
5. Cek halaman registrasi TPS - lokasi baru harus muncul di dropdown
6. Cek halaman admin tambah user (role TPS) - lokasi baru harus muncul di dropdown

## Notes

- Lokasi TPS memiliki flag `isActive` untuk soft delete
- Hanya lokasi TPS yang aktif yang ditampilkan di frontend
- Admin dapat menambah lokasi TPS tanpa batas
- Data koordinat (latitude/longitude) mendukung desimal
