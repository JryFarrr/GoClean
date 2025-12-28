import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuerySingle } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile based on role
    if (session.user.role === 'USER') {
      const user = await executeQuerySingle<{
        IDUser: string
        Nama: string
        Alamat: string
        NoTelp: string
        Email: string
      }>(`
        SELECT u.IDUser, u.Nama, u.Alamat, u.NoTelp, a.Email
        FROM [User] u
        JOIN Akun a ON u.IDAkun = a.IDAkun
        WHERE u.IDAkun = @idAkun
      `, { idAkun: session.user.id })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json({
        id: user.IDUser,
        name: user.Nama,
        email: user.Email,
        phone: user.NoTelp,
        address: user.Alamat,
        role: 'USER'
      })
    } else if (session.user.role === 'TPS') {
      const tps = await executeQuerySingle<{
        IDTps: string
        NamaTps: string
        Alamat: string
        NoTelp: string
        Email: string
      }>(`
        SELECT p.IDTps, p.NamaTps, p.Alamat, p.NoTelp, a.Email
        FROM ProfileTps p
        JOIN Akun a ON p.IDAkun = a.IDAkun
        WHERE p.IDAkun = @idAkun
      `, { idAkun: session.user.id })

      if (!tps) {
        return NextResponse.json({ error: 'TPS not found' }, { status: 404 })
      }

      return NextResponse.json({
        id: tps.IDTps,
        name: tps.NamaTps,
        email: tps.Email,
        phone: tps.NoTelp,
        address: tps.Alamat,
        role: 'TPS'
      })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow USER role to update profile (not ADMIN or TPS)
    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Only users can update profile through this endpoint' }, { status: 403 })
    }

    const body = await req.json()
    const { name, phone, address, gopayNumber, whatsappNumber } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama harus diisi' }, { status: 400 })
    }

    // Update user profile
    await executeQuerySingle(`
      UPDATE [User]
      SET Nama = @name,
          NoTelp = @phone,
          Alamat = @address,
          NoGopay = @gopayNumber,
          NoWa = @whatsappNumber,
          UpdatedAt = GETDATE()
      WHERE IDAkun = @idAkun
    `, {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      gopayNumber: gopayNumber?.trim() || null,
      whatsappNumber: whatsappNumber?.trim() || null,
      idAkun: session.user.id
    })

    // Get updated user data
    const updatedUser = await executeQuerySingle<{
      IDUser: string
      Nama: string
      Alamat: string
      NoTelp: string
      NoGopay: string
      NoWa: string
      Email: string
    }>(`
      SELECT u.IDUser, u.Nama, u.Alamat, u.NoTelp, u.NoGopay, u.NoWa, a.Email
      FROM [User] u
      JOIN Akun a ON u.IDAkun = a.IDAkun
      WHERE u.IDAkun = @idAkun
    `, { idAkun: session.user.id })

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser?.IDUser,
        name: updatedUser?.Nama,
        email: updatedUser?.Email,
        phone: updatedUser?.NoTelp,
        address: updatedUser?.Alamat,
        gopayNumber: updatedUser?.NoGopay,
        whatsappNumber: updatedUser?.NoWa
      }
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui profil' },
      { status: 500 }
    )
  }
}
