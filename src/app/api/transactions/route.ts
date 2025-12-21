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
    const { pickupRequestId, wasteItems, totalWeight, totalPrice } = body

    // Get pickup request
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: pickupRequestId },
      include: { 
        wasteItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request tidak ditemukan' }, { status: 404 })
    }

    if (pickupRequest.tpsId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update waste items with actual weights
    for (const item of wasteItems) {
      await prisma.wasteItem.update({
        where: { id: item.id },
        data: {
          actualWeight: item.actualWeight,
          price: item.price
        }
      })
    }

    // Create transaction with PENDING_PAYMENT status
    const transaction = await prisma.transaction.create({
      data: {
        pickupRequestId,
        userId: pickupRequest.userId,
        totalWeight,
        totalPrice,
        isPaid: false
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

    // Create notification untuk user untuk menunggu pembayaran dari TPS
    await prisma.notification.create({
      data: {
        userId: pickupRequest.userId,
        title: '💰 Transaksi Berhasil Dibuat',
        message: `Selamat ${pickupRequest.user.name}, transaksi penjualan sampah Anda telah dibuat dengan total Rp ${totalPrice.toLocaleString('id-ID')} (${totalWeight} kg). TPS akan segera melakukan transfer ke nomor Gopay Anda. Silakan cek mutasi rekening dan konfirmasi pembayaran setelah diterima.`,
        type: 'transaction_created'
      }
    })

    return NextResponse.json({
      message: 'Transaksi berhasil dibuat',
      data: transaction
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat transaksi' },
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { transactionId, isPaid } = body

    console.log('PATCH request received:', { transactionId, isPaid, userId: session.user.id })

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        pickupRequest: true,
        user: true
      }
    })

    console.log('Transaction found:', transaction ? 'Yes' : 'No')

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 })
    }

    console.log('Transaction userId:', transaction.userId, 'Session userId:', session.user.id)

    // Only user can confirm payment received
    if (transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - Bukan pemilik transaksi' }, { status: 403 })
    }

    console.log('Starting transaction update...')

    // Update transaction to paid AND pickup status to COMPLETED
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        isPaid: true,
        paidAt: new Date()
      },
      include: {
        pickupRequest: {
          include: {
            user: true,
            wasteItems: true
          }
        }
      }
    })

    console.log('Transaction updated successfully')

    // Update pickup status to COMPLETED
    await prisma.pickupRequest.update({
      where: { id: transaction.pickupRequestId },
      data: { status: 'COMPLETED' }
    })

    console.log('Pickup request updated to COMPLETED')

    // Create notification for TPS
    if (transaction.pickupRequest.tpsId) {
      await prisma.notification.create({
        data: {
          userId: transaction.pickupRequest.tpsId,
          title: '✅ Pembayaran Dikonfirmasi',
          message: `${transaction.user.name} telah mengonfirmasi penerimaan pembayaran sebesar Rp ${transaction.totalPrice.toLocaleString('id-ID')}. Transaksi telah selesai dengan sukses.`,
          type: 'payment_confirmed'
        }
      })
      console.log('Notification created for TPS')
    }

    // Create notification for user confirming successful transaction completion
    await prisma.notification.create({
      data: {
        userId: transaction.userId,
        title: '✅ Transaksi Selesai',
        message: `Selamat ${transaction.user.name}, pembayaran sebesar Rp ${transaction.totalPrice.toLocaleString('id-ID')} telah dikonfirmasi. Terima kasih telah menggunakan layanan GoClean!`,
        type: 'transaction_completed'
      }
    })

    return NextResponse.json({
      message: 'Pembayaran berhasil dikonfirmasi',
      data: updatedTransaction
    })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate transaksi: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
