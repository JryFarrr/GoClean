'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, MapPin, Search } from 'lucide-react'

type UserRole = 'USER' | 'TPS'

interface TPSLocation {
  id: string
  name: string
  kecamatan: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole>('USER')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // TPS specific
    selectedTpsId: '',
    tpsName: '',
    address: '',
    latitude: 0,
    longitude: 0,
    operatingHours: '',
    capacity: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tpsSearch, setTpsSearch] = useState('')
  const [showTpsDropdown, setShowTpsDropdown] = useState(false)
  const [tpsLocations, setTpsLocations] = useState<TPSLocation[]>([])
  const [loadingTPS, setLoadingTPS] = useState(false)

  // Fetch TPS locations from database
  useEffect(() => {
    if (role === 'TPS') {
      fetchTPSLocations()
    }
  }, [role])

  const fetchTPSLocations = async () => {
    setLoadingTPS(true)
    try {
      const res = await fetch('/api/tps-locations')
      const data = await res.json()
      if (data.data) {
        setTpsLocations(data.data)
      }
    } catch (error) {
      console.error('Error fetching TPS locations:', error)
      toast.error('Gagal memuat lokasi TPS')
    } finally {
      setLoadingTPS(false)
    }
  }

  // Filter TPS based on search
  const filteredTPS = useMemo(() => {
    if (!tpsSearch.trim()) return tpsLocations
    const search = tpsSearch.toLowerCase()
    return tpsLocations.filter(tps =>
      tps.name?.toLowerCase().includes(search) ||
      tps.address?.toLowerCase().includes(search)
    )
  }, [tpsSearch, tpsLocations])

  // Handle TPS selection
  const handleSelectTPS = (tpsId: string) => {
    const selectedTPS = tpsLocations.find(tps => tps.id === tpsId)
    if (selectedTPS) {
      setFormData(prev => ({
        ...prev,
        selectedTpsId: tpsId,
        tpsName: selectedTPS.name,
        address: selectedTPS.address,
        latitude: selectedTPS.latitude,
        longitude: selectedTPS.longitude,
        operatingHours: selectedTPS.operatingHours || ''
      }))
      setTpsSearch(selectedTPS.name)
      setShowTpsDropdown(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    if (role === 'TPS' && !formData.selectedTpsId) {
      toast.error('Silakan pilih TPS dari daftar')
      return
    }

    setIsLoading(true)

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role
      }

      if (role === 'TPS') {
        payload.tpsData = {
          tpsName: formData.tpsName,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          operatingHours: formData.operatingHours,
          capacity: parseInt(formData.capacity) || null
        }
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      toast.success('Registrasi berhasil! Silakan login.')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar GoClean</h1>
            <p className="text-gray-600 mt-2">Buat akun baru untuk mulai menggunakan GoClean</p>
          </div>

          {/* Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-center font-medium text-gray-700">Pilih jenis akun:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-6 rounded-xl border-2 transition text-center ${role === 'USER'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                  <p className="font-semibold text-gray-800">Masyarakat</p>
                  <p className="text-sm text-gray-600">Untuk penggunaan personal</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TPS')}
                  className={`p-6 rounded-xl border-2 transition text-center ${role === 'TPS'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <div className="text-4xl mb-2">🏭</div>
                  <p className="font-semibold text-gray-800">Pihak TPS</p>
                  <p className="text-sm text-gray-600">Untuk pengelola TPS</p>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Lanjutkan
              </button>
            </div>
          )}

          {/* Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama lengkap"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* TPS Specific Fields */}
              {role === 'TPS' && (
                <>
                  {/* TPS Selection with Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih TPS *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={tpsSearch}
                        onChange={(e) => {
                          setTpsSearch(e.target.value)
                          setShowTpsDropdown(true)
                        }}
                        onFocus={() => setShowTpsDropdown(true)}
                        placeholder="Cari TPS berdasarkan nama atau kecamatan..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Dropdown List */}
                    {showTpsDropdown && filteredTPS.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredTPS.map((tps) => (
                          <button
                            key={tps.id}
                            type="button"
                            onClick={() => handleSelectTPS(tps.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition ${formData.selectedTpsId === tps.id ? 'bg-green-50' : ''
                              }`}
                          >
                            <div className="font-medium text-gray-900">{tps.name}</div>
                            <div className="text-sm text-gray-600">{tps.kecamatan}</div>
                            <div className="text-xs text-gray-500">{tps.address}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {showTpsDropdown && filteredTPS.length === 0 && tpsSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        TPS tidak ditemukan
                      </div>
                    )}
                  </div>

                  {/* Display selected TPS details (read-only) */}
                  {formData.selectedTpsId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-green-900 mb-2">Detail TPS yang Dipilih:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Nama:</span>
                          <p className="font-medium text-gray-900">{formData.tpsName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jam Operasional:</span>
                          <p className="font-medium text-gray-900">{formData.operatingHours || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Alamat:</span>
                          <p className="font-medium text-gray-900">{formData.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Latitude:</span>
                          <p className="font-medium text-gray-900">{formData.latitude}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Longitude:</span>
                          <p className="font-medium text-gray-900">{formData.longitude}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kapasitas Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kapasitas (kg)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="Contoh: 1000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Kapasitas maksimal sampah yang dapat ditampung (dalam kilogram)</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
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
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Daftar</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-green-600 font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
