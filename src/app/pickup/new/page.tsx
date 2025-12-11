'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Loader2, MapPin, Calendar, FileText, ArrowLeft, Building2, AlertTriangle, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import MediaUploader from '@/components/MediaUploader'
import WasteItemSelector from '@/components/WasteItemSelector'
import { useLocationStore } from '@/lib/store'
import { calculateDistance, getPriceModifier, extractDistrict, formatCurrency } from '@/lib/utils'

// Dynamic import for map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

interface WasteItem {
  wasteType: string
  estimatedWeight: number
}

interface TPSData {
  id: string
  name: string
  email: string
  phone: string
  tpsProfile: {
    id: string
    tpsName: string
    latitude: number | null
    longitude: number | null
    address: string
    phone: string | null
    operatingHours: string | null
    description: string | null
    isActive: boolean
    wastePrices: Array<{
      id: string
      wasteType: string
      pricePerKg: number
      description: string | null
    }>
  } | null
}

interface TPSWithDistance extends TPSData {
  distance: number
  priceModifier: { modifier: number; label: string; color: string }
}

export default function NewPickupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { latitude, longitude, address, setLocation, clearLocation } = useLocationStore()
  
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // TPS Selection state
  const [tpsList, setTpsList] = useState<TPSData[]>([])
  const [selectedTps, setSelectedTps] = useState<TPSWithDistance | null>(null)
  const [isLoadingTps, setIsLoadingTps] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'nearest' | 'district'>('all')
  const [searchDistrict, setSearchDistrict] = useState('')
  const [showPriceWarning, setShowPriceWarning] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch TPS list
  useEffect(() => {
    const fetchTps = async () => {
      setIsLoadingTps(true)
      try {
        const res = await fetch('/api/tps?active=true')
        const data = await res.json()
        setTpsList(data)
      } catch (error) {
        console.error('Failed to fetch TPS:', error)
        toast.error('Gagal memuat daftar TPS')
      } finally {
        setIsLoadingTps(false)
      }
    }
    fetchTps()
  }, [])

  // Calculate TPS with distance and apply filters
  const filteredTpsList = useMemo(() => {
    if (!latitude || !longitude) return []
    
    // Calculate distance for each TPS
    const tpsWithDistance: TPSWithDistance[] = tpsList
      .filter(tps => tps.tpsProfile?.latitude && tps.tpsProfile?.longitude && tps.tpsProfile.isActive)
      .map(tps => {
        const distance = calculateDistance(
          latitude,
          longitude,
          tps.tpsProfile!.latitude!,
          tps.tpsProfile!.longitude!
        )
        return {
          ...tps,
          distance,
          priceModifier: getPriceModifier(distance)
        }
      })
    
    // Apply filters
    let filtered = [...tpsWithDistance]
    
    if (filterType === 'nearest') {
      filtered.sort((a, b) => a.distance - b.distance)
    } else if (filterType === 'district' && searchDistrict) {
      const userDistrict = extractDistrict(address).toLowerCase()
      filtered = filtered.filter(tps => {
        const tpsDistrict = extractDistrict(tps.tpsProfile?.address || '').toLowerCase()
        return tpsDistrict.includes(searchDistrict.toLowerCase()) || 
               tps.tpsProfile?.address.toLowerCase().includes(searchDistrict.toLowerCase())
      })
    }
    
    // Always sort by distance within filter
    if (filterType !== 'nearest') {
      filtered.sort((a, b) => a.distance - b.distance)
    }
    
    return filtered
  }, [tpsList, latitude, longitude, address, filterType, searchDistrict])

  // Get unique districts from TPS list
  const availableDistricts = useMemo(() => {
    const districts = new Set<string>()
    tpsList.forEach(tps => {
      if (tps.tpsProfile?.address) {
        const district = extractDistrict(tps.tpsProfile.address)
        if (district) districts.add(district)
      }
    })
    return Array.from(districts).sort()
  }, [tpsList])

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLocation(lat, lng, addr)
  }

  const handleMarkerRemove = () => {
    clearLocation()
  }

  const handleSelectTps = (tps: TPSWithDistance) => {
    setSelectedTps(tps)
    // Show warning if TPS is far (more than 5km) or very close
    if (tps.distance > 5 || tps.distance <= 1) {
      setShowPriceWarning(true)
    }
  }

  const handleSubmit = async () => {
    if (!latitude || !longitude || !address) {
      toast.error('Pilih lokasi penjemputan terlebih dahulu')
      return
    }

    if (wasteItems.length === 0) {
      toast.error('Pilih minimal satu jenis sampah')
      return
    }

    if (!selectedTps) {
      toast.error('Pilih TPS terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('latitude', latitude.toString())
      formData.append('longitude', longitude.toString())
      formData.append('address', address)
      formData.append('description', description)
      formData.append('wasteItems', JSON.stringify(wasteItems))
      formData.append('tpsId', selectedTps.id)
      formData.append('distanceKm', selectedTps.distance.toString())
      formData.append('priceModifier', selectedTps.priceModifier.modifier.toString())
      
      if (scheduledAt) {
        formData.append('scheduledAt', scheduledAt)
      }

      files.forEach((file) => {
        formData.append('files', file)
      })

      const res = await fetch('/api/pickups', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      toast.success('Permintaan penjemputan berhasil dibuat!')
      router.push('/pickup/history')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (!session) {
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
        <h1 className="text-3xl font-bold text-green-800">Buat Permintaan Penjemputan</h1>
        <p className="text-green-700 mt-2">
          Ikuti langkah-langkah berikut untuk membuat permintaan penjemputan sampah
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Lokasi' },
          { num: 2, label: 'Foto/Video' },
          { num: 3, label: 'Jenis Sampah' },
          { num: 4, label: 'Pilih TPS' },
          { num: 5, label: 'Konfirmasi' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                step >= s.num
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {s.num}
            </div>
            <span className={`ml-1 md:ml-2 hidden lg:block text-sm ${step >= s.num ? 'text-green-600 font-medium' : 'text-green-600'}`}>
              {s.label}
            </span>
            {i < 4 && (
              <div className={`w-6 md:w-12 lg:w-16 h-1 mx-1 md:mx-2 ${step > s.num ? 'bg-green-600' : 'bg-green-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-green-100">
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold">Pilih Lokasi Penjemputan</h2>
            </div>
            <p className="text-green-700">
              Klik pada peta untuk memilih lokasi atau gunakan tombol "Lokasi Saya" untuk menggunakan lokasi Anda saat ini.
              Anda dapat menggeser marker untuk mengubah lokasi, atau klik tombol "Hapus Marker" jika ingin memilih ulang.
            </p>
            
            <MapComponent
              selectable
              draggable
              showRemoveButton
              onLocationSelect={handleLocationSelect}
              onMarkerRemove={handleMarkerRemove}
              className="h-[400px] w-full"
            />

            {address && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-800">Lokasi Dipilih:</p>
                <p className="text-green-700">{address}</p>
                <p className="text-sm text-green-600 mt-1">
                  Koordinat: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!latitude || !longitude}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {/* Step 2: Photos/Videos */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold">Upload Foto/Video Sampah</h2>
            </div>
            <p className="text-green-700">
              Ambil foto atau video sampah Anda untuk memudahkan pihak TPS menilai jenis dan jumlah sampah.
            </p>

            <MediaUploader
              onFilesChange={setFiles}
              maxFiles={5}
              acceptImages
              acceptVideos
            />

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Waste Types */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">♻️</span>
              <h2 className="text-2xl font-bold">Pilih Jenis Sampah</h2>
            </div>
            <p className="text-green-700">
              Pilih jenis sampah dan perkiraan berat untuk memudahkan TPS mempersiapkan penjemputan.
            </p>

            <WasteItemSelector
              items={wasteItems}
              onChange={setWasteItems}
            />

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Deskripsi Tambahan (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Sampah dalam kantong hitam, letakkan di depan rumah..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                <Calendar size={18} className="inline mr-2" />
                Jadwal Penjemputan (Opsional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={wasteItems.length === 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Select TPS */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold">Pilih TPS Penjemput</h2>
            </div>
            
            {/* Price Warning Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-amber-800">Informasi Harga Berdasarkan Jarak</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Harga sampah dipengaruhi oleh jarak TPS dari lokasi Anda:
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• <span className="font-medium text-green-600">≤1 km:</span> Harga Normal (100%)</li>
                    <li>• <span className="font-medium text-blue-600">1-3 km:</span> Diskon 5%</li>
                    <li>• <span className="font-medium text-yellow-600">3-5 km:</span> Diskon 10%</li>
                    <li>• <span className="font-medium text-orange-600">5-10 km:</span> Diskon 15%</li>
                    <li>• <span className="font-medium text-red-600">&gt;10 km:</span> Diskon 20%</li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2 italic">
                    *Semakin dekat TPS, semakin tinggi harga sampah Anda karena biaya transportasi lebih rendah.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Filter size={18} className="text-gray-600" />
                <span className="font-medium text-gray-700">Filter TPS</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => { setFilterType('all'); setSearchDistrict(''); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterType === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  Semua TPS
                </button>
                <button
                  onClick={() => { setFilterType('nearest'); setSearchDistrict(''); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterType === 'nearest' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  Terdekat
                </button>
                <button
                  onClick={() => setFilterType('district')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterType === 'district' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 border hover:bg-gray-100'
                  }`}
                >
                  Per Kecamatan
                </button>
              </div>
              
              {filterType === 'district' && (
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari kecamatan..."
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {availableDistricts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableDistricts.slice(0, 5).map(district => (
                        <button
                          key={district}
                          onClick={() => setSearchDistrict(district)}
                          className={`px-3 py-1 text-xs rounded-full transition ${
                            searchDistrict === district
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {district}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TPS List */}
            <div className="space-y-4">
              {isLoadingTps ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-green-600" size={32} />
                </div>
              ) : filteredTpsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Tidak ada TPS yang ditemukan</p>
                  {filterType === 'district' && searchDistrict && (
                    <p className="text-sm mt-1">Coba ubah filter pencarian</p>
                  )}
                </div>
              ) : (
                filteredTpsList.map((tps) => (
                  <div
                    key={tps.id}
                    onClick={() => handleSelectTps(tps)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedTps?.id === tps.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {tps.tpsProfile?.tpsName || tps.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {tps.tpsProfile?.address}
                        </p>
                        {tps.tpsProfile?.operatingHours && (
                          <p className="text-sm text-gray-500 mt-1">
                            🕒 {tps.tpsProfile.operatingHours}
                          </p>
                        )}
                        {tps.phone && (
                          <p className="text-sm text-gray-500 mt-1">
                            📞 {tps.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {tps.distance.toFixed(1)} km
                        </p>
                        <p className={`text-sm font-medium ${tps.priceModifier.color}`}>
                          {tps.priceModifier.label}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price list preview */}
                    {tps.tpsProfile?.wastePrices && tps.tpsProfile.wastePrices.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Harga per kg (setelah penyesuaian jarak):</p>
                        <div className="flex flex-wrap gap-2">
                          {tps.tpsProfile.wastePrices.slice(0, 4).map(price => (
                            <span key={price.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {price.wasteType}: {formatCurrency(price.pricePerKg * tps.priceModifier.modifier)}
                            </span>
                          ))}
                          {tps.tpsProfile.wastePrices.length > 4 && (
                            <span className="text-xs text-gray-400">
                              +{tps.tpsProfile.wastePrices.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedTps?.id === tps.id && (
                      <div className="mt-3 flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">TPS Dipilih</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Selected TPS Warning Modal */}
            {showPriceWarning && selectedTps && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="text-amber-500" size={28} />
                    <h3 className="text-lg font-bold">Perhatian!</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    {selectedTps.distance <= 1 ? (
                      <>
                        TPS <strong>{selectedTps.tpsProfile?.tpsName}</strong> berjarak sangat dekat ({selectedTps.distance.toFixed(1)} km). 
                        Anda akan mendapatkan <strong className="text-green-600">harga terbaik (100%)</strong> untuk sampah Anda!
                      </>
                    ) : (
                      <>
                        TPS <strong>{selectedTps.tpsProfile?.tpsName}</strong> berjarak {selectedTps.distance.toFixed(1)} km dari lokasi Anda. 
                        Harga sampah akan mengalami <strong className={selectedTps.priceModifier.color}>{selectedTps.priceModifier.label.toLowerCase()}</strong> karena biaya transportasi.
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Apakah Anda yakin ingin memilih TPS ini?
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => { setSelectedTps(null); setShowPriceWarning(false); }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Pilih TPS Lain
                    </button>
                    <button
                      onClick={() => setShowPriceWarning(false)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Ya, Lanjutkan
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!selectedTps}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-green-800">Konfirmasi Permintaan</h2>
            <p className="text-green-700">
              Periksa kembali data permintaan Anda sebelum mengirim.
            </p>

            <div className="space-y-4">
              {/* Location Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold flex items-center text-green-800">
                  <MapPin size={18} className="mr-2 text-green-600" />
                  Lokasi Penjemputan
                </h3>
                <p className="text-green-700 mt-1">{address}</p>
              </div>

              {/* Media Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold flex items-center text-green-800">
                  <FileText size={18} className="mr-2 text-green-600" />
                  Media
                </h3>
                <p className="text-green-700 mt-1">
                  {files.length} file (
                  {files.filter((f) => f.type.startsWith('image/')).length} foto,{' '}
                  {files.filter((f) => f.type.startsWith('video/')).length} video)
                </p>
              </div>

              {/* Waste Items Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-green-800">♻️ Jenis Sampah</h3>
                <div className="space-y-2">
                  {wasteItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-green-700">
                      <span>{item.wasteType}</span>
                      <span>{item.estimatedWeight} kg</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {wasteItems.reduce((sum, item) => sum + item.estimatedWeight, 0)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              {scheduledAt && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center text-green-800">
                    <Calendar size={18} className="mr-2 text-green-600" />
                    Jadwal Penjemputan
                  </h3>
                  <p className="text-green-700 mt-1">
                    {new Date(scheduledAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800">Catatan</h3>
                  <p className="text-green-700 mt-1">{description}</p>
                </div>
              )}

              {/* Selected TPS Summary */}
              {selectedTps && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold flex items-center text-blue-800">
                    <Building2 size={18} className="mr-2 text-blue-600" />
                    TPS Penjemput
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-blue-700 font-medium">{selectedTps.tpsProfile?.tpsName}</p>
                    <p className="text-sm text-blue-600">📍 {selectedTps.tpsProfile?.address}</p>
                    <p className="text-sm text-blue-600">📏 Jarak: {selectedTps.distance.toFixed(1)} km</p>
                    <p className={`text-sm font-medium ${selectedTps.priceModifier.color}`}>
                      💰 {selectedTps.priceModifier.label}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Permintaan</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
