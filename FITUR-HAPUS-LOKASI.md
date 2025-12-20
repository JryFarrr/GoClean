# 🗑️ Fitur Hapus Lokasi Pickup

## Overview
User sekarang dapat menghapus lokasi yang sudah dipilih (marker merah) jika ingin membatalkan pilihan atau memilih lokasi baru.

## ✨ Fitur yang Ditambahkan

### 1. Tombol Hapus di Info Box (✖️)
- **Lokasi**: Di pojok kanan atas kotak info "Lokasi Dipilih"
- **Tampilan**: Icon X (silang) berwarna merah
- **Fungsi**: Menghapus lokasi yang dipilih dan reset semua state

### 2. Tombol Hapus di Peta
- **Lokasi**: Di pojok kanan bawah peta (sebelah kiri tombol "Lokasi Saya")
- **Tampilan**: Tombol merah "Hapus Marker" dengan icon tempat sampah
- **Kondisi**: Hanya muncul ketika ada marker yang dipilih
- **Fungsi**: Menghapus marker dari peta

## 🎯 Cara Menggunakan

### Opsi 1: Tombol X di Info Box
```
1. Pilih lokasi di peta → Marker merah muncul
2. Info lokasi muncul di bawah peta
3. Klik icon X (✖️) di pojok kanan atas info box
4. Lokasi dihapus, marker hilang dari peta
5. Toast notification: "Lokasi dihapus"
```

### Opsi 2: Tombol "Hapus Marker" di Peta
```
1. Pilih lokasi di peta → Marker merah muncul
2. Tombol "Hapus Marker" muncul di peta
3. Klik tombol merah "Hapus Marker"
4. Marker hilang dari peta
5. Info lokasi hilang
```

## 🔧 Technical Details

### Perubahan di `page.tsx`

#### Fungsi Baru:
```typescript
const handleRemoveLocation = () => {
  setLocation(0, 0, '')
  setSelectedTPS(null)
  setSelectedKecamatan('')
  toast.success('Lokasi dihapus')
}
```

#### UI Baru:
```jsx
<button
  onClick={handleRemoveLocation}
  className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded-full transition-colors group"
  title="Hapus lokasi"
>
  <X size={20} className="text-red-600 group-hover:text-red-700" />
</button>
```

#### Props MapComponent:
```jsx
<MapComponent
  onMarkerRemove={handleRemoveLocation}
  showRemoveButton={!!latitude && !!longitude}
  // ... props lainnya
/>
```

### Perubahan di `MapComponent.tsx`

#### useEffect Baru:
```typescript
useEffect(() => {
  if (!showRemoveButton && selectedMarker && mapRef.current) {
    mapRef.current.removeLayer(selectedMarker)
    setSelectedMarker(null)
  }
}, [showRemoveButton, selectedMarker])
```

**Penjelasan:**
- Memonitor prop `showRemoveButton`
- Ketika berubah menjadi `false`, hapus marker dari peta
- Sinkronisasi antara state parent dan map component

## 🎨 Design

### Tombol X di Info Box:
```css
- Position: absolute top-2 right-2
- Background: transparent → red-100 on hover
- Icon: X (20px) red-600 → red-700 on hover
- Shape: rounded-full
- Interactive: Smooth transition
```

### Tombol Hapus di Peta:
```css
- Background: red-600 → red-700 on hover
- Text: white
- Icon: Trash can (20px)
- Position: absolute bottom-4 right-40
- Z-index: 1000
```

## 🔄 State Management

Ketika lokasi dihapus, state yang di-reset:
1. ✅ `latitude` → 0
2. ✅ `longitude` → 0
3. ✅ `address` → ''
4. ✅ `selectedTPS` → null
5. ✅ `selectedKecamatan` → ''
6. ✅ `selectedMarker` → null (di MapComponent)

## 🎯 User Flow

```
┌─────────────────────────┐
│ User pilih lokasi       │
│ (klik peta/kecamatan)   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Marker merah muncul     │
│ Info box muncul         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ User klik X atau        │
│ "Hapus Marker"          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Marker hilang           │
│ Info box hilang         │
│ State di-reset          │
│ Toast: "Lokasi dihapus" │
└─────────────────────────┘
```

## ✅ Testing Checklist

- [x] ✅ Tombol X muncul di info box
- [x] ✅ Tombol X berfungsi menghapus lokasi
- [x] ✅ Tombol "Hapus Marker" muncul di peta ketika ada marker
- [x] ✅ Tombol "Hapus Marker" hilang ketika tidak ada marker
- [x] ✅ Marker hilang dari peta saat dihapus
- [x] ✅ Info box hilang saat lokasi dihapus
- [x] ✅ Toast notification muncul
- [x] ✅ State TPS/kecamatan ter-reset
- [x] ✅ User bisa pilih lokasi baru setelah hapus
- [x] ✅ Tidak ada error di console

## 🐛 Edge Cases Handled

1. **Hapus via Info Box**
   - Marker di peta otomatis terhapus (via useEffect)
   
2. **Hapus via Tombol Peta**
   - Info box otomatis hilang (conditional rendering)

3. **Pilih TPS lalu Hapus**
   - TPS selection ter-reset
   - Kecamatan selection ter-reset

4. **Multiple Clicks**
   - Button disabled state handled by conditional rendering

## 📱 Responsive

**Desktop:**
- Tombol X: Top-right info box
- Tombol Hapus: Right-40 dari edge (sebelah kiri "Lokasi Saya")

**Mobile:**
- Tombol X: Tetap di top-right info box
- Tombol Hapus: Stack atau adjust position

## 🎉 Benefits

✅ **User Control** - User bisa undo pilihan lokasi  
✅ **Flexibility** - 2 cara untuk hapus (info box & peta)  
✅ **Visual Feedback** - Toast notification & marker hilang  
✅ **Clean State** - Semua state ter-reset dengan benar  
✅ **No Bugs** - Edge cases handled properly  

---

**Fitur hapus lokasi sekarang sudah aktif!** 🎊
