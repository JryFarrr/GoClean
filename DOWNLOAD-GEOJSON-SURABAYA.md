# 📥 Download GeoJSON Batas Kecamatan Surabaya

## 🎯 Sumber Terbaik (Direkomendasikan)

### Option 1: Satu Data Surabaya (RESMI) ⭐ RECOMMENDED
**Link**: https://data.surabaya.go.id/

**File**: `08102024_BATAS_KEC.shp` (Shapefile - perlu konversi ke GeoJSON)

**Langkah-langkah:**
1. Buka https://data.surabaya.go.id/
2. Cari "batas kecamatan" atau "BATAS_KEC"
3. Download file shapefile (.shp)
4. Convert ke GeoJSON (lihat panduan di bawah)

**Kelebihan:**
- ✅ Data resmi pemerintah Kota Surabaya
- ✅ Update 2024 (terbaru!)
- ✅ Akurat dan terpercaya
- ✅ Gratis

---

### Option 2: GitHub Repository (Siap Pakai)

**Repository 1**: https://github.com/ardian28/GeoJson-Indonesia-38-Provinsi
- Format: GeoJSON sudah siap
- Coverage: Seluruh Indonesia (termasuk Surabaya)
- Perlu ekstrak data Surabaya saja

**Repository 2**: https://github.com/mahendrayudha/indonesia-geojson
- Format: GeoJSON
- Struktur: Per kabupaten/kota
- Cari file untuk Kota Surabaya

**Langkah-langkah:**
1. Buka salah satu repository
2. Navigate ke folder Jawa Timur / Surabaya
3. Download file GeoJSON
4. Copy ke `public/` folder project Anda

---

### Option 3: Indonesia Geospasial

**Link**: https://indonesia-geospasial.com/

**Data tersedia:**
- Shapefile batas administrasi 2019
- Tingkat: Provinsi, Kabupaten/Kota, Kecamatan, Desa
- Format: Shapefile (perlu konversi)

---

### Option 4: IGIS MAP

**Link**: https://igismap.com/

**Features:**
- Data vektor GIS terbaru
- Multiple format: Shapefile, KML, GeoJSON, CSV
- Perlu register/login untuk download

---

## 🔄 Cara Convert Shapefile ke GeoJSON

Jika Anda download **shapefile (.shp)**, perlu convert ke GeoJSON:

### Method 1: Online Tool (Termudah)
1. Buka https://mapshaper.org/
2. Drag & drop file .shp (+ .shx, .dbf, .prj jika ada)
3. Klik "Export" → Pilih "GeoJSON"
4. Download hasil konversi

### Method 2: QGIS (Advanced)
1. Install QGIS: https://qgis.org/
2. Open shapefile di QGIS
3. Right-click layer → Export → Save Features As
4. Format: GeoJSON
5. Save

### Method 3: Command Line (ogr2ogr)
```bash
ogr2ogr -f GeoJSON output.geojson input.shp
```

---

## 📁 Cara Pakai di Project

Setelah dapat file GeoJSON:

1. **Copy file** ke folder:
   ```
   d:\Semester 7\Teknologi_Basis_Data\final_Project\goclean\public\
   ```

2. **Rename** menjadi: `KOTA_SURABAYA.json` (replace file lama)

3. **Verifikasi struktur** GeoJSON:
   - Harus ada `features` array
   - Setiap feature punya `properties` dengan nama kecamatan
   - Property bisa `nama_kecamatan`, `KECAMATAN`, `NM_KEC`, dll

4. **Refresh browser** - choropleth seharusnya langsung muncul!

---

## ✅ Checklist File GeoJSON yang Baik

File GeoJSON yang benar harus punya:
- [ ] Type: "FeatureCollection"
- [ ] Array "features" dengan 31 features (31 kecamatan)
- [ ] Setiap feature punya "geometry" type "Polygon" atau "MultiPolygon"
- [ ] Setiap feature punya "properties" dengan field nama kecamatan
- [ ] Total file size: ~500KB - 5MB (tergantung detail)

**Contoh struktur yang benar:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nama_kecamatan": "Gubeng",
        "nama_kota": "Surabaya"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], ...]]
      }
    },
    // ... 30 features lagi untuk kecamatan lainnya
  ]
}
```

---

## 🆘 Troubleshooting

**Problem: File terlalu besar (>10MB)**
- Solution: Simplify geometry di mapshaper.org
- Settings: Simplify → 10% atau 5%

**Problem: Nama kecamatan tidak match**
- Check property name di console: `choroplethGeoJson.features[0].properties`
- Update MapComponent.tsx line 165 jika perlu

**Problem: Polygon tidak muncul**
- Check browser console untuk error
- Verifikasi coordinate format: [longitude, latitude] (NOT lat,lng!)
- Pastikan CRS adalah WGS84 (EPSG:4326)

---

## 🚀 Quick Start (GitHub - Tercepat)

Jika mau cepat, coba langsung dari GitHub:

1. Buka: https://github.com/ardian28/GeoJson-Indonesia-38-Provinsi
2. Navigate: `data/jawa-timur/kota-surabaya/kecamatan.geojson`
3. Raw → Copy semua → Save as `KOTA_SURABAYA.json`
4. Paste ke `public/` folder
5. Refresh browser!

---

## 📞 Need Help?

Jika ada masalah:
1. Check browser console (F12) untuk error messages
2. Verifikasi file structure dengan text editor
3. Test di geojson.io untuk preview
4. Pastikan file di folder yang benar

**File path yang benar:**
```
d:\Semester 7\Teknologi_Basis_Data\final_Project\goclean\public\KOTA_SURABAYA.json
```

Selamat mencoba! 🎉
