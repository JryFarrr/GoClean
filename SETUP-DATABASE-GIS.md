# 🚀 Setup Database GIS - Panduan Lengkap

## 📋 Prerequisites

- ✅ SQL Server 2025 sudah terinstall
- ✅ Node.js dan npm sudah terinstall
- ✅ File `.env` sudah dikonfigurasi dengan `DATABASE_URL`

---

## 🔧 Langkah-Langkah Setup

### **Step 1: Generate Prisma Client**

Generate Prisma Client berdasarkan schema yang sudah diupdate.

```bash
npm run db:generate
```

**Atau:**
```bash
npx prisma generate
```

**Output:**
```
✔ Generated Prisma Client (5.x.x | library) to ./node_modules/@prisma/client
```

---

### **Step 2: Push Schema ke Database**

Push schema ke database tanpa membuat migration files (cocok untuk development).

```bash
npm run db:push
```

**Atau:**
```bash
npx prisma db push
```

**Output:**
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQL Server database "goclean"

🚀  Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client (5.x.x | library) to ./node_modules/@prisma/client
```

**Tabel yang dibuat:**
- ✅ Kategori
- ✅ Kecamatan
- ✅ objekPoint (Layer Point)
- ✅ Jalan (Layer Line)
- ✅ Area (Layer Polygon)

---

### **Step 3: Seed Database**

Isi database dengan data awal (demo accounts + GIS layers).

```bash
npm run db:seed
```

**Atau:**
```bash
npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts
```

**Output:**
```
Seeding database...
Created admin: admin@goclean.id
Created TPS user: tps1@goclean.id
Created TPS user: tps2@goclean.id
Created regular user: user1@goclean.id
Created regular user: user2@goclean.id
Created TPS profile: TPS Jakarta Pusat
Created TPS profile: TPS Jakarta Selatan
Created pickup request: [ID]
Created pickup request: [ID]

Seeding GIS Layers...
Created Kategori
Created 10 Kecamatan
Created 3 ObjekPoint (Layer Point)
Created 2 Jalan (Layer Line)
Created 3 Area (Layer Polygon)

GIS Layers seeding completed!

=== Demo Accounts ===
Admin: admin@goclean.id / admin123
TPS 1: tps1@goclean.id / tps123
TPS 2: tps2@goclean.id / tps123
User 1: user1@goclean.id / user123
User 2: user2@goclean.id / user123
=====================

Seeding completed!
```

---

### **Step 4: Verify Database**

Buka Prisma Studio untuk melihat data yang sudah dibuat.

```bash
npm run db:studio
```

**Atau:**
```bash
npx prisma studio
```

**Browser akan terbuka di:** `http://localhost:5555`

**Cek tabel-tabel berikut:**
1. ✅ **Kategori** - 3 records (TPS, Bank Sampah, Drop Box)
2. ✅ **Kecamatan** - 10 records (Gubeng, Tegalsari, dll)
3. ✅ **objekPoint** - 3 records (TPS Gubeng, Bank Sampah Tegalsari, Drop Box Genteng)
4. ✅ **Jalan** - 2 records (Rute pengangkutan)
5. ✅ **Area** - 3 records (Polygon kecamatan)

---

## 🔄 Alternatif: Menggunakan Migration (Production)

Jika Anda ingin membuat migration files untuk tracking perubahan:

### **1. Create Migration**
```bash
npx prisma migrate dev --name add_gis_layers
```

### **2. Apply Migration (Production)**
```bash
npx prisma migrate deploy
```

---

## 🧪 Testing Database

### **Test 1: Query Fasilitas**

```typescript
// test-gis.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testGIS() {
  // Test Layer Point
  const fasilitas = await prisma.objekPoint.findMany({
    include: {
      kategori: true,
      kecamatan: true
    }
  })
  console.log('📍 Fasilitas:', fasilitas)

  // Test Layer Line
  const routes = await prisma.jalan.findMany()
  console.log('🛣️ Routes:', routes)

  // Test Layer Polygon
  const areas = await prisma.area.findMany({
    include: {
      kecamatan: true
    }
  })
  console.log('🗺️ Areas:', areas)
}

testGIS()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run test:**
```bash
npx ts-node test-gis.ts
```

---

## 📊 Struktur Data yang Dibuat

### **Kategori (3 records)**
```
1. TPS (Tempat Pembuangan Sampah)
2. Bank Sampah
3. Drop Box
```

### **Kecamatan (10 records)**
```
1. Gubeng (GBG)
2. Tegalsari (TGS)
3. Genteng (GTG)
4. Bubutan (BBT)
5. Simokerto (SMK)
6. Pabean Cantian (PBC)
7. Semampir (SMP)
8. Krembangan (KRB)
9. Kenjeran (KNJ)
10. Bulak (BLK)
```

### **ObjekPoint (3 records)**
```
1. TPS Gubeng
   - Kategori: TPS
   - Koordinat: -7.265123, 112.751890
   - Kecamatan: Gubeng

2. Bank Sampah Tegalsari
   - Kategori: Bank Sampah
   - Koordinat: -7.268189, 112.737892
   - Kecamatan: Tegalsari

3. Drop Box Genteng
   - Kategori: Drop Box
   - Koordinat: -7.265757, 112.741371
   - Kecamatan: Genteng
```

### **Jalan (2 records)**
```
1. Rute Pengangkutan Gubeng-Genteng
   - Start: TPS Gubeng
   - End: Drop Box Genteng
   - Format: LineString GeoJSON

2. Rute Pengangkutan Tegalsari-Genteng
   - Start: Bank Sampah Tegalsari
   - End: Drop Box Genteng
   - Format: LineString GeoJSON
```

### **Area (3 records)**
```
1. Area Kecamatan Gubeng
   - Polygon GeoJSON batas wilayah
   
2. Area Kecamatan Tegalsari
   - Polygon GeoJSON batas wilayah
   
3. Area Kecamatan Genteng
   - Polygon GeoJSON batas wilayah
```

---

## 🐛 Troubleshooting

### **Error: Cannot find module '@prisma/client'**
```bash
npm install
npm run db:generate
```

### **Error: Database connection failed**
Cek file `.env`:
```env
DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPassword;trustServerCertificate=true;encrypt=false"
```

### **Error: Table already exists**
Drop semua tabel atau reset database:
```bash
# HATI-HATI: Ini akan menghapus semua data!
npx prisma db push --force-reset
npm run db:seed
```

### **Error saat Seed**
Pastikan database kosong atau hapus data existing:
```sql
-- Di SQL Server Management Studio (SSMS)
DELETE FROM objekPoint;
DELETE FROM Jalan;
DELETE FROM Area;
DELETE FROM Kategori;
DELETE FROM Kecamatan;
```

---

## ✅ Checklist Setup

- [ ] ✅ Run `npm run db:generate`
- [ ] ✅ Run `npm run db:push`
- [ ] ✅ Run `npm run db:seed`
- [ ] ✅ Verify di Prisma Studio
- [ ] ✅ Test query di code
- [ ] ✅ Ready untuk development!

---

## 🎯 Next Steps

Setelah database setup selesai:

1. **Buat API Routes** untuk GIS layers
2. **Integrate dengan Frontend** (MapComponent)
3. **Admin Panel** untuk manage data GIS
4. **Test di Development Mode**
5. **Deploy ke Production**

---

## 📞 Help & Support

Jika mengalami masalah:

1. Cek error message di console
2. Verify database connection string
3. Pastikan SQL Server running
4. Cek Prisma Studio untuk verify data
5. Lihat documentation: [DATABASE-GIS-STRUCTURE.md](DATABASE-GIS-STRUCTURE.md)

---

**Setup database GIS selesai! 🎉**

Struktur 3 layer GIS (Point, Line, Polygon) sudah siap digunakan.
