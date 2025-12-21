# Panduan Import Data TPS dari Excel

## Langkah-Langkah Import

### 1. Download Template Excel
- Klik tombol **"Import Excel"** di halaman Admin TPS
- Klik tombol **"Download Template Excel"** di modal yang muncul
- File template akan terdownload dengan nama `Template_Import_TPS.csv`

### 2. Isi Data TPS

Template memiliki kolom-kolom berikut:

| Kolom | Wajib | Tipe Data | Contoh | Keterangan |
|-------|-------|-----------|--------|------------|
| Nama TPS | ✅ Ya | Text | TPS Genteng Kali | Nama lengkap TPS |
| Kecamatan | ✅ Ya | Text | Genteng | Harus sesuai dengan salah satu dari 31 kecamatan di Surabaya |
| Alamat | ✅ Ya | Text | Jl. Genteng Kali No. 1 Genteng Surabaya | Alamat lengkap TPS |
| Latitude | ✅ Ya | Number | -7.257472 | Koordinat Latitude dalam format desimal |
| Longitude | ✅ Ya | Number | 112.752090 | Koordinat Longitude dalam format desimal |
| Jam Operasional | ❌ Tidak | Text | 06:00 - 18:00 | Jam operasional TPS (default: 06:00 - 18:00) |
| No. Telepon | ❌ Tidak | Text | 031-12345678 | Nomor telepon TPS |

### 3. Format Data

#### Koordinat GPS
- Gunakan format **desimal**, bukan derajat/menit/detik
- **Latitude** untuk Surabaya biasanya antara `-7.2` hingga `-7.4`
- **Longitude** untuk Surabaya biasanya antara `112.6` hingga `112.8`
- Contoh yang benar: `-7.257472, 112.752090`
- Contoh yang salah: `7°15'26.9"S, 112°45'07.5"E`

#### Kecamatan
Pastikan nama kecamatan sesuai dengan daftar 31 kecamatan di Surabaya:
- Asemrowo, Benowo, Bubutan, Bulak, Dukuh Pakis
- Gayungan, Genteng, Gubeng, Gunung Anyar, Jambangan
- Karang Pilang, Kenjeran, Krembangan, Lakarsantri, Mulyorejo
- Pabean Cantian, Pakal, Rungkut, Sambikerep, Sawahan
- Semampir, Simokerto, Sukolilo, Sukomanunggal, Tambaksari
- Tandes, Tegalsari, Tenggilis Mejoyo, Wiyung, Wonocolo, Wonokromo

### 4. Cara Mendapatkan Koordinat GPS

#### Menggunakan Google Maps:
1. Buka Google Maps di browser
2. Cari lokasi TPS yang diinginkan
3. Klik kanan pada lokasi tersebut
4. Pilih koordinat yang muncul (akan otomatis tercopy)
5. Paste di Excel - format sudah otomatis desimal

#### Menggunakan Smartphone:
1. Buka aplikasi Maps (Google Maps/Apple Maps)
2. Tekan dan tahan lokasi TPS
3. Koordinat akan muncul di bagian atas/bawah layar
4. Copy koordinat tersebut

### 5. Upload File Excel

1. Setelah mengisi template, simpan file Excel
2. Di modal Import, klik area upload atau drag & drop file
3. File akan diproses secara otomatis
4. Tunggu hingga proses selesai

### 6. Hasil Import

Setelah import selesai, sistem akan menampilkan:
- ✅ **Jumlah data berhasil** ditambahkan
- ❌ **Jumlah data gagal** dengan detail error
- 📋 Daftar error untuk data yang gagal (jika ada)

#### Contoh Error yang Mungkin Muncul:
- `Baris 3: Data tidak lengkap` - Ada kolom wajib yang kosong
- `Baris 5: Latitude/Longitude harus berupa angka` - Format koordinat salah
- `Baris 7: TPS "..." sudah ada` - TPS dengan nama dan kecamatan yang sama sudah terdaftar

### 7. Tips dan Trik

✅ **DO:**
- Gunakan copy-paste koordinat langsung dari Google Maps
- Periksa semua data sebelum upload
- Simpan file Excel dengan format `.xlsx` atau `.xls`
- Test dengan 2-3 data terlebih dahulu sebelum import banyak data

❌ **DON'T:**
- Jangan ubah nama kolom di template
- Jangan gunakan format koordinat selain desimal
- Jangan input data duplikat (nama TPS dan kecamatan sama)
- Jangan kosongkan kolom wajib

### 8. Validasi Data

Sistem akan otomatis memvalidasi:
- ✅ Kelengkapan kolom wajib
- ✅ Format angka untuk Latitude/Longitude
- ✅ Range Latitude (-90 hingga 90)
- ✅ Range Longitude (-180 hingga 180)
- ✅ Duplikasi data (nama + kecamatan)

### 9. Contoh Data Excel

```csv
Nama TPS,Kecamatan,Alamat,Latitude,Longitude,Jam Operasional,No. Telepon
TPS Genteng Kali,Genteng,Jl. Genteng Kali No. 1 Genteng Surabaya,-7.257472,112.752090,06:00 - 18:00,031-12345678
TPS Sukolilo,Sukolilo,Jl. Raya Sukolilo No. 25 Surabaya,-7.280000,112.790000,07:00 - 17:00,031-87654321
TPS Gubeng Pojok,Gubeng,Jl. Gubeng Pojok No. 10 Surabaya,-7.265123,112.750456,06:00 - 20:00,031-11223344
```

### 10. Troubleshooting

**Q: File tidak bisa diupload**
- A: Pastikan file berformat `.xlsx` atau `.xls`, bukan `.csv` atau format lain

**Q: Semua data gagal dengan error "Data tidak lengkap"**
- A: Periksa apakah ada kolom wajib yang kosong atau nama kolom berbeda dari template

**Q: Error "Latitude/Longitude harus berupa angka"**
- A: Pastikan koordinat dalam format desimal (contoh: -7.257472), bukan dalam format derajat/menit/detik

**Q: Data berhasil diimport tapi tidak muncul di list**
- A: Refresh halaman dengan menekan F5 atau reload browser

**Q: Bagaimana jika ada data yang duplikat?**
- A: Sistem akan melewati data duplikat dan menampilkan error. Data yang sudah ada tidak akan ditimpa.

## Support

Jika mengalami kesulitan, silakan:
1. Periksa kembali format data sesuai panduan
2. Download ulang template dan coba lagi
3. Hubungi administrator sistem

---

**Catatan:** Fitur import ini dirancang untuk mempercepat proses penambahan banyak data TPS sekaligus. Untuk penambahan TPS satuan, gunakan tombol "Tambah Lokasi TPS" dengan form manual.
