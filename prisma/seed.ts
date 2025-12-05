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
