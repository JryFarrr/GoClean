'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin, Phone, Clock, Trash2, Users, DollarSign, Package, Plus, X, Upload, Download, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { SURABAYA_KECAMATAN } from '@/lib/surabayaKecamatan'
import * as XLSX from 'xlsx'

// Dynamic import untuk map component (client-side only)
const TPSLocationPicker = dynamic(
  () => import('@/components/TPSLocationPicker'),
  { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center"><Loader2 className="animate-spin" /></div> }
)

interface TPSLocation {
  id: string
  name: string
  kecamatan: string
  address: string
  latitude: number
  longitude: number
  operatingHours?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TPSData {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
  tpsProfile?: {
    tpsName: string
    address: string
    latitude?: number
    longitude?: number
    operatingHours?: string
    capacity?: number
    isActive: boolean
  }
  _count: {
    tpsPickups: number
  }
}

export default function AdminTPSListPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [tpsList, setTpsList] = useState<TPSData[]>([])
  const [tpsLocations, setTpsLocations] = useState<TPSLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<TPSLocation | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newTpsData, setNewTpsData] = useState({
    tpsName: '',
    kecamatan: '',
    address: '',
    latitude: -7.257472,
    longitude: 112.752090,
    operatingHours: '',
    phone: ''
  })

  useEffect(() => {
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
      fetchTPSList()
    }
  }, [session])

  const fetchTPSList = async () => {
    setIsLoading(true)
    try {
      // Fetch TPS accounts (users with role TPS)
      const usersRes = await fetch('/api/admin/users?role=TPS')
      const usersData = await usersRes.json()
      setTpsList(Array.isArray(usersData.data) ? usersData.data : [])

      // Fetch TPS locations from database
      const locationsRes = await fetch('/api/admin/tps-locations')
      const locationsData = await locationsRes.json()
      setTpsLocations(Array.isArray(locationsData.data) ? locationsData.data : [])
    } catch (error) {
      console.error('Error fetching TPS data:', error)
      toast.error('Gagal memuat daftar TPS')
      setTpsList([])
      setTpsLocations([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTpsLocation = async () => {
    // Validation
    if (!newTpsData.tpsName.trim()) {
      toast.error('Nama TPS harus diisi')
      return
    }
    if (!newTpsData.kecamatan.trim()) {
      toast.error('Kecamatan harus diisi')
      return
    }
    if (!newTpsData.address.trim()) {
      toast.error('Alamat harus diisi')
      return
    }
    if (!newTpsData.latitude || !newTpsData.longitude) {
      toast.error('Silakan pilih lokasi di peta')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: newTpsData.tpsName,
        kecamatan: newTpsData.kecamatan,
        address: newTpsData.address,
        latitude: newTpsData.latitude,
        longitude: newTpsData.longitude,
        operatingHours: newTpsData.operatingHours || '06:00 - 18:00',
        phone: newTpsData.phone || ''
      }

      console.log('Sending TPS location data:', payload)

      const res = await fetch('/api/admin/tps-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log('API Response:', { status: res.status, data })

      if (res.ok) {
        toast.success('Lokasi TPS berhasil ditambahkan!')
        setShowAddModal(false)
        setNewTpsData({
          tpsName: '',
          kecamatan: '',
          address: '',
          latitude: -7.257472,
          longitude: 112.752090,
          operatingHours: '',
          phone: ''
        })
        // Refresh list if needed
        fetchTPSList()
      } else {
        console.error('Error response:', data)
        const errorMessage = data?.error || data?.message || 'Gagal menambahkan lokasi TPS'
        const details = data?.details ? ` - ${data.details}` : ''
        toast.error(errorMessage + details)
      }
    } catch (error) {
      console.error('Error adding TPS location:', error)
      toast.error('Terjadi kesalahan saat menambahkan lokasi TPS')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('File harus berformat Excel (.xlsx atau .xls)')
      return
    }

    setIsImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/tps-locations/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        // Show results
        const { results } = data
        
        if (results.errors.length > 0) {
          // Show detailed error toast
          toast.error(
            <div className="max-h-60 overflow-y-auto">
              <p className="font-semibold mb-2">{data.message}</p>
              <ul className="text-sm space-y-1">
                {results.errors.slice(0, 5).map((err: string, idx: number) => (
                  <li key={idx}>• {err}</li>
                ))}
                {results.errors.length > 5 && (
                  <li>... dan {results.errors.length - 5} error lainnya</li>
                )}
              </ul>
            </div>,
            { duration: 8000 }
          )
        } else {
          toast.success(data.message)
        }

        // Show success messages if any
        if (results.success.length > 0) {
          console.log('Import success:', results.success)
        }

        setShowImportModal(false)
        fetchTPSList() // Refresh list
      } else {
        toast.error(data.error || 'Gagal mengimpor data')
      }
    } catch (error) {
      console.error('Error importing Excel:', error)
      toast.error('Terjadi kesalahan saat mengimpor data')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const downloadTemplate = () => {
    // Create template data with correct format
    const templateData = [
      {
        'Nama TPS': 'TPS Genteng Kali',
        'Kecamatan': 'Genteng',
        'Alamat': 'Jl. Genteng Kali No. 1 Genteng Surabaya',
        'Latitude': -7.257472,
        'Longitude': 112.752090,
        'Jam Operasional': '06:00 - 18:00',
        'No. Telepon': '031-12345678'
      },
      {
        'Nama TPS': 'TPS Sukolilo',
        'Kecamatan': 'Sukolilo',
        'Alamat': 'Jl. Raya Sukolilo No. 25 Surabaya',
        'Latitude': -7.280000,
        'Longitude': 112.790000,
        'Jam Operasional': '07:00 - 17:00',
        'No. Telepon': '031-87654321'
      }
    ]

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData, {
      header: [
        'Nama TPS',
        'Kecamatan',
        'Alamat',
        'Latitude',
        'Longitude',
        'Jam Operasional',
        'No. Telepon'
      ]
    })

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Nama TPS
      { wch: 15 }, // Kecamatan
      { wch: 40 }, // Alamat
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
      { wch: 18 }, // Jam Operasional
      { wch: 15 }  // No. Telepon
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TPS Locations')

    // Add instruction sheet
    const instructions = [
      ['PANDUAN IMPORT DATA TPS'],
      [],
      ['PETUNJUK PENGGUNAAN:'],
      ['1. Isi kolom sesuai dengan format yang tersedia'],
      ['2. Pastikan semua kolom WAJIB terisi dengan benar'],
      ['3. Upload file Excel ke sistem'],
      [],
      ['PENJELASAN KOLOM:'],
      ['Nama TPS', 'Nama lengkap TPS (wajib, unik)'],
      ['Kecamatan', 'Salah satu dari 31 kecamatan Surabaya (wajib)'],
      ['Alamat', 'Alamat lengkap TPS (wajib)'],
      ['Latitude', 'Koordinat GPS latitude dalam format desimal (wajib)'],
      ['Longitude', 'Koordinat GPS longitude dalam format desimal (wajib)'],
      ['Jam Operasional', 'Jam buka-tutup TPS (opsional, contoh: 06:00 - 18:00)'],
      ['No. Telepon', 'Nomor telepon TPS (opsional)'],
      [],
      ['KECAMATAN YANG VALID:'],
      ['Asemrowo, Benowo, Bubutan, Bulak, Dukuh Pakis, Gayungan, Genteng, Gubeng,'],
      ['Gunung Anyar, Jambangan, Karang Pilang, Kenjeran, Krembangan, Lakarsantri,'],
      ['Mulyorejo, Pabean Cantian, Pakal, Rungkut, Sambikerep, Sawahan, Semampir,'],
      ['Simokerto, Sukolilo, Sukomanunggal, Tambaksari, Tandes, Tegalsari,'],
      ['Tenggilis Mejoyo, Wiyung, Wonocolo, Wonokromo'],
      [],
      ['FORMAT KOORDINAT GPS:'],
      ['- Gunakan format desimal (bukan derajat/menit/detik)'],
      ['- Contoh BENAR: -7.257472, 112.752090'],
      ['- Contoh SALAH: 7°15\'26.9"S, 112°45\'07.5"E'],
      ['- Cara mendapatkan: Klik kanan di Google Maps → Copy koordinat'],
      [],
      ['VALIDASI DATA:'],
      ['- Nama TPS tidak boleh duplikat'],
      ['- Kecamatan harus salah satu dari 31 kecamatan Surabaya'],
      ['- Koordinat harus dalam format angka desimal'],
      ['- Alamat harus diisi lengkap'],
      [],
      ['CONTOH DATA:'],
      ['Nama TPS: TPS Genteng Kali'],
      ['Kecamatan: Genteng'],
      ['Alamat: Jl. Genteng Kali No. 1 Genteng Surabaya'],
      ['Latitude: -7.257472'],
      ['Longitude: 112.752090'],
      ['Jam Operasional: 06:00 - 18:00'],
      ['No. Telepon: 031-12345678']
    ]

    const instructionSheet = XLSX.utils.aoa_to_sheet(instructions)
    instructionSheet['!cols'] = [{ wch: 50 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Panduan')

    // Generate and download
    XLSX.writeFile(workbook, 'Template-Import-TPS-GoClean.xlsx')
    toast.success('Template Excel berhasil didownload!')
  }

  const handleDeleteClick = (location: TPSLocation) => {
    setLocationToDelete(location)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/tps-locations?id=${locationToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Lokasi TPS berhasil dihapus!')
        setShowDeleteModal(false)
        setLocationToDelete(null)
        fetchTPSList() // Refresh list
      } else {
        toast.error(data.error || 'Gagal menghapus lokasi TPS')
      }
    } catch (error) {
      console.error('Error deleting TPS location:', error)
      toast.error('Terjadi kesalahan saat menghapus lokasi TPS')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetAllTPS = async () => {
    setIsResetting(true)
    try {
      const res = await fetch('/api/admin/tps-locations/reset', {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        setShowResetModal(false)
        fetchTPSList() // Refresh list
      } else {
        toast.error(data.error || 'Gagal mereset TPS')
      }
    } catch (error) {
      console.error('Error resetting TPS locations:', error)
      toast.error('Terjadi kesalahan saat mereset TPS')
    } finally {
      setIsResetting(false)
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Daftar TPS</h1>
          <p className="text-green-700 mt-2">
            Kelola dan pantau semua Tempat Pembuangan Sampah di sistem GoClean
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <Upload size={20} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            <Plus size={20} />
            <span>Tambah Lokasi TPS</span>
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
            title="Hapus semua TPS dari database"
          >
            <Trash2 size={20} />
            <span>Reset Semua TPS</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <MapPin className="text-green-600" size={32} />
            <div>
              <p className="text-3xl font-bold text-green-800">{tpsLocations.length}</p>
              <p className="text-green-700">Total TPS Terdaftar</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <Users className="text-green-600" size={32} />
            <div>
              <p className="text-3xl font-bold text-green-800">
                {tpsList.length}
              </p>
              <p className="text-green-700">TPS Punya Akun</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
          <div className="flex items-center space-x-3">
            <Trash2 className="text-green-600" size={32} />
            <div>
              <p className="text-3xl font-bold text-green-800">
                {tpsList.reduce((sum, tps) => sum + (tps._count?.tpsPickups || 0), 0)}
              </p>
              <p className="text-green-700">Total Penjemputan</p>
            </div>
          </div>
        </div>
      </div>

      {/* TPS List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold text-green-800 mb-6">📋 Daftar Semua TPS</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        ) : tpsLocations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Belum ada TPS terdaftar</p>
            <p className="text-gray-400 text-sm mt-2">Klik tombol &quot;Tambah Lokasi TPS&quot; untuk menambahkan TPS baru</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tpsLocations.map((location, index) => {
              // Check if this TPS has an account
              const hasAccount = tpsList.find(tps => 
                tps.tpsProfile?.tpsName?.toLowerCase().includes(location.name.toLowerCase()) ||
                location.name.toLowerCase().includes(tps.tpsProfile?.tpsName?.toLowerCase() || '')
              )

              return (
                <div
                  key={location.id}
                  className={`border rounded-lg p-5 hover:shadow-lg transition-all ${
                    hasAccount 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          hasAccount ? 'bg-green-600' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-green-800">
                              {location.name}
                            </h3>
                            {hasAccount ? (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                ✓ Punya Akun
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">
                                Belum Akun
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-green-600">Kecamatan: {location.kecamatan}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid md:grid-cols-2 gap-3 ml-15">
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{location.address}</span>
                        </div>

                        {location.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone size={16} className="text-green-600" />
                            <span className="text-gray-700">{location.phone}</span>
                          </div>
                        )}

                        {location.operatingHours && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock size={16} className="text-green-600" />
                            <span className="text-gray-700">{location.operatingHours}</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin size={16} className="text-green-600" />
                          <span className="text-gray-700">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>

                      {/* Account Info if exists */}
                      {hasAccount && (
                        <div className="mt-3 pt-3 border-t border-green-200 ml-15">
                          <p className="text-xs font-medium text-green-700 mb-1">📧 Info Akun:</p>
                          <div className="grid md:grid-cols-2 gap-2">
                            <p className="text-sm text-gray-600">Email: {hasAccount.email}</p>
                            {hasAccount._count?.tpsPickups > 0 && (
                              <p className="text-sm text-gray-600">
                                Penjemputan: {hasAccount._count.tpsPickups} kali
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        location.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {location.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                      </div>

                      {location.latitude && location.longitude && (
                        <Link
                          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                          target="_blank"
                          className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                        >
                          📍 Lihat di Peta
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDeleteClick(location)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-green-100 text-xs text-gray-500">
                    Terdaftar sejak: {new Date(location.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add TPS Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Tambah Lokasi TPS Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama TPS <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTpsData.tpsName}
                  onChange={(e) => setNewTpsData({ ...newTpsData, tpsName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Contoh: TPS Genteng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTpsData.kecamatan}
                  onChange={(e) => setNewTpsData({ ...newTpsData, kecamatan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">-- Pilih Kecamatan --</option>
                  {SURABAYA_KECAMATAN.map((kecamatan) => (
                    <option key={kecamatan} value={kecamatan}>
                      {kecamatan}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih salah satu dari 31 kecamatan di Surabaya
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTpsData.address}
                  onChange={(e) => setNewTpsData({ ...newTpsData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Jl. Genteng Kali, Genteng, Surabaya"
                  rows={2}
                />
              </div>

              {/* Map Location Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Lokasi di Peta <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <TPSLocationPicker
                    latitude={newTpsData.latitude}
                    longitude={newTpsData.longitude}
                    onLocationChange={(lat, lng, address) => {
                      setNewTpsData({
                        ...newTpsData,
                        latitude: lat,
                        longitude: lng,
                        address: address || newTpsData.address
                      })
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Klik pada peta untuk memilih lokasi, atau gunakan kotak pencarian untuk mencari alamat. Koordinat saat ini: {newTpsData.latitude.toFixed(6)}, {newTpsData.longitude.toFixed(6)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Operasional
                </label>
                <input
                  type="text"
                  value={newTpsData.operatingHours}
                  onChange={(e) => setNewTpsData({ ...newTpsData, operatingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="06:00 - 18:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={newTpsData.phone}
                  onChange={(e) => setNewTpsData({ ...newTpsData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="031-5311234"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Info:</strong> Lokasi TPS yang ditambahkan akan langsung tersedia untuk:
                </p>
                <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                  <li>Pilihan penjemputan sampah oleh user</li>
                  <li>Registrasi akun TPS baru</li>
                  <li>Tampilan peta lokasi TPS</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={handleAddTpsLocation}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Tambah Lokasi TPS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Upload size={24} />
                <span>Import Data TPS dari Excel</span>
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white hover:bg-green-700 rounded-full p-1 transition"
                disabled={isImporting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <FileSpreadsheet size={20} className="mr-2" />
                  Panduan Import Excel
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 ml-5 list-decimal">
                  <li>Download template Excel terlebih dahulu menggunakan tombol di bawah</li>
                  <li>Isi data TPS sesuai dengan format yang tersedia</li>
                  <li>Pastikan semua kolom wajib terisi (Nama TPS, Kecamatan, Alamat, Latitude, Longitude)</li>
                  <li>Koordinat harus dalam format desimal (contoh: -7.257472, 112.752090)</li>
                  <li>Upload file Excel yang sudah diisi</li>
                </ol>
              </div>

              {/* Format Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Kolom</th>
                      <th className="px-3 py-2 text-left font-semibold">Wajib</th>
                      <th className="px-3 py-2 text-left font-semibold">Contoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-3 py-2">Nama TPS</td>
                      <td className="px-3 py-2"><span className="text-red-600">Ya</span></td>
                      <td className="px-3 py-2 text-gray-600">TPS Genteng Kali</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Kecamatan</td>
                      <td className="px-3 py-2"><span className="text-red-600">Ya</span></td>
                      <td className="px-3 py-2 text-gray-600">Genteng</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Alamat</td>
                      <td className="px-3 py-2"><span className="text-red-600">Ya</span></td>
                      <td className="px-3 py-2 text-gray-600">Jl. Genteng Kali No. 1</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Latitude</td>
                      <td className="px-3 py-2"><span className="text-red-600">Ya</span></td>
                      <td className="px-3 py-2 text-gray-600">-7.257472</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Longitude</td>
                      <td className="px-3 py-2"><span className="text-red-600">Ya</span></td>
                      <td className="px-3 py-2 text-gray-600">112.752090</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Jam Operasional</td>
                      <td className="px-3 py-2"><span className="text-gray-500">Tidak</span></td>
                      <td className="px-3 py-2 text-gray-600">06:00 - 18:00</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">No. Telepon</td>
                      <td className="px-3 py-2"><span className="text-gray-500">Tidak</span></td>
                      <td className="px-3 py-2 text-gray-600">031-12345678</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download Template Button */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-100 text-green-700 border-2 border-green-300 rounded-lg hover:bg-green-200 transition font-semibold"
              >
                <Download size={20} />
                <span>Download Template Excel</span>
              </button>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                  id="excel-upload"
                  disabled={isImporting}
                />
                <label
                  htmlFor="excel-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-3 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin text-green-600" size={48} />
                      <p className="text-lg font-semibold text-green-600">Mengimpor data...</p>
                      <p className="text-sm text-gray-500">Mohon tunggu, sedang memproses file Excel</p>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400" size={48} />
                      <p className="text-lg font-semibold text-gray-700">Klik untuk upload file Excel</p>
                      <p className="text-sm text-gray-500">Format: .xlsx atau .xls</p>
                    </>
                  )}
                </label>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Perhatian:</strong> Data TPS yang sudah ada (nama dan kecamatan sama) akan dilewati dan tidak akan ditimpa.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={isImporting}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && locationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Trash2 size={24} />
                <span>Konfirmasi Hapus TPS</span>
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">
                  ⚠️ Apakah Anda yakin ingin menghapus lokasi TPS ini?
                </p>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Nama:</strong> {locationToDelete.name}</p>
                  <p><strong>Kecamatan:</strong> {locationToDelete.kecamatan}</p>
                  <p><strong>Alamat:</strong> {locationToDelete.address}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan. Data TPS akan dihapus secara permanen dari sistem.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setLocationToDelete(null)
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All TPS Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Trash2 size={24} />
                <span>Reset Semua TPS</span>
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-3">
                  ⚠️ PERHATIAN! Tindakan Berbahaya
                </p>
                <p className="text-sm text-red-700 mb-3">
                  Anda akan menghapus <strong>SEMUA {tpsLocations.length} lokasi TPS</strong> yang terdaftar di database.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚡ Dampak:</strong>
                </p>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Semua data lokasi TPS akan dihapus</li>
                  <li>Informasi kecamatan, alamat, dan koordinat akan hilang</li>
                  <li>Tindakan ini <strong>TIDAK DAPAT DIBATALKAN</strong></li>
                  <li>Data akun TPS (user) akan tetap ada</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Pastikan Anda benar-benar ingin melakukan ini sebelum melanjutkan.</strong>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                disabled={isResetting}
              >
                Batal
              </button>
              <button
                onClick={handleResetAllTPS}
                disabled={isResetting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Mereset...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={20} />
                    <span>Ya, Hapus Semua</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
