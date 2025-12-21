import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all active TPS locations (public)
export async function GET() {
  try {
    const tpsLocations = await prisma.tPSLocation.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ data: tpsLocations })
  } catch (error) {
    console.error('Get TPS locations error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data lokasi TPS' },
      { status: 500 }
    )
  }
}
