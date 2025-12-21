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
  CheckCircle,
  Save,
  Image as ImageIcon,
  Video,
  User,
  DollarSign
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

interface WasteItem {
  id: string
  wasteType: string
  estimatedWeight?: number
  actualWeight?: number
  price?: number
}

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
  user: {
    id: string
    name: string
    phone?: string
    email: string
  }
  wasteItems: WasteItem[]
  transaction?: {
    totalWeight: number
    totalPrice: number
    isPaid: boolean
  }
}

interface WastePrice {
  wasteType: string
  pricePerKg: number
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Diterima', color: 'bg-blue-100 text-blue-800' },
  ON_THE_WAY: { label: 'Dalam Perjalanan', color: 'bg-purple-100 text-purple-800' },
  PICKED_UP: { label: 'Sudah Dijemput', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
}

export default function PickupDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const pickupId = params.id as string

  const [pickup, setPickup] = useState<PickupDetail | null>(null)
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [weightInputs, setWeightInputs] = useState<Record<string, number>>({})

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user && pickupId) {
      fetchPickupDetail()
      if (session.user.role === 'TPS') {
        fetchWastePrices()
      }
    }
  }, [session, pickupId])

  const fetchPickupDetail = async () => {
    try {
      const res = await fetch(`/api/pickups/${pickupId}`)
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.data) {
        setPickup(data.data)
        // Initialize weight inputs
        const weights: Record<string, number> = {}
        data.data.wasteItems.forEach((item: WasteItem) => {
          weights[item.id] = item.actualWeight || item.estimatedWeight || 0
        })
        setWeightInputs(weights)
      } else if (data.error) {
        toast.error(data.error)
        router.push('/tps/requests')
      } else {
        toast.error('Permintaan tidak ditemukan')
        router.push('/tps/requests')
      }
    } catch (error) {
      console.error('Error fetching pickup:', error)
      toast.error('Gagal memuat data')
      router.push('/tps/requests')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWastePrices = async () => {
    try {
      const res = await fetch('/api/tps/prices')
      const data = await res.json()
      setWastePrices(data.data || [])
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }

  const getPriceForType = (wasteType: string): number => {
    const price = wastePrices.find(p => p.wasteType === wasteType)
    return price?.pricePerKg || 0
  }

  const calculateTotalPrice = (): number => {
    if (!pickup) return 0
    return pickup.wasteItems.reduce((sum, item) => {
      const weight = weightInputs[item.id] || 0
      const pricePerKg = getPriceForType(item.wasteType)
      return sum + (weight * pricePerKg)
    }, 0)
  }

  const calculateTotalWeight = (): number => {
    return Object.values(weightInputs).reduce((sum, w) => sum + (w || 0), 0)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/pickups/${pickupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        toast.success('Status berhasil diupdate')
        fetchPickupDetail()
      } else {
        toast.error('Gagal mengupdate status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompletePickup = async () => {
    if (calculateTotalWeight() === 0) {
      toast.error('Masukkan berat sampah terlebih dahulu')
      return
    }

    setIsSaving(true)
    try {
      // Update waste items with actual weights
      const wasteItemUpdates = pickup!.wasteItems.map(item => ({
        id: item.id,
        actualWeight: weightInputs[item.id] || 0,
        price: (weightInputs[item.id] || 0) * getPriceForType(item.wasteType)
      }))

      const res = await fetch(`/api/pickups/${pickupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          wasteItems: wasteItemUpdates,
          totalWeight: calculateTotalWeight(),
          totalPrice: calculateTotalPrice()
        })
      })

      if (res.ok) {
        toast.success('Penjemputan selesai! Transaksi telah dibuat.')
        fetchPickupDetail()
      } else {
        toast.error('Gagal menyelesaikan penjemputan')
      }
    } catch (error) {
      console.error('Error completing pickup:', error)
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

  if (!session || !pickup) {
    return null
  }

  const isTPS = session.user.role === 'TPS'
  const canEdit = isTPS && !['COMPLETED', 'CANCELLED'].includes(pickup.status)
  const statusInfo = STATUS_LABELS[pickup.status] || STATUS_LABELS.PENDING

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={isTPS ? '/tps/requests' : '/pickup/history'}
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Detail Penjemputan</h1>
            <p className="text-gray-600 mt-2">
              ID: {pickup.id.slice(0, 8)}...
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{pickup.user.name}</h3>
                <p className="text-gray-500">{pickup.user.email}</p>
              </div>
            </div>
            {pickup.user.phone && (
              <a
                href={`tel:${pickup.user.phone}`}
                className="inline-flex items-center text-green-600 hover:text-green-700"
              >
                <Phone size={16} className="mr-2" />
                {pickup.user.phone}
              </a>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header dengan status */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color.includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                <h3 className="font-bold text-lg text-gray-800">{statusInfo.label}</h3>
              </div>
              <span className="text-sm font-medium text-gray-600">Total: 1 lokasi</span>
            </div>

            {/* Peta */}
            <div className="relative h-[500px]">
              <MapComponent
                center={[pickup.latitude, pickup.longitude]}
                zoom={15}
                markers={[{
                  id: pickup.id,
                  lat: pickup.latitude,
                  lng: pickup.longitude,
                  title: pickup.user.name,
                  address: pickup.address,
                  type: 'pickup'
                }]}
                highlightedMarkerId={pickup.id}
                className="h-full w-full"
              />
            </div>

            {/* Info detail di bawah peta */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-start space-x-3 mb-3">
                <MapPin className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">Alamat Lengkap</p>
                  <p className="text-gray-600 text-sm">{pickup.address}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  📍 {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pickup.latitude},${pickup.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin size={16} className="mr-2" />
                  Buka Navigasi
                </a>
              </div>
            </div>
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
                  <p className="text-sm text-gray-500 mb-2">Foto ({parseJsonArray(pickup.photos).length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {parseJsonArray(pickup.photos).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {parseJsonArray(pickup.videos).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Video ({parseJsonArray(pickup.videos).length})</p>
                  <div className="grid grid-cols-2 gap-2">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Waste Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Package className="mr-2 text-green-600" size={20} />
              Jenis Sampah
            </h3>
            <div className="space-y-4">
              {pickup.wasteItems.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">
                      {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                    </span>
                    {isTPS && (
                      <span className="text-sm text-gray-500">
                        Rp {getPriceForType(item.wasteType).toLocaleString('id-ID')}/kg
                      </span>
                    )}
                  </div>
                  
                  {item.estimatedWeight && (
                    <p className="text-sm text-gray-500 mb-2">
                      Estimasi: ~{item.estimatedWeight} kg
                    </p>
                  )}

                  {canEdit ? (
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Berat Aktual (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={weightInputs[item.id] || ''}
                        onChange={(e) => setWeightInputs(prev => ({
                          ...prev,
                          [item.id]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                      {weightInputs[item.id] > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          = Rp {(weightInputs[item.id] * getPriceForType(item.wasteType)).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  ) : pickup.status === 'COMPLETED' && item.actualWeight ? (
                    <div className="text-sm">
                      <p>Berat: {item.actualWeight} kg</p>
                      {item.price && (
                        <p className="text-green-600">
                          Harga: Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Total */}
            {(canEdit || pickup.transaction) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Berat:</span>
                  <span className="font-semibold">
                    {canEdit ? calculateTotalWeight() : pickup.transaction?.totalWeight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Harga:</span>
                  <span className="text-xl font-bold text-green-600">
                    Rp {(canEdit ? calculateTotalPrice() : pickup.transaction?.totalPrice || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Calendar className="mr-2 text-green-600" size={20} />
              Jadwal
            </h3>
            <p className="text-sm text-gray-500">Dibuat:</p>
            <p className="font-medium mb-2">
              {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {pickup.scheduledAt && (
              <>
                <p className="text-sm text-gray-500">Jadwal Penjemputan:</p>
                <p className="font-medium">
                  {new Date(pickup.scheduledAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          {isTPS && canEdit && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Update Status</h3>
              <div className="space-y-3">
                {pickup.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    Terima Permintaan
                  </button>
                )}
                {pickup.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('ON_THE_WAY')}
                    disabled={isSaving}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                  >
                    Dalam Perjalanan
                  </button>
                )}
                {pickup.status === 'ON_THE_WAY' && (
                  <button
                    onClick={() => handleUpdateStatus('PICKED_UP')}
                    disabled={isSaving}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    Sampah Sudah Dijemput
                  </button>
                )}
                {pickup.status === 'PICKED_UP' && (
                  <button
                    onClick={handleCompletePickup}
                    disabled={isSaving || calculateTotalWeight() === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center"
                  >
                    {isSaving ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : (
                      <CheckCircle size={20} className="mr-2" />
                    )}
                    Selesaikan & Buat Transaksi
                  </button>
                )}
                {['PENDING', 'ACCEPTED'].includes(pickup.status) && (
                  <button
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    disabled={isSaving}
                    className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 transition"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {pickup.transaction && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="text-green-600" size={24} />
                <h3 className="font-semibold text-lg text-green-800">Transaksi</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Berat:</span>
                  <span className="font-medium">{pickup.transaction.totalWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Total Harga:</span>
                  <span className="font-bold text-green-800">
                    Rp {pickup.transaction.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="text-green-700">Status Pembayaran:</span>
                  <span className={`font-medium ${pickup.transaction.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {pickup.transaction.isPaid ? 'Sudah Dibayar' : 'Belum Dibayar'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
