'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Shield, ArrowLeft, CheckCircle } from 'lucide-react'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: '' // Kode khusus untuk keamanan
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    if (!formData.adminCode) {
      toast.error('Kode Admin wajib diisi untuk keamanan')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          adminCode: formData.adminCode
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      toast.success('Akun admin berhasil dibuat! Silakan login.')
      router.push('/admin/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back button */}
        <div className="mb-4">
          <Link 
            href="/admin/login" 
            className="inline-flex items-center text-red-700 hover:text-red-900 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Login Admin
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Admin Baru</h1>
            <p className="text-red-600 mt-2 font-medium">Pendaftaran Administrator</p>
            <p className="text-gray-500 text-sm mt-1">Lengkapi formulir untuk membuat akun admin</p>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Kode Admin Diperlukan</p>
                <p>Anda memerlukan kode khusus admin untuk mendaftar. Hubungi super admin untuk mendapatkan kode.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap admin"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@goclean.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Admin Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Admin *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleChange}
                  placeholder="Masukkan kode admin"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Kode keamanan untuk verifikasi admin</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
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
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Daftar sebagai Admin</span>
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

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Sudah punya akun admin?{' '}
            <Link href="/admin/login" className="text-red-600 font-semibold hover:underline">
              Login sekarang
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white rounded-xl shadow p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">💡 Informasi:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Kode admin diperlukan untuk keamanan sistem</li>
            <li>• Hubungi super admin untuk mendapatkan kode</li>
            <li>• Kode default development: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">GOCLEAN2025</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
