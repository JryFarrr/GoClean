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
            address: true
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

    return NextResponse.json({ data: pickupRequest })
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

      switch (status) {
        case 'ACCEPTED':
          notificationTitle = 'Permintaan Diterima'
          notificationMessage = 'Permintaan penjemputan sampah Anda telah diterima oleh TPS'
          notificationType = 'pickup_accepted'
          break
        case 'ON_THE_WAY':
          notificationTitle = 'Penjemput Dalam Perjalanan'
          notificationMessage = 'Petugas TPS sedang dalam perjalanan ke lokasi Anda'
          notificationType = 'pickup_on_the_way'
          break
        case 'PICKED_UP':
          notificationTitle = 'Sampah Dijemput'
          notificationMessage = 'Sampah Anda telah dijemput'
          notificationType = 'pickup_completed'
          break
        case 'COMPLETED':
          notificationTitle = 'Transaksi Selesai'
          notificationMessage = 'Transaksi penjualan sampah telah selesai'
          notificationType = 'transaction_completed'
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

    return NextResponse.json(updatedPickup)
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
