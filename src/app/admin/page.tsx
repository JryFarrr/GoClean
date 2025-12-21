'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  Trash2,
  Package,
  BarChart3,
  Award
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WasteStats {
  wasteType: string
  totalWeight: number
  count: number
}

interface TPSWasteStats {
  tpsName: string
  totalWeight: number
  totalRevenue: number
  pickupCount: number
  wasteTypes: Record<string, number>
}

interface AdminStats {
  stats: {
    totalUsers: number
    totalTPS: number
    totalPickups: number
    pendingPickups: number
    completedPickups: number
    totalTransactions: number
    totalRevenue: number
    totalWaste: number
  }
  wasteStats: WasteStats[]
  wasteByTPS: TPSWasteStats[]
  recentPickups: Array<{
    id: string
    status: string
    createdAt: string
    user: { name: string }
    tps?: { name: string }
  }>
  recentTransactions: Array<{
    id: string
    totalPrice: number
    createdAt: string
    user: { name: string }
  }>
}

export default function AdminDashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('Admin Dashboard - Auth Status:', authStatus)
    console.log('Admin Dashboard - Session:', session)
    console.log('Admin Dashboard - User Role:', session?.user?.role)
    
    if (authStatus === 'unauthenticated') {
      toast.error('Anda harus login terlebih dahulu')
      router.push('/admin/login')
    } else if (authStatus === 'authenticated' && session?.user.role !== 'ADMIN') {
      toast.error('Akses ditolak. Halaman ini khusus untuk admin.')
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user && session.user.role === 'ADMIN') {
      fetchAdminStats()
    }
  }, [session])

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const wasteTypeNames: Record<string, string> = {
    ORGANIC: 'Organik',
    PLASTIC: 'Plastik',
    PAPER: 'Kertas',
    METAL: 'Logam',
    GLASS: 'Kaca',
    ELECTRONIC: 'Elektronik',
    OTHER: 'Lainnya'
  }

  const wasteTypeColors: Record<string, string> = {
    ORGANIC: 'bg-green-500',
    PLASTIC: 'bg-blue-500',
    PAPER: 'bg-yellow-500',
    METAL: 'bg-gray-500',
    GLASS: 'bg-cyan-500',
    ELECTRONIC: 'bg-purple-500',
    OTHER: 'bg-orange-500'
  }

  const totalWasteWeight = data?.wasteStats?.reduce((sum, item) => sum + item.totalWeight, 0) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
        <p className="text-green-700 mt-2">
          Pantau dan kelola seluruh aktivitas GoClean
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-800">{data?.stats.totalUsers || 0}</p>
          <p className="text-green-700 text-sm">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <Truck className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-800">{data?.stats.totalTPS || 0}</p>
          <p className="text-green-700 text-sm">Total TPS</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-800">{data?.stats.totalPickups || 0}</p>
          <p className="text-green-700 text-sm">Total Penjemputan</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-800">
            Rp {(data?.stats.totalRevenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-green-700 text-sm">Total Pendapatan</p>
        </div>
      </div>

      {/* Waste Statistics - Highlight */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Statistik Perolehan Sampah</h2>
            <p className="text-green-100">Total sampah yang telah dikumpulkan di seluruh TPS</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{totalWasteWeight.toFixed(2)}</p>
            <p className="text-green-100">Kilogram</p>
          </div>
        </div>
        
        {/* Waste Type Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data?.wasteStats && data.wasteStats.length > 0 ? (
            data.wasteStats.map((waste) => (
              <div key={waste.wasteType} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className={`w-12 h-12 ${wasteTypeColors[waste.wasteType] || 'bg-gray-500'} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <Trash2 size={24} className="text-white" />
                </div>
                <p className="text-sm font-medium mb-1 text-green-900">{wasteTypeNames[waste.wasteType] || waste.wasteType}</p>
                <p className="text-2xl font-bold text-green-900">{waste.totalWeight.toFixed(1)}</p>
                <p className="text-xs text-green-800">kg ({waste.count} items)</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-green-100">
              Belum ada data sampah
            </div>
          )}
        </div>
      </div>

      {/* Pickup Status */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <Clock className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-800">
                {data?.stats.pendingPickups || 0}
              </p>
              <p className="text-green-700">Menunggu Penjemputan</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-800">
                {data?.stats.completedPickups || 0}
              </p>
              <p className="text-green-700">Selesai</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-green-800">
                {data?.stats.totalTransactions || 0}
              </p>
              <p className="text-green-700">Total Transaksi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top TPS Performance */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-green-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Award className="text-green-600" size={28} />
            <h2 className="text-xl font-bold text-green-800">🏆 Top 10 TPS - Performa Terbaik</h2>
          </div>
          <BarChart3 className="text-green-600" size={24} />
        </div>

        {data?.wasteByTPS && data.wasteByTPS.length > 0 ? (
          <div className="space-y-4">
            {data.wasteByTPS.map((tps, index) => (
              <div key={index} className="border border-green-100 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 
                      'bg-green-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-green-800">{tps.tpsName}</p>
                      <p className="text-sm text-green-700">{tps.pickupCount} penjemputan selesai</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">{tps.totalWeight.toFixed(1)} kg</p>
                    <p className="text-sm text-green-600">Rp {tps.totalRevenue.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                {/* Waste breakdown */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tps.wasteTypes).map(([type, weight]) => (
                    <span key={type} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {wasteTypeNames[type]}: {(weight as number).toFixed(1)} kg
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-green-700">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>Belum ada data performa TPS</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/users"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-md hover:shadow-lg transition text-center text-white transform hover:scale-105"
        >
          <Users className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Kelola Users</p>
          <p className="text-xs mt-1 opacity-90">{data?.stats.totalUsers || 0} users</p>
        </Link>
        <Link
          href="/admin/pickups"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-md hover:shadow-lg transition text-center text-white transform hover:scale-105"
        >
          <MapPin className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Penjemputan</p>
          <p className="text-xs mt-1 opacity-90">{data?.stats.totalPickups || 0} pickups</p>
        </Link>
        <Link
          href="/transactions"
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-md hover:shadow-lg transition text-center text-white transform hover:scale-105"
        >
          <DollarSign className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Transaksi</p>
          <p className="text-xs mt-1 opacity-90">{data?.stats.totalTransactions || 0} transaksi</p>
        </Link>
        <Link
          href="/admin/tps"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-md hover:shadow-lg transition text-center text-white transform hover:scale-105"
        >
          <Truck className="mx-auto mb-2" size={32} />
          <p className="font-semibold">Daftar TPS</p>
          <p className="text-xs mt-1 opacity-90">{data?.stats.totalTPS || 0} TPS terdaftar</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Pickups */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-800">🚚 Penjemputan Terbaru</h2>
            <Link href="/pickup" className="text-sm text-green-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          {data?.recentPickups && data.recentPickups.length > 0 ? (
            <div className="space-y-3">
              {data.recentPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{pickup.user.name}</p>
                    <p className="text-xs text-green-600">
                      {pickup.tps?.name || 'Belum ditugaskan'}
                    </p>
                    <p className="text-xs text-green-700">
                      {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    pickup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    pickup.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                    pickup.status === 'ON_THE_WAY' ? 'bg-purple-100 text-purple-800' :
                    pickup.status === 'PICKED_UP' ? 'bg-orange-100 text-orange-800' :
                    pickup.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pickup.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-green-700">
              <MapPin size={48} className="mx-auto mb-2 opacity-50" />
              <p>Tidak ada penjemputan terbaru</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-800">💰 Transaksi Terbaru</h2>
            <Link href="/transactions" className="text-sm text-green-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{transaction.user.name}</p>
                    <p className="text-xs text-green-700">
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">
                      Rp {transaction.totalPrice.toLocaleString('id-ID')}
                    </span>
                    <p className="text-xs text-green-700">✓ Dibayar</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-green-700">
              <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
              <p>Tidak ada transaksi terbaru</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
