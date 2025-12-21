'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Search, UserPlus, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface TPSLocation {
  id: string
  name: string
  kecamatan: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
}

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

interface EditUserData {
  name: string
  email: string
  phone: string
  role: string
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<EditUserData>({
    name: '',
    email: '',
    phone: '',
    role: 'USER'
  })
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER',
    adminCode: '',
    tpsData: {
      selectedTpsId: '',
      tpsName: '',
      address: '',
      latitude: '' as any,
      longitude: '' as any,
      operatingHours: '',
      capacity: 0
    }
  })
  const [tpsSearch, setTpsSearch] = useState('')
  const [showTpsDropdown, setShowTpsDropdown] = useState(false)
  const [tpsLocations, setTpsLocations] = useState<TPSLocation[]>([])
  const [loadingTPS, setLoadingTPS] = useState(false)

  // Fetch TPS locations from database
  useEffect(() => {
    fetchTPSLocations()
  }, [])

  const fetchTPSLocations = async () => {
    setLoadingTPS(true)
    try {
      const res = await fetch('/api/tps-locations')
      const data = await res.json()
      if (data.data) {
        setTpsLocations(data.data)
      }
    } catch (error) {
      console.error('Error fetching TPS locations:', error)
      toast.error('Gagal memuat lokasi TPS')
    } finally {
      setLoadingTPS(false)
    }
  }

  // Filter TPS based on search
  const filteredTPS = useMemo(() => {
    if (!tpsSearch.trim()) return tpsLocations
    const search = tpsSearch.toLowerCase()
    return tpsLocations.filter(tps => 
      tps.name.toLowerCase().includes(search) ||
      tps.kecamatan.toLowerCase().includes(search) ||
      tps.address.toLowerCase().includes(search)
    )
  }, [tpsSearch, tpsLocations])

  // Handle TPS selection
  const handleSelectTPS = (tpsId: string) => {
    const selectedTPS = tpsLocations.find(tps => tps.id === tpsId)
    if (selectedTPS) {
      setCreateFormData(prev => ({
        ...prev,
        tpsData: {
          ...prev.tpsData,
          selectedTpsId: tpsId,
          tpsName: selectedTPS.name,
          address: selectedTPS.address,
          latitude: selectedTPS.latitude,
          longitude: selectedTPS.longitude,
          operatingHours: selectedTPS.operatingHours || ''
        }
      }))
      setTpsSearch(selectedTPS.name)
      setShowTpsDropdown(false)
    }
  }

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisible; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    // Validasi input
    if (!editFormData.name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    if (!editFormData.email.trim()) {
      toast.error('Email tidak boleh kosong')
      return
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editFormData.email)) {
      toast.error('Format email tidak valid')
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        data = { error: 'Invalid server response' }
      }

      console.log('Update response:', data)

      if (res.ok) {
        toast.success('User berhasil diupdate')
        setShowEditModal(false)
        setEditingUser(null)
        fetchUsers() // Refresh data
      } else {
        console.error('Update error:', data)
        const errorMsg = data?.details ? `${data.error}: ${data.details}` : (data?.error || 'Gagal mengupdate user')
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Gagal mengupdate user: ' + errorMessage)
    }
  }

  const handleCreate = async () => {
    // Validasi input
    if (!createFormData.name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    if (!createFormData.email.trim()) {
      toast.error('Email tidak boleh kosong')
      return
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createFormData.email)) {
      toast.error('Format email tidak valid')
      return
    }

    if (!createFormData.password || createFormData.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    // Validasi khusus untuk role TPS
    if (createFormData.role === 'TPS') {
      if (!createFormData.tpsData.selectedTpsId) {
        toast.error('Silakan pilih TPS dari daftar')
        return
      }
      if (!createFormData.tpsData.tpsName.trim()) {
        toast.error('Nama TPS harus diisi')
        return
      }
      if (!createFormData.tpsData.address.trim()) {
        toast.error('Alamat TPS harus diisi')
        return
      }
    }

    // Validasi khusus untuk role ADMIN
    if (createFormData.role === 'ADMIN') {
      if (!createFormData.adminCode.trim()) {
        toast.error('Kode admin harus diisi')
        return
      }
    }

    try {
      let endpoint = '/api/admin/users'
      let requestBody: any = {
        email: createFormData.email,
        password: createFormData.password,
        name: createFormData.name,
        phone: createFormData.phone,
        role: createFormData.role
      }

      // Jika role ADMIN, gunakan endpoint khusus
      if (createFormData.role === 'ADMIN') {
        endpoint = '/api/admin/register'
        requestBody.adminCode = createFormData.adminCode
      }

      // Jika role TPS, tambahkan tpsData
      if (createFormData.role === 'TPS') {
        requestBody.tpsData = createFormData.tpsData
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        data = { error: 'Invalid server response' }
      }

      if (res.ok) {
        toast.success('User berhasil ditambahkan')
        setShowCreateModal(false)
        setCreateFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'USER',
          adminCode: '',
          tpsData: {
            selectedTpsId: '',
            tpsName: '',
            address: '',
            latitude: '' as any,
            longitude: '' as any,
            operatingHours: '',
            capacity: 0
          }
        })
        fetchUsers() // Refresh data
      } else {
        toast.error(data?.error || 'Gagal menambahkan user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Gagal menambahkan user: ' + errorMessage)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${userName}?`)) {
      return
    }

    try {
      console.log('Deleting user:', userId)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        data = { error: 'Invalid server response' }
      }

      console.log('Delete response:', data)

      if (res.ok) {
        toast.success('User berhasil dihapus')
        fetchUsers() // Refresh data
      } else {
        console.error('Delete error:', data)
        const errorMsg = data?.details ? `${data.error}: ${data.details}` : (data?.error || 'Gagal menghapus user')
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Gagal menghapus user: ' + errorMessage)
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Kelola Users</h1>
          <p className="text-green-700 mt-2">
            Kelola semua pengguna GoClean
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
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
              {displayedUsers.map((user) => (
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
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit user"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedUsers.length === 0 && (
          <div className="text-center py-12 text-green-700">
            Tidak ada data pengguna
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length} data
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                  disabled={page === '...'}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : page === '...'
                      ? 'bg-transparent text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm transition ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-green-800">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                >
                  <option value="USER">USER</option>
                  <option value="TPS">TPS</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Role tidak dapat diubah setelah user dibuat</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-green-800">Tambah User Baru</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'USER',
                    adminCode: '',
                    tpsData: {
                      selectedTpsId: '',
                      tpsName: '',
                      address: '',
                      latitude: '' as any,
                      longitude: '' as any,
                      operatingHours: '',
                      capacity: 0
                    }
                  })
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="contoh@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={createFormData.phone}
                  onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="USER">USER</option>
                  <option value="TPS">TPS</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Field khusus untuk role ADMIN */}
              {createFormData.role === 'ADMIN' && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3">Data Khusus Admin</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.adminCode}
                      onChange={(e) => setCreateFormData({ ...createFormData, adminCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Masukkan kode admin"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hubungi super admin untuk mendapatkan kode</p>
                  </div>
                </div>
              )}

              {/* Field khusus untuk role TPS */}
              {createFormData.role === 'TPS' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <p className="text-sm text-gray-600 mb-3">Data TPS</p>
                  
                  {/* TPS Selection with Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih TPS <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={tpsSearch}
                        onChange={(e) => {
                          setTpsSearch(e.target.value)
                          setShowTpsDropdown(true)
                        }}
                        onFocus={() => setShowTpsDropdown(true)}
                        placeholder="Cari TPS berdasarkan nama atau kecamatan..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Dropdown List */}
                    {showTpsDropdown && filteredTPS.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredTPS.map((tps) => (
                          <button
                            key={tps.id}
                            type="button"
                            onClick={() => handleSelectTPS(tps.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition ${
                              createFormData.tpsData.selectedTpsId === tps.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{tps.name}</div>
                            <div className="text-sm text-gray-600">{tps.kecamatan}</div>
                            <div className="text-xs text-gray-500">{tps.address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {showTpsDropdown && filteredTPS.length === 0 && tpsSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        TPS tidak ditemukan
                      </div>
                    )}
                  </div>

                  {/* Display selected TPS details (read-only) */}
                  {createFormData.tpsData.selectedTpsId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-green-900 mb-2">Detail TPS yang Dipilih:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Nama:</span>
                          <p className="font-medium text-gray-900">{createFormData.tpsData.tpsName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jam Operasional:</span>
                          <p className="font-medium text-gray-900">{createFormData.tpsData.operatingHours || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Alamat:</span>
                          <p className="font-medium text-gray-900">{createFormData.tpsData.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Latitude:</span>
                          <p className="font-medium text-gray-900">{createFormData.tpsData.latitude}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Longitude:</span>
                          <p className="font-medium text-gray-900">{createFormData.tpsData.longitude}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapasitas (kg)
                    </label>
                    <input
                      type="number"
                      value={createFormData.tpsData.capacity}
                      onChange={(e) => setCreateFormData({ 
                        ...createFormData, 
                        tpsData: { ...createFormData.tpsData, capacity: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setTpsSearch('')
                  setShowTpsDropdown(false)
                  setCreateFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'USER',
                    adminCode: '',
                    tpsData: {
                      selectedTpsId: '',
                      tpsName: '',
                      address: '',
                      latitude: '' as any,
                      longitude: '' as any,
                      operatingHours: '',
                      capacity: 0
                    }
                  })
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Tambah User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
