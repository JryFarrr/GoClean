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
  ArrowRight,
  Phone,
  MessageCircle,
  User as UserIcon,
  Edit,
  Package,
  BarChart3
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
  wasteStatistics?: {
    [key: string]: {
      count: number
      totalWeight: number
    }
  }
}

interface UserProfile {
  name: string
  email: string
  phone?: string
  whatsappNumber?: string
  gopayNumber?: string
  address?: string
}

interface TPSProfile {
  name: string
  email: string
  phone?: string
  whatsappNumber?: string
  gopayNumber?: string
  address?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [profile, setProfile] = useState<UserProfile | TPSProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.replace('/admin')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchDashboardData()
      fetchProfile()
    }
  }, [status, session])

  const fetchProfile = async () => {
    try {
      const endpoint = session?.user.role === 'TPS' ? '/api/tps/profile' : '/api/user/profile'
      const res = await fetch(endpoint)
      const data = await res.json()

      if (session?.user.role === 'TPS') {
        setProfile(data.profile ? {
          name: data.profile.name || session.user.name || '',
          email: session.user.email || '',
          phone: data.profile.phone || '',
          whatsappNumber: data.profile.whatsappNumber || '',
          gopayNumber: data.profile.gopayNumber || '',
          address: data.profile.address || ''
        } : null)
      } else {
        setProfile(data.user ? {
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          whatsappNumber: data.user.whatsappNumber || '',
          gopayNumber: data.user.gopayNumber || '',
          address: data.user.address || ''
        } : null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Simplified version: only fetch pickups, no transactions
      const pickupsRes = await fetch('/api/pickups?limit=5')
      const pickupsData = await pickupsRes.json()

      const pending = pickupsData.data?.filter((p: { status: string }) => p.status === 'PENDING').length || 0
      const completed = pickupsData.data?.filter((p: { status: string }) => p.status === 'COMPLETED').length || 0

      setStats({
        pendingPickups: pending,
        completedPickups: completed,
        totalEarnings: 0, // Removed in simplified version
        recentPickups: pickupsData.data || []
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
      <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Selamat Datang, {session.user.name}! 👋
        </h1>
        <p className="text-green-50">
          {role === 'USER' && 'Kelola sampah Anda dengan mudah dan dapatkan penghasilan tambahan'}
          {role === 'TPS' && 'Kelola permintaan penjemputan dan transaksi sampah'}
          {role === 'ADMIN' && 'Pantau dan kelola seluruh aktivitas GoClean'}
        </p>
      </div>

      {/* Profile Card */}
      {profile && (role === 'USER' || role === 'TPS') && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <UserIcon className="mr-2 text-green-600" size={24} />
              Profil Saya
            </h2>
            <Link
              href={role === 'TPS' ? '/tps/profile' : '/profile'}
              className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <Edit size={16} className="mr-1" />
              Edit Profile
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="text-gray-800 font-medium">{profile.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800 font-medium">{profile.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone size={14} className="mr-1" />
                  Nomor Telepon
                </p>
                <p className="text-gray-800 font-medium">{profile.phone || '-'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <MessageCircle size={14} className="mr-1" />
                  WhatsApp
                </p>
                <p className="text-gray-800 font-medium">{profile.whatsappNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gopay</p>
                <p className="text-gray-800 font-medium">{profile.gopayNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="text-gray-800 font-medium">{profile.address || '-'}</p>
              </div>
            </div>
          </div>

          {(!profile.phone || !profile.whatsappNumber || !profile.gopayNumber || !profile.address) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Lengkapi profil Anda untuk pengalaman yang lebih baik
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {role === 'USER' && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/pickup/new"
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition flex items-center space-x-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus size={36} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-800 mb-1">Antar/Jemput Sampah</h3>
              <p className="text-gray-600 text-base">Antarkan ke TPS atau minta dijemput</p>
            </div>
          </Link>

          <Link
            href="/pickup/history"
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition flex items-center space-x-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock size={36} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-800 mb-1">Riwayat</h3>
              <p className="text-gray-600 text-base">Lihat riwayat penjemputan</p>
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
              <h3 className="font-semibold text-lg text-gray-800">Permintaan Baru</h3>
              <p className="text-gray-600 text-sm">Lihat permintaan penjemputan</p>
            </div>
          </Link>

          <Link
            href="/tps/map"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-center space-x-4 border-2 border-transparent hover:border-green-500"
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Peta Lokasi</h3>
              <p className="text-gray-600 text-sm">Lihat lokasi penjemputan</p>
            </div>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="text-green-600" size={24} />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.pendingPickups || 0}</p>
          <p className="text-gray-600 text-sm">Menunggu dijemput</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <Truck className="text-green-600" size={24} />
            <span className="text-sm text-gray-600">Dalam Proses</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">0</p>
          <p className="text-gray-600 text-sm">Sedang dijemput</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="text-green-600" size={24} />
            <span className="text-sm text-gray-600">Selesai</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.completedPickups || 0}</p>
          <p className="text-gray-600 text-sm">Total penjemputan</p>
        </div>
      </div>

      {/* Removed sections in simplified version: */}
      {/* - Waste Statistics for TPS (was based on transactions) */}
      {/* - Earnings info card for USER (was based on transactions) */}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Aktivitas Terbaru</h2>
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
                  <div className={`w-3 h-3 rounded-full ${pickup.status === 'PENDING' ? 'bg-yellow-500' :
                    pickup.status === 'ACCEPTED' ? 'bg-green-400' :
                      pickup.status === 'COMPLETED' ? 'bg-green-600' : 'bg-gray-500'
                    }`} />
                  <div>
                    <p className="font-medium text-gray-800">{pickup.address}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(pickup.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${pickup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  pickup.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
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
          <div className="text-center py-8 text-gray-600">
            <Truck size={48} className="mx-auto mb-4 text-green-400" />
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
