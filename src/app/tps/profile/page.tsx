'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Loader2, 
  ArrowLeft, 
  Save,
  MapPin,
  Phone,
  Clock,
  Building2,
  Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

interface TPSProfileData {
  tpsName: string
  address: string
  latitude?: number
  longitude?: number
  phone?: string
  gopayNumber?: string
  whatsappNumber?: string
  operatingHours?: string
  capacity?: number
  description?: string
}

export default function TPSProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<TPSProfileData>({
    tpsName: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    phone: '',
    gopayNumber: '',
    whatsappNumber: '',
    operatingHours: '',
    capacity: undefined,
    description: ''
  })

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'TPS') {
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.role === 'TPS') {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/tps/profile')
      const data = await res.json()
      if (data.data) {
        setProfile({
          tpsName: data.data.tpsName || '',
          address: data.data.address || '',
          latitude: data.data.latitude,
          longitude: data.data.longitude,
          phone: data.data.phone || '',
          gopayNumber: data.data.gopayNumber || '',
          whatsappNumber: data.data.whatsappNumber || '',
          operatingHours: data.data.operatingHours || '',
          capacity: data.data.capacity,
          description: data.data.description || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setProfile(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address
    }))
  }

  const handleSave = async () => {
    if (!profile.tpsName.trim()) {
      toast.error('Nama TPS harus diisi')
      return
    }

    if (!profile.address.trim()) {
      toast.error('Alamat harus diisi')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/tps/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (res.ok) {
        toast.success('Profil berhasil disimpan')
      } else {
        toast.error('Gagal menyimpan profil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Terjadi kesalahan')
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

  if (!session || session.user.role !== 'TPS') {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-green-700 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Profil TPS</h1>
            <p className="text-green-700 mt-2">
              Lengkapi informasi TPS Anda agar mudah ditemukan masyarakat
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Save size={20} className="mr-2" />
            )}
            Simpan
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* TPS Name */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Nama TPS</h3>
              <p className="text-sm text-green-600">Nama resmi TPS Anda</p>
            </div>
          </div>
          <input
            type="text"
            value={profile.tpsName}
            onChange={(e) => setProfile(prev => ({ ...prev, tpsName: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: TPS Kebersihan Sejahtera"
          />
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Alamat & Lokasi</h3>
              <p className="text-sm text-green-600">Alamat lengkap dan titik lokasi TPS</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={profile.address}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Alamat lengkap TPS..."
            />

            <div className="h-64 rounded-lg overflow-hidden">
              <MapComponent
                onLocationSelect={handleLocationSelect}
                currentLat={profile.latitude}
                currentLng={profile.longitude}
                selectable={true}
              />
            </div>

            {profile.latitude && profile.longitude && !isNaN(profile.latitude) && !isNaN(profile.longitude) && (
              <p className="text-sm text-green-600">
                Koordinat: {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Phone className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Kontak</h3>
              <p className="text-sm text-green-600">Nomor telepon yang bisa dihubungi</p>
            </div>
          </div>
          <input
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: 08123456789"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Nomor WhatsApp</h3>
              <p className="text-sm text-green-600">Nomor untuk komunikasi dengan pengguna</p>
            </div>
          </div>
          <input
            type="tel"
            value={profile.whatsappNumber || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, whatsappNumber: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: +6281234567890"
          />
          <p className="text-xs text-gray-500 mt-2">Format: +62812345678 (dengan kode negara)</p>
        </div>

        {/* Gopay Number */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">📱 Nomor Gopay</h3>
              <p className="text-sm text-green-600">Nomor untuk menerima pembayaran dari pengguna</p>
            </div>
          </div>
          <input
            type="tel"
            value={profile.gopayNumber || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, gopayNumber: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nomor Gopay untuk menerima pembayaran"
          />
          <p className="text-xs text-gray-500 mt-2">Opsional: Gunakan ini jika TPS ingin menerima pembayaran langsung</p>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Jam Operasional</h3>
              <p className="text-sm text-green-600">Waktu operasional TPS</p>
            </div>
          </div>
          <input
            type="text"
            value={profile.operatingHours || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, operatingHours: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: Senin - Sabtu, 07:00 - 17:00"
          />
        </div>

        {/* Capacity */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Building2 className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Kapasitas</h3>
              <p className="text-sm text-green-600">Kapasitas maksimal TPS (dalam kilogram)</p>
            </div>
          </div>
          <input
            type="number"
            value={profile.capacity !== undefined && profile.capacity !== null ? profile.capacity : ''}
            onChange={(e) => {
              const value = e.target.value
              setProfile(prev => ({ 
                ...prev, 
                capacity: value === '' ? undefined : parseInt(value) || undefined 
              }))
            }}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Contoh: 1000"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-2">Opsional: Masukkan kapasitas dalam kg</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Building2 className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Deskripsi</h3>
              <p className="text-sm text-green-600">Informasi tambahan tentang TPS</p>
            </div>
          </div>
          <textarea
            value={profile.description || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="Deskripsikan TPS Anda, jenis sampah yang diterima, fasilitas, dll..."
          />
          <p className="text-xs text-gray-500 mt-2">Opsional: Berikan informasi yang membantu pengguna memahami layanan TPS</p>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {isSaving ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          Simpan Profil
        </button>
      </div>
    </div>
  )
}
