/**
 * ============================================================================
 * UTILITY FUNCTIONS & CONSTANTS
 * ============================================================================
 * 
 * File ini berisi helper functions dan constants yang digunakan di seluruh
 * aplikasi untuk formatting, parsing, dan label mapping.
 * 
 * Fungsi Utama:
 * -------------
 * 1. parseJsonArray() - Parse string JSON menjadi array
 * 2. formatDate() - Format tanggal ke format Indonesia
 * 3. formatDateTime() - Format tanggal + waktu ke format Indonesia
 * 4. formatCurrency() - Format angka ke format Rupiah
 * 
 * Constants:
 * ----------
 * 1. WASTE_TYPE_LABELS - Mapping jenis sampah (enum → label)
 * 2. STATUS_LABELS - Mapping status pickup (enum → label + color)
 * 
 * Dependencies:
 * - Intl API (browser native) untuk formatting tanggal dan angka
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== JSON PARSING UTILITIES =====

/**
 * Parse string JSON menjadi array
 * Digunakan untuk parse field JSON di database yang disimpan sebagai string
 * 
 * @param value - String JSON, array, undefined, atau null
 * @returns Array hasil parsing, atau empty array jika gagal
 * 
 * Use Cases:
 * - Parse media URLs dari database (disimpan sebagai JSON string)
 * - Parse tags atau metadata
 * 
 * @example
 * // Input: '["url1.jpg", "url2.jpg"]'
 * // Output: ["url1.jpg", "url2.jpg"]
 * 
 * parseJsonArray('["a", "b"]')           // Returns: ["a", "b"]
 * parseJsonArray('invalid json')         // Returns: []
 * parseJsonArray(null)                   // Returns: []
 * parseJsonArray(['already', 'array'])   // Returns: ['already', 'array']
 */
export function parseJsonArray(value: string | string[] | undefined | null): string[] {
  // Jika value kosong (null/undefined), return empty array
  if (!value) return []

  // Jika sudah array, return as-is (tidak perlu parse)
  if (Array.isArray(value)) return value

  // Coba parse string JSON
  try {
    const parsed = JSON.parse(value)
    // Pastikan hasil parsing adalah array, jika bukan return []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Jika JSON.parse() error (invalid JSON), return []
    return []
  }
}

// ===== DATE & TIME FORMATTING =====

/**
 * Format tanggal ke format Indonesia
 * 
 * @param date - Date object atau ISO date string
 * @param options - Custom options untuk override default format
 * @returns String tanggal dalam bahasa Indonesia
 * 
 * Default Format: "1 Januari 2024"
 * 
 * @example
 * formatDate('2024-01-15')                           // "15 Januari 2024"
 * formatDate(new Date())                             // "24 Desember 2024"
 * formatDate('2024-01-15', { month: 'short' })      // "15 Jan 2024"
 * 
 * Intl.DateTimeFormatOptions:
 * - day: 'numeric' | '2-digit'
 * - month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
 * - year: 'numeric' | '2-digit'
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  // Default options: tanggal lengkap dalam bahasa Indonesia
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',      // Tanggal: 1, 2, 3, ... 31
    month: 'long',       // Bulan: Januari, Februari, ... Desember
    year: 'numeric',     // Tahun: 2024
    ...options           // Spread custom options (override default jika ada)
  }

  // toLocaleDateString() menggunakan Intl API (browser native)
  // Locale 'id-ID' untuk bahasa Indonesia
  return new Date(date).toLocaleDateString('id-ID', defaultOptions)
}

/**
 * Format tanggal DAN waktu ke format Indonesia
 * Preset function untuk format tanggal + jam:menit
 * 
 * @param date - Date object atau ISO date string
 * @returns String tanggal + waktu dalam bahasa Indonesia
 * 
 * Format: "15 Januari 2024, 14:30"
 * 
 * @example
 * formatDateTime('2024-01-15T14:30:00')    // "15 Januari 2024, 14:30"
 * formatDateTime(new Date())               // "24 Desember 2024, 09:47"
 * 
 * Use Case:
 * - Menampilkan waktu pickup request
 * - Timestamp transaksi
 * - Created/updated timestamp
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',    // Jam dengan 2 digit: 01, 02, ... 23
    minute: '2-digit'   // Menit dengan 2 digit: 00, 01, ... 59
  })
}

// ===== CURRENCY FORMATTING =====

/**
 * Format angka ke format Rupiah Indonesia
 * 
 * @param amount - Jumlah dalam angka (integer atau float)
 * @returns String format Rupiah dengan separator titik
 * 
 * Format: "Rp 1.000.000"
 * 
 * @example
 * formatCurrency(50000)       // "Rp 50.000"
 * formatCurrency(1000000)     // "Rp 1.000.000"
 * formatCurrency(1500.50)     // "Rp 1.501" (dibulatkan)
 * 
 * toLocaleString('id-ID'):
 * - Menggunakan separator titik (.) untuk ribuan
 * - Sesuai standar Indonesia
 * 
 * Use Case:
 * - Menampilkan harga sampah
 * - Total pendapatan user
 * - Harga per kg waste
 */
export function formatCurrency(amount: number): string {
  // toLocaleString() otomatis tambah separator sesuai locale
  return `Rp ${amount.toLocaleString('id-ID')}`
}

// ===== WASTE TYPE LABELS =====

/**
 * Mapping untuk label jenis sampah
 * Enum value di database → Label untuk ditampilkan di UI
 * 
 * Digunakan untuk:
 * - Dropdown form pilih jenis sampah
 * - Tampilan tabel waste items
 * - Filter berdasarkan jenis
 * 
 * @example
 * WASTE_TYPE_LABELS['PLASTIC']   // "Plastik"
 * WASTE_TYPE_LABELS['ORGANIC']   // "Organik"
 * 
 * // Iterate untuk create dropdown options
 * Object.entries(WASTE_TYPE_LABELS).map(([key, label]) => (
 *   <option key={key} value={key}>{label}</option>
 * ))
 */
export const WASTE_TYPE_LABELS: Record<string, string> = {
  ORGANIC: 'Organik',       // 🌿 Sampah organik (daun, sisa makanan)
  PLASTIC: 'Plastik',       // 🔵 Botol plastik, kemasan
  PAPER: 'Kertas',          // 📄 Kertas, kardus
  METAL: 'Logam',           // ⚙️ Kaleng, besi
  GLASS: 'Kaca',            // 🪟 Botol kaca, pecahan kaca
  ELECTRONIC: 'Elektronik', // 🔌 E-waste (gadget lama, kabel)
  OTHER: 'Lainnya'          // 📦 Jenis lain yang tidak masuk kategori
}

// ===== STATUS LABELS =====

/**
 * Mapping untuk label dan warna status pickup request
 * Enum value → Object { label, color (Tailwind classes) }
 * 
 * Digunakan untuk:
 * - Badge status di UI
 * - Filter berdasarkan status
 * - Timeline tracking
 * 
 * Tailwind Color Classes:
 * - bg-{color}-100: Background warna pastel
 * - text-{color}-800: Text warna gelap untuk kontras
 * 
 * @example
 * const { label, color } = STATUS_LABELS['PENDING']
 * // label: "Menunggu"
 * // color: "bg-yellow-100 text-yellow-800"
 * 
 * // Render badge
 * <span className={`px-2 py-1 rounded ${color}`}>
 *   {label}
 * </span>
 * 
 * Status Flow (Lifecycle Pickup Request):
 * ----------------------------------------
 * 1. PENDING → User submit pickup request, menunggu TPS
 * 2. ACCEPTED → TPS terima request, siap jemput
 * 3. ON_THE_WAY → TPS dalam perjalanan ke lokasi
 * 4. PICKED_UP → Sampah sudah diambil, belum bayar
 * 5. COMPLETED → Transaksi selesai, user sudah dibayar
 * 6. CANCELLED → Request dibatalkan (bisa oleh user atau TPS)
 */
export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: 'Menunggu',
    color: 'bg-yellow-100 text-yellow-800'     // 🟡 Kuning - Menunggu
  },
  ACCEPTED: {
    label: 'Diterima',
    color: 'bg-blue-100 text-blue-800'         // 🔵 Biru - Diterima TPS
  },
  ON_THE_WAY: {
    label: 'Dalam Perjalanan',
    color: 'bg-purple-100 text-purple-800'     // 🟣 Ungu - Sedang dijemput
  },
  PICKED_UP: {
    label: 'Sudah Dijemput',
    color: 'bg-indigo-100 text-indigo-800'     // 🔮 Indigo - Sudah diambil
  },
  COMPLETED: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-800'       // 🟢 Hijau - Completed & paid
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800'           // 🔴 Merah - Cancelled
  }
}

