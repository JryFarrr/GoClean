import * as XLSX from 'xlsx'

export interface TemplateRow {
  name: string
  email: string
  phone: string
  password: string
  role: string
  tpsName?: string
  capacity?: number
}

export const generateImportTemplate = () => {
  // Create template data
  const templateData: TemplateRow[] = [
    {
      name: 'Budi Santoso',
      email: 'budi@goclean.id',
      phone: '081234567890',
      password: 'Password123!',
      role: 'USER',
    },
    {
      name: 'Admin Bank Sampah',
      email: 'admin.banksampah@goclean.id',
      phone: '082345678901',
      password: 'TPS123!',
      role: 'TPS',
      tpsName: 'Bank Sampah Induk Surabaya', // ⚠️ Nama TPS HARUS SAMA dengan di database!
      capacity: 5000, // Kapasitas dalam kg (opsional)
    },
    {
      name: 'Ady Firmansyah',
      email: 'admin@goclean.id',
      phone: '083456789012',
      password: 'Admin123!',
      role: 'ADMIN',
    },
  ]

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(templateData, {
    header: [
      'name',
      'email',
      'phone',
      'password',
      'role',
      'tpsName',
      'capacity',
    ],
  })

  // Set column widths
  worksheet['!cols'] = [
    { wch: 25 }, // name
    { wch: 30 }, // email
    { wch: 15 }, // phone
    { wch: 15 }, // password
    { wch: 10 }, // role
    { wch: 35 }, // tpsName
    { wch: 12 }, // capacity
  ]

  // Create workbook with instructions
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, worksheet, 'Users')

  // Add instructions sheet
  const instructions = [
    ['PANDUAN IMPORT DATA USER / TPS / ADMIN'],
    [],
    ['PETUNJUK PENGGUNAAN:'],
    ['1. Isi kolom yang ada sesuai dengan format'],
    ['2. Untuk USER: Hanya isi nama, email, phone, password, dan role=USER'],
    ['3. Untuk TPS: Isi nama akun, email, phone, password, role=TPS, dan tpsName'],
    ['4. Untuk ADMIN: Isi nama, email, phone, password, dan role=ADMIN'],
    [],
    ['⚠️ SANGAT PENTING UNTUK TPS:'],
    ['- tpsName HARUS PERSIS SAMA dengan nama TPS di database GoClean'],
    ['- Jangan menggunakan nama TPS sembarangan atau yang tidak ada di database'],
    ['- Gunakan tombol "Download Daftar ID TPS" di modal import untuk melihat nama TPS yang valid'],
    ['- Copy-paste nama TPS dari daftar tersebut untuk menghindari kesalahan pengetikan'],
    ['- Jika TPS tidak ditemukan, import akan GAGAL untuk data tersebut'],
    [],
    ['PENJELASAN KOLOM:'],
    ['name', 'Nama lengkap user / nama admin TPS'],
    ['email', 'Email unik untuk login (harus format email yang valid)'],
    ['phone', 'Nomor telepon (contoh: 081234567890)'],
    ['password', 'Password minimal 6 karakter'],
    ['role', 'USER / TPS / ADMIN (huruf besar semua)'],
    ['tpsName', '⚠️ Nama TPS yang PERSIS SAMA dengan database (hanya untuk role TPS)'],
    ['capacity', 'Kapasitas TPS dalam kg (opsional, hanya untuk role TPS)'],
    [],
    ['CARA MENDAPATKAN NAMA TPS YANG BENAR:'],
    ['1. Di modal import, klik tombol "Download Daftar ID TPS"'],
    ['2. Buka file CSV yang terdownload'],
    ['3. Copy nama TPS dari kolom "Nama TPS"'],
    ['4. Paste ke kolom tpsName di file Excel ini'],
    ['5. Pastikan tidak ada spasi tambahan atau typo'],
    [],
    ['ATURAN VALIDASI:'],
    ['- Email harus unik (tidak boleh duplikat) dan format valid'],
    ['- Password minimal 6 karakter'],
    ['- Role hanya bisa USER, TPS, atau ADMIN (huruf besar)'],
    ['- Untuk TPS: tpsName wajib diisi dan harus ada di database'],
    ['- Phone bisa berisi angka saja atau dengan kode negara'],
    [],
    ['CONTOH DATA:'],
    ['USER:', 'Budi Santoso | budi@goclean.id | 081234567890 | Password123! | USER | (kosong) | (kosong)'],
    ['TPS:', 'Admin Bank Sampah | admin.banksampah@goclean.id | 082345678901 | TPS123! | TPS | Bank Sampah Induk Surabaya | 5000'],
    ['ADMIN:', 'Ady Firmansyah | admin@goclean.id | 083456789012 | Admin123! | ADMIN | (kosong) | (kosong)'],
    [],
    ['TROUBLESHOOTING:'],
    ['ERROR: "TPS tidak ditemukan"'],
    ['SOLUSI: Pastikan nama TPS di tpsName PERSIS SAMA dengan database. Download daftar TPS untuk referensi.'],
    [],
    ['ERROR: "Email already exists"'],
    ['SOLUSI: Gunakan email yang berbeda, email harus unik untuk setiap user.'],
    [],
    ['ERROR: "Invalid email format"'],
    ['SOLUSI: Pastikan email mengandung @ dan format yang benar (contoh: user@domain.com)'],
  ]

  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions)
  instructionSheet['!cols'] = [{ wch: 50 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(wb, instructionSheet, 'Panduan')

  // Generate and download
  XLSX.writeFile(wb, 'Template-Import-Users-GoClean.xlsx')
}

export const downloadTemplateWithData = (users: TemplateRow[]) => {
  const worksheet = XLSX.utils.json_to_sheet(users, {
    header: [
      'name',
      'email',
      'phone',
      'password',
      'role',
      'tpsName',
      'capacity',
    ],
  })

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 30 },
    { wch: 12 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, worksheet, 'Users')

  XLSX.writeFile(wb, `Import-Users-${new Date().toISOString().split('T')[0]}.xlsx`)
}
