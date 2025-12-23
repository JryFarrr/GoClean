import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Settings API - Session:', session)
    console.log('Settings API - User:', session?.user)
    console.log('Settings API - Role:', session?.user?.role)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('Settings API - Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.setting.findMany({
      orderBy: { category: 'asc' }
    })

    // Group by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, typeof settings>)

    return NextResponse.json(groupedSettings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil pengaturan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description, category } = body

    if (!key || !category) {
      return NextResponse.json(
        { error: 'Key dan category diperlukan' },
        { status: 400 }
      )
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: {
        value: value || '',
        description,
        category,
        updatedAt: new Date()
      },
      create: {
        key,
        value: value || '',
        description,
        category
      }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menyimpan pengaturan' },
      { status: 500 }
    )
  }
}