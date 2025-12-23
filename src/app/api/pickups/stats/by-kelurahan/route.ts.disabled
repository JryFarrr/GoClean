import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Aggregate TPS count per kelurahan
        const tpsStats = await prisma.tPSLocation.groupBy({
            by: ['kelurahan'],
            _count: {
                kelurahan: true
            },
            where: {
                kelurahan: {
                    not: null
                }
            }
        });

        // If no data, generate dummy data for testing
        if (tpsStats.length === 0) {
            console.log('⚠️ No TPS data found. Generating DUMMY data for kelurahan visualization...');

            // List of some kelurahan in Surabaya (from GeoJSON)
            const surabayaKelurahan = [
                'Siwalankerto', 'Balongsari', 'Wonorejo', 'Kedung Baruk',
                'Semolowaru', 'Ngagel', 'Baratajaya', 'Embong Kaliasin',
                'Genteng', 'Peneleh', 'Kapasari', 'Tegalsari',
                'Keputran', 'Sawahan', 'Banyu Urip', 'Putat Jaya',
                'Pakis', 'Pradahkalikendal', 'Manyar Sabrangan', 'Mulyorejo'
            ];

            const dummyStats = surabayaKelurahan.map((kelurahan) => {
                // Varied distribution for realistic visualization
                const rand = Math.random();
                let count;
                if (rand < 0.2) {
                    count = Math.floor(Math.random() * 3); // 0-2 (low)
                } else if (rand < 0.6) {
                    count = Math.floor(Math.random() * 8) + 3; // 3-10 (medium)
                } else {
                    count = Math.floor(Math.random() * 15) + 11; // 11-25 (high)
                }

                return {
                    kelurahan,
                    _count: { kelurahan: count }
                };
            });

            const tpsByKelurahan = dummyStats.reduce((acc: Record<string, number>, item) => {
                acc[item.kelurahan] = item._count.kelurahan;
                return acc;
            }, {});

            return NextResponse.json({
                tpsByKelurahan,
                source: 'dummy',
                message: 'Using dummy data for development'
            });
        }

        // Convert to simple object format
        const tpsByKelurahan = tpsStats.reduce((acc: Record<string, number>, item) => {
            if (item.kelurahan) {
                acc[item.kelurahan] = item._count.kelurahan;
            }
            return acc;
        }, {});

        return NextResponse.json({
            tpsByKelurahan,
            source: 'database'
        });

    } catch (error) {
        console.error('Error fetching kelurahan stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch kelurahan statistics' },
            { status: 500 }
        );
    }
}
