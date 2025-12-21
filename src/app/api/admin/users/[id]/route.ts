import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tpsProfile: {
          include: {
            wastePrices: true
          }
        },
        pickupRequests: true,
        transactions: true,
        notifications: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prevent deleting yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      )
    }

    // Use transaction to ensure all deletions succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Delete notifications first
      await tx.notification.deleteMany({
        where: { userId: user.id }
      })

      // 2. Delete transactions (must be before pickup requests)
      await tx.transaction.deleteMany({
        where: { userId: user.id }
      })

      // 3. Delete waste items (related to pickup requests)
      const pickupIds = user.pickupRequests.map(p => p.id)
      if (pickupIds.length > 0) {
        await tx.wasteItem.deleteMany({
          where: { pickupRequestId: { in: pickupIds } }
        })
      }

      // 4. Delete pickup requests where user is the requester
      await tx.pickupRequest.deleteMany({
        where: { userId: user.id }
      })

      // 5. Update pickup requests where user is TPS (set tpsId to null)
      await tx.pickupRequest.updateMany({
        where: { tpsId: user.id },
        data: { tpsId: null }
      })

      // 6. Delete waste prices if user has TPS profile
      if (user.tpsProfile) {
        await tx.wastePrice.deleteMany({
          where: { tpsProfileId: user.tpsProfile.id }
        })
        
        // 7. Delete TPS profile
        await tx.tPSProfile.delete({
          where: { userId: user.id }
        })
      }

      // 8. Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    return NextResponse.json({ 
      message: 'User berhasil dihapus' 
    })
  } catch (error) {
    console.error('Delete user error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan saat menghapus user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params
    const body = await req.json()
    const { name, email, phone, role } = body

    // Validasi input
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email tidak boleh kosong' },
        { status: 400 }
      )
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validasi role
    const validRoles = ['USER', 'TPS', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh user lain' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        role
      }
    })

    return NextResponse.json({ 
      message: 'User berhasil diupdate',
      data: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan saat mengupdate user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
