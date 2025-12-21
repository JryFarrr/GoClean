'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  ArrowLeft, 
  Save,
  User,
  Phone,
  MapPin,
  Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfileData {
  name: string
  email: string
  phone?: string
  address?: string
  gopayNumber?: string
  whatsappNumber?: string
}

export default function UserProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gopayNumber: '',
    whatsappNumber: ''
  })

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role === 'TPS' || session?.user?.role === 'ADMIN') {
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.role === 'USER') {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      if (data.data) {
        setProfile({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          gopayNumber: data.data.gopayNumber || '',
          whatsappNumber: data.data.whatsappNumber || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Gagal memuat profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error('Nama harus diisi')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        const result = await res.json()
        if (result.data) {
          setProfile({
            name: result.data.name || '',
            email: result.data.email || '',
            phone: result.data.phone || '',
            address: result.data.address || '',
            gopayNumber: result.data.gopayNumber || '',
            whatsappNumber: result.data.whatsappNumber || ''
          })
        }
        toast.success('Profil berhasil disimpan')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal menyimpan profil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setIsSaving(false)
    }
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (!session || session.user.role !== 'USER') {
    return null
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-2">Kelola informasi profil dan data akun Anda</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="inline mr-2" />
                Nama Lengkap
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contoh: 081234567890"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Smartphone size={16} className="inline mr-2" />
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                value={profile.whatsappNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contoh: 081234567890 (dengan kode negara +62)"
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan format: +62812345678</p>
            </div>

            {/* Gopay Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 Nomor Gopay
              </label>
              <input
                type="tel"
                value={profile.gopayNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, gopayNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nomor Gopay untuk menerima pembayaran dari TPS"
              />
              <p className="text-xs text-gray-500 mt-1">Opsional: Gunakan ini jika ingin menerima pembayaran langsung</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Alamat
              </label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan alamat lengkap tempat tinggal Anda"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Informasi Penting</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Data Anda akan digunakan untuk komunikasi dengan TPS</li>
                <li>✓ Nomor Gopay & WhatsApp membantu TPS menghubungi Anda lebih mudah</li>
                <li>✓ Semua data dijaga kerahasiaannya</li>
              </ul>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} className="mr-2" />
                  Simpan Profil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
