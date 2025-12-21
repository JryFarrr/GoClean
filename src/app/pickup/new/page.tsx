'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Loader2, MapPin, Calendar, FileText, ArrowLeft, Search, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import MediaUploader from '@/components/MediaUploader'
import WasteItemSelector from '@/components/WasteItemSelector'
import { useLocationStore } from '@/lib/store'
import { SURABAYA_KECAMATAN } from '@/lib/surabayaKecamatan'

interface TPSLocation {
  id: string
  name: string
  kecamatan: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
  isActive: boolean
}

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

export default function NewPickupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { latitude, longitude, address, setLocation } = useLocationStore()
  
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // TPS selection states
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
  const [searchKecamatan, setSearchKecamatan] = useState('')
  const [tpsMarkers, setTpsMarkers] = useState<any[]>([])
  const [selectedTPS, setSelectedTPS] = useState<TPSLocation | null>(null)
  const [tpsLocations, setTpsLocations] = useState<TPSLocation[]>([])
  const [isLoadingTPS, setIsLoadingTPS] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch TPS locations from database
  useEffect(() => {
    const fetchTPSLocations = async () => {
      setIsLoadingTPS(true)
      try {
        const res = await fetch('/api/tps-locations')
        const data = await res.json()
        
        if (res.ok && data.data) {
          setTpsLocations(data.data)
          
          // Create markers for map
          const markers = data.data.map((tps: TPSLocation) => ({
            id: tps.id,
            lat: tps.latitude,
            lng: tps.longitude,
            title: tps.name,
            address: tps.address,
            type: 'tps' as const,
            kecamatan: tps.kecamatan,
            operatingHours: tps.operatingHours,
            phone: tps.phone
          }))
          setTpsMarkers(markers)
        } else {
          toast.error('Gagal memuat data TPS')
        }
      } catch (error) {
        console.error('Error fetching TPS locations:', error)
        toast.error('Terjadi kesalahan saat memuat data TPS')
      } finally {
        setIsLoadingTPS(false)
      }
    }

    fetchTPSLocations()
  }, [])

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLocation(lat, lng, addr)
    setSelectedTPS(null) // Clear TPS selection when custom location is selected
  }

  const handleTPSSelect = (tpsId: string, lat: number, lng: number, addr: string) => {
    const tps = tpsLocations.find(t => t.id === tpsId)
    if (tps) {
      setSelectedTPS(tps)
      setLocation(lat, lng, addr)
      toast.success(`TPS ${tps.name} dipilih`)
    }
  }

  const handleKecamatanSelect = (kecamatan: string) => {
    setSelectedKecamatan(kecamatan)
    const tpsInKecamatan = tpsLocations.filter(tps => tps.kecamatan === kecamatan)
    if (tpsInKecamatan.length > 0) {
      const firstTPS = tpsInKecamatan[0]
      setSelectedTPS(firstTPS)
      setLocation(firstTPS.latitude, firstTPS.longitude, firstTPS.address)
    }
  }

  const handleRemoveLocation = () => {
    setLocation(0, 0, '')
    setSelectedTPS(null)
    setSelectedKecamatan('')
    toast.success('Lokasi dihapus')
  }

  // Filter kecamatan dari SURABAYA_KECAMATAN yang memiliki TPS
  const kecamatanWithTPS = Array.from(new Set(tpsLocations.map(tps => tps.kecamatan)))
  const filteredKecamatan = SURABAYA_KECAMATAN.filter(k => 
    k.toLowerCase().includes(searchKecamatan.toLowerCase()) &&
    kecamatanWithTPS.includes(k)
  )

  // Helper function to get TPS by kecamatan
  const getTpsByKecamatan = (kecamatan: string) => {
    return tpsLocations.filter(tps => tps.kecamatan === kecamatan)
  }

  const handleSubmit = async () => {
    if (!latitude || !longitude || !address) {
      toast.error('Pilih TPS tujuan terlebih dahulu')
      return
    }

    if (wasteItems.length === 0) {
      toast.error('Pilih minimal satu jenis sampah')
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

      toast.success('Permintaan berhasil dikirim!')
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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/20 min-h-screen">
      {/* Modern Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Antar/Jemput Sampah
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Pilih untuk mengantarkan sampah ke TPS atau minta penjemputan
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: 'Pilih TPS' },
          { num: 2, label: 'Foto/Video' },
          { num: 3, label: 'Jenis Sampah' },
          { num: 4, label: 'Konfirmasi' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {s.num}
            </div>
            <span className={`ml-2 hidden sm:block ${step >= s.num ? 'text-green-600 font-medium' : 'text-green-600'}`}>
              {s.label}
            </span>
            {i < 3 && (
              <div className={`w-12 md:w-24 h-1 mx-2 ${step > s.num ? 'bg-green-600' : 'bg-green-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pilih TPS Terdekat atau Tentukan Lokasi Anda</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Anda bisa memilih TPS terdekat dari daftar, atau langsung menentukan lokasi Anda sendiri di peta.
            </p>
            
            {/* Layout Grid: Map + Sidebar */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Map Section - 2/3 width */}
              <div className="md:col-span-2">
                <MapComponent
                  selectable
                  onLocationSelect={handleLocationSelect}
                  onTPSSelect={handleTPSSelect}
                  onMarkerRemove={handleRemoveLocation}
                  markers={tpsMarkers}
                  showTPSMarkers
                  showRemoveButton={!!latitude && !!longitude}
                  currentLat={latitude}
                  currentLng={longitude}
                  selectedTPSId={selectedTPS?.id || ''}
                  className="h-[500px] w-full"
                />

                {address && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 relative">
                    <button
                      onClick={handleRemoveLocation}
                      className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition"
                      title="Hapus lokasi"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                    <p className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Lokasi Dipilih
                    </p>
                    <p className="text-gray-700 pr-8 mb-2">{address}</p>
                    {selectedTPS && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="font-medium text-green-800">TPS: {selectedTPS.name}</p>
                        <p className="text-sm text-green-600">Kecamatan: {selectedTPS.kecamatan}</p>
                        {selectedTPS.operatingHours && (
                          <p className="text-sm text-green-600">Jam Operasional: {selectedTPS.operatingHours}</p>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                      Koordinat: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar - 1/3 width */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg border border-gray-300 p-4 h-[500px] overflow-y-auto">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Daftar Kecamatan
                      </h3>
                      <p className="text-xs text-gray-500">
                        Jangkauan Sambangan Sampah
                      </p>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isLoadingTPS ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="animate-spin text-green-600" size={32} />
                    </div>
                  ) : (
                    <>
                      {/* Search Box */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Cari kecamatan..."
                          value={searchKecamatan}
                          onChange={(e) => setSearchKecamatan(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>

                  {/* Kecamatan List */}
                  <div className="space-y-2">
                    {filteredKecamatan.map((kec) => {
                      const tpsCount = getTpsByKecamatan(kec).length
                      const isSelected = selectedKecamatan === kec
                      const tpsList = getTpsByKecamatan(kec)
                      
                      return (
                        <div key={kec}>
                          <button
                            onClick={() => handleKecamatanSelect(kec)}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-green-500 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {kec}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                                {tpsCount} TPS tersedia
                              </p>
                            </div>
                            <ChevronRight 
                              size={16} 
                              className={`transition-transform ${isSelected ? 'text-white rotate-90' : 'text-gray-400'}`} 
                            />
                          </button>
                          
                          {/* TPS List - shown when kecamatan selected */}
                          {isSelected && (
                            <div className="ml-4 mt-2 space-y-1">
                              {tpsList.map((tps) => {
                                const isTPSSelected = selectedTPS?.id === tps.id
                                return (
                                  <button
                                    key={tps.id}
                                    onClick={() => handleTPSSelect(tps.id, tps.latitude, tps.longitude, tps.address)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                                      isTPSSelected
                                        ? 'bg-green-100 border-2 border-green-500'
                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                  >
                                    <p className={`font-medium ${isTPSSelected ? 'text-green-800' : 'text-gray-800'}`}>
                                      {tps.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {tps.address}
                                    </p>
                                    {tps.operatingHours && (
                                      <p className="text-xs text-green-600 mt-0.5">
                                        ⏰ {tps.operatingHours}
                                      </p>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {filteredKecamatan.length === 0 && !isLoadingTPS && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {searchKecamatan ? 'Kecamatan tidak ditemukan' : 'Belum ada TPS terdaftar'}
                    </p>
                  )}
                    </>
                  )}
                </div>
              </div>
            </div>

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
              Ambil foto atau video sampah Anda untuk membantu pihak TPS mengetahui jenis dan jumlah sampah yang akan diantarkan.
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
              Pilih jenis sampah dan perkiraan berat yang akan Anda antarkan ke TPS.
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
                Jadwal Pengantaran (Opsional)
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

        {/* Step 4: Confirmation */}
        {step === 4 && (
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
                  TPS Tujuan
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
                    Jadwal Pengantaran
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
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(3)}
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
