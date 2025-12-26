import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuerySingle, executeQuery } from '@/lib/db'
import sql from 'mssql'

// GET - Get TPS profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await executeQuerySingle<{
      IDTps: string
      NamaTps: string
      Alamat: string
      Latitude: number
      Longitude: number
      NoTelp: string
      JamOperasional: string
      Foto: string
      Email: string
    }>(`
      SELECT p.IDTps, p.NamaTps, p.Alamat, p.Latitude, p.Longitude, 
             p.NoTelp, p.JamOperasional, p.Foto, a.Email
      FROM ProfileTps p
      JOIN Akun a ON p.IDAkun = a.IDAkun
      WHERE p.IDAkun = @idAkun
    `, { idAkun: session.user.id })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Transform to match old response format
    const transformedProfile = {
      id: profile.IDTps,
      name: profile.NamaTps,
      email: profile.Email,
      address: profile.Alamat,
      latitude: profile.Latitude,
      longitude: profile.Longitude,
      phone: profile.NoTelp,
      operatingHours: profile.JamOperasional,
      profileImage: profile.Foto,
      isActive: true
    }

    return NextResponse.json({ profile: transformedProfile })
  } catch (error) {
    console.error('Error fetching TPS profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update TPS profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { tpsName, address, latitude, longitude, phone, operatingHours, profileImage } = body

    if (!tpsName || !address) {
      return NextResponse.json(
        { error: 'TPS name and address are required' },
        { status: 400 }
      )
    }

    // Update profile with raw SQL
    let query = `
      UPDATE ProfileTps
      SET NamaTps = @tpsName,
          Alamat = @address,
          Latitude = @latitude,
          Longitude = @longitude,
          NoTelp = @phone,
          JamOperasional = @operatingHours
    `

    const params: any = {
      tpsName,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone,
      operatingHours,
      idAkun: session.user.id
    }

    if (profileImage !== undefined) {
      query += `, Foto = @foto`
      params.foto = profileImage
    }

    query += ` WHERE IDAkun = @idAkun`

    await executeQuery(query, params)

    return NextResponse.json({
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating TPS profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
