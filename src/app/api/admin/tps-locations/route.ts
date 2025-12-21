import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Fetch all TPS locations with pagination support
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.tPSLocation.count()
    
    const tpsLocations = await prisma.tPSLocation.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      data: tpsLocations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Get TPS locations error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data lokasi TPS' },
      { status: 500 }
    )
  }
}

// POST - Create new TPS location (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, kecamatan, address, latitude, longitude, operatingHours, phone } = body

    console.log('Received TPS location data:', { name, kecamatan, address, latitude, longitude, operatingHours, phone })

    // Validation
    if (!name || !kecamatan || !address || latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return NextResponse.json(
        { error: 'Nama, kecamatan, alamat, latitude, dan longitude wajib diisi' },
        { status: 400 }
      )
    }

    // Ensure latitude and longitude are numbers
    const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude)
    const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Latitude dan longitude harus berupa angka yang valid' },
        { status: 400 }
      )
    }

    // Create TPS location
    const newLocation = await prisma.tPSLocation.create({
      data: {
        name,
        kecamatan,
        address,
        latitude: lat,
        longitude: lng,
        operatingHours: operatingHours || '06:00 - 18:00',
        phone: phone || null
      }
    })

    return NextResponse.json({
      message: 'Lokasi TPS berhasil ditambahkan',
      data: newLocation
    })
  } catch (error: any) {
    console.error('Create TPS location error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Gagal menambahkan lokasi TPS', 
        details: error.message || 'Unknown error',
        code: error.code 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete TPS location by ID (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID TPS location harus disediakan' },
        { status: 400 }
      )
    }

    // Check if TPS location exists
    const existingLocation = await prisma.tPSLocation.findUnique({
      where: { id }
    })

    if (!existingLocation) {
      return NextResponse.json(
        { error: 'Lokasi TPS tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete TPS location
    await prisma.tPSLocation.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Lokasi TPS berhasil dihapus',
      data: existingLocation
    })
  } catch (error: any) {
    console.error('Delete TPS location error:', error)
    
    return NextResponse.json(
      { 
        error: 'Gagal menghapus lokasi TPS', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
