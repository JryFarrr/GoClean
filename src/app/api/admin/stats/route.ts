import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'JEMPUT')) {
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
      recentTransactions,
      wasteStats,
      wasteByTPS,
      pickupByKecamatan,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'TPS' } }),
      prisma.pickupRequest.count(),
      prisma.pickupRequest.count({ where: { status: 'PENDING' } }),
      prisma.pickupRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({
        _sum: { totalPrice: true, totalWeight: true },
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
      }),
      // Get waste statistics by type
      prisma.wasteItem.groupBy({
        by: ['wasteType'],
        _sum: {
          actualWeight: true
        },
        _count: true
      }),
      // Get waste statistics by TPS
      prisma.pickupRequest.findMany({
        where: {
          status: 'COMPLETED',
          tpsId: { not: null }
        },
        include: {
          tps: {
            select: {
              name: true,
              tpsProfile: {
                select: {
                  tpsName: true
                }
              }
            }
          },
          wasteItems: {
            select: {
              wasteType: true,
              actualWeight: true
            }
          },
          transaction: {
            select: {
              totalWeight: true,
              totalPrice: true
            }
          }
        }
      }),
      prisma.pickupRequest.groupBy({
        by: ['kecamatan'],
        _count: {
          kecamatan: true,
        },
        where: {
          kecamatan: {
            not: null,
          },
        },
      }),
    ])

    // Process waste by TPS
    const tpsWasteMap = new Map()
    wasteByTPS.forEach((pickup) => {
      if (pickup.tps) {
        const tpsName = pickup.tps.tpsProfile?.tpsName || pickup.tps.name
        const tpsId = pickup.tpsId!
        
        if (!tpsWasteMap.has(tpsId)) {
          tpsWasteMap.set(tpsId, {
            tpsName,
            totalWeight: 0,
            totalRevenue: 0,
            pickupCount: 0,
            wasteTypes: {}
          })
        }
        
        const tpsData = tpsWasteMap.get(tpsId)
        tpsData.pickupCount += 1
        tpsData.totalWeight += pickup.transaction?.totalWeight || 0
        tpsData.totalRevenue += pickup.transaction?.totalPrice || 0
        
        pickup.wasteItems.forEach((item) => {
          if (item.actualWeight) {
            if (!tpsData.wasteTypes[item.wasteType]) {
              tpsData.wasteTypes[item.wasteType] = 0
            }
            tpsData.wasteTypes[item.wasteType] += item.actualWeight
          }
        })
      }
    })

    const wasteByTPSArray = Array.from(tpsWasteMap.values())
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 10) // Top 10 TPS

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTPS,
        totalPickups,
        pendingPickups,
        completedPickups,
        totalTransactions: totalTransactions._count,
        totalRevenue: totalTransactions._sum.totalPrice || 0,
        totalWaste: totalTransactions._sum.totalWeight || 0
      },
      wasteStats: wasteStats.map(stat => ({
        wasteType: stat.wasteType,
        totalWeight: stat._sum.actualWeight || 0,
        count: stat._count
      })),
      wasteByTPS: wasteByTPSArray,
      recentPickups,
      recentTransactions,
      pickupByKecamatan,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
