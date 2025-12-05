'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  ArrowLeft, 
  Save,
  DollarSign,
  Trash2,
  LeafyGreen,
  Package,
  FileText,
  Cog,
  GlassWater,
  Smartphone,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WastePrice {
  id: string
  wasteType: string
  pricePerKg: number
  description?: string
}

const WASTE_TYPES = [
  { value: 'ORGANIC', label: 'Organik', icon: LeafyGreen, color: 'bg-green-500' },
  { value: 'PLASTIC', label: 'Plastik', icon: Package, color: 'bg-blue-500' },
  { value: 'PAPER', label: 'Kertas', icon: FileText, color: 'bg-yellow-500' },
  { value: 'METAL', label: 'Logam', icon: Cog, color: 'bg-gray-500' },
  { value: 'GLASS', label: 'Kaca', icon: GlassWater, color: 'bg-purple-500' },
  { value: 'ELECTRONIC', label: 'Elektronik', icon: Smartphone, color: 'bg-red-500' },
  { value: 'OTHER', label: 'Lainnya', icon: Trash2, color: 'bg-orange-500' }
]

export default function TPSPricesPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [prices, setPrices] = useState<WastePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedPrices, setEditedPrices] = useState<Record<string, { price: number; description: string }>>({})

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'TPS') {
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.role === 'TPS') {
      fetchPrices()
    }
  }, [session])

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/tps/prices')
      const data = await res.json()
      setPrices(data.data || [])
      
      // Initialize edited prices
      const initial: Record<string, { price: number; description: string }> = {}
      data.data?.forEach((p: WastePrice) => {
        initial[p.wasteType] = {
          price: p.pricePerKg,
          description: p.description || ''
        }
      })
      setEditedPrices(initial)
    } catch (error) {
      console.error('Error fetching prices:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceChange = (wasteType: string, field: 'price' | 'description', value: string | number) => {
    setEditedPrices(prev => ({
      ...prev,
      [wasteType]: {
        ...prev[wasteType] || { price: 0, description: '' },
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const pricesList = Object.entries(editedPrices).map(([wasteType, data]) => ({
        wasteType,
        pricePerKg: Number(data.price),
        description: data.description
      }))

      const res = await fetch('/api/tps/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: pricesList })
      })

      if (res.ok) {
        toast.success('Harga berhasil disimpan')
        fetchPrices()
      } else {
        toast.error('Gagal menyimpan harga')
      }
    } catch (error) {
      console.error('Error saving prices:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Harga Sampah</h1>
            <p className="text-gray-600 mt-2">
              Atur harga pembelian sampah per kilogram
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {isSaving ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : (
              <Save size={20} className="mr-2" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-start space-x-3">
          <DollarSign className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-medium text-blue-800">Petunjuk</p>
            <p className="text-blue-700 text-sm mt-1">
              Atur harga untuk setiap jenis sampah yang Anda terima. Harga ini akan ditampilkan kepada masyarakat 
              dan digunakan untuk menghitung nilai transaksi saat penjemputan selesai.
            </p>
          </div>
        </div>
      </div>

      {/* Price Cards */}
      <div className="space-y-4">
        {WASTE_TYPES.map(({ value, label, icon: Icon, color }) => {
          const currentPrice = editedPrices[value] || { price: 0, description: '' }
          const existingPrice = prices.find(p => p.wasteType === value)
          
          return (
            <div
              key={value}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white`}>
                  <Icon size={28} />
                </div>

                {/* Content */}
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{label}</h3>
                    <p className="text-sm text-gray-500">
                      {existingPrice ? 'Harga saat ini: Rp ' + existingPrice.pricePerKg.toLocaleString('id-ID') + '/kg' : 'Belum diatur'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-500 mb-1">
                        Harga per kg (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={currentPrice.price}
                        onChange={(e) => handlePriceChange(value, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 pl-18">
                <label className="block text-sm text-gray-500 mb-1">
                  Keterangan (opsional)
                </label>
                <input
                  type="text"
                  value={currentPrice.description}
                  onChange={(e) => handlePriceChange(value, 'description', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Botol plastik bersih, kardus kering, dll."
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {isSaving ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <Save size={20} className="mr-2" />
          )}
          Simpan Semua Perubahan
        </button>
      </div>
    </div>
  )
}
