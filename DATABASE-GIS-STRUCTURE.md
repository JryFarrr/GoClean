# 🗺️ Struktur Database GIS - GoClean

## Overview

Database GoClean telah disesuaikan dengan struktur data minimal GIS yang mencakup **3 layer wajib**:

1. **Layer Point** - Lokasi fasilitas (TPS, Bank Sampah, Drop Box)
2. **Layer Line** - Jalan/rute pengangkutan sampah
3. **Layer Polygon** - Batas area kecamatan

---

## 📊 Struktur Database GIS

### Tabel Pendukung

#### 1. **Kategori**
Tabel untuk mengkategorikan objek point (fasilitas).

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | ID unik kategori |
| `namaKategori` | String | Nama kategori (TPS, Bank Sampah, Drop Box) |
| `deskripsi` | String? | Deskripsi kategori |
| `createdAt` | DateTime | Tanggal dibuat |
| `updatedAt` | DateTime | Tanggal update |

**Relasi:**
- 1 Kategori → Many ObjekPoint

**Contoh Data:**
- TPS (Tempat Pembuangan Sampah)
- Bank Sampah
- Drop Box

---

#### 2. **Kecamatan**
Tabel untuk data kecamatan di Surabaya.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | ID unik kecamatan |
| `namaKecamatan` | String | Nama kecamatan |
| `kodeKecamatan` | String? | Kode singkatan (GBG, TGS, dll) |
| `createdAt` | DateTime | Tanggal dibuat |
| `updatedAt` | DateTime | Tanggal update |

**Relasi:**
- 1 Kecamatan → Many ObjekPoint
- 1 Kecamatan → Many Area

**Contoh Data:**
- Gubeng (GBG)
- Tegalsari (TGS)
- Genteng (GTG)
- Bubutan (BBT)
- Simokerto (SMK)
- Pabean Cantian (PBC)
- Semampir (SMP)
- Krembangan (KRB)
- Kenjeran (KNJ)
- Bulak (BLK)

---

### 🎯 Layer 1: POINT - Lokasi Fasilitas

#### **Tabel: objekPoint**

Menyimpan lokasi fasilitas seperti TPS, Bank Sampah, Drop Box dengan koordinat geografis.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `PointID` | String (PK) | NO | Primary Key |
| `NamaObjek` | String | NO | Nama fasilitas |
| `KategoriID` | String (FK) | NO | Foreign Key → Kategori.id |
| `Latitude` | Float | NO | Koordinat latitude |
| `Longitude` | Float | NO | Koordinat longitude |
| `Deskripsi` | String | YES | Deskripsi fasilitas |
| `KecamatanID` | String (FK) | NO | Foreign Key → Kecamatan.id |
| `createdAt` | DateTime | NO | Tanggal dibuat |
| `updatedAt` | DateTime | NO | Tanggal update |

**Contoh Data:**
```json
{
  "PointID": "point-001",
  "NamaObjek": "TPS Gubeng",
  "KategoriID": "kat-tps-001",
  "Latitude": -7.265123,
  "Longitude": 112.751890,
  "Deskripsi": "TPS utama kecamatan Gubeng dengan fasilitas lengkap",
  "KecamatanID": "kec-001"
}
```

**Use Case:**
- Menampilkan marker TPS di peta
- Pencarian fasilitas terdekat dari user
- Filter fasilitas berdasarkan kategori
- Informasi detail fasilitas

---

### 🛣️ Layer 2: LINE - Jalan/Rute

#### **Tabel: Jalan**

Menyimpan rute pengangkutan sampah dalam format GeoJSON polyline.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `JalanID` | String (PK) | NO | Primary Key |
| `NamaJalan` | String | NO | Nama rute |
| `KoordinatJSON` | String (Max) | NO | Polyline GeoJSON |
| `createdAt` | DateTime | NO | Tanggal dibuat |
| `updatedAt` | DateTime | NO | Tanggal update |

**Format GeoJSON (LineString):**
```json
{
  "type": "LineString",
  "coordinates": [
    [112.751890, -7.265123],  // [longitude, latitude]
    [112.748901, -7.266234],
    [112.745678, -7.268189],
    [112.741371, -7.265757]
  ]
}
```

**Contoh Data:**
```json
{
  "JalanID": "jalan-001",
  "NamaJalan": "Rute Pengangkutan Gubeng-Genteng",
  "KoordinatJSON": "{\"type\":\"LineString\",\"coordinates\":[[112.751890,-7.265123],[112.741371,-7.265757]]}"
}
```

**Use Case:**
- Menampilkan rute pengangkutan di peta
- Tracking perjalanan truk sampah
- Optimisasi rute pickup
- Estimasi waktu tempuh

---

### 🗺️ Layer 3: POLYGON - Batas Area Kecamatan

#### **Tabel: Area**

Menyimpan batas wilayah kecamatan dalam format GeoJSON polygon.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `AreaID` | String (PK) | NO | Primary Key |
| `NamaArea` | String | NO | Nama area |
| `PolygonJSON` | String (Max) | NO | Polygon GeoJSON |
| `KecamatanID` | String (FK) | YES | Foreign Key → Kecamatan.id |
| `createdAt` | DateTime | NO | Tanggal dibuat |
| `updatedAt` | DateTime | NO | Tanggal update |

**Format GeoJSON (Polygon):**
```json
{
  "type": "Polygon",
  "coordinates": [[
    [112.745, -7.260],  // [longitude, latitude]
    [112.760, -7.260],
    [112.760, -7.270],
    [112.745, -7.270],
    [112.745, -7.260]   // Close the ring
  ]]
}
```

**Contoh Data:**
```json
{
  "AreaID": "area-001",
  "NamaArea": "Area Kecamatan Gubeng",
  "PolygonJSON": "{\"type\":\"Polygon\",\"coordinates\":[[[112.745,-7.260],[112.760,-7.260],[112.760,-7.270],[112.745,-7.270],[112.745,-7.260]]]}",
  "KecamatanID": "kec-001"
}
```

**Use Case:**
- Menampilkan batas wilayah kecamatan di peta
- Deteksi pickup request masuk area mana
- Statistik sampah per kecamatan
- Visualisasi coverage area TPS

---

## 🗄️ Entity Relationship Diagram

```
┌─────────────┐
│  Kategori   │
│   (Master)  │
└──────┬──────┘
       │ 1
       │
       │ M
┌──────▼──────────────┐
│   ObjekPoint        │◄──────┐
│  (Layer Point)      │       │ M
│  - PointID (PK)     │       │
│  - NamaObjek        │       │
│  - KategoriID (FK)  │       │ 1
│  - Latitude         │  ┌────┴──────┐
│  - Longitude        │  │ Kecamatan │
│  - KecamatanID (FK) │  │  (Master) │
└─────────────────────┘  └────┬──────┘
                              │ 1
                              │
┌─────────────────────┐       │ M
│      Jalan          │  ┌────▼──────┐
│   (Layer Line)      │  │   Area    │
│  - JalanID (PK)     │  │ (Polygon) │
│  - NamaJalan        │  │           │
│  - KoordinatJSON    │  │ - AreaID  │
└─────────────────────┘  │ - PolygonJSON
                         │ - KecamatanID (FK)
                         └───────────┘
```

---

## 🚀 Setup Database

### 1. Generate Prisma Client
```bash
npm run db:generate
# atau
npx prisma generate
```

### 2. Push Schema ke Database
```bash
npm run db:push
# atau
npx prisma db push
```

### 3. Run Migration (Production)
```bash
npm run db:migrate
# atau
npx prisma migrate dev --name add_gis_layers
```

### 4. Seed Data
```bash
npm run db:seed
# atau
npx ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts
```

**Output Seed:**
```
Seeding database...
Created admin: admin@goclean.id
Created TPS user: tps1@goclean.id
Created TPS user: tps2@goclean.id
Created regular user: user1@goclean.id
Created regular user: user2@goclean.id

Seeding GIS Layers...
Created Kategori
Created 10 Kecamatan
Created 3 ObjekPoint (Layer Point)
Created 2 Jalan (Layer Line)
Created 3 Area (Layer Polygon)

GIS Layers seeding completed!
```

---

## 📝 Query Examples

### 1. Get All Fasilitas dengan Kategori dan Kecamatan
```typescript
const fasilitas = await prisma.objekPoint.findMany({
  include: {
    kategori: true,
    kecamatan: true
  }
})
```

### 2. Get Fasilitas by Kecamatan
```typescript
const fasilitasGubeng = await prisma.objekPoint.findMany({
  where: {
    kecamatanId: 'kec-001' // Gubeng
  },
  include: {
    kategori: true
  }
})
```

### 3. Get All Rute dengan Parsing GeoJSON
```typescript
const routes = await prisma.jalan.findMany()
const routesWithGeo = routes.map(route => ({
  ...route,
  coordinates: JSON.parse(route.koordinatJSON)
}))
```

### 4. Get Area Polygon by Kecamatan
```typescript
const areaGubeng = await prisma.area.findFirst({
  where: {
    kecamatanId: 'kec-001'
  },
  include: {
    kecamatan: true
  }
})

const polygon = JSON.parse(areaGubeng.polygonJSON)
```

### 5. Get Fasilitas dalam Radius (Spatial Query)
```typescript
// Helper function untuk calculate distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Get all fasilitas
const allFasilitas = await prisma.objekPoint.findMany()

// Filter by distance (< 5km)
const userLat = -7.265
const userLng = 112.751
const nearbyFasilitas = allFasilitas.filter(f => 
  getDistance(userLat, userLng, f.latitude, f.longitude) < 5
)
```

---

## 🎨 Visualisasi di Leaflet

### 1. Tampilkan Point Markers
```typescript
import L from 'leaflet'

// Get data from API
const fasilitas = await fetch('/api/gis/fasilitas').then(r => r.json())

// Add markers to map
fasilitas.forEach(f => {
  const marker = L.marker([f.Latitude, f.Longitude])
    .bindPopup(`<b>${f.NamaObjek}</b><br>${f.Deskripsi}`)
    .addTo(map)
})
```

### 2. Tampilkan Line (Rute)
```typescript
// Get data from API
const routes = await fetch('/api/gis/jalan').then(r => r.json())

routes.forEach(route => {
  const geoJson = JSON.parse(route.KoordinatJSON)
  
  L.geoJSON(geoJson, {
    style: {
      color: '#3388ff',
      weight: 4
    }
  }).bindPopup(route.NamaJalan).addTo(map)
})
```

### 3. Tampilkan Polygon (Area)
```typescript
// Get data from API
const areas = await fetch('/api/gis/area').then(r => r.json())

areas.forEach(area => {
  const geoJson = JSON.parse(area.PolygonJSON)
  
  L.geoJSON(geoJson, {
    style: {
      color: '#10B981',
      fillColor: '#10B981',
      fillOpacity: 0.2,
      weight: 2
    }
  }).bindPopup(area.NamaArea).addTo(map)
})
```

---

## 📊 Data Statistics

### Seed Data Yang Dibuat:

| Layer | Jumlah | Keterangan |
|-------|--------|------------|
| **Kategori** | 3 | TPS, Bank Sampah, Drop Box |
| **Kecamatan** | 10 | Gubeng, Tegalsari, Genteng, dll |
| **ObjekPoint** | 3 | TPS Gubeng, Bank Sampah Tegalsari, Drop Box Genteng |
| **Jalan** | 2 | Rute Gubeng-Genteng, Rute Tegalsari-Genteng |
| **Area** | 3 | Area Gubeng, Tegalsari, Genteng |

---

## 🔧 API Routes (Recommendation)

### 1. GET /api/gis/fasilitas
```typescript
// Get all fasilitas (Layer Point)
export async function GET() {
  const fasilitas = await prisma.objekPoint.findMany({
    include: {
      kategori: true,
      kecamatan: true
    }
  })
  return NextResponse.json(fasilitas)
}
```

### 2. GET /api/gis/jalan
```typescript
// Get all rute (Layer Line)
export async function GET() {
  const routes = await prisma.jalan.findMany()
  return NextResponse.json(routes)
}
```

### 3. GET /api/gis/area
```typescript
// Get all area (Layer Polygon)
export async function GET() {
  const areas = await prisma.area.findMany({
    include: {
      kecamatan: true
    }
  })
  return NextResponse.json(areas)
}
```

### 4. GET /api/gis/kecamatan/[id]
```typescript
// Get kecamatan dengan semua data GIS
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const kecamatan = await prisma.kecamatan.findUnique({
    where: { id: params.id },
    include: {
      objekPoints: {
        include: { kategori: true }
      },
      areas: true
    }
  })
  return NextResponse.json(kecamatan)
}
```

---

## ✅ Checklist Implementasi

- [x] ✅ Tabel Kategori (Master)
- [x] ✅ Tabel Kecamatan (Master)
- [x] ✅ Tabel ObjekPoint (Layer Point)
- [x] ✅ Tabel Jalan (Layer Line)
- [x] ✅ Tabel Area (Layer Polygon)
- [x] ✅ Relations & Foreign Keys
- [x] ✅ Seed data untuk semua layer
- [x] ✅ GeoJSON support
- [ ] 🔲 API routes untuk GIS
- [ ] 🔲 Frontend integration dengan Leaflet
- [ ] 🔲 CRUD operations untuk admin

---

## 🎯 Next Steps

1. **Buat API Routes** untuk akses data GIS
2. **Integrate dengan MapComponent** untuk visualisasi
3. **Admin Panel** untuk CRUD fasilitas, rute, dan area
4. **Spatial Analysis** untuk optimasi rute & coverage
5. **Real-time Tracking** menggunakan rute yang ada

---

**Database GIS structure sudah siap digunakan!** 🎉
