import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const onlyActive = searchParams.get('active') === 'true'

    // SQL query to get TPS list with profile information
    // Join Akun and ProfileTps tables where role is 'TPS'
    let query = `
      SELECT 
        a.IDAkun as id,
        a.Email as email,
        pt.IDTps as tpsProfileId,
        pt.NamaTps as tpsProfileName,
        pt.Alamat as tpsProfileAddress,
        pt.Longitude as tpsProfileLongitude,
        pt.Latitude as tpsProfileLatitude,
        pt.JamOperasional as tpsProfileOperatingHours,
        pt.IDKecamatan as tpsProfileKecamatanId,
        pt.Foto as tpsProfilePhoto,
        pt.NoTelp as tpsProfilePhone
      FROM Akun a
      LEFT JOIN ProfileTps pt ON a.IDAkun = pt.IDAkun
      WHERE a.Role = 'TPS'
    `

    // Note: Since ProfileTps doesn't have an 'isActive' field in the schema,
    // we'll ignore the onlyActive filter. If you need this, add an 'IsActive' 
    // column to ProfileTps table and update the query accordingly.

    const results = await executeQuery(query)

    // Transform results to match the expected format
    const tpsList = results.map((row: any) => ({
      id: row.id,
      email: row.email,
      tpsProfile: row.tpsProfileId ? {
        id: row.tpsProfileId,
        namaTps: row.tpsProfileName,
        alamat: row.tpsProfileAddress,
        longitude: row.tpsProfileLongitude,
        latitude: row.tpsProfileLatitude,
        jamOperasional: row.tpsProfileOperatingHours,
        idKecamatan: row.tpsProfileKecamatanId,
        foto: row.tpsProfilePhoto,
        noTelp: row.tpsProfilePhone
      } : null
    }))

    return NextResponse.json(tpsList)
  } catch (error) {
    console.error('Get TPS list error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data TPS' },
      { status: 500 }
    )
  }
}
