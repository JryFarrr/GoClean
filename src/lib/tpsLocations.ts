// Data TPS berdasarkan kecamatan di Surabaya
// Koordinat diambil dari lokasi kecamatan di Surabaya

export interface TPSLocation {
  id: string
  name: string
  kecamatan: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
}

export const tpsLocations: TPSLocation[] = [
  // Surabaya Pusat
  {
    id: "tps-1",
    name: "TPS Genteng",
    kecamatan: "Genteng",
    address: "Jl. Genteng Kali, Genteng, Surabaya",
    latitude: -7.265757,
    longitude: 112.741371,
    operatingHours: "06:00 - 18:00",
    phone: "031-5311234"
  },
  {
    id: "tps-2",
    name: "TPS Tegalsari",
    kecamatan: "Tegalsari",
    address: "Jl. Tegalsari, Tegalsari, Surabaya",
    latitude: -7.268189,
    longitude: 112.737892,
    operatingHours: "06:00 - 18:00",
    phone: "031-5321234"
  },
  {
    id: "tps-3",
    name: "TPS Bubutan",
    kecamatan: "Bubutan",
    address: "Jl. Bubutan, Bubutan, Surabaya",
    latitude: -7.246567,
    longitude: 112.733345,
    operatingHours: "06:00 - 18:00",
    phone: "031-5331234"
  },
  {
    id: "tps-4",
    name: "TPS Simokerto",
    kecamatan: "Simokerto",
    address: "Jl. Simokerto, Simokerto, Surabaya",
    latitude: -7.233456,
    longitude: 112.729876,
    operatingHours: "06:00 - 18:00",
    phone: "031-5341234"
  },
  
  // Surabaya Utara
  {
    id: "tps-5",
    name: "TPS Pabean Cantian",
    kecamatan: "Pabean Cantian",
    address: "Jl. Pabean, Pabean Cantian, Surabaya",
    latitude: -7.208123,
    longitude: 112.738456,
    operatingHours: "06:00 - 18:00",
    phone: "031-5351234"
  },
  {
    id: "tps-6",
    name: "TPS Semampir",
    kecamatan: "Semampir",
    address: "Jl. Semampir Tengah, Semampir, Surabaya",
    latitude: -7.226789,
    longitude: 112.745678,
    operatingHours: "06:00 - 18:00",
    phone: "031-5361234"
  },
  {
    id: "tps-7",
    name: "TPS Krembangan",
    kecamatan: "Krembangan",
    address: "Jl. Krembangan Barat, Krembangan, Surabaya",
    latitude: -7.241234,
    longitude: 112.718901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5371234"
  },
  {
    id: "tps-8",
    name: "TPS Kenjeran",
    kecamatan: "Kenjeran",
    address: "Jl. Kenjeran, Kenjeran, Surabaya",
    latitude: -7.237890,
    longitude: 112.785123,
    operatingHours: "06:00 - 18:00",
    phone: "031-5381234"
  },
  {
    id: "tps-9",
    name: "TPS Bulak",
    kecamatan: "Bulak",
    address: "Jl. Bulak Banteng, Bulak, Surabaya",
    latitude: -7.210567,
    longitude: 112.768901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5391234"
  },
  
  // Surabaya Timur
  {
    id: "tps-10",
    name: "TPS Gubeng",
    kecamatan: "Gubeng",
    address: "Jl. Gubeng Kertajaya, Gubeng, Surabaya",
    latitude: -7.265123,
    longitude: 112.751890,
    operatingHours: "06:00 - 18:00",
    phone: "031-5401234"
  },
  {
    id: "tps-11",
    name: "TPS Rungkut",
    kecamatan: "Rungkut",
    address: "Jl. Rungkut Madya, Rungkut, Surabaya",
    latitude: -7.306789,
    longitude: 112.765432,
    operatingHours: "06:00 - 18:00",
    phone: "031-5411234"
  },
  {
    id: "tps-12",
    name: "TPS Tenggilis Mejoyo",
    kecamatan: "Tenggilis Mejoyo",
    address: "Jl. Tenggilis Timur, Tenggilis Mejoyo, Surabaya",
    latitude: -7.311234,
    longitude: 112.745678,
    operatingHours: "06:00 - 18:00",
    phone: "031-5421234"
  },
  {
    id: "tps-13",
    name: "TPS Gunung Anyar",
    kecamatan: "Gunung Anyar",
    address: "Jl. Gunung Anyar Tengah, Gunung Anyar, Surabaya",
    latitude: -7.330123,
    longitude: 112.765890,
    operatingHours: "06:00 - 18:00",
    phone: "031-5431234"
  },
  {
    id: "tps-14",
    name: "TPS Sukolilo",
    kecamatan: "Sukolilo",
    address: "Jl. Sukolilo, Sukolilo, Surabaya",
    latitude: -7.284567,
    longitude: 112.776543,
    operatingHours: "06:00 - 18:00",
    phone: "031-5441234"
  },
  {
    id: "tps-15",
    name: "TPS Mulyorejo",
    kecamatan: "Mulyorejo",
    address: "Jl. Mulyorejo, Mulyorejo, Surabaya",
    latitude: -7.272345,
    longitude: 112.784567,
    operatingHours: "06:00 - 18:00",
    phone: "031-5451234"
  },
  
  // Surabaya Selatan
  {
    id: "tps-16",
    name: "TPS Wonokromo",
    kecamatan: "Wonokromo",
    address: "Jl. Wonokromo, Wonokromo, Surabaya",
    latitude: -7.289012,
    longitude: 112.738901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5461234"
  },
  {
    id: "tps-17",
    name: "TPS Tegalsari",
    kecamatan: "Tegalsari",
    address: "Jl. Tegalsari Selatan, Tegalsari, Surabaya",
    latitude: -7.297890,
    longitude: 112.748901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5471234"
  },
  {
    id: "tps-18",
    name: "TPS Karang Pilang",
    kecamatan: "Karang Pilang",
    address: "Jl. Karang Pilang, Karang Pilang, Surabaya",
    latitude: -7.315678,
    longitude: 112.718901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5481234"
  },
  {
    id: "tps-19",
    name: "TPS Jambangan",
    kecamatan: "Jambangan",
    address: "Jl. Jambangan, Jambangan, Surabaya",
    latitude: -7.324567,
    longitude: 112.729012,
    operatingHours: "06:00 - 18:00",
    phone: "031-5491234"
  },
  {
    id: "tps-20",
    name: "TPS Gayungan",
    kecamatan: "Gayungan",
    address: "Jl. Gayungsari, Gayungan, Surabaya",
    latitude: -7.323456,
    longitude: 112.742345,
    operatingHours: "06:00 - 18:00",
    phone: "031-5501234"
  },
  {
    id: "tps-21",
    name: "TPS Wonocolo",
    kecamatan: "Wonocolo",
    address: "Jl. Wonocolo, Wonocolo, Surabaya",
    latitude: -7.317890,
    longitude: 112.751234,
    operatingHours: "06:00 - 18:00",
    phone: "031-5511234"
  },
  
  // Surabaya Barat
  {
    id: "tps-22",
    name: "TPS Benowo",
    kecamatan: "Benowo",
    address: "Jl. Benowo, Benowo, Surabaya",
    latitude: -7.251234,
    longitude: 112.658901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5521234"
  },
  {
    id: "tps-23",
    name: "TPS Pakal",
    kecamatan: "Pakal",
    address: "Jl. Pakal, Pakal, Surabaya",
    latitude: -7.228901,
    longitude: 112.674567,
    operatingHours: "06:00 - 18:00",
    phone: "031-5531234"
  },
  {
    id: "tps-24",
    name: "TPS Asemrowo",
    kecamatan: "Asemrowo",
    address: "Jl. Asemrowo, Asemrowo, Surabaya",
    latitude: -7.234567,
    longitude: 112.701234,
    operatingHours: "06:00 - 18:00",
    phone: "031-5541234"
  },
  {
    id: "tps-25",
    name: "TPS Sukomanunggal",
    kecamatan: "Sukomanunggal",
    address: "Jl. Sukomanunggal, Sukomanunggal, Surabaya",
    latitude: -7.265890,
    longitude: 112.686789,
    operatingHours: "06:00 - 18:00",
    phone: "031-5551234"
  },
  {
    id: "tps-26",
    name: "TPS Tandes",
    kecamatan: "Tandes",
    address: "Jl. Tandes, Tandes, Surabaya",
    latitude: -7.282345,
    longitude: 112.698901,
    operatingHours: "06:00 - 18:00",
    phone: "031-5561234"
  },
  {
    id: "tps-27",
    name: "TPS Sambikerep",
    kecamatan: "Sambikerep",
    address: "Jl. Sambikerep, Sambikerep, Surabaya",
    latitude: -7.285678,
    longitude: 112.654321,
    operatingHours: "06:00 - 18:00",
    phone: "031-5571234"
  },
  {
    id: "tps-28",
    name: "TPS Lakarsantri",
    kecamatan: "Lakarsantri",
    address: "Jl. Lakarsantri, Lakarsantri, Surabaya",
    latitude: -7.321234,
    longitude: 112.664567,
    operatingHours: "06:00 - 18:00",
    phone: "031-5581234"
  },
  {
    id: "tps-29",
    name: "TPS Wiyung",
    kecamatan: "Wiyung",
    address: "Jl. Wiyung, Wiyung, Surabaya",
    latitude: -7.328901,
    longitude: 112.687890,
    operatingHours: "06:00 - 18:00",
    phone: "031-5591234"
  },
  {
    id: "tps-30",
    name: "TPS Dukuh Pakis",
    kecamatan: "Dukuh Pakis",
    address: "Jl. Dukuh Pakis, Dukuh Pakis, Surabaya",
    latitude: -7.298765,
    longitude: 112.694567,
    operatingHours: "06:00 - 18:00",
    phone: "031-5601234"
  },
  {
    id: "tps-31",
    name: "TPS Sawahan",
    kecamatan: "Sawahan",
    address: "Jl. Sawahan, Sawahan, Surabaya",
    latitude: -7.276543,
    longitude: 112.725678,
    operatingHours: "06:00 - 18:00",
    phone: "031-5611234"
  }
]

// Get unique list of kecamatan
export const getKecamatanList = (): string[] => {
  const kecamatanSet = new Set(tpsLocations.map(tps => tps.kecamatan))
  return Array.from(kecamatanSet).sort()
}

// Get TPS by kecamatan
export const getTpsByKecamatan = (kecamatan: string): TPSLocation[] => {
  return tpsLocations.filter(tps => tps.kecamatan === kecamatan)
}

// Get nearest TPS from a coordinate
export const getNearestTPS = (lat: number, lng: number, limit: number = 5): TPSLocation[] => {
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return tpsLocations
    .map(tps => ({
      ...tps,
      distance: calculateDistance(lat, lng, tps.latitude, tps.longitude)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}
