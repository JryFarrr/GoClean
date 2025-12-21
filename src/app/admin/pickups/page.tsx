'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Truck, MapPin, Calendar, Phone, User, CheckCircle, Clock, XCircle } from 'lucide-react'

interface PickupRequest {
  id: number
  address: string
  scheduledDate: string
  status: string
  createdAt: string
  user: {
    name: string
    phone: string | null
  }
  tps: {
    name: string
  } | null
  wasteItems: {
    wasteType: string
    estimatedWeight: number
  }[]
}

export default function AdminPickupsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pickups, setPickups] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchPickups()
  }, [session, status, router])

  const fetchPickups = async () => {
    try {
      const res = await fetch('/api/pickups')
      const data = await res.json()
      setPickups(Array.isArray(data.data) ? data.data : [])
    } catch (error) {
      console.error('Error fetching pickups:', error)
      setPickups([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600">Memuat data penjemputan...</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Menunggu', icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
      ASSIGNED: { label: 'Ditugaskan', icon: Truck, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      IN_PROGRESS: { label: 'Dalam Proses', icon: Truck, bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
      COMPLETED: { label: 'Selesai', icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
      CANCELLED: { label: 'Dibatalkan', icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
        <Icon size={14} />
        <span>{config.label}</span>
      </span>
    )
  }

  const filteredPickups = filter === 'all' 
    ? pickups 
    : pickups.filter(p => p.status === filter)

  const stats = {
    total: Array.isArray(pickups) ? pickups.length : 0,
    pending: Array.isArray(pickups) ? pickups.filter(p => p.status === 'PENDING').length : 0,
    completed: Array.isArray(pickups) ? pickups.filter(p => p.status === 'COMPLETED').length : 0,
    cancelled: Array.isArray(pickups) ? pickups.filter(p => p.status === 'CANCELLED').length : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">🚚 Manajemen Penjemputan</h1>
          <p className="text-green-600">Kelola semua permintaan penjemputan sampah</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-600">
            <p className="text-sm text-gray-600">Total Penjemputan</p>
            <p className="text-2xl font-bold text-green-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-600">
            <p className="text-sm text-gray-600">Menunggu</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-600">
            <p className="text-sm text-gray-600">Selesai</p>
            <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-600">
            <p className="text-sm text-gray-600">Dibatalkan</p>
            <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua ({Array.isArray(pickups) ? pickups.length : 0})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'PENDING' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Menunggu ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'COMPLETED' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Selesai ({stats.completed})
            </button>
            <button
              onClick={() => setFilter('CANCELLED')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'CANCELLED' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dibatalkan ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Pickups List */}
        <div className="space-y-4">
          {filteredPickups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Truck className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-500 text-lg">Tidak ada data penjemputan</p>
            </div>
          ) : (
            filteredPickups.map((pickup) => (
              <div key={pickup.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-green-800">Penjemputan #{pickup.id}</h3>
                      {getStatusBadge(pickup.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-green-600" />
                        <span>{pickup.user.name}</span>
                        {pickup.user.phone && (
                          <>
                            <Phone size={16} className="text-green-600 ml-2" />
                            <span>{pickup.user.phone}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-green-600" />
                        <span>{pickup.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-green-600" />
                        <span>
                          {new Date(pickup.scheduledDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {pickup.tps && (
                        <div className="flex items-center space-x-2">
                          <Truck size={16} className="text-green-600" />
                          <span>TPS: {pickup.tps.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Waste Items */}
                {pickup.wasteItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Jenis Sampah:</p>
                    <div className="flex flex-wrap gap-2">
                      {pickup.wasteItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                        >
                          {item.wasteType}: {item.estimatedWeight} kg
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Dibuat: {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
