import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const where: Record<string, unknown> = {}
    if (role) {
      where.role = role
    }

    const query: any = {
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        tpsProfile: true,
        _count: {
          select: {
            pickupRequests: true,
            transactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }

    // Only apply pagination if limit is provided
    if (limit) {
      query.skip = (page - 1) * limit
      query.take = limit
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany(query),
      prisma.user.count({ where })
    ])

    const response: any = {
      data: users
    }

    // Only include pagination if limit was provided
    if (limit) {
      response.pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { email, password, name, phone, role, tpsData } = body

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role
      }
    })

    if (role === 'TPS' && tpsData) {
      await prisma.tPSProfile.create({
        data: {
          userId: user.id,
          tpsName: tpsData.tpsName,
          latitude: tpsData.latitude,
          longitude: tpsData.longitude,
          address: tpsData.address,
          operatingHours: tpsData.operatingHours,
          capacity: tpsData.capacity
        }
      })
    }

    return NextResponse.json({ message: 'User berhasil dibuat', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
