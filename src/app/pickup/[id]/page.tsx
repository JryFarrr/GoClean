'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Loader2, 
  ArrowLeft, 
  MapPin,
  Phone,
  Calendar,
  Package,
  Image as ImageIcon,
  Building2,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { parseJsonArray } from '@/lib/utils'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

interface PickupDetail {
  id: string
  status: string
  address: string
  latitude: number
  longitude: number
  description?: string
  scheduledAt?: string
  createdAt: string
  photos: string | string[]
  videos: string | string[]
  tps?: {
    id: string
    name: string
    phone?: string
    tpsProfile?: {
      tpsName: string
      address: string
    }
  }
  wasteItems: Array<{
    id: string
    wasteType: string
    estimatedWeight?: number
    actualWeight?: number
    price?: number
  }>
  transaction?: {
    totalWeight: number
    totalPrice: number
    isPaid: boolean
  }
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  ORGANIC: 'Organik',
  PLASTIC: 'Plastik',
  PAPER: 'Kertas',
  METAL: 'Logam',
  GLASS: 'Kaca',
  ELECTRONIC: 'Elektronik',
  OTHER: 'Lainnya'
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Menunggu', icon: Clock },
  { key: 'ACCEPTED', label: 'Diterima', icon: CheckCircle },
  { key: 'ON_THE_WAY', label: 'Dalam Perjalanan', icon: MapPin },
  { key: 'PICKED_UP', label: 'Dijemput', icon: Package },
  { key: 'COMPLETED', label: 'Selesai', icon: CheckCircle }
]

export default function PickupDetailUserPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const pickupId = params.id as string

  const [pickup, setPickup] = useState<PickupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user && pickupId) {
      fetchPickupDetail()
    }
  }, [session, pickupId])

  const fetchPickupDetail = async () => {
    try {
      const res = await fetch(`/api/pickups/${pickupId}`)
      const data = await res.json()
      
      if (data.data) {
        setPickup(data.data)
      } else {
        toast.error('Permintaan tidak ditemukan')
        router.push('/pickup/history')
      }
    } catch (error) {
      console.error('Error fetching pickup:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan permintaan ini?')) {
      return
    }

    setIsCancelling(true)
    try {
      const res = await fetch(`/api/pickups/${pickupId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Permintaan berhasil dibatalkan')
        router.push('/pickup/history')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Gagal membatalkan permintaan')
      }
    } catch (error) {
      console.error('Error cancelling pickup:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsCancelling(false)
    }
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (!session || !pickup) {
    return null
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === pickup.status)
  const isCancelled = pickup.status === 'CANCELLED'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/pickup/history"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Riwayat
        </Link>
        <h1 className="text-3xl font-bold">Detail Penjemputan</h1>
      </div>

      {/* Status Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="font-semibold text-lg mb-6">Status Penjemputan</h3>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
              <div
                className="h-full bg-green-500 rounded transition-all duration-500"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon
                
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <XCircle className="text-red-500" size={24} />
            <div>
              <p className="font-semibold text-red-800">Permintaan Dibatalkan</p>
              <p className="text-sm text-red-600">Permintaan penjemputan ini telah dibatalkan</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <MapPin className="mr-2 text-green-600" size={20} />
              Lokasi Penjemputan
            </h3>
            <p className="text-gray-700 mb-4">{pickup.address}</p>
            <div className="h-48 rounded-lg overflow-hidden">
              <MapComponent
                center={[pickup.latitude, pickup.longitude]}
                zoom={15}
                markers={[{
                  id: pickup.id,
                  lat: pickup.latitude,
                  lng: pickup.longitude,
                  title: pickup.address,
                  type: 'pickup'
                }]}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Calendar className="mr-2 text-green-600" size={20} />
              Jadwal
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Tanggal Permintaan</p>
                <p className="font-medium">
                  {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {pickup.scheduledAt && (
                <div>
                  <p className="text-sm text-gray-500">Jadwal Penjemputan</p>
                  <p className="font-medium">
                    {new Date(pickup.scheduledAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* TPS Info */}
          {pickup.tps && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Building2 className="mr-2 text-green-600" size={20} />
                TPS Penjemput
              </h3>
              <p className="font-medium text-gray-800">
                {pickup.tps.tpsProfile?.tpsName || pickup.tps.name}
              </p>
              {pickup.tps.tpsProfile?.address && (
                <p className="text-sm text-gray-500 mt-1">
                  {pickup.tps.tpsProfile.address}
                </p>
              )}
              {pickup.tps.phone && (
                <a
                  href={`tel:${pickup.tps.phone}`}
                  className="inline-flex items-center mt-3 text-green-600 hover:text-green-700"
                >
                  <Phone size={16} className="mr-2" />
                  {pickup.tps.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Waste Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Package className="mr-2 text-green-600" size={20} />
              Jenis Sampah
            </h3>
            <div className="space-y-3">
              {pickup.wasteItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">
                    {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                  </span>
                  <div className="text-right">
                    {item.actualWeight ? (
                      <>
                        <p className="font-semibold">{item.actualWeight} kg</p>
                        {item.price && (
                          <p className="text-sm text-green-600">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        )}
                      </>
                    ) : item.estimatedWeight ? (
                      <p className="text-gray-500">~{item.estimatedWeight} kg</p>
                    ) : (
                      <p className="text-gray-400">-</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction Summary */}
            {pickup.transaction && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Berat:</span>
                  <span className="font-semibold">{pickup.transaction.totalWeight} kg</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Harga:</span>
                  <span className="text-xl font-bold text-green-600">
                    Rp {pickup.transaction.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Status Pembayaran:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    pickup.transaction.isPaid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pickup.transaction.isPaid ? 'Sudah Dibayar' : 'Belum Dibayar'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Media */}
          {(parseJsonArray(pickup.photos).length > 0 || parseJsonArray(pickup.videos).length > 0) && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <ImageIcon className="mr-2 text-green-600" size={20} />
                Dokumentasi
              </h3>
              
              {parseJsonArray(pickup.photos).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Foto</p>
                  <div className="grid grid-cols-3 gap-2">
                    {parseJsonArray(pickup.photos).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {parseJsonArray(pickup.videos).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Video</p>
                  <div className="space-y-2">
                    {parseJsonArray(pickup.videos).map((video, i) => (
                      <video
                        key={i}
                        src={video}
                        controls
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {pickup.description && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-2">Catatan</h3>
              <p className="text-gray-700">{pickup.description}</p>
            </div>
          )}

          {/* Cancel Button */}
          {pickup.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 transition"
            >
              {isCancelling ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Membatalkan...
                </span>
              ) : (
                'Batalkan Permintaan'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
