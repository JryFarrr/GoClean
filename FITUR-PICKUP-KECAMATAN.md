# 📍 Fitur Pickup Request dengan Integrasi TPS Kecamatan

## 🎯 Overview

Fitur baru ini memungkinkan user untuk memilih lokasi pickup dengan cara yang lebih mudah melalui:
1. **Daftar Kecamatan** - Pilih dari 31 kecamatan di Surabaya
2. **Peta Interaktif** - Lihat dan klik langsung TPS pada peta
3. **TPS Markers** - Semua lokasi TPS ditampilkan dengan marker 🏭

---

## 🗂️ File yang Dibuat/Dimodifikasi

### 1. **src/lib/tpsLocations.ts** (BARU)
File data master untuk semua lokasi TPS di Surabaya.

**Isi:**
- 31 lokasi TPS mencakup semua kecamatan di Surabaya
- Data setiap TPS:
  - ID unik
  - Nama TPS
  - Kecamatan
  - Alamat lengkap
  - Koordinat (latitude, longitude)
  - Jam operasional
  - Nomor telepon

**Fungsi Helper:**
- `getKecamatanList()` - Mendapatkan daftar kecamatan unik
- `getTpsByKecamatan(kecamatan)` - Filter TPS berdasarkan kecamatan
- `getNearestTPS(lat, lng, limit)` - Cari TPS terdekat dari koordinat

---

### 2. **src/components/MapComponent.tsx** (DIMODIFIKASI)

**Perubahan:**
1. Menambahkan props baru:
   - `showTPSMarkers` - Toggle untuk menampilkan TPS markers
   - `onTPSSelect` - Callback saat TPS dipilih dari peta
   - `kecamatan`, `operatingHours`, `phone` dalam marker data

2. Default center diubah ke Surabaya: `[-7.257472, 112.752090]`

3. Popup TPS diperbaiki untuk menampilkan:
   - Badge kecamatan
   - Alamat TPS
   - Jam operasional
   - Nomor telepon
   - Call-to-action "Klik untuk memilih TPS ini"

4. Click handler untuk TPS markers yang memanggil `onTPSSelect()`

---

### 3. **src/app/pickup/new/page.tsx** (DIMODIFIKASI)

**Perubahan:**

#### State Baru:
```typescript
const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
const [searchKecamatan, setSearchKecamatan] = useState('')
const [tpsMarkers, setTpsMarkers] = useState<any[]>([])
const [selectedTPS, setSelectedTPS] = useState<TPSLocation | null>(null)
```

#### Fungsi Handler Baru:
- `handleTPSSelect()` - Dipanggil saat user klik TPS di peta
- `handleKecamatanSelect()` - Dipanggil saat user pilih kecamatan dari sidebar

#### UI Layout Baru (Step 1 - Lokasi):
```
┌─────────────────────────────────────────────┐
│  Pilih Lokasi Penjemputan                   │
├─────────────────────────────┬───────────────┤
│                             │  Daftar       │
│         MAP                 │  Kecamatan    │
│     (TPS Markers)           │               │
│                             │  [Search Box] │
│       500px height          │               │
│                             │  • Genteng    │
│                             │  • Tegalsari  │
│                             │  • ...        │
└─────────────────────────────┴───────────────┘
```

**Layout Grid:**
- Map: 2/3 width (md:col-span-2)
- Sidebar: 1/3 width (md:col-span-1)
- Responsive: Stack pada mobile

---

## 🎨 UI Components

### Sidebar Daftar Kecamatan

**Fitur:**
1. **Search Box** dengan icon 🔍
   - Real-time filtering kecamatan
   - Case-insensitive search

2. **List Item Kecamatan**
   - Nama kecamatan
   - Jumlah TPS tersedia
   - Highlight saat dipilih (bg-green-600)
   - Chevron icon (➜)

3. **Auto-scroll** dalam container 500px

### Map Component

**Fitur:**
1. **TPS Markers (🏭)**
   - Warna hijau (#10B981)
   - Teardrop shape dengan border putih
   - Shadow effect

2. **Popup TPS**
   - Badge kecamatan (hijau)
   - Icon untuk alamat 📍, jam 🕐, telepon 📞
   - Call-to-action text

3. **Selected Location Marker (📍)**
   - Warna merah (#EF4444) saat user pilih lokasi custom
   - Draggable (opsional)

---

## 🔄 User Flow

### Skenario 1: Pilih dari Daftar Kecamatan
1. User membuka halaman "Buat Permintaan Penjemputan"
2. Di sidebar, user melihat daftar 31 kecamatan
3. User ketik di search box untuk filter (misal: "Gubeng")
4. User klik kecamatan "Gubeng"
5. Peta auto-zoom ke TPS pertama di kecamatan Gubeng
6. Marker TPS ditampilkan
7. Lokasi dan TPS info ditampilkan di bawah peta
8. User klik "Lanjutkan" ke step 2

### Skenario 2: Klik TPS di Peta
1. User melihat peta dengan semua TPS markers (🏭)
2. User hover/klik marker TPS
3. Popup muncul dengan info TPS lengkap
4. User klik marker untuk memilih TPS tersebut
5. Toast notification: "TPS [Nama] dipilih"
6. Info TPS ditampilkan di bawah peta
7. Sidebar highlight kecamatan terpilih
8. User klik "Lanjutkan" ke step 2

### Skenario 3: Custom Location (Original)
1. User klik langsung di peta (bukan di marker TPS)
2. Marker merah (📍) muncul di lokasi klik
3. Reverse geocoding untuk mendapatkan alamat
4. Alamat ditampilkan di bawah peta
5. User bisa geser marker jika draggable
6. User klik "Lanjutkan" ke step 2

---

## 📊 Data TPS

### Distribusi Kecamatan:

**Surabaya Pusat:**
- Genteng, Tegalsari, Bubutan, Simokerto

**Surabaya Utara:**
- Pabean Cantian, Semampir, Krembangan, Kenjeran, Bulak

**Surabaya Timur:**
- Gubeng, Rungkut, Tenggilis Mejoyo, Gunung Anyar, Sukolilo, Mulyorejo

**Surabaya Selatan:**
- Wonokromo, Tegalsari, Karang Pilang, Jambangan, Gayungan, Wonocolo

**Surabaya Barat:**
- Benowo, Pakal, Asemrowo, Sukomanunggal, Tandes, Sambikerep, Lakarsantri, Wiyung, Dukuh Pakis, Sawahan

**Total: 31 TPS**

---

## 🎨 Design Sesuai Mockup

Implementasi ini mengikuti design mockup yang diberikan:

✅ **Map di sebelah kiri** (2/3 lebar)  
✅ **Sidebar "Daftar Kecamatan" di kanan** (1/3 lebar)  
✅ **Header "Jangkauan Sambangan Sampah"**  
✅ **Search box untuk filter kecamatan**  
✅ **List kecamatan dengan scroll**  
✅ **TPS markers ditampilkan di peta**  
✅ **Responsive layout untuk mobile**  

---

## 🔧 Cara Menggunakan di Code Lain

### Import TPS Data:
```typescript
import { 
  tpsLocations, 
  getKecamatanList, 
  getTpsByKecamatan, 
  getNearestTPS,
  type TPSLocation 
} from '@/lib/tpsLocations'

// Get all kecamatan
const kecamatanList = getKecamatanList()

// Get TPS in specific kecamatan
const tpsInGubeng = getTpsByKecamatan('Gubeng')

// Find nearest TPS from user location
const nearest = getNearestTPS(-7.265123, 112.751890, 5)
```

### Use MapComponent with TPS:
```typescript
<MapComponent
  selectable
  showTPSMarkers
  markers={tpsMarkers}
  onLocationSelect={handleLocationSelect}
  onTPSSelect={handleTPSSelect}
  className="h-[500px] w-full"
/>
```

---

## 🚀 Future Enhancements

Potensial improvement untuk fitur ini:

1. **Real-time TPS Availability**
   - Tampilkan status online/offline TPS
   - Kapasitas TPS saat ini

2. **TPS Rating & Reviews**
   - User bisa kasih rating ke TPS
   - Tampilkan average rating di marker

3. **Route Navigation**
   - Hitung jarak & estimasi waktu tempuh
   - Tampilkan rute ke TPS terpilih

4. **Filter Advanced**
   - Filter berdasarkan jenis sampah yang diterima
   - Filter berdasarkan harga
   - Filter berdasarkan rating

5. **Clustering Markers**
   - Untuk zoom level rendah, group markers berdekatan
   - Improve performance dengan banyak markers

6. **TPS Photos**
   - Tambahkan foto TPS di popup
   - Gallery view untuk TPS

---

## 🐛 Testing Checklist

- [x] ✅ TPS markers muncul di peta
- [x] ✅ Klik kecamatan memilih TPS pertama di kecamatan tersebut
- [x] ✅ Klik TPS marker memilih TPS tersebut
- [x] ✅ Search kecamatan bekerja (case-insensitive)
- [x] ✅ Popup TPS menampilkan info lengkap
- [x] ✅ Selected kecamatan di-highlight
- [x] ✅ Custom location masih bisa dipilih (klik di peta)
- [x] ✅ Responsive layout untuk mobile
- [x] ✅ Toast notification muncul saat pilih TPS
- [x] ✅ Info TPS ditampilkan di bawah peta
- [x] ✅ Button "Lanjutkan" enabled setelah pilih lokasi

---

## 📱 Responsive Behavior

**Desktop (md+):**
- Layout grid 2/3 + 1/3
- Map 500px height
- Sidebar 500px height dengan scroll

**Mobile (<md):**
- Stack vertical
- Map full width, 400px height
- Sidebar full width, max-height dengan scroll
- Search box tetap visible

---

## 🎯 Key Benefits

1. **User Experience**
   - Lebih mudah pilih lokasi berdasarkan kecamatan
   - Visual representation TPS di peta
   - Flexible: bisa pilih dari list atau klik peta

2. **TPS Discovery**
   - User bisa lihat semua TPS available
   - Info lengkap sebelum pilih

3. **Scalability**
   - Data TPS centralized di satu file
   - Mudah update/tambah TPS baru
   - Helper functions reusable

4. **Performance**
   - Static data (no API call)
   - Efficient filtering & search
   - Lazy load map component

---

## 👨‍💻 Developer Notes

- **Coordinates**: Menggunakan sistem lat/lng standar
- **Reverse Geocoding**: OpenStreetMap Nominatim API
- **Map Library**: Leaflet.js via react-leaflet
- **Icons**: Emoji unicode untuk simplicity
- **State Management**: Local useState (bisa migrate ke Zustand jika perlu)

---

Fitur ini sekarang siap digunakan! 🎉
