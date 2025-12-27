# 🎨 Panduan Mengganti Warna UI dari Hijau ke Merah

Panduan ini akan membantu Anda mengubah skema warna aplikasi GoClean dari hijau menjadi merah.

## 📋 Daftar Isi
1. [Ubah Variabel Warna Global](#1-ubah-variabel-warna-global)
2. [Ubah Kelas Tailwind](#2-ubah-kelas-tailwind)
3. [File-file yang Perlu Diubah](#3-file-file-yang-perlu-diubah)
4. [Cara Cepat: Find & Replace](#4-cara-cepat-find--replace)

---

## 1. Ubah Variabel Warna Global

### File: `src/app/globals.css`

Ubah variabel CSS dari hijau ke merah pada **baris 4-28**:

**Sebelum:**
```css
:root {
  --background: #f0fdf4;  /* Green background */
  --foreground: #171717;

  /* Green Color Palette */
  --green-50: #f0fdf4;
  --green-100: #dcfce7;
  --green-200: #bbf7d0;
  --green-300: #86efac;
  --green-400: #4ade80;
  --green-500: #22c55e;
  --green-600: #16a34a;
  --green-700: #15803d;
  --green-800: #166534;
  --green-900: #14532d;

  --shadow-glow: 0 0 40px rgba(34, 197, 94, 0.3);
}

body {
  background: #f0fdf4;
}
```

**Sesudah:**
```css
:root {
  --background: #fef2f2;  /* Red background */
  --foreground: #171717;

  /* Red Color Palette */
  --red-50: #fef2f2;
  --red-100: #fee2e2;
  --red-200: #fecaca;
  --red-300: #fca5a5;
  --red-400: #f87171;
  --red-500: #ef4444;
  --red-600: #dc2626;
  --red-700: #b91c1c;
  --red-800: #991b1b;
  --red-900: #7f1d1d;

  --shadow-glow: 0 0 40px rgba(239, 68, 68, 0.3);
}

body {
  background: #fef2f2;
}
```

### Ubah Gradient Text (baris 177-182)

**Sebelum:**
```css
.gradient-text {
  background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

**Sesudah:**
```css
.gradient-text {
  background: linear-gradient(135deg, #b91c1c, #dc2626, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 2. Ubah Kelas Tailwind

Gunakan **Find & Replace** di seluruh project untuk mengganti kelas Tailwind dari hijau ke merah:

### Pattern Replacement

| Pattern Hijau | Ganti dengan Merah |
|---------------|-------------------|
| `bg-green-50` | `bg-red-50` |
| `bg-green-100` | `bg-red-100` |
| `bg-green-200` | `bg-red-200` |
| `bg-green-300` | `bg-red-300` |
| `bg-green-400` | `bg-red-400` |
| `bg-green-500` | `bg-red-500` |
| `bg-green-600` | `bg-red-600` |
| `bg-green-700` | `bg-red-700` |
| `bg-green-800` | `bg-red-800` |
| `bg-green-900` | `bg-red-900` |
| `text-green-50` | `text-red-50` |
| `text-green-100` | `text-red-100` |
| `text-green-200` | `text-red-200` |
| `text-green-300` | `text-red-300` |
| `text-green-400` | `text-red-400` |
| `text-green-500` | `text-red-500` |
| `text-green-600` | `text-red-600` |
| `text-green-700` | `text-red-700` |
| `text-green-800` | `text-red-800` |
| `text-green-900` | `text-red-900` |
| `border-green-200` | `border-red-200` |
| `border-green-300` | `border-red-300` |
| `border-green-400` | `border-red-400` |
| `border-green-500` | `border-red-500` |
| `hover:bg-green-` | `hover:bg-red-` |
| `hover:text-green-` | `hover:text-red-` |

---

## 3. File-file yang Perlu Diubah

Berikut adalah daftar file yang menggunakan warna hijau dan perlu diubah:

### 📁 Components
- `src/components/Navbar.tsx` (70+ instances)
- `src/components/MapComponent.tsx` (30+ instances)
- `src/components/WasteItemSelector.tsx` (6 instances)
- `src/components/TPSLocationPicker.tsx` (4 instances)
- `src/components/MediaUploader.tsx` (4 instances)

### 📁 Pages - TPS
- `src/app/tps/requests/page.tsx` (20+ instances)
- `src/app/tps/prices/page.tsx` (15+ instances)
- `src/app/tps/pickup/[id]/page.tsx` (3 instances)
- `src/app/tps/profile/page.tsx`

### 📁 Pages - User & Dashboard
- `src/app/dashboard/page.tsx`
- `src/app/user/*` (berbagai halaman user)

### 📁 Pages - Admin
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/pickups/page.tsx`
- Dan file admin lainnya

### 📁 Utilities
- `src/lib/utils.ts` (status colors)

---

## 4. Cara Cepat: Find & Replace

### Menggunakan VS Code

1. Tekan `Ctrl + Shift + H` (atau `Cmd + Shift + H` di Mac)
2. Aktifkan **"Use Regular Expression"** (icon `.*`)
3. Di kolom **Find**, masukkan:
   ```
   (bg|text|border|hover:bg|hover:text)-green-(\d+)
   ```
4. Di kolom **Replace**, masukkan:
   ```
   $1-red-$2
   ```
5. Klik **"Replace All"** di folder `src/`

### Manual Per File

Atau Anda bisa mengganti satu per satu di setiap file:

1. Buka file yang ingin diubah
2. Tekan `Ctrl + H` (Find & Replace)
3. Cari: `green-` 
4. Ganti dengan: `red-`
5. Review setiap perubahan sebelum **Replace All**

---

## ✅ Checklist Perubahan

- [ ] Ubah `globals.css` - variabel CSS root
- [ ] Ubah `globals.css` - body background
- [ ] Ubah `globals.css` - gradient text
- [ ] Ganti semua `bg-green-` menjadi `bg-red-`
- [ ] Ganti semua `text-green-` menjadi `text-red-`
- [ ] Ganti semua `border-green-` menjadi `border-red-`
- [ ] Ganti semua `hover:bg-green-` menjadi `hover:bg-red-`
- [ ] Test tampilan di browser
- [ ] Periksa semua halaman utama
- [ ] Commit perubahan

---

## 🎯 Tips

1. **Backup dulu**: Commit perubahan Anda sebelum melakukan replace massal
   ```bash
   git add .
   git commit -m "backup before color change"
   ```

2. **Test di branch baru**: Buat branch baru untuk testing
   ```bash
   git checkout -b feature/red-theme
   ```

3. **Preview dulu**: Sebelum Replace All, klik "Replace" satu-satu untuk preview

4. **Restart dev server**: Setelah ubah `globals.css`, restart `npm run dev`

---

## 🚀 Setelah Selesai

Setelah semua perubahan selesai:

1. Restart development server:
   ```bash
   # Stop npm run dev (Ctrl + C)
   npm run dev
   ```

2. Buka browser dan cek semua halaman:
   - Homepage
   - Dashboard
   - TPS Profile
   - User Profile
   - Admin Pages

3. Jika puas, commit perubahan:
   ```bash
   git add .
   git commit -m "Change color scheme from green to red"
   ```

---

**Selamat! UI Anda sekarang menggunakan warna merah! 🔴**
