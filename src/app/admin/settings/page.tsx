'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Settings, Database, Bell, Shield, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Setting {
  id: string
  key: string
  value: string
  description?: string
  category: string
  isPublic: boolean
}

interface SettingsData {
  [category: string]: Setting[]
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    console.log('Settings page - Auth status:', status)
    console.log('Settings page - Session:', session)
    console.log('Settings page - User role:', session?.user?.role)
    
    if (status === 'unauthenticated') {
      console.log('Settings page - User not authenticated, redirecting to login')
      router.push('/admin/login')
      return
    }

    if (status === 'loading') {
      console.log('Settings page - Auth still loading')
      return
    }

    if (session?.user?.role?.toUpperCase() !== 'ADMIN') {
      console.log('Settings page - User does not have ADMIN role, redirecting to login')
      router.push('/admin/login')
      return
    }

    console.log('Settings page - User authenticated as admin, fetching settings')
    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat pengaturan'
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string, category: string, description?: string) => {
    try {
      setSaving(key)
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, category, description })
      })

      if (!res.ok) throw new Error('Failed to update setting')

      const updatedSetting = await res.json()

      // Update local state
      setSettings(prev => ({
        ...prev,
        [category]: prev[category]?.map(s =>
          s.key === key ? updatedSetting : s
        ) || [updatedSetting]
      }))

      toast.success('Pengaturan berhasil disimpan')
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(null)
    }
  }

  const getSettingValue = (category: string, key: string, defaultValue: string = '') => {
    return settings[category]?.find(s => s.key === key)?.value || defaultValue
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-green-600">Memuat settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="text-green-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-green-800">Pengaturan Sistem</h1>
              <p className="text-green-600">Kelola konfigurasi aplikasi GoClean</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-green-800">Notifikasi</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Email Notifications</p>
                  <p className="text-sm text-gray-600">Kirim notifikasi via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={getSettingValue('notification', 'email_notifications') === 'true'}
                    onChange={(e) => updateSetting('email_notifications', e.target.checked.toString(), 'notification', 'Enable email notifications')}
                    disabled={saving === 'email_notifications'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  {saving === 'email_notifications' && <Loader2 className="animate-spin ml-2" size={16} />}
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Push Notifications</p>
                  <p className="text-sm text-gray-600">Notifikasi real-time</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={getSettingValue('notification', 'push_notifications') === 'true'}
                    onChange={(e) => updateSetting('push_notifications', e.target.checked.toString(), 'notification', 'Enable push notifications')}
                    disabled={saving === 'push_notifications'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  {saving === 'push_notifications' && <Loader2 className="animate-spin ml-2" size={16} />}
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-green-800">Keamanan</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Session Timeout</p>
                <p className="text-sm text-gray-600">30 hari</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Two-Factor Auth</p>
                <p className="text-sm text-yellow-600">⚠ Belum diaktifkan</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Admin Secret Code</p>
                <p className="text-sm text-green-600">✓ Dikonfigurasi</p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-green-800">Database & Sistem</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Database Status</p>
                <p className="text-sm text-green-600">✓ Connected (MySQL)</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">App Version</p>
                <p className="text-sm text-gray-600">GoClean v1.0.0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Environment</p>
                <p className="text-sm text-gray-600">{process.env.NODE_ENV || 'development'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Settings className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-800 mb-2">Informasi Pengaturan</h3>
              <p className="text-blue-700 text-sm">
                Pengaturan ini mengontrol berbagai aspek dari aplikasi GoClean. 
                Beberapa perubahan mungkin memerlukan restart aplikasi untuk diterapkan.
                Pastikan untuk berkonsultasi dengan tim teknis sebelum mengubah pengaturan kritis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
