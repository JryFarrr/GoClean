'use client'

import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Loader2, Shield, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      // Check if admin
      if (session?.user?.role === 'ADMIN') {
        router.replace('/admin')
      } else {
        // Not admin, redirect to regular login
        router.replace('/dashboard')
      }
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        // Force session update
        await update()
        
        // Small delay to ensure session is updated
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Fetch fresh session data
        const response = await fetch('/api/user/profile')
        const userData = await response.json()
        
        console.log('User data after login:', userData) // Debug log
        
        // Check if userData has data property (wrapped response)
        const userRole = userData.data?.role || userData.role
        
        if (userRole === 'ADMIN') {
          toast.success('Login admin berhasil!')
          router.replace('/admin')
          router.refresh() // Force page refresh
        } else {
          // USER atau TPS TIDAK BOLEH login di halaman ini - langsung logout
          toast.error('Akses ditolak! User & TPS harus login di halaman biasa.')
          // Force sign out immediately
          await signOut({ redirect: false })
          setIsLoading(false)
          // Redirect to home page
          setTimeout(() => {
            router.replace('/')
          }, 1500)
          return // Stop execution
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login')
      console.error(error)
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    )
  }

  // Don't render form if authenticated (will redirect)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back to main login */}
        <div className="mb-4">
          <Link 
            href="/login" 
            className="inline-flex items-center text-red-700 hover:text-red-900 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Login Biasa
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login Admin</h1>
            <p className="text-red-600 mt-2 font-medium">Akses Khusus Administrator</p>
            <p className="text-gray-500 text-sm mt-1">Hanya untuk pengelola sistem GoClean</p>
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="text-red-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Perhatian:</p>
                <p>Halaman ini khusus untuk administrator. Akses tidak sah akan dicatat.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@goclean.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Login sebagai Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">atau</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Admin Link */}
          <p className="text-center text-gray-600">
            Belum punya akun admin?{' '}
            <Link href="/admin/register" className="text-red-600 font-semibold hover:underline">
              Daftar Admin Baru
            </Link>
          </p>
        </div>

        {/* Demo Account */}
        <div className="mt-6 bg-white rounded-xl shadow p-4 border border-red-100">
          <p className="text-sm text-gray-500 mb-2">Demo admin account:</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Email: admin@goclean.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
