'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, UserPlus, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  tpsProfile?: {
    tpsName: string
    address: string
  }
  _count: {
    pickupRequests: number
    transactions: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

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
      fetchUsers()
    }
  }, [session, filter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.append('role', filter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Kelola Users</h1>
          <p className="text-green-700 mt-2">
            Kelola semua pengguna GoClean
          </p>
        </div>
        <button
          onClick={() => {/* TODO: Open create user modal */}}
          className="mt-4 md:mt-0 inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          <UserPlus size={20} className="mr-2" />
          Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-green-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="flex space-x-2">
            {['', 'USER', 'TPS', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === role
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {role || 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Pickups</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Tanggal Daftar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-green-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-green-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-green-800">{user.name}</p>
                      {user.tpsProfile && (
                        <p className="text-sm text-green-600">{user.tpsProfile.tpsName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-green-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'TPS' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-green-700">
                    {user._count.pickupRequests}
                  </td>
                  <td className="px-6 py-4 text-green-700">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-green-700">
            Tidak ada data pengguna
          </div>
        )}
      </div>
    </div>
  )
}
