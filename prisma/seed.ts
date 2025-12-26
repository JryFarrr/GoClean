import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@goclean.id' },
    update: {},
    create: {
      email: 'admin@goclean.id',
      password: adminPassword,
      name: 'Admin GoClean',
      phone: '081234567890',
      role: 'ADMIN'
    }
  })
  console.log('Created admin:', admin.email)

  // Create TPS Users
  const tpsPassword = await hash('tps123', 12)
  
  const tps1 = await prisma.user.upsert({
    where: { email: 'tps1@goclean.id' },
    update: {},
    create: {
      email: 'tps1@goclean.id',
      password: tpsPassword,
      name: 'TPS Jakarta Pusat',
      phone: '081234567891',
      role: 'TPS',
      tpsProfile: {
        create: {
          tpsName: 'TPS Jakarta Pusat',
          latitude: -6.1862,
          longitude: 106.8340,
          address: 'Jl. Merdeka No. 1, Jakarta Pusat',
          phone: '081234567891',
          operatingHours: '08:00 - 17:00',
          capacity: 1000,
          wastePrices: {
            create: [
              { wasteType: 'PLASTIC', pricePerKg: 3000, description: 'Botol plastik, kantong plastik' },
              { wasteType: 'PAPER', pricePerKg: 2000, description: 'Kardus, kertas HVS' },
              { wasteType: 'METAL', pricePerKg: 5000, description: 'Kaleng, besi' },
              { wasteType: 'GLASS', pricePerKg: 1500, description: 'Botol kaca' },
              { wasteType: 'ELECTRONIC', pricePerKg: 10000, description: 'HP, laptop rusak' },
              { wasteType: 'ORGANIC', pricePerKg: 500, description: 'Sisa makanan, daun' }
            ]
          }
        }
      }
    }
  })
  console.log('Created TPS:', tps1.email)

  const tps2 = await prisma.user.upsert({
    where: { email: 'tps2@goclean.id' },
    update: {},
    create: {
      email: 'tps2@goclean.id',
      password: tpsPassword,
      name: 'TPS Jakarta Selatan',
      phone: '081234567892',
      role: 'TPS',
      tpsProfile: {
        create: {
          tpsName: 'TPS Jakarta Selatan',
          latitude: -6.2615,
          longitude: 106.8106,
          address: 'Jl. Sudirman No. 100, Jakarta Selatan',
          phone: '081234567892',
          operatingHours: '07:00 - 18:00',
          capacity: 1500,
          wastePrices: {
            create: [
              { wasteType: 'PLASTIC', pricePerKg: 3500, description: 'Semua jenis plastik' },
              { wasteType: 'PAPER', pricePerKg: 2500, description: 'Kertas dan kardus' },
              { wasteType: 'METAL', pricePerKg: 5500, description: 'Logam dan besi' },
              { wasteType: 'GLASS', pricePerKg: 2000, description: 'Kaca dan botol' },
              { wasteType: 'ELECTRONIC', pricePerKg: 12000, description: 'Elektronik bekas' },
              { wasteType: 'ORGANIC', pricePerKg: 800, description: 'Sampah organik' }
            ]
          }
        }
      }
    }
  })
  console.log('Created TPS:', tps2.email)

  // Create Regular Users
  const userPassword = await hash('user123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@goclean.id' },
    update: {},
    create: {
      email: 'user1@goclean.id',
      password: userPassword,
      name: 'Budi Santoso',
      phone: '081234567893',
      address: 'Jl. Kebon Jeruk No. 10, Jakarta Barat',
      role: 'USER'
    }
  })
  console.log('Created user:', user1.email)

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@goclean.id' },
    update: {},
    create: {
      email: 'user2@goclean.id',
      password: userPassword,
      name: 'Siti Rahayu',
      phone: '081234567894',
      address: 'Jl. Kemang Raya No. 50, Jakarta Selatan',
      role: 'USER'
    }
  })
  console.log('Created user:', user2.email)

  // Create Sample Pickup Requests
  const pickup1 = await prisma.pickupRequest.create({
    data: {
      userId: user1.id,
      latitude: -6.1880,
      longitude: 106.7972,
      address: 'Jl. Kebon Jeruk No. 10, Jakarta Barat',
      description: 'Sampah plastik botol dan kardus bekas',
      status: 'PENDING',
      photos: '[]',
      videos: '[]',
      wasteItems: {
        create: [
          { wasteType: 'PLASTIC', estimatedWeight: 5 },
          { wasteType: 'PAPER', estimatedWeight: 3 }
        ]
      }
    }
  })
  console.log('Created pickup request:', pickup1.id)

  const pickup2 = await prisma.pickupRequest.create({
    data: {
      userId: user2.id,
      tpsId: tps2.id,
      latitude: -6.2601,
      longitude: 106.8116,
      address: 'Jl. Kemang Raya No. 50, Jakarta Selatan',
      description: 'Sampah elektronik dan logam bekas',
      status: 'ACCEPTED',
      photos: '[]',
      videos: '[]',
      wasteItems: {
        create: [
          { wasteType: 'ELECTRONIC', estimatedWeight: 2 },
          { wasteType: 'METAL', estimatedWeight: 4 }
        ]
      }
    }
  })
  console.log('Created pickup request:', pickup2.id)

  // ============================================
  // SEED GIS LAYERS
  // ============================================
  console.log('\nSeeding GIS Layers...')

  // Seed Kategori
  const kategoriTPS = await prisma.kategori.upsert({
    where: { id: 'kat-tps-001' },
    update: {},
    create: {
      id: 'kat-tps-001',
      namaKategori: 'TPS (Tempat Pembuangan Sampah)',
      deskripsi: 'Lokasi fasilitas pengolahan sampah'
    }
  })

  const kategoriBank = await prisma.kategori.upsert({
    where: { id: 'kat-bank-001' },
    update: {},
    create: {
      id: 'kat-bank-001',
      namaKategori: 'Bank Sampah',
      deskripsi: 'Lokasi bank sampah komunitas'
    }
  })

  const kategoriDropbox = await prisma.kategori.upsert({
    where: { id: 'kat-drop-001' },
    update: {},
    create: {
      id: 'kat-drop-001',
      namaKategori: 'Drop Box',
      deskripsi: 'Titik pengumpulan sampah sementara'
    }
  })
  console.log('Created Kategori')

  // Seed Kecamatan Surabaya
  const kecamatanData = [
    { id: 'kec-001', nama: 'Gubeng', kode: 'GBG' },
    { id: 'kec-002', nama: 'Tegalsari', kode: 'TGS' },
    { id: 'kec-003', nama: 'Genteng', kode: 'GTG' },
    { id: 'kec-004', nama: 'Bubutan', kode: 'BBT' },
    { id: 'kec-005', nama: 'Simokerto', kode: 'SMK' },
    { id: 'kec-006', nama: 'Pabean Cantian', kode: 'PBC' },
    { id: 'kec-007', nama: 'Semampir', kode: 'SMP' },
    { id: 'kec-008', nama: 'Krembangan', kode: 'KRB' },
    { id: 'kec-009', nama: 'Kenjeran', kode: 'KNJ' },
    { id: 'kec-010', nama: 'Bulak', kode: 'BLK' },
  ]

  for (const kec of kecamatanData) {
    await prisma.kecamatan.upsert({
      where: { id: kec.id },
      update: {},
      create: {
        id: kec.id,
        namaKecamatan: kec.nama,
        kodeKecamatan: kec.kode
      }
    })
  }
  console.log('Created 10 Kecamatan')

  // Seed Layer Point - ObjekPoint (Lokasi Fasilitas TPS)
  await prisma.objekPoint.upsert({
    where: { pointId: 'point-001' },
    update: {},
    create: {
      pointId: 'point-001',
      namaObjek: 'TPS Gubeng',
      kategoriId: kategoriTPS.id,
      latitude: -7.265123,
      longitude: 112.751890,
      deskripsi: 'TPS utama kecamatan Gubeng dengan fasilitas lengkap',
      kecamatanId: 'kec-001'
    }
  })

  await prisma.objekPoint.upsert({
    where: { pointId: 'point-002' },
    update: {},
    create: {
      pointId: 'point-002',
      namaObjek: 'Bank Sampah Tegalsari',
      kategoriId: kategoriBank.id,
      latitude: -7.268189,
      longitude: 112.737892,
      deskripsi: 'Bank sampah komunitas dengan program tabungan sampah',
      kecamatanId: 'kec-002'
    }
  })

  await prisma.objekPoint.upsert({
    where: { pointId: 'point-003' },
    update: {},
    create: {
      pointId: 'point-003',
      namaObjek: 'Drop Box Genteng',
      kategoriId: kategoriDropbox.id,
      latitude: -7.265757,
      longitude: 112.741371,
      deskripsi: 'Titik drop sampah 24 jam',
      kecamatanId: 'kec-003'
    }
  })
  console.log('Created 3 ObjekPoint (Layer Point)')

  // Seed Layer Line - Jalan/Rute pengangkutan sampah
  const ruteSampah1 = {
    type: 'LineString',
    coordinates: [
      [112.751890, -7.265123], // Start: TPS Gubeng
      [112.748901, -7.266234],
      [112.745678, -7.268189], // Middle
      [112.741371, -7.265757], // End: Drop Box Genteng
    ]
  }

  await prisma.jalan.upsert({
    where: { jalanId: 'jalan-001' },
    update: {},
    create: {
      jalanId: 'jalan-001',
      namaJalan: 'Rute Pengangkutan Gubeng-Genteng',
      koordinatJSON: JSON.stringify(ruteSampah1)
    }
  })

  const ruteSampah2 = {
    type: 'LineString',
    coordinates: [
      [112.737892, -7.268189], // Start: Bank Sampah Tegalsari
      [112.739234, -7.269456],
      [112.741371, -7.265757], // End: Drop Box Genteng
    ]
  }

  await prisma.jalan.upsert({
    where: { jalanId: 'jalan-002' },
    update: {},
    create: {
      jalanId: 'jalan-002',
      namaJalan: 'Rute Pengangkutan Tegalsari-Genteng',
      koordinatJSON: JSON.stringify(ruteSampah2)
    }
  })
  console.log('Created 2 Jalan (Layer Line)')

  // Seed Layer Polygon - Area Kecamatan
  const polygonGubeng = {
    type: 'Polygon',
    coordinates: [[
      [112.745, -7.260],
      [112.760, -7.260],
      [112.760, -7.270],
      [112.745, -7.270],
      [112.745, -7.260]
    ]]
  }

  await prisma.area.upsert({
    where: { areaId: 'area-001' },
    update: {},
    create: {
      areaId: 'area-001',
      namaArea: 'Area Kecamatan Gubeng',
      polygonJSON: JSON.stringify(polygonGubeng),
      kecamatanId: 'kec-001'
    }
  })

  const polygonTegalsari = {
    type: 'Polygon',
    coordinates: [[
      [112.730, -7.265],
      [112.745, -7.265],
      [112.745, -7.275],
      [112.730, -7.275],
      [112.730, -7.265]
    ]]
  }

  await prisma.area.upsert({
    where: { areaId: 'area-002' },
    update: {},
    create: {
      areaId: 'area-002',
      namaArea: 'Area Kecamatan Tegalsari',
      polygonJSON: JSON.stringify(polygonTegalsari),
      kecamatanId: 'kec-002'
    }
  })

  const polygonGenteng = {
    type: 'Polygon',
    coordinates: [[
      [112.735, -7.260],
      [112.750, -7.260],
      [112.750, -7.270],
      [112.735, -7.270],
      [112.735, -7.260]
    ]]
  }

  await prisma.area.upsert({
    where: { areaId: 'area-003' },
    update: {},
    create: {
      areaId: 'area-003',
      namaArea: 'Area Kecamatan Genteng',
      polygonJSON: JSON.stringify(polygonGenteng),
      kecamatanId: 'kec-003'
    }
  })
  console.log('Created 3 Area (Layer Polygon)')

  console.log('\nGIS Layers seeding completed!')

  // Create demo accounts info
  console.log('\n=== Demo Accounts ===')
  console.log('Admin: admin@goclean.id / admin123')
  console.log('TPS 1: tps1@goclean.id / tps123')
  console.log('TPS 2: tps2@goclean.id / tps123')
  console.log('User 1: user1@goclean.id / user123')
  console.log('User 2: user2@goclean.id / user123')
  console.log('=====================\n')

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
