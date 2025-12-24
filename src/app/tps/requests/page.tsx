'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPin, Phone, User, Check, X, Truck, Eye, AlertCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseJsonArray } from '@/lib/utils'

interface WasteItem {
  id: string
  wasteType: string
  estimatedWeight: number
}

interface TPSLocationData {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
}

interface PickupRequest {
  id: string
  status: string
  type: string // PICKUP or DROP_OFF
  address: string
  latitude: number
  longitude: number
  description?: string
  photos: string[]
  createdAt: string
  scheduledAt?: string
  tpsId?: string
  selectedTPS?: TPSLocationData
  tps?: {
    id: string
    name: string
    phone?: string
    tpsProfile?: {
      tpsName: string
      address: string
      phone?: string
    }
  }
  user: {
    id: string
    name: string
    phone?: string
  }
  wasteItems: WasteItem[]
  transaction?: {
    id: string
    isPaid: boolean
    totalPrice: number
  }
}

const WASTE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  ORGANIC: { label: 'Organik', icon: '🥬' },
  PLASTIC: { label: 'Plastik', icon: '♻️' },
  PAPER: { label: 'Kertas', icon: '📄' },
  METAL: { label: 'Logam', icon: '🔧' },
  GLASS: { label: 'Kaca', icon: '🪟' },
  ELECTRONIC: { label: 'Elektronik', icon: '📱' },
  OTHER: { label: 'Lainnya', icon: '📦' }
}

export default function TPSRequestsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [pickups, setPickups] = useState<PickupRequest[]>([])
  const [tpsLocations, setTpsLocations] = useState<TPSLocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (authStatus === 'authenticated' && session?.user.role !== 'TPS') {
      router.push('/dashboard')
      toast.error('Akses ditolak')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user && session.user.role === 'TPS') {
      fetchPickups()
      fetchTPSLocations()
    }
  }, [session, filter])

  const fetchTPSLocations = async () => {
    try {
      const res = await fetch('/api/tps-locations')
      const data = await res.json()
      if (res.ok && data.data) {
        setTpsLocations(data.data)
      }
    } catch (error) {
      console.error('Error fetching TPS locations:', error)
    }
  }

  const fetchPickups = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const res = await fetch(`/api/pickups?${params}`)
      const data = await res.json()

      // Map pickup data to include selectedTPS if tpsId exists
      const mappedPickups = (data.data || []).map((pickup: any) => {
        let selectedTPS: TPSLocationData | null = null

        if (pickup.tpsId && pickup.tps?.tpsProfile) {
          selectedTPS = {
            id: pickup.tps.id,
            name: pickup.tps.tpsProfile.tpsName || pickup.tps.name,
            address: pickup.tps.tpsProfile.address,
            latitude: pickup.tps.tpsProfile.latitude,
            longitude: pickup.tps.tpsProfile.longitude,
            operatingHours: pickup.tps.tpsProfile.operatingHours,
            phone: pickup.tps.tpsProfile.phone
          }
        }

        return {
          ...pickup,
          selectedTPS
        }
      })

      setPickups(mappedPickups)
    } catch (error) {
      console.error('Error fetching pickups:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get nearest TPS from pickup location
  const getNearestTPS = (pickupLat: number, pickupLng: number): TPSLocationData | null => {
    if (tpsLocations.length === 0) return null

    let nearest: TPSLocationData | null = null
    let minDistance = Infinity

    tpsLocations.forEach(tps => {
      const distance = calculateDistance(pickupLat, pickupLng, tps.latitude, tps.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearest = tps
      }
    })

    return nearest
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/pickups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      toast.success(
        newStatus === 'ACCEPTED' ? 'Permintaan diterima!' :
          newStatus === 'ON_THE_WAY' ? 'Status diperbarui!' :
            'Status diperbarui!'
      )
      fetchPickups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui status')
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
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Permintaan</h1>
        <p className="text-green-700 mt-2">
          Kelola permintaan sampah dari masyarakat
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-green-100">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'PENDING', label: 'Menunggu', color: 'green' },
            { value: 'ACCEPTED', label: 'Diterima', color: 'green' },
            { value: 'ON_THE_WAY', label: 'Dalam Perjalanan', color: 'green' },
            { value: 'PICKED_UP', label: 'Dijemput', color: 'green' },
            { value: 'COMPLETED', label: 'Selesai', color: 'green' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full transition ${filter === tab.value
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      {pickups.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {pickups.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-green-100"
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{pickup.user.name}</p>
                    {pickup.user.phone && (
                      <a
                        href={`tel:${pickup.user.phone}`}
                        className="text-sm text-green-700 hover:text-green-600 flex items-center"
                      >
                        <Phone size={14} className="mr-1" />
                        {pickup.user.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-sm text-green-600">
                  {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>

              {/* Service Type Badge */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pickup.type === 'DROP_OFF'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                  {pickup.type === 'DROP_OFF' ? '🚚 Antar ke TPS' : '🛵 Minta Jemput'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 mb-4">
                <MapPin size={18} className="text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-green-700 text-sm font-medium">
                    {pickup.type === 'DROP_OFF' ? '📍 Lokasi Pengantaran' : '📍 Lokasi Pengambilan Sampah'}
                  </p>
                  <p className="text-green-700 text-sm mt-1">{pickup.address}</p>
                </div>
              </div>

              {/* TPS Selection Info - Always show recommended TPS for TPS role */}
              {(() => {
                const nearestTPS = getNearestTPS(pickup.latitude, pickup.longitude)
                const distance = nearestTPS ? calculateDistance(pickup.latitude, pickup.longitude, nearestTPS.latitude, nearestTPS.longitude) : 0

                return nearestTPS ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                      <Check size={16} className="mr-2 text-green-600" />
                      TPS Terpilih
                    </p>
                    <p className="text-sm text-green-700 font-medium">{nearestTPS.name}</p>
                    <p className="text-xs text-green-600 mt-1">{nearestTPS.address}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <strong>Jarak:</strong> {distance.toFixed(2)} km
                    </p>
                    {nearestTPS.operatingHours && (
                      <p className="text-xs text-green-600 mt-1">⏰ {nearestTPS.operatingHours}</p>
                    )}

                    {/* Show which TPS confirmed if status is not PENDING */}
                    {pickup.status !== 'PENDING' && pickup.tpsId && pickup.tps && (
                      <div className="mt-3 pt-3 border-t border-green-300">
                        <p className="text-xs font-semibold text-green-800 mb-1">✓ Dikonfirmasi oleh:</p>
                        <p className="text-xs text-green-700 font-medium">
                          {pickup.tps.tpsProfile?.tpsName || pickup.tps.name}
                        </p>
                        {pickup.tps.tpsProfile?.address && (
                          <p className="text-xs text-green-600 mt-0.5">{pickup.tps.tpsProfile.address}</p>
                        )}
                        {pickup.tps.tpsProfile?.phone && (
                          <p className="text-xs text-green-600 mt-0.5">📞 {pickup.tps.tpsProfile.phone}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null
              })()}

              {/* Transaction Status */}
              {pickup.transaction && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-1">
                    💰 Transaksi: <span className="font-semibold">Rp {pickup.transaction.totalPrice.toLocaleString('id-ID')}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${pickup.transaction.isPaid
                      ? 'bg-green-200 text-green-800'
                      : 'bg-orange-200 text-orange-800'
                      }`}>
                      {pickup.transaction.isPaid ? '✓ Pembayaran Terverifikasi' : '⏳ Menunggu Verifikasi User'}
                    </span>
                  </div>
                </div>
              )}

              {/* Waste Items */}
              <div className="flex flex-wrap gap-2 mb-4">
                {pickup.wasteItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center px-2 py-1 bg-green-50 rounded text-xs text-green-700"
                  >
                    {WASTE_TYPE_LABELS[item.wasteType]?.icon}{' '}
                    {WASTE_TYPE_LABELS[item.wasteType]?.label} ({item.estimatedWeight}kg)
                  </span>
                ))}
              </div>

              {/* Photos */}
              {parseJsonArray(pickup.photos).length > 0 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {parseJsonArray(pickup.photos).slice(0, 3).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {pickup.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'ACCEPTED')}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check size={18} className="mr-2" />
                      Terima
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'CANCELLED')}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <X size={18} />
                    </button>
                  </>
                )}

                {pickup.status === 'ACCEPTED' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'ON_THE_WAY')}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Truck size={18} className="mr-2" />
                      {pickup.type === 'DROP_OFF' ? 'Menunggu Kedatangan' : 'Berangkat Jemput'}
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'PENDING')}
                      className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                      title="Kembalikan ke Menunggu"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </>
                )}

                {pickup.status === 'ON_THE_WAY' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'PICKED_UP')}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check size={18} className="mr-2" />
                      Sudah Sampai di Lokasi
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'ACCEPTED')}
                      className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                      title="Kembalikan ke Diterima"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </>
                )}

                {pickup.status === 'PICKED_UP' && (
                  <>
                    {!pickup.transaction ? (
                      <>
                        <Link
                          href={`/tps/transaction/${pickup.id}`}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Input Transaksi & Bayar
                        </Link>
                        <button
                          onClick={() => handleStatusUpdate(pickup.id, 'ON_THE_WAY')}
                          className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition"
                          title="Kembalikan ke Dalam Perjalanan"
                        >
                          <ArrowLeft size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="text-blue-700 font-medium text-sm">💰 Menunggu verifikasi user</p>
                      </div>
                    )}
                  </>
                )}

                <Link
                  href={`/pickup/${pickup.id}`}
                  className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-green-100">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Tidak Ada Permintaan
          </h3>
          <p className="text-green-600">
            Belum ada permintaan penjemputan dengan status ini
          </p>
        </div>
      )}
    </div>
  )
}
