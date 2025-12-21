'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface TPSLocationPickerProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number, address: string) => void
  className?: string
}

export default function TPSLocationPicker({
  latitude,
  longitude,
  onLocationChange,
  className = 'h-[400px] w-full'
}: TPSLocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [latitude || -7.257472, longitude || 112.752090],
      latitude && longitude ? 16 : 13
    )

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map)

    mapRef.current = map

    // Add click handler
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      updateMarker(lat, lng)
      const addressText = await reverseGeocode(lat, lng)
      onLocationChange(lat, lng, addressText)
    })

    // Add initial marker if coordinates are provided
    if (latitude && longitude) {
      updateMarker(latitude, longitude)
      reverseGeocode(latitude, longitude).then(addr => setAddress(addr))
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update marker position
  useEffect(() => {
    if (latitude && longitude && mapRef.current) {
      updateMarker(latitude, longitude)
      mapRef.current.setView([latitude, longitude], 16)
      reverseGeocode(latitude, longitude).then(addr => setAddress(addr))
    }
  }, [latitude, longitude])

  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Create custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #10B981;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background-color: white;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    })

    // Add new marker
    const marker = L.marker([lat, lng], { 
      icon,
      draggable: true 
    }).addTo(mapRef.current)

    // Handle marker drag
    marker.on('dragend', async () => {
      const position = marker.getLatLng()
      const addressText = await reverseGeocode(position.lat, position.lng)
      onLocationChange(position.lat, position.lng, addressText)
    })

    markerRef.current = marker
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(addr)
      return addr
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(addr)
      return addr
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Surabaya')}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16)
          updateMarker(latitude, longitude)
          onLocationChange(latitude, longitude, display_name)
        }
      } else {
        alert('Lokasi tidak ditemukan. Coba kata kunci lain.')
      }
    } catch (error) {
      console.error('Search error:', error)
      alert('Terjadi kesalahan saat mencari lokasi')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cari lokasi di Surabaya..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Cari</span>
            </>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div className={`${className} rounded-lg overflow-hidden border-2 border-gray-300 relative`}>
        <div ref={mapContainerRef} className="h-full w-full" />
        
        {/* Instructions Overlay */}
        <div className="absolute top-3 left-3 bg-white rounded-lg shadow-lg px-4 py-2 text-sm z-[1000]">
          <p className="font-semibold text-green-800 flex items-center space-x-2">
            <MapPin size={16} />
            <span>Klik pada peta atau drag marker untuk memilih lokasi</span>
          </p>
        </div>
      </div>

      {/* Selected Location Info */}
      {address && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-green-900 mb-1">Lokasi yang Dipilih:</p>
          <p className="text-sm text-green-800">{address}</p>
          <p className="text-xs text-green-700 mt-1">
            Koordinat: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
