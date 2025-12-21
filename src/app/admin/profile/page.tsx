'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Shield, Calendar, Edit, Save, X } from 'lucide-react'

interface ProfileData {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export default function AdminProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()
      setProfile(data)
      setEditForm({ name: data.name, email: data.email })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        await fetchProfile()
        setIsEditing(false)
        alert('Profile berhasil diperbarui!')
      } else {
        alert('Gagal memperbarui profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-600">Memuat profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-red-600">Gagal memuat profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="text-green-600" size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Shield size={16} />
                <span className="text-green-100">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-green-800">Informasi Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Edit size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({ name: profile.name, email: profile.email })
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  <X size={18} />
                  <span>Batal</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <User className="text-green-600" size={20} />
                  <span className="text-gray-800">{profile.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              ) : (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <Mail className="text-green-600" size={20} />
                  <span className="text-gray-800">{profile.email}</span>
                </div>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <Shield className="text-green-600" size={20} />
                <span className="text-gray-800 font-semibold">{profile.role}</span>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terdaftar Sejak
              </label>
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <Calendar className="text-green-600" size={20} />
                <span className="text-gray-800">
                  {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Shield className="text-yellow-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Keamanan Akun</h3>
              <p className="text-yellow-700 text-sm">
                Sebagai administrator, pastikan untuk selalu menjaga keamanan akun Anda. 
                Jangan bagikan kredensial login kepada siapa pun dan gunakan password yang kuat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
