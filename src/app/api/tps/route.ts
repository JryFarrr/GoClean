import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const onlyActive = searchParams.get('active') === 'true'

    const where: Record<string, unknown> = {
      role: 'TPS'
    }

    if (onlyActive) {
      where.tpsProfile = {
        isActive: true
      }
    }

    const tpsList = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        tpsProfile: {
          include: {
            wastePrices: true
          }
        }
      }
    })

    return NextResponse.json(tpsList)
  } catch (error) {
    console.error('Get TPS list error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data TPS' },
      { status: 500 }
    )
  }
}
