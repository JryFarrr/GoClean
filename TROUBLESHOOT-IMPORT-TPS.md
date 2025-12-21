# 🔧 TROUBLESHOOT: Import TPS Akun Gagal

## ❌ Penyebab Umum Gagal Import TPS

### 1. **TPS Tidak Ditemukan di Database** (Paling Sering!)
**Error Message:**
```
TPS dengan nama "TPS ABC" tidak ditemukan. Tersedia: TPS Bukit Tinggi, TPS Benowo, ...
```

**Solusi:**
1. Klik **"Download Daftar TPS"** di modal import
2. Buka file CSV yang ter-download
3. **COPY PERSIS** nama TPS dari CSV ke kolom `tpsName` di Excel
4. Jangan ketik manual - selalu copy-paste!
5. Perhatikan:
   - Spasi sebelum/sesudah nama
   - Huruf besar dan kecil (Case Sensitive)
   - Karakter khusus (tanda baca)

**Contoh Benar:**
```
Jika CSV menunjukkan: "TPS Bukit Tinggi"
Maka di Excel: tpsName = TPS Bukit Tinggi
```

**Contoh Salah:**
```
❌ "Tps Bukit Tinggi"  (huruf kecil di awal)
❌ "TPS  Bukit Tinggi" (spasi ganda)
❌ "TPS Bukit Tinggi " (spasi di akhir)
❌ "TPS Bukittinggi"   (nama berbeda)
```

---

### 2. **Email Sudah Terdaftar**
**Error Message:**
```
Email already exists: xxx@goclean.id
```

**Solusi:**
- Gunakan email yang belum terdaftar
- Setiap user harus memiliki email unik
- Cek email yang sudah ada di sistem sebelum import

---

### 3. **Format Data Tidak Sesuai**
**Error Message:**
```
Missing required fields
Invalid email format
Invalid role. Must be USER, TPS, or ADMIN
```

**Solusi:**

✅ **Kolom Wajib Diisi:**
| Kolom | Contoh | Catatan |
|-------|--------|--------|
| name | Admin TPS Bukit Tinggi | Nama akun/operator TPS |
| email | tps.bukittinggi@goclean.id | Format valid dengan @ |
| phone | 081234567890 | Nomor telepon |
| password | TPS123! | Minimal 6 karakter |
| role | TPS | Harus TPS (case-sensitive) |
| tpsName | TPS Bukit Tinggi | **HARUS ADA & SAMA DI DATABASE** |

---

## 📋 Workflow Benar Import TPS

```
STEP 1: Download Daftar TPS
├─ Buka modal Import Data
├─ Klik "Download Daftar TPS"
└─ Simpan file CSV

STEP 2: Buka File CSV
├─ Lihat semua nama TPS yang tersedia
└─ Catat nama yang ingin digunakan

STEP 3: Buat File Excel
├─ Download template dari modal
├─ Isi data user TPS:
│  ├─ name: Nama operator
│  ├─ email: Email unik
│  ├─ phone: No telepon
│  ├─ password: Password
│  ├─ role: TPS
│  └─ tpsName: COPY dari CSV!
└─ Simpan sebagai .xlsx

STEP 4: Upload & Import
├─ Pilih file Excel
├─ Klik "Import Data"
└─ Tunggu hasil

STEP 5: Periksa Hasil
├─ Lihat "User yang Berhasil Dibuat"
├─ Lihat "Gagal Membuat Akun" jika ada error
└─ Lihat "Detail Error" untuk debugging
```

---

## 🆘 Checklist Debugging

Jika masih gagal, cek ini:

- [ ] Sudah klik "Download Daftar TPS" dan buka file CSV?
- [ ] tpsName di Excel **SAMA PERSIS** dengan di CSV?
  - [ ] Cek kapitalisasi (huruf besar/kecil)
  - [ ] Cek spasi sebelum/sesudah
  - [ ] Cek tidak ada typo
- [ ] Menggunakan **copy-paste** (bukan mengetik)?
- [ ] Email belum terdaftar di sistem?
- [ ] Password minimal 6 karakter?
- [ ] role = "TPS" (bukan "tps" atau "Tps")?
- [ ] Semua kolom wajib sudah diisi (name, email, phone, password, role, tpsName)?

---

## 📝 Contoh File Excel yang Benar

```
| name                    | email                      | phone          | password | role | tpsName            |
|-------------------------|----------------------------|-----------------| ---------| -----|--------------------|
| Operator TPS Benowo     | tps.benowo@goclean.id     | 081234567890    | Pass123! | TPS  | TPS Benowo         |
| Admin TPS Bukit Tinggi  | tps.bukittinggi@goclean.id| 082345678901    | TPS123!  | TPS  | TPS Bukit Tinggi   |
| User Biasa              | user@goclean.id           | 083456789012    | User123! | USER |                    |
| Admin Sistem            | admin@goclean.id          | 084567890123    | Admin123!| ADMIN|                    |
```

⚠️ **PENTING:** `tpsName` hanya dibutuhkan untuk role TPS. Untuk USER dan ADMIN, biarkan kosong.

---

## 🎯 Quick Fix

**Jika panik, langkah termudah:**

1. Klik **"Download Daftar TPS"** → Dapatkan CSV
2. Buka CSV dengan Excel
3. Ke sheet "Users" di template Excel
4. Copy-paste nama TPS dari CSV ke kolom `tpsName`
5. Isi data lainnya
6. Upload & import

---

## 📞 Info Detail Error

Jika masih stuck:

1. Coba import lagi
2. Klik "📋 Detail Error" di modal hasil
3. Lihat JSON response lengkap
4. Cari: `"creationErrors"` array
5. Baca error message detail yang ditampilkan
6. Contoh:
   ```json
   "creationErrors": [
     {
       "email": "tps.test@goclean.id",
       "error": "TPS dengan nama \"TPS ABC\" tidak ditemukan. Tersedia: TPS Benowo, TPS Bukit Tinggi"
     }
   ]
   ```

---

## ✅ Kesimpulan

**Poin Paling Penting:**
1. **Selalu gunakan "Download Daftar TPS"** untuk melihat nama yang benar
2. **Copy-paste tpsName** dari CSV ke Excel (jangan ketik)
3. **Perhatikan kapitalisasi dan spasi**
4. **Email harus unik** (belum terdaftar)
5. Lihat "Gagal Membuat Akun" section di hasil import untuk error detail

Jika mengikuti checklist ini, import **pasti berhasil!** 🚀
