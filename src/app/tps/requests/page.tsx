'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPin, Phone, User, Check, X, Truck, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface WasteItem {
  id: string
  wasteType: string
  estimatedWeight: number
}

interface PickupRequest {
  id: string
  status: string
  address: string
  latitude: number
  longitude: number
  description?: string
  photos: string[]
  createdAt: string
  scheduledAt?: string
  user: {
    id: string
    name: string
    phone?: string
  }
  wasteItems: WasteItem[]
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
    }
  }, [session, filter])

  const fetchPickups = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)
      
      const res = await fetch(`/api/pickups?${params}`)
      const data = await res.json()
      setPickups(data.data || [])
    } catch (error) {
      console.error('Error fetching pickups:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
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

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Permintaan Penjemputan</h1>
        <p className="text-gray-600 mt-2">
          Kelola permintaan penjemputan sampah dari masyarakat
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'PENDING', label: 'Menunggu', color: 'yellow' },
            { value: 'ACCEPTED', label: 'Diterima', color: 'blue' },
            { value: 'ON_THE_WAY', label: 'Dalam Perjalanan', color: 'purple' },
            { value: 'PICKED_UP', label: 'Dijemput', color: 'indigo' },
            { value: 'COMPLETED', label: 'Selesai', color: 'green' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full transition ${
                filter === tab.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold">{pickup.user.name}</p>
                    {pickup.user.phone && (
                      <a
                        href={`tel:${pickup.user.phone}`}
                        className="text-sm text-gray-500 hover:text-green-600 flex items-center"
                      >
                        <Phone size={14} className="mr-1" />
                        {pickup.user.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 mb-4">
                <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 text-sm">{pickup.address}</p>
              </div>

              {/* Waste Items */}
              <div className="flex flex-wrap gap-2 mb-4">
                {pickup.wasteItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs"
                  >
                    {WASTE_TYPE_LABELS[item.wasteType]?.icon}{' '}
                    {WASTE_TYPE_LABELS[item.wasteType]?.label} ({item.estimatedWeight}kg)
                  </span>
                ))}
              </div>

              {/* Photos */}
              {pickup.photos.length > 0 && (
                <div className="flex space-x-2 mb-4 overflow-x-auto">
                  {pickup.photos.slice(0, 3).map((photo, i) => (
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
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Truck size={18} className="mr-2" />
                      Berangkat
                    </button>
                    <button
                      onClick={() => openGoogleMaps(pickup.latitude, pickup.longitude)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    >
                      <MapPin size={18} className="mr-1" />
                      Navigasi
                    </button>
                  </>
                )}

                {pickup.status === 'ON_THE_WAY' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(pickup.id, 'PICKED_UP')}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Check size={18} className="mr-2" />
                      Sudah Dijemput
                    </button>
                    <button
                      onClick={() => openGoogleMaps(pickup.latitude, pickup.longitude)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                    >
                      <MapPin size={18} />
                    </button>
                  </>
                )}

                {pickup.status === 'PICKED_UP' && (
                  <Link
                    href={`/tps/transaction/${pickup.id}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Input Transaksi
                  </Link>
                )}

                <Link
                  href={`/pickup/${pickup.id}`}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Tidak Ada Permintaan
          </h3>
          <p className="text-gray-500">
            Belum ada permintaan penjemputan dengan status ini
          </p>
        </div>
      )}
    </div>
  )
}
