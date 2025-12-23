import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get transaction count per TPS Location
        // Count only COMPLETED or PICKED_UP pickups that have a tpsId
        const pickupStats = await prisma.pickupRequest.groupBy({
            by: ['tpsId'],
            where: {
                tpsId: {
                    not: null
                },
                status: {
                    in: ['COMPLETED', 'PICKED_UP']
                }
            },
            _count: {
                id: true
            }
        })

        // Get all active TPS locations
        const allTpsLocations = await prisma.tPSLocation.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                kecamatan: true
            }
        })

        if (allTpsLocations.length === 0) {
            return NextResponse.json({
                tpsStats: [],
                metadata: {
                    totalTPS: 0,
                    top25Count: 0,
                    minTransactions: 0,
                    maxTransactions: 0,
                    isDummyData: false
                }
            })
        }

        let tpsStatsWithLocation: any[] = []

        // If no real transaction data, generate DUMMY data for development/testing
        if (pickupStats.length === 0) {
            console.log('⚠️ No transaction data found. Generating DUMMY data for polygon visualization...')

            // Generate varied dummy transaction counts
            tpsStatsWithLocation = allTpsLocations.map((tps, index) => {
                let transactionCount = 0

                // Create varied distribution for realistic visualization
                const mod = index % 7
                if (mod === 0) {
                    transactionCount = 0 // Some with zero
                } else if (mod === 1) {
                    transactionCount = Math.floor(Math.random() * 15) + 1 // Low: 1-15
                } else if (mod === 2) {
                    transactionCount = Math.floor(Math.random() * 30) + 15 // Low-Medium: 15-45
                } else if (mod === 3) {
                    transactionCount = Math.floor(Math.random() * 40) + 30 // Medium: 30-70
                } else if (mod === 4) {
                    transactionCount = Math.floor(Math.random() * 50) + 50 // Medium-High: 50-100
                } else if (mod === 5) {
                    transactionCount = Math.floor(Math.random() * 70) + 80 // High: 80-150
                } else {
                    transactionCount = Math.floor(Math.random() * 100) + 100 // Very High: 100-200
                }

                return {
                    tpsId: tps.id,
                    tpsName: tps.name,
                    latitude: tps.latitude,
                    longitude: tps.longitude,
                    kecamatan: tps.kecamatan,
                    transactionCount
                }
            }).filter(t => t.transactionCount > 0) // Remove zeros
                .sort((a, b) => b.transactionCount - a.transactionCount) // Sort by transaction count desc

            console.log(`✅ Generated ${tpsStatsWithLocation.length} TPS with dummy transaction data`)

        } else {
            // Use REAL transaction data
            console.log(`✅ Using REAL transaction data from ${pickupStats.length} TPS`)

            const tpsIds = pickupStats.map(stat => stat.tpsId).filter(id => id !== null) as string[]

            const tpsLocations = await prisma.tPSLocation.findMany({
                where: {
                    id: {
                        in: tpsIds
                    },
                    isActive: true
                },
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    kecamatan: true
                }
            })

            // Combine stats with TPS location data
            tpsStatsWithLocation = pickupStats
                .map(stat => {
                    const tps = tpsLocations.find(t => t.id === stat.tpsId)
                    if (!tps) return null

                    return {
                        tpsId: stat.tpsId!,
                        tpsName: tps.name,
                        latitude: tps.latitude,
                        longitude: tps.longitude,
                        kecamatan: tps.kecamatan,
                        transactionCount: stat._count.id
                    }
                })
                .filter(item => item !== null)
                .sort((a, b) => (b?.transactionCount || 0) - (a?.transactionCount || 0)) // Sort by transaction count desc
        }

        if (tpsStatsWithLocation.length === 0) {
            return NextResponse.json({
                tpsStats: [],
                metadata: {
                    totalTPS: 0,
                    top25Count: 0,
                    minTransactions: 0,
                    maxTransactions: 0,
                    isDummyData: pickupStats.length === 0
                }
            })
        }

        // Calculate top 25% threshold
        const top25PercentCount = Math.ceil(tpsStatsWithLocation.length * 0.25)
        const top25Percent = tpsStatsWithLocation.slice(0, top25PercentCount)

        // Calculate min and max for scaling
        const transactionCounts = top25Percent.map(t => t?.transactionCount || 0)
        const minTransactions = Math.min(...transactionCounts)
        const maxTransactions = Math.max(...transactionCounts)

        console.log(`📊 Returning top ${top25PercentCount} TPS (${Math.round(top25PercentCount / tpsStatsWithLocation.length * 100)}%) with transactions: ${minTransactions}-${maxTransactions}`)

        return NextResponse.json({
            tpsStats: top25Percent,
            metadata: {
                totalTPS: tpsStatsWithLocation.length,
                top25Count: top25PercentCount,
                minTransactions,
                maxTransactions,
                isDummyData: pickupStats.length === 0 // Flag to indicate if using dummy data
            }
        })
    } catch (error) {
        console.error('TPS stats error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengambil statistik TPS' },
            { status: 500 }
        )
    }
}
