# 🧪 Testing Guide - Fitur Polygon TPS

## Cara Test Fitur Polygon TPS

### Step 1: Buka Halaman Pickup
1. Buka browser ke: `http://localhost:3000/pickup/new`
2. Pastikan sudah login sebagai user (bukan TPS/admin)

### Step 2: Pilih Mode Jemput
1. Klik tombol **"🏠 Jemput ke Rumah"** (warna biru)
2. Tunggu peta loading (~2-3 detik)

### Step 3: Verifikasi Polygon Muncul
Yang harus terlihat:
- ✅ Lingkaran berwarna kuning/orange/merah di sekitar beberapa TPS
- ✅ Ukuran lingkaran berbeda-beda (yang lebih besar = lebih banyak transaksi)
- ✅ Warna gradasi dari kuning ke merah

### Step 4: Test Toggle
1. Cari checkbox di **pojok kiri atas** peta
2. Label: "Tampilkan Area TPS Populer"
3. **Uncheck** → polygon hilang
4. **Check lagi** → polygon muncul kembali

### Step 5: Test Hover Tooltip
1. Arahkan mouse ke salah satu lingkaran polygon
2. Harus muncul tooltip dengan info:
   - Nama TPS
   - Jumlah transaksi (warna merah)
   - Radius area dalam km

### Step 6: Check Legend
1. Lihat **pojok kanan bawah** peta
2. Harus ada box dengan:
   - 🔥 Judul: "Area TPS dengan Traffic Tinggi"
   - Color gradient bar: Kuning → Merah
   - 📊 "Menampilkan: Top 25% TPS"
   - 📍 Jumlah area yang ditampilkan

### Step 7: Test Mode Antar
1. Kembali ke Step 0 dengan klik "Kembali ke Dashboard"
2. Masuk lagi ke `/pickup/new`
3. Pilih **"🚗 Antar ke TPS"** (warna hijau)
4. **Polygon TIDAK boleh muncul** (only for jemput mode)

---

## 🐛 Troubleshooting

### Polygon Tidak Muncul?

**Cek 1: Browser Console**
1. Buka DevTools (F12)
2. Tab "Console"
3. Cari error atau warning
4. Harus ada log:
   ```
   TPS Stats received: {...}
   Processed TPS polygons: [...]
   Rendering TPS polygons: [...]
   Rendered X TPS polygons
   ```

**Cek 2: Network Tab**
1. DevTools → Tab "Network"
2. Refresh halaman
3. Cari request ke `/api/pickups/stats/by-tps`
4. Klik request → Tab "Response"
5. Harus ada data `tpsStats` array

**Cek 3: Data TPS**
- Kemungkinan tidak ada data transaksi COMPLETED/PICKED_UP
- Check database apakah ada `PickupRequest` dengan status tersebut
- Jika kosong, buat data dummy dulu

### Polygon Terlalu Kecil/Besar?

Edit file `/src/app/pickup/new/page.tsx` line ~160:
```typescript
const minRadius = 500; // ubah jadi 300 atau 1000
const maxRadius = 2000; // ubah jadi 1500 atau 3000
```

### Warna Tidak Sesuai?

Edit file `/src/app/pickup/new/page.tsx` line ~170:
```typescript
const r = 255;
const g = Math.floor(255 * (1 - ratio)); // Yellow to Red
const b = 0;
```

---

## ✅ Expected Result

Ketika fitur bekerja dengan benar:

1. **Mode Jemput**:
   - Peta menampilkan TPS markers (hijau 🏭)
   - Polygon circles muncul di sekitar beberapa TPS (tidak semua)
   - Polygon berwarna kuning/orange/merah
   - Toggle checkbox muncul di top-left
   - Legend muncul di bottom-right

2. **Mode Antar**:
   - Hanya TPS markers yang muncul
   - TIDAK ada polygon circles
   - TIDAK ada toggle polygon
   - TIDAK ada polygon legend

---

## 📸 Screenshot Checklist

Ambil screenshot untuk dokumentasi:
1. ✅ Full page mode jemput dengan polygon visible
2. ✅ Close-up salah satu polygon dengan tooltip
3. ✅ Polygon legend di bottom-right
4. ✅ Toggle checkbox di top-left
5. ✅ Mode antar tanpa polygon (untuk comparison)

---

## 🔧 Quick Fixes

### Jika API Error 500:
```bash
# Restart dev server
# Ctrl+C di terminal
npm run dev
```

### Jika Perlu Hapus Cache:
```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Jika TypeScript Error:
```bash
# Rebuild
npm run build
```
