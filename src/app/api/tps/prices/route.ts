import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get prices for a TPS
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tpsId = searchParams.get('tpsId')

    // If TPS user, get their own prices
    if (session.user.role === 'TPS') {
      const tpsProfile = await prisma.tPSProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!tpsProfile) {
        return NextResponse.json({ data: [] })
      }

      const prices = await prisma.wastePrice.findMany({
        where: { tpsProfileId: tpsProfile.id },
        orderBy: { wasteType: 'asc' }
      })

      return NextResponse.json({ data: prices })
    }

    // If specific TPS requested
    if (tpsId) {
      const prices = await prisma.wastePrice.findMany({
        where: { 
          tpsProfile: { userId: tpsId }
        },
        orderBy: { wasteType: 'asc' }
      })

      return NextResponse.json({ data: prices })
    }

    // Otherwise return all prices grouped by TPS
    const prices = await prisma.wastePrice.findMany({
      include: {
        tpsProfile: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { wasteType: 'asc' }
    })

    return NextResponse.json({ data: prices })
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update prices
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { prices } = body

    if (!prices || !Array.isArray(prices)) {
      return NextResponse.json(
        { error: 'Invalid prices data' },
        { status: 400 }
      )
    }

    // Get or create TPS profile
    let tpsProfile = await prisma.tPSProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!tpsProfile) {
      tpsProfile = await prisma.tPSProfile.create({
        data: {
          userId: session.user.id,
          tpsName: session.user.name || 'TPS',
          address: ''
        }
      })
    }

    // Upsert each price
    const upsertedPrices = await Promise.all(
      prices.map(async (price: { wasteType: string; pricePerKg: number; description?: string }) => {
        return prisma.wastePrice.upsert({
          where: {
            tpsProfileId_wasteType: {
              tpsProfileId: tpsProfile!.id,
              wasteType: price.wasteType
            }
          },
          update: {
            pricePerKg: price.pricePerKg,
            description: price.description
          },
          create: {
            tpsProfileId: tpsProfile!.id,
            wasteType: price.wasteType,
            pricePerKg: price.pricePerKg,
            description: price.description
          }
        })
      })
    )

    return NextResponse.json({ 
      message: 'Prices updated successfully',
      data: upsertedPrices
    })
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
