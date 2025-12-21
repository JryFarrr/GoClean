# 📋 PANDUAN IMPORT USER / TPS / ADMIN

## Fitur Import Data User GoClean

Admin dapat mengupload file Excel untuk membuat banyak akun user, TPS, atau admin sekaligus.

---

## ✅ LANGKAH-LANGKAH IMPORT

### **1. Download Template Excel**

1. Login sebagai Admin
2. Buka halaman "Kelola Users" (`/admin/users`)
3. Klik tombol **"Template Excel"** (biru)
4. File `Template-Import-Users-GoClean.xlsx` akan terdownload
5. Buka file di Excel/LibreOffice/Google Sheets

---

### **2. Download Daftar TPS yang Tersedia**

⚠️ **PENTING UNTUK IMPORT AKUN TPS:**

1. Di halaman "Kelola Users", klik tombol **"Import Data"** (ungu)
2. Di modal yang muncul, klik tombol **"Download Daftar ID TPS"**
3. File CSV berisi daftar TPS akan terdownload
4. Buka file CSV tersebut untuk melihat **nama TPS yang valid** di database

**Atau:**

1. Di modal import, lihat section **"🏪 Daftar TPS yang Tersedia di Database"**
2. **Klik nama TPS** untuk copy otomatis ke clipboard
3. Paste langsung ke file Excel Anda

---

### **3. Isi Data di File Excel**

**Format Header (WAJIB tepat sama):**
- Column A: `name`
- Column B: `email`
- Column C: `phone`
- Column D: `password`
- Column E: `role`
- Column F: `tpsName` (untuk role TPS)
- Column G: `capacity` (opsional, untuk role TPS)

❌ **SALAH:**
- "Nama" (seharusnya "name")
- "Email Address" (seharusnya "email")
- "No Hp" (seharusnya "phone")

✅ **BENAR:**
- Gunakan template yang sudah disediakan dengan klik tombol "Template Excel"

---

### **4. Isi Data Sesuai Role**

#### **Untuk Role USER:**
```
name: Budi Santoso
email: budi@goclean.id
phone: 081234567890
password: Password123!
role: USER
tpsName: (kosong atau hapus cell ini)
capacity: (kosong atau hapus cell ini)
```

#### **Untuk Role TPS:**
```
name: Admin Bank Sampah Margorejo
email: admin.margorejo@goclean.id
phone: 082345678901
password: TPS123!
role: TPS
tpsName: Bank Sampah Margorejo Mandiri  ⚠️ HARUS SAMA PERSIS dengan database!
capacity: 5000  (opsional, dalam kg)
```

⚠️ **SANGAT PENTING untuk TPS:**
- **tpsName** harus **100% sama** dengan nama TPS di database
- Termasuk spasi, huruf besar/kecil, tanda baca
- Gunakan daftar TPS yang sudah didownload sebagai referensi
- **Copy-paste** nama TPS dari daftar untuk menghindari typo

#### **Untuk Role ADMIN:**
```
name: Ady Firmansyah
email: admin@goclean.id
phone: 083456789012
password: Admin123!
role: ADMIN
tpsName: (kosong atau hapus cell ini)
capacity: (kosong atau hapus cell ini)
```

---

### **5. Cara Mendapatkan Nama TPS yang Benar**

Ada **3 cara** untuk memastikan nama TPS benar:

#### **Cara 1: Copy dari Modal Import** ⭐ (Paling Mudah)
1. Buka modal "Import Data User / TPS / Admin"
2. Scroll ke section **"🏪 Daftar TPS yang Tersedia di Database"**
3. **Klik nama TPS** yang ingin digunakan
4. Nama TPS otomatis ter-copy ke clipboard
5. Paste ke kolom `tpsName` di Excel

#### **Cara 2: Download CSV**
1. Klik tombol **"Download Daftar ID TPS"** di modal import
2. Buka file CSV yang terdownload
3. Lihat kolom "Nama TPS"
4. **Copy nama TPS** yang diinginkan
5. Paste ke kolom `tpsName` di Excel

#### **Cara 3: Lihat di Halaman TPS**
1. Buka menu **"TPS"** di admin panel
2. Lihat daftar nama TPS di tabel
3. Copy nama TPS **persis sama**
4. Paste ke kolom `tpsName` di Excel

---

### **6. Validasi Data Sebelum Upload**

Sebelum upload, pastikan:

| Field | Validasi | Contoh ✅ | Contoh ❌ |
|-------|----------|----------|----------|
| **name** | Tidak kosong, minimal 3 karakter | "Budi Santoso" | "" (kosong) |
| **email** | Format valid, unique, ada @ | "budi@goclean.id" | "budi.com" |
| **phone** | Nomor telepon valid | "081234567890" | "08123" |
| **password** | Minimal 6 karakter | "Password123!" | "123" |
| **role** | USER / TPS / ADMIN (huruf besar) | "USER" | "user" |
| **tpsName** (TPS only) | Sama persis dengan database | "Bank Sampah Induk Surabaya" | "Bank Sampah Induk" |
| **capacity** (opsional) | Angka dalam kg | 5000 | "5000kg" |

---

### **7. Upload File Excel**

1. Klik tombol **"Import Data"** (ungu)
2. Drag & drop file Excel ke area upload, **ATAU**
3. Klik **"Pilih File"** dan pilih file Excel
4. File akan muncul di "File dipilih"
5. Klik tombol **"Import"** (hijau) di bawah
6. Tunggu proses import selesai

---

### **8. Lihat Hasil Import**

Setelah import selesai, akan muncul hasil:

#### **✅ Import Berhasil:**
```
✅ Berhasil import 5 dari 5 data

User yang Berhasil Dibuat:
- Budi Santoso (budi@goclean.id) - USER
- Admin Bank Sampah (admin@goclean.id) - TPS
- Ady Firmansyah (admin@goclean.id) - ADMIN
...
```

#### **❌ Import Gagal:**
```
❌ Gagal melakukan import

Gagal Membuat Akun:
- tps@goclean.id: TPS dengan nama "TPS Kandangan" tidak ditemukan. 
  Tersedia: Bank Sampah Induk Surabaya, Bank Sampah Margorejo Mandiri, ...
```

**Klik "Detail Error"** untuk melihat informasi lengkap error.

---

## ⚠️ ERROR UMUM & SOLUSI

### **Error 1: "TPS dengan nama ... tidak ditemukan"**

**Penyebab:**
- Nama TPS di kolom `tpsName` tidak sama persis dengan database
- Typo, spasi tambahan, atau huruf besar/kecil salah

**Solusi:**
1. Download daftar TPS dengan tombol "Download Daftar ID TPS"
2. Cek nama TPS yang benar dari daftar
3. **Copy-paste** nama TPS (jangan ketik manual)
4. Pastikan tidak ada spasi di awal/akhir
5. Upload ulang file yang sudah diperbaiki

**Contoh:**
- ❌ Salah: "TPS Kandangan" (tidak ada di database)
- ✅ Benar: "Bank Sampah Induk Surabaya"

---

### **Error 2: "Email already exists"**

**Penyebab:**
- Email sudah terdaftar di database

**Solusi:**
- Gunakan email yang berbeda
- Atau hapus user dengan email tersebut terlebih dahulu

---

### **Error 3: "Invalid email format"**

**Penyebab:**
- Email tidak mengandung @
- Format email salah

**Solusi:**
- Pastikan format: `namauser@domain.com`
- Contoh benar: `budi@goclean.id`

---

### **Error 4: "Missing required columns"**

**Penyebab:**
- Header kolom tidak sesuai template
- Ada kolom yang hilang

**Solusi:**
1. Download template baru
2. Copy data Anda ke template baru
3. Jangan ubah nama header kolom

---

### **Error 5: "TPS user must have tpsName"**

**Penyebab:**
- Role = TPS tapi kolom `tpsName` kosong

**Solusi:**
- Isi kolom `tpsName` dengan nama TPS dari database
- Atau ubah role menjadi USER/ADMIN jika bukan TPS

---

## 📊 TIPS & TRIK

### **1. Import Bertahap**
- Untuk data banyak (100+ rows), import bertahap 20-50 rows per file
- Lebih mudah troubleshoot jika ada error

### **2. Validasi di Excel Dulu**
- Cek email tidak duplikat
- Pastikan semua role huruf besar (USER/TPS/ADMIN)
- Hapus spasi berlebih dengan fungsi TRIM di Excel

### **3. Backup Data Lama**
- Sebelum import besar-besaran, backup database
- Export user yang sudah ada terlebih dahulu

### **4. Gunakan Password Temporary**
- Buat password temporary untuk semua user baru
- Instruksikan user untuk ganti password setelah login pertama

### **5. Test dengan Sample Kecil**
- Upload 2-3 data dulu untuk test
- Jika berhasil, lanjutkan dengan data lengkap

---

## 📝 CHECKLIST SEBELUM IMPORT

- [ ] Template Excel sudah didownload
- [ ] Daftar TPS sudah didownload (untuk import TPS)
- [ ] Header kolom sesuai: name, email, phone, password, role, tpsName, capacity
- [ ] Semua email unik (tidak duplikat)
- [ ] Semua email format valid (ada @)
- [ ] Password minimal 6 karakter
- [ ] Role huruf besar: USER / TPS / ADMIN
- [ ] Untuk TPS: tpsName sudah di-copy dari daftar TPS
- [ ] Tidak ada spasi berlebih di awal/akhir cell
- [ ] File sudah disimpan dalam format .xlsx atau .xls

---

## 🎯 CONTOH FILE EXCEL YANG BENAR

| name | email | phone | password | role | tpsName | capacity |
|------|-------|-------|----------|------|---------|----------|
| Budi Santoso | budi@goclean.id | 081234567890 | Password123! | USER | | |
| Admin Bank Sampah | admin.bs@goclean.id | 082345678901 | TPS123! | TPS | Bank Sampah Induk Surabaya | 5000 |
| Siti Aminah | siti@goclean.id | 083456789012 | Password456! | USER | | |
| Admin Margorejo | margorejo@goclean.id | 084567890123 | TPS456! | TPS | Bank Sampah Margorejo Mandiri | 3000 |
| Ady Admin | ady@goclean.id | 085678901234 | Admin789! | ADMIN | | |

---

## 📞 BUTUH BANTUAN?

Jika masih mengalami masalah:
1. **Klik "Detail Error"** di modal hasil import untuk info lengkap
2. Screenshot error dan kirim ke tim support
3. Pastikan sudah follow semua langkah di panduan ini
4. Cek dokumentasi [TROUBLESHOOT-IMPORT-TPS.md](TROUBLESHOOT-IMPORT-TPS.md)

---

**GoClean** - Manajemen Sampah Digital 🌿♻️
1. Jika gagal, akan muncul modal dengan "❌ Gagal melakukan import"
2. Klik **"Detail Error (Klik untuk expand)"**
3. Lihat JSON response untuk melihat error detail
4. Error akan menunjukkan:
   - Row mana yang bermasalah
   - Kolom mana yang missing
   - Validasi apa yang gagal

---

### **6. Download Template Terbaru**

Jika masih bingung, selalu gunakan template resmi:
1. Klik tombol **"Template Excel"** (tombol biru)
2. Template akan ter-download otomatis
3. Isi sesuai contoh di sheet "Panduan"
4. Upload kembali

---

## 🔍 COMMON ERRORS DAN SOLUSINYA

### Error: "Missing required columns: name, email, phone, password, role"

**Penyebab:** Header kolom tidak sesuai
**Solusi:** 
- Gunakan template Excel yang disediakan
- Pastikan header row ada di baris pertama
- Jangan ada spasi/karakter khusus di nama kolom

---

### Error: "TPS dengan nama 'xxx' tidak ditemukan di database"

**Penyebab:** Nama TPS di Excel tidak sama dengan di database
**Solusi:**
- Cek nama TPS yang tersedia di database
- Salin nama PERSIS SAMA (termasuk spasi, huruf besar/kecil)
- Contoh: Jangan gunakan "TPS bukit tinggi", gunakan "TPS Bukit Tinggi"

---

### Error: "Email already exists"

**Penyebab:** Email sudah terdaftar di sistem
**Solusi:**
- Gunakan email yang belum terdaftar
- Cek daftar user yang sudah ada

---

### Error: "Invalid email format"

**Penyebab:** Format email tidak valid
**Solusi:**
- Email harus dengan format: `nama@domain.com`
- Contoh: `budi@goclean.id` ✅

---

## 📞 JIKA MASIH GAGAL

1. **Download template** → Isi ulang dengan hati-hati
2. **Cek kolom header** → Pastikan nama kolom PERSIS sama dengan template
3. **Lihat detail error** → Klik "Detail Error" untuk melihat error spesifik
4. **Gunakan manual entry** → Jika masih gagal, buat user satu-satu via "Tambah User"

---

## ✨ TIPS

- ✅ Selalu gunakan **Template Excel** yang disediakan
- ✅ Isi **minimal satu data dummy** untuk test
- ✅ Periksa **nama TPS** dengan teliti
- ✅ Gunakan **format role** yang benar: USER / TPS / ADMIN (UPPERCASE)
- ✅ Pastikan **password minimal 6 karakter**
