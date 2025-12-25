/**
 * ============================================================================
 * REACT CONTEXT PROVIDERS
 * ============================================================================
 * 
 * File ini mengatur semua Context Providers yang dibutuhkan aplikasi.
 * Providers ini membungkus seluruh aplikasi (digunakan di root layout).
 * 
 * Providers yang Digunakan:
 * -------------------------
 * 1. SessionProvider (NextAuth) - Menyediakan session data ke seluruh app
 * 2. Toaster (react-hot-toast) - Toast notification system
 * 
 * NextAuth SessionProvider Config:
 * --------------------------------
 * - refetchInterval: 0 → Tidak auto-refetch session (hemat resources)
 * - refetchOnWindowFocus: true → Refetch session saat user kembali ke tab
 * 
 * Toast Notification Config:
 * --------------------------
 * - position: "top-right" → Toast muncul di pojok kanan atas
 * - Default duration: 4 seconds
 * - Support success, error, loading, custom toast
 * 
 * Cara Penggunaan Components:
 * ---------------------------
 * // Di root layout.tsx
 * <Providers>
 *   <YourApp />
 * </Providers>
 * 
 * // Di component manapun untuk access session
 * import { useSession } from 'next-auth/react'
 * const { data: session } = useSession()
 * 
 * // Di component manapun untuk show toast
 * import toast from 'react-hot-toast'
 * toast.success('Berhasil!')
 * toast.error('Terjadi kesalahan')
 * 
 * Dependencies:
 * - next-auth/react: SessionProvider component
 * - react-hot-toast: Toaster component
 * 
 * Author: GoClean Team
 * Last Updated: December 2024
 * ============================================================================
 */

// ===== CLIENT COMPONENT =====
// 'use client' directive karena menggunakan React hooks dan context
'use client'

// ===== IMPORTS =====
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

// ===== PROVIDERS COMPONENT =====
/**
 * Providers wrapper component
 * Membungkus children dengan semua context providers yang dibutuhkan
 * 
 * @param children - React children (seluruh aplikasi)
 * 
 * Component Tree:
 * ---------------
 * <Providers>
 *   <SessionProvider>  ← NextAuth session management
 *     {children}       ← Your app components
 *     <Toaster />      ← Toast notification renderer
 *   </SessionProvider>
 * </Providers>
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}           // Disable auto-refetch untuk save resources
      refetchOnWindowFocus={true}   // Refetch saat user kembali ke tab (security)
    >
      {children}
      {/* Toaster component untuk render toast notifications */}
      <Toaster position="top-right" />
    </SessionProvider>
  )
}

