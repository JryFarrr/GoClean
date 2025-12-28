import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { executeQuery } from '@/lib/db'

// Surabaya kecamatan list
const SURABAYA_KECAMATAN = [
    'Asemrowo', 'Benowo', 'Bubutan', 'Bulak', 'Dukuh Pakis',
    'Gayungan', 'Genteng', 'Gubeng', 'Gunung Anyar', 'Jambangan',
    'Karang Pilang', 'Kenjeran', 'Krembangan', 'Lakarsantri', 'Mulyorejo',
    'Pabean Cantian', 'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan',
    'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal', 'Tambaksari',
    'Tandes', 'Tegalsari', 'Tenggilis Mejoyo', 'Wiyung', 'Wonocolo', 'Wonokromo'
]

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get pickup stats by kecamatan using TPS location address
        // Extract kecamatan from TPS address (more accurate than user's pickup address)
        const pickupStats = await executeQuery<{
            Kecamatan: string
            PickupCount: number
        }>(`
            SELECT 
                CASE 
                    WHEN p.Alamat LIKE '%Sukolilo%' THEN 'Sukolilo'
                    WHEN p.Alamat LIKE '%Gubeng%' THEN 'Gubeng'
                    WHEN p.Alamat LIKE '%Mulyorejo%' THEN 'Mulyorejo'
                    WHEN p.Alamat LIKE '%Rungkut%' THEN 'Rungkut'
                    WHEN p.Alamat LIKE '%Wonokromo%' THEN 'Wonokromo'
                    WHEN p.Alamat LIKE '%Tegalsari%' THEN 'Tegalsari'
                    WHEN p.Alamat LIKE '%Genteng%' THEN 'Genteng'
                    WHEN p.Alamat LIKE '%Sawahan%' THEN 'Sawahan'
                    WHEN p.Alamat LIKE '%Bubutan%' THEN 'Bubutan'
                    WHEN p.Alamat LIKE '%Simokerto%' THEN 'Simokerto'
                    WHEN p.Alamat LIKE '%Pabean Cantian%' THEN 'Pabean Cantian'
                    WHEN p.Alamat LIKE '%Semampir%' THEN 'Semampir'
                    WHEN p.Alamat LIKE '%Krembangan%' THEN 'Krembangan'
                    WHEN p.Alamat LIKE '%Kenjeran%' THEN 'Kenjeran'
                    WHEN p.Alamat LIKE '%Bulak%' THEN 'Bulak'
                    WHEN p.Alamat LIKE '%Tambaksari%' THEN 'Tambaksari'
                    WHEN p.Alamat LIKE '%Gunung Anyar%' THEN 'Gunung Anyar'
                    WHEN p.Alamat LIKE '%Tenggilis Mejoyo%' THEN 'Tenggilis Mejoyo'
                    WHEN p.Alamat LIKE '%Wiyung%' THEN 'Wiyung'
                    WHEN p.Alamat LIKE '%Jambangan%' THEN 'Jambangan'
                    WHEN p.Alamat LIKE '%Gayungan%' THEN 'Gayungan'
                    WHEN p.Alamat LIKE '%Wonocolo%' THEN 'Wonocolo'
                    WHEN p.Alamat LIKE '%Karang Pilang%' THEN 'Karang Pilang'
                    WHEN p.Alamat LIKE '%Sukomanunggal%' THEN 'Sukomanunggal'
                    WHEN p.Alamat LIKE '%Tandes%' THEN 'Tandes'
                    WHEN p.Alamat LIKE '%Asemrowo%' THEN 'Asemrowo'
                    WHEN p.Alamat LIKE '%Lakarsantri%' THEN 'Lakarsantri'
                    WHEN p.Alamat LIKE '%Benowo%' THEN 'Benowo'
                    WHEN p.Alamat LIKE '%Pakal%' THEN 'Pakal'
                    WHEN p.Alamat LIKE '%Sambikerep%' THEN 'Sambikerep'
                    WHEN p.Alamat LIKE '%Dukuh Pakis%' THEN 'Dukuh Pakis'
                    ELSE 'Unknown'
                END as Kecamatan,
                COUNT(t.IDTransaksi) as PickupCount
            FROM ProfileTps p
            INNER JOIN Transaksi t ON p.IDTps = t.IDTps
            WHERE t.StatusTransaksi IN ('COMPLETED', 'PICKED_UP')
            GROUP BY 
                CASE 
                    WHEN p.Alamat LIKE '%Sukolilo%' THEN 'Sukolilo'
                    WHEN p.Alamat LIKE '%Gubeng%' THEN 'Gubeng'
                    WHEN p.Alamat LIKE '%Mulyorejo%' THEN 'Mulyorejo'
                    WHEN p.Alamat LIKE '%Rungkut%' THEN 'Rungkut'
                    WHEN p.Alamat LIKE '%Wonokromo%' THEN 'Wonokromo'
                    WHEN p.Alamat LIKE '%Tegalsari%' THEN 'Tegalsari'
                    WHEN p.Alamat LIKE '%Genteng%' THEN 'Genteng'
                    WHEN p.Alamat LIKE '%Sawahan%' THEN 'Sawahan'
                    WHEN p.Alamat LIKE '%Bubutan%' THEN 'Bubutan'
                    WHEN p.Alamat LIKE '%Simokerto%' THEN 'Simokerto'
                    WHEN p.Alamat LIKE '%Pabean Cantian%' THEN 'Pabean Cantian'
                    WHEN p.Alamat LIKE '%Semampir%' THEN 'Semampir'
                    WHEN p.Alamat LIKE '%Krembangan%' THEN 'Krembangan'
                    WHEN p.Alamat LIKE '%Kenjeran%' THEN 'Kenjeran'
                    WHEN p.Alamat LIKE '%Bulak%' THEN 'Bulak'
                    WHEN p.Alamat LIKE '%Tambaksari%' THEN 'Tambaksari'
                    WHEN p.Alamat LIKE '%Gunung Anyar%' THEN 'Gunung Anyar'
                    WHEN p.Alamat LIKE '%Tenggilis Mejoyo%' THEN 'Tenggilis Mejoyo'
                    WHEN p.Alamat LIKE '%Wiyung%' THEN 'Wiyung'
                    WHEN p.Alamat LIKE '%Jambangan%' THEN 'Jambangan'
                    WHEN p.Alamat LIKE '%Gayungan%' THEN 'Gayungan'
                    WHEN p.Alamat LIKE '%Wonocolo%' THEN 'Wonocolo'
                    WHEN p.Alamat LIKE '%Karang Pilang%' THEN 'Karang Pilang'
                    WHEN p.Alamat LIKE '%Sukomanunggal%' THEN 'Sukomanunggal'
                    WHEN p.Alamat LIKE '%Tandes%' THEN 'Tandes'
                    WHEN p.Alamat LIKE '%Asemrowo%' THEN 'Asemrowo'
                    WHEN p.Alamat LIKE '%Lakarsantri%' THEN 'Lakarsantri'
                    WHEN p.Alamat LIKE '%Benowo%' THEN 'Benowo'
                    WHEN p.Alamat LIKE '%Pakal%' THEN 'Pakal'
                    WHEN p.Alamat LIKE '%Sambikerep%' THEN 'Sambikerep'
                    WHEN p.Alamat LIKE '%Dukuh Pakis%' THEN 'Dukuh Pakis'
                    ELSE 'Unknown'
                END
            HAVING COUNT(t.IDTransaksi) > 0 AND 
                   CASE 
                       WHEN p.Alamat LIKE '%Sukolilo%' THEN 'Sukolilo'
                       WHEN p.Alamat LIKE '%Gubeng%' THEN 'Gubeng'
                       WHEN p.Alamat LIKE '%Mulyorejo%' THEN 'Mulyorejo'
                       WHEN p.Alamat LIKE '%Rungkut%' THEN 'Rungkut'
                       WHEN p.Alamat LIKE '%Wonokromo%' THEN 'Wonokromo'
                       WHEN p.Alamat LIKE '%Tegalsari%' THEN 'Tegalsari'
                       WHEN p.Alamat LIKE '%Genteng%' THEN 'Genteng'
                       WHEN p.Alamat LIKE '%Sawahan%' THEN 'Sawahan'
                       WHEN p.Alamat LIKE '%Bubutan%' THEN 'Bubutan'
                       WHEN p.Alamat LIKE '%Simokerto%' THEN 'Simokerto'
                       WHEN p.Alamat LIKE '%Pabean Cantian%' THEN 'Pabean Cantian'
                       WHEN p.Alamat LIKE '%Semampir%' THEN 'Semampir'
                       WHEN p.Alamat LIKE '%Krembangan%' THEN 'Krembangan'
                       WHEN p.Alamat LIKE '%Kenjeran%' THEN 'Kenjeran'
                       WHEN p.Alamat LIKE '%Bulak%' THEN 'Bulak'
                       WHEN p.Alamat LIKE '%Tambaksari%' THEN 'Tambaksari'
                       WHEN p.Alamat LIKE '%Gunung Anyar%' THEN 'Gunung Anyar'
                       WHEN p.Alamat LIKE '%Tenggilis Mejoyo%' THEN 'Tenggilis Mejoyo'
                       WHEN p.Alamat LIKE '%Wiyung%' THEN 'Wiyung'
                       WHEN p.Alamat LIKE '%Jambangan%' THEN 'Jambangan'
                       WHEN p.Alamat LIKE '%Gayungan%' THEN 'Gayungan'
                       WHEN p.Alamat LIKE '%Wonocolo%' THEN 'Wonocolo'
                       WHEN p.Alamat LIKE '%Karang Pilang%' THEN 'Karang Pilang'
                       WHEN p.Alamat LIKE '%Sukomanunggal%' THEN 'Sukomanunggal'
                       WHEN p.Alamat LIKE '%Tandes%' THEN 'Tandes'
                       WHEN p.Alamat LIKE '%Asemrowo%' THEN 'Asemrowo'
                       WHEN p.Alamat LIKE '%Lakarsantri%' THEN 'Lakarsantri'
                       WHEN p.Alamat LIKE '%Benowo%' THEN 'Benowo'
                       WHEN p.Alamat LIKE '%Pakal%' THEN 'Pakal'
                       WHEN p.Alamat LIKE '%Sambikerep%' THEN 'Sambikerep'
                       WHEN p.Alamat LIKE '%Dukuh Pakis%' THEN 'Dukuh Pakis'
                       ELSE 'Unknown'
                   END != 'Unknown'
            ORDER BY PickupCount DESC
        `)

        console.log('📊 Pickup stats by kecamatan (from TPS data):', pickupStats)

        // Format for frontend
        const formattedResult = pickupStats.map(stat => ({
            kecamatan: stat.Kecamatan,
            _count: {
                kecamatan: stat.PickupCount
            }
        }))

        console.log(`📊 Generated choropleth data for ${formattedResult.length} kecamatan from real transaction data`)

        return NextResponse.json({
            pickupByKecamatan: formattedResult
        })
    } catch (error) {
        console.error('Pickup stats by kecamatan error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengambil statistik.' },
            { status: 500 }
        )
    }
}
