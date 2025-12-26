import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery, executeQuerySingle, getPool } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import sql from 'mssql'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const address = formData.get('address') as string
    const description = formData.get('description') as string
    const wasteItems = JSON.parse(formData.get('wasteItems') as string)
    const scheduledAt = formData.get('scheduledAt') as string
    const tpsId = formData.get('tpsId') as string
    const type = (formData.get('type') as string) || 'PICKUP'

    // Handle file uploads (skipped for fast-track)
    const photos: string[] = []
    const videos: string[] = []

    // Get User ID from session (session.user.id is Akun ID)
    const user = await executeQuerySingle<{ IDUser: string }>(
      `SELECT IDUser FROM [User] WHERE IDAkun = @idAkun`,
      { idAkun: session.user.id }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get kategori sampah mapping
    const kategoris = await executeQuery<{ IDKategori: string; JenisSampah: string }>(
      `SELECT IDKategori, JenisSampah FROM KategoriSampah`
    )
    const kategoriMap = new Map(kategoris.map(k => [k.JenisSampah, k.IDKategori]))

    // Use transaction
    const pool = await getPool()
    const transaction = new sql.Transaction(pool)

    try {
      await transaction.begin()

      // Insert Transaksi
      const transaksiResult = await transaction.request()
        .input('idUser', sql.NVarChar, user.IDUser)
        .input('idTps', sql.NVarChar, tpsId || null)
        .input('type', sql.NVarChar, type)
        .input('latitude', sql.Float, latitude)
        .input('longitude', sql.Float, longitude)
        .input('alamatJemput', sql.NVarChar, address)
        .input('description', sql.NVarChar, description || null)
        .input('scheduledAt', sql.DateTime, scheduledAt ? new Date(scheduledAt) : null)
        .input('statusTransaksi', sql.NVarChar, 'PENDING')
        .query(`
          INSERT INTO Transaksi (IDUser, IDTps, Type, Latitude, Longitude, AlamatJemput, Description, ScheduledAt, TanggalTransaksi, StatusTransaksi)
          OUTPUT INSERTED.IDTransaksi
          VALUES (@idUser, @idTps, @type, @latitude, @longitude, @alamatJemput, @description, @scheduledAt, GETDATE(), @statusTransaksi)
        `)

      const transaksiId = transaksiResult.recordset[0].IDTransaksi

      // Insert DetailSampah
      for (const item of wasteItems) {
        const kategoriId = kategoriMap.get(item.wasteType) || kategoris[0]?.IDKategori

        await transaction.request()
          .input('idTransaksi', sql.NVarChar, transaksiId)
          .input('idKategori', sql.NVarChar, kategoriId)
          .input('berat', sql.Float, item.estimatedWeight)
          .input('estimatedWeight', sql.Float, item.estimatedWeight)
          .query(`
            INSERT INTO DetailSampah (IDTransaksi, IDKategori, Berat, EstimatedWeight)
            VALUES (@idTransaksi, @idKategori, @berat, @estimatedWeight)
          `)
      }

      await transaction.commit()

      return NextResponse.json({ id: transaksiId, message: 'Transaksi created' }, { status: 201 })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Pickup request error:', error)
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build WHERE clause based on role
    let whereClause = ''
    const params: any = {}

    if (session.user.role === 'USER') {
      // Get user ID from Akun ID
      const user = await executeQuerySingle<{ IDUser: string }>(
        `SELECT IDUser FROM [User] WHERE IDAkun = @idAkun`,
        { idAkun: session.user.id }
      )
      if (user) {
        whereClause = 'WHERE t.IDUser = @userId'
        params.userId = user.IDUser
      }
    } else if (session.user.role === 'TPS') {
      // Get TPS ID from Akun ID
      const tps = await executeQuerySingle<{ IDTps: string }>(
        `SELECT IDTps FROM ProfileTps WHERE IDAkun = @idAkun`,
        { idAkun: session.user.id }
      )
      if (tps) {
        whereClause = 'WHERE (t.StatusTransaksi = \'PENDING\' OR t.IDTps = @tpsId)'
        params.tpsId = tps.IDTps
      }
    }

    if (status) {
      whereClause += whereClause ? ' AND' : 'WHERE'
      whereClause += ' t.StatusTransaksi = @status'
      params.status = status
    }

    // Get total count
    const countResult = await executeQuerySingle<{ Total: number }>(
      `SELECT COUNT(*) as Total FROM Transaksi t ${whereClause}`,
      params
    )
    const total = countResult?.Total || 0

    // Get paginated results with joins
    const offset = (page - 1) * limit
    const transaksiList = await executeQuery<any>(`
      SELECT 
        t.IDTransaksi, t.IDUser, t.IDTps, t.Type, t.StatusTransaksi,
        t.AlamatJemput, t.Description, t.Latitude, t.Longitude,
        t.ScheduledAt, t.CompletedAt, t.CreatedAt, t.UpdatedAt,
        u.Nama as UserNama, u.NoTelp as UserNoTelp, ua.Email as UserEmail,
        tps.NamaTps, tps.Alamat as TpsAlamat, tps.Latitude as TpsLatitude, 
        tps.Longitude as TpsLongitude, tps.NoTelp as TpsNoTelp, 
        tps.JamOperasional, tpsa.Email as TpsEmail
      FROM Transaksi t
      LEFT JOIN [User] u ON t.IDUser = u.IDUser
      LEFT JOIN Akun ua ON u.IDAkun = ua.IDAkun
      LEFT JOIN ProfileTps tps ON t.IDTps = tps.IDTps
      LEFT JOIN Akun tpsa ON tps.IDAkun = tpsa.IDAkun
      ${whereClause}
      ORDER BY t.CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `, { ...params, offset, limit })

    // Get waste items for each transaksi
    const transformedData = await Promise.all(
      transaksiList.map(async (t) => {
        const wasteItems = await executeQuery<any>(`
          SELECT ds.IDDetail as id, k.JenisSampah as wasteType, 
                 ds.EstimatedWeight as estimatedWeight, 
                 ds.ActualWeight as actualWeight, ds.Price as price
          FROM DetailSampah ds
          JOIN KategoriSampah k ON ds.IDKategori = k.IDKategori
          WHERE ds.IDTransaksi = @idTransaksi
        `, { idTransaksi: t.IDTransaksi })

        return {
          id: t.IDTransaksi,
          userId: t.IDUser,
          tpsId: t.IDTps,
          type: t.Type,
          status: t.StatusTransaksi,
          address: t.AlamatJemput,
          description: t.Description,
          latitude: t.Latitude,
          longitude: t.Longitude,
          scheduledAt: t.ScheduledAt,
          completedAt: t.CompletedAt,
          createdAt: t.CreatedAt,
          updatedAt: t.UpdatedAt,
          user: {
            id: t.IDUser,
            name: t.UserNama,
            email: t.UserEmail,
            phone: t.UserNoTelp
          },
          tps: t.IDTps ? {
            id: t.IDTps,
            name: t.NamaTps,
            email: t.TpsEmail,
            tpsProfile: {
              tpsName: t.NamaTps,
              latitude: t.TpsLatitude,
              longitude: t.TpsLongitude,
              address: t.TpsAlamat,
              phone: t.TpsNoTelp,
              operatingHours: t.JamOperasional
            }
          } : null,
          wasteItems,
          photos: [],
          videos: []
        }
      })
    )

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get pickup requests error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}
