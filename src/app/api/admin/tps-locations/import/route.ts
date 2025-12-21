import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      )
    }

    // Check file extension
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'File harus berformat Excel (.xlsx atau .xls)' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet) as any[]

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'File Excel kosong' },
        { status: 400 }
      )
    }

    const results = {
      success: [] as string[],
      errors: [] as string[],
      total: data.length
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNumber = i + 2 // Excel row (header is row 1)

      try {
        // Validate required fields
        if (!row['Nama TPS'] || !row['Kecamatan'] || !row['Alamat'] || !row['Latitude'] || !row['Longitude']) {
          results.errors.push(`Baris ${rowNumber}: Data tidak lengkap`)
          continue
        }

        // Validate latitude/longitude
        const latitude = parseFloat(row['Latitude'])
        const longitude = parseFloat(row['Longitude'])

        if (isNaN(latitude) || isNaN(longitude)) {
          results.errors.push(`Baris ${rowNumber}: Latitude/Longitude harus berupa angka`)
          continue
        }

        // Validate latitude range (-90 to 90)
        if (latitude < -90 || latitude > 90) {
          results.errors.push(`Baris ${rowNumber}: Latitude harus antara -90 dan 90`)
          continue
        }

        // Validate longitude range (-180 to 180)
        if (longitude < -180 || longitude > 180) {
          results.errors.push(`Baris ${rowNumber}: Longitude harus antara -180 dan 180`)
          continue
        }

        // Check if TPS already exists
        const existingTPS = await prisma.tPSLocation.findFirst({
          where: {
            name: row['Nama TPS'].toString().trim(),
            kecamatan: row['Kecamatan'].toString().trim()
          }
        })

        if (existingTPS) {
          results.errors.push(`Baris ${rowNumber}: TPS "${row['Nama TPS']}" di kecamatan "${row['Kecamatan']}" sudah ada`)
          continue
        }

        // Create TPS Location
        await prisma.tPSLocation.create({
          data: {
            name: row['Nama TPS'].toString().trim(),
            kecamatan: row['Kecamatan'].toString().trim(),
            address: row['Alamat'].toString().trim(),
            latitude: latitude,
            longitude: longitude,
            operatingHours: row['Jam Operasional']?.toString().trim() || '06:00 - 18:00',
            phone: row['No. Telepon']?.toString().trim() || '',
            isActive: true
          }
        })

        results.success.push(`Baris ${rowNumber}: ${row['Nama TPS']} berhasil ditambahkan`)

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error)
        results.errors.push(`Baris ${rowNumber}: Terjadi kesalahan - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Import selesai. Berhasil: ${results.success.length}, Gagal: ${results.errors.length}`,
      results
    }, { status: 200 })

  } catch (error) {
    console.error('Error importing TPS locations:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengimpor data' },
      { status: 500 }
    )
  }
}
