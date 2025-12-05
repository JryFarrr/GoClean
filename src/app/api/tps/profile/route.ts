import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Get TPS profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await prisma.tPSProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        wastePrices: true
      }
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Error fetching TPS profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update TPS profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'TPS') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { tpsName, address, latitude, longitude, phone, operatingHours } = body

    if (!tpsName || !address) {
      return NextResponse.json(
        { error: 'TPS name and address are required' },
        { status: 400 }
      )
    }

    // Upsert profile
    const profile = await prisma.tPSProfile.upsert({
      where: { userId: session.user.id },
      update: {
        tpsName,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        operatingHours
      },
      create: {
        userId: session.user.id,
        tpsName,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        operatingHours
      }
    })

    // Also update user phone if provided
    if (phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone }
      })
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      data: profile
    })
  } catch (error) {
    console.error('Error updating TPS profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
