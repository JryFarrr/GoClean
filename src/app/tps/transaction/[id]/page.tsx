'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Loader2, 
  ArrowLeft, 
  MapPin,
  Phone,
  Calendar,
  Package,
  CheckCircle,
  User,
  DollarSign,
  Copy,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { parseJsonArray } from '@/lib/utils'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

interface WasteItem {
  id: string
  wasteType: string
  estimatedWeight?: number
  actualWeight?: number
  price?: number
}

interface PickupDetail {
  id: string
  status: string
  address: string
  latitude: number
  longitude: number
  description?: string
  scheduledAt?: string
  createdAt: string
  photos: string | string[]
  videos: string | string[]
  user: {
    id: string
    name: string
    phone?: string
    email: string
    gopayNumber?: string
    whatsappNumber?: string
  }
  wasteItems: WasteItem[]
  transaction?: {
    totalWeight: number
    totalPrice: number
    isPaid: boolean
  }
}

interface WastePrice {
  wasteType: string
  pricePerKg: number
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  ORGANIC: 'Organik',
  PLASTIC: 'Plastik',
  PAPER: 'Kertas',
  METAL: 'Logam',
  GLASS: 'Kaca',
  ELECTRONIC: 'Elektronik',
  OTHER: 'Lainnya'
}

// Harga random untuk setiap kategori sampah (dalam Rp/kg)
const WASTE_TYPE_PRICES: Record<string, { min: number; max: number }> = {
  ORGANIC: { min: 500, max: 1500 },      // Organik: 500-1500/kg
  PLASTIC: { min: 2000, max: 5000 },     // Plastik: 2000-5000/kg
  PAPER: { min: 1000, max: 3000 },       // Kertas: 1000-3000/kg
  METAL: { min: 5000, max: 15000 },      // Logam: 5000-15000/kg
  GLASS: { min: 500, max: 2000 },        // Kaca: 500-2000/kg
  ELECTRONIC: { min: 10000, max: 50000 }, // Elektronik: 10000-50000/kg
  OTHER: { min: 500, max: 2000 }         // Lainnya: 500-2000/kg
}

// Generate random price within range for a waste type
const getRandomPrice = (wasteType: string): number => {
  const range = WASTE_TYPE_PRICES[wasteType] || { min: 500, max: 2000 }
  return Math.floor(Math.random() * (range.max - range.min + 1) + range.min)
}

export default function TransactionInputPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const pickupId = params.id as string

  const [pickup, setPickup] = useState<PickupDetail | null>(null)
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [weightInputs, setWeightInputs] = useState<Record<string, number>>({})
  const [randomPrices, setRandomPrices] = useState<Record<string, number>>({}) // Harga random per item

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'TPS') {
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user && pickupId) {
      fetchPickupDetail()
      if (session.user.role === 'TPS') {
        fetchWastePrices()
      }
    }
  }, [session, pickupId])

  const fetchPickupDetail = async () => {
    try {
      const res = await fetch(`/api/pickups/${pickupId}`)
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.data) {
        setPickup(data.data)
        // Initialize weight inputs
        const weights: Record<string, number> = {}
        const prices: Record<string, number> = {}
        data.data.wasteItems.forEach((item: WasteItem) => {
          weights[item.id] = item.actualWeight || item.estimatedWeight || 0
          // Generate random price untuk setiap item berdasarkan waste type
          prices[item.id] = getRandomPrice(item.wasteType)
        })
        setWeightInputs(weights)
        setRandomPrices(prices)
      } else if (data.error) {
        toast.error(data.error)
        router.push('/tps/requests')
      } else {
        toast.error('Permintaan tidak ditemukan')
        router.push('/tps/requests')
      }
    } catch (error) {
      console.error('Error fetching pickup:', error)
      toast.error('Gagal memuat data')
      router.push('/tps/requests')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWastePrices = async () => {
    try {
      const res = await fetch('/api/tps/prices')
      const data = await res.json()
      setWastePrices(data.data || [])
    } catch (error) {
      console.error('Error fetching prices:', error)
    }
  }

  const getPriceForType = (itemId: string) => {
    // Gunakan harga random yang sudah di-generate
    return randomPrices[itemId] || 0
  }

  const calculateTotalWeight = () => {
    return Object.values(weightInputs).reduce((sum, weight) => sum + weight, 0)
  }

  const calculateTotalPrice = () => {
    if (!pickup) return 0
    return pickup.wasteItems.reduce((sum, item) => {
      const weight = weightInputs[item.id] || 0
      const price = getPriceForType(item.id)
      return sum + weight * price
    }, 0)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} disalin!`)
  }

  const handleCreateTransaction = async () => {
    if (calculateTotalWeight() === 0) {
      toast.error('Masukkan berat sampah terlebih dahulu')
      return
    }

    setIsSaving(true)
    try {
      // Update waste items with actual weights and random prices
      const wasteItemUpdates = pickup!.wasteItems.map(item => ({
        id: item.id,
        actualWeight: weightInputs[item.id] || 0,
        price: (weightInputs[item.id] || 0) * getPriceForType(item.id)
      }))

      // Create transaction with PENDING_PAYMENT status
      const res = await fetch(`/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupRequestId: pickupId,
          wasteItems: wasteItemUpdates,
          totalWeight: calculateTotalWeight(),
          totalPrice: calculateTotalPrice()
        })
      })

      if (res.ok) {
        toast.success('Transaksi berhasil dibuat! Menunggu pembayaran dari pengguna.')
        router.push('/tps/transactions')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal membuat transaksi')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
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

  if (!session || !pickup) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tps/requests"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali
        </Link>
        <h1 className="text-3xl font-bold">Input Transaksi Penjemputan</h1>
      </div>

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{pickup.user.name}</h3>
              <p className="text-gray-500">{pickup.user.email}</p>
            </div>
          </div>
          {pickup.user.phone && (
            <a
              href={`tel:${pickup.user.phone}`}
              className="inline-flex items-center text-green-600 hover:text-green-700"
            >
              <Phone size={16} className="mr-2" />
              {pickup.user.phone}
            </a>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border-2 border-blue-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
            <DollarSign className="mr-2 text-blue-600" size={24} />
            Informasi Pembayaran
          </h3>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">
              💡 Setelah membuat transaksi, Anda harus <span className="font-semibold text-blue-600">melakukan pembayaran</span> ke akun Gopay user berikut:
            </p>
            
            {pickup.user.gopayNumber ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Nomor Gopay User:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                      <p className="text-lg font-bold text-blue-700">{pickup.user.gopayNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(pickup.user.gopayNumber!, 'Nomor Gopay')}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                {pickup.user.whatsappNumber && (
                  <div>
                    <label className="text-xs text-gray-500">WhatsApp User:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                        <p className="text-lg font-semibold text-green-700">{pickup.user.whatsappNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(pickup.user.whatsappNumber!, 'Nomor WhatsApp')}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <MessageCircle size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ User belum mengatur nomor Gopay. Hubungi user untuk mendapatkan nomor rekening pembayaran.
                </p>
              </div>
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-800">
              <span className="font-semibold">Catatan:</span> User akan memverifikasi pembayaran setelah menerima transfer. Pastikan melakukan pembayaran sesuai total yang tertera.
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <MapPin className="mr-2 text-green-600" size={20} />
            Lokasi
          </h3>
          <p className="text-gray-700 mb-2">{pickup.address}</p>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapComponent 
              latitude={pickup.latitude} 
              longitude={pickup.longitude}
              readonly={true}
            />
          </div>
        </div>

        {/* Waste Items - Input Berat */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Package className="mr-2 text-green-600" size={20} />
            Input Berat Sampah
          </h3>

          <div className="space-y-4">
            {pickup.wasteItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={weightInputs[item.id] || ''}
                        onChange={(e) => setWeightInputs(prev => ({
                          ...prev,
                          [item.id]: parseFloat(e.target.value) || 0
                        }))}
                        min="0"
                        step="0.1"
                        placeholder="0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-600">kg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Harga: Rp {getPriceForType(item.id).toLocaleString('id-ID')} / kg
                    </p>
                  </div>
                  {weightInputs[item.id] > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal:</p>
                      <p className="text-lg font-semibold text-green-600">
                        Rp {(weightInputs[item.id] * getPriceForType(item.id)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Total Berat:</span>
            <span className="text-xl font-semibold">{calculateTotalWeight()} kg</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-green-200">
            <span className="text-lg font-semibold text-gray-900">Total Pembayaran:</span>
            <span className="text-3xl font-bold text-green-600">
              Rp {calculateTotalPrice().toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreateTransaction}
          disabled={isSaving || calculateTotalWeight() === 0}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>Simpan Transaksi & Lakukan Pembayaran</span>
            </>
          )}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            ⓘ Setelah menyimpan transaksi, silakan <span className="font-semibold">transfer pembayaran ke nomor Gopay user di atas</span>. User akan memverifikasi pembayaran Anda.
          </p>
        </div>
      </div>
    </div>
  )
}
