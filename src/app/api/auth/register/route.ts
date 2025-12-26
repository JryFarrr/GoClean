import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { executeQuery, executeQuerySingle, getPool } from '@/lib/db'
import sql from 'mssql'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, role, tpsData } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama harus diisi' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingAkun = await executeQuerySingle<{ IDAkun: string }>(
      `SELECT IDAkun FROM Akun WHERE Email = @email`,
      { email }
    )

    if (existingAkun) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Use transaction
    const pool = await getPool()
    const transaction = new sql.Transaction(pool)

    try {
      await transaction.begin()

      // 1. Insert Akun with timestamps
      const akunResult = await transaction.request()
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('role', sql.NVarChar, role || 'USER')
        .query(`
          INSERT INTO Akun (IDAkun, Email, Password, Role, CreatedAt, UpdatedAt)
          OUTPUT INSERTED.IDAkun
          VALUES (NEWID(), @email, @password, @role, GETDATE(), GETDATE())
        `)

      const akunId = akunResult.recordset[0].IDAkun

      // 2. Insert User or UPDATE/INSERT ProfileTps
      if (role === 'TPS' && tpsData) {
        // Check if user selected existing TPS
        if (tpsData.selectedTpsId) {
          // UPDATE existing TPS location with akun
          await transaction.request()
            .input('idAkun', sql.NVarChar, akunId)
            .input('idTps', sql.NVarChar, tpsData.selectedTpsId)
            .query(`
              UPDATE ProfileTps
              SET IDAkun = @idAkun, UpdatedAt = GETDATE()
              WHERE IDTps = @idTps AND IDAkun IS NULL
            `)
        } else {
          // INSERT new TPS location
          await transaction.request()
            .input('idAkun', sql.NVarChar, akunId)
            .input('namaTps', sql.NVarChar, tpsData.tpsName)
            .input('alamat', sql.NVarChar, tpsData.address)
            .input('latitude', sql.Float, tpsData.latitude || null)
            .input('longitude', sql.Float, tpsData.longitude || null)
            .input('jamOperasional', sql.NVarChar, tpsData.operatingHours || null)
            .input('noTelp', sql.NVarChar, phone || null)
            .query(`
              INSERT INTO ProfileTps (IDTps, IDAkun, NamaTps, Alamat, Latitude, Longitude, JamOperasional, NoTelp, CreatedAt, UpdatedAt)
              VALUES (NEWID(), @idAkun, @namaTps, @alamat, @latitude, @longitude, @jamOperasional, @noTelp, GETDATE(), GETDATE())
            `)
        }
      } else {
        // INSERT User
        await transaction.request()
          .input('idAkun', sql.NVarChar, akunId)
          .input('nama', sql.NVarChar, name)
          .input('noTelp', sql.NVarChar, phone || null)
          .query(`
            INSERT INTO [User] (IDUser, IDAkun, Nama, NoTelp, CreatedAt, UpdatedAt)
            VALUES (NEWID(), @idAkun, @nama, @noTelp, GETDATE(), GETDATE())
          `)
      }

      await transaction.commit()

      return NextResponse.json(
        { message: 'Registrasi berhasil', userId: akunId },
        { status: 201 }
      )
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}
