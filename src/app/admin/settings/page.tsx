'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Settings, Database, Bell, Shield, Palette } from 'lucide-react'

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600">Memuat settings...</p>
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
          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-green-800">Database & Sistem</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Database Status</p>
                <p className="text-sm text-green-600">✓ Connected (SQL Server)</p>
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
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-700">Push Notifications</p>
                  <p className="text-sm text-gray-600">Notifikasi real-time</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
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

          {/* Appearance Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-green-800">Tampilan</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Theme</p>
                <select className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600">
                  <option>Light Mode</option>
                  <option>Dark Mode</option>
                  <option>System Default</option>
                </select>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700">Primary Color</p>
                <div className="mt-2 flex space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full border-2 border-green-800"></div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
                  <div className="w-8 h-8 bg-orange-600 rounded-full"></div>
                </div>
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
