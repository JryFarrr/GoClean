import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const address = formData.get('address') as string
    const description = formData.get('description') as string
    const wasteItems = JSON.parse(formData.get('wasteItems') as string)
    const scheduledAt = formData.get('scheduledAt') as string
    const tpsId = formData.get('tpsId') as string | null
    
    // Handle file uploads
    const photos: string[] = []
    const videos: string[] = []
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // Process uploaded files
    const files = formData.getAll('files') as File[]
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uniqueName = `${Date.now()}-${file.name}`
      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)
      
      const fileUrl = `/uploads/${uniqueName}`
      
      if (file.type.startsWith('image/')) {
        photos.push(fileUrl)
      } else if (file.type.startsWith('video/')) {
        videos.push(fileUrl)
      }
    }

    // Create pickup request
    const pickupRequest = await prisma.pickupRequest.create({
      data: {
        userId: session.user.id,
        tpsId: tpsId || null,
        latitude,
        longitude,
        address,
        description,
        photos: JSON.stringify(photos),
        videos: JSON.stringify(videos),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: tpsId ? 'PENDING' : 'PENDING', // Will be updated when TPS accepts
        wasteItems: {
          create: wasteItems.map((item: { wasteType: string; estimatedWeight: number }) => ({
            wasteType: item.wasteType,
            estimatedWeight: item.estimatedWeight
          }))
        }
      },
      include: {
        wasteItems: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        tps: {
          select: {
            id: true,
            name: true,
            tpsProfile: true
          }
        }
      }
    })

    // Create notification for selected TPS
    if (tpsId) {
      await prisma.notification.create({
        data: {
          userId: tpsId,
          title: 'Permintaan Penjemputan Baru',
          message: `Ada permintaan penjemputan sampah baru dari ${session.user.name || 'User'} di ${address}`,
          type: 'pickup_request'
        }
      })
    }

    return NextResponse.json(pickupRequest, { status: 201 })
  } catch (error) {
    console.error('Pickup request error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat permintaan penjemputan' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    // Filter based on user role
    if (session.user.role === 'USER') {
      where.userId = session.user.id
    } else if (session.user.role === 'TPS') {
      // TPS can see pending requests and their accepted ones
      where.OR = [
        { status: 'PENDING' },
        { tpsId: session.user.id }
      ]
    }
    // ADMIN can see all

    if (status) {
      where.status = status
    }

    const [pickupRequests, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          tps: {
            select: {
              id: true,
              name: true,
              tpsProfile: true
            }
          },
          wasteItems: true,
          transaction: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.pickupRequest.count({ where })
    ])

    // Parse photos and videos from JSON string to array
    const parsedPickupRequests = pickupRequests.map(pickup => ({
      ...pickup,
      photos: typeof pickup.photos === 'string' ? JSON.parse(pickup.photos || '[]') : pickup.photos,
      videos: typeof pickup.videos === 'string' ? JSON.parse(pickup.videos || '[]') : pickup.videos
    }))

    return NextResponse.json({
      data: parsedPickupRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get pickup requests error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    )
  }
}
