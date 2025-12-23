import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'
import bcrypt from 'bcryptjs'


interface UserImportData {
  name: string
  email: string
  phone: string
  password: string
  role: 'USER' | 'TPS' | 'ADMIN'
  tpsName?: string
  capacity?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer()
    console.log('File received, size:', arrayBuffer.byteLength)

    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    console.log('Sheet names:', workbook.SheetNames)

    if (!worksheet) {
      return NextResponse.json({ error: 'No data in worksheet' }, { status: 400 })
    }

    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      blankrows: false
    }) as any[][]

    console.log('Raw data rows:', rawData.length)
    console.log('Headers:', rawData[0])

    if (rawData.length < 2) {
      return NextResponse.json({ error: 'File must have header and at least one data row' }, { status: 400 })
    }

    // Parse header
    const headers = rawData[0] as string[]
    const headerMap: Record<string, number> = {}

    const requiredFields = ['name', 'email', 'phone', 'password', 'role']
    const missingFields: string[] = []

    requiredFields.forEach(field => {
      const idx = headers.findIndex(h => h?.toString().toLowerCase().trim() === field.toLowerCase())
      if (idx === -1) {
        missingFields.push(field)
      } else {
        headerMap[field] = idx
      }
    })

    if (missingFields.length > 0) {
      console.error('Missing required columns:', missingFields)
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}. Available columns: ${headers.join(', ')}` },
        { status: 400 }
      )
    }

    // Parse optional TPS fields
    const optionalFields = ['tpsName', 'capacity']
    optionalFields.forEach(field => {
      const idx = headers.findIndex(h => h?.toString().toLowerCase().trim() === field.toLowerCase())
      if (idx !== -1) {
        headerMap[field] = idx
      }
    })

    console.log('Header map:', headerMap)

    // Parse data rows
    const userData: UserImportData[] = []
    const errors: Array<{ row: number, error: string }> = []

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i]

      // Skip empty rows
      if (!row || row.length === 0 || row.every(cell => !cell)) {
        continue
      }

      try {
        const rowData: UserImportData = {
          name: String(row[headerMap['name']] || '').trim(),
          email: String(row[headerMap['email']] || '').trim(),
          phone: String(row[headerMap['phone']] || '').trim(),
          password: String(row[headerMap['password']] || '').trim(),
          role: String(row[headerMap['role']] || 'USER').trim().toUpperCase() as 'USER' | 'TPS' | 'ADMIN',
        }

        // Parse optional capacity field
        if (headerMap['capacity'] !== undefined) {
          const capacityValue = row[headerMap['capacity']]
          if (capacityValue) {
            rowData.capacity = parseInt(String(capacityValue), 10)
            if (isNaN(rowData.capacity)) {
              rowData.capacity = undefined
            }
          }
        }

        console.log(`Row ${i + 1}:`, rowData)

        // Validate required fields
        if (!rowData.name || !rowData.email || !rowData.password) {
          errors.push({ row: i + 1, error: 'Missing required fields' })
          continue
        }

        // Validate email format
        if (!rowData.email.includes('@')) {
          errors.push({ row: i + 1, error: 'Invalid email format' })
          continue
        }

        // Validate role
        if (!['USER', 'TPS', 'ADMIN'].includes(rowData.role)) {
          errors.push({ row: i + 1, error: 'Invalid role. Must be USER, TPS, or ADMIN' })
          continue
        }

        // Parse TPS fields if role is TPS
        if (rowData.role === 'TPS') {
          rowData.tpsName = String(row[headerMap['tpsName']] || '').trim()

          if (!rowData.tpsName) {
            errors.push({ row: i + 1, error: 'TPS user must have tpsName (nama TPS dari database)' })
            continue
          }
        }

        userData.push(rowData)
      } catch (error) {
        errors.push({ row: i + 1, error: String(error) })
      }
    }

    if (userData.length === 0) {
      return NextResponse.json({
        error: 'No valid data to import',
        validationErrors: errors
      }, { status: 400 })
    }

    // Check for duplicate emails
    const emails = userData.map(u => u.email)
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true }
    })

    const existingEmails = new Set(existingUsers.map(u => u.email))
    const duplicateErrors = userData
      .map((u, idx) => existingEmails.has(u.email) ? idx : -1)
      .filter(idx => idx !== -1)
      .forEach(idx => {
        errors.push({ row: idx + 2, error: `Email already exists: ${userData[idx].email}` })
      })

    // Filter out duplicates
    const validUserData = userData.filter(u => !existingEmails.has(u.email))

    if (validUserData.length === 0) {
      return NextResponse.json({
        error: 'All emails already exist',
        validationErrors: errors
      }, { status: 400 })
    }

    // Create users
    const createdUsers = []
    const creationErrors = []

    for (const user of validUserData) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10)

        if (user.role === 'TPS') {
          // Find existing TPS location by name
          console.log(`[TPS Lookup] Searching for TPS: "${user.tpsName}"`)

          // Get all TPS and find by case-insensitive comparison
          const allTPS = await prisma.tPSLocation.findMany({
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
              address: true,
              phone: true,
              operatingHours: true,
              isActive: true
            }
          })

          const tpsLocation = allTPS.find(tps =>
            tps.name.toLowerCase().trim() === user.tpsName!.toLowerCase().trim()
          )

          console.log(`[TPS Lookup] Result:`, tpsLocation ? `Found ID: ${tpsLocation.id}` : 'NOT FOUND')

          if (!tpsLocation) {
            // Get available TPS for helpful error message
            const availableTPS = await prisma.tPSLocation.findMany({
              select: { name: true },
              orderBy: { name: 'asc' }
            })

            const availableNames = availableTPS.map(t => t.name).join(', ')
            creationErrors.push({
              email: user.email,
              error: `TPS dengan nama "${user.tpsName}" tidak ditemukan. Tersedia: ${availableNames || 'Tidak ada TPS di database'}`
            })
            continue
          }

          // Validate required fields from TPS location
          if (!tpsLocation.address || tpsLocation.address.trim() === '') {
            creationErrors.push({
              email: user.email,
              error: `TPS "${tpsLocation.name}" tidak memiliki alamat yang valid di database. Silakan update data TPS terlebih dahulu.`
            })
            continue
          }

          // Create user and link to existing TPS location
          const createdUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              password: hashedPassword,
              role: 'TPS',
              // Create TPS profile with data from TPS location
              tpsProfile: {
                create: {
                  tpsName: tpsLocation.name,
                  latitude: tpsLocation.latitude || 0,
                  longitude: tpsLocation.longitude || 0,
                  address: tpsLocation.address,
                  phone: user.phone || tpsLocation.phone || '',
                  operatingHours: tpsLocation.operatingHours || '06:00 - 18:00',
                  capacity: user.capacity || null,
                  isActive: tpsLocation.isActive ?? true
                }
              }
            },
            include: {
              tpsProfile: true
            }
          })

          createdUsers.push(createdUser)
        } else {
          // Create regular user or admin
          const createdUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              phone: user.phone,
              password: hashedPassword,
              role: user.role
            }
          })

          createdUsers.push(createdUser)
        }
      } catch (error) {
        console.error(`[User Creation Error] Email: ${user.email}`, error)
        const errorMsg = error instanceof Error ? error.message : String(error)
        creationErrors.push({
          email: user.email,
          error: errorMsg
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: createdUsers.length,
      total: userData.length,
      createdUsers: createdUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      })),
      validationErrors: errors,
      creationErrors: creationErrors
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Import failed'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve list of TPS names
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tpsList = await prisma.tPSLocation.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        kecamatan: true,
        address: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: tpsList
    })
  } catch (error) {
    console.error('Error fetching TPS list:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch TPS list'
    }, { status: 500 })
  }
}
