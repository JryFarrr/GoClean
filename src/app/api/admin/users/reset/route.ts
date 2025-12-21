import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resetType } = await request.json()

    if (!resetType || !['USER', 'TPS', 'ADMIN', 'ALL'].includes(resetType)) {
      return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 })
    }

    // PROTEKSI: Prevent admin from deleting their own account when resetting ALL or ADMIN
    // Akun admin yang sedang login TIDAK AKAN TERHAPUS
    const currentAdminEmail = session.user.email

    console.log(`[RESET] Admin ${currentAdminEmail} is performing ${resetType} reset`)

    let deletedCount = 0

    if (resetType === 'ALL') {
      // Delete all users EXCEPT the current admin who is performing the reset
      const result = await prisma.user.deleteMany({
        where: {
          email: {
            not: currentAdminEmail // PROTEKSI: Admin yang login tidak akan terhapus
          }
        }
      })
      deletedCount = result.count
      console.log(`[RESET] Deleted ${deletedCount} users, protected: ${currentAdminEmail}`)
    } else if (resetType === 'ADMIN') {
      // Delete all admins EXCEPT the current admin who is performing the reset
      const result = await prisma.user.deleteMany({
        where: {
          role: 'ADMIN',
          email: {
            not: currentAdminEmail // PROTEKSI: Admin yang login tidak akan terhapus
          }
        }
      })
      deletedCount = result.count
      console.log(`[RESET] Deleted ${deletedCount} admin accounts, protected: ${currentAdminEmail}`)
    } else {
      // Delete all users with specific role (USER or TPS)
      // No protection needed here as we're not deleting ADMINs
      const result = await prisma.user.deleteMany({
        where: {
          role: resetType
        }
      })
      deletedCount = result.count
      console.log(`[RESET] Deleted ${deletedCount} ${resetType} accounts`)
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      resetType,
      message: `Successfully deleted ${deletedCount} ${resetType === 'ALL' ? 'users' : resetType + ' accounts'}`
    })

  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to reset accounts'
    }, { status: 500 })
  }
}
