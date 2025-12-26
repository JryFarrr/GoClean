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
  Smartphone,
  Image as ImageIcon,
  Upload,
  X
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
  profileImage?: string | null
}

export default function TPSProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
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
    description: '',
    profileImage: null
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
          description: data.data.description || '',
          profileImage: data.data.profileImage || null
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file JPG, PNG, dan WebP yang diperbolehkan')
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/tps/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok && data.imageUrl) {
        setProfile(prev => ({ ...prev, profileImage: data.imageUrl }))
        toast.success('Gambar berhasil diunggah')
        // Refresh profile to get updated data
        await fetchProfile()
      } else {
        toast.error(data.error || 'Gagal mengunggah gambar')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Terjadi kesalahan saat mengunggah gambar')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar profil?')) return

    try {
      const res = await fetch('/api/tps/upload-image', {
        method: 'DELETE'
      })

      if (res.ok) {
        setProfile(prev => ({ ...prev, profileImage: null }))
        toast.success('Gambar berhasil dihapus')
        await fetchProfile()
      } else {
        toast.error('Gagal menghapus gambar')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Terjadi kesalahan saat menghapus gambar')
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
        {/* Profile Image Upload */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <ImageIcon className="text-pink-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Gambar Profil TPS</h3>
              <p className="text-sm text-green-600">Unggah foto lokasi TPS Anda</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Preview */}
            {profile.profileImage && (
              <div className="relative inline-block">
                <img
                  src={profile.profileImage}
                  alt="TPS Profile"
                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-green-200"
                />
                <button
                  onClick={handleDeleteImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  title="Hapus gambar"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div>
              <label className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload size={20} className="mr-2" />
                    {profile.profileImage ? 'Ganti Gambar' : 'Unggah Gambar'}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Format: JPG, PNG, WebP • Maksimal 5MB
              </p>
            </div>
          </div>
        </div>

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

            {/* Map with Geolocation Button Overlay */}
            <div className="h-64 rounded-lg overflow-hidden relative">
              <MapComponent
                onLocationSelect={handleLocationSelect}
                currentLat={profile.latitude ?? undefined}
                currentLng={profile.longitude ?? undefined}
                selectable={true}
                draggable={true}
              />

              {/* Control Buttons - Bottom Right */}
              <div className="absolute bottom-3 right-3 z-[1000] flex gap-2">
                {/* Delete Marker Button */}
                {profile.latitude && profile.longitude && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({
                        ...prev,
                        latitude: undefined,
                        longitude: undefined
                      }))
                      toast.success('Marker dihapus')
                    }}
                    className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-lg"
                    title="Hapus marker"
                  >
                    🗑️ Hapus Marker
                  </button>
                )}

                {/* Geolocation Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      toast.loading('Mengambil lokasi Anda...')
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const lat = position.coords.latitude
                          const lng = position.coords.longitude
                          setProfile(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng
                          }))
                          toast.dismiss()
                          toast.success('Lokasi berhasil dideteksi!')
                        },
                        (error) => {
                          toast.dismiss()
                          toast.error('Gagal mendeteksi lokasi. Pastikan GPS aktif.')
                          console.error('Geolocation error:', error)
                        }
                      )
                    } else {
                      toast.error('Browser tidak support geolocation')
                    }
                  }}
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg"
                  title="Gunakan lokasi saya"
                >
                  🎯 Lokasi Saya
                </button>
              </div>
            </div>

            {/* Latitude & Longitude Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.latitude !== undefined && profile.latitude !== null ? profile.latitude : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setProfile(prev => ({
                      ...prev,
                      latitude: value === '' ? undefined : parseFloat(value)
                    }))
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="-7.2575"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={profile.longitude !== undefined && profile.longitude !== null ? profile.longitude : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setProfile(prev => ({
                      ...prev,
                      longitude: value === '' ? undefined : parseFloat(value)
                    }))
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="112.7521"
                />
              </div>
            </div>

            {profile.latitude && profile.longitude && !isNaN(profile.latitude) && !isNaN(profile.longitude) && (
              <p className="text-sm text-green-600">
                ✓ Koordinat tersimpan: {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
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
