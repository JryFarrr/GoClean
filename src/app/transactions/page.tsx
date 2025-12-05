'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, DollarSign, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  totalWeight: number
  totalPrice: number
  isPaid: boolean
  createdAt: string
  pickupRequest: {
    address: string
    wasteItems: Array<{
      wasteType: string
      actualWeight?: number
      price?: number
    }>
    tps?: {
      name: string
      tpsProfile?: {
        tpsName: string
      }
    }
  }
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

export default function TransactionsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchTransactions()
    }
  }, [session])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions')
      const data = await res.json()
      setTransactions(data.data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

  if (!session) {
    return null
  }

  const totalEarnings = transactions.reduce((sum, t) => sum + t.totalPrice, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-gray-600 mt-2">
          Lihat semua transaksi penjualan sampah Anda
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-green-100">Total Pendapatan</p>
            <p className="text-4xl font-bold">
              Rp {totalEarnings.toLocaleString('id-ID')}
            </p>
            <p className="text-green-200 text-sm mt-1">
              Dari {transactions.length} transaksi
            </p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      transaction.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.isPaid ? 'Dibayar' : 'Menunggu Pembayaran'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2">
                    {transaction.pickupRequest.address}
                  </p>

                  {transaction.pickupRequest.tps && (
                    <p className="text-sm text-gray-500 mb-3">
                      TPS: {transaction.pickupRequest.tps.tpsProfile?.tpsName || transaction.pickupRequest.tps.name}
                    </p>
                  )}

                  {/* Waste Items */}
                  <div className="flex flex-wrap gap-2">
                    {transaction.pickupRequest.wasteItems.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                        {item.actualWeight && ` (${item.actualWeight} kg)`}
                        {item.price && ` - Rp ${item.price.toLocaleString('id-ID')}`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 text-right">
                  <p className="text-sm text-gray-500">Total Berat</p>
                  <p className="font-semibold">{transaction.totalWeight} kg</p>
                  <p className="text-sm text-gray-500 mt-2">Total Harga</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {transaction.totalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Belum Ada Transaksi
          </h3>
          <p className="text-gray-500 mb-6">
            Transaksi akan muncul setelah sampah Anda dijemput dan ditimbang oleh TPS
          </p>
          <Link
            href="/pickup/new"
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Buat Permintaan Penjemputan
          </Link>
        </div>
      )}
    </div>
  )
}
