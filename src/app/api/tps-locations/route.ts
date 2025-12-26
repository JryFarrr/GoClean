import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// GET - Fetch all TPS locations
export async function GET() {
  try {
    const tpsLocations = await executeQuery<{
      IDTps: string
      NamaTps: string
      Alamat: string
      Latitude: number
      Longitude: number
      NoTelp: string
      JamOperasional: string
    }>(`
      SELECT 
        IDTps, 
        NamaTps, 
        Alamat, 
        Latitude, 
        Longitude, 
        NoTelp, 
        JamOperasional
      FROM ProfileTps
      WHERE Latitude IS NOT NULL 
        AND Longitude IS NOT NULL
        AND NamaTps IS NOT NULL
      ORDER BY NamaTps
    `)

    // Transform to match expected format
    const data = tpsLocations.map(tps => ({
      id: tps.IDTps,
      name: tps.NamaTps,
      address: tps.Alamat || 'Alamat tidak tersedia',
      latitude: tps.Latitude,
      longitude: tps.Longitude,
      phone: tps.NoTelp,
      operatingHours: tps.JamOperasional || '08:00-17:00'
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching TPS locations:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data lokasi TPS' },
      { status: 500 }
    )
  }
}
