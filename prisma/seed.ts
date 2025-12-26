import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ===== 1. SEED KATEGORI SAMPAH =====
  console.log('📦 Seeding KategoriSampah...')
  const kategoriSampah = [
    { jenisSampah: 'ORGANIC', deskripsi: 'Sampah organik/basah' },
    { jenisSampah: 'PLASTIC', deskripsi: 'Sampah plastik' },
    { jenisSampah: 'PAPER', deskripsi: 'Sampah kertas' },
    { jenisSampah: 'METAL', deskripsi: 'Sampah logam' },
    { jenisSampah: 'GLASS', deskripsi: 'Sampah kaca' },
    { jenisSampah: 'ELECTRONIC', deskripsi: 'Sampah elektronik' },
  ]

  for (const kategori of kategoriSampah) {
    await prisma.kategoriSampah.upsert({
      where: { jenisSampah: kategori.jenisSampah },
      update: {},
      create: kategori,
    })
  }
  console.log('✅ KategoriSampah seeded!')

  // ===== 2. SEED KECAMATAN SURABAYA =====
  console.log('📍 Seeding Kecamatan...')
  const kecamatanList = [
    'Asemrowo', 'Benowo', 'Bubutan', 'Bulak', 'Dukuh Pakis',
    'Gayungan', 'Genteng', 'Gubeng', 'Gunung Anyar', 'Jambangan',
    'Karang Pilang', 'Kenjeran', 'Krembangan', 'Lakarsantri', 'Mulyorejo',
    'Pabean Cantian', 'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan',
    'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal', 'Tambaksari',
    'Tandes', 'Tegalsari', 'Tenggilis Mejoyo', 'Wiyung', 'Wonocolo', 'Wonokromo'
  ]

  const kecamatanRecords = []
  for (const namaKecamatan of kecamatanList) {
    const kec = await prisma.kecamatan.upsert({
      where: { id: `kec-${namaKecamatan.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `kec-${namaKecamatan.toLowerCase().replace(/\s+/g, '-')}`,
        namaKecamatan,
        kodeKecamatan: `SBY-${namaKecamatan.substring(0, 3).toUpperCase()}`,
      },
    })
    kecamatanRecords.push(kec)
  }
  console.log(`✅ ${kecamatanRecords.length} Kecamatan seeded!`)

  // ===== 3. SEED SAMPLE USERS (untuk demo) =====
  console.log('👤 Seeding sample users...')

  // Sample User 1
  const hashedPassword = await hash('password123', 12)

  const akun1 = await prisma.akun.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  })

  await prisma.user.create({
    data: {
      idAkun: akun1.id,
      nama: 'John Doe',
      alamat: 'Jl. Raya Surabaya No. 123',
      noTelp: '08123456789',
      idKecamatan: kecamatanRecords[0].id,
    },
  })
  console.log('✅ Sample USER created: user@example.com / password123')

  // Sample TPS 1
  const akunTps = await prisma.akun.create({
    data: {
      email: 'tps.gatsu@example.com',
      password: hashedPassword,
      role: 'TPS',
    },
  })

  await prisma.profileTps.create({
    data: {
      idAkun: akunTps.id,
      namaTps: 'TPS Gatot Subroto',
      alamat: 'Jl. Gatot Subroto No. 45, Surabaya',
      latitude: -7.2575,
      longitude: 112.7521,
      jamOperasional: '08:00 - 17:00',
      noTelp: '031-12345678',
      idKecamatan: kecamatanRecords[1].id,
    },
  })
  console.log('✅ Sample TPS created: tps.gatsu@example.com / password123')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
