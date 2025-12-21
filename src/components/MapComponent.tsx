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
    kecamatan?: string
    operatingHours?: string
    phone?: string
  }>
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  onMarkerRemove?: () => void
  onTPSSelect?: (tpsId: string, lat: number, lng: number, address: string) => void
  selectable?: boolean
  draggable?: boolean
  showRemoveButton?: boolean
  showTPSMarkers?: boolean
  clearMarker?: boolean
  currentLat?: number
  currentLng?: number
  className?: string
  selectedTPSId?: string // ID TPS yang dipilih dari panel kecamatan
  highlightedMarkerId?: string // ID marker yang akan di-highlight
}

export default function MapComponent({
  center = [-7.257472, 112.752090], // Surabaya default
  zoom = 13,
  markers = [],
  onLocationSelect,
  onMarkerRemove,
  onTPSSelect,
  selectable = false,
  draggable = false,
  showRemoveButton = false,
  showTPSMarkers = false,
  currentLat = 0,
  currentLng = 0,
  className = 'h-[400px] w-full',
  selectedTPSId: externalSelectedTPSId = '', // TPS yang dipilih dari luar
  highlightedMarkerId = '' // Marker yang akan di-highlight dengan animasi
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<L.Marker | null>(null)
  const markersLayerRef = useRef<L.Marker[]>([])
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchType, setSearchType] = useState<'name' | 'category' | 'radius'>('name')
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
  const [searchRadius, setSearchRadius] = useState<number>(1) // dalam km
  const [filteredMarkers, setFilteredMarkers] = useState<any[]>([])
  const [selectedTPSId, setSelectedTPSId] = useState<string>('')
  const [forceRefresh, setForceRefresh] = useState<number>(0) // untuk force re-render markers
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const radiusCircleRef = useRef<L.Circle | null>(null)
  const highlightMarkerRef = useRef<L.Marker | null>(null)

  // Custom icons
  const createIcon = (type: string, status?: string, isHighlighted: boolean = false) => {
    const colors = {
      user: '#3B82F6',
      tps: '#10B981',
      pickup: '#F59E0B',
      selected: '#EF4444',
      highlighted: '#DC2626', // Merah terang untuk highlight
      PENDING: '#F59E0B',
      ACCEPTED: '#3B82F6',
      ON_THE_WAY: '#8B5CF6',
      PICKED_UP: '#10B981'
    }
    
    const color = isHighlighted 
      ? colors.highlighted
      : status && colors[status as keyof typeof colors] 
        ? colors[status as keyof typeof colors]
        : colors[type as keyof typeof colors] || colors.pickup
    
    const size = isHighlighted ? 48 : 32
    const pulse = isHighlighted ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${isHighlighted ? '4px' : '3px'} solid white;
          box-shadow: 0 ${isHighlighted ? '6px 16px' : '3px 8px'} rgba(0,0,0,${isHighlighted ? '0.6' : '0.4'});
          cursor: pointer;
          ${pulse}
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: ${isHighlighted ? '24px' : '16px'};
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
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size]
    })
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false // Remove default zoom control
    }).setView(center, zoom)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapRef.current)

    // Add custom zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
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

  // Clear selected marker when showRemoveButton becomes false (external reset)
  useEffect(() => {
    if (!showRemoveButton && selectedMarker && mapRef.current) {
      mapRef.current.removeLayer(selectedMarker)
      setSelectedMarker(null)
      
      // Hapus lingkaran radius jika ada
      if (radiusCircleRef.current && mapRef.current) {
        mapRef.current.removeLayer(radiusCircleRef.current)
        radiusCircleRef.current = null
      }
      
      // Reset filter dan search results
      setFilteredMarkers([])
      setSearchResults([])
      setShowResults(false)
      
      // Reset TPS yang dipilih - ini akan trigger useEffect untuk re-render markers
      setSelectedTPSId('')
      setForceRefresh(prev => prev + 1) // Force re-render markers
    }
  }, [showRemoveButton, selectedMarker, markers])

  // Sync external selectedTPSId dengan internal state dan pan map ke TPS
  useEffect(() => {
    if (externalSelectedTPSId && externalSelectedTPSId !== selectedTPSId) {
      setSelectedTPSId(externalSelectedTPSId)
      
      // Pan map ke lokasi TPS yang dipilih
      const selectedMarkerData = markers.find(m => m.id === externalSelectedTPSId)
      if (selectedMarkerData && mapRef.current) {
        mapRef.current.setView([selectedMarkerData.lat, selectedMarkerData.lng], 16, {
          animate: true,
          duration: 0.5
        })
      }
    }
  }, [externalSelectedTPSId, markers])

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
      // Check if this marker should be highlighted
      const isHighlighted = highlightedMarkerId && marker.id === highlightedMarkerId
      // Gunakan warna merah jika TPS ini dipilih
      const isSelected = marker.id === selectedTPSId
      const iconType = isSelected ? 'selected' : (marker.type || 'pickup')
      
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createIcon(iconType, marker.status, isHighlighted)
      }).addTo(mapRef.current!)

      markersLayerRef.current.push(leafletMarker)
      
      // Jika marker di-highlight, pan ke marker dan open popup
      if (isHighlighted) {
        mapRef.current?.setView([marker.lat, marker.lng], 16, { animate: true })
        setTimeout(() => {
          leafletMarker.openPopup()
        }, 500)
      }

      // Create popup content with photos
      let popupContent = `<div style="min-width: 200px; max-width: 300px;">`
      popupContent += `<b style="font-size: 14px;">${marker.title}</b><br>`
      
      // TPS specific info
      if (marker.type === 'tps') {
        if (marker.kecamatan) {
          popupContent += `<span style="background: #10B981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 4px; display: inline-block;">Kec. ${marker.kecamatan}</span><br>`
        }
        if (marker.address) {
          popupContent += `<small style="color: #666;">📍 ${marker.address}</small><br>`
        }
        if (marker.operatingHours) {
          popupContent += `<small style="color: #666;">🕐 ${marker.operatingHours}</small><br>`
        }
        if (marker.phone) {
          popupContent += `<small style="color: #666;">📞 ${marker.phone}</small><br>`
        }
        popupContent += `<div style="margin-top: 8px;"><small style="color: #059669; font-weight: 600;">Klik untuk memilih TPS ini</small></div>`
      }
      
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

      if (marker.address && marker.type !== 'tps') {
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

      // Click handler for TPS selection
      if (marker.type === 'tps' && onTPSSelect) {
        leafletMarker.on('click', () => {
          setSelectedTPSId(marker.id) // Highlight TPS yang dipilih
          onTPSSelect(marker.id, marker.lat, marker.lng, marker.address || '')
        })
      }

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
  }, [markers, selectedTPSId, forceRefresh, highlightedMarkerId]) // Tambahkan highlightedMarkerId untuk trigger re-render saat highlight berubah

  // Update markers visibility based on filtered markers (highlight filtered, dim others)
  useEffect(() => {
    if (!mapRef.current || filteredMarkers.length === 0) return

    // When there are filtered markers, fit bounds to show them
    if (filteredMarkers.length > 0) {
      const bounds = L.latLngBounds(filteredMarkers.map(m => [m.lat, m.lng]))
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [filteredMarkers])

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
      
      // Hapus lingkaran radius jika ada
      if (radiusCircleRef.current && mapRef.current) {
        mapRef.current.removeLayer(radiusCircleRef.current)
        radiusCircleRef.current = null
      }
      
      // Reset filter dan search results
      setFilteredMarkers([])
      setSearchResults([])
      setShowResults(false)
      
      // Reset TPS yang dipilih - ini akan trigger useEffect untuk re-render markers
      setSelectedTPSId('')
      setForceRefresh(prev => prev + 1) // Force re-render markers
      
      if (onMarkerRemove) {
        onMarkerRemove()
      }
    }
  }

  // A. SEARCH NON-SPASIAL (berbasis atribut)
  // 1. Search berdasarkan nama objek (TPS)
  const searchByName = (query: string) => {
    const filtered = markers.filter(marker => 
      marker.title.toLowerCase().includes(query.toLowerCase()) ||
      (marker.address && marker.address.toLowerCase().includes(query.toLowerCase()))
    )
    return filtered
  }

  // 2. Filter berdasarkan kategori (kecamatan)
  const filterByKecamatan = (kecamatan: string) => {
    if (!kecamatan) return markers
    const filtered = markers.filter(marker => 
      marker.kecamatan && marker.kecamatan.toLowerCase() === kecamatan.toLowerCase()
    )
    return filtered
  }

  // B. SEARCH SPASIAL (berbasis posisi/geometri)
  // 1. Buffer Search - Pencarian berdasarkan radius menggunakan Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const searchByRadius = (centerLat: number, centerLng: number, radiusKm: number) => {
    const filtered = markers.filter(marker => {
      const distance = calculateDistance(centerLat, centerLng, marker.lat, marker.lng)
      return distance <= radiusKm
    })
    return filtered
  }

  // Unified search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      setShowResults(false)
      setFilteredMarkers([])
      return
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        if (searchType === 'name') {
          // Search Non-Spasial: berdasarkan nama
          const filtered = searchByName(query)
          setSearchResults(filtered)
          setFilteredMarkers(filtered)
          setShowResults(filtered.length > 0)
        } else {
          // Geocoding untuk lokasi umum
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Surabaya')}&limit=5&addressdetails=1`
          )
          const data = await response.json()
          setSearchResults(data)
          setShowResults(data.length > 0)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  // Handle kategori filter
  const handleKecamatanFilter = (kecamatan: string) => {
    setSelectedKecamatan(kecamatan)
    const filtered = filterByKecamatan(kecamatan)
    setFilteredMarkers(filtered)
    setSearchResults(filtered)
    setShowResults(filtered.length > 0)
  }

  // Handle radius search
  const handleRadiusSearch = () => {
    if (!currentLat || !currentLng) {
      alert('Pilih lokasi terlebih dahulu untuk pencarian radius')
      return
    }

    // Search spasial: buffer search
    const filtered = searchByRadius(currentLat, currentLng, searchRadius)
    setFilteredMarkers(filtered)
    setSearchResults(filtered)
    setShowResults(filtered.length > 0)

    // Draw radius circle on map
    if (mapRef.current) {
      // Remove previous circle
      if (radiusCircleRef.current) {
        mapRef.current.removeLayer(radiusCircleRef.current)
      }

      // Draw new circle
      const circle = L.circle([currentLat, currentLng], {
        color: '#10B981',
        fillColor: '#10B981',
        fillOpacity: 0.1,
        radius: searchRadius * 1000 // convert to meters
      }).addTo(mapRef.current)

      radiusCircleRef.current = circle
    }
  }

  // Select search result
  const handleSelectResult = async (result: any) => {
    // Check if result is a marker (from non-spatial search) or location (from geocoding)
    if (result.id && result.lat && result.lng) {
      // Result adalah marker (TPS) dari non-spatial search
      const lat = result.lat
      const lng = result.lng
      const address = result.address || result.title

      // Set selected TPS untuk highlight dengan warna merah
      setSelectedTPSId(result.id)

      // Fly to location
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 16, {
          duration: 1.5
        })
      }

      // Trigger TPS selection if available
      if (onTPSSelect && result.type === 'tps') {
        onTPSSelect(result.id, lat, lng, address)
      } else if (selectable && onLocationSelect) {
        onLocationSelect(lat, lng, address)
      }

      setShowResults(false)
      setSearchQuery('')
      return
    }

    // Result dari geocoding (Nominatim)
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const address = result.display_name

    // Fly to location
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 16, {
        duration: 1.5
      })
    }

    // Add marker if selectable
    if (selectable && onLocationSelect) {
      // Remove previous selected marker
      if (selectedMarker && mapRef.current) {
        mapRef.current.removeLayer(selectedMarker)
      }

      // Add new marker
      const marker = L.marker([lat, lng], {
        icon: createIcon('selected'),
        draggable: draggable
      }).addTo(mapRef.current!)

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
            const newAddress = data.display_name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
            
            marker.setPopupContent(`<b>Lokasi Dipilih</b><br>${newAddress}<br><small>(Geser marker untuk mengubah)</small>`).openPopup()
            if (onLocationSelect) {
              onLocationSelect(position.lat, position.lng, newAddress)
            }
          } catch {
            if (onLocationSelect) {
              onLocationSelect(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
            }
          }
        })
      }

      const popupContent = draggable 
        ? `<b>Lokasi Dipilih</b><br>${address}<br><small>(Geser marker untuk mengubah)</small>`
        : `<b>Lokasi Dipilih</b><br>${address}`
        
      marker.bindPopup(popupContent).openPopup()
      onLocationSelect(lat, lng, address)
    }

    // Close search results
    setShowResults(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />
      
      {/* Search Box */}
      {selectable && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="relative max-w-2xl">
            {/* Search Type Tabs */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => {
                  setSearchType('name')
                  setSearchQuery('')
                  setSearchResults([])
                  setShowResults(false)
                  setSelectedTPSId('')
                  setSelectedKecamatan('')
                  setFilteredMarkers([])
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  searchType === 'name' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Nama TPS
              </button>
              <button
                onClick={() => {
                  setSearchType('radius')
                  setSearchQuery('')
                  setSearchResults([])
                  setShowResults(false)
                  setSelectedTPSId('')
                  setSelectedKecamatan('')
                  setFilteredMarkers([])
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  searchType === 'radius' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Radius
              </button>
            </div>

            {/* Search Input - untuk nama dan kategori */}
            {searchType !== 'radius' && (
              <div className="relative">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder={
                    searchType === 'name' 
                      ? 'Cari nama TPS...' 
                      : 'Cari kecamatan...'
                  }
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* Radius Search Controls */}
            {searchType === 'radius' && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Radius Pencarian: {searchRadius} km
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.5 km</span>
                      <span>10 km</span>
                    </div>
                  </div>
                  <button
                    onClick={handleRadiusSearch}
                    disabled={!currentLat || !currentLng}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {!currentLat || !currentLng 
                      ? 'Pilih lokasi terlebih dahulu' 
                      : `Cari dalam radius ${searchRadius} km`
                    }
                  </button>
                  {filteredMarkers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-green-600 font-semibold mb-2">
                        Ditemukan {filteredMarkers.length} TPS dalam radius {searchRadius} km:
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredMarkers
                          .sort((a, b) => {
                            const distA = calculateDistance(currentLat, currentLng, a.lat, a.lng)
                            const distB = calculateDistance(currentLat, currentLng, b.lat, b.lng)
                            return distA - distB
                          })
                          .map((marker, index) => {
                            const distance = calculateDistance(currentLat, currentLng, marker.lat, marker.lng)
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  // Set selected TPS untuk highlight dengan warna merah
                                  setSelectedTPSId(marker.id)
                                  
                                  if (onTPSSelect && marker.type === 'tps') {
                                    onTPSSelect(marker.id, marker.lat, marker.lng, marker.address || '')
                                  }
                                  if (mapRef.current) {
                                    mapRef.current.flyTo([marker.lat, marker.lng], 16, { duration: 1 })
                                  }
                                }}
                                className={`w-full text-left p-2 rounded-lg transition text-xs ${
                                  marker.id === selectedTPSId 
                                    ? 'bg-red-100 border border-red-300' 
                                    : 'bg-green-50 hover:bg-green-100'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-2 flex-1 min-w-0">
                                    <span className="text-base">🏭</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">
                                        {marker.title}
                                      </p>
                                      {marker.kecamatan && (
                                        <p className="text-gray-600 truncate">
                                          {marker.kecamatan}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-green-600 font-bold ml-2 flex-shrink-0">
                                    {distance.toFixed(1)} km
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && searchType !== 'radius' && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-[1001]">
                {searchType === 'name' && searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="text-2xl mt-1">🏭</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.address}
                        </p>
                        {result.kecamatan && (
                          <p className="text-xs text-green-600">
                            Kecamatan: {result.kecamatan}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                
                {searchType === 'category' && (
                  <div className="p-2">
                    {/* If kecamatan selected, show TPS list */}
                    {selectedKecamatan && filteredMarkers.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-2 border-b">
                          <p className="text-xs font-semibold text-gray-700">
                            TPS di {selectedKecamatan}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedKecamatan('')
                              setFilteredMarkers([])
                              setSearchResults([])
                              setSelectedTPSId('')
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Batal
                          </button>
                        </div>
                        <div className="space-y-1 max-h-52 overflow-y-auto">
                          {filteredMarkers.map((tps, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedTPSId(tps.id)
                                if (onTPSSelect && tps.type === 'tps') {
                                  onTPSSelect(tps.id, tps.lat, tps.lng, tps.address || '')
                                }
                                if (mapRef.current) {
                                  mapRef.current.flyTo([tps.lat, tps.lng], 16, { duration: 1 })
                                }
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition text-xs ${
                                tps.id === selectedTPSId
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <span className="text-base">🏭</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {tps.title}
                                  </p>
                                  {tps.address && (
                                    <p className="text-gray-600 text-xs truncate">
                                      {tps.address}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Get unique kecamatan list */
                      Array.from(new Set(markers.map(m => m.kecamatan).filter(Boolean)))
                        .filter(kec => kec && kec.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((kecamatan, index) => {
                          const count = markers.filter(m => m.kecamatan === kecamatan).length
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                handleKecamatanFilter(kecamatan!)
                                setSearchQuery(kecamatan!)
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors rounded-lg flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-green-500"
                                >
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <p className="font-medium text-gray-900 text-sm">
                                  {kecamatan}
                                </p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {count} TPS
                              </span>
                            </button>
                          )
                        })
                    )}
                  </div>
                )}
                
                {searchResults.length === 0 && (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                    Tidak ada hasil ditemukan
                  </div>
                )}
              </div>
            )}

            {/* Legacy geocoding results */}
            {showResults && searchType !== 'name' && searchType !== 'category' && searchType !== 'radius' && searchResults.length > 0 && searchResults[0].display_name && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start space-x-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="text-green-500 mt-1 flex-shrink-0"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {result.name || result.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {result.display_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <button
        type="button"
        onClick={getCurrentLocation}
        className="absolute bottom-24 right-4 z-[1000] bg-white border-2 border-gray-300 rounded-lg px-4 py-2 shadow-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        title="Gunakan lokasi saya"
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
          className="absolute bottom-24 right-44 z-[1000] bg-red-500 text-white rounded-lg px-4 py-2 shadow-md hover:bg-red-600 transition-colors flex items-center space-x-2"
          title="Hapus lokasi yang dipilih"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>Hapus Marker</span>
        </button>
      )}
    </div>
  )
}
