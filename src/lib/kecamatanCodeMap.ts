/**
 * ============================================================================
 * KECAMATAN CODE MAPPING
 * ============================================================================
 * 
 * File ini berisi mapping antara kode kecamatan (kd_kecamatan) dengan nama kecamatan.
 * Kode ini mengikuti standard administratif resmi Pemerintah Kota Surabaya.
 * 
 * Fungsi Utama:
 * -------------
 * - Konversi kode kecamatan (001-031) ke nama kecamatan
 * - Digunakan untuk import data GeoJSON dari pemerintah
 * - Standardisasi penamaan kecamatan dalam database
 * 
 * Format Kode:
 * ------------
 * - 3 digit angka dengan leading zeros
 * - Contoh: '001', '002', '031'
 * - Total: 31 kode untuk 31 kecamatan
 * 
 * Data Source:
 * ------------
 * Berdasarkan:
 * - Data administratif resmi Pemkot Surabaya
 * - GeoJSON layer kecamatan dari Open Data Surabaya
 * - BPS (Badan Pusat Statistik) Kota Surabaya
 * 
 * Cara Penggunaan:
 * ----------------
 * // Get kecamatan name dari code
 * const kecamatan = getKecamatanFromCode('001') // "Karang Pilang"
 * 
 * // Iterate mapping
 * Object.entries(KECAMATAN_CODE_MAP).forEach(([code, name]) => {
 *   console.log(`Code ${code}: ${name}`)
 * })
 * 
 * // Check if code exists
 * const isValid = '001' in KECAMATAN_CODE_MAP // true
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== CODE TO NAME MAPPING =====
/**
 * Mapping kd_kecamatan (code) to Kecamatan name
 * Based on official Surabaya administrative data
 * 
 * Record<string, string>:
 * - Key: Kode kecamatan 3 digit (string)
 * - Value: Nama kecamatan (string)
 * 
 * Total: 31 entries untuk 31 kecamatan
 */
export const KECAMATAN_CODE_MAP: Record<string, string> = {
    '001': 'Karang Pilang',      // Surabaya Selatan
    '002': 'Wonocolo',            // Surabaya Selatan
    '003': 'Rungkut',             // Surabaya Timur
    '004': 'Gununganyar',         // Surabaya Timur (note: no space in official data)
    '005': 'Sukolilo',            // Surabaya Timur
    '006': 'Mulyorejo',           // Surabaya Timur
    '007': 'Gubeng',              // Surabaya Timur
    '008': 'Tegalsari',           // Surabaya Pusat
    '009': 'Genteng',             // Surabaya Pusat
    '010': 'Bubutan',             // Surabaya Pusat
    '011': 'Simokerto',           // Surabaya Pusat
    '012': 'Pabean Cantian',      // Surabaya Utara
    '013': 'Semampir',            // Surabaya Utara
    '014': 'Krembangan',          // Surabaya Utara
    '015': 'Kenjeran',            // Surabaya Utara
    '016': 'Bulak',               // Surabaya Utara
    '017': 'Tambaksari',          // Surabaya Pusat
    '018': 'Sawahan',             // Surabaya Pusat
    '019': 'Wonokromo',           // Surabaya Selatan
    '020': 'Wiyung',              // Surabaya Selatan
    '021': 'Jambangan',           // Surabaya Selatan
    '022': 'Gayungan',            // Surabaya Selatan
    '023': 'Tenggilis Mejoyo',    // Surabaya Timur
    '024': 'Sukomanunggal',       // Surabaya Barat
    '025': 'Tandes',              // Surabaya Barat
    '026': 'Asemrowo',            // Surabaya Barat
    '027': 'Lakarsantri',         // Surabaya Barat
    '028': 'Benowo',              // Surabaya Barat
    '029': 'Pakal',               // Surabaya Barat
    '030': 'Sambikerep',          // Surabaya Barat
    '031': 'Dukuh Pakis'          // Surabaya Selatan
};

// ===== HELPER FUNCTION =====
/**
 * Convert kode kecamatan ke nama kecamatan
 * 
 * @param code - Kode kecamatan 3 digit (string), contoh: '001', '015'
 * @returns Nama kecamatan atau null jika code tidak valid
 * 
 * @example
 * getKecamatanFromCode('001')  // Returns: "Karang Pilang"
 * getKecamatanFromCode('015')  // Returns: "Kenjeran"
 * getKecamatanFromCode('999')  // Returns: null
 * 
 * Use Case:
 * ---------
 * - Import GeoJSON dengan property kd_kecamatan
 * - Validasi kode kecamatan dari external data
 * - Normalize kecamatan names dari berbagai sources
 */
export function getKecamatanFromCode(code: string): string | null {
    return KECAMATAN_CODE_MAP[code] || null;  // Return name atau null jika tidak ada
}

