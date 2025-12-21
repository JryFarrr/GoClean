# 📋 SOLUSI: Download Daftar TPS Names

## 🎯 Masalah
User tidak tahu nama TPS yang benar ketika import data dengan role TPS, sehingga import gagal dengan error "TPS tidak ditemukan".

## ✅ Solusi
Sudah ditambahkan fitur **"Download Daftar TPS"** di modal import yang akan menampilkan semua TPS names yang ada di database.

---

## 📥 Cara Menggunakan

### Step 1: Buka Modal Import
1. Login sebagai Admin
2. Buka halaman **"Kelola Users"**
3. Klik tombol **"Import Data"** (tombol ungu)

### Step 2: Download Daftar TPS
Di dalam modal, akan ada button **"Download Daftar TPS"** (biru)
- Klik button tersebut
- File CSV akan ter-download: `Daftar-TPS-YYYY-MM-DD.csv`

### Step 3: Buka File CSV
Buka file dengan aplikasi apapun (Excel, Google Sheets, Notepad):
```
Nama TPS,Kecamatan,Alamat
"TPS Bukit Tinggi","Sukolilo","Jl. Ahmad Yani No. 123"
"TPS Benowo","Benowo","Jl. Raya Benowo No. 456"
"TPS Pusat","Sukolilo","Jl. Gajah Mada No. 789"
```

### Step 4: Salin Nama TPS
Ketika membuat file import Excel untuk TPS:
- Salin nama TPS PERSIS SAMA dari file CSV
- Contoh: Jika CSV menunjukkan `TPS Bukit Tinggi`, maka di Excel tuliskan `TPS Bukit Tinggi`
- ⚠️ Perhatikan spasi, huruf besar/kecil, dan karakter khusus

### Step 5: Upload Excel
Upload file Excel Anda sesuai dengan nama TPS yang benar.

---

## 📊 Format File CSV

| Kolom | Isi | Kegunaan |
|-------|-----|----------|
| **Nama TPS** | Nama lengkap TPS | Salin ke kolom `tpsName` di Excel import |
| **Kecamatan** | Wilayah TPS | Referensi/informasi |
| **Alamat** | Lokasi TPS | Referensi/informasi |

---

## 🔄 Workflow Lengkap

```
1. Login Admin
   ↓
2. Buka "Kelola Users"
   ↓
3. Klik "Import Data"
   ↓
4. Klik "Download Daftar TPS" → Dapatkan file CSV
   ↓
5. Buka Excel template → Isi data
   ↓
6. Untuk role TPS: Salin nama TPS PERSIS dari CSV
   ↓
7. Upload Excel file
   ↓
8. Import sukses!
```

---

## ✨ Tips

✅ Selalu download daftar TPS terbaru sebelum import
✅ Buka file CSV dengan Excel untuk melihat dengan jelas
✅ Copy-paste nama TPS untuk menghindari typo
✅ Pastikan tidak ada spasi di awal/akhir nama TPS
✅ Perhatikan huruf besar/kecil (case-sensitive)

---

## 🆘 Jika Masih Error

1. Download Daftar TPS terbaru
2. Pastikan nama TPS di Excel SAMA PERSIS dengan di CSV
3. Gunakan copy-paste, bukan mengetik manual
4. Perhatikan spasi dan kapitalisasi
5. Upload ulang file Excel
