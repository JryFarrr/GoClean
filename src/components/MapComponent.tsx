'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    id: string
    lat: number
    lng: number
    title: string
    description?: string
    type?: 'user' | 'tps' | 'pickup'
  }>
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  selectable?: boolean
  className?: string
}

export default function MapComponent({
  center = [-6.2088, 106.8456], // Jakarta default
  zoom = 13,
  markers = [],
  onLocationSelect,
  selectable = false,
  className = 'h-[400px] w-full'
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<L.Marker | null>(null)

  // Custom icons
  const createIcon = (type: string) => {
    const colors = {
      user: '#3B82F6',
      tps: '#10B981',
      pickup: '#F59E0B',
      selected: '#EF4444'
    }
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${colors[type as keyof typeof colors] || colors.pickup};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          ">
            ${type === 'tps' ? '🏭' : type === 'user' ? '👤' : '📍'}
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    })
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom)

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    // Add click handler for location selection
    if (selectable && onLocationSelect) {
      mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng

        // Remove previous selected marker
        if (selectedMarker) {
          mapRef.current?.removeLayer(selectedMarker)
        }

        // Add new marker
        const marker = L.marker([lat, lng], {
          icon: createIcon('selected')
        }).addTo(mapRef.current!)

        setSelectedMarker(marker)

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await response.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          
          marker.bindPopup(`<b>Lokasi Dipilih</b><br>${address}`).openPopup()
          onLocationSelect(lat, lng, address)
        } catch {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        }
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    // Add markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createIcon(marker.type || 'pickup')
      }).addTo(mapRef.current!)

      if (marker.title || marker.description) {
        leafletMarker.bindPopup(`
          <b>${marker.title}</b>
          ${marker.description ? `<br>${marker.description}` : ''}
        `)
      }
    })
  }, [markers])

  // Get current location button
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15)

            if (selectable && onLocationSelect) {
              // Remove previous marker
              if (selectedMarker) {
                mapRef.current.removeLayer(selectedMarker)
              }

              const marker = L.marker([latitude, longitude], {
                icon: createIcon('selected')
              }).addTo(mapRef.current)

              setSelectedMarker(marker)

              // Get address
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                )
                const data = await response.json()
                const address = data.display_name
                
                marker.bindPopup(`<b>Lokasi Anda</b><br>${address}`).openPopup()
                onLocationSelect(latitude, longitude, address)
              } catch {
                onLocationSelect(latitude, longitude, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
              }
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Gagal mendapatkan lokasi. Pastikan GPS aktif.')
        }
      )
    } else {
      alert('Geolocation tidak didukung browser ini')
    }
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={`${className} rounded-lg z-0`} />
      {selectable && (
        <button
          type="button"
          onClick={getCurrentLocation}
          className="absolute bottom-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="2" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
          </svg>
          <span>Lokasi Saya</span>
        </button>
      )}
    </div>
  )
}
