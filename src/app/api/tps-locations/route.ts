import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const SURABAYA_KECAMATAN = [
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
];

function findKecamatan(address: string): string {
  if (!address) return 'Lainnya';
  const lowerAddr = address.toLowerCase();
  for (const kec of SURABAYA_KECAMATAN) {
    if (lowerAddr.includes(kec.toLowerCase())) {
      return kec;
    }
  }
  return 'Lainnya';
}

// GET - Fetch all active TPS Users (public)
// Modified to return User IDs instead of TPSLocation IDs to fix Reference Error in PickupRequest
export async function GET() {
  try {
    const tpsUsers = await prisma.user.findMany({
      where: {
        role: 'TPS',
        tpsProfile: {
          isActive: true
        }
      },
      include: {
        tpsProfile: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const data = tpsUsers.map(user => {
      const profile = user.tpsProfile;
      if (!profile) return null;

      return {
        id: user.id, // Use User ID for relation
        name: profile.tpsName || user.name,
        kecamatan: findKecamatan(profile.address),
        address: profile.address,
        latitude: profile.latitude || 0,
        longitude: profile.longitude || 0,
        operatingHours: profile.operatingHours,
        phone: profile.phone || user.phone,
        isActive: profile.isActive
      };
    }).filter(item => item !== null);

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get TPS locations error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data lokasi TPS' },
      { status: 500 }
    )
  }
}
