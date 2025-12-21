import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    console.log('[TPS Reset] Attempting to delete all TPS locations...')

    // Get count before deletion
    const countBefore = await prisma.tPSLocation.count()

    // Delete all TPS locations
    const deleteResult = await prisma.tPSLocation.deleteMany({})

    console.log(`[TPS Reset] Successfully deleted ${deleteResult.count} TPS locations`)

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${deleteResult.count} lokasi TPS dari database`,
      deletedCount: deleteResult.count,
      data: {
        before: countBefore,
        after: 0,
        deleted: deleteResult.count
      }
    })
  } catch (error) {
    console.error('[TPS Reset] Error deleting TPS locations:', error)
    return NextResponse.json(
      { 
        error: 'Gagal menghapus semua TPS locations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
