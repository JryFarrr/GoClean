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
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminStats {
  stats: {
    totalUsers: number
    totalTPS: number
    totalPickups: number
    pendingPickups: number
    completedPickups: number
    totalTransactions: number
    totalRevenue: number
  }
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
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (authStatus === 'authenticated' && session?.user.role !== 'ADMIN') {
      router.push('/dashboard')
      toast.error('Akses ditolak')
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Admin Dashboard</h1>
        <p className="text-green-700 mt-2">
          Pantau dan kelola seluruh aktivitas GoClean
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6">
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

        <div className="bg-green-50 rounded-xl p-6">
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

        <div className="bg-green-50 rounded-xl p-6">
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

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/users"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-center border border-green-100"
        >
          <Users className="mx-auto mb-2 text-green-600" size={32} />
          <p className="font-semibold text-green-800">Kelola Users</p>
        </Link>
        <Link
          href="/admin/tps"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-center border border-green-100"
        >
          <Truck className="mx-auto mb-2 text-green-600" size={32} />
          <p className="font-semibold text-green-800">Kelola TPS</p>
        </Link>
        <Link
          href="/admin/pickups"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-center border border-green-100"
        >
          <MapPin className="mx-auto mb-2 text-green-600" size={32} />
          <p className="font-semibold text-green-800">Penjemputan</p>
        </Link>
        <Link
          href="/admin/transactions"
          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-center border border-green-100"
        >
          <DollarSign className="mx-auto mb-2 text-green-600" size={32} />
          <p className="font-semibold text-green-800">Transaksi</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Pickups */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <h2 className="text-xl font-bold mb-4 text-green-800">Penjemputan Terbaru</h2>
          {data?.recentPickups && data.recentPickups.length > 0 ? (
            <div className="space-y-3">
              {data.recentPickups.map((pickup) => (
                <div
                  key={pickup.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-green-800">{pickup.user.name}</p>
                    <p className="text-sm text-green-700">
                      {new Date(pickup.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pickup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    pickup.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pickup.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-700 text-center py-4">Tidak ada data</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <h2 className="text-xl font-bold mb-4 text-green-800">Transaksi Terbaru</h2>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-green-800">{transaction.user.name}</p>
                    <p className="text-sm text-green-700">
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">
                    Rp {transaction.totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-700 text-center py-4">Tidak ada data</p>
          )}
        </div>
      </div>
    </div>
  )
}
