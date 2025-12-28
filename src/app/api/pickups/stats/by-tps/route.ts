import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/db'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get pickup stats by TPS
        // Count completed and picked_up transactions grouped by TPS
        const tpsStats = await executeQuery<{
            IDTps: string
            NamaTps: string
            Latitude: number
            Longitude: number
            Alamat: string
            TransactionCount: number
        }>(`
      SELECT 
        p.IDTps,
        p.NamaTps,
        p.Latitude,
        p.Longitude,
        p.Alamat,
        COUNT(t.IDTransaksi) as TransactionCount
      FROM ProfileTps p
      LEFT JOIN Transaksi t ON p.IDTps = t.IDTps 
        AND t.StatusTransaksi IN ('COMPLETED', 'PICKED_UP')
      GROUP BY p.IDTps, p.NamaTps, p.Latitude, p.Longitude, p.Alamat
      HAVING COUNT(t.IDTransaksi) > 0
      ORDER BY TransactionCount DESC
    `)

        // Get top 25% TPS
        const top25Count = Math.ceil(tpsStats.length * 0.25)
        const top25 = tpsStats.slice(0, top25Count)

        // Calculate min and max for scaling
        const transactionCounts = top25.map(t => t.TransactionCount)
        const minTransactions = Math.min(...transactionCounts, 0)
        const maxTransactions = Math.max(...transactionCounts, 0)

        // Format for frontend
        const formattedStats = top25.map(tps => ({
            tpsId: tps.IDTps,
            tpsName: tps.NamaTps,
            latitude: tps.Latitude,
            longitude: tps.Longitude,
            kecamatan: tps.Alamat, // Using address as kecamatan for now
            transactionCount: tps.TransactionCount
        }))

        return NextResponse.json({
            tpsStats: formattedStats,
            metadata: {
                totalTPS: tpsStats.length,
                top25Count,
                minTransactions,
                maxTransactions,
                isDummyData: false
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
