import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery, executeQuerySingle, getPool } from '@/lib/db'
import sql from 'mssql'

/**
 * GET /api/pickups/[id]
 * Mengambil detail pickup request berdasarkan ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get transaksi detail
    const transaksi = await executeQuerySingle<any>(`
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
      WHERE t.IDTransaksi = @id
    `, { id })

    if (!transaksi) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Get waste items
    const wasteItems = await executeQuery<any>(`
      SELECT ds.IDDetail as id, k.JenisSampah as wasteType, 
             ds.EstimatedWeight as estimatedWeight, 
             ds.ActualWeight as actualWeight, ds.Price as price
      FROM DetailSampah ds
      JOIN KategoriSampah k ON ds.IDKategori = k.IDKategori
      WHERE ds.IDTransaksi = @id
    `, { id })

    const data = {
      id: transaksi.IDTransaksi,
      userId: transaksi.IDUser,
      tpsId: transaksi.IDTps,
      type: transaksi.Type,
      status: transaksi.StatusTransaksi,
      address: transaksi.AlamatJemput,
      description: transaksi.Description,
      latitude: transaksi.Latitude,
      longitude: transaksi.Longitude,
      scheduledAt: transaksi.ScheduledAt,
      completedAt: transaksi.CompletedAt,
      createdAt: transaksi.CreatedAt,
      updatedAt: transaksi.UpdatedAt,
      user: {
        id: transaksi.IDUser,
        name: transaksi.UserNama,
        email: transaksi.UserEmail,
        phone: transaksi.UserNoTelp
      },
      tps: transaksi.IDTps ? {
        id: transaksi.IDTps,
        name: transaksi.NamaTps,
        email: transaksi.TpsEmail,
        tpsProfile: {
          tpsName: transaksi.NamaTps,
          latitude: transaksi.TpsLatitude,
          longitude: transaksi.TpsLongitude,
          address: transaksi.TpsAlamat,
          phone: transaksi.TpsNoTelp,
          operatingHours: transaksi.JamOperasional
        }
      } : null,
      wasteItems,
      photos: [],
      videos: []
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get pickup detail error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/pickups/[id]
 * Update status pickup request
 * 
 * Body parameters:
 * - status: 'PENDING' | 'ACCEPTED' | 'COMPLETED'
 * - wasteItems: array of {id, actualWeight, price} (optional, for TPS to update weights)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, wasteItems } = body

    // Get existing transaksi
    const transaksi = await executeQuerySingle<any>(`
      SELECT IDTransaksi, IDUser, IDTps, StatusTransaksi
      FROM Transaksi
      WHERE IDTransaksi = @id
    `, { id })

    if (!transaksi) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    const pool = await getPool()
    const transaction = new sql.Transaction(pool)

    try {
      await transaction.begin()

      // Update status if provided
      if (status) {
        console.log('Updating status to:', status, 'for pickup:', id)

        const validStatuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'PICKED_UP', 'COMPLETED', 'CANCELLED']
        if (!validStatuses.includes(status)) {
          await transaction.rollback()
          console.error('Invalid status received:', status)
          return NextResponse.json(
            { error: `Status tidak valid. Status harus salah satu dari: ${validStatuses.join(', ')}` },
            { status: 400 }
          )
        }

        const request = transaction.request()
          .input('id', sql.NVarChar, id)
          .input('status', sql.NVarChar, status)

        // If TPS accepts or completes the pickup, assign TPS ID
        if ((status === 'ACCEPTED' || status === 'COMPLETED') && session.user.role === 'TPS') {
          // Get TPS ID from session
          const tps = await executeQuerySingle<{ IDTps: string }>(`
            SELECT IDTps FROM ProfileTps WHERE IDAkun = @idAkun
          `, { idAkun: session.user.id })

          if (tps) {
            request.input('tpsId', sql.NVarChar, tps.IDTps)

            if (status === 'COMPLETED') {
              request.input('completedAt', sql.DateTime, new Date())
              await request.query(`
                UPDATE Transaksi 
                SET StatusTransaksi = @status, 
                    IDTps = @tpsId,
                    CompletedAt = @completedAt,
                    UpdatedAt = GETDATE()
                WHERE IDTransaksi = @id
              `)
            } else {
              await request.query(`
                UPDATE Transaksi 
                SET StatusTransaksi = @status, 
                    IDTps = @tpsId,
                    UpdatedAt = GETDATE()
                WHERE IDTransaksi = @id
              `)
            }
          }
        } else {
          // Regular status update
          await request.query(`
            UPDATE Transaksi 
            SET StatusTransaksi = @status,
                UpdatedAt = GETDATE()
            WHERE IDTransaksi = @id
          `)
        }
      }

      // Update waste items if provided
      if (wasteItems && wasteItems.length > 0) {
        for (const item of wasteItems) {
          await transaction.request()
            .input('id', sql.NVarChar, item.id)
            .input('actualWeight', sql.Float, item.actualWeight)
            .input('price', sql.Decimal(18, 2), item.price)
            .query(`
              UPDATE DetailSampah 
              SET ActualWeight = @actualWeight,
                  Price = @price,
                  UpdatedAt = GETDATE()
              WHERE IDDetail = @id
            `)
        }
      }

      await transaction.commit()

      // Get updated data
      const updatedTransaksi = await executeQuerySingle<any>(`
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
        WHERE t.IDTransaksi = @id
      `, { id })

      const updatedWasteItems = await executeQuery<any>(`
        SELECT ds.IDDetail as id, k.JenisSampah as wasteType, 
               ds.EstimatedWeight as estimatedWeight, 
               ds.ActualWeight as actualWeight, ds.Price as price
        FROM DetailSampah ds
        JOIN KategoriSampah k ON ds.IDKategori = k.IDKategori
        WHERE ds.IDTransaksi = @id
      `, { id })

      const data = {
        id: updatedTransaksi.IDTransaksi,
        userId: updatedTransaksi.IDUser,
        tpsId: updatedTransaksi.IDTps,
        type: updatedTransaksi.Type,
        status: updatedTransaksi.StatusTransaksi,
        address: updatedTransaksi.AlamatJemput,
        description: updatedTransaksi.Description,
        latitude: updatedTransaksi.Latitude,
        longitude: updatedTransaksi.Longitude,
        scheduledAt: updatedTransaksi.ScheduledAt,
        completedAt: updatedTransaksi.CompletedAt,
        createdAt: updatedTransaksi.CreatedAt,
        updatedAt: updatedTransaksi.UpdatedAt,
        user: {
          id: updatedTransaksi.IDUser,
          name: updatedTransaksi.UserNama,
          email: updatedTransaksi.UserEmail,
          phone: updatedTransaksi.UserNoTelp
        },
        tps: updatedTransaksi.IDTps ? {
          id: updatedTransaksi.IDTps,
          name: updatedTransaksi.NamaTps,
          email: updatedTransaksi.TpsEmail,
          tpsProfile: {
            tpsName: updatedTransaksi.NamaTps,
            latitude: updatedTransaksi.TpsLatitude,
            longitude: updatedTransaksi.TpsLongitude,
            address: updatedTransaksi.TpsAlamat,
            phone: updatedTransaksi.TpsNoTelp,
            operatingHours: updatedTransaksi.JamOperasional
          }
        } : null,
        wasteItems: updatedWasteItems,
        photos: [],
        videos: []
      }

      return NextResponse.json({ data })
    } catch (error) {
      await transaction.rollback()
      console.error('Transaction error in PATCH:', error)
      throw error
    }
  } catch (error) {
    console.error('Update pickup error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui data', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/pickups/[id]
 * Hapus pickup request (hanya yang berstatus PENDING)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get transaksi
    const transaksi = await executeQuerySingle<any>(`
      SELECT t.IDTransaksi, t.IDUser, t.StatusTransaksi, u.IDAkun
      FROM Transaksi t
      LEFT JOIN [User] u ON t.IDUser = u.IDUser
      WHERE t.IDTransaksi = @id
    `, { id })

    if (!transaksi) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Only allow deletion if status is PENDING and by the owner
    if (transaksi.StatusTransaksi !== 'PENDING') {
      return NextResponse.json(
        { error: 'Hanya permintaan dengan status PENDING yang dapat dibatalkan' },
        { status: 400 }
      )
    }

    if (transaksi.IDAkun !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const pool = await getPool()
    const transaction = new sql.Transaction(pool)

    try {
      await transaction.begin()

      // Delete DetailSampah first (foreign key constraint)
      await transaction.request()
        .input('id', sql.NVarChar, id)
        .query(`DELETE FROM DetailSampah WHERE IDTransaksi = @id`)

      // Delete Transaksi
      await transaction.request()
        .input('id', sql.NVarChar, id)
        .query(`DELETE FROM Transaksi WHERE IDTransaksi = @id`)

      await transaction.commit()

      return NextResponse.json({ message: 'Permintaan berhasil dibatalkan' })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Delete pickup error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    )
  }
}
