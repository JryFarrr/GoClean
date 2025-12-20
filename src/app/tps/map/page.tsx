'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

interface PickupLocation {
  id: string
  lat: number
  lng: number
  title: string
  description: string
  address: string
  status: string
  photos: string[]
  wasteItems: Array<{ wasteType: string; estimatedWeight: number }>
  user: { name: string; phone?: string }
  type: 'pickup'
}

export default function TPSMapPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [markers, setMarkers] = useState<PickupLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login')
    } else if (authStatus === 'authenticated' && session?.user.role !== 'TPS') {
      router.push('/dashboard')
      toast.error('Akses ditolak')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session?.user && session.user.role === 'TPS') {
      fetchPickupLocations()
    }
  }, [session])

  const fetchPickupLocations = async () => {
    try {
      // Fetch pickups with multiple statuses (active pickups)
      const statuses = ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'PICKED_UP']
      const allPickups = []

      for (const status of statuses) {
        const res = await fetch(`/api/pickups?status=${status}`)
        const data = await res.json()
        if (data.data) {
          allPickups.push(...data.data)
        }
      }
      
      const locations: PickupLocation[] = allPickups.map((pickup: {
        id: string
        latitude: number
        longitude: number
        address: string
        status: string
        photos: string | string[]
        user: { name: string; phone?: string }
        wasteItems: Array<{ wasteType: string; estimatedWeight: number }>
      }) => {
        const parsedPhotos = typeof pickup.photos === 'string' 
          ? JSON.parse(pickup.photos || '[]') 
          : pickup.photos

        return {
          id: pickup.id,
          lat: pickup.latitude,
          lng: pickup.longitude,
          title: pickup.user.name,
          description: pickup.address,
          address: pickup.address,
          status: pickup.status,
          photos: parsedPhotos,
          wasteItems: pickup.wasteItems,
          user: pickup.user,
          type: 'pickup' as const
        }
      })

      setMarkers(locations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Gagal memuat lokasi')
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

  if (!session || session.user.role !== 'TPS') {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-green-50 to-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Peta Lokasi Penjemputan</h1>
        <p className="text-green-700 mt-2">
          Lihat semua lokasi permintaan penjemputan yang menunggu
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 border border-green-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-700">Menunggu Penjemputan</span>
            </div>
          </div>
          <p className="text-sm text-green-600">
            Total: {markers.length} lokasi
          </p>
        </div>

        <MapComponent
          markers={markers}
          className="h-[600px] w-full"
          zoom={12}
        />
      </div>

      {/* Location List */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-green-100">
        <h2 className="text-xl font-bold mb-4 text-green-800">Daftar Lokasi</h2>
        {markers.length > 0 ? (
          <div className="space-y-3">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <div>
                  <p className="font-semibold text-green-800">{marker.title}</p>
                  <p className="text-sm text-green-700">{marker.description}</p>
                </div>
                <button
                  onClick={() => window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lng}`,
                    '_blank'
                  )}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Navigasi
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-green-600 py-8">
            Tidak ada lokasi penjemputan
          </p>
        )}
      </div>
    </div>
  )
}
