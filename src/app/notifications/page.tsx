'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  ArrowLeft, 
  Bell, 
  Check, 
  CheckCheck,
  Trash2,
  Clock,
  Package,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotificationStore } from '@/lib/store'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const getNotificationIcon = (type: string) => {
  if (type.includes('accepted')) return '✅'
  if (type.includes('on_the_way')) return '🚛'
  if (type.includes('completed') || type.includes('picked_up')) return '✓'
  if (type.includes('transaction')) return '💰'
  if (type.includes('payment')) return '💳'
  if (type.includes('cancelled')) return '❌'
  if (type.includes('rejected')) return '⚠️'
  return '🔔'
}

const getNotificationColor = (type: string) => {
  if (type.includes('accepted') || type.includes('completed')) return 'bg-green-100 border-green-200'
  if (type.includes('on_the_way')) return 'bg-blue-100 border-blue-200'
  if (type.includes('transaction') || type.includes('payment')) return 'bg-emerald-100 border-emerald-200'
  if (type.includes('cancelled')) return 'bg-red-100 border-red-200'
  if (type.includes('rejected')) return 'bg-orange-100 border-orange-200'
  return 'bg-gray-100 border-gray-200'
}

export default function NotificationsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { setUnreadCount, decrementUnread } = useNotificationStore()

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.data || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Gagal memuat notifikasi')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id)
      const wasUnread = notification && !notification.isRead
      
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      })
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      
      // Kurangi counter jika notifikasi belum dibaca
      if (wasUnread) {
        decrementUnread()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('Semua notifikasi ditandai telah dibaca')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Gagal menandai notifikasi')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id)
      const wasUnread = notification && !notification.isRead
      
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      // Kurangi counter jika notifikasi belum dibaca
      if (wasUnread) {
        decrementUnread()
      }
      
      toast.success('Notifikasi dihapus')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Gagal menghapus notifikasi')
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

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-green-700 hover:text-green-600 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Notifikasi</h1>
            <p className="text-green-700 mt-2">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : 'Semua notifikasi telah dibaca'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <CheckCheck size={20} className="mr-2" />
              Tandai Semua Dibaca
            </button>
          )}
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
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'unread'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Belum Dibaca
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-700 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const emoji = getNotificationIcon(notification.type)
            const colorClass = getNotificationColor(notification.type)
            
            return (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 relative border-2 ${colorClass} ${
                !notification.isRead ? 'ring-2 ring-green-400 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`text-4xl flex-shrink-0`}>
                  {emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className={`leading-relaxed ${
                        !notification.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Clock size={14} className="text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Tandai sudah dibaca"
                        >
                          <Check size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-green-100">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {filter === 'unread' ? 'Tidak Ada Notifikasi Belum Dibaca' : 'Tidak Ada Notifikasi'}
          </h3>
          <p className="text-green-700">
            {filter === 'unread'
              ? 'Semua notifikasi Anda sudah dibaca'
              : 'Notifikasi baru akan muncul di sini'}
          </p>
        </div>
      )}
    </div>
  )
}
