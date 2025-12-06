'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Loader2, MapPin, Calendar, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MediaUploader from '@/components/MediaUploader'
import WasteItemSelector from '@/components/WasteItemSelector'
import { useLocationStore } from '@/lib/store'

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLocation(lat, lng, addr)
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
            </p>
            
            <MapComponent
              selectable
              onLocationSelect={handleLocationSelect}
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
