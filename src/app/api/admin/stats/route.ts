import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get statistics
    const [
      totalUsers,
      totalTPS,
      totalPickups,
      pendingPickups,
      completedPickups,
      totalTransactions,
      recentPickups,
      recentTransactions
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'TPS' } }),
      prisma.pickupRequest.count(),
      prisma.pickupRequest.count({ where: { status: 'PENDING' } }),
      prisma.pickupRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({
        _sum: { totalPrice: true },
        _count: true
      }),
      prisma.pickupRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          tps: { select: { name: true } }
        }
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          pickupRequest: {
            include: {
              tps: { select: { name: true } }
            }
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTPS,
        totalPickups,
        pendingPickups,
        completedPickups,
        totalTransactions: totalTransactions._count,
        totalRevenue: totalTransactions._sum.totalPrice || 0
      },
      recentPickups,
      recentTransactions
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
