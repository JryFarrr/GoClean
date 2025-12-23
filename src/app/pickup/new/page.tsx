"use client";

import { useState, useEffect } from 'react';
import { FeatureCollection } from 'geojson';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Loader2, MapPin, Calendar, FileText, ArrowLeft, Search, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import MediaUploader from '@/components/MediaUploader';
import WasteItemSelector from '@/components/WasteItemSelector';
import { useLocationStore } from '@/lib/store';
import { SURABAYA_KECAMATAN } from '@/lib/surabayaKecamatan';
import surabayaGeoJson from '../../../../public/KOTA_SURABAYA.json';


interface TPSLocation {
  id: string;
  name: string;
  kecamatan: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours?: string;
  phone?: string;
  isActive: boolean;
  distance?: number;
}

interface WasteItem {
  wasteType: string
  estimatedWeight: number
}


const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <Loader2 className="animate-spin text-green-600" size={32} />
    </div>
  )
})

export default function NewPickupPage() {
  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState<'antar' | 'jemput' | null>(null);

  // Choropleth feature states
  const [kecamatanGeoJson, setKecamatanGeoJson] = useState<FeatureCollection | null>(null);
  const [transaksiPerKecamatan, setTransaksiPerKecamatan] = useState<Record<string, number>>({});
  const [choroplethColors, setChoroplethColors] = useState<Record<string, string>>({});

  // Helper function to convert string to Title Case
  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  useEffect(() => {
    const loadChoroplethData = async () => {
      // 1. Set GeoJSON from direct import
      setKecamatanGeoJson(surabayaGeoJson as FeatureCollection);

      // 2. Fetch stats for choropleth, but don't let it break the map
      try {
          const statsRes = await fetch('/api/pickups/stats/by-kecamatan');
          if (!statsRes.ok) {
            // Don't throw, just log and exit gracefully
            console.warn('Gagal memuat data statistik untuk choropleth');
            toast.error('Gagal memuat statistik warna peta');
            return;
          }

          const statsData = await statsRes.json();
          console.log("Fetched Stats:", statsData);

          // 3. Process stats data
          let transaksiData: Record<string, number> = {};
          if (statsData.pickupByKecamatan) {
            transaksiData = statsData.pickupByKecamatan.reduce((acc: any, item: any) => {
              if (item.kecamatan) { // Ensure kecamatan is not null/undefined
                const kecamatanName = toTitleCase(item.kecamatan);
                acc[kecamatanName] = item._count.kecamatan;
              }
              return acc;
            }, {});
          }
          console.log("Processed Transaksi Data:", transaksiData);

          // 4. Generate colors from the processed data
          const values = Object.values(transaksiData);
          if (values.length === 0) {
            console.log("No transaction data found, using default colors.");
            setTransaksiPerKecamatan({});
            setChoroplethColors({});
            return;
          }

          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const startColor = [187, 247, 208]; // green-200
          const endColor = [22, 101, 52];     // green-900

          const newColors: Record<string, string> = {};
          for (const kecamatan in transaksiData) {
            const value = transaksiData[kecamatan];
            const ratio = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 1;
            
            const r = Math.round(startColor[0] + ratio * (endColor[0] - startColor[0]));
            const g = Math.round(startColor[1] + ratio * (endColor[1] - startColor[1]));
            const b = Math.round(startColor[2] + ratio * (endColor[2] - startColor[2]));
            
            newColors[kecamatan] = `rgb(${r}, ${g}, ${b})`;
          }
          console.log("Generated Colors:", newColors);

          // 5. Set the color states
          setTransaksiPerKecamatan(transaksiData);
          setChoroplethColors(newColors);

      } catch (statsError) {
           console.error('Error loading stats for choropleth:', statsError);
           toast.error('Gagal memuat statistik warna peta');
      }
    };

    if (orderType === 'jemput') {
      loadChoroplethData();
    }
  }, [orderType]);
  
  // GeoJSON route state (for antar)
  const [routeGeoJson, setRouteGeoJson] = useState<any>(undefined)
  // Simpan lokasi awal user (saat pertama kali pilih lokasi)
  const [userInitialLocation, setUserInitialLocation] = useState<[number, number] | null>(null)
  // Trigger agar fitBounds selalu update saat routeGeoJson berubah
  const [fitRouteBoundsKey, setFitRouteBoundsKey] = useState(0)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { latitude, longitude, address, setLocation } = useLocationStore()

  const [files, setFiles] = useState<File[]>([])
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([])
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TPS selection states
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('')
  const [searchKecamatan, setSearchKecamatan] = useState('')
  const [tpsMarkers, setTpsMarkers] = useState<any[]>([])
  const [selectedTPS, setSelectedTPS] = useState<TPSLocation | null>(null)
  const [tpsLocations, setTpsLocations] = useState<TPSLocation[]>([])
  const [isLoadingTPS, setIsLoadingTPS] = useState(true)
  // Simpan 5 TPS terdekat pertama kali lokasi user dipilih
  const [fixedNearestTPS, setFixedNearestTPS] = useState<TPSLocation[] | null>(null)

  // Address search state
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  // Detailed address form states
  const [detailAddress, setDetailAddress] = useState({
    street: '',
    number: '',
    rtRw: '',
    village: '',
    subdistrict: '',
    district: '',
    city: 'Surabaya',
    zipcode: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch TPS locations from database
  useEffect(() => {
    const fetchTPSLocations = async () => {
      setIsLoadingTPS(true)
      try {
        const res = await fetch('/api/tps-locations')
        const data = await res.json()
        
        if (res.ok && data.data) {
          setTpsLocations(data.data)
          
          // Create markers for map
          const markers = data.data.map((tps: TPSLocation) => ({
            id: tps.id,
            lat: tps.latitude,
            lng: tps.longitude,
            title: tps.name,
            address: tps.address,
            type: 'tps' as const,
            kecamatan: tps.kecamatan,
            operatingHours: tps.operatingHours,
            phone: tps.phone
          }))
          setTpsMarkers(markers)
        } else {
          toast.error('Gagal memuat data TPS')
        }
      } catch (error) {
        console.error('Error fetching TPS locations:', error)
        toast.error('Terjadi kesalahan saat memuat data TPS')
      } finally {
        setIsLoadingTPS(false)
      }
    }

    fetchTPSLocations()
  }, [])

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLocation(lat, lng, addr)
    setSelectedTPS(null) // Clear TPS selection when custom location is selected
    // Simpan lokasi awal user hanya jika belum pernah diset
    if (!userInitialLocation) {
      setUserInitialLocation([lat, lng])
      // Hitung dan simpan 5 TPS terdekat saat lokasi user pertama kali dipilih
      if (tpsLocations.length > 0) {
        const nearest = tpsLocations
          .map(tps => ({
            ...tps,
            distance: calculateDistance(lat, lng, tps.latitude, tps.longitude)
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5)
        setFixedNearestTPS(nearest)
      }
    }
  }

  // Fetch route from OpenRouteService Directions API (GeoJSON)
  const fetchRoute = async (from: [number, number], to: [number, number]) => {
    try {
      // Ganti dengan API key OpenRouteService kamu
      const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${from[1]},${from[0]}&end=${to[1]},${to[0]}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal mengambil rute jalan')
      const data = await res.json()
      // Ambil geometry LineString GeoJSON
      const geometry = data.features[0].geometry
      setRouteGeoJson({
        type: 'Feature',
        geometry,
        properties: {}
      })
      setFitRouteBoundsKey(prev => prev + 1) // trigger fitBounds setiap rute baru
    } catch (err) {
      toast.error('Gagal mengambil rute jalan')
      setRouteGeoJson(undefined)
    }
  }

  const handleTPSSelect = (tpsId: string, lat: number, lng: number, addr: string) => {
    const tps = tpsLocations.find(t => t.id === tpsId)
    if (tps) {
      setSelectedTPS(tps)
      setLocation(lat, lng, addr)
      toast.success(`TPS ${tps.name} dipilih`)
      // Always use userInitialLocation for route, not current lat/lng
      if (orderType === 'antar' && userInitialLocation) {
        fetchRoute(userInitialLocation, [tps.latitude, tps.longitude])
      } else {
        setRouteGeoJson(undefined)
      }
    }
  }

  const handleKecamatanSelect = (kecamatan: string) => {
    setSelectedKecamatan(kecamatan)
    const tpsInKecamatan = tpsLocations.filter(tps => tps.kecamatan === kecamatan)
    if (tpsInKecamatan.length > 0) {
      const firstTPS = tpsInKecamatan[0]
      setSelectedTPS(firstTPS)
      setLocation(firstTPS.latitude, firstTPS.longitude, firstTPS.address)
    }
  }

  const handleRemoveLocation = () => {
    setLocation(0, 0, '')
    setSelectedTPS(null)
    setSelectedKecamatan('')
    toast.success('Lokasi dihapus')
  }

  // Generate full address from detail form
  const generateDetailAddress = (): string => {
    const parts: string[] = []
    
    if (detailAddress.street) parts.push(detailAddress.street)
    if (detailAddress.number) parts.push(`No. ${detailAddress.number}`)
    if (detailAddress.rtRw) parts.push(detailAddress.rtRw)
    if (detailAddress.village) parts.push(detailAddress.village)
    if (detailAddress.subdistrict) parts.push(detailAddress.subdistrict)
    if (detailAddress.district) parts.push(`Kec. ${detailAddress.district}`)
    if (detailAddress.city) parts.push(detailAddress.city)
    
    return parts.filter(p => p.length > 0).join(', ')
  }

  // Handle search from detail address form
  const handleDetailAddressSearch = async () => {
    const fullAddress = generateDetailAddress()
    
    if (!fullAddress.trim()) {
      toast.error('Isi minimal jalan dan subdistrict')
      return
    }

    setIsSearchingAddress(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=10`
      )
      
      if (!response.ok) throw new Error('API error')
      
      const results = await response.json()

      if (results && results.length > 0) {
        const result = results[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        const displayName = result.display_name || fullAddress

        setLocation(lat, lng, displayName)
        setSelectedTPS(null)
        toast.success(`✅ Lokasi ditemukan: ${displayName}`)
      } else {
        toast.error('❌ Alamat tidak ditemukan')
        toast.error('Coba klik langsung di peta')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('⚠️ Gagal mencari alamat')
    } finally {
      setIsSearchingAddress(false)
    }
  }

  // Filter kecamatan dari SURABAYA_KECAMATAN yang memiliki TPS
  const kecamatanWithTPS = Array.from(new Set(tpsLocations.map((tps: TPSLocation) => tps.kecamatan)))
  const filteredKecamatan = SURABAYA_KECAMATAN.filter((k: string) => 
    k.toLowerCase().includes(searchKecamatan.toLowerCase()) &&
    kecamatanWithTPS.includes(k)
  )

  // Helper function to get TPS by kecamatan
  const getTpsByKecamatan = (kecamatan: string) => {
    return tpsLocations.filter(tps => tps.kecamatan === kecamatan)
  }

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get nearest TPS from current location
  const getNearestTPS = (): TPSLocation | null => {
    if (!latitude || !longitude) return null
    
    let nearest: TPSLocation | null = null
    let minDistance = Infinity

    tpsLocations.forEach(tps => {
      const distance = calculateDistance(latitude, longitude, tps.latitude, tps.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearest = tps
      }
    })

    return nearest
  }

  const handleSubmit = async () => {
    if (!latitude || !longitude || !address) {
      toast.error('Pilih TPS tujuan terlebih dahulu')
      return
    }

    if (wasteItems.length === 0) {
      toast.error('Pilih minimal satu jenis sampah')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('latitude', latitude.toString())
      formData.append('longitude', longitude.toString())
      formData.append('address', address)
      formData.append('description', description)
      formData.append('wasteItems', JSON.stringify(wasteItems))
      
      // Append TPS ID if user selected a TPS
      if (selectedTPS?.id) {
        formData.append('tpsId', selectedTPS.id)
      }
      
      if (scheduledAt) {
        formData.append('scheduledAt', scheduledAt)
      }

      files.forEach((file) => {
        formData.append('files', file)
      })

      const res = await fetch('/api/pickups', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      toast.success('Permintaan berhasil dikirim!')
      router.push('/pickup/history')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-linear-to-br from-gray-50 via-green-50/30 to-blue-50/20 min-h-screen">
      {/* Modern Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Dashboard
        </Link>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Antar/Jemput Sampah
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Pilih untuk mengantarkan sampah ke TPS atau minta penjemputan
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 0, label: 'Antar/Jemput' },
          { num: 1, label: 'Pilih TPS/Lokasi' },
          { num: 2, label: 'Foto/Video' },
          { num: 3, label: 'Jenis Sampah' },
          { num: 4, label: 'Konfirmasi' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {s.num + 1}
            </div>
            <span className={`ml-2 hidden sm:block ${step >= s.num ? 'text-green-600 font-medium' : 'text-green-600'}`}>
              {s.label}
            </span>
            {i < 4 && (
              <div className={`w-12 md:w-24 h-1 mx-2 ${step > s.num ? 'bg-green-600' : 'bg-green-100'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Step 0: Antar/Jemput Selection */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pilih Jenis Layanan</h2>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl">
              <button
                onClick={() => { setOrderType('antar'); setStep(1); }}
                className={`flex-1 px-8 py-6 rounded-2xl border-2 transition font-semibold text-lg shadow-sm flex flex-col items-center gap-2
                  ${orderType === 'antar' ? 'bg-green-600 text-white border-green-700 scale-105' : 'bg-white text-green-700 border-green-300 hover:border-green-500 hover:bg-green-50'}`}
              >
                🚗 Antar ke TPS
                <span className="text-sm font-normal mt-2">Saya akan mengantarkan sampah ke TPS</span>
              </button>
              <button
                onClick={() => { setOrderType('jemput'); setStep(1); }}
                className={`flex-1 px-8 py-6 rounded-2xl border-2 transition font-semibold text-lg shadow-sm flex flex-col items-center gap-2
                  ${orderType === 'jemput' ? 'bg-blue-600 text-white border-blue-700 scale-105' : 'bg-white text-blue-700 border-blue-300 hover:border-blue-500 hover:bg-blue-50'}`}
              >
                🏠 Jemput ke Rumah
                <span className="text-sm font-normal mt-2">Petugas akan menjemput sampah ke lokasi saya</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {orderType === 'antar' ? 'Pilih Lokasi Anda & TPS Tujuan' : 'Tentukan Lokasi Penjemputan'}
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              {orderType === 'antar'
                ? 'Tentukan lokasi Anda saat ini, lalu pilih TPS tujuan dari 5 TPS terdekat.'
                : 'Tentukan lokasi penjemputan sampah Anda, atau pilih lokasi di peta.'}
            </p>

            {/* Detail Address Form */}
            <div className="bg-linear-to-r from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 mb-6">
              <label className="block text-sm font-semibold text-purple-900 mb-4">
                📝 Form Pengisian Detail Alamat (Patokan)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Street */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Jalan/Area *</label>
                  <input
                    type="text"
                    value={detailAddress.street}
                    onChange={(e) => setDetailAddress({...detailAddress, street: e.target.value})}
                    placeholder="Contoh: Jl. Ahmad Yani"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Number */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Nomor</label>
                  <input
                    type="text"
                    value={detailAddress.number}
                    onChange={(e) => setDetailAddress({...detailAddress, number: e.target.value})}
                    placeholder="Contoh: 123"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* RT/RW */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">RT/RW</label>
                  <input
                    type="text"
                    value={detailAddress.rtRw}
                    onChange={(e) => setDetailAddress({...detailAddress, rtRw: e.target.value})}
                    placeholder="Contoh: RT 05 / RW 12"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Village/Kampung */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Kelurahan/Desa</label>
                  <input
                    type="text"
                    value={detailAddress.village}
                    onChange={(e) => setDetailAddress({...detailAddress, village: e.target.value})}
                    placeholder="Contoh: Keputih"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Subdistrict */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Kelurahan (Sub-district) *</label>
                  <input
                    type="text"
                    value={detailAddress.subdistrict}
                    onChange={(e) => setDetailAddress({...detailAddress, subdistrict: e.target.value})}
                    placeholder="Contoh: Sukolilo"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={detailAddress.district}
                    onChange={(e) => setDetailAddress({...detailAddress, district: e.target.value})}
                    placeholder="Contoh: Sukolilo"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Zipcode */}
                <div>
                  <label className="block text-xs font-medium text-purple-800 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={detailAddress.zipcode}
                    onChange={(e) => setDetailAddress({...detailAddress, zipcode: e.target.value})}
                    placeholder="Contoh: 60111"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Preview */}
              {generateDetailAddress() && (
                <div className="bg-white rounded p-3 mb-4 border border-purple-200">
                  <p className="text-xs font-medium text-purple-800 mb-1">📍 Preview Alamat Gabungan:</p>
                  <p className="text-sm text-purple-900">{generateDetailAddress()}</p>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleDetailAddressSearch}
                disabled={isSearchingAddress || !detailAddress.street.trim()}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                {isSearchingAddress ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mencari Lokasi...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Cari Lokasi dari Form
                  </>
                )}
              </button>
            </div>

            
            {/* Layout Grid: Map + Sidebar */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Map Section - 2/3 width */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MapComponent
                    selectable
                    onLocationSelect={handleLocationSelect}
                    onTPSSelect={handleTPSSelect}
                    onMarkerRemove={handleRemoveLocation}
                    markers={tpsMarkers}
                    showTPSMarkers
                    showRemoveButton={!!latitude && !!longitude}
                    currentLat={latitude}
                    currentLng={longitude}
                    selectedTPSId={selectedTPS?.id || ''}
                    className="h-[500px] w-full"
                    routeGeoJson={orderType === 'antar' && routeGeoJson ? routeGeoJson : undefined}
                    fitRouteBoundsKey={fitRouteBoundsKey}
                    
                    // Choropleth props
                    choroplethGeoJson={orderType === 'jemput' ? kecamatanGeoJson : undefined}
                    choroplethColors={orderType === 'jemput' ? choroplethColors : undefined}
                    choroplethTransaksi={orderType === 'jemput' ? transaksiPerKecamatan : undefined}
                  />
                  {/* Choropleth Legend */}
                  {orderType === 'jemput' && kecamatanGeoJson && Object.keys(transaksiPerKecamatan).length > 0 && (
                    <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-lg border border-green-200 p-4 z-50 w-56">
                      <div className="font-bold text-green-800 mb-2 text-sm">Legenda Warna Transaksi TPS</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-600">Sedikit</span>
                        <div className="flex-1 h-4 rounded bg-linear-to-r from-[#bbf7d0] to-[#166534]" />
                        <span className="text-xs text-gray-600">Banyak</span>
                      </div>
                      <div className="flex justify-between text-xs text-green-700">
                        <span>Min: {Math.min(...Object.values(transaksiPerKecamatan))}</span>
                        <span>Max: {Math.max(...Object.values(transaksiPerKecamatan))}</span>
                      </div>
                    </div>
                  )}
                </div>

                {address && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 relative">
                    <button
                      onClick={handleRemoveLocation}
                      className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition"
                      title="Hapus lokasi"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                    <p className="font-bold text-gray-800 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      Lokasi Dipilih
                    </p>
                    <p className="text-gray-700 pr-8 mb-2">{address}</p>
                    {selectedTPS && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <p className="font-medium text-green-800">TPS: {selectedTPS.name}</p>
                        <p className="text-sm text-green-600">Kecamatan: {selectedTPS.kecamatan}</p>
                        {selectedTPS.operatingHours && (
                          <p className="text-sm text-green-600">Jam Operasional: {selectedTPS.operatingHours}</p>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                      Koordinat: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar - 1/3 width */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg border border-gray-300 p-4 h-[500px] overflow-y-auto">
                  {/* Show 5 nearest TPS for 'antar' */}
                  {orderType === 'antar' && latitude && longitude && tpsLocations.length > 0 ? (
                    <>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">5 TPS Terdekat</h3>
                      <div className="space-y-2">
                        {(fixedNearestTPS || [])
                          .map((tps, idx) => {
                            const isTPSSelected = selectedTPS?.id === tps.id
                            return (
                              <button
                                key={tps.id}
                                onClick={() => handleTPSSelect(tps.id, tps.latitude, tps.longitude, tps.address)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition text-sm border flex flex-col gap-1 ${
                                  isTPSSelected
                                    ? 'bg-green-100 border-green-500'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-800">{tps.name}</span>
                                  <span className="text-xs text-green-600">{typeof tps.distance === 'number' ? tps.distance.toFixed(2) : '-'} km</span>
                                </div>
                                <span className="text-xs text-gray-600">{tps.address}</span>
                                {tps.operatingHours && (
                                  <span className="text-xs text-green-600">⏰ {tps.operatingHours}</span>
                                )}
                              </button>
                            )
                          })}
                      </div>
                    </>
                  ) : (
                    // ...existing code for jemput or no location
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <MapPin size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            Daftar Kecamatan
                          </h3>
                          <p className="text-xs text-gray-500">
                            Jangkauan Sambangan Sampah
                          </p>
                        </div>
                      </div>
                      {/* Loading State */}
                      {isLoadingTPS ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="animate-spin text-green-600" size={32} />
                        </div>
                      ) : (
                        <>
                          {/* Search Box */}
                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              placeholder="Cari kecamatan..."
                              value={searchKecamatan}
                              onChange={(e) => setSearchKecamatan(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            />
                          </div>
                          {/* Kecamatan List */}
                          <div className="space-y-2">
                            {filteredKecamatan.map((kec) => {
                              const tpsCount = getTpsByKecamatan(kec).length
                              const isSelected = selectedKecamatan === kec
                              const tpsList = getTpsByKecamatan(kec)
                              return (
                                <div key={kec}>
                                  <button
                                    onClick={() => handleKecamatanSelect(kec)}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                                      isSelected
                                        ? 'bg-green-500 text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    <div className="flex-1">
                                      <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {kec}
                                      </p>
                                      <p className={`text-xs ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>
                                        {tpsCount} TPS tersedia
                                      </p>
                                    </div>
                                    <ChevronRight 
                                      size={16} 
                                      className={`transition-transform ${isSelected ? 'text-white rotate-90' : 'text-gray-400'}`} 
                                    />
                                  </button>
                                  {/* TPS List - shown when kecamatan selected */}
                                  {isSelected && (
                                    <div className="ml-4 mt-2 space-y-1">
                                      {tpsList.map((tps) => {
                                        const isTPSSelected = selectedTPS?.id === tps.id
                                        return (
                                          <button
                                            key={tps.id}
                                            onClick={() => handleTPSSelect(tps.id, tps.latitude, tps.longitude, tps.address)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                                              isTPSSelected
                                                ? 'bg-green-100 border-2 border-green-500'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                          >
                                            <p className={`font-medium ${isTPSSelected ? 'text-green-800' : 'text-gray-800'}`}>
                                              {tps.name}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                              {tps.address}
                                            </p>
                                            {tps.operatingHours && (
                                              <p className="text-xs text-green-600 mt-0.5">
                                                ⏰ {tps.operatingHours}
                                              </p>
                                            )}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          {filteredKecamatan.length === 0 && !isLoadingTPS && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {searchKecamatan ? 'Kecamatan tidak ditemukan' : 'Belum ada TPS terdaftar'}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!latitude || !longitude}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {/* Step 2: Photos/Videos */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="text-green-600" size={28} />
              <h2 className="text-2xl font-bold">Upload Foto/Video Sampah</h2>
            </div>
            <p className="text-green-700">
              Ambil foto atau video sampah Anda untuk membantu pihak TPS mengetahui jenis dan jumlah sampah yang akan diantarkan.
            </p>

            <MediaUploader
              onFilesChange={setFiles}
              maxFiles={5}
              acceptImages
              acceptVideos
            />

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Waste Types */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">♻️</span>
              <h2 className="text-2xl font-bold">Pilih Jenis Sampah</h2>
            </div>
            <p className="text-green-700">
              Pilih jenis sampah dan perkiraan berat yang akan Anda antarkan ke TPS.
            </p>

            <WasteItemSelector
              items={wasteItems}
              onChange={setWasteItems}
            />

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                Deskripsi Tambahan (Opsional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Sampah dalam kantong hitam, letakkan di depan rumah..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">
                <Calendar size={18} className="inline mr-2" />
                Jadwal Pengantaran (Opsional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={wasteItems.length === 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-green-800">Konfirmasi Permintaan</h2>
            <p className="text-green-700">
              Periksa kembali data permintaan Anda sebelum mengirim.
            </p>

            <div className="space-y-4">
              {/* Location Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold flex items-center text-green-800">
                  <MapPin size={18} className="mr-2 text-green-600" />
                  {orderType === 'antar'
                    ? 'TPS Tujuan'
                    : '📍 Lokasi Penjemputan User'}
                </h3>
                <p className="text-green-700 mt-1">{address}</p>
              </div>

              {/* Nearest TPS Recommendation - Show when user selects custom location (not TPS) */}
              {!selectedTPS && getNearestTPS() && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold flex items-center text-blue-800 mb-2">
                    <MapPin size={18} className="mr-2 text-blue-600" />
                    🎯 Rekomendasi TPS Terdekat
                  </h3>
                  {(() => {
                    const nearestTPS = getNearestTPS()
                    const distance = calculateDistance(latitude ?? 0, longitude ?? 0, nearestTPS!.latitude, nearestTPS!.longitude)
                    return (
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-blue-900">{nearestTPS?.name}</p>
                          <p className="text-sm text-blue-700 mt-1">{nearestTPS?.address}</p>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-sm text-blue-700">
                            <strong>Jarak:</strong> {distance.toFixed(2)} km
                          </p>
                          {nearestTPS?.operatingHours && (
                            <p className="text-sm text-blue-700">
                              <strong>Jam Operasional:</strong> {nearestTPS.operatingHours}
                            </p>
                          )}
                          {nearestTPS?.phone && (
                            <p className="text-sm text-blue-700">
                              <strong>Kontak:</strong> {nearestTPS.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Media Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold flex items-center text-green-800">
                  <FileText size={18} className="mr-2 text-green-600" />
                  Media
                </h3>
                <p className="text-green-700 mt-1">
                  {files.length} file (
                  {files.filter((f) => f.type.startsWith('image/')).length} foto,{' '}
                  {files.filter((f) => f.type.startsWith('video/')).length} video)
                </p>
              </div>

              {/* Waste Items Summary */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-green-800">♻️ Jenis Sampah</h3>
                <div className="space-y-2">
                  {wasteItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-green-700">
                      <span>{item.wasteType}</span>
                      <span>{item.estimatedWeight} kg</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {wasteItems.reduce((sum, item) => sum + item.estimatedWeight, 0)} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              {scheduledAt && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center text-green-800">
                    <Calendar size={18} className="mr-2 text-green-600" />
                    Jadwal Pengantaran
                  </h3>
                  <p className="text-green-700 mt-1">
                    {new Date(scheduledAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800">Catatan</h3>
                  <p className="text-green-700 mt-1">{description}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-100 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-200 transition"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Permintaan</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}