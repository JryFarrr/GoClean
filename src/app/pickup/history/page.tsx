'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPin, Calendar, ArrowLeft, Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseJsonArray } from '@/lib/utils'

interface WasteItem {
  id: string
  wasteType: string
  estimatedWeight: number
  actualWeight?: number
  price?: number
}

interface PickupRequest {
  id: string
  status: string
  address: string
  description?: string
  photos: string[]
  videos: string[]
  createdAt: string
  scheduledAt?: string
  wasteItems: WasteItem[]
  tps?: {
    name: string
    tpsProfile?: {
      tpsName: string
    }
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Diterima', color: 'bg-green-100 text-green-800' },
  ON_THE_WAY: { label: 'Dalam Perjalanan', color: 'bg-green-100 text-green-700' },
  PICKED_UP: { label: 'Dijemput', color: 'bg-green-200 text-green-800' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
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

export default function PickupHistoryPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [pickups, setPickups] = useState<PickupRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchPickups()
    }
  }, [session, selectedStatus])

  const fetchPickups = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedStatus) params.append('status', selectedStatus)
      
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

  const handleCancel = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan permintaan ini?')) return

    try {
      const res = await fetch(`/api/pickups/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      toast.success('Permintaan berhasil dibatalkan')
      fetchPickups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membatalkan')
    }
  }

  if (authStatus === 'loading' || isLoading) {
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
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-green-700 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Riwayat Penjemputan</h1>
            <p className="text-green-700 mt-2">
              Lihat semua permintaan penjemputan sampah Anda
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-green-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-full transition ${
              selectedStatus === ''
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Semua
          </button>
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setSelectedStatus(key)}
              className={`px-4 py-2 rounded-full transition ${
                selectedStatus === key
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pickup List */}
      {pickups.length > 0 ? (
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-green-100"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${STATUS_LABELS[pickup.status]?.color || 'bg-gray-100'}`}>
                      {STATUS_LABELS[pickup.status]?.label || pickup.status}
                    </span>
                    <span className="text-sm text-green-600">
                      {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex items-start space-x-2">
                    <MapPin size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">{pickup.address}</p>
                  </div>

                  {pickup.scheduledAt && (
                    <div className="mt-2 flex items-center space-x-2">
                      <Calendar size={18} className="text-green-500" />
                      <p className="text-sm text-green-700">
                        Dijadwalkan:{' '}
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

                  {/* Waste Items */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pickup.wasteItems.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full text-sm"
                      >
                        <span className="mr-1">
                          {WASTE_TYPE_LABELS[item.wasteType]?.icon || '📦'}
                        </span>
                        {WASTE_TYPE_LABELS[item.wasteType]?.label || item.wasteType}
                        <span className="ml-1 text-green-600">
                          ({item.estimatedWeight} kg)
                        </span>
                      </span>
                    ))}
                  </div>

                  {pickup.tps && (
                    <div className="mt-4 text-sm text-green-700">
                      <span className="font-medium">TPS:</span>{' '}
                      {pickup.tps.tpsProfile?.tpsName || pickup.tps.name}
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="mt-4 md:mt-0 md:ml-6 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                  <Link
                    href={`/pickup/${pickup.id}`}
                    className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    <Eye size={18} className="mr-2" />
                    Detail
                  </Link>
                  {pickup.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(pickup.id)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 size={18} className="mr-2" />
                      Batalkan
                    </button>
                  )}
                </div>
              </div>

              {/* Photos Preview */}
              {parseJsonArray(pickup.photos).length > 0 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {parseJsonArray(pickup.photos).slice(0, 4).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                  {parseJsonArray(pickup.photos).length > 4 && (
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                      +{parseJsonArray(pickup.photos).length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-green-100">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Belum Ada Permintaan
          </h3>
          <p className="text-green-600">
            Anda belum membuat permintaan penjemputan sampah
          </p>
        </div>
      )}
    </div>
  )
}
