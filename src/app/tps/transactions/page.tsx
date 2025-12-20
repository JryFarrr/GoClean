'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react'
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
    user: {
      name: string
      phone?: string
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

export default function TPSTransactionsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role !== 'TPS') {
      router.push('/dashboard')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user?.role === 'TPS') {
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

  const handleMarkAsPaid = async (transactionId: string) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, isPaid: true })
      })

      if (res.ok) {
        setTransactions(prev =>
          prev.map(t => t.id === transactionId ? { ...t, isPaid: true } : t)
        )
        toast.success('Transaksi berhasil ditandai lunas')
      } else {
        toast.error('Gagal mengupdate transaksi')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Terjadi kesalahan')
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

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'paid') return t.isPaid
    if (filter === 'unpaid') return !t.isPaid
    return true
  })

  const totalTransactions = transactions.length
  const totalPaid = transactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.totalPrice, 0)
  const totalUnpaid = transactions.filter(t => !t.isPaid).reduce((sum, t) => sum + t.totalPrice, 0)
  const totalWeight = transactions.reduce((sum, t) => sum + t.totalWeight, 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-green-700 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-green-800">Transaksi Pembayaran</h1>
        <p className="text-green-700 mt-2">
          Kelola pembayaran sampah dari masyarakat
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-700">Total Transaksi</p>
              <p className="text-2xl font-bold text-green-800">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-700">Sudah Dibayar</p>
              <p className="text-2xl font-bold text-green-600">
                Rp {totalPaid.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-700">Belum Dibayar</p>
              <p className="text-2xl font-bold text-yellow-600">
                Rp {totalUnpaid.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Filter className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-green-700">Total Berat</p>
              <p className="text-2xl font-bold text-green-800">{totalWeight} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unpaid'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Belum Dibayar
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Sudah Dibayar
        </button>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-green-100"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.isPaid ? '✓ Sudah Dibayar' : '⏳ Belum Dibayar'}
                    </span>
                    <span className="text-sm text-green-600 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <p className="font-semibold text-green-800">
                      {transaction.pickupRequest.user.name}
                    </p>
                    {transaction.pickupRequest.user.phone && (
                      <p className="text-sm text-green-600">
                        {transaction.pickupRequest.user.phone}
                      </p>
                    )}
                    <p className="text-green-700 text-sm mt-1">
                      {transaction.pickupRequest.address}
                    </p>
                  </div>

                  {/* Waste Items */}
                  <div className="flex flex-wrap gap-2">
                    {transaction.pickupRequest.wasteItems.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-green-50 rounded-full text-sm text-green-700"
                      >
                        {WASTE_TYPE_LABELS[item.wasteType] || item.wasteType}
                        {item.actualWeight && ` (${item.actualWeight} kg)`}
                        {item.price && ` - Rp ${item.price.toLocaleString('id-ID')}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="mt-4 lg:mt-0 lg:ml-6 text-right flex-shrink-0">
                  <p className="text-sm text-green-700">Total Berat</p>
                  <p className="font-semibold text-green-800">{transaction.totalWeight} kg</p>
                  <p className="text-sm text-green-700 mt-2">Total Harga</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {transaction.totalPrice.toLocaleString('id-ID')}
                  </p>

                  {!transaction.isPaid && (
                    <button
                      onClick={() => handleMarkAsPaid(transaction.id)}
                      className="mt-4 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Tandai Lunas
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-green-100">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {filter !== 'all' ? 'Tidak Ada Transaksi' : 'Belum Ada Transaksi'}
          </h3>
          <p className="text-green-700">
            {filter === 'unpaid'
              ? 'Semua transaksi sudah dibayar'
              : filter === 'paid'
              ? 'Belum ada transaksi yang dibayar'
              : 'Transaksi akan muncul setelah penjemputan selesai'}
          </p>
        </div>
      )}
    </div>
  )
}
