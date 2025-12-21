import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            gopayNumber: true,
            whatsappNumber: true
          }
        },
        tps: {
          select: {
            id: true,
            name: true,
            phone: true,
            tpsProfile: true
          }
        },
        wasteItems: true,
        transaction: true
      }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Parse photos and videos from JSON string to array
    const parsedPickupRequest = {
      ...pickupRequest,
      photos: typeof pickupRequest.photos === 'string' ? JSON.parse(pickupRequest.photos || '[]') : pickupRequest.photos,
      videos: typeof pickupRequest.videos === 'string' ? JSON.parse(pickupRequest.videos || '[]') : pickupRequest.videos
    }

    return NextResponse.json({ data: parsedPickupRequest })
  } catch (error) {
    console.error('Get pickup detail error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

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
    const { status, wasteItems, totalWeight, totalPrice } = body

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id },
      include: { wasteItems: true }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Update data
    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      
      // If TPS accepts the request
      if (status === 'ACCEPTED' && session.user.role === 'TPS') {
        updateData.tpsId = session.user.id
      }
      
      // If picked up
      if (status === 'PICKED_UP') {
        updateData.pickedUpAt = new Date()
      }
    }

    const updatedPickup = await prisma.pickupRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        tps: {
          select: {
            id: true,
            name: true,
            tpsProfile: true
          }
        },
        wasteItems: true
      }
    })

    // Update waste items if provided (for TPS to input actual weight)
    if (wasteItems && wasteItems.length > 0) {
      for (const item of wasteItems) {
        await prisma.wasteItem.update({
          where: { id: item.id },
          data: {
            actualWeight: item.actualWeight,
            price: item.price
          }
        })
      }
    }

    // Create transaction if status is COMPLETED
    if (status === 'COMPLETED' && totalWeight && totalPrice) {
      await prisma.transaction.create({
        data: {
          pickupRequestId: id,
          userId: pickupRequest.userId,
          totalWeight,
          totalPrice,
          isPaid: false
        }
      })
    }

    // Create notification for user
    if (status) {
      let notificationTitle = ''
      let notificationMessage = ''
      let notificationType = ''
      
      const tpsName = updatedPickup.tps?.tpsProfile?.tpsName || updatedPickup.tps?.name || 'TPS'
      
      // Check if this is a rollback (status moved backwards)
      const statusOrder: Record<string, number> = {
        'PENDING': 1,
        'ACCEPTED': 2,
        'ON_THE_WAY': 3,
        'PICKED_UP': 4,
        'COMPLETED': 5
      }
      
      const isRollback = statusOrder[status] < statusOrder[pickupRequest.status]

      switch (status) {
        case 'PENDING':
          if (isRollback) {
            // Rollback to PENDING
            notificationTitle = '🔄 Status Permintaan Diperbarui'
            notificationMessage = `Hai ${updatedPickup.user.name}, status permintaan penjemputan sampah Anda telah dikembalikan menjadi "Menunggu Konfirmasi". Mohon menunggu konfirmasi ulang dari ${tpsName}.`
            notificationType = 'pickup_rollback'
          }
          break
        case 'ACCEPTED':
          if (isRollback) {
            // Rollback to ACCEPTED
            notificationTitle = '🔄 Status Permintaan Diperbarui'
            notificationMessage = `Hai ${updatedPickup.user.name}, status permintaan penjemputan sampah Anda telah dikembalikan menjadi "Diterima". Mohon menunggu petugas ${tpsName} untuk berangkat ke lokasi Anda.`
            notificationType = 'pickup_rollback'
          } else {
            notificationTitle = '✅ Permintaan Diterima TPS'
            notificationMessage = `Selamat ${updatedPickup.user.name}, permintaan penjemputan sampah Anda telah diterima oleh ${tpsName}. Petugas akan segera menjemput sampah Anda.`
            notificationType = 'pickup_accepted'
          }
          break
        case 'ON_THE_WAY':
          if (isRollback) {
            // Rollback to ON_THE_WAY
            notificationTitle = '🔄 Status Permintaan Diperbarui'
            notificationMessage = `Hai ${updatedPickup.user.name}, status permintaan penjemputan sampah Anda telah dikembalikan menjadi "Dalam Perjalanan". Petugas ${tpsName} masih dalam perjalanan menuju lokasi Anda.`
            notificationType = 'pickup_rollback'
          } else {
            notificationTitle = '🚛 Petugas Dalam Perjalanan'
            notificationMessage = `Hai ${updatedPickup.user.name}, petugas ${tpsName} sedang dalam perjalanan menuju lokasi Anda di ${updatedPickup.address}. Harap siapkan sampah Anda.`
            notificationType = 'pickup_on_the_way'
          }
          break
        case 'PICKED_UP':
          notificationTitle = '✓ Sampah Berhasil Dijemput'
          notificationMessage = `Selamat ${updatedPickup.user.name}, sampah Anda telah dijemput oleh ${tpsName}. Proses penimbangan dan transaksi akan segera dilakukan.`
          notificationType = 'pickup_completed'
          break
        case 'COMPLETED':
          notificationTitle = '💰 Transaksi Selesai'
          notificationMessage = `Selamat ${updatedPickup.user.name}, transaksi penjualan sampah telah selesai. Total berat: ${totalWeight || 0} kg. Pembayaran akan ditransfer ke nomor Gopay Anda.`
          notificationType = 'transaction_completed'
          break
        case 'CANCELLED':
          notificationTitle = '❌ Permintaan Dibatalkan'
          notificationMessage = `${updatedPickup.user.name}, permintaan penjemputan sampah Anda telah dibatalkan.`
          notificationType = 'pickup_cancelled'
          break
        case 'REJECTED':
          notificationTitle = '⚠️ Permintaan Ditolak'
          notificationMessage = `Maaf ${updatedPickup.user.name}, permintaan penjemputan sampah Anda ditolak oleh ${tpsName}. Silakan coba TPS lain.`
          notificationType = 'pickup_rejected'
          break
      }

      if (notificationTitle) {
        await prisma.notification.create({
          data: {
            userId: pickupRequest.userId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType
          }
        })
      }
    }

    // Parse photos and videos from JSON string to array
    const parsedUpdatedPickup = {
      ...updatedPickup,
      photos: typeof updatedPickup.photos === 'string' ? JSON.parse(updatedPickup.photos || '[]') : updatedPickup.photos,
      videos: typeof updatedPickup.videos === 'string' ? JSON.parse(updatedPickup.videos || '[]') : updatedPickup.videos
    }

    return NextResponse.json({ data: parsedUpdatedPickup })
  } catch (error) {
    console.error('Update pickup error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui data' },
      { status: 500 }
    )
  }
}

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

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Only allow deletion if status is PENDING and by the owner or admin
    if (pickupRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Hanya permintaan dengan status PENDING yang dapat dibatalkan' },
        { status: 400 }
      )
    }

    if (pickupRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.pickupRequest.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Permintaan berhasil dibatalkan' })
  } catch (error) {
    console.error('Delete pickup error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus data' },
      { status: 500 }
    )
  }
}
