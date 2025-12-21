import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

// Kode admin untuk keamanan
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'GOCLEAN2025'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, phone, adminCode } = body

    // Validate required fields
    if (!email || !password || !name || !adminCode) {
      return NextResponse.json(
        { error: 'Email, password, nama, dan kode admin harus diisi' },
        { status: 400 }
      )
    }

    // Verify admin code
    if (adminCode !== ADMIN_SECRET_CODE) {
      return NextResponse.json(
        { error: 'Kode admin tidak valid. Hubungi super admin untuk mendapatkan kode yang benar.' },
        { status: 403 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Akun admin berhasil dibuat', 
        user: admin 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat akun admin' },
      { status: 500 }
    )
  }
}
