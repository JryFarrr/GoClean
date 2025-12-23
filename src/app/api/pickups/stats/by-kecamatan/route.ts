import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Surabaya kecamatan list as fallback
const SURABAYA_KECAMATAN = [
  'Asemrowo', 'Benowo', 'Bubutan', 'Bulak', 'Dukuh Pakis',
  'Gayungan', 'Genteng', 'Gubeng', 'Gunung Anyar', 'Jambangan',
  'Karang Pilang', 'Kenjeran', 'Krembangan', 'Lakarsantri', 'Mulyorejo',
  'Pabean Cantian', 'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan',
  'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal', 'Tambaksari',
  'Tandes', 'Tegalsari', 'Tenggilis Mejoyo', 'Wiyung', 'Wonocolo', 'Wonokromo'
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get kecamatan from database first
    let kecamatanList: string[] = [];

    try {
      const allKecamatan = await prisma.kecamatan.findMany({
        select: {
          namaKecamatan: true
        }
      });

      if (allKecamatan.length > 0) {
        kecamatanList = allKecamatan.map(k => k.namaKecamatan);
        console.log(`✅ Using ${kecamatanList.length} kecamatan from database`);
      }
    } catch (dbError) {
      console.warn('Database query failed, using hardcoded list:', dbError);
    }

    // Fallback to hardcoded list if database is empty or fails
    if (kecamatanList.length === 0) {
      kecamatanList = SURABAYA_KECAMATAN;
      console.log(`⚠️ Using hardcoded list of ${kecamatanList.length} kecamatan`);
    }

    // Generate dummy transaction data for each kecamatan
    const dummyPickupsByKecamatan: Record<string, number> = {};
    kecamatanList.forEach((kecamatanName, index) => {
      // Create a varied distribution
      const mod = index % 5;
      if (mod === 0) {
        dummyPickupsByKecamatan[kecamatanName] = Math.floor(Math.random() * 10) + 1; // Low: 1-10
      } else if (mod === 1) {
        dummyPickupsByKecamatan[kecamatanName] = Math.floor(Math.random() * 30) + 10; // Medium-Low: 10-40
      } else if (mod === 2) {
        dummyPickupsByKecamatan[kecamatanName] = Math.floor(Math.random() * 50) + 30; // Medium: 30-80
      } else if (mod === 3) {
        dummyPickupsByKecamatan[kecamatanName] = Math.floor(Math.random() * 70) + 50; // Medium-High: 50-120
      } else {
        dummyPickupsByKecamatan[kecamatanName] = Math.floor(Math.random() * 100) + 80; // High: 80-180
      }
    });

    // Format the result to match what the frontend expects
    const formattedResult = Object.entries(dummyPickupsByKecamatan).map(([kecamatan, count]) => ({
      kecamatan,
      _count: {
        kecamatan: count,
      },
    }));

    console.log(`📊 Generated choropleth data for ${formattedResult.length} kecamatan`);

    return NextResponse.json({
      pickupByKecamatan: formattedResult,
    })
  } catch (error) {
    console.error('Pickup stats by kecamatan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil statistik.' },
      { status: 500 }
    )
  }
}
