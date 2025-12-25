/**
 * ============================================================================
 * DATA KECAMATAN SURABAYA
 * ============================================================================
 * 
 * File ini berisi daftar resmi 31 kecamatan di Kota Surabaya.
 * Data diurutkan secara alfabetis untuk memudahkan pencarian dan validasi.
 * 
 * Fungsi Utama:
 * -------------
 * - Digunakan untuk dropdown pilihan kecamatan di form
 * - Validasi input kecamatan dari user
 * - Filter TPS berdasarkan kecamatan
 * - Generate type-safe kecamatan string
 * 
 * Data Source:
 * ------------
 * Berdasarkan pembagian administratif resmi Pemerintah Kota Surabaya
 * Total: 31 Kecamatan
 * 
 * Pembagian Regional Surabaya:
 * ----------------------------
 * - Surabaya Utara: Kenjeran, Bulak, Semampir, Pabean Cantian, Krembangan
 * - Surabaya Timur: Gubeng, Sukolilo, Rungkut, Gunung Anyar, Tenggilis Mejoyo, Mulyorejo
 * - Surabaya Selatan: Wonokromo, Wonocolo, Karang Pilang, Jambangan, Gayungan, Wiyung, Dukuh Pakis
 * - Surabaya Barat: Benowo, Pakal, Asemrowo, Sukomanunggal, Tandes, Sambikerep, Lakarsantri
 * - Surabaya Pusat: Genteng, Tegalsari, Bubutan, Simokerto, Tambaksari, Sawahan
 * 
 * Cara Penggunaan:
 * ----------------
 * // Import array
 * import { SURABAYA_KECAMATAN } from '@/lib/surabayaKecamatan'
 * 
 * // Render dropdown
 * SURABAYA_KECAMATAN.map(kec => (
 *   <option key={kec} value={kec}>{kec}</option>
 * ))
 * 
 * // Type-safe validation
 * import { KecamatanSurabaya } from '@/lib/surabayaKecamatan'
 * const kecamatan: KecamatanSurabaya = 'Gubeng' // ✅ Valid
 * const invalid: KecamatanSurabaya = 'Invalid' // ❌ TypeScript error
 * 
 * // Check if value is valid kecamatan
 * const isValid = SURABAYA_KECAMATAN.includes(userInput as any)
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== KECAMATAN DATA =====
/**
 * Daftar 31 Kecamatan di Kota Surabaya
 * Diurutkan secara alfabetis untuk memudahkan pencarian
 * 
 * Konstanta 'as const' membuat array readonly dan type literal
 * Ini memungkinkan TypeScript generate union type dari values
 */
export const SURABAYA_KECAMATAN = [
  'Asemrowo',          // Surabaya Barat
  'Benowo',            // Surabaya Barat
  'Bubutan',           // Surabaya Pusat
  'Bulak',             // Surabaya Utara
  'Dukuh Pakis',       // Surabaya Selatan
  'Gayungan',          // Surabaya Selatan
  'Genteng',           // Surabaya Pusat
  'Gubeng',            // Surabaya Timur
  'Gunung Anyar',      // Surabaya Timur
  'Jambangan',         // Surabaya Selatan
  'Karang Pilang',     // Surabaya Selatan
  'Kenjeran',          // Surabaya Utara
  'Krembangan',        // Surabaya Utara
  'Lakarsantri',       // Surabaya Barat
  'Mulyorejo',         // Surabaya Timur
  'Pabean Cantian',    // Surabaya Utara
  'Pakal',             // Surabaya Barat
  'Rungkut',           // Surabaya Timur
  'Sambikerep',        // Surabaya Barat
  'Sawahan',           // Surabaya Pusat
  'Semampir',          // Surabaya Utara
  'Simokerto',         // Surabaya Pusat
  'Sukolilo',          // Surabaya Timur
  'Sukomanunggal',     // Surabaya Barat
  'Tambaksari',        // Surabaya Pusat
  'Tandes',            // Surabaya Barat
  'Tegalsari',         // Surabaya Pusat
  'Tenggilis Mejoyo',  // Surabaya Timur
  'Wiyung',            // Surabaya Selatan
  'Wonocolo',          // Surabaya Selatan
  'Wonokromo'          // Surabaya Selatan
] as const;

// ===== TYPE DEFINITION =====
/**
 * TypeScript Union Type untuk kecamatan Surabaya
 * 
 * Type ini di-generate otomatis dari SURABAYA_KECAMATAN array
 * Memberikan autocomplete dan type safety
 * 
 * Hasil type: 'Asemrowo' | 'Benowo' | 'Bubutan' | ... (31 values)
 * 
 * Penggunaan:
 * -----------
 * function setKecamatan(kec: KecamatanSurabaya) {
 *   // TypeScript akan error jika kec bukan salah satu dari 31 kecamatan
 * }
 */
export type KecamatanSurabaya = typeof SURABAYA_KECAMATAN[number];

