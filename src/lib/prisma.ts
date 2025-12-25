/**
 * ============================================================================
 * PRISMA CLIENT SINGLETON
 * ============================================================================
 * 
 * File ini membuat dan meng-export Prisma Client instance yang digunakan
 * untuk mengakses database di seluruh aplikasi.
 * 
 * MENGAPA SINGLETON PATTERN?
 * ---------------------------
 * Dalam development mode, Next.js melakukan hot reload setiap kali ada perubahan
 * kode. Jika kita membuat PrismaClient baru setiap kali, akan menyebabkan:
 * - Terlalu banyak koneksi database (connection pool exhausted)
 * - Memory leak
 * - Performance issues
 * 
 * Solusi: Simpan instance di global object agar tidak dibuat ulang saat hot reload
 * 
 * PERBEDAAN DEVELOPMENT VS PRODUCTION:
 * -------------------------------------
 * - Development: Instance disimpan di globalThis agar tidak recreate saat hot reload
 * - Production: Instance dibuat sekali saat app start, tidak perlu global storage
 * 
 * DATABASE SUPPORT:
 * -----------------
 * Prisma ORM mendukung berbagai database:
 * - PostgreSQL (Production - Neon, Supabase, Railway)
 * - MySQL/TiDB (Production - TiDB Cloud, PlanetScale)
 * - SQL Server (Development - Local SQL Server 2025)
 * - SQLite (Testing - In-memory database)
 * 
 * Provider database dikonfigurasi di file: prisma/schema.prisma
 * 
 * CONNECTION POOLING:
 * -------------------
 * Prisma secara otomatis mengelola connection pool dengan setting default:
 * - Pool size: Jumlah CPU cores * 2 + 1
 * - Timeout: 10 seconds
 * - Lazy connection: Koneksi dibuat saat query pertama
 * 
 * Dependencies:
 * - @prisma/client: Generated client dari Prisma schema
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== IMPORTS =====
import { PrismaClient } from '@prisma/client'

// ===== GLOBAL TYPE DEFINITION =====
/**
 * Extend global object untuk menyimpan Prisma instance
 * TypeScript tidak tahu tentang property custom di globalThis,
 * jadi kita perlu define type-nya
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ===== CREATE PRISMA INSTANCE =====
/**
 * Singleton pattern untuk Prisma Client
 * 
 * Logic:
 * 1. Cek apakah sudah ada instance di global object (globalForPrisma.prisma)
 * 2. Jika sudah ada (hot reload), gunakan yang existing
 * 3. Jika belum ada, buat instance baru
 * 
 * Operator ?? (Nullish Coalescing):
 * - Return value kiri jika !== null atau undefined
 * - Return value kanan jika === null atau undefined
 * 
 * @example
 * // Di development (hot reload):
 * // 1st load: globalForPrisma.prisma = undefined → create new instance
 * // 2nd load: globalForPrisma.prisma = existing → reuse existing
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// ===== SAVE TO GLOBAL (Development Only) =====
/**
 * Simpan instance ke global object HANYA di development mode
 * 
 * Alasan:
 * - Development: Hot reload bisa terjadi kapan saja, perlu save instance
 * - Production: Hot reload tidak terjadi, tidak perlu global storage
 * 
 * Environment Check:
 * - NODE_ENV === 'production': Build untuk deployment (Vercel, Railway, dll)
 * - NODE_ENV !== 'production': Development mode (npm run dev)
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ===== DEFAULT EXPORT =====
/**
 * Export default agar bisa diimport dengan syntax:
 * import prisma from '@/lib/prisma'
 * 
 * Cara Penggunaan:
 * ----------------
 * // Query data
 * const users = await prisma.user.findMany()
 * 
 * // Create data
 * const newUser = await prisma.user.create({
 *   data: { name: 'John', email: 'john@example.com' }
 * })
 * 
 * // Update data
 * await prisma.user.update({
 *   where: { id: '123' },
 *   data: { name: 'John Doe' }
 * })
 * 
 * // Delete data
 * await prisma.user.delete({ where: { id: '123' } })
 */
export default prisma

