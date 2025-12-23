import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all kecamatan from the master table to use for dummy data keys
    const allKecamatan = await prisma.kecamatan.findMany({
      select: {
        namaKecamatan: true
      }
    });

    if (allKecamatan.length === 0) {
      return NextResponse.json({ pickupByKecamatan: [] });
    }

    // Generate dummy transaction data for each kecamatan
    const dummyPickupsByKecamatan: Record<string, number> = {};
    allKecamatan.forEach((kec, index) => {
      // Create a varied distribution
      if (index % 5 === 0) {
        dummyPickupsByKecamatan[kec.namaKecamatan] = 0; // Ensure some are zero
      } else if (index % 5 === 1) {
        dummyPickupsByKecamatan[kec.namaKecamatan] = Math.floor(Math.random() * 10) + 1; // Small number
      } else if (index % 5 === 2) {
        dummyPickupsByKecamatan[kec.namaKecamatan] = Math.floor(Math.random() * 50) + 10; // Medium number
      } else {
        dummyPickupsByKecamatan[kec.namaKecamatan] = Math.floor(Math.random() * 100) + 50; // Large number
      }
    });

    // Format the result to match what the frontend expects
    const formattedResult = Object.entries(dummyPickupsByKecamatan).map(([kecamatan, count]) => ({
      kecamatan,
      _count: {
        kecamatan: count,
      },
    }));

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
