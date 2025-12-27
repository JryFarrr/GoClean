# 🔴 Panduan Mengubah Navbar Menjadi Merah

Panduan singkat untuk mengubah warna navbar dari hijau ke merah.

## 📍 File yang Perlu Diubah

**File**: `src/components/Navbar.tsx`

## 🎯 Langkah-Langkah

### Cara 1: Find & Replace (Tercepat) ✨

1. Buka file `src/components/Navbar.tsx`
2. Tekan **`Ctrl + H`** (Find & Replace)
3. Di kolom **Find**, ketik: `green`
4. Di kolom **Replace**, ketik: `red`
5. Klik **"Replace All"**
6. Simpan file (`Ctrl + S`)

**Selesai!** Navbar Anda sekarang berwarna merah.

---

### Cara 2: Manual (Lihat Detail Perubahan)

Berikut adalah baris-baris yang perlu diubah:

#### 1. Background Navbar Utama (Baris 70)
**Sebelum:**
```tsx
<nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
```

**Sesudah:**
```tsx
<nav className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
```

---

#### 2. Logo "G" (Baris 76)
**Sebelum:**
```tsx
<span className="text-green-600 font-bold text-xl">G</span>
```

**Sesudah:**
```tsx
<span className="text-red-600 font-bold text-xl">G</span>
```

---

#### 3. Hover Menu Desktop (Baris 89)
**Sebelum:**
```tsx
className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-green-700 transition"
```

**Sesudah:**
```tsx
className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-700 transition"
```

---

#### 4. Hover Profile Button (Baris 113)
**Sebelum:**
```tsx
className="flex items-center space-x-2 p-2 hover:bg-green-700 rounded-md transition"
```

**Sesudah:**
```tsx
className="flex items-center space-x-2 p-2 hover:bg-red-700 rounded-md transition"
```

---

#### 5. Icon User (Baris 116)
**Sebelum:**
```tsx
<User size={18} className="text-green-600" />
```

**Sesudah:**
```tsx
<User size={18} className="text-red-600" />
```

---

#### 6. Hover Login Button (Baris 146)
**Sebelum:**
```tsx
className="px-4 py-2 hover:bg-green-700 rounded-md transition"
```

**Sesudah:**
```tsx
className="px-4 py-2 hover:bg-red-700 rounded-md transition"
```

---

#### 7. Button Daftar (Baris 152)
**Sebelum:**
```tsx
className="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100 transition"
```

**Sesudah:**
```tsx
className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100 transition"
```

---

#### 8. Border Mobile Menu (Baris 171)
**Sebelum:**
```tsx
<div className="md:hidden py-4 border-t border-green-500">
```

**Sesudah:**
```tsx
<div className="md:hidden py-4 border-t border-red-500">
```

---

#### 9. Border Mobile User Info (Baris 174)
**Sebelum:**
```tsx
<div className="px-4 py-2 border-b border-green-500 mb-2">
```

**Sesudah:**
```tsx
<div className="px-4 py-2 border-b border-red-500 mb-2">
```

---

#### 10. Text Email Mobile (Baris 176)
**Sebelum:**
```tsx
<p className="text-sm text-green-200">{session.user.email}</p>
```

**Sesudah:**
```tsx
<p className="text-sm text-red-200">{session.user.email}</p>
```

---

#### 11. Hover Mobile Menu Items (Baris 182, 192, 200, 210, 217)
**Sebelum:**
```tsx
hover:bg-green-700
```

**Sesudah:**
```tsx
hover:bg-red-700
```

---

## 📊 Ringkasan Perubahan

| Elemen | Kelas Sebelum | Kelas Sesudah |
|--------|---------------|---------------|
| Navbar Background | `bg-green-600` | `bg-red-600` |
| Logo Text | `text-green-600` | `text-red-600` |
| Hover Effects | `hover:bg-green-700` | `hover:bg-red-700` |
| Border Mobile | `border-green-500` | `border-red-500` |
| Text Secondary | `text-green-200` | `text-red-200` |
| User Icon | `text-green-600` | `text-red-600` |

**Total Perubahan**: 13 baris

---

## ✅ Hasil Akhir

Setelah perubahan, navbar akan memiliki:
- ✅ Background merah (`bg-red-600`)
- ✅ Hover effect merah gelap (`hover:bg-red-700`)
- ✅ Logo "G" berwarna merah
- ✅ Border merah di mobile menu
- ✅ Semua elemen konsisten dengan tema merah

---

## 🚀 Testing

1. **Simpan file** (`Ctrl + S`)
2. **Cek browser** - Navbar akan otomatis reload (Hot Reload)
3. **Test hover effects** - Hover menu items untuk lihat efek merah
4. **Test mobile** - Buka responsive mode di DevTools (`F12` → Toggle device toolbar)

---

## 🔄 Rollback (Jika Ingin Kembali ke Hijau)

Jika ingin kembali ke hijau:
1. Tekan `Ctrl + Z` untuk undo
2. Atau ulangi Find & Replace:
   - Find: `red`
   - Replace: `green`

---

**Selesai! Navbar sekarang berwarna merah! 🔴**
