/**
 * ============================================================================
 * AUTHENTICATION CONFIGURATION - NextAuth.js
 * ============================================================================
 * 
 * File ini mengkonfigurasi autentikasi untuk aplikasi GoClean menggunakan
 * NextAuth.js dengan strategi Credentials Provider (email + password).
 * 
 * Fitur Utama:
 * - ✅ Login menggunakan email dan password
 * - ✅ Password hashing dengan bcryptjs
 * - ✅ JWT session management
 * - ✅ Role-based authentication (ADMIN, TPS, USER)
 * - ✅ Custom login pages
 * 
 * Authentication Flow:
 * 1. User memasukkan email & password di form login
 * 2. NextAuth memanggil authorize() function
 * 3. Credentials divalidasi dengan database
 * 4. Jika valid, JWT token dibuat dengan user data
 * 5. Session dibuat dan disimpan di cookies
 * 6. Client dapat mengakses session menggunakan useSession()
 * 
 * Dependencies:
 * - next-auth: Authentication framework untuk Next.js
 * - bcryptjs: Library untuk verify password hash
 * - prisma: ORM untuk query database
 * 
 * Environment Variables Required:
 * - NEXTAUTH_SECRET: Secret key untuk signing JWT (min 32 characters)
 * - NEXTAUTH_URL: Base URL aplikasi (e.g., http://localhost:3000)
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== IMPORTS =====
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs' // Library untuk compare password hash
import prisma from './prisma'

// ===== NEXTAUTH CONFIGURATION =====
/**
 * Konfigurasi utama NextAuth untuk aplikasi GoClean
 * Object ini akan di-export dan digunakan di API route /api/auth/[...nextauth]
 */
export const authOptions: NextAuthOptions = {
  // ===== AUTHENTICATION PROVIDERS =====
  // Provider yang digunakan untuk login (bisa lebih dari 1, contoh: Google, GitHub, dll)
  providers: [
    /**
     * Credentials Provider - Login menggunakan email & password
     * Provider ini memungkinkan custom authentication logic
     */
    CredentialsProvider({
      name: 'credentials',

      // Field yang akan diminta di form login
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },

      /**
       * AUTHORIZE FUNCTION
       * Function ini dipanggil ketika user submit form login
       * 
       * @param credentials - Object berisi email & password dari form
       * @param req - Request object dari Next.js
       * @returns User object jika login berhasil, null jika gagal
       * @throws Error dengan message jika validation gagal
       * 
       * Flow:
       * 1. Validasi input tidak kosong
       * 2. Cari user di database berdasarkan email
       * 3. Verify password dengan bcrypt compare
       * 4. Return user data jika semua validasi pass
       */
      async authorize(credentials, req) {
        // ===== STEP 1: INPUT VALIDATION =====
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi')
        }

        // ===== STEP 2: DATABASE QUERY (RAW SQL) =====
        const { executeQuerySingle } = await import('@/lib/db')

        const akun = await executeQuerySingle<{
          IDAkun: string
          Email: string
          Password: string
          Role: string
        }>(
          `SELECT IDAkun, Email, Password, Role 
           FROM Akun 
           WHERE Email = @email`,
          { email: credentials.email }
        )

        if (!akun) {
          throw new Error('Email tidak terdaftar')
        }

        // ===== STEP 3: PASSWORD VERIFICATION =====
        const isPasswordValid = await compare(credentials.password, akun.Password)

        if (!isPasswordValid) {
          throw new Error('Password salah')
        }

        // ===== STEP 4: GET USER/TPS NAME =====
        let name = ''

        if (akun.Role === 'USER') {
          const user = await executeQuerySingle<{ Nama: string }>(
            `SELECT Nama FROM [User] WHERE IDAkun = @idAkun`,
            { idAkun: akun.IDAkun }
          )
          name = user?.Nama || akun.Email
        } else if (akun.Role === 'TPS') {
          const tps = await executeQuerySingle<{ NamaTps: string }>(
            `SELECT NamaTps FROM ProfileTps WHERE IDAkun = @idAkun`,
            { idAkun: akun.IDAkun }
          )
          name = tps?.NamaTps || akun.Email
        } else {
          name = akun.Email
        }

        // ===== STEP 5: RETURN USER DATA =====
        return {
          id: akun.IDAkun,
          email: akun.Email,
          name: name,
          role: akun.Role,
          image: null
        }
      }
    })
  ],

  // ===== CALLBACKS =====
  // Callbacks digunakan untuk modify JWT token dan session object
  callbacks: {
    /**
     * JWT CALLBACK
     * Dipanggil setiap kali JWT token dibuat atau di-update
     * Digunakan untuk menambahkan data custom ke JWT token
     * 
     * @param token - JWT token yang akan disimpan
     * @param user - User object dari authorize function (hanya ada saat login pertama kali)
     * @returns Modified token dengan data tambahan
     * 
     * Flow:
     * - Saat login pertama: user object ada, tambahkan id & role ke token
     * - Saat refresh: user object tidak ada, return token yang sudah ada
     */
    async jwt({ token, user }) {
      // Jika ada user object (login pertama kali), tambahkan data ke token
      if (user) {
        token.id = user.id
        token.role = user.role // Tambahkan role ke token untuk authorization
      }
      return token
    },

    /**
     * SESSION CALLBACK
     * Dipanggil setiap kali session diakses di client (useSession)
     * Digunakan untuk menambahkan data dari JWT token ke session object
     * 
     * @param session - Session object yang akan dikirim ke client
     * @param token - JWT token yang berisi user data
     * @returns Modified session dengan data dari token
     * 
     * Flow:
     * - Ambil id & role dari JWT token
     * - Tambahkan ke session.user agar bisa diakses di client
     */
    async session({ session, token }) {
      // Tambahkan id dan role dari token ke session
      // Session ini yang akan diakses di client menggunakan useSession()
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string // Penting untuk role-based access control
      }
      return session
    }
  },

  // ===== CUSTOM PAGES =====
  // Override default NextAuth pages dengan custom pages kita
  pages: {
    signIn: '/login',    // Redirect ke /login untuk form login
    error: '/login'      // Redirect ke /login jika ada error
  },

  // ===== SESSION CONFIGURATION =====
  // Menggunakan JWT strategy (token disimpan di cookies, bukan database)
  // Keuntungan JWT: Lebih cepat, tidak perlu query database setiap request
  session: {
    strategy: 'jwt'
  },

  // ===== SECRET KEY =====
  // Secret key untuk signing JWT token
  // PENTING: Harus disimpan di environment variable, jangan hardcode!
  // Generate dengan: openssl rand -base64 32
  secret: process.env.NEXTAUTH_SECRET
}
