import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
        wasteItems: true
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

/**
 * PATCH /api/pickups/[id]
 * Update status pickup request (simplified: PENDING -> COMPLETED)
 * 
 * Body parameters:
 * - status: 'PENDING' | 'COMPLETED'
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
      // Simplified status: only PENDING and COMPLETED
      if (status !== 'PENDING' && status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Status hanya bisa PENDING atau COMPLETED' },
          { status: 400 }
        )
      }

      updateData.status = status

      // If TPS completes the pickup
      if (status === 'COMPLETED' && session.user.role === 'TPS') {
        updateData.tpsId = session.user.id
        updateData.completedAt = new Date()
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

    // Update waste items if provided (for TPS to input actual weight and price)
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

    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }

    // Only allow deletion if status is PENDING and by the owner
    if (pickupRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Hanya permintaan dengan status PENDING yang dapat dibatalkan' },
        { status: 400 }
      )
    }

    if (pickupRequest.userId !== session.user.id) {
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
