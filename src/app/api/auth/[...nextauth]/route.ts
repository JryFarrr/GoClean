/**
 * ============================================================================
 * NEXTAUTH API ROUTE HANDLER
 * ============================================================================
 * 
 * File ini adalah route handler untuk NextAuth.js di Next.js 13+ App Router.
 * Semua request ke /api/auth/* akan di-handle oleh file ini.
 * 
 * Endpoints yang di-handle:
 * -------------------------
 * - GET  /api/auth/session → Mendapatkan session user
 * - POST /api/auth/signin → Login (credentials)
 * - POST /api/auth/signout → Logout
 * - GET  /api/auth/csrf → Get CSRF token
 * - GET  /api/auth/providers → List available providers
 * - POST /api/auth/callback/credentials → Callback after login
 * 
 * Konfigurasi Auth:
 * -----------------
 * Konfigurasi autentikasi diimpor dari @/lib/auth.ts
 * Lihat file tersebut untuk detail:
 * - Providers (Credentials)
 * - Callbacks (JWT, Session)
 * - Pages (Custom login page)
 * - Session strategy (JWT)
 * 
 * Catch-all Route [...nextauth]:
 * ------------------------------
 * Folder [...nextauth] adalah dynamic route yang menangkap semua path
 * setelah /api/auth/. Contoh:
 * - /api/auth/session → nextauth = ["session"]
 * - /api/auth/signin → nextauth = ["signin"]
 * 
 * HTTP Methods:
 * -------------
 * - GET: Untuk fetch session, providers, csrf token
 * - POST: Untuk signin, signout, callback
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== IMPORTS =====
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'  // Import konfigurasi auth

// ===== CREATE NEXTAUTH HANDLER =====
/**
 * Create NextAuth handler dengan konfigurasi dari authOptions
 * Handler ini akan memproses semua request autentikasi
 */
const handler = NextAuth(authOptions)

// ===== EXPORT HANDLERS =====
/**
 * Export handler untuk GET dan POST methods
 * 
 * Next.js App Router requires:
 * - Named exports untuk HTTP methods (GET, POST, PUT, DELETE, dll)
 * - Tidak bisa export default untuk route handlers
 * 
 * Cara kerja:
 * - GET request → handler as GET
 * - POST request → handler as POST
 * - NextAuth internally route ke fungsi yang sesuai
 */
export { handler as GET, handler as POST }

