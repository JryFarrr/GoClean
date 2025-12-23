/**
 * Mapping kd_kecamatan (code) to Kecamatan name
 * Based on official Surabaya administrative data
 */
export const KECAMATAN_CODE_MAP: Record<string, string> = {
    '001': 'Karang Pilang',
    '002': 'Wonocolo',
    '003': 'Rungkut',
    '004': 'Gununganyar',
    '005': 'Sukolilo',
    '006': 'Mulyorejo',
    '007': 'Gubeng',
    '008': 'Tegalsari',
    '009': 'Genteng',
    '010': 'Bubutan',
    '011': 'Simokerto',
    '012': 'Pabean Cantian',
    '013': 'Semampir',
    '014': 'Krembangan',
    '015': 'Kenjeran',
    '016': 'Bulak',
    '017': 'Tambaksari',
    '018': 'Sawahan',
    '019': 'Wonokromo',
    '020': 'Wiyung',
    '021': 'Jambangan',
    '022': 'Gayungan',
    '023': 'Tenggilis Mejoyo',
    '024': 'Sukomanunggal',
    '025': 'Tandes',
    '026': 'Asemrowo',
    '027': 'Lakarsantri',
    '028': 'Benowo',
    '029': 'Pakal',
    '030': 'Sambikerep',
    '031': 'Dukuh Pakis'
};

export function getKecamatanFromCode(code: string): string | null {
    return KECAMATAN_CODE_MAP[code] || null;
}
