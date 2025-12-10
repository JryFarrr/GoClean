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
    address?: string
    status?: string
    photos?: string[]
    wasteItems?: Array<{ wasteType: string; estimatedWeight: number }>
    user?: { name: string; phone?: string }
    type?: 'user' | 'tps' | 'pickup'
  }>
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  onMarkerRemove?: () => void
  selectable?: boolean
  draggable?: boolean
  showRemoveButton?: boolean
  className?: string
}

export default function MapComponent({
  center = [-6.2088, 106.8456], // Jakarta default
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerRemove,
  selectable = false,
  draggable = false,
  showRemoveButton = false,
  className = 'h-[400px] w-full'
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<L.Marker | null>(null)
  const markersLayerRef = useRef<L.Marker[]>([])

  // Custom icons
  const createIcon = (type: string, status?: string) => {
    const colors = {
      user: '#3B82F6',
      tps: '#10B981',
      pickup: '#F59E0B',
      selected: '#EF4444',
      PENDING: '#F59E0B',
      ACCEPTED: '#3B82F6',
      ON_THE_WAY: '#8B5CF6',
      PICKED_UP: '#10B981'
    }
    
    const color = status && colors[status as keyof typeof colors] 
      ? colors[status as keyof typeof colors]
      : colors[type as keyof typeof colors] || colors.pickup
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          cursor: pointer;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            font-weight: bold;
          ">
            ${type === 'tps' ? '🏭' : type === 'user' ? '👤' : '📍'}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
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

        // Add new marker (draggable if specified)
        const marker = L.marker([lat, lng], {
          icon: createIcon('selected'),
          draggable: draggable
        }).addTo(mapRef.current!)

        setSelectedMarker(marker)

        // Handle drag end event if draggable
        if (draggable) {
          marker.on('dragend', async function(event) {
            const position = event.target.getLatLng()
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
              )
              const data = await response.json()
              const address = data.display_name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
              
              marker.setPopupContent(`<b>Lokasi Dipilih</b><br>${address}<br><small>(Geser marker untuk mengubah)</small>`).openPopup()
              if (onLocationSelect) {
                onLocationSelect(position.lat, position.lng, address)
              }
            } catch {
              if (onLocationSelect) {
                onLocationSelect(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
              }
            }
          })
        }

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          )
          const data = await response.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          
          const popupContent = draggable 
            ? `<b>Lokasi Dipilih</b><br>${address}<br><small>(Geser marker untuk mengubah)</small>`
            : `<b>Lokasi Dipilih</b><br>${address}`
            
          marker.bindPopup(popupContent).openPopup()
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

    // Clear previous markers
    markersLayerRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker)
    })
    markersLayerRef.current = []

    // Add new markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createIcon(marker.type || 'pickup', marker.status)
      }).addTo(mapRef.current!)

      markersLayerRef.current.push(leafletMarker)

      // Create popup content with photos
      let popupContent = `<div style="min-width: 200px; max-width: 300px;">`
      popupContent += `<b style="font-size: 14px;">${marker.title}</b><br>`
      
      if (marker.status) {
        const statusLabels: Record<string, string> = {
          PENDING: 'Menunggu',
          ACCEPTED: 'Diterima',
          ON_THE_WAY: 'Dalam Perjalanan',
          PICKED_UP: 'Sudah Dijemput'
        }
        const statusColors: Record<string, string> = {
          PENDING: '#F59E0B',
          ACCEPTED: '#3B82F6',
          ON_THE_WAY: '#8B5CF6',
          PICKED_UP: '#10B981'
        }
        popupContent += `<span style="background: ${statusColors[marker.status]}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${statusLabels[marker.status]}</span><br>`
      }

      if (marker.address) {
        popupContent += `<small style="color: #666;">📍 ${marker.address}</small><br>`
      }

      if (marker.wasteItems && marker.wasteItems.length > 0) {
        popupContent += `<div style="margin-top: 8px; font-size: 12px;">`
        popupContent += `<b>Jenis Sampah:</b><br>`
        marker.wasteItems.forEach(item => {
          popupContent += `• ${item.wasteType}: ${item.estimatedWeight}kg<br>`
        })
        popupContent += `</div>`
      }

      if (marker.user?.phone) {
        popupContent += `<small style="color: #666;">📞 ${marker.user.phone}</small><br>`
      }

      // Add photos if available
      if (marker.photos && marker.photos.length > 0) {
        popupContent += `<div style="margin-top: 8px;">`
        popupContent += `<b style="font-size: 12px;">Foto Sampah:</b><br>`
        popupContent += `<div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">`
        marker.photos.slice(0, 3).forEach((photo, index) => {
          popupContent += `<img src="${photo}" alt="Foto ${index + 1}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="window.open('${photo}', '_blank')" />`
        })
        if (marker.photos.length > 3) {
          popupContent += `<div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-center; font-size: 12px; color: #666;">+${marker.photos.length - 3} foto</div>`
        }
        popupContent += `</div>`
        popupContent += `</div>`
      }

      popupContent += `</div>`

      leafletMarker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Open popup on hover for TPS view
      if (marker.type === 'pickup') {
        leafletMarker.on('mouseover', function(this: L.Marker) {
          this.openPopup()
        })
      }
    })

    // Fit bounds if there are markers
    if (markers.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
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
                icon: createIcon('selected'),
                draggable: draggable
              }).addTo(mapRef.current)

              setSelectedMarker(marker)

              // Handle drag if draggable
              if (draggable) {
                marker.on('dragend', async function(event) {
                  const position = event.target.getLatLng()
                  try {
                    const response = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
                    )
                    const data = await response.json()
                    const address = data.display_name
                    marker.setPopupContent(`<b>Lokasi Anda</b><br>${address}<br><small>(Geser marker untuk mengubah)</small>`).openPopup()
                    if (onLocationSelect) {
                      onLocationSelect(position.lat, position.lng, address)
                    }
                  } catch {
                    if (onLocationSelect) {
                      onLocationSelect(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
                    }
                  }
                })
              }

              // Get address
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                )
                const data = await response.json()
                const address = data.display_name
                
                const popupText = draggable 
                  ? `<b>Lokasi Anda</b><br>${address}<br><small>(Geser marker untuk mengubah)</small>`
                  : `<b>Lokasi Anda</b><br>${address}`
                
                marker.bindPopup(popupText).openPopup()
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

  const removeMarker = () => {
    if (selectedMarker && mapRef.current) {
      mapRef.current.removeLayer(selectedMarker)
      setSelectedMarker(null)
      if (onMarkerRemove) {
        onMarkerRemove()
      }
    }
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={`${className} rounded-lg z-0`} />
      {selectable && (
        <>
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
          {showRemoveButton && selectedMarker && (
            <button
              type="button"
              onClick={removeMarker}
              className="absolute bottom-4 right-40 z-[1000] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Hapus Marker</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
