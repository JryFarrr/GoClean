import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { pickupRequestId, wasteItems } = body

    // Get pickup request
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: pickupRequestId },
      include: { wasteItems: true }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request tidak ditemukan' }, { status: 404 })
    }

    if (pickupRequest.tpsId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate total
    let totalWeight = 0
    let totalPrice = 0

    for (const item of wasteItems) {
      totalWeight += item.actualWeight || 0
      totalPrice += item.price || 0

      // Update waste item
      await prisma.wasteItem.update({
        where: { id: item.id },
        data: {
          actualWeight: item.actualWeight,
          price: item.price
        }
      })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        pickupRequestId,
        userId: pickupRequest.userId,
        totalWeight,
        totalPrice
      },
      include: {
        pickupRequest: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            wasteItems: true
          }
        }
      }
    })

    // Update pickup status
    await prisma.pickupRequest.update({
      where: { id: pickupRequestId },
      data: { status: 'COMPLETED' }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: pickupRequest.userId,
        title: 'Transaksi Selesai',
        message: `Transaksi penjualan sampah senilai Rp ${totalPrice.toLocaleString('id-ID')} telah selesai`,
        type: 'transaction_completed'
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat transaksi' },
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    if (session.user.role === 'USER') {
      where.userId = session.user.id
    } else if (session.user.role === 'TPS') {
      where.pickupRequest = {
        tpsId: session.user.id
      }
    }
    // ADMIN can see all

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          pickupRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}
