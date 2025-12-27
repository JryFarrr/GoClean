import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { executeQuerySingle, executeQuery } from '@/lib/db'

/**
 * API endpoint untuk upload gambar profil TPS
 * 
 * @route POST /api/tps/upload-image
 * @auth Required - TPS role only
 * @body FormData dengan file 'image'
 * @returns {object} { imageUrl: string } - URL gambar yang berhasil diupload
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'TPS') {
            return NextResponse.json({ error: 'Forbidden - TPS role required' }, { status: 403 })
        }

        // Parse FormData
        const formData = await req.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
        }

        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPG, PNG, and WebP are allowed'
            }, { status: 400 })
        }

        // Validasi ukuran file (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB'
            }, { status: 400 })
        }

        // Get TPS profile untuk cek gambar lama
        const tpsProfile = await executeQuerySingle<{ Foto: string | null }>(`
            SELECT Foto FROM ProfileTps WHERE IDAkun = @idAkun
        `, { idAkun: session.user.id })

        // Hapus gambar lama jika ada
        if (tpsProfile?.Foto) {
            const oldImagePath = path.join(process.cwd(), 'public', tpsProfile.Foto)
            try {
                await unlink(oldImagePath)
            } catch (error) {
                // Ignore error jika file tidak ditemukan
                console.log('Old image not found or already deleted:', error)
            }
        }

        // Generate nama file unik
        const fileExtension = file.name.split('.').pop()
        const fileName = `${session.user.id}_profile.${fileExtension}`

        // Tentukan path untuk menyimpan file
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tps-profiles')
        const filePath = path.join(uploadDir, fileName)

        // Convert file to buffer dan simpan
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // URL relatif untuk disimpan di database
        const imageUrl = `/uploads/tps-profiles/${fileName}`

        // Update profile dengan URL gambar baru
        await executeQuery(`
            UPDATE ProfileTps 
            SET Foto = @foto 
            WHERE IDAkun = @idAkun
        `, {
            foto: imageUrl,
            idAkun: session.user.id
        })

        return NextResponse.json({
            message: 'Image uploaded successfully',
            imageUrl
        })
    } catch (error) {
        console.error('Error uploading image:', error)
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}

/**
 * API endpoint untuk menghapus gambar profil TPS
 * 
 * @route DELETE /api/tps/upload-image
 * @auth Required - TPS role only
 * @returns {object} { message: string }
 */
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'TPS') {
            return NextResponse.json({ error: 'Forbidden - TPS role required' }, { status: 403 })
        }

        // Get TPS profile untuk mendapatkan path gambar
        const tpsProfile = await executeQuerySingle<{ Foto: string | null }>(`
            SELECT Foto FROM ProfileTps WHERE IDAkun = @idAkun
        `, { idAkun: session.user.id })

        if (!tpsProfile?.Foto) {
            return NextResponse.json({ error: 'No profile image found' }, { status: 404 })
        }

        // Hapus file dari filesystem
        const imagePath = path.join(process.cwd(), 'public', tpsProfile.Foto)
        try {
            await unlink(imagePath)
        } catch (error) {
            console.log('Image file not found:', error)
        }

        // Update database untuk set Foto ke null
        await executeQuery(`
            UPDATE ProfileTps 
            SET Foto = NULL 
            WHERE IDAkun = @idAkun
        `, { idAkun: session.user.id })

        return NextResponse.json({
            message: 'Profile image deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting image:', error)
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        )
    }
}
