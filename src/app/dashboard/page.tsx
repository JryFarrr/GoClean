'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'

interface DashboardStats {
  pendingPickups: number
  completedPickups: number
  totalEarnings: number
  recentPickups: Array<{
    id: string
    status: string
    address: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchDashboardData()
    }
  }, [status, session])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/pickups?limit=5')
      const data = await res.json()
      
      const pending = data.data?.filter((p: { status: string }) => p.status === 'PENDING').length || 0
      const completed = data.data?.filter((p: { status: string }) => p.status === 'COMPLETED').length || 0
      
      setStats({
        pendingPickups: pending,
        completedPickups: completed,
        totalEarnings: 0,
        recentPickups: data.data || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const role = session.user.role

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Selamat Datang, {session.user.name}! 👋
        </h1>
        <p className="text-green-100">
          {role === 'USER' && 'Kelola sampah Anda dengan mudah dan dapatkan penghasilan tambahan'}
          {role === 'TPS' && 'Kelola permintaan penjemputan dan transaksi sampah'}
          {role === 'ADMIN' && 'Pantau dan kelola seluruh aktivitas GoClean'}
        </p>
      </div>

      {/* Quick Actions */}
      {role === 'USER' && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/pickup/new"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-green-500"
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <Plus size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Jemput Sampah</h3>
              <p className="text-gray-500 text-sm">Buat permintaan penjemputan</p>
            </div>
          </Link>

          <Link
            href="/pickup/history"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-blue-500"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Riwayat</h3>
              <p className="text-gray-500 text-sm">Lihat riwayat penjemputan</p>
            </div>
          </Link>

          <Link
            href="/transactions"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-yellow-500"
          >
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign size={28} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Transaksi</h3>
              <p className="text-gray-500 text-sm">Lihat transaksi penjualan</p>
            </div>
          </Link>
        </div>
      )}

      {role === 'TPS' && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/tps/requests"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-green-500"
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <Truck size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Permintaan Baru</h3>
              <p className="text-gray-500 text-sm">Lihat permintaan penjemputan</p>
            </div>
          </Link>

          <Link
            href="/tps/map"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-blue-500"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Peta Lokasi</h3>
              <p className="text-gray-500 text-sm">Lihat lokasi penjemputan</p>
            </div>
          </Link>

          <Link
            href="/tps/transactions"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-yellow-500"
          >
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
              <DollarSign size={28} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Transaksi</h3>
              <p className="text-gray-500 text-sm">Kelola transaksi</p>
            </div>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="text-yellow-500" size={24} />
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-3xl font-bold">{stats?.pendingPickups || 0}</p>
          <p className="text-gray-500 text-sm">Menunggu dijemput</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <Truck className="text-blue-500" size={24} />
            <span className="text-sm text-gray-500">Dalam Proses</span>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-gray-500 text-sm">Sedang dijemput</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-sm text-gray-500">Selesai</span>
          </div>
          <p className="text-3xl font-bold">{stats?.completedPickups || 0}</p>
          <p className="text-gray-500 text-sm">Total penjemputan</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-yellow-500" size={24} />
            <span className="text-sm text-gray-500">Penghasilan</span>
          </div>
          <p className="text-3xl font-bold">
            Rp {(stats?.totalEarnings || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-gray-500 text-sm">Total pendapatan</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
          <Link
            href={role === 'USER' ? '/pickup/history' : '/tps/requests'}
            className="text-green-600 hover:underline flex items-center space-x-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {stats?.recentPickups && stats.recentPickups.length > 0 ? (
          <div className="space-y-4">
            {stats.recentPickups.map((pickup) => (
              <div
                key={pickup.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    pickup.status === 'PENDING' ? 'bg-yellow-500' :
                    pickup.status === 'ACCEPTED' ? 'bg-blue-500' :
                    pickup.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium">{pickup.address}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  pickup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  pickup.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                  pickup.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {pickup.status === 'PENDING' && 'Menunggu'}
                  {pickup.status === 'ACCEPTED' && 'Diterima'}
                  {pickup.status === 'ON_THE_WAY' && 'Dalam Perjalanan'}
                  {pickup.status === 'PICKED_UP' && 'Dijemput'}
                  {pickup.status === 'COMPLETED' && 'Selesai'}
                  {pickup.status === 'CANCELLED' && 'Dibatalkan'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Truck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Belum ada aktivitas</p>
            {role === 'USER' && (
              <Link
                href="/pickup/new"
                className="inline-block mt-4 text-green-600 hover:underline"
              >
                Buat permintaan penjemputan pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
