/**
 * Daftar 31 Kecamatan di Kota Surabaya
 * Diurutkan secara alfabetis untuk memudahkan pencarian
 */
export const SURABAYA_KECAMATAN = [
  'Asemrowo',
  'Benowo',
  'Bubutan',
  'Bulak',
  'Dukuh Pakis',
  'Gayungan',
  'Genteng',
  'Gubeng',
  'Gunung Anyar',
  'Jambangan',
  'Karang Pilang',
  'Kenjeran',
  'Krembangan',
  'Lakarsantri',
  'Mulyorejo',
  'Pabean Cantian',
  'Pakal',
  'Rungkut',
  'Sambikerep',
  'Sawahan',
  'Semampir',
  'Simokerto',
  'Sukolilo',
  'Sukomanunggal',
  'Tambaksari',
  'Tandes',
  'Tegalsari',
  'Tenggilis Mejoyo',
  'Wiyung',
  'Wonocolo',
  'Wonokromo'
] as const;

export type KecamatanSurabaya = typeof SURABAYA_KECAMATAN[number];
