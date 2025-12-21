'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react'

interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchNotifications()
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => 
            fetch(`/api/notifications/${n.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isRead: true })
            })
          )
      )
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600">Memuat notifikasi...</p>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="text-green-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-green-800">Notifikasi Admin</h1>
                <p className="text-green-600 text-sm">
                  {unreadCount} notifikasi belum dibaca
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check size={18} />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Bell className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-500 text-lg">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${
                  !notification.isRead ? 'border-l-4 border-green-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      )}
                      <h3 className="font-bold text-green-800">{notification.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{notification.message}</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {notification.type}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Hapus notifikasi"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
